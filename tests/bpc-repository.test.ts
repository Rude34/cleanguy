import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { createBpcRepository } from "../lib/bpc-repository";
import { jsonRows, type BpcDatabase, type Query } from "../lib/bpc-database";
import { hashPassword, verifyPassword } from "../lib/bpc-store";
import type { BpcProfile } from "../lib/bpc-types";
import { importBpcData } from "../scripts/bpc-import-data.mjs";

const profile = (role: BpcProfile["role"], username: string): BpcProfile => ({ id: randomUUID(), username, display_name: username, role, is_active: true, password_hash: "salt:hash", created_at: new Date().toISOString() });

async function fixture() {
  const pg = new PGlite();
  const schema = await readFile(new URL("../db/bpc-schema.sql", import.meta.url), "utf8");
  await pg.exec(schema);
  await pg.exec(schema); // Setup must be safe to rerun.
  const query: Query = async <T>(text: string, values: unknown[] = []) => jsonRows<T>((await pg.query(text, values)).rows);
  const database: BpcDatabase = {
    query,
    transaction: (work) => pg.transaction(async (tx) => work(async <T>(text: string, values: unknown[] = []) => jsonRows<T>((await tx.query(text, values)).rows))),
  };
  return { pg, database, repo: createBpcRepository(database) };
}

test("BPC PostgreSQL: accounts, idempotency, transactions, shifts and authorization", async (t) => {
  const { pg, database, repo } = await fixture();
  try {
    const admin = profile("admin", "admin");
    const operator = profile("operator", "operator");
    await t.test("initial setup is one-time and creates an active shift", async () => {
      assert.equal(await repo.needsSetup(), true);
      await repo.createInitialAdmin(admin);
      assert.equal(await repo.needsSetup(), false);
      await assert.rejects(repo.createInitialAdmin(profile("admin", "second_admin")), /zaten/);
      await repo.createOperator(admin.id, operator);
      assert.equal((await repo.findProfile("username", "operator"))?.id, operator.id);
      await assert.rejects(repo.createOperator(admin.id, profile("operator", "operator")), /kullanılıyor/);
    });
    let recordId: string;
    let oldShift: string;
    await t.test("repeated concurrent submissions create one record and one audit event", async () => {
      const key = randomUUID();
      const results = await Promise.all([repo.createRecord(operator.id, 7, "Kat0 (XL)", 9, key), repo.createRecord(operator.id, 7, "Kat0 (XL)", 9, key)]);
      assert.deepEqual(results.map((result) => result.duplicate).sort(), [false, true]);
      assert.equal(results[0].record.id, results[1].record.id);
      recordId = results[0].record.id;
      oldShift = results[0].record.shift_id;
      await assert.rejects(repo.createRecord(operator.id, 8, "Kat0 (XL)", 9, key), /farklı/);
      const [audit] = await database.query<{ count: number }>("SELECT count(*)::int AS count FROM bpc_audit WHERE action = 'bpc.created'");
      assert.equal(audit.count, 1);
      await assert.rejects(database.query("INSERT INTO bpc_records SELECT 'duplicate', shift_id, idempotency_key, table_number, bpc_category, quantity, operator_id, status, created_at, cancelled_at, cancelled_by, cancellation_reason FROM bpc_records WHERE id = $1", [recordId]), /unique/i);
    });
    await t.test("audit failure rolls the record insertion back", async () => {
      const broken = createBpcRepository({ ...database, transaction: (work) => database.transaction((query) => work(async <T>(text: string, values: unknown[] = []) => {
        if (text.startsWith("INSERT INTO bpc_audit")) throw new Error("simulated audit failure");
        return query<T>(text, values);
      })) });
      await assert.rejects(broken.createRecord(operator.id, 8, "Kat0 (XL)", 1, randomUUID()), /simulated/);
      assert.equal((await repo.dashboard(true)).records.length, 1);
    });
    await t.test("operators cannot manage shifts, cancel records or manage accounts", async () => {
      await assert.rejects(repo.endShift(operator.id), /yetkisi/);
      await assert.rejects(repo.cancelRecord(operator.id, recordId!, "test reason"), /yetkisi/);
      await assert.rejects(repo.resetPassword(operator.id, operator.id, "other"), /yetkisi/);
    });
    await t.test("queue uniqueness, completion and capacity are enforced", async () => {
      const entry = await repo.addQueueTable(operator.id, 7);
      await assert.rejects(repo.addQueueTable(admin.id, 7), /zaten/);
      await repo.completeQueueTable(admin.id, entry.id);
      await assert.rejects(repo.completeQueueTable(admin.id, entry.id), /bulunamadı/);
      for (let table = 7; table < 41; table++) await repo.addQueueTable(operator.id, table);
      await assert.rejects(repo.addQueueTable(operator.id, 41), /Sıra dolu/);
    });
    await t.test("closing a shift preserves its records and staff", async () => {
      await repo.assignStaff(admin.id, 7, "Çalışan");
      const next = await repo.endShift(admin.id);
      assert.notEqual(next.id, oldShift!);
      const fresh = await repo.createRecord(operator.id, 8, "Kat0 (Normal)", 2, randomUUID());
      assert.equal(fresh.record.shift_id, next.id);
      const data = await repo.dashboard(true);
      assert.equal(data.shifts.find((shift) => shift.id === oldShift!)?.table_staff["7"], "Çalışan");
      assert.equal(data.records.find((record) => record.id === recordId!)?.shift_id, oldShift!);
      assert.deepEqual(data.shifts.find((shift) => shift.id === next.id)?.table_staff, {});
    });
    await t.test("cancellation is one-time and dashboard never includes password hashes", async () => {
      await repo.cancelRecord(admin.id, recordId!, "Yanlış kayıt");
      await assert.rejects(repo.cancelRecord(admin.id, recordId!, "Tekrar"), /bulunamadı/);
      const data = await repo.dashboard(false);
      assert.deepEqual(data.profiles, []);
      assert.deepEqual(data.audit, []);
      assert.equal(data.records.find((record) => record.id === recordId!)?.status, "cancelled");
      assert.equal(JSON.stringify(await repo.dashboard(true)).includes("password_hash"), false);
    });
    await t.test("disabled operators cannot authenticate or write", async () => {
      await repo.setOperatorActive(admin.id, operator.id, false);
      assert.equal(await repo.findProfile("id", operator.id), null);
      await assert.rejects(repo.createRecord(operator.id, 7, "Kat0 (XL)", 1, randomUUID()), /Oturum/);
      await repo.setOperatorActive(admin.id, operator.id, true);
      await repo.resetPassword(admin.id, operator.id, "new-hash");
      const updated = await repo.findProfile("id", operator.id);
      assert.equal(updated?.password_hash, "new-hash");
      assert.ok(updated?.password_changed_at);
    });
  } finally { await pg.close(); }
});

test("Blob JSON import preserves legacy IDs/passwords and refuses overwrites", async () => {
  const { pg, database, repo } = await fixture();
  try {
    const admin = { ...profile("admin", "admin"), password_hash: await hashPassword("ExistingPassword123") };
    const shiftId = "0123456789abcdef0123456789abcdef";
    const backup = { profiles: [admin], records: [{ id: randomUUID(), table_number: 7, bpc_category: "Kat0 (XL)", quantity: null, operator_id: admin.id, status: "delivered", created_at: admin.created_at, cancelled_at: null, cancelled_by: null, cancellation_reason: null }], shifts: [{ id: shiftId, started_at: admin.created_at, ended_at: null, started_by: null, ended_by: null, table_staff: { "7": "Personel" } }], active_shift_id: shiftId };
    await database.transaction((query) => importBpcData(query, backup));
    const imported = await repo.findProfile("username", "admin");
    assert.ok(imported && await verifyPassword("ExistingPassword123", imported.password_hash));
    const data = await repo.dashboard(true);
    assert.equal(data.active_shift_id, shiftId);
    assert.equal(data.records[0].shift_id, shiftId);
    assert.equal(data.records[0].quantity, null);
    assert.equal(data.shifts[0].table_staff["7"], "Personel");
    await assert.rejects(database.transaction((query) => importBpcData(query, backup)), /boş olmalı/);
    assert.equal((await repo.dashboard(true)).records.length, 1);
  } finally { await pg.close(); }
});

test("an invalid import rolls back all tables", async () => {
  const { pg, database, repo } = await fixture();
  try {
    const admin = profile("admin", "admin");
    await assert.rejects(database.transaction((query) => importBpcData(query, { profiles: [admin], records: [{ id: randomUUID(), operator_id: "missing-account", table_number: 7, bpc_category: "Kat0 (XL)", status: "delivered", created_at: admin.created_at }] })));
    assert.equal(await repo.needsSetup(), true);
    assert.equal((await repo.dashboard(true)).shifts.length, 0);
  } finally { await pg.close(); }
});

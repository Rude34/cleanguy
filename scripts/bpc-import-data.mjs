import { randomUUID } from "node:crypto";

export class BpcImportError extends Error {}

// Caller owns the transaction. Refuse to merge into an already-used database.
export async function importBpcData(query, input) {
  if (!input || typeof input !== "object" || !Array.isArray(input.profiles) || !Array.isArray(input.records)) throw new BpcImportError("Geçerli BPC JSON yedeği gerekli.");
  const [state] = await query("SELECT active_shift_id FROM bpc_state WHERE singleton = true FOR UPDATE");
  if (!state) throw new BpcImportError("Önce npm run db:setup çalıştırın.");
  for (const table of ["bpc_profiles", "bpc_shifts", "bpc_records", "bpc_audit", "bpc_waiting_tables"]) {
    if ((await query(`SELECT 1 FROM ${table} LIMIT 1`)).length) throw new BpcImportError("Hedef veritabanı boş olmalı. Mevcut verilerin üzerine yazılmadı; ayrı, boş bir Neon branch kullanın.");
  }
  const data = structuredClone(input);
  data.shifts ??= [];
  data.audit ??= [];
  data.waiting_tables ??= [];
  if (![data.shifts, data.audit, data.waiting_tables].every(Array.isArray)) throw new BpcImportError("Yedek içindeki listeler geçersiz.");
  let active = data.shifts.find((shift) => shift.id === data.active_shift_id && !shift.ended_at);
  if (!active) active = data.shifts.find((shift) => !shift.ended_at);
  if (!active) {
    active = { id: randomUUID(), started_at: data.records.reduce((time, record) => record.created_at < time ? record.created_at : time, new Date().toISOString()), ended_at: null, started_by: null, ended_by: null, table_staff: {} };
    data.shifts.push(active);
  }
  for (const record of data.records) record.shift_id ??= active.id;

  await query(`INSERT INTO bpc_profiles (id,username,display_name,role,is_active,password_hash,password_changed_at,created_at)
    SELECT id,username,display_name,role,is_active,password_hash,password_changed_at,created_at
    FROM jsonb_to_recordset($1::jsonb) AS p(id text, username text, display_name text, role text, is_active boolean, password_hash text, password_changed_at timestamptz, created_at timestamptz)`, [JSON.stringify(data.profiles)]);
  await query(`INSERT INTO bpc_shifts (id,started_at,ended_at,started_by,ended_by)
    SELECT id,started_at,ended_at,started_by,ended_by FROM jsonb_to_recordset($1::jsonb)
    AS s(id text, started_at timestamptz, ended_at timestamptz, started_by text, ended_by text)`, [JSON.stringify(data.shifts)]);
  const staff = data.shifts.flatMap((shift) => Object.entries(shift.table_staff ?? {}).filter(([, name]) => name).map(([table, name]) => ({ shift_id: shift.id, table_number: Number(table), staff_name: name })));
  await query(`INSERT INTO bpc_table_staff SELECT shift_id,table_number,staff_name FROM jsonb_to_recordset($1::jsonb)
    AS t(shift_id text, table_number smallint, staff_name text)`, [JSON.stringify(staff)]);
  await query(`INSERT INTO bpc_records (id,shift_id,idempotency_key,table_number,bpc_category,quantity,operator_id,status,created_at,cancelled_at,cancelled_by,cancellation_reason)
    SELECT id,shift_id,idempotency_key,table_number,bpc_category,quantity,operator_id,status,created_at,cancelled_at,cancelled_by,cancellation_reason
    FROM jsonb_to_recordset($1::jsonb) AS r(id text, shift_id text, idempotency_key text, table_number smallint, bpc_category text, quantity integer,
      operator_id text, status text, created_at timestamptz, cancelled_at timestamptz, cancelled_by text, cancellation_reason text)`, [JSON.stringify(data.records)]);
  await query(`INSERT INTO bpc_audit (id,actor_id,action,record_id,created_at,detail)
    SELECT id,actor_id,action,record_id,created_at,detail FROM jsonb_to_recordset($1::jsonb)
    AS a(id text, actor_id text, action text, record_id text, created_at timestamptz, detail text)`, [JSON.stringify(data.audit)]);
  await query(`INSERT INTO bpc_waiting_tables (id,table_number,added_by,added_at)
    SELECT id,table_number,added_by,added_at FROM jsonb_to_recordset($1::jsonb)
    AS w(id text, table_number smallint, added_by text, added_at timestamptz)`, [JSON.stringify(data.waiting_tables)]);
  await query("UPDATE bpc_state SET active_shift_id = $1 WHERE singleton = true", [active.id]);
}

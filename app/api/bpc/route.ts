import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { allowedCategories, allowedTables, clearSessionCookie, createSession, getStore, hashPassword, isSetupAllowed, safeProfile, sessionCookie, sessionProfile, updateStore, verifyPassword } from "../../../lib/bpc-store";
import type { BpcRecord, BpcShift } from "../../../lib/bpc-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const responseError = (message: string, status = 400) => NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action");
  let profile;
  try {
    profile = await sessionProfile(request);
    if (action === "session") {
      const store = await getStore();
      const needsSetup = !store.profiles.some((person) => person.role === "admin");
      return NextResponse.json({ profile: profile ? safeProfile(profile) : null, needsSetup }, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (error) { return responseError(error instanceof Error ? error.message : "Sunucu depolama ayarı gerekli.", 503); }
  if (!profile) return responseError("Oturum açmanız gerekiyor.", 401);
  const store = await getStore();
  const profiles = store.profiles.filter((person) => person.is_active || profile.role === "admin").map(safeProfile);
  const displayById = new Map(profiles.map((person) => [person.id, person]));
  const records = store.records.sort((a, b) => b.created_at.localeCompare(a.created_at)).map((record) => ({ ...record, profiles: displayById.get(record.operator_id) ?? null }));
  const audit = profile.role === "admin" ? store.audit.slice().reverse().slice(0, 300).map((item) => ({ ...item, profiles: displayById.get(item.actor_id) ?? null })) : [];
  const queue = store.waiting_tables.map((entry) => ({ ...entry, profile: displayById.get(entry.added_by) ?? null }));
  return NextResponse.json({ profile: safeProfile(profile), records, profiles: profile.role === "admin" ? profiles : [], audit, shifts: store.shifts, active_shift_id: store.active_shift_id, waiting_tables: queue }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const action = new URL(request.url).searchParams.get("action");
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return responseError("İstek verisi okunamadı."); }

  if (action === "login") {
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const store = await getStore();
    const profile = store.profiles.find((person) => person.username === username && person.is_active);
    if (!profile || !(await verifyPassword(password, profile.password_hash))) return responseError("Kullanıcı adı veya şifre hatalı.", 401);
    const response = NextResponse.json({ profile: safeProfile(profile) }, { headers: { "Cache-Control": "no-store" } });
    response.headers.set("Set-Cookie", sessionCookie(createSession(profile)));
    return response;
  }

  if (action === "setup") {
    if (!isSetupAllowed(body.setup_key)) return responseError("İlk yönetici kurulumu için geçerli sunucu kurulum anahtarı gerekli.", 403);
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[a-z0-9._-]{3,32}$/.test(username) || displayName.length < 1 || displayName.length > 80 || password.length < 12 || password.length > 128) return responseError("Kullanıcı adı, görünen ad veya şifre kurallara uymuyor.");
    try {
      const created = await updateStore(async (store) => {
        if (store.profiles.some((person) => person.role === "admin")) throw new Error("Yönetici hesabı zaten oluşturulmuş.");
        const admin = { id: randomUUID(), username, display_name: displayName, role: "admin" as const, is_active: true, password_hash: await hashPassword(password), created_at: new Date().toISOString() };
        store.profiles.push(admin);
        store.audit.push({ id: randomUUID(), actor_id: admin.id, action: "admin.initialized", record_id: null, created_at: admin.created_at, detail: "İlk yönetici hesabı oluşturuldu." });
        return admin;
      });
      const response = NextResponse.json({ profile: safeProfile(created) }, { status: 201, headers: { "Cache-Control": "no-store" } });
      response.headers.set("Set-Cookie", sessionCookie(createSession(created)));
      return response;
    } catch (error) { return responseError(error instanceof Error ? error.message : "İlk yönetici oluşturulamadı.", 409); }
  }

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
  }

  const profile = await sessionProfile(request);
  if (!profile) return responseError("Oturum açmanız gerekiyor.", 401);

  if (action === "record") {
    const tableNumber = Number(body.table_number);
    const category = body.bpc_category;
    const quantity = body.quantity === null || body.quantity === undefined || body.quantity === "" ? null : Number(body.quantity);
    const idempotencyKey = typeof body.idempotency_key === "string" ? body.idempotency_key : "";
    if (!allowedTables.includes(tableNumber) || typeof category !== "string" || !allowedCategories.includes(category)) return responseError("Masa veya BPC kategorisi geçersiz.");
    if (quantity === null || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return responseError("Adet zorunludur; 1 ile 100000 arasında tam sayı girin.");
    if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) return responseError("Kayıt anahtarı geçersiz. Lütfen tekrar deneyin.");
    try {
      const result = await updateStore((store) => {
        const previous = store.records.find((record) => record.operator_id === profile.id && record.idempotency_key === idempotencyKey);
        if (previous) {
          if (previous.table_number !== tableNumber || previous.bpc_category !== category || previous.quantity !== quantity) {
            const conflict = new Error("Bu istek anahtarı farklı bir BPC kaydı için kullanılmış.");
            conflict.name = "IdempotencyConflictError";
            throw conflict;
          }
          return { record: previous, duplicate: true };
        }
        const activeShift = store.shifts.find((shift) => shift.id === store.active_shift_id && !shift.ended_at);
        if (!activeShift) throw new Error("Aktif vardiya bulunamadı.");
        const created: BpcRecord = { id: randomUUID(), shift_id: activeShift.id, idempotency_key: idempotencyKey, table_number: tableNumber, bpc_category: category, quantity, operator_id: profile.id, status: "delivered", created_at: new Date().toISOString(), cancelled_at: null, cancelled_by: null, cancellation_reason: null };
        store.records.push(created);
        store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "bpc.created", record_id: created.id, created_at: created.created_at, detail: `Masa ${tableNumber} · ${category}${quantity === null ? "" : ` · ${quantity} adet`}` });
        return { record: created, duplicate: false };
      }, "bpc.create");
      return NextResponse.json(result, { status: result.duplicate ? 200 : 201, headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      const message = error instanceof Error ? error.message : "Kayıt oluşturulamadı.";
      if (name === "IdempotencyConflictError") return responseError(message, 409);
      if (error instanceof Error && /Kayıt yoğunluk/.test(error.message)) return responseError(error.message, 503);
      console.error("[bpc-api] record creation failed", { operation: "bpc.create", operatorId: profile.id, tableNumber, category, errorName: name || "UnknownError" });
      return responseError("BPC kaydı kaydedilemedi. Lütfen tekrar deneyin. Aynı gönderimi tekrar denerseniz kayıt mükerrer oluşturulmaz.", 500);
    }
  }

  if (action === "queue-add") {
    const tableNumber = Number(body.table_number);
    if (!allowedTables.includes(tableNumber)) return responseError("Masa numarası geçersiz.");
    try {
      const entry = await updateStore((store) => {
        if (store.waiting_tables.length >= 34) throw new Error("Sıra dolu; en fazla 34 masa eklenebilir.");
        if (store.waiting_tables.some((item) => item.table_number === tableNumber)) throw new Error(`Masa ${tableNumber} zaten sırada.`);
        const added = { id: randomUUID(), table_number: tableNumber, added_by: profile.id, added_at: new Date().toISOString() };
        store.waiting_tables.push(added);
        store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "queue.table-added", record_id: null, created_at: added.added_at, detail: `Masa ${tableNumber} sıraya eklendi (${store.waiting_tables.length}. sıra).` });
        return added;
      });
      return NextResponse.json({ entry }, { status: 201 });
    } catch (error) { return responseError(error instanceof Error ? error.message : "Masa sıraya eklenemedi.", 409); }
  }

  if (action === "queue-complete") {
    const entryId = typeof body.entry_id === "string" ? body.entry_id : "";
    try {
      const removed = await updateStore((store) => {
        const index = store.waiting_tables.findIndex((item) => item.id === entryId);
        if (index < 0) throw new Error("Bekleyen masa bulunamadı.");
        const [entry] = store.waiting_tables.splice(index, 1);
        store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "queue.table-completed", record_id: null, created_at: new Date().toISOString(), detail: `Masa ${entry.table_number} sıradan tamamlandı.` });
        return entry;
      });
      return NextResponse.json({ completed: removed });
    } catch (error) { return responseError(error instanceof Error ? error.message : "Masa sıradan kaldırılamadı.", 404); }
  }

  if (action === "shift") {
    if (profile.role !== "admin") return responseError("Vardiya yönetimi yalnızca yöneticiye açıktır.", 403);
    if (body.operation === "end") {
      try {
        const nextShift = await updateStore((store) => {
          const current = store.shifts.find((shift) => shift.id === store.active_shift_id && !shift.ended_at);
          if (!current) throw new Error("Kapatılacak aktif vardiya bulunamadı.");
          const endedAt = new Date().toISOString();
          current.ended_at = endedAt;
          current.ended_by = profile.id;
          const created: BpcShift = { id: randomUUID(), started_at: endedAt, ended_at: null, started_by: profile.id, ended_by: null, table_staff: {} };
          store.shifts.push(created);
          store.active_shift_id = created.id;
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "shift.ended", record_id: null, created_at: endedAt, detail: `Vardiya kapatıldı. ${store.records.filter((record) => record.shift_id === current.id).length} kayıt arşivlendi.` });
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "shift.started", record_id: null, created_at: endedAt, detail: "Yeni vardiya başlatıldı." });
          return created;
        });
        return NextResponse.json({ active_shift_id: nextShift.id, shift: nextShift });
      } catch (error) { return responseError(error instanceof Error ? error.message : "Vardiya kapatılamadı.", 409); }
    }
    if (body.operation === "assign-staff") {
      const tableNumber = Number(body.table_number);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!allowedTables.includes(tableNumber) || name.length > 80) return responseError("Masa veya personel adı geçersiz.");
      try {
        const shift = await updateStore((store) => {
          const active = store.shifts.find((item) => item.id === store.active_shift_id && !item.ended_at);
          if (!active) throw new Error("Aktif vardiya bulunamadı.");
          if (name) active.table_staff[String(tableNumber)] = name;
          else delete active.table_staff[String(tableNumber)];
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "shift.staff-assigned", record_id: null, created_at: new Date().toISOString(), detail: name ? `Masa ${tableNumber} · ${name}` : `Masa ${tableNumber} personel ataması kaldırıldı.` });
          return active;
        });
        return NextResponse.json({ shift });
      } catch (error) { return responseError(error instanceof Error ? error.message : "Masa personeli kaydedilemedi.", 409); }
    }
  }

  if (action === "cancel") {
    if (profile.role !== "admin") return responseError("Bu işlem için yönetici yetkisi gerekiyor.", 403);
    const id = typeof body.record_id === "string" ? body.record_id : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 3 || reason.length > 500) return responseError("İptal nedeni 3 ile 500 karakter arasında olmalı.");
    try {
      await updateStore((store) => {
        const record = store.records.find((item) => item.id === id && item.status === "delivered");
        if (!record) throw new Error("Kayıt bulunamadı veya daha önce iptal edildi.");
        record.status = "cancelled"; record.cancelled_at = new Date().toISOString(); record.cancelled_by = profile.id; record.cancellation_reason = reason;
        store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "bpc.cancelled", record_id: id, created_at: record.cancelled_at, detail: reason });
      });
      return NextResponse.json({ success: true });
    } catch (error) { return responseError(error instanceof Error ? error.message : "Kayıt iptal edilemedi.", 400); }
  }

  if (action === "user") {
    if (profile.role !== "admin") return responseError("Bu işlem için yönetici yetkisi gerekiyor.", 403);
    const operation = body.operation;
    if (operation === "create") {
      const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
      const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!/^[a-z0-9._-]{3,32}$/.test(username) || displayName.length < 1 || displayName.length > 80 || password.length < 8 || password.length > 128) return responseError("Kullanıcı adı, görünen ad veya şifre kurallara uymuyor.");
      try {
        await updateStore(async (store) => {
          if (store.profiles.some((person) => person.username === username)) throw new Error("Bu kullanıcı adı zaten kullanılıyor.");
          store.profiles.push({ id: randomUUID(), username, display_name: displayName, role: "operator", is_active: true, password_hash: await hashPassword(password), created_at: new Date().toISOString() });
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "operator.created", record_id: null, created_at: new Date().toISOString(), detail: username });
        });
        return NextResponse.json({ success: true }, { status: 201 });
      } catch (error) { return responseError(error instanceof Error ? error.message : "Hesap oluşturulamadı.", 409); }
    }
    if (operation === "enable" || operation === "disable") {
      const userId = typeof body.user_id === "string" ? body.user_id : "";
      try {
        await updateStore((store) => {
          const target = store.profiles.find((person) => person.id === userId && person.role === "operator");
          if (!target) throw new Error("Operatör bulunamadı.");
          target.is_active = operation === "enable";
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: `operator.${operation}d`, record_id: null, created_at: new Date().toISOString(), detail: target.username });
        });
        return NextResponse.json({ success: true });
      } catch (error) { return responseError(error instanceof Error ? error.message : "Hesap durumu değiştirilemedi.", 404); }
    }
    if (operation === "reset-password") {
      const userId = typeof body.user_id === "string" ? body.user_id : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length < 8 || password.length > 128) return responseError("Yeni şifre en az 8, en fazla 128 karakter olmalı.");
      try {
        await updateStore(async (store) => {
          const target = store.profiles.find((person) => person.id === userId && person.role === "operator");
          if (!target) throw new Error("Operatör bulunamadı.");
          target.password_hash = await hashPassword(password);
          target.password_changed_at = new Date().toISOString();
          store.audit.push({ id: randomUUID(), actor_id: profile.id, action: "operator.password-reset", record_id: null, created_at: new Date().toISOString(), detail: target.username });
        });
        return NextResponse.json({ success: true });
      } catch (error) { return responseError(error instanceof Error ? error.message : "Şifre yenilenemedi.", 404); }
    }
  }
  return responseError("Bilinmeyen işlem.", 404);
}
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { clearSessionCookie, createSession, hashPassword, isSetupAllowed, safeProfile, sessionCookie, sessionProfile, verifyPassword } from "../../../lib/bpc-store";
import { bpc } from "../../../lib/bpc-repository";
import { allowedCategories, allowedTables, BpcError, type BpcProfile } from "../../../lib/bpc-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
const responseError = (message: string, status = 400) => json({ error: message }, status);

function handleError(error: unknown) {
  if (error instanceof BpcError) return responseError(error.message, error.status);
  const code = (error as { code?: string } | null)?.code;
  // Driver errors may contain credentials or query parameters: only log safe metadata.
  console.error("[bpc-api] database request failed", { code, name: error instanceof Error ? error.name : "UnknownError" });
  if (code === "42P01") return responseError("Veritabanı tabloları bulunamadı. db/bpc-schema.sql dosyasını Neon SQL Editor'de çalıştırın.", 503);
  if (code === "23505") return responseError("Bu kayıt zaten mevcut. Bilgileri yenileyip tekrar deneyin.", 409);
  return responseError("Veritabanına erişilemedi. Lütfen tekrar deneyin. Sorun sürerse Neon bağlantısını ve kullanım sınırlarını kontrol edin.", 503);
}

export async function GET(request: Request) {
  try {
    const action = new URL(request.url).searchParams.get("action");
    const profile = await sessionProfile(request);
    if (action === "session") return json({ profile: profile ? safeProfile(profile) : null, needsSetup: await bpc.needsSetup() });
    if (!profile) return responseError("Oturum açmanız gerekiyor.", 401);
    // Authenticate even unchanged polls, so disabled accounts lose access promptly.
    // Read the version BEFORE the snapshot: a racing write can only cause an extra refresh.
    const revision = `${profile.id}:${profile.role}:${await bpc.revision()}`;
    if (new URL(request.url).searchParams.get("revision") === revision) return json({ unchanged: true, revision });
    return json({ revision, profile: safeProfile(profile), ...await bpc.dashboard(profile.role === "admin") });
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try { return await post(request); }
  catch (error) { return handleError(error); }
}

async function post(request: Request) {
  const action = new URL(request.url).searchParams.get("action");
  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return responseError("İstek verisi okunamadı.");
  } catch { return responseError("İstek verisi okunamadı."); }

  if (action === "logout") {
    const response = json({ success: true });
    response.headers.set("Set-Cookie", clearSessionCookie());
    return response;
  }

  if (action === "login") {
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length > 128) return responseError("Kullanıcı adı veya şifre hatalı.", 401);
    const profile = await bpc.findProfile("username", username);
    if (!profile || !(await verifyPassword(password, profile.password_hash))) return responseError("Kullanıcı adı veya şifre hatalı.", 401);
    const response = json({ profile: safeProfile(profile) });
    response.headers.set("Set-Cookie", sessionCookie(createSession(profile)));
    return response;
  }

  if (action === "setup") {
    if (!isSetupAllowed(body.setup_key)) return responseError("İlk yönetici kurulumu için geçerli sunucu kurulum anahtarı gerekli.", 403);
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[a-z0-9._-]{3,32}$/.test(username) || displayName.length < 1 || displayName.length > 80 || password.length < 12 || password.length > 128) return responseError("Kullanıcı adı, görünen ad veya şifre kurallara uymuyor.");
    const profile: BpcProfile = { id: randomUUID(), username, display_name: displayName, role: "admin", is_active: true, password_hash: await hashPassword(password), created_at: new Date().toISOString() };
    const token = createSession(profile);
    await bpc.createInitialAdmin(profile);
    const response = json({ profile: safeProfile(profile) }, 201);
    response.headers.set("Set-Cookie", sessionCookie(token));
    return response;
  }

  const profile = await sessionProfile(request);
  if (!profile) return responseError("Oturum açmanız gerekiyor.", 401);

  if (action === "record") {
    const table = Number(body.table_number);
    const category = body.bpc_category;
    const quantity = Number(body.quantity);
    const key = typeof body.idempotency_key === "string" ? body.idempotency_key : "";
    if (!allowedTables.includes(table) || typeof category !== "string" || !allowedCategories.includes(category)) return responseError("Masa veya BPC kategorisi geçersiz.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100000) return responseError("Adet zorunludur; 1 ile 100000 arasında tam sayı girin.");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) return responseError("Kayıt anahtarı geçersiz. Lütfen tekrar deneyin.");
    const result = await bpc.createRecord(profile.id, table, category, quantity, key);
    return json(result, result.duplicate ? 200 : 201);
  }

  if (action === "queue-add") {
    const table = Number(body.table_number);
    if (!allowedTables.includes(table)) return responseError("Masa numarası geçersiz.");
    return json({ entry: await bpc.addQueueTable(profile.id, table) }, 201);
  }

  if (action === "queue-complete") {
    const id = typeof body.entry_id === "string" ? body.entry_id : "";
    return json({ completed: await bpc.completeQueueTable(profile.id, id) });
  }

  if (profile.role !== "admin") return responseError("Bu işlem için yönetici yetkisi gerekiyor.", 403);

  if (action === "shift") {
    if (body.operation === "end") {
      const shift = await bpc.endShift(profile.id);
      return json({ active_shift_id: shift.id, shift });
    }
    if (body.operation === "assign-staff") {
      const table = Number(body.table_number);
      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (!allowedTables.includes(table) || name.length > 80) return responseError("Masa veya personel adı geçersiz.");
      return json({ shift: await bpc.assignStaff(profile.id, table, name) });
    }
  }

  if (action === "cancel") {
    const id = typeof body.record_id === "string" ? body.record_id : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (reason.length < 3 || reason.length > 500) return responseError("İptal nedeni 3 ile 500 karakter arasında olmalı.");
    await bpc.cancelRecord(profile.id, id, reason);
    return json({ success: true });
  }

  if (action === "user") {
    if (body.operation === "create") {
      const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
      const displayName = typeof body.display_name === "string" ? body.display_name.trim() : "";
      const password = typeof body.password === "string" ? body.password : "";
      if (!/^[a-z0-9._-]{3,32}$/.test(username) || displayName.length < 1 || displayName.length > 80 || password.length < 8 || password.length > 128) return responseError("Kullanıcı adı, görünen ad veya şifre kurallara uymuyor.");
      await bpc.createOperator(profile.id, { id: randomUUID(), username, display_name: displayName, role: "operator", is_active: true, password_hash: await hashPassword(password), created_at: new Date().toISOString() });
      return json({ success: true }, 201);
    }
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    if (body.operation === "enable" || body.operation === "disable") {
      await bpc.setOperatorActive(profile.id, userId, body.operation === "enable");
      return json({ success: true });
    }
    if (body.operation === "reset-password") {
      const password = typeof body.password === "string" ? body.password : "";
      if (password.length < 8 || password.length > 128) return responseError("Yeni şifre en az 8, en fazla 128 karakter olmalı.");
      await bpc.resetPassword(profile.id, userId, await hashPassword(password));
      return json({ success: true });
    }
  }
  return responseError("Bilinmeyen işlem.", 404);
}

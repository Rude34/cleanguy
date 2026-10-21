import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getVercelOidcToken } from "@vercel/oidc";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "bpc_session";
const SESSION_SECONDS = 60 * 60 * 12;
const STORAGE_KEY = "bpc-management/data.json";
const TABLES = Array.from({ length: 35 }, (_, index) => index + 7);
const CATEGORIES = ["Kat0 (XL)", "Kat0 (Normal)", "Kat0 (Sağlık Güzellik)", "Zemin (Karışık)", "Zemin (Elektronik)", "Kat0-Zemin (Karışık)", "Kat0 (Seri Ürün)", "Zemin(Su-Redbull)"];

export type BpcProfile = { id: string; username: string; display_name: string; role: "admin" | "operator"; is_active: boolean; password_hash: string; password_changed_at?: string; created_at: string };
export type BpcRecord = { id: string; shift_id?: string; table_number: number; bpc_category: string; quantity: number | null; operator_id: string; status: "delivered" | "cancelled"; created_at: string; cancelled_at: string | null; cancelled_by: string | null; cancellation_reason: string | null };
export type BpcAudit = { id: string; actor_id: string; action: string; record_id: string | null; created_at: string; detail: string };
export type BpcShift = { id: string; started_at: string; ended_at: string | null; started_by: string | null; ended_by: string | null; table_staff: Record<string, string> };
export type BpcQueueEntry = { id: string; table_number: number; added_by: string; added_at: string };
type Store = { profiles: BpcProfile[]; records: BpcRecord[]; audit: BpcAudit[]; shifts: BpcShift[]; active_shift_id: string | null; waiting_tables: BpcQueueEntry[] };

const emptyStore = (): Store => ({ profiles: [], records: [], audit: [], shifts: [], active_shift_id: null, waiting_tables: [] });
const publicProfile = ({ password_hash: _hash, ...profile }: BpcProfile) => profile;
const key = () => process.env.BPC_SESSION_SECRET || (process.env.NODE_ENV === "development" ? "local-bpc-session-secret-change-before-production" : "");

async function blobConfiguration() {
  const storeId = process.env.BLOB_STORE_ID?.trim();
  const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";

  if (isProduction && !storeId && !readWriteToken) {
    throw new Error(isVercel
      ? "Bu Vercel deployment'ında BLOB_STORE_ID bulunamadı. Blob store'un doğru Vercel projesine Production ortamında bağlı olduğunu kontrol edip yeniden deploy edin."
      : "Blob yapılandırması eksik: BLOB_STORE_ID veya BLOB_READ_WRITE_TOKEN tanımlanmalı.");
  }

  if (isProduction && storeId && !readWriteToken) {
    try {
      const oidcToken = await getVercelOidcToken();
      return { useBlob: true, options: { storeId, oidcToken } };
    } catch {
      throw new Error("Blob deposu bulundu ancak Vercel Function isteğinde OIDC kimliği alınamadı. Projenin Vercel Function olarak çalıştığını, Blob bağlantısının bu projede Production için etkin olduğunu ve son deploy'un bağlantıdan sonra yapıldığını kontrol edin.");
    }
  }

  const useBlob = Boolean(readWriteToken);
  if (readWriteToken) return { useBlob: true, options: storeId ? { storeId } : {} };
  return { useBlob, options: {} };
}

async function readStore(): Promise<{ store: Store; etag: string | null }> {
  const blob = await blobConfiguration();
  if (blob.useBlob) {
    const { get } = await import("@vercel/blob");
    try {
      const result = await get(STORAGE_KEY, { access: "private", useCache: false, ...blob.options });
      if (!result?.stream) return { store: emptyStore(), etag: null };
      return { store: JSON.parse(await new Response(result.stream).text()) as Store, etag: result.blob.etag };
    } catch (error) {
      if (error instanceof Error && /not found|404/i.test(error.message)) return { store: emptyStore(), etag: null };
      throw error;
    }
  }
  const filename = path.join(process.cwd(), ".data", "bpc.json");
  try { return { store: JSON.parse(await readFile(filename, "utf8")) as Store, etag: null }; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return { store: emptyStore(), etag: null }; throw error; }
}

async function writeStore(store: Store, etag: string | null) {
  const blob = await blobConfiguration();
  if (blob.useBlob) {
    const { put } = await import("@vercel/blob");
    await put(STORAGE_KEY, JSON.stringify(store), { access: "private", contentType: "application/json", ...(etag ? { ifMatch: etag } : {}), ...blob.options });
    return;
  }
  if (process.env.NODE_ENV !== "development") throw new Error("Vercel Blob storage is not configured.");
  const directory = path.join(process.cwd(), ".data");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "bpc.json"), JSON.stringify(store, null, 2), "utf8");
}

let queue = Promise.resolve();
export async function updateStore<T>(mutate: (store: Store) => T | Promise<T>): Promise<T> {
  const operation = queue.then(async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { store, etag } = await readStore();
      ensureStoreShape(store);
      const result = await mutate(store);
      try { await writeStore(store, etag); return result; }
      catch (error) {
        const status = (error as { status?: number; statusCode?: number }).status ?? (error as { statusCode?: number }).statusCode;
        if ((status === 412 || (error instanceof Error && /precondition|already exists/i.test(error.message))) && attempt < 4) continue;
        throw error;
      }
    }
    throw new Error("Eş zamanlı kayıt çakışması; lütfen yeniden deneyin.");
  });
  queue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function getStore() {
  const { store } = await readStore();
  if (!store.active_shift_id || !Array.isArray(store.shifts)) {
    return updateStore((current) => {
      ensureStoreShape(current);
      return current;
    });
  }
  ensureStoreShape(store);
  return store;
}

function ensureStoreShape(store: Store) {
  store.profiles ??= [];
  store.records ??= [];
  store.audit ??= [];
  store.shifts ??= [];
  store.waiting_tables ??= [];
  if (store.active_shift_id && store.shifts.some((shift) => shift.id === store.active_shift_id && !shift.ended_at)) return;

  const startedAt = store.records.reduce((earliest, record) => record.created_at < earliest ? record.created_at : earliest, new Date().toISOString());
  const shift: BpcShift = { id: randomBytes(16).toString("hex"), started_at: startedAt, ended_at: null, started_by: null, ended_by: null, table_staff: {} };
  for (const record of store.records) record.shift_id ??= shift.id;
  store.shifts.push(shift);
  store.active_shift_id = shift.id;
}

export function isSetupAllowed(providedKey: unknown) {
  if (process.env.NODE_ENV === "development") return true;
  const setupKey = process.env.BPC_SETUP_KEY;
  return Boolean(setupKey && typeof providedKey === "string" && providedKey === setupKey);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [salt, stored] = encoded.split(":");
  if (!salt || !stored) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(stored, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createSession(profile: BpcProfile) {
  const secret = key();
  if (!secret) throw new Error("BPC_SESSION_SECRET is not configured.");
  const payload = Buffer.from(JSON.stringify({ id: profile.id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export async function sessionProfile(request: Request) {
  const token = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  const secret = key();
  if (!token || !secret) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, "base64url"); } catch { return null; }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  let id: string;
  let issuedAt: number;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof value.exp !== "number" || value.exp < Date.now() / 1000 || typeof value.id !== "string") return null;
    id = value.id;
    issuedAt = typeof value.iat === "number" ? value.iat : 0;
  } catch { return null; }
  const store = await getStore();
  const profile = store.profiles.find((candidate) => candidate.id === id && candidate.is_active);
  if (profile?.password_changed_at && issuedAt < Math.floor(new Date(profile.password_changed_at).getTime() / 1000)) return null;
  return profile ?? null;
}

export function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${secure}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function safeProfile(profile: BpcProfile) { return publicProfile(profile); }
export const allowedTables = TABLES;
export const allowedCategories = CATEGORIES;
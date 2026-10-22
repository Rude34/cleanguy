import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { bpc } from "./bpc-repository";
import { BpcError, type BpcProfile } from "./bpc-types";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "bpc_session";
const SESSION_SECONDS = 60 * 60 * 12;
const key = () => process.env.BPC_SESSION_SECRET || (process.env.NODE_ENV === "development" ? "local-bpc-session-secret-change-before-production" : "");

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
  if (!secret) throw new BpcError("BPC_SESSION_SECRET tanımlanmalı.", 503);
  const now = Date.now();
  const payload = Buffer.from(JSON.stringify({ id: profile.id, iat: Math.floor(now / 1000), iat_ms: now, exp: Math.floor(now / 1000) + SESSION_SECONDS })).toString("base64url");
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
  const received = Buffer.from(signature, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  let id: string;
  let issuedAt: number;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof value.exp !== "number" || value.exp < Date.now() / 1000 || typeof value.id !== "string") return null;
    id = value.id;
    issuedAt = typeof value.iat_ms === "number" ? value.iat_ms : typeof value.iat === "number" ? value.iat * 1000 : 0;
  } catch { return null; }
  const profile = await bpc.findProfile("id", id);
  if (profile?.password_changed_at && issuedAt < new Date(profile.password_changed_at).getTime()) return null;
  return profile;
}

export function sessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function safeProfile(profile: BpcProfile) {
  return { id: profile.id, username: profile.username, display_name: profile.display_name, role: profile.role,
    is_active: profile.is_active, created_at: profile.created_at, password_changed_at: profile.password_changed_at };
}

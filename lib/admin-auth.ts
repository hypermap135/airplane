/**
 * Tiny session layer for the /admin dashboard.
 *
 * One single shared password (env var ADMIN_PASSWORD). On successful login
 * we set an HttpOnly cookie containing an HMAC-signed timestamp. Verifying
 * the cookie checks the HMAC + age — no DB, no NextAuth, no roles.
 *
 * Good enough for "one shopkeeper editing his own catalogue" and avoids
 * bringing a full auth lib for tonight's V1.
 */

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) {
    // Don't crash — but log loudly so a missing env var is obvious in Vercel.
    console.warn(
      "[admin-auth] ADMIN_SESSION_SECRET missing or too short. Refusing to issue or validate sessions.",
    );
    return "";
  }
  return s;
}

function sign(payload: string): string {
  const secret = getSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function checkPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  if (provided.length !== expected.length) return false;
  // Pad both to same length before timing-safe compare.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function buildSessionToken(): string {
  const issuedAt = Math.floor(Date.now() / 1000).toString(10);
  const sig = sign(issuedAt);
  if (!sig) return "";
  return `${issuedAt}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAtStr, sig] = token.split(".");
  if (!issuedAtStr || !sig) return false;
  const expected = sign(issuedAtStr);
  if (!expected) return false;
  if (!safeEqualHex(expected, sig)) return false;
  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - issuedAt < SESSION_TTL_SECONDS;
}

/** Read the cookie inside Server Components / Route Handlers and validate. */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const c = await cookies();
    return verifySessionToken(c.get(COOKIE_NAME)?.value);
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

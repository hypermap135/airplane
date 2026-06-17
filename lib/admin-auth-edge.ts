/**
 * Edge-runtime safe verification of the admin session cookie.
 *
 * The middleware must run in Edge runtime (Next.js requirement) and Edge
 * does not expose Node's `crypto` module — only WebCrypto via globalThis.crypto.
 * This file implements `verifySessionTokenEdge` using SubtleCrypto so the
 * middleware can gate /admin/* without dragging Node-only code in.
 *
 * The richer helpers (cookie-aware `isAuthenticated`, token issuance) live
 * in lib/admin-auth.ts and run in the Node runtime only.
 */

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_COOKIE_NAME = "admin-session";

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(byte)) return null;
    out[i] = byte;
  }
  return out;
}

export async function verifySessionTokenEdge(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret || secret.length < 32) return false;

  const [issuedAtStr, sigHex] = token.split(".");
  if (!issuedAtStr || !sigHex) return false;
  const sigBytes = hexToBytes(sigHex);
  if (!sigBytes) return false;

  const enc = new TextEncoder();
  let key: CryptoKey;
  try {
    key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
  } catch {
    return false;
  }

  let ok: boolean;
  try {
    ok = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes.buffer.slice(
        sigBytes.byteOffset,
        sigBytes.byteOffset + sigBytes.byteLength,
      ) as ArrayBuffer,
      enc.encode(issuedAtStr),
    );
  } catch {
    return false;
  }
  if (!ok) return false;

  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return false;
  const now = Math.floor(Date.now() / 1000);
  return now - issuedAt < SESSION_TTL_SECONDS;
}

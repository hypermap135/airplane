import type { NextRequest } from "next/server";

/**
 * In-memory sliding-window rate limiter par IP.
 * Attention : ne survit PAS au redémarrage d'une serverless function,
 * et chaque instance Vercel a son propre bucket → protection réelle
 * limitée. Pour du rate limit distribué, migrer vers Upstash Redis
 * (voir la reco d'audit — nécessite UPSTASH_REDIS_REST_URL + TOKEN).
 *
 * Reste utile aujourd'hui pour bloquer un attaquant naïf sur une seule
 * instance (fetch en boucle depuis le même IP touche généralement le
 * même worker).
 */
type Bucket = Map<string, number[]>;
const BUCKETS: Record<string, Bucket> = {};

export function extractIp(req: NextRequest | Request): string {
  const h = "headers" in req ? req.headers : new Headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRate(
  scope: string,
  ip: string,
  maxHits: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  if (!BUCKETS[scope]) BUCKETS[scope] = new Map();
  const bucket = BUCKETS[scope];
  const hits = (bucket.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= maxHits) {
    bucket.set(ip, hits);
    const oldest = hits[0];
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  hits.push(now);
  bucket.set(ip, hits);
  if (bucket.size > 2000) {
    for (const [k, v] of bucket) {
      if (v.every((t) => now - t > windowMs)) bucket.delete(k);
    }
  }
  return { ok: true };
}

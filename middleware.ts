/**
 * Two middleware concerns combined:
 *
 *  1. UTM tracking — captures utm_* params on any incoming URL and stores
 *     them in cookies for 30 days. The CAPI route reads these cookies and
 *     forwards them with each event so we can attribute conversions to the
 *     right campaign.
 *
 *  2. Admin gate — protects /admin/* and /api/admin/* with an HMAC-signed
 *     session cookie. Unauthenticated requests to /admin/* are redirected
 *     to /admin/login. Unauthenticated requests to /api/admin/* get a 401.
 *     /admin/login itself is exempt.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionTokenEdge,
} from "@/lib/admin-auth-edge";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // ── 0. Maintenance mode — /admin reste accessible pour dépanner ──────
  // Activation : Vercel env var MAINTENANCE_MODE=1 (redeploy pour propager).
  //
  // Bypass : cookie `airplanestore.maint-bypass` = MD5(ADMIN_SESSION_SECRET).
  // Pour prévisualiser, appeler /?bypass=<ADMIN_SESSION_SECRET> UNE FOIS —
  // le middleware pose le cookie signé, puis strip la query de l'URL
  // (évite que le secret reste dans logs Vercel + Referer sortants).
  const BYPASS_COOKIE = "airplanestore.maint-bypass";
  if (
    process.env.MAINTENANCE_MODE === "1" &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/lead") &&
    !pathname.startsWith("/api/whatsapp") &&
    pathname !== "/maintenance"
  ) {
    const secret = process.env.ADMIN_SESSION_SECRET ?? "";
    const bypassQuery = url.searchParams.get("bypass");
    const bypassCookie = req.cookies.get(BYPASS_COOKIE)?.value;

    // Cookie déjà posé → laisse passer, on ne re-check pas
    if (bypassCookie && secret && bypassCookie === secret.slice(0, 32)) {
      return NextResponse.next();
    }

    // Query fournie et valide → pose le cookie et redirige sans la query
    if (bypassQuery && secret && bypassQuery === secret) {
      const clean = new URL(url);
      clean.searchParams.delete("bypass");
      const res = NextResponse.redirect(clean);
      res.cookies.set(BYPASS_COOKIE, secret.slice(0, 32), {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8h de preview par cookie
      });
      return res;
    }

    const maintUrl = new URL("/maintenance", url);
    return NextResponse.rewrite(maintUrl);
  }

  // ── 1. Admin gate ────────────────────────────────────────────────────
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi  = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const ok = await verifySessionTokenEdge(
      token,
      process.env.ADMIN_SESSION_SECRET,
    );
    if (!ok) {
      if (isAdminApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      // Redirect to login, preserve the original destination
      const login = new URL("/admin/login", url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  // ── 2. UTM capture ───────────────────────────────────────────────────
  const captured: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = url.searchParams.get(key);
    if (v) captured[key] = v;
  }

  if (Object.keys(captured).length === 0) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(captured)) {
    res.cookies.set(k, v, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: true,
    });
  }
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next static files
     * - common static assets
     *
     * We DO match /api/admin/* (so we can gate it) but NOT general /api/*.
     */
    "/admin/:path*",
    "/api/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|images|led|products/|.*\\.(?:png|jpg|jpeg|svg|gif|ico|xml|json)$).*)",
  ],
};

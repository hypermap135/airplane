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

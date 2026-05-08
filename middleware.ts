/**
 * UTM tracking middleware.
 * Captures utm_* params from any incoming URL and stores them in cookies
 * for 30 days. The CAPI route reads these cookies and forwards them with
 * each event so we can attribute conversions to the right campaign.
 */

import { NextRequest, NextResponse } from "next/server";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
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
     * Match all request paths except for:
     * - api routes (handled by CAPI itself)
     * - _next static files
     * - favicon and other static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|led|products/|.*\\.(?:png|jpg|jpeg|svg|gif|ico|xml|json)$).*)",
  ],
};

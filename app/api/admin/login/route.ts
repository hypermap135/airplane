import { NextResponse } from "next/server";
import {
  checkPassword,
  buildSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/login
 *   body: { password: string }
 * Returns 200 + Set-Cookie on success, 401 otherwise.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const password = (body as { password?: unknown })?.password;
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "missing_password" }, { status: 400 });
  }
  if (!checkPassword(password)) {
    // small delay to slow brute-force attempts
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "bad_password" }, { status: 401 });
  }

  const token = buildSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "session_secret_missing" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  // secure=true blocks the cookie on plain HTTP (localhost), so the
  // browser silently drops Set-Cookie and the next request still looks
  // unauthenticated → "connexion ne marche pas". Only require HTTPS in prod.
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

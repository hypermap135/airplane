/**
 * GET /api/admin/preview/{handle}
 *
 * Streams the framed preview from .tmp/preview/{handle}.png so the admin
 * UI can display it without exposing the .tmp/ directory to the public
 * file server. Local dev only.
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { handle: string } },
) {
  if (process.env.VERCEL) {
    return new NextResponse("Admin local-only", { status: 501 });
  }

  const { handle } = params;
  if (!/^[a-z0-9-]+$/i.test(handle)) {
    return new NextResponse("invalid handle", { status: 400 });
  }

  const file = path.join(process.cwd(), ".tmp", "preview", `${handle}.png`);
  try {
    await stat(file);
    const buf = await readFile(file);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("preview not found", { status: 404 });
  }
}

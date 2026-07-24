import { NextResponse } from "next/server";
import { PRODUCTS, COLLECTIONS } from "@/lib/products";
import {
  patchProductOverride,
  type ProductOverride,
} from "@/lib/products-store";

export const runtime = "nodejs";

const ALLOWED_FIELDS: ReadonlySet<keyof ProductOverride> = new Set([
  "title",
  "subtitle",
  "price",
  "compareAt",
  "inStock",
  "comingSoon",
  "bestseller",
  "image",
  "images",
  "scale",
  "collection",
  "hidden",
  "specs",
  "description",
]);

const VALID_COLLECTIONS = new Set(COLLECTIONS.map((c) => c.slug));

function coerceField(
  key: keyof ProductOverride,
  v: unknown,
): ProductOverride[keyof ProductOverride] | null | undefined {
  // null means "clear this override field"
  if (v === null) return null;
  switch (key) {
    case "title":
    case "subtitle":
    case "image":
    case "scale":
      return typeof v === "string" ? v.slice(0, 500) : undefined;
    case "price":
      return typeof v === "number" && Number.isFinite(v) && v >= 0
        ? v
        : undefined;
    case "compareAt":
      return typeof v === "number" && Number.isFinite(v) && v >= 0
        ? v
        : v === null
          ? null
          : undefined;
    case "inStock":
    case "comingSoon":
    case "bestseller":
    case "hidden":
      return typeof v === "boolean" ? v : undefined;
    case "images":
      return Array.isArray(v) && v.every((x) => typeof x === "string")
        ? (v as string[]).slice(0, 12)
        : undefined;
    case "collection":
      return typeof v === "string" && VALID_COLLECTIONS.has(v as never)
        ? (v as ProductOverride["collection"])
        : undefined;
    case "description":
      return typeof v === "string" ? v.slice(0, 4000) : undefined;
    case "specs": {
      if (!Array.isArray(v)) return undefined;
      const cleaned = v
        .filter(
          (s): s is { label: string; value: string } =>
            !!s &&
            typeof s === "object" &&
            typeof (s as { label?: unknown }).label === "string" &&
            typeof (s as { value?: unknown }).value === "string",
        )
        .map((s) => ({
          label: s.label.slice(0, 60),
          value: s.value.slice(0, 200),
        }))
        .filter((s) => s.label.trim() !== "" || s.value.trim() !== "")
        .slice(0, 20);
      return cleaned;
    }
    default:
      return undefined;
  }
}

/**
 * PATCH /api/admin/products/[id]
 *   body: ProductOverride
 *
 * Stores override fields in the Vercel Blob overrides JSON and revalidates.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!PRODUCTS.find((p) => p.id === id)) {
    return NextResponse.json({ error: "unknown_product" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const patch: ProductOverride = {};
  for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
    if (!ALLOWED_FIELDS.has(k as keyof ProductOverride)) continue;
    const coerced = coerceField(k as keyof ProductOverride, v);
    if (coerced === undefined) continue; // skip invalid
    // null = clear → store as null in the patch so the merger knows to drop it
    (patch as Record<string, unknown>)[k] = coerced;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "no_valid_fields" }, { status: 400 });
  }

  try {
    await patchProductOverride(id, patch);
  } catch (err) {
    console.error("[admin] patch failed:", err);
    const detail = String(err);
    // Special-case le blob suspendu — message actionnable pour l'UI plutôt
    // qu'une erreur technique cryptique
    if (detail.includes("suspended") || detail.includes("Inactive")) {
      return NextResponse.json(
        {
          error: "blob_suspended",
          userMessage:
            "Le stockage Vercel Blob est suspendu (plan facturation inactif). Réactivez-le sur vercel.com/hypermappro/airplane/stores pour que l'admin puisse sauvegarder.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "blob_write_failed", detail },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true, id, applied: patch });
}

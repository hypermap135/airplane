/**
 * WhatsApp Agent — /code command handler
 *
 * Twilio sends a POST with form-encoded body:
 *   From=whatsapp:+33XXXXXXXXX&Body=/code prix A220 79€
 *
 * Claude interprets the instruction and executes Shopify mutations.
 * Responds with a TwiML <Message> back to the sender.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// ─── Config ─────────────────────────────────────────────────────────────────

const STORE      = "y823wg-nz.myshopify.com";
const API_VER    = "2024-07";
const GQL_URL    = `https://${STORE}/admin/api/${API_VER}/graphql.json`;

// ─── Shopify helper ──────────────────────────────────────────────────────────

async function shopify(query: string, variables?: Record<string, unknown>) {
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!token) throw new Error("SHOPIFY_ADMIN_TOKEN not set");

  const res = await fetch(GQL_URL, {
    method:  "POST",
    headers: {
      "Content-Type":          "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json() as { data?: Record<string, unknown>; errors?: unknown[] };
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data ?? {};
}

// ─── Tool implementations ────────────────────────────────────────────────────

/** Find a product + its first variant by handle or partial title */
async function findProduct(identifier: string) {
  const data = await shopify(`{
    products(first: 5, query: ${JSON.stringify(`title:*${identifier}* OR handle:${identifier}`)}) {
      edges { node {
        id title handle status
        variants(first: 1) { edges { node { id price compareAtPrice inventoryQuantity } } }
      }}
    }
  }`);
  const products = (data as { products: { edges: { node: unknown }[] } }).products?.edges ?? [];
  if (!products.length) throw new Error(`Produit introuvable : "${identifier}"`);
  return (products[0] as { node: { id: string; title: string; handle: string; variants: { edges: { node: { id: string; price: string; compareAtPrice: string; inventoryQuantity: number } }[] } } }).node;
}

async function updatePrice(identifier: string, price: number, compareAt?: number) {
  const product = await findProduct(identifier);
  const variantId = product.variants.edges[0]?.node.id;
  if (!variantId) throw new Error("Aucune variante trouvée");

  const vars: Record<string, unknown> = {
    productId: product.id,
    variants: [{ id: variantId, price: price.toFixed(2), ...(compareAt ? { compareAtPrice: compareAt.toFixed(2) } : {}) }],
  };

  await shopify(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      userErrors { field message }
    }
  }`, vars);

  return `Prix de "${product.title}" mis à ${price}€` + (compareAt ? ` (barré : ${compareAt}€)` : "");
}

async function updateStock(identifier: string, inStock: boolean, comingSoon?: boolean) {
  const product = await findProduct(identifier);
  const status = inStock ? "ACTIVE" : "DRAFT";

  await shopify(`mutation($id: ID!, $product: ProductInput!) {
    productUpdate(id: $id, product: $product) {
      userErrors { field message }
    }
  }`, { id: product.id, product: { status, tags: comingSoon ? ["coming-soon"] : [] } });

  return `"${product.title}" → ${inStock ? "✅ En stock" : comingSoon ? "🔜 Bientôt dispo" : "❌ Épuisé"}`;
}

async function updateDescription(identifier: string, description: string) {
  const product = await findProduct(identifier);

  await shopify(`mutation($id: ID!, $product: ProductInput!) {
    productUpdate(id: $id, product: $product) {
      userErrors { field message }
    }
  }`, { id: product.id, product: { descriptionHtml: description } });

  return `Description de "${product.title}" mise à jour`;
}

async function createProduct(title: string, price: number, description: string, collection: string) {
  const data = await shopify(`mutation($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        variants(first: 1) { edges { node { id } } }
      }
      userErrors { field message }
    }
  }`, {
    product: {
      title,
      descriptionHtml: description,
      status: "ACTIVE",
      tags: [collection],
    },
  }) as { productCreate: { product: { id: string; variants: { edges: { node: { id: string } }[] } } } };

  const variantId = data.productCreate?.product?.variants?.edges[0]?.node?.id;
  if (variantId) {
    const productId = data.productCreate.product.id;
    await shopify(`mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`, { productId, variants: [{ id: variantId, price: price.toFixed(2) }] });
  }

  return `Produit "${title}" créé à ${price}€ dans la collection ${collection}`;
}

async function applyDiscount(identifier: string, discountPercent: number) {
  const product = await findProduct(identifier);
  const variant = product.variants.edges[0]?.node;
  if (!variant) throw new Error("Aucune variante");

  const originalPrice = parseFloat(variant.price);
  const discountedPrice = originalPrice * (1 - discountPercent / 100);

  return updatePrice(identifier, Math.round(discountedPrice), originalPrice);
}

// ─── Tool definitions for Claude ─────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "update_price",
    description: "Changer le prix d'un produit. Peut aussi ajouter un prix barré (compareAt) pour afficher une promo.",
    input_schema: {
      type: "object" as const,
      properties: {
        identifier: { type: "string", description: "Handle ou titre (partiel) du produit" },
        price:      { type: "number", description: "Nouveau prix en euros" },
        compare_at: { type: "number", description: "Prix barré (optionnel, pour afficher la réduction)" },
      },
      required: ["identifier", "price"],
    },
  },
  {
    name: "update_stock",
    description: "Marquer un produit comme disponible, épuisé ou bientôt disponible.",
    input_schema: {
      type: "object" as const,
      properties: {
        identifier:   { type: "string", description: "Handle ou titre (partiel) du produit" },
        in_stock:     { type: "boolean", description: "true = en stock, false = épuisé" },
        coming_soon:  { type: "boolean", description: "true si le produit arrive bientôt" },
      },
      required: ["identifier", "in_stock"],
    },
  },
  {
    name: "update_description",
    description: "Mettre à jour la description HTML d'un produit.",
    input_schema: {
      type: "object" as const,
      properties: {
        identifier:  { type: "string", description: "Handle ou titre (partiel) du produit" },
        description: { type: "string", description: "Nouvelle description (HTML autorisé)" },
      },
      required: ["identifier", "description"],
    },
  },
  {
    name: "create_product",
    description: "Créer un nouveau produit dans Shopify.",
    input_schema: {
      type: "object" as const,
      properties: {
        title:       { type: "string", description: "Nom du produit" },
        price:       { type: "number", description: "Prix en euros" },
        description: { type: "string", description: "Description HTML" },
        collection:  { type: "string", description: "Collection: airbus, boeing, concorde, chasse, jet, packs, accessoires" },
      },
      required: ["title", "price", "description", "collection"],
    },
  },
  {
    name: "apply_discount",
    description: "Appliquer un pourcentage de réduction sur un produit (met le prix actuel en barré).",
    input_schema: {
      type: "object" as const,
      properties: {
        identifier:       { type: "string", description: "Handle ou titre (partiel) du produit" },
        discount_percent: { type: "number", description: "Pourcentage de réduction (ex: 10 pour -10%)" },
      },
      required: ["identifier", "discount_percent"],
    },
  },
];

// ─── Claude agent ─────────────────────────────────────────────────────────────

async function runAgent(instruction: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: instruction,
    },
  ];

  const system = `Tu es l'agent de gestion d'AirplaneStore (airplanestore.fr), une boutique de maquettes d'avion en résine.
Tu reçois des instructions en français de l'administrateur du site via WhatsApp et tu dois les exécuter via les outils disponibles.
Sois concis dans tes réponses. Confirme chaque action exécutée. Si l'instruction est ambiguë, exécute ce qui semble le plus logique.
Collections disponibles : airbus, boeing, concorde, chasse, jet, packs, accessoires.`;

  let response = await client.messages.create({
    model:      "claude-opus-4-5",
    max_tokens: 1024,
    system,
    tools:      TOOLS,
    messages,
  });

  const results: string[] = [];

  // Agentic loop
  while (response.stop_reason === "tool_use") {
    const assistantMessage: Anthropic.MessageParam = { role: "assistant", content: response.content };
    messages.push(assistantMessage);

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      let result: string;
      try {
        const input = block.input as Record<string, unknown>;
        switch (block.name) {
          case "update_price":
            result = await updatePrice(input.identifier as string, input.price as number, input.compare_at as number | undefined);
            break;
          case "update_stock":
            result = await updateStock(input.identifier as string, input.in_stock as boolean, input.coming_soon as boolean | undefined);
            break;
          case "update_description":
            result = await updateDescription(input.identifier as string, input.description as string);
            break;
          case "create_product":
            result = await createProduct(input.title as string, input.price as number, input.description as string, input.collection as string);
            break;
          case "apply_discount":
            result = await applyDiscount(input.identifier as string, input.discount_percent as number);
            break;
          default:
            result = `Outil inconnu : ${block.name}`;
        }
        results.push(`✅ ${result}`);
      } catch (err) {
        result = `Erreur : ${(err as Error).message}`;
        results.push(`❌ ${result}`);
      }

      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }

    messages.push({ role: "user", content: toolResults });

    response = await client.messages.create({
      model:      "claude-opus-4-5",
      max_tokens: 512,
      system,
      tools:      TOOLS,
      messages,
    });
  }

  // Final text response from Claude
  const finalText = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("\n");

  return results.length > 0
    ? results.join("\n") + (finalText ? `\n\n${finalText}` : "")
    : finalText || "Action exécutée.";
}

// ─── Route handler ────────────────────────────────────────────────────────────

function twiml(text: string) {
  return new NextResponse(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message><![CDATA[${text}]]></Message></Response>`,
    { status: 200, headers: { "Content-Type": "text/xml; charset=utf-8" } }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const from    = params.get("From") ?? "";
    const message = (params.get("Body") ?? "").trim();

    // Security: whitelist owner number(s)
    const allowed = (process.env.OWNER_WHATSAPP ?? "").split(",").map(s => s.trim());
    if (allowed[0] && !allowed.includes(from)) {
      console.warn(`Blocked message from ${from}`);
      return new NextResponse("", { status: 200 }); // silent ignore
    }

    // Only handle /code commands
    if (!message.toLowerCase().startsWith("/code")) {
      return twiml(
        "👋 Commandes disponibles :\n" +
        "/code prix [produit] [montant]€\n" +
        "/code promo [produit] -X%\n" +
        "/code stock [produit] dispo/épuisé/bientôt\n" +
        "/code desc [produit] [texte]\n" +
        "/code créer [titre] [prix]€ [collection]\n\n" +
        "Exemple : /code prix A220 79€"
      );
    }

    const instruction = message.slice("/code".length).trim();
    if (!instruction) {
      return twiml("💬 Donne-moi une instruction après /code.\nExemple : /code prix A380 99€");
    }

    console.log(`[WhatsApp Agent] From: ${from} | Instruction: ${instruction}`);

    const result = await runAgent(instruction);

    console.log(`[WhatsApp Agent] Result: ${result}`);
    return twiml(`🛫 AirplaneStore\n\n${result}`);

  } catch (err) {
    console.error("[WhatsApp Agent] Error:", err);
    return twiml(`❌ Erreur : ${(err as Error).message}`);
  }
}

// Twilio webhook verification (GET for sandbox setup)
export async function GET() {
  return new NextResponse("WhatsApp Agent online ✅", { status: 200 });
}

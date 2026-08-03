/**
 * Brevo (ex-Sendinblue) transactional email wrapper.
 *
 * Env vars requis :
 *   BREVO_API_KEY       — clé API v3 (dashboard Brevo → SMTP & API)
 *   BREVO_SENDER_EMAIL  — expéditeur validé (ex: contact@airplanestore.fr)
 *   BREVO_SENDER_NAME   — nom expéditeur (ex: "Air Plane Store")
 *
 * Sans BREVO_API_KEY, `sendEmail` log en console et retourne { ok: false }.
 * Aucune erreur — les appelants peuvent s'exécuter en dry-run local.
 */

type SendParams = {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  tags?: string[];
};

export async function sendEmail(p: SendParams): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const key = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? "contact@airplanestore.fr";
  const senderName  = process.env.BREVO_SENDER_NAME  ?? "Air Plane Store";

  if (!key) {
    console.log(`[email/dry-run] to=${p.to} subject=${p.subject}`);
    return { ok: false, error: "no_brevo_key" };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: p.to }],
        subject: p.subject,
        htmlContent: p.htmlContent,
        textContent: p.textContent ?? p.htmlContent.replace(/<[^>]+>/g, ""),
        tags: p.tags ?? [],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn("[email] Brevo error", res.status, data);
      return { ok: false, error: `brevo_${res.status}` };
    }
    return { ok: true, messageId: (data as { messageId?: string }).messageId };
  } catch (err) {
    console.warn("[email] fetch failed", err);
    return { ok: false, error: "fetch_failed" };
  }
}

/* ─── Templates ────────────────────────────────────────────────────────── */

const BRAND_COLOR = "#0e1013";
const ACCENT_COLOR = "#d9a52d";

function baseTemplate(inner: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#fafbfc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0e1013;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafbfc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
        <tr><td style="background:${BRAND_COLOR};padding:20px 32px;color:#fff;font-weight:900;letter-spacing:0.05em;font-size:14px;">
          AIR PLANE STORE
        </td></tr>
        <tr><td style="padding:32px;line-height:1.6;font-size:15px;">
          ${inner}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#f5f6f8;font-size:11px;color:#6b6f75;text-align:center;">
          Air Plane Store — Entreprise française · <a href="https://airplanestore.fr" style="color:#6b6f75;">airplanestore.fr</a><br />
          Vous recevez cet email car vous avez laissé votre adresse sur notre site.
          <a href="https://airplanestore.fr/cookies" style="color:#6b6f75;text-decoration:underline;">Ne plus recevoir</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function cartReminderJ1(cartValue?: number): { subject: string; html: string } {
  const val = cartValue ? ` (${cartValue.toFixed(2)}€)` : "";
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px 0;font-size:22px;">Vous avez oublié quelque chose ✈️</h2>
    <p>Votre panier${val} vous attend. Les stocks partent vite — surtout sur les livrées Air France.</p>
    <p style="margin:24px 0;text-align:center;">
      <a href="https://airplanestore.fr/cart" style="display:inline-block;padding:14px 32px;background:${ACCENT_COLOR};color:#0e1013;font-weight:700;border-radius:999px;text-decoration:none;">
        Reprendre mon panier →
      </a>
    </p>
    <p style="color:#6b6f75;font-size:13px;">Livraison offerte dès 100€ · Retour gratuit 30 jours · Entreprise française.</p>
  `);
  return { subject: "Votre panier vous attend chez Air Plane Store", html };
}

export function cartReminderJ3(cartValue?: number): { subject: string; html: string } {
  const val = cartValue ? ` (${cartValue.toFixed(2)}€)` : "";
  const html = baseTemplate(`
    <h2 style="margin:0 0 12px 0;font-size:22px;">−10% pour finaliser votre panier</h2>
    <p>Votre panier${val} est encore là. On vous offre <strong>10% de réduction</strong> avec le code :</p>
    <p style="margin:24px auto;text-align:center;">
      <span style="display:inline-block;padding:12px 24px;background:#fff8e1;border:2px dashed ${ACCENT_COLOR};font-family:monospace;font-size:20px;font-weight:900;letter-spacing:0.1em;color:${BRAND_COLOR};border-radius:8px;">
        TAKEOFF10
      </span>
    </p>
    <p style="text-align:center;">
      <a href="https://airplanestore.fr/cart" style="display:inline-block;padding:14px 32px;background:${ACCENT_COLOR};color:#0e1013;font-weight:700;border-radius:999px;text-decoration:none;">
        Utiliser mon −10% →
      </a>
    </p>
    <p style="color:#6b6f75;font-size:13px;">Code valable 48h · Livraison offerte dès 100€ · Retour 30j.</p>
  `);
  return { subject: "−10% sur votre panier (48h) ✈️", html };
}

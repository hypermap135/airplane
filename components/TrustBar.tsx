const ITEMS = [
  "✈ +2 000 clients satisfaits",
  "★★★★★ 4.9 / 5",
  "Livraison offerte dès 100€",
  "Satisfait ou remboursé 30 jours",
  "47 cm · Résine monobloc",
  "LED intégré rechargeable USB",
  "Paiement 3x sans frais",
  "Emballage premium offert",
];

const PAYMENT_METHODS = [
  { label: "Visa",      width: 38 },
  { label: "MC",        width: 30 },
  { label: "CB",        width: 26 },
  { label: "PayPal",    width: 48 },
  { label: "Apple Pay", width: 52 },
];

export default function TrustBar() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div style={{ background: "#06060f" }}>
      {/* Payment strip */}
      <div className="flex items-center justify-center gap-3 px-6 py-2.5 flex-wrap"
        style={{
          borderTop: "1px solid rgba(58,142,255,0.08)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}>
        <span className="font-mono text-[0.57rem] tracking-[0.18em] uppercase shrink-0" style={{ color: "#3a4055" }}>
          Paiement sécurisé :
        </span>
        {PAYMENT_METHODS.map(pm => (
          <div key={pm.label}
            className="inline-flex items-center justify-center px-2.5 py-1 font-mono text-[0.6rem] font-bold"
            style={{
              borderRadius: 5,
              minWidth: pm.width,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.04em",
            }}>
            {pm.label}
          </div>
        ))}
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.07)" }} />
        <span className="font-mono text-[0.57rem] tracking-[0.14em] uppercase" style={{ color: "#3a4055" }}>
          🔒 SSL 256-bit
        </span>
      </div>

      {/* Marquee */}
      <div className="relative overflow-hidden"
        style={{ borderBottom: "1px solid rgba(58,142,255,0.08)" }}>
        {/* Fade edges */}
        <div aria-hidden className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{
          background: "linear-gradient(90deg, #06060f 0%, transparent 100%)",
        }} />
        <div aria-hidden className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{
          background: "linear-gradient(270deg, #06060f 0%, transparent 100%)",
        }} />

        <div className="marquee-track py-3.5">
          {tripled.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 shrink-0"
              style={{ margin: "0 2rem" }}
            >
              <span className="font-mono text-[0.6rem]" style={{ color: "rgba(58,142,255,0.35)" }}>✦</span>
              <span className="font-mono text-[0.6rem] tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.22)" }}>
                {label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

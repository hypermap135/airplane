const ITEMS = [
  "+2 000 passionnés",
  "4.9 / 5 ★★★★★",
  "Livraison offerte dès 100€",
  "Satisfait ou remboursé 30 jours",
  "47 cm · Résine monobloc",
  "LED intégré USB",
  "Échelle 1/147",
  "Emballage premium",
];

export default function TrustBar() {
  const tripled = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden" style={{
      background: "#06060f",
      borderTop: "1px solid rgba(58,142,255,0.08)",
      borderBottom: "1px solid rgba(58,142,255,0.08)",
    }}>
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
  );
}

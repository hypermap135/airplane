const ITEMS = [
  { label: "+2 000 passionnés" },
  { label: "4.9 / 5 ★★★★★" },
  { label: "Livraison offerte dès 100€" },
  { label: "Satisfait ou remboursé 30 jours" },
  { label: "47 cm · Résine monobloc" },
  { label: "LED intégré USB" },
  { label: "Échelle 1/147" },
  { label: "Emballage premium" },
];

export default function TrustBar() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="relative border-y border-ink-border bg-ink-800/70 overflow-hidden">
      {/* Fade edges */}
      <div
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #14141f 0%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(270deg, #14141f 0%, transparent 100%)",
        }}
      />

      <div className="marquee-track py-3.5">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 hud text-white/60 shrink-0 mx-6"
          >
            <span className="text-led/50">◆</span>
            <span>{item.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

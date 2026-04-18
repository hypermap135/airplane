export default function TrustBar() {
  return (
    <section className="border-y border-ink-border bg-ink-800/60">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 hud text-white/70">
        <span>+2000 passionnés</span>
        <span className="text-white/15">·</span>
        <span>4.9/5</span>
        <span className="text-white/15">·</span>
        <span>Livraison offerte dès 100€</span>
        <span className="text-white/15">·</span>
        <span>Satisfait ou remboursé 30 jours</span>
      </div>
    </section>
  );
}

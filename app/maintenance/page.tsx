export const metadata = {
  title: "Site en maintenance — AirplaneStore",
  description: "Le site est temporairement en maintenance. Nous serons de retour très vite.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div
          aria-hidden
          className="inline-grid place-items-center rounded-full bg-brand text-white mb-6"
          style={{ width: 64, height: 64, fontSize: "2rem", fontWeight: 900 }}
        >
          ✈
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          AirplaneStore
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-4">
          Nous préparons quelque chose de neuf.
        </h1>
        <p className="text-ink-500 mb-6">
          Le site est temporairement en maintenance pour améliorations. Nous
          serons de retour d&apos;ici quelques heures.
        </p>
        <p className="text-sm text-ink-500">
          Une question urgente ? Écrivez-nous à{" "}
          <a href="mailto:contact@airplanestore.fr" className="text-brand hover:text-brand-dark underline">
            contact@airplanestore.fr
          </a>
        </p>
      </div>
    </div>
  );
}

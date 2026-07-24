import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-5 bg-white">
      <div className="text-center max-w-lg">
        <div className="text-xs font-semibold uppercase tracking-widest text-brand mb-3">
          404 · Signal perdu
        </div>
        <h1 className="h-display text-3xl md:text-4xl mb-3">
          Cap perdu dans les nuages
        </h1>
        <p className="text-ink-500 mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
            Revenir à l&apos;accueil
          </Link>
          <Link href="/collections/all" className="btn-secondary" style={{ textDecoration: "none" }}>
            Voir la collection
          </Link>
        </div>
      </div>
    </section>
  );
}

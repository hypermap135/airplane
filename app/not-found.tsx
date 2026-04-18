import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        <div className="hud text-led">404 · SIGNAL PERDU</div>
        <h1 className="display mt-4 text-4xl chrome-text">Cap perdu dans les nuages</h1>
        <p className="mt-4 text-mute">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="btn-chrome">Revenir à l'accueil</Link>
          <Link href="/collections/all" className="btn-ghost">Voir la collection</Link>
        </div>
      </div>
    </section>
  );
}

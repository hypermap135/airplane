import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import ContentEditor from "./ContentEditor";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Contenu du site · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  const content = await getSiteContent();
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem 6rem" }}>
      <div style={{ marginBottom: "1.4rem" }}>
        <Link
          href="/admin"
          style={{ fontSize: "0.75rem", color: "rgba(58,142,255,0.8)", textDecoration: "none" }}
        >
          ← Catalogue
        </Link>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: 6, letterSpacing: "-0.02em" }}>
          Contenu du site
        </h1>
        <p style={{ marginTop: 4, fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
          Modifiez le hero d'accueil, les cas d'entreprise et la FAQ. Changements visibles sur le site en ~30 s.
        </p>
      </div>
      <ContentEditor initial={content} />
    </main>
  );
}

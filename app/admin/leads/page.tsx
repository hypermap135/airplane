import Link from "next/link";
import { listLeads } from "@/lib/leads-store";
import LeadsTable from "./LeadsTable";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Leads · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLeadsPage() {
  const leads = await listLeads();
  const sorted = [...leads].sort((a, b) => b.createdAt - a.createdAt);
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
          Leads captés
        </h1>
        <p style={{ marginTop: 4, fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>
          {sorted.length} lead{sorted.length > 1 ? "s" : ""} · panier abandonné + newsletter · rappels J+1 / J+3 automatiques (cron) ou envoi manuel ci-dessous.
        </p>
      </div>
      <LeadsTable initial={sorted} />
    </main>
  );
}

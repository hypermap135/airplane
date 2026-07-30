"use client";

/**
 * Bouton flottant "↗ voir fiche publique" pour les cards du dashboard admin.
 *
 * Doit être un client component car il utilise onClick pour stopPropagation
 * (empêche le clic de propager au <Link> parent qui va vers /admin/[handle]).
 * Sans stopPropagation, l'utilisateur ouvre 2 onglets à chaque clic.
 */
export default function ViewFicheChip({ handle, title }: { handle: string; title: string }) {
  return (
    <a
      href={`/products/${handle}`}
      target="_blank"
      rel="noopener"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Voir la fiche publique de ${title}`}
      title="Voir la fiche publique dans un nouvel onglet"
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: 28,
        height: 28,
        display: "grid",
        placeItems: "center",
        borderRadius: 8,
        background: "rgba(58,142,255,0.15)",
        color: "rgba(58,142,255,0.9)",
        border: "1px solid rgba(58,142,255,0.35)",
        fontSize: 14,
        textDecoration: "none",
        zIndex: 2,
      }}
    >
      ↗
    </a>
  );
}

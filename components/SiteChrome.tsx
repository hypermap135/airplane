"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";

// Composants non critiques au premier rendu — chargés après hydratation.
// CartDrawer : previously lazy → causait 200-500ms de délai au premier
// clic "Ajouter au panier" (téléchargement du chunk + hydratation).
// Repassé en import statique — le drawer reste caché tant que
// setOpen(true) n'est pas appelé, donc rendu instantané au clic.
import CartDrawer from "./CartDrawer";
// WhatsAppButton : ancré en bas, pas critique — lazy OK
// Toaster : vide tant qu'on n'a pas déclenché de toast — lazy OK
const WhatsAppButton = dynamic(() => import("./WhatsAppButton"), { ssr: false });
const Toaster        = dynamic(() => import("./Toaster"),        { ssr: false });

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <Toaster />
    </>
  );
}

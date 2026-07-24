"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Header from "./Header";
import Footer from "./Footer";

// Composants non critiques au premier rendu — chargés après hydratation.
// CartDrawer ne s'affiche qu'à l'ouverture ; WhatsAppButton est ancré en
// bas de page ; Toaster est vide tant qu'on n'a pas déclenché de toast.
const CartDrawer     = dynamic(() => import("./CartDrawer"),     { ssr: false });
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

"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppButton from "./WhatsAppButton";
import Toaster from "./Toaster";

/**
 * Wraps every page with the public-site chrome (header / footer / cart
 * drawer) EXCEPT on /admin/*.
 *
 * ScrollProgress + SmoothScroll (Lenis) + ExitIntentModal removed as part
 * of the client-requested "épuré" redesign — they were dark-themed
 * gadgets that clashed with the airmodels-style light theme.
 */
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

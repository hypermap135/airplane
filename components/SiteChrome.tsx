"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import SmoothScroll from "./SmoothScroll";
import ScrollProgress from "./ScrollProgress";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

/**
 * Wraps every page with the public-site chrome (smooth scroll, scroll
 * progress bar, header, footer, cart drawer) EXCEPT on /admin/* routes,
 * where we just render the children naked. Without this, the admin login
 * page shows the topbar + nav + cart, which (a) is visual noise the
 * operator doesn't need, (b) breaks the dark "boutique admin" look,
 * (c) lets the smooth-scroll wrapper intercept clicks on form fields.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // Admin routes get their own layout (app/admin/layout.tsx). No site
    // chrome at all — just the page.
    return <>{children}</>;
  }

  return (
    <SmoothScroll>
      <ScrollProgress />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </SmoothScroll>
  );
}

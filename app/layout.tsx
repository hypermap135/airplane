import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const mono  = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "AirplaneStore — Maquettes d'avion en résine premium",
    template: "%s · AirplaneStore",
  },
  description:
    "Répliques fidèles en résine monobloc. Échelle 1/147. LED intégré. Livraison France & Europe. Satisfait ou remboursé 30 jours.",
  metadataBase: new URL("https://airplanestore.fr"),
  openGraph: {
    title: "AirplaneStore — Maquettes d'avion en résine premium",
    description:
      "Répliques fidèles en résine monobloc. Échelle 1/147. LED intégré. Livraison France & Europe.",
    type: "website",
    locale: "fr_FR",
    siteName: "AirplaneStore",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${space.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {/* Unregister any stale Shopify service worker. No cache clearing,
            no reload — Next.js already busts caches via hashed filenames. */}
        <Script id="sw-cleanup" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(regs) {
              regs.forEach(function(r) { r.unregister(); });
            }).catch(function(){});
          }
        `}</Script>

        {/* Meta Pixel — loads after interactive, only if env var is set */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${META_PIXEL_ID}');
            fbq('track','PageView');
          `}</Script>
        )}

        <SmoothScroll>
          <ScrollProgress />
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </SmoothScroll>
      </body>
    </html>
  );
}

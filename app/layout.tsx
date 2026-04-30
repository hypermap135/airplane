import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScroll from "@/components/SmoothScroll";

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
  metadataBase: new URL("https://shop.airplanestore.fr"),
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

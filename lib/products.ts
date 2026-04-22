export type Collection =
  | "airbus"
  | "boeing"
  | "concorde"
  | "jet"
  | "packs"
  | "accessoires";

export type Product = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  subtitle?: string;
  price: number;
  compareAt?: number;
  collection: Collection;
  inStock: boolean;
  image: string;
  images?: string[];
  bestseller?: boolean;
  scale?: string;
};

export const COLLECTIONS: { slug: Collection; label: string }[] = [
  { slug: "airbus", label: "Airbus" },
  { slug: "boeing", label: "Boeing" },
  { slug: "concorde", label: "Concorde" },
  { slug: "jet", label: "Jet privé" },
  { slug: "packs", label: "Packs" },
  { slug: "accessoires", label: "Accessoires" },
];

const CDN = "https://airplanestore.fr/cdn/shop/files";

export const PRODUCTS: Product[] = [
  // ── Airbus ────────────────────────────────────────────────────────────────
  {
    id: "a380-af",
    variantId: "50833322279252",
    handle: "maquette-avion-maquette-airbus-a380",
    title: "Airbus A380 Air France",
    subtitle: "Quadriréacteur long-courrier — livrée Air France",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a380-airfrance.jpg`,
    bestseller: true,
    scale: "1/147",
  },
  {
    id: "a350-af",
    variantId: "50905226379604",
    handle: "maquette-avion-maquette-airbus-a350-airfrance",
    title: "Airbus A350 Air France",
    subtitle: "Long-courrier nouvelle génération",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a350-airfrance.jpg`,
    bestseller: true,
    scale: "1/147",
  },
  {
    id: "a321-af",
    variantId: "50902114730324",
    handle: "a-321",
    title: "Airbus A321 Air France",
    subtitle: "Version allongée — livrée Air France",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a321-airfrance.jpg`,
    scale: "1/147",
  },
  {
    id: "a320-af",
    variantId: "53357075595604",
    handle: "a320-neo",
    title: "Airbus A320 Air France",
    subtitle: "Moyen-courrier de référence — livrée Air France",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a320-neo.jpg`,
    scale: "1/147",
  },
  {
    id: "a320-new-livery-af",
    variantId: "53492404945236",
    handle: "airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 New Livery Air France",
    subtitle: "Nouvelle livrée — finition premium",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a320-livree-af.jpg`,
    scale: "1/147",
  },
  {
    id: "a320-qatar-psg",
    variantId: "53519416721748",
    handle: "copie-airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 Qatar × PSG",
    subtitle: "Livrée sponsor — édition PSG",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/a320-qatar-psg.jpg`,
    scale: "1/147",
  },

  // ── Boeing ────────────────────────────────────────────────────────────────
  {
    id: "b737-ryanair",
    variantId: "50905345753428",
    handle: "boeing-737-ryannair",
    title: "Boeing 737 Ryanair",
    subtitle: "Moyen-courrier low-cost iconique",
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/b737-ryanair.jpg`,
    scale: "1/147",
  },
  {
    id: "b777-af",
    variantId: "50833361797460",
    handle: "boeing-777",
    title: "Boeing 777 Air France",
    subtitle: "Long-courrier bi-réacteur — livrée Air France",
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/b777-airfrance.jpg`,
    bestseller: true,
    scale: "1/147",
  },
  {
    id: "b787-af",
    variantId: "52227315794260",
    handle: "boeing-787",
    title: "Boeing 787 Air France",
    subtitle: "Dreamliner nouvelle génération — livrée Air France",
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/b787-dreamliner.jpg`,
    bestseller: true,
    scale: "1/147",
  },

  // Concorde
  {
    id: "concorde-af-125",
    variantId: "50833485365588",
    handle: "concorde-airfrance",
    title: "Concorde Air France (1/125)",
    subtitle: "Supersonique — livrée Air France",
    price: 89,
    collection: "concorde",
    inStock: true,
    image: `${CDN}/concorde-af-125.jpg`,
    scale: "1/125",
  },
  {
    id: "concorde-af-200",
    variantId: "52159686738260",
    handle: "concorde-airfrance-200",
    title: "Concorde Air France (1/200)",
    subtitle: "Format compact — livrée Air France",
    price: 59,
    collection: "concorde",
    inStock: true,
    image: `${CDN}/concorde-af-200.jpg`,
    scale: "1/200",
  },
  {
    id: "concorde-ba",
    variantId: "50833477108052",
    handle: "concorde-british",
    title: "Concorde British Airways",
    subtitle: "Livrée British Airways",
    price: 59,
    collection: "concorde",
    inStock: true,
    image: `${CDN}/concorde-british.jpg`,
    scale: "1/200",
  },

  // Jet
  {
    id: "gulfstream-g650",
    variantId: "50905389334868",
    handle: "gulfstream-g650",
    title: "Gulfstream G650",
    subtitle: "Jet d'affaires longue distance",
    price: 89,
    collection: "jet",
    inStock: true,
    image: `${CDN}/gulfstream-g650.jpg`,
    scale: "1/147",
  },

  // Packs
  {
    id: "pack-prestige-af",
    variantId: "53576782217556",
    handle: "pack-prestige-air-france",
    title: "Pack Prestige Air France",
    subtitle: "Trois maquettes Air France réunies",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `${CDN}/pack-prestige-af.jpg`,
    bestseller: true,
  },
  {
    id: "pack-airbus",
    variantId: "53577728786772",
    handle: "pack-collection-airbus",
    title: "Pack Collection Airbus",
    subtitle: "Trois Airbus emblématiques",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `${CDN}/pack-airbus.jpg`,
  },
  {
    id: "pack-boeing",
    variantId: "53577463529812",
    handle: "pack-collection-boeing",
    title: "Pack Collection Boeing",
    subtitle: "Trois Boeing emblématiques",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `${CDN}/pack-boeing.jpg`,
  },
  {
    id: "pack-duo",
    variantId: "53575762608468",
    handle: "pack-duo-airbus-boeing",
    title: "Pack Duo Airbus & Boeing",
    subtitle: "Un Airbus, un Boeing",
    price: 149,
    compareAt: 178,
    collection: "packs",
    inStock: true,
    image: `${CDN}/pack-duo.jpg`,
  },

  // Accessoires
  {
    id: "portecle-af-crew",
    variantId: "53842722357588",
    handle: "porte-cle-af-crew",
    title: "Porte-clé AF Crew",
    subtitle: "Métal brossé",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/portecle-af-crew.jpg`,
  },
  {
    id: "horloge-turbine",
    variantId: "53842911625556",
    handle: "horloge-turbine",
    title: "Horloge Turbine",
    subtitle: "Design réacteur d'avion",
    price: 14.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/horloge-turbine.jpg`,
  },
  {
    id: "portecle-avion-jet",
    variantId: "53842945343828",
    handle: "porte-cle-avion-jet",
    title: "Porte-clé Avion Jet",
    subtitle: "Métal brossé",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/portecle-jet.jpg`,
  },
  {
    id: "portecle-moteur",
    variantId: "53842964906324",
    handle: "porte-cle-moteur-avion",
    title: "Porte-clé Moteur Avion",
    subtitle: "Métal brossé",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/portecle-moteur.jpg`,
  },
  {
    id: "gravure",
    variantId: "53749941698900",
    handle: "gravure-personnalisee",
    title: "Gravure personnalisée",
    subtitle: "Nom, date ou immatriculation sur le socle",
    price: 15,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/gravure.jpg`,
  },
  {
    id: "horloge-murale",
    variantId: "50833535271252",
    handle: "horloge-murale",
    title: "Horloge Murale",
    subtitle: "Décoration aéronautique",
    price: 15.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/horloge-murale.jpg`,
  },
];

export function formatPrice(n: number): string {
  const isWhole = n % 1 === 0;
  const str = isWhole ? `${n}` : n.toFixed(2).replace(".", ",");
  return `${str}€`;
}

export function byCollection(slug: Collection): Product[] {
  return PRODUCTS.filter((p) => p.collection === slug);
}

export function getProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function related(product: Product, limit = 4): Product[] {
  return PRODUCTS.filter(
    (p) => p.collection === product.collection && p.id !== product.id && p.inStock,
  ).slice(0, limit);
}

export function sortForDisplay(items: Product[]): Product[] {
  return [...items].sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return 0;
  });
}

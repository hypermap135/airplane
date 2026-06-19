export type Collection =
  | "airbus"
  | "boeing"
  | "concorde"
  | "jet"
  | "chasse"
  | "packs"
  | "accessoires";

export type ProductSpec = { label: string; value: string };

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
  comingSoon?: boolean;
  image: string;
  images?: string[];
  bestseller?: boolean;
  scale?: string;
  /** Per-product spec sheet shown on the product page. When undefined,
   *  ProductDetail falls back to a shared default. Editable from /admin. */
  specs?: ProductSpec[];
  /** Free-form long description editable from /admin. When set, replaces
   *  the marketing block on the product page. */
  description?: string;
};

export const COLLECTIONS: { slug: Collection; label: string }[] = [
  { slug: "airbus",      label: "Airbus" },
  { slug: "boeing",      label: "Boeing" },
  { slug: "concorde",    label: "Concorde" },
  { slug: "chasse",      label: "Aviation militaire" },
  { slug: "jet",         label: "Jet privé" },
  { slug: "packs",       label: "Packs" },
  { slug: "accessoires", label: "Accessoires" },
];

const CDN = "https://cdn.shopify.com/s/files/1/0921/9312/8788/files";

export const PRODUCTS: Product[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // AIRBUS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "a220-af",
    variantId: "55663325446484",
    handle: "airbus-a220-air-france",
    title: "Airbus A220 Air France",
    subtitle: "A220-300 · livrée Air France · activation au toucher",
    price: 99,
    collection: "airbus",
    inStock: true,
    comingSoon: false,
    image: `/images/airbus-a220-air-france.png`,
    images: [
      `/images/airbus-a220-air-france.png`,
    ],
    bestseller: false,
    scale: "1/100",
  },
  {
    id: "a320-af",
    variantId: "53357075595604",
    handle: "a320-neo",
    title: "Airbus A320 Air France",
    subtitle: "Moyen-courrier de référence — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/a320-neo.png`,
    images: [
      `/images/a320-neo.png`,
      `/images/a320-neo--3quarter-front.png`,
      `/images/a320-neo--3quarter-rear.png`,
      `/images/a320-neo--top.png`,
      `/images/a320-neo--shelf.png`,
      `/images/a320-neo--desk.png`,
    ],
    bestseller: false,
    scale: "1/85",
  },
  {
    id: "a320-new-livery-af",
    variantId: "53492404945236",
    handle: "airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 New Livery Air France",
    subtitle: "Nouvelle livrée 2021 — finition premium",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/airbus-a320-echelle-1-85-finition-premium.png`,
    images: [
      `/images/airbus-a320-echelle-1-85-finition-premium.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-front.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--3quarter-rear.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--top.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--shelf.png`,
      `/images/airbus-a320-echelle-1-85-finition-premium--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "a320-neo-transavia",
    variantId: "0",
    handle: "airbus-a320-neo-transavia",
    title: "Airbus A320 Néo Transavia",
    subtitle: "Livrée Transavia — A320 Néo, échelle 1/100",
    price: 99,
    collection: "airbus",
    // Awaiting real Transavia photo from the client (uploaded via Notion).
    // Keep as coming-soon until the photo lands; otherwise the product card
    // would show an Air France livery for a Transavia title.
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a320-neo-transavia.png`,
    scale: "1/100",
  },
  {
    id: "a320-qatar-psg",
    variantId: "53519416721748",
    handle: "copie-airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 Qatar PSG Livery",
    subtitle: "Livrée sponsor — édition Paris Saint-Germain",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/copie-airbus-a320-echelle-1-85-finition-premium.png`,
    images: [
      `/images/copie-airbus-a320-echelle-1-85-finition-premium.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-front.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--3quarter-rear.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--top.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--shelf.png`,
      `/images/copie-airbus-a320-echelle-1-85-finition-premium--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "a321-af",
    variantId: "50902114730324",
    handle: "a-321",
    title: "Airbus A321 Air France",
    subtitle: "Version allongée — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/a-321.png`,
    images: [
      `/images/a-321.png`,
      `/images/a-321--3quarter-front.png`,
      `/images/a-321--3quarter-rear.png`,
      `/images/a-321--top.png`,
      `/images/a-321--shelf.png`,
      `/images/a-321--desk.png`,
    ],
    scale: "1/100",
  },
  {
    id: "a321-easyjet",
    variantId: "0",
    handle: "airbus-a321-easyjet",
    title: "Airbus A321 EasyJet",
    subtitle: "Livrée orange — EasyJet",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a321-easyjet.png`,
    scale: "1/100",
  },
  {
    id: "a350-af",
    variantId: "50905226379604",
    handle: "maquette-avion-maquette-airbus-a350-airfrance",
    title: "Airbus A350 Air France",
    subtitle: "Long-courrier nouvelle génération — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/maquette-avion-maquette-airbus-a350-airfrance.png`,
    images: [
      `/images/airbus-a321-easyjet.png`,
      `/images/airbus-a321-easyjet--3quarter-front.png`,
      `/images/airbus-a321-easyjet--3quarter-rear.png`,
      `/images/airbus-a321-easyjet--top.png`,
      `/images/airbus-a321-easyjet--shelf.png`,
      `/images/airbus-a321-easyjet--desk.png`,
    ],
    bestseller: false,
    scale: "1/142",
  },
  {
    id: "a350-singapore",
    variantId: "0",
    handle: "airbus-a350-singapore",
    title: "Airbus A350 Singapore Airlines",
    subtitle: "Long-courrier — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-singapore.png`,
    scale: "1/142",
  },
  {
    id: "a350-iberia",
    variantId: "0",
    handle: "airbus-a350-iberia",
    title: "Airbus A350 Iberia",
    subtitle: "Long-courrier — livrée Iberia",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-iberia.png`,
    scale: "1/142",
  },
  {
    id: "a350-emirates",
    variantId: "0",
    handle: "airbus-a350-emirates",
    title: "Airbus A350 Emirates",
    subtitle: "Long-courrier — livrée Emirates",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a350-emirates.png`,
    scale: "1/142",
  },
  {
    id: "a380-af",
    variantId: "50833322279252",
    handle: "maquette-avion-maquette-airbus-a380",
    title: "Airbus A380 Air France",
    subtitle: "Quadriréacteur long-courrier — livrée Air France",
    price: 99,
    collection: "airbus",
    inStock: true,
    image: `/images/maquette-avion-maquette-airbus-a380.png`,
    images: [
      `/images/airbus-a350-iberia.png`,
      `/images/airbus-a350-iberia--3quarter-front.png`,
      `/images/airbus-a350-iberia--3quarter-rear.png`,
      `/images/airbus-a350-iberia--top.png`,
      `/images/airbus-a350-iberia--shelf.png`,
      `/images/airbus-a350-iberia--desk.png`,
    ],
    bestseller: true,
    scale: "1/160",
  },
  {
    id: "a380-singapore",
    variantId: "0",
    handle: "airbus-a380-singapore",
    title: "Airbus A380 Singapore Airlines",
    subtitle: "Géant des airs — livrée Singapore Airlines",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a380-singapore.png`,
    images: [`${CDN}/Airbus_A380_Singapore_Airlines_nobg.png`],
    scale: "1/160",
  },
  {
    id: "a380-emirates",
    variantId: "0",
    handle: "airbus-a380-emirates",
    title: "Airbus A380 Emirates",
    subtitle: "Géant des airs — livrée Emirates",
    price: 99,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `/images/airbus-a380-emirates.png`,
    images: [`/images/a380-emirates.png`],
    scale: "1/160",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BOEING
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "b737-ryanair",
    variantId: "50905345753428",
    handle: "boeing-737-ryannair",
    title: "Boeing 737 Ryanair",
    subtitle: "Moyen-courrier low-cost iconique",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-737-ryannair.png`,
    images: [
      `/images/boeing-737-ryannair.png`,
      `/images/boeing-737-ryannair--3quarter-front.png`,
      `/images/boeing-737-ryannair--3quarter-rear.png`,
      `/images/boeing-737-ryannair--top.png`,
      `/images/boeing-737-ryannair--shelf.png`,
      `/images/boeing-737-ryannair--desk.png`,
    ],
    scale: "1/85",
  },
  {
    id: "b747-af",
    variantId: "53357386531156",
    handle: "maquette-avion-maquette-boeing-747",
    title: "Boeing 747 Air France",
    subtitle: "Le Jumbo Jet — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/maquette-avion-maquette-boeing-747.png`,
    images: [
      `${CDN}/4BC16D16-D848-4680-A696-696A31D55734_nobg.png`,
      `${CDN}/5EB799A1-252C-46DA-A84D-7A90C6B9C5F7.png`,
      `/images/b747-afo-styled.png`,
    ],
    bestseller: true,
    scale: "1/150",
  },
  {
    id: "b747-afo",
    variantId: "0",
    handle: "boeing-747-air-force-one",
    title: "Boeing 747 Air Force One",
    subtitle: "L'avion présidentiel américain — livrée officielle",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-747-air-force-one.png`,
    scale: "1/150",
  },
  {
    id: "b777-af",
    variantId: "50833361797460",
    handle: "boeing-777",
    title: "Boeing 777 Air France",
    subtitle: "Long-courrier bi-réacteur — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-777.png`,
    images: [
      `${CDN}/B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png`,
      `${CDN}/F59AA5BE-6A56-4A85-BBFA-C0D853DB46E4.png`,
      `${CDN}/77243CA8-261E-4B68-B7C1-533B08FEF3BA.png`,
    ],
    bestseller: false,
    scale: "1/157",
  },
  {
    id: "b777-qatar",
    variantId: "0",
    handle: "boeing-777-qatar",
    title: "Boeing 777 Qatar World",
    subtitle: "Long-courrier — livrée Qatar Airways World Cup",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-777-qatar.png`,
    scale: "1/157",
  },
  {
    id: "b787-af",
    variantId: "50905378586964",
    handle: "boeing-787",
    title: "Boeing 787 Air France",
    subtitle: "Dreamliner nouvelle génération — livrée Air France",
    price: 99,
    collection: "boeing",
    inStock: true,
    image: `/images/boeing-787.png`,
    images: [
      `/images/b787-af.png`,
      `${CDN}/3F025660-25C7-422C-A7A0-B6C007CA2C42.png`,
      `${CDN}/CBDFF9B5-964E-49BE-BA66-88261109488F.png`,
    ],
    bestseller: false,
    scale: "1/130",
  },
  {
    id: "b787-lufthansa",
    variantId: "0",
    handle: "boeing-787-lufthansa-100th",
    title: "Boeing 787 Lufthansa 100th",
    subtitle: "Dreamliner — édition 100 ans Lufthansa",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-787-lufthansa-100th.png`,
    scale: "1/130",
  },
  {
    id: "b787-etihad",
    variantId: "0",
    handle: "boeing-787-etihad-manchester-city",
    title: "Boeing 787 Etihad Manchester City",
    subtitle: "Dreamliner — livrée Etihad × Manchester City",
    price: 99,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `/images/boeing-787-etihad-manchester-city.png`,
    scale: "1/130",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // JET PRIVÉ
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "gulfstream-g650",
    variantId: "50905389334868",
    handle: "jet-prive",
    title: "Gulfstream G650",
    subtitle: "Jet d'affaires longue distance — finition premium",
    price: 99,
    collection: "jet",
    inStock: true,
    image: `/images/jet-prive.png`,
    images: [
      `/images/gulfstream-g650.png`,
      `${CDN}/E34D3EBD-5CFE-4A70-B0A1-E8323877B55D.png`,
      `${CDN}/89D9E034-C710-45BE-AF1B-C1125A52A890.png`,
    ],
    scale: "1/75",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // CONCORDE
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "concorde-af-50",
    variantId: "50833485365588",
    handle: "concorde-airfrance",
    title: "Concorde 50 cm Air France",
    subtitle: "Supersonique légendaire — livrée Air France · 50 cm",
    price: 99,
    collection: "concorde",
    inStock: true,
    image: `/images/concorde-airfrance.png`,
    images: [
      `/images/concorde-af-50.png`,
      `${CDN}/51AA0205-B8D3-436A-A8C3-3EC854A7E05E.png`,
      `${CDN}/EADAEF26-88AC-4AB3-8A47-4135892B980D.png`,
    ],
    scale: "1/125",
  },
  {
    id: "concorde-ba-50",
    variantId: "50833477108052",
    handle: "concorde-british",
    title: "Concorde 50 cm British Airways",
    subtitle: "Supersonique légendaire — livrée British Airways · 50 cm",
    price: 99,
    collection: "concorde",
    inStock: true,
    image: `/images/concorde-british.png`,
    images: [
      `/images/concorde-ba-50.png`,
      `${CDN}/9909E902-39B4-4FB1-94DD-D125FF9C516D.png`,
      `${CDN}/PHOTO-2024-11-20-14-31-56_1.jpg`,
    ],
    scale: "1/125",
  },
  {
    id: "concorde-af-30",
    variantId: "0",
    handle: "concorde-airfrance-30cm",
    title: "Concorde 1/200 Air France",
    subtitle: "Format compact 1/200 — livrée Air France",
    price: 59,
    collection: "concorde",
    inStock: true,
    comingSoon: false,
    image: `/images/concorde-airfrance-30cm.png`,
    scale: "1/200",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // PACKS
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "pack-prestige-af",
    variantId: "53576782217556",
    handle: "pack-prestige-air-france",
    title: "Pack Prestige Air France",
    subtitle: "A380 + A350 + 777 — trois icônes Air France",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `${CDN}/1C22E355-7DE6-46E2-A665-53491B42E69B_nobg.png`,
    images: [
      `${CDN}/1C22E355-7DE6-46E2-A665-53491B42E69B_nobg.png`,
      `${CDN}/A3EB5B58-0063-41BF-84DB-D39C72E6466E.png`,
      `${CDN}/8ED448B8-6083-4E27-909D-CC18CD1742D0.png`,
    ],
    bestseller: true,
  },
  {
    id: "pack-airbus",
    variantId: "53577728786772",
    handle: "pack-trio-airbus-premium-a320-a350-a380",
    title: "Pack Collection Airbus",
    subtitle: "A320 + A350 + A380 — la flotte Airbus réunie",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `/images/pack-trio-airbus-premium-a320-a350-a380.png`,
    images: [
      `${CDN}/0DD70AD8-A997-4B31-8A95-0DBBA2C32358_nobg.png`,
      `${CDN}/63D5AD62-E1FF-48B8-B7FD-F1AADA6987A0.png`,
      `${CDN}/324BDF52-8AC7-45D0-B8D8-285ADCDC1E67.png`,
    ],
  },
  {
    id: "pack-boeing",
    variantId: "53577463529812",
    handle: "pack-collection-boeing",
    title: "Pack Collection Boeing",
    subtitle: "747 + 777 + 787 — la flotte Boeing réunie",
    price: 249,
    compareAt: 267,
    collection: "packs",
    inStock: true,
    image: `${CDN}/7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png`,
    images: [
      `${CDN}/7FA23F23-9A53-4EB8-A584-36B12C7C84BB_nobg_v2.png`,
      `${CDN}/90A8AC17-FE60-4BED-91D4-4086FAD9448B.png`,
      `${CDN}/1AD928A7-1A25-4C97-A73C-815AD78F98C7.png`,
    ],
  },
  {
    id: "pack-duo",
    variantId: "53575762608468",
    handle: "pack-duo",
    title: "Pack Duo Airbus & Boeing",
    subtitle: "Un Airbus + Un Boeing — offre idéale duo",
    price: 149,
    compareAt: 178,
    collection: "packs",
    inStock: true,
    image: `${CDN}/B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png`,
    images: [
      `${CDN}/B1CB0E59-0EA0-4AC4-9E68-5CD63B6AEA8F_nobg_v2.png`,
      `${CDN}/AC009271-46B9-45C0-8B9A-F361820858F9.jpg`,
      `${CDN}/F147607F-A27D-44EC-92D7-21A4B6A0B497.jpg`,
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ACCESSOIRES
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: "portecle-af-crew",
    variantId: "53842722357588",
    handle: "accessoires-aviation-en-metal",
    title: "Porte-clé Air France Tag-Crew",
    subtitle: "Métal brossé — collection AF Crew",
    price: 4.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/D1FC9309-F3A3-46FE-9F1F-7612F7CBAC54_nobg.png`,
    images: [
      `${CDN}/D1FC9309-F3A3-46FE-9F1F-7612F7CBAC54_nobg.png`,
      `${CDN}/01C2DF70-B230-429F-8A58-CA08EB987ED9.png`,
      `${CDN}/E3EAE3DC-B130-4541-B60C-7E22BA304D0F.jpg`,
    ],
  },
  {
    id: "horloge-turbine",
    variantId: "53842911625556",
    handle: "flamme-en-tissu-brode",
    title: "Accessoires Aviation en Métal",
    subtitle: "Collection métal brossé — décoration aéronautique",
    price: 14.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/IMG-7037_nobg.png`,
    images: [
      `${CDN}/IMG-7037_nobg.png`,
      `${CDN}/1F1264FD-AA41-4D9D-ABC1-1B1242B09859.png`,
      `${CDN}/633CDBEE-D7A2-428B-B9DD-10039EDC5E2C.png`,
    ],
  },
  {
    id: "horloge-murale",
    variantId: "50833535271252",
    handle: "horloge-mural",
    title: "Horloge Murale Aéronautique",
    subtitle: "Décoration murale — design réacteur",
    price: 15.9,
    collection: "accessoires",
    inStock: true,
    image: `${CDN}/AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png`,
    images: [
      `${CDN}/AD184BA4-005E-4FB9-B9FC-0A8B97709210_nobg_v2.png`,
      `${CDN}/FD6A72D0-8AE3-4C49-965D-939F3EAF42E0.jpg`,
      `${CDN}/F758E57F-8DE1-48A7-8855-45722BBED144.jpg`,
    ],
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
    image: `${CDN}/IMG-7011_nobg.png`,
    images: [
      `${CDN}/IMG-7011_nobg.png`,
      `${CDN}/F1FA1DE1-5FEA-418F-AD88-659D0583F334.jpg`,
    ],
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
    if (a.bestseller !== b.bestseller) return a.bestseller ? -1 : 1;
    return 0;
  });
}

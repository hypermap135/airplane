export type Collection =
  | "airbus"
  | "boeing"
  | "concorde"
  | "jet"
  | "chasse"
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
  comingSoon?: boolean;
  image: string;
  images?: string[];
  bestseller?: boolean;
  scale?: string;
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
    price: 89,
    collection: "airbus",
    inStock: true,
    comingSoon: false,
    image: `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_7_nobg.png`,
    images: [
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_7_nobg.png`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_8.jpg`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_9.jpg`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_10.jpg`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_11.jpg`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_12.jpg`,
      `${CDN}/WhatsApp_Image_2026-04-23_at_18.23.27_13.jpg`,
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
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `/images/a320-af.png`,
    images: [
      `/images/a320-af.png`,
      `${CDN}/Airbus_A320_Air_France.png`,
      `${CDN}/Airbus_A320_nouvelle_Livr_e.png`,
    ],
    bestseller: true,
    scale: "1/85",
  },
  {
    id: "a320-new-livery-af",
    variantId: "53492404945236",
    handle: "airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 New Livery Air France",
    subtitle: "Nouvelle livrée 2021 — finition premium",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/CD86650C-845D-487B-9A81-2CA67C80A28A_nobg.png`,
    images: [
      `${CDN}/CD86650C-845D-487B-9A81-2CA67C80A28A_nobg.png`,
      `${CDN}/6FEC6314-FD59-470D-A4EC-8720B8E532BC.png`,
      `${CDN}/D0ABD2B2-5602-49B7-8742-D92C5EE29B4C.png`,
    ],
    scale: "1/85",
  },
  {
    id: "a320-wizzair",
    variantId: "0",
    handle: "airbus-a320-wizzair",
    title: "Airbus A320 Wizzair",
    subtitle: "Livrée rose iconique — Wizz Air",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A320_Air_France_nobg.png`,
    scale: "1/85",
  },
  {
    id: "a320-qatar-psg",
    variantId: "53519416721748",
    handle: "copie-airbus-a320-echelle-1-85-finition-premium",
    title: "Airbus A320 Qatar PSG Livery",
    subtitle: "Livrée sponsor — édition Paris Saint-Germain",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/IMG-7237_nobg.png`,
    images: [
      `${CDN}/IMG-7237_nobg.png`,
      `${CDN}/IMG-7236.png`,
      `${CDN}/IMG-7235.png`,
    ],
    scale: "1/85",
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
    image: `${CDN}/031DDDDC-70E9-43CC-B424-BB7BBC77F75B_nobg.png`,
    images: [
      `${CDN}/031DDDDC-70E9-43CC-B424-BB7BBC77F75B_nobg.png`,
      `${CDN}/B188003A-5D11-4532-9611-A4D0701A63A9.png`,
    ],
    scale: "1/100",
  },
  {
    id: "a321-easyjet",
    variantId: "0",
    handle: "airbus-a321-easyjet",
    title: "Airbus A321 EasyJet",
    subtitle: "Livrée orange — EasyJet",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/031DDDDC-70E9-43CC-B424-BB7BBC77F75B_nobg.png`,
    scale: "1/100",
  },
  {
    id: "a350-af",
    variantId: "50905226379604",
    handle: "maquette-avion-maquette-airbus-a350-airfrance",
    title: "Airbus A350 Air France",
    subtitle: "Long-courrier nouvelle génération — livrée Air France",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/Airbus_A350_Air_France_cote_gauche_nobg.png`,
    images: [
      `${CDN}/Airbus_A350_Air_France_cote_gauche_nobg.png`,
      `${CDN}/Airbus_A350_Air_France.jpg`,
      `${CDN}/Airbus_A350_Turkish_Airlines.png`,
    ],
    bestseller: true,
    scale: "1/142",
  },
  {
    id: "a350-singapore",
    variantId: "0",
    handle: "airbus-a350-singapore",
    title: "Airbus A350 Singapore Airlines",
    subtitle: "Long-courrier — livrée Singapore Airlines",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A350_Air_France_cote_gauche_nobg.png`,
    scale: "1/142",
  },
  {
    id: "a350-iberia",
    variantId: "0",
    handle: "airbus-a350-iberia",
    title: "Airbus A350 Iberia",
    subtitle: "Long-courrier — livrée Iberia",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A350_Air_France_cote_gauche_nobg.png`,
    scale: "1/142",
  },
  {
    id: "a350-emirates",
    variantId: "0",
    handle: "airbus-a350-emirates",
    title: "Airbus A350 Emirates",
    subtitle: "Long-courrier — livrée Emirates",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A350_Air_France_cote_gauche_nobg.png`,
    scale: "1/142",
  },
  {
    id: "a380-af",
    variantId: "50833322279252",
    handle: "maquette-avion-maquette-airbus-a380",
    title: "Airbus A380 Air France",
    subtitle: "Quadriréacteur long-courrier — livrée Air France",
    price: 89,
    collection: "airbus",
    inStock: true,
    image: `${CDN}/Airbus_A380_AIR_FRANCE_nobg.png`,
    images: [
      `${CDN}/Airbus_A380_AIR_FRANCE_nobg.png`,
      `${CDN}/Airbus_A380_Singapore_Airlines_nobg.png`,
      `${CDN}/Airbus_A380_Emirates_nobg.png`,
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
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A380_Singapore_Airlines_nobg.png`,
    images: [`${CDN}/Airbus_A380_Singapore_Airlines_nobg.png`],
    scale: "1/160",
  },
  {
    id: "a380-emirates",
    variantId: "0",
    handle: "airbus-a380-emirates",
    title: "Airbus A380 Emirates",
    subtitle: "Géant des airs — livrée Emirates",
    price: 89,
    collection: "airbus",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/Airbus_A380_Emirates_nobg_v3.png`,
    images: [`${CDN}/Airbus_A380_Emirates_nobg_v3.png`],
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
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg_v2.png`,
    images: [
      `${CDN}/5EF8FED8-8EAF-4191-934E-A558A9A1D6EF_nobg_v2.png`,
      `${CDN}/E8277CEB-78E8-48AB-8008-6B62206AA825.png`,
      `${CDN}/703A5142-90D6-407C-BE6D-978D8C6385FB.png`,
    ],
    scale: "1/85",
  },
  {
    id: "b747-af",
    variantId: "53357386531156",
    handle: "maquette-avion-maquette-boeing-747",
    title: "Boeing 747 Air France",
    subtitle: "Le Jumbo Jet — livrée Air France",
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/4BC16D16-D848-4680-A696-696A31D55734_nobg.png`,
    images: [
      `${CDN}/4BC16D16-D848-4680-A696-696A31D55734_nobg.png`,
      `${CDN}/5EB799A1-252C-46DA-A84D-7A90C6B9C5F7.png`,
      `${CDN}/E60D6B2E-4B4D-4EC9-9535-835754C02FAD.png`,
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
    price: 89,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/4BC16D16-D848-4680-A696-696A31D55734_nobg.png`,
    scale: "1/150",
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
    image: `${CDN}/B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png`,
    images: [
      `${CDN}/B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png`,
      `${CDN}/F59AA5BE-6A56-4A85-BBFA-C0D853DB46E4.png`,
      `${CDN}/77243CA8-261E-4B68-B7C1-533B08FEF3BA.png`,
    ],
    bestseller: true,
    scale: "1/157",
  },
  {
    id: "b777-qatar",
    variantId: "0",
    handle: "boeing-777-qatar",
    title: "Boeing 777 Qatar World",
    subtitle: "Long-courrier — livrée Qatar Airways World Cup",
    price: 89,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/B17227E2-BB4C-4D08-A770-B39827FB907C_nobg_v2.png`,
    scale: "1/157",
  },
  {
    id: "b787-af",
    variantId: "50905378586964",
    handle: "boeing-787",
    title: "Boeing 787 Air France",
    subtitle: "Dreamliner nouvelle génération — livrée Air France",
    price: 89,
    collection: "boeing",
    inStock: true,
    image: `${CDN}/7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454_nobg.png`,
    images: [
      `${CDN}/7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454_nobg.png`,
      `${CDN}/3F025660-25C7-422C-A7A0-B6C007CA2C42.png`,
      `${CDN}/CBDFF9B5-964E-49BE-BA66-88261109488F.png`,
    ],
    bestseller: true,
    scale: "1/130",
  },
  {
    id: "b787-lufthansa",
    variantId: "0",
    handle: "boeing-787-lufthansa-100th",
    title: "Boeing 787 Lufthansa 100th",
    subtitle: "Dreamliner — édition 100 ans Lufthansa",
    price: 89,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454_nobg.png`,
    scale: "1/130",
  },
  {
    id: "b787-etihad",
    variantId: "0",
    handle: "boeing-787-etihad-manchester-city",
    title: "Boeing 787 Etihad Manchester City",
    subtitle: "Dreamliner — livrée Etihad × Manchester City",
    price: 89,
    collection: "boeing",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/7B58CC55-7CD7-4BD4-ADD9-E57E9F11E454_nobg.png`,
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
    price: 89,
    collection: "jet",
    inStock: true,
    image: `${CDN}/D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg_v2.png`,
    images: [
      `${CDN}/D056EBB6-7CF5-4F52-9B3E-DD90854A7885_nobg_v2.png`,
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
    price: 89,
    collection: "concorde",
    inStock: true,
    image: `${CDN}/DF8AE5B5-7A2D-4A02-B2BD-118AAF5D58AD_nobg.png`,
    images: [
      `${CDN}/DF8AE5B5-7A2D-4A02-B2BD-118AAF5D58AD_nobg.png`,
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
    price: 89,
    collection: "concorde",
    inStock: true,
    image: `${CDN}/9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg_v2.png`,
    images: [
      `${CDN}/9A131FF0-EAB2-4176-9236-7B2761E44FB5_nobg_v2.png`,
      `${CDN}/9909E902-39B4-4FB1-94DD-D125FF9C516D.png`,
      `${CDN}/PHOTO-2024-11-20-14-31-56_1.jpg`,
    ],
    scale: "1/125",
  },
  {
    id: "concorde-af-30",
    variantId: "0",
    handle: "concorde-airfrance-30cm",
    title: "Concorde 30 cm Air France",
    subtitle: "Format compact — livrée Air France · 30 cm",
    price: 69,
    collection: "concorde",
    inStock: false,
    comingSoon: true,
    image: `${CDN}/DF8AE5B5-7A2D-4A02-B2BD-118AAF5D58AD_nobg.png`,
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
    image: `${CDN}/0DD70AD8-A997-4B31-8A95-0DBBA2C32358_nobg.png`,
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

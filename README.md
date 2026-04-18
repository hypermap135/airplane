# AirplaneStore — Frontend Next.js

Frontend premium pour **airplanestore.fr**, connecté à Shopify via l'API Storefront. Checkout géré par Shopify (`airplanestore.fr/cart/...`).

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- Shopify Storefront API (GraphQL, optionnel — fallback catalogue statique inclus)

## Démarrage local

```bash
npm install
cp .env.local.example .env.local
# renseigner SHOPIFY_STOREFRONT_TOKEN
npm run dev
# http://localhost:3000
```

## Variables d'environnement

| Clé | Valeur |
|-----|--------|
| `SHOPIFY_STORE_DOMAIN` | `y823wg-nz.myshopify.com` |
| `SHOPIFY_STOREFRONT_TOKEN` | token Storefront API (app "Base44 Storefront") |
| `SHOPIFY_PUBLIC_DOMAIN` | `airplanestore.fr` |
| `SHOPIFY_API_VERSION` | `2024-07` |

Le site fonctionne même sans token : le catalogue est servi depuis `lib/products.ts` et le checkout via l'URL publique `airplanestore.fr/cart/...`.

## Structure

```
app/                     App Router
  layout.tsx             layout global (Header, Footer, CartDrawer)
  page.tsx               homepage (7 sections)
  collections/all        catalogue complet
  collections/[slug]     catalogue filtré par collection
  products/[handle]      fiche produit
  a-propos, contact, faq, cgv
components/              UI (Hero, Cards, CartDrawer, ...)
lib/
  products.ts            catalogue + variant IDs Shopify
  shopify.ts             client GraphQL + builder d'URL checkout
  cart.ts                store panier (localStorage + hook React)
tailwind.config.ts       palette "Futuristic Aeronautic"
```

## Checkout

Le bouton "Commander" construit l'URL Shopify :

```
https://airplanestore.fr/cart/{variant_id}:{qty},...?discount=TAKEOFF10
```

(méthode testée et fonctionnelle — pas besoin d'appeler `checkoutCreate`).

Checkout invité → à activer dans Shopify : **Paramètres → Checkout → Continuer en tant qu'invité**.

## Déploiement Vercel

1. `git init && git add . && git commit -m "init"` puis push sur GitHub
2. Importer le repo dans Vercel
3. Ajouter les variables d'environnement (surtout `SHOPIFY_STOREFRONT_TOKEN`)
4. Déployer
5. Dans Vercel → Domains, ajouter `shop.airplanestore.fr`
6. Chez le registrar, changer le CNAME de `shop` de `base44.onrender.com` vers `cname.vercel-dns.com`

## Règles éditoriales (⚠ à respecter)

- **Livraison** : toujours "France & Europe" (jamais "mondiale")
- **Matériau** : "Résine monobloc" (jamais "métal")
- **LED** : "interrupteur sous la maquette" (jamais "claquement de mains")
- **Train d'atterrissage** : "amovible (se met ou s'enlève)"
- **Prix** : `89€` (pas `89.00€`). Décimales avec virgule française uniquement si non-zéro (`4,90€`)
- **Produits épuisés** : toujours en bas des listes, jamais dans les bestsellers
- **Code promo** : `TAKEOFF10` = -10% première commande

## Direction artistique

Noir profond avec dégradé (`#0a0a14 → #14141f`), accents argenté chromé, touches LED cyan `#3a8eff` pour les highlights. Aucun doré, aucun bleu marine, aucun néon agressif. Ambiance "intérieur de première classe".

## Images

Actuellement servies depuis `airplanestore.fr/cdn/shop/files/*` (watermark temporaire). À remplacer par les visuels définitifs côté Shopify : les URL se mettront à jour automatiquement côté frontend.

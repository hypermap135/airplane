# 🛫 AirplaneStore.fr — Agent Customization Guide

Premium e-commerce storefront for aircraft collectibles with Shopify integration, scroll-driven animations, and luxury aerospace design. This guide helps AI agents be immediately productive.

## Quick Start

```bash
npm install                           # Install deps (Next.js 14, GSAP, Framer Motion, Lenis)
cp .env.local.example .env.local      # Create .env.local (see Variables section)
npm run dev                           # Dev on http://localhost:3000
npm run build && npm start            # Production build
npm run lint                          # Check code
```

**Pre-flight checklist**:
- Node 18+
- `.env.local` with `SHOPIFY_STOREFRONT_TOKEN` (from Shopify "Base44 Storefront" app)
- Lenis smooth scroll enabled globally in SmoothScroll provider—don't add native scroll

## Environment Variables

| Variable | Value | Required? | Usage |
|----------|-------|-----------|-------|
| `SHOPIFY_STORE_DOMAIN` | `y823wg-nz.myshopify.com` | Yes | GraphQL endpoint |
| `SHOPIFY_STOREFRONT_TOKEN` | Shopify Storefront API token | Yes | Public product queries |
| `SHOPIFY_ADMIN_TOKEN` | Shopify Admin API token | No | WhatsApp agent mutations |
| `SHOPIFY_PUBLIC_DOMAIN` | (defaults to `SHOPIFY_STORE_DOMAIN`) | No | Cart/checkout URL — only override if Shopify serves a custom subdomain |
| `SHOPIFY_API_VERSION` | `2024-07` | Yes | Storefront API version |

**Fallback behavior**: Without `SHOPIFY_STOREFRONT_TOKEN`, products load from static `lib/products.ts` and checkout uses permalink URLs. Site is functional but not real-time.

**⚠ Checkout domain trap**: Do NOT set `SHOPIFY_PUBLIC_DOMAIN=airplanestore.fr`. The Next.js app on Vercel serves that domain and has no `/cart` or `/checkouts` route — the redirect will 404. Shopify must also be configured so `*.myshopify.com` doesn't auto-redirect to `airplanestore.fr` (Shopify admin → Settings → Domains: either remove `airplanestore.fr` from Shopify's domain list, or restore a `shop.airplanestore.fr` subdomain as the Shopify primary).

## Architecture & Key Concepts

### Project Structure

```
app/                           # Next.js App Router
  page.tsx                     # Homepage (7 sections + hero variants)
  collections/all              # Full product catalog
  collections/[collection]     # Filtered catalog
  products/[handle]            # Product detail page
  api/checkout                 # Checkout URL builder (Storefront API fallback)
  api/whatsapp                 # Twilio webhook for Claude agent

components/                    # Reusable React components
  heroes/                      # HeroV1, HeroV2, HeroV3 (modular variants)
  ProductCard.tsx              # Grid item with hover animation
  CinematicReveal.tsx          # Pinned scroll animation
  SmoothScroll.tsx             # Lenis + GSAP ScrollTrigger wrapper
  Header.tsx, Footer.tsx       # Persistent layout

lib/
  products.ts                  # Hardcoded product catalog + variant IDs
  shopify.ts                   # GraphQL client + URL builders
  cart.ts                      # localStorage cart store (React hook)
```

### Data Flow

**Products**: Static catalog in `lib/products.ts` (30+ SKUs) + optional real-time Shopify Storefront API
**Cart**: `useCart()` hook (localStorage-backed, browser-only)
**Checkout**: 
1. POST `/api/checkout` → tries `createCartCheckoutUrl()` (Storefront API)
2. Fallback: `airplanestore.fr/cart/{variantId}:{qty}?discount=TAKEOFF10` (works without token)

### Animation Architecture

**GSAP ScrollTrigger** (scroll-driven, pinning, timelines):
- `HeroSection`: Entry timeline + parallax using `useScroll` → `useTransform`
- `CinematicReveal`: Pinned image reveal with scrub
- `ScrollProgress`: Top progress bar
- **Global setup**: GSAP + ScrollTrigger registered in `SmoothScroll` component

**Framer Motion** (declarative component animations):
- `ProductCard`: `whileHover={{ scale: 1.025 }}` spring
- `CartDrawer`: Slide-in/out animation
- Use `motion.*` components for layout shifts

**Lenis smooth scroll**: Synced to GSAP ticker; wraps entire app in layout. Respects `prefers-reduced-motion`.

**Tailwind animations**: `shimmer`, `marquee`, `pulse-led`, `scan-line`, `float`, `drift-*`, `border-glow` (see `tailwind.config.ts`)

## Styling Conventions

### Tailwind Color Palette

```
ink-900: #0a0a14 (deepest black)
ink-800: #14141f, ink-700: #141420, ink-500: #1a1a28
chrome-100: #FFFFFF, chrome-200: #F0F2F5, chrome-300: #D0D4DA
led: #3a8eff (cyan accent for UI highlights)
mute: #A0A4B0 (dimmed text)
```

**Theme**: Dark mode by default. Chrome accents (metallic). LED blue glow for CTAs.

### Font Stack

- **Inter** (body): `font-sans`
- **Space_Grotesk** (headings): `font-display` (futuristic)
- **IBM_Plex_Mono** (specs/code): `font-mono`

### Custom Utilities

- `tracking-hud`: 0.08em letter spacing (HUD-like text)
- `shadow-chrome`: White border + blue glow
- `shadow-led-lg`: Heavy cyan glow (80px spread)
- `bg-card-grad`: Dark gradient cards
- `bg-noise`: SVG turbulence overlay (graininess)

## Common Development Tasks

### Adding a New Product

Edit `lib/products.ts`:
```typescript
{
  id: "new-id",
  handle: "a380-gold",
  title: "Airbus A380 Gold",
  collection: "airbus",
  price: 89,
  variantId: "55663325446484",  // From Shopify admin
  image: "https://airplanestore.fr/cdn/shop/files/...",
  description: "...",
}
```

Run `npm run dev` to see immediately (no rebuild needed).

### Creating a New Hero Variant

1. Create `components/heroes/HeroV4CustomName.tsx`
2. Export component and add to `app/page.tsx` homepage routing
3. Use GSAP + Framer Motion hooks (see `HeroV1FlightDeck.tsx` for pattern)

### Adding a Scroll Animation

Use GSAP `useEffect` + `ScrollTrigger.create()` pattern (see `CinematicReveal.tsx`):
```typescript
useEffect(() => {
  ScrollTrigger.create({
    trigger: ref.current,
    start: "top center",
    onEnter: () => animate()
  });
  return () => ScrollTrigger.getAll().forEach(t => t.kill());
}, []);
```

Or Framer Motion `whileInView` for simpler reveals:
```typescript
<motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
  Content
</motion.div>
```

### Customizing Tailwind

Edit `tailwind.config.ts` → `theme.extend`:
```typescript
colors: { custom: "#abc123" },
animation: { custom: "custom-anim 2s" },
keyframes: { "custom-anim": { "0%": {...}, "100%": {...} } }
```

## Shopify Integration

### Storefront API Flow

**GraphQL queries** in `lib/shopify.ts`:
- `PRODUCT_BY_HANDLE`: Fetch single product (real-time)
- `CART_CREATE`: Create cart + apply discount
- `SEARCH_PRODUCTS`: Search via SKU/title

**Checkout URL builder** (no API):
```typescript
checkoutUrl(items, discount) 
  // Builds: airplanestore.fr/cart/{variant}:{qty}?discount=TAKEOFF10
```

### API Routes

**POST `/api/checkout`** (edge runtime):
- Request: `{ items: [{variantId, quantity}], discount: "TAKEOFF10" }`
- Response: `{ url: "https://airplanestore.fr/cart/..." }`
- Falls back to permalink if token missing

**POST `/api/whatsapp`** (Twilio webhook):
- Requires `SHOPIFY_ADMIN_TOKEN`
- Claude agent interprets `/code` commands to update Shopify inventory/prices

## Editorial Guidelines (⚠️ Must Respect)

When writing product descriptions or copy:

- **Livraison**: Always "France & Europe" (never "worldwide")
- **Matériau**: Always "Résine monobloc" (never "metal")
- **LED**: Always "switch under model" (never "hand clap activation")
- **Landing gear**: Always "removable (attaches/detaches)"
- **Price format**: `89€` (no decimals if zero); use French comma if non-zero: `4,90€`
- **Out-of-stock items**: Always appear at bottom of lists; never in bestsellers
- **Discount code**: `TAKEOFF10` = 10% off first order

## Design Principles

**Aesthetic**: Luxury first-class cabin. Deep black with chrome accents. Cyan LED highlights. No gold, no navy blue, no aggressive neon.

**Performance**: 
- Images from Shopify CDN (auto-update if URL changes server-side)
- SSG for product pages; ISR for collections
- Lazy load images (except hero images: use `loading="eager"`)
- GSAP's `matchMedia()` respects accessibility preferences

## Critical Gotchas

1. **Lenis removes native scroll** — don't re-enable; sync all animations to ScrollTrigger
2. **ScrollTrigger not auto-refreshing** — manually call `ScrollTrigger.refresh()` after DOM changes
3. **Missing Storefront token** — site still loads (fallback to static catalog), but Storefront API queries silently fail
4. **LocalStorage cart** — doesn't persist between browsers; SSR cart is empty
5. **GSAP timelines** — always clean up with `return () => timeline?.kill()` in useEffect
6. **Framer Motion + scroll** — use `useScroll` inside component wrapped in `SmoothScroll`; don't nest multiple `useScroll` hooks
7. **Tailwind + custom gradients** — use `bg-gradient-to-r from-X to-Y` or add to config; inline gradients won't work with PurgeCSS

## Deployment (Vercel)

1. Push repo to GitHub
2. Import in Vercel, add env vars (especially `SHOPIFY_STOREFRONT_TOKEN`)
3. In Vercel → Domains, add `shop.airplanestore.fr` CNAME → `cname.vercel-dns.com`
4. At DNS registrar, update shop subdomain CNAME
5. `npm run build` locally first to verify (check for `next` cache)

**Vercel-specific**:
- Functions (API routes) run in Edge Runtime by default
- ISR revalidation: `revalidate: 3600` on product pages (1 hour)

## Dependencies at a Glance

| Package | Version | Usage |
|---------|---------|-------|
| Next.js | 14.2.5 | SSR/SSG framework |
| React | 18.3.1 | Components |
| TypeScript | 5.4.5 | Type safety |
| GSAP | 3.15.0 | Scroll animations (ScrollTrigger) |
| Framer Motion | 11.0.0 | Declarative animations |
| Motion | 12.38.0 | Motion library (alt) |
| Lenis | 1.3.23 | Smooth scroll provider |
| Tailwind CSS | 3.4.4 | Styling |
| Twilio | (latest) | WhatsApp webhook |
| @anthropic-ai/sdk | (latest) | Claude agent (WhatsApp) |

## Code Quality

- **ESLint**: `npm run lint`
- **TypeScript**: Strict mode enabled (`tsconfig.json`)
- **Formatting**: Prettier configured in `package.json`

## When Things Break

| Issue | Solution |
|-------|----------|
| Page scrolls jankily | Check Lenis + ScrollTrigger sync in `SmoothScroll`; run `ScrollTrigger.refresh()` |
| Animations don't trigger | Verify component is inside `SmoothScroll` wrapper; check GSAP console for conflicts |
| Product images missing | Verify Shopify token in `.env.local`; fallback to static catalog still works |
| Checkout URL fails | POST `/api/checkout` fallback creates permalink—this should always work |
| Tailwind classes not applying | Run `npm run dev` (watches config); check PurgeCSS isn't removing dynamic classes |
| Build fails on Vercel | Verify all env vars are set; check `next build` locally first |

---

**Questions?** Check [README.md](README.md) for project philosophy, [lib/shopify.ts](lib/shopify.ts) for API client, or [tailwind.config.ts](tailwind.config.ts) for design system.

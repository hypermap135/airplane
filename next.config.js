/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Auto-serve modern formats — clients that accept AVIF get the smallest
    // file, falling back to WebP, then JPEG/PNG. ~40-60% smaller payload.
    formats: ["image/avif", "image/webp"],

    // Generated srcset breakpoints. Tighter than the default array — keeps
    // images sharp without wasting bandwidth on huge variants the cards
    // never reach.
    deviceSizes: [320, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes:  [64, 96, 128, 192, 256, 384, 512],

    // 1 minute minimum cache to avoid re-optimizing on every refresh.
    minimumCacheTTL: 60,

    remotePatterns: [
      { protocol: "https", hostname: "airplanestore.fr" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      // Vercel Blob URLs used by the /admin uploads.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
    // NOTE : ne PAS exclure public/images/** — l'optimiseur next/image lit
    // les sources depuis le bundle de la fonction. Excluded, il renvoie 400
    // sur /_next/image?url=/images/... et les hero images restent grises.
    // Si le bundle serverless dépasse 250 MB, chercher d'autres cibles.
    outputFileTracingExcludes: {
      "*": [
        ".tmp/**",
        "scripts/**",
        ".next/cache/**",
        "node_modules/@next/swc-*/**",
        "node_modules/@esbuild/**",
      ],
    },
  },
};

module.exports = nextConfig;

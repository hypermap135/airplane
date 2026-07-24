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
    // NOTE : public/images/** ne DOIT PAS être exclu globalement — le
    // handler /_next/image (serverless sur Vercel) lit les sources depuis
    // le trace du bundle, sinon renvoie 400 et les Image restent grises.
    // On l'exclut UNIQUEMENT des routes admin où on n'en a pas besoin,
    // pour tenir sous la limite de 250 MB par fonction.
    outputFileTracingExcludes: {
      "*": [
        ".tmp/**",
        "scripts/**",
        ".next/cache/**",
        "node_modules/@next/swc-*/**",
        "node_modules/@esbuild/**",
      ],
      "/admin/**":     ["public/images/**"],
      "/api/admin/**": ["public/images/**"],
    },
  },
};

module.exports = nextConfig;

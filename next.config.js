/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "airplanestore.fr" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
  experimental: { optimizePackageImports: ["gsap"] },
};

module.exports = nextConfig;

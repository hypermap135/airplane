import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a0a14",
          800: "#14141f",
          700: "#141420",
          600: "#12121c",
          500: "#1a1a28",
          border: "#2a2a3a",
        },
        chrome: {
          100: "#FFFFFF",
          200: "#F0F2F5",
          300: "#D0D4DA",
          400: "#C8CCD0",
        },
        led: "#3a8eff",
        mute: "#A0A4B0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space)", "var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: { hud: "0.08em", wide2: "0.16em" },
      backgroundImage: {
        "chrome-grad": "linear-gradient(135deg, #D0D4DA 0%, #F0F2F5 50%, #FFFFFF 100%)",
        "chrome-text": "linear-gradient(180deg, #F0F2F5 0%, #C8CCD0 100%)",
        "ink-grad": "linear-gradient(180deg, #0a0a14 0%, #14141f 100%)",
        "card-grad": "linear-gradient(160deg, #12121c 0%, #14141f 100%)",
        noise: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.06'/></svg>\")",
      },
      boxShadow: {
        chrome: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px -10px rgba(58,142,255,0.25)",
        "chrome-hover": "0 0 0 1px rgba(255,255,255,0.14), 0 20px 60px -12px rgba(58,142,255,0.45)",
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        "fade-up": "fadeUp 0.7s ease-out both",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

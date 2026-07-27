import type { Config } from "tailwindcss";

/**
 * Airmodels-inspired light theme.
 *
 * Palette : pure white base, royal blue primary, neutral gray for photo tiles,
 * solid black CTAs, yellow "Featured" badge, green in-stock. No chrome, no
 * gradient, no neon glow.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#c9a24b",   // or (remplace le bleu royal — feedback client 27/07/2026)
          dark:    "#8a6b1f",
          light:   "#fbf3dc",
          bar:     "#1476df",
        },
        tile: {
          DEFAULT: "#eeeeee",
          dark:    "#e2e4e8",
        },
        ink: {
          900: "#0a0a14",
          700: "#2a2a35",
          500: "#5c6270",
          300: "#b0b5c0",
          line: "rgba(10,10,20,0.08)",
        },
        accent: {
          yellow: "#f0c040",
        },
        status: {
          green: "#12a55b",
          red:   "#c93030",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;

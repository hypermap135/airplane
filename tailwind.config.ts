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
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
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
        "led-sm": "0 0 20px rgba(58,142,255,0.4)",
        "led-md": "0 0 50px rgba(58,142,255,0.55), 0 0 100px rgba(58,142,255,0.2)",
        "led-lg": "0 0 80px rgba(58,142,255,0.7), 0 0 160px rgba(58,142,255,0.35)",
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        "fade-up": "fadeUp 0.7s ease-out both",
        marquee: "marquee 32s linear infinite",
        "marquee-slow": "marquee 50s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-delayed": "float 9s ease-in-out infinite 2.5s",
        "pulse-led": "pulseLed 2.4s ease-in-out infinite",
        "blink": "blink 1.4s ease-in-out infinite",
        "scan-line": "scanLine 6s linear infinite",
        "drift-1": "drift1 20s ease-in-out infinite",
        "drift-2": "drift2 25s ease-in-out infinite",
        "drift-3": "drift3 18s ease-in-out infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-14px) rotate(0.5deg)" },
          "66%": { transform: "translateY(-6px) rotate(-0.5deg)" },
        },
        pulseLed: {
          "0%, 100%": {
            opacity: "0.5",
            boxShadow: "0 0 20px rgba(58,142,255,0.3), inset 0 0 20px rgba(58,142,255,0.08)",
          },
          "50%": {
            opacity: "1",
            boxShadow: "0 0 70px rgba(58,142,255,0.7), 0 0 140px rgba(58,142,255,0.3), inset 0 0 50px rgba(58,142,255,0.25)",
          },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.15" },
        },
        scanLine: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        drift1: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "25%": { transform: "translate(80px, -60px) scale(1.1)" },
          "50%": { transform: "translate(-40px, 80px) scale(0.95)" },
          "75%": { transform: "translate(60px, 40px) scale(1.05)" },
        },
        drift2: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(-70px, 50px) scale(1.08)" },
          "66%": { transform: "translate(90px, -70px) scale(0.92)" },
        },
        drift3: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(-50px, -80px) scale(1.12)" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(58,142,255,0.15)" },
          "50%": { borderColor: "rgba(58,142,255,0.5)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

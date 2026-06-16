import type { Config } from "tailwindcss";

/**
 * Design system — "Exaggerated Minimalism", dark.
 * Colours live as raw RGB channels in CSS vars (app/globals.css) so Tailwind's
 * `<alpha-value>` opacity modifiers work everywhere (e.g. bg-accent/10).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        "background-center": "rgb(var(--background-center) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        // Hairline borders = foreground at 12%.
        border: "rgb(var(--foreground) / 0.12)",
      },
      fontFamily: {
        // Apple's type system: real SF Pro on Apple devices, Inter elsewhere.
        display: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "var(--font-sans)",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "var(--font-sans)",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.3em",
        // Apple's display tracking is tight but not extreme.
        tightest: "-0.022em",
      },
      maxWidth: {
        path: "1200px",
      },
      boxShadow: {
        "card-hover": "0 24px 60px -24px rgba(0,0,0,0.7)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-soft": "cubic-bezier(0.64, 0, 0.78, 0)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

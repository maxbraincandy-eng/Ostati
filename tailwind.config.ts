import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0D10",
        graphite: {
          DEFAULT: "#12151A",
          light: "#161A21",
          card: "#171B22",
          border: "#262C36",
        },
        gold: {
          DEFAULT: "#D4A94F",
          light: "#E8C87C",
          dark: "#A87F2E",
        },
        muted: "#9AA3AF",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans Georgian",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 30px rgba(0,0,0,0.35)",
        gold: "0 4px 24px rgba(212,169,79,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;

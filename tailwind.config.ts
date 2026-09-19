import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        cursive: ["var(--font-cursive)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        gs: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          900: "#7c2d12",
        },
        ce2: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          900: "#1e3a8a",
        },
      },
      spacing: {
        "creneau-min": "2.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

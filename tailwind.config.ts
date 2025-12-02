import type { Config } from "tailwindcss";
// @ts-ignore
import daisyui from "daisyui";

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        yena: {
          "primary": "#C44536", // Terracotta Red (from logo)
          "secondary": "#F39C12", // Orange (from logo)
          "accent": "#8B3A3A", // Dark Red/Brown (from logo text)
          "neutral": "#3E2723", // Dark Brown
          "base-100": "#FFFFFF", // White
          "info": "#3ABFF8",
          "success": "#10B981", // Clean Green
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      "light",
      "dark",
    ],
  },
};
export default config;

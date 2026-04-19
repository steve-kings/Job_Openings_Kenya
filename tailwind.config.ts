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
        "jobs1000": {
          "primary": "#1976D2",
          "secondary": "#4CAF50",
          "accent": "#1565C0",
          "neutral": "#3E2723",
          "base-100": "#FFFFFF",
          "info": "#3ABFF8",
          "success": "#4CAF50",
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

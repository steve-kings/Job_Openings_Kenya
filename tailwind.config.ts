// @ts-expect-error daisyui lacks TypeScript declarations
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
        "jobopeningskenya": {
          "primary": "#5CB800",
          "secondary": "#C8A882",
          "accent": "#4A9900",
          "neutral": "#3E2723",
          "base-100": "#FFFFFF",
          "info": "#3ABFF8",
          "success": "#5CB800",
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

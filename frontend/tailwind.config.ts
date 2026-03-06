import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Defining 'brand' to match the Button variants
        brand: {
          50: '#eff6ff',
          600: '#2563eb', // This is the blue color for the primary button
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
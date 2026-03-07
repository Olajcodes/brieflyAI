import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate"; // Fix: adds animate-in, fade-in, slide-in-from-* classes

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6', // Fix: was missing — used in focus:ring-brand-500
          600: '#2563eb',
          700: '#1d4ed8',
        },
        slate: {
          // Fix: bg-slate-25 doesn't exist in Tailwind — adding it here
          25: '#f8fafc',
        },
      },
      keyframes: {
        // Fix: animate-fade-in-up used in SummaryDisplay but not defined
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [typography, animate],
};

export default config;
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A', // Deep Navy
          light: '#1E293B',
          dark: '#020617',
        },
        accent: {
          DEFAULT: '#6366F1', // Electric Indigo
          light: '#818CF8',
          dark: '#4F46E5',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        sora: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

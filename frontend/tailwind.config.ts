import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0A192F',
          dark: '#0D2137',
          blue: '#1E3A8A',
          accent: '#2563EB',
          light: '#F8FAFC',
          border: '#E2E8F0',
          darkBorder: '#1E293B',
          darkCard: '#111E38',
          darkBg: '#091122'
        }
      }
    },
  },
  plugins: [],
};
export default config;


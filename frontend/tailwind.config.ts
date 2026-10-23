import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'craze-red': '#C30D1A',
        'craze-red-dark': '#8F0A13',
        'craze-amber': '#FDBC5A',
        'craze-cream': '#FDEFDA',
        'craze-dark': '#2B0A0C',
      },
      fontFamily: {
        heading: ['var(--font-bebas)', 'var(--font-oswald)', 'sans-serif'],
        serif: ['var(--font-lora)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'chunky': '0 6px 0 0 #8F0A13',
        'chunky-sm': '0 3px 0 0 #8F0A13',
        'chunky-amber': '0 6px 0 0 #D99532',
        'note': '2px 4px 10px rgba(43, 10, 12, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;

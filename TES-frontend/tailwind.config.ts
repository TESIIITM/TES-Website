import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: 'oklch(0.105 0 0)', 900: 'oklch(0.15 0 0)' },
        signal: { 400: 'oklch(0.965 0.008 95)' },
        ivory: 'oklch(0.965 0.008 95)',
      },
      fontFamily: { sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
} satisfies Config;

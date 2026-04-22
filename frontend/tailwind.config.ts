import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Colores de categorías — no purgar nunca (se asignan dinámicamente desde lib/api.ts)
  safelist: [
    'bg-amber-500',
    'bg-blue-600',
    'bg-red-600',
    'bg-green-600',
    'bg-orange-500',
    'bg-purple-600',
    'bg-sky-600',
    'bg-pink-500',
    'bg-gray-500',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
          800: '#881337',
          900: '#4c0519',
        },
        accent: {
          light:   '#4b9fd4',
          DEFAULT: '#1a6fad',
          dark:    '#14578a',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        heading: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

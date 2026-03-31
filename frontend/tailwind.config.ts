import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
          900: '#881337',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config

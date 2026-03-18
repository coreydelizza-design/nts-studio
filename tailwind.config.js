/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        nts: {
          bg: '#060a13',
          deep: '#0a0f1c',
          card: 'rgba(12,19,35,0.75)',
          glass: 'rgba(15,23,42,0.55)',
          panel: 'rgba(10,16,30,0.9)',
          border: 'rgba(51,65,85,0.4)',
          accent: '#38bdf8',
        },
      },
    },
  },
  plugins: [],
}

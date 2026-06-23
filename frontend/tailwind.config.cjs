/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          400: '#4ade80',
          500: '#22c55e',
          700: '#15803d',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
};

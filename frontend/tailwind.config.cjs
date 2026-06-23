/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: 'rgb(var(--color-bg-primary) / <alpha-value>)',
          surface: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
          elevated: 'rgb(var(--color-bg-elevated) / <alpha-value>)',
          border: 'rgb(var(--color-border) / <alpha-value>)',
          text: 'rgb(var(--color-text-primary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          surface: 'rgb(var(--color-success-surface) / <alpha-value>)',
          text: 'rgb(var(--color-success-text) / <alpha-value>)',
          border: 'rgb(var(--color-success-border) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          surface: 'rgb(var(--color-warning-surface) / <alpha-value>)',
          text: 'rgb(var(--color-warning-text) / <alpha-value>)',
          border: 'rgb(var(--color-warning-border) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          surface: 'rgb(var(--color-danger-surface) / <alpha-value>)',
          text: 'rgb(var(--color-danger-text) / <alpha-value>)',
          border: 'rgb(var(--color-danger-border) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};

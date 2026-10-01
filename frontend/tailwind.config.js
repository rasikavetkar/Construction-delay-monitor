/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf2',
          100: '#faf4e1',
          200: '#f4e5b8',
          300: '#edd186',
          400: '#e5b853',
          500: '#f59e0b', // Construction Amber / Gold
          600: '#d97706',
          700: '#b45309',
        },
        navy: {
          850: '#0d192e',
          900: '#0a1324',
          950: '#060d1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

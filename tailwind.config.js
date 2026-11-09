/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'] },
      colors: {
        forest: { 50: '#ecfdf3', 100: '#d1fae0', 400: '#34c472', 500: '#16a35a', 600: '#0f8a4a', 700: '#0d6e3c', 900: '#0a3b22' },
        teal2: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488' },
        sand: { 100: '#fbf3e0', 200: '#f5e3b8', 300: '#ecd08a', 400: '#deb862', 500: '#c99a3e' },
        snow: '#f7fbff',
      },
      boxShadow: { card: '0 6px 20px -6px rgba(10,59,34,.25)' },
    },
  },
  plugins: [],
};

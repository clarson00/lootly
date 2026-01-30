/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',
        secondary: '#10b981',
        dark: '#0f0f1a',
        'dark-light': '#1a1a2e'
      }
    },
  },
  plugins: [],
}

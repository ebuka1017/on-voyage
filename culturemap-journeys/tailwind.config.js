/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 0.5s ease-in-out infinite',
        'pulse-green': 'pulse 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
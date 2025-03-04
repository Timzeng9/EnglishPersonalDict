/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#F0F4EF',
        'secondary': '#FFFFFF',
        'accent': '#B0BEC5',
        'text-primary': '#263238',
        'text-secondary': '#607D8B',
      },
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

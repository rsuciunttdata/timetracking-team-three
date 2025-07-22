/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        cutomWhite: "#f8f8f8"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        clash: ['"Clash Display"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

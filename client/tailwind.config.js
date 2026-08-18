/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        ja: ['"Noto Sans JP"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

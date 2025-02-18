/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ts,jsx,tsx,mdx}",
    "!./node_modules/**",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
};

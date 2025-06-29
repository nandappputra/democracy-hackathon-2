/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',  // Scan all React component files
  ],
  theme: {
    extend: {},
  },
  safelist: [
    {
      pattern: /(bg|text|from|to)-(blue|yellow|green|pink)-(100|600)/,
    },
  ],
  plugins: [],
};

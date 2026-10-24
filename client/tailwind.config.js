/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        hazard: {
          low: '#22c55e',
          moderate: '#eab308',
          high: '#f97316',
          critical: '#dc2626',
        },
      },
    },
  },
  plugins: [],
};

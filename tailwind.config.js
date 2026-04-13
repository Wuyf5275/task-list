/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.4)',
          dark: 'rgba(30, 30, 30, 0.4)',
        }
      },
      borderRadius: {
        'squircle': '24px',
        'squircle-sm': '12px',
      },
      boxShadow: {
        'apple': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'apple-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      }
    },
  },
  plugins: [],
}

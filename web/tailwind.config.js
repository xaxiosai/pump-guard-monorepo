/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#15161B",
        foreground: "#fafafae6",
        primary: "#A4E3A1",
        'border-primary': "#2C2D32",
      },
      spacing: {
        content: 'clamp(1.25rem, (100vw - 1000px) * 99, 2rem)',
      }
    },
  },
  plugins: [],
}

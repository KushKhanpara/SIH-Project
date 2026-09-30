/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        brand: "#0f766e",
        brand2: "#14b8a6",
        sand: "#f7f5ef"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(15, 23, 42, .08)"
      }
    }
  },
  plugins: []
}

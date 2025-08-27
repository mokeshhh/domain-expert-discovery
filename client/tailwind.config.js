/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
      'bg': 'var(--bg-color)',
      'text': 'var(--text-color)',
      'card': 'var(--card-bg)',
    }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lem-dark': 'var(--bg-dark)',
        'lem-sidebar': 'var(--sidebar-bg)',
        'lem-accent': 'var(--accent)',
        'lem-glass': 'var(--glass-bg)',
        'lem-glass-border': 'var(--glass-border)',
        'level-seeds': 'var(--color-seeds)',
        'level-seekers': 'var(--color-seekers)',
        'level-warriors': 'var(--color-warriors)',
      },
      fontFamily: {
        'sans': ['Outfit', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

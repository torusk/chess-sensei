module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chess-light': '#f0d9b5',
        'chess-dark': '#b58863',
        'accent': '#4f46e5',
        'accent-hover': '#4338ca',
        'bg-primary': '#fafafa',
        'bg-secondary': '#f5f5f5',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

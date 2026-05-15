/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#060a0f',
        surface: '#141e2a',
        surface2: '#1a2535',
        accent: '#00d4ff',
        accent2: '#7c3aed',
        accent3: '#10b981',
        accent4: '#f59e0b',
        accent5: '#ef4444',
      },
      fontFamily: {
        sans: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

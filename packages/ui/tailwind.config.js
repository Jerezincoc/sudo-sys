/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f1fb',
          100: '#c5d9f4',
          200: '#9ebfec',
          300: '#77a5e4',
          400: '#5991de',
          500: '#3b7dd8',
          600: '#1e6bb8',   // primary
          700: '#185895',
          800: '#114471',
          900: '#0a304e',
        },
        surface: {
          900: '#0f1117',   // app background
          800: '#1a1d27',   // card / sidebar
          700: '#222536',   // input / panel
          600: '#2d3148',   // hover
          500: '#3d4260',   // border
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

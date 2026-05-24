/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'erp-app':      'var(--color-bg-app)',
        'erp-panel':    'var(--color-bg-panel)',
        'erp-ribbon':   'var(--color-bg-ribbon)',
        'erp-white':    'var(--color-bg-white)',
        'erp-brand':    'var(--color-brand)',
        'erp-border':   'var(--color-border-main)',
        'erp-muted':    'var(--color-text-muted)',
        'erp-add':      'var(--color-btn-add)',
        'erp-del':      'var(--color-btn-del)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}

export type ThemeKey = 'dark' | 'light'

type TokenMap = Record<string, string>

const dark: TokenMap = {
  // ── Brand ─────────────────────────────────────────────────────────────
  '--brand-50':  '#e8f1fb',
  '--brand-100': '#c5d9f4',
  '--brand-400': '#5991de',
  '--brand-500': '#3b7dd8',
  '--brand-600': '#1e6bb8',
  '--brand-700': '#185895',
  '--brand-800': '#114471',
  '--brand-900': '#0a304e',

  // ── Superfícies ────────────────────────────────────────────────────────
  '--surface-900': '#0f1117',
  '--surface-800': '#1a1d27',
  '--surface-700': '#222536',
  '--surface-600': '#2d3148',
  '--surface-500': '#3d4260',

  // ── Texto ──────────────────────────────────────────────────────────────
  '--text-primary':   '#f1f5f9',
  '--text-secondary': '#94a3b8',
  '--text-muted':     '#64748b',
  '--text-inverse':   '#0f172a',

  // ── Bordas ─────────────────────────────────────────────────────────────
  '--border':       '#3d4260',
  '--border-focus': '#3b7dd8',

  // ── Status ─────────────────────────────────────────────────────────────
  '--success': '#22c55e',
  '--warning': '#f59e0b',
  '--danger':  '#ef4444',
  '--info':    '#38bdf8',

  // ── Sidebar ────────────────────────────────────────────────────────────
  '--sidebar-bg':         '#1a1d27',
  '--sidebar-border':     '#3d4260',
  '--sidebar-item-hover': '#2d3148',
  '--sidebar-item-active-bg': '#1e3a5f',
  '--sidebar-item-active-text': '#60a5fa',

  // ── Topbar ─────────────────────────────────────────────────────────────
  '--topbar-bg':     '#1a1d27',
  '--topbar-border': '#3d4260',
}

const light: TokenMap = {
  // ── Brand ─────────────────────────────────────────────────────────────
  '--brand-50':  '#eff6ff',
  '--brand-100': '#dbeafe',
  '--brand-400': '#60a5fa',
  '--brand-500': '#3b82f6',
  '--brand-600': '#1e6bb8',
  '--brand-700': '#1d4ed8',
  '--brand-800': '#1e40af',
  '--brand-900': '#1e3a8a',

  // ── Superfícies ────────────────────────────────────────────────────────
  '--surface-900': '#f1f5f9',
  '--surface-800': '#ffffff',
  '--surface-700': '#f8fafc',
  '--surface-600': '#e2e8f0',
  '--surface-500': '#cbd5e1',

  // ── Texto ──────────────────────────────────────────────────────────────
  '--text-primary':   '#0f172a',
  '--text-secondary': '#475569',
  '--text-muted':     '#94a3b8',
  '--text-inverse':   '#f1f5f9',

  // ── Bordas ─────────────────────────────────────────────────────────────
  '--border':       '#e2e8f0',
  '--border-focus': '#3b82f6',

  // ── Status ─────────────────────────────────────────────────────────────
  '--success': '#16a34a',
  '--warning': '#d97706',
  '--danger':  '#dc2626',
  '--info':    '#0284c7',

  // ── Sidebar ────────────────────────────────────────────────────────────
  '--sidebar-bg':         '#ffffff',
  '--sidebar-border':     '#e2e8f0',
  '--sidebar-item-hover': '#f1f5f9',
  '--sidebar-item-active-bg': '#dbeafe',
  '--sidebar-item-active-text': '#1d4ed8',

  // ── Topbar ─────────────────────────────────────────────────────────────
  '--topbar-bg':     '#ffffff',
  '--topbar-border': '#e2e8f0',
}

export const themes: Record<ThemeKey, TokenMap> = { dark, light }

export function applyTheme(theme: ThemeKey): void {
  const vars = themes[theme]
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  try { localStorage.setItem('sudosys:theme', theme) } catch {}
}

export function initTheme(): ThemeKey {
  let saved: ThemeKey | null = null
  try { saved = localStorage.getItem('sudosys:theme') as ThemeKey | null } catch {}
  const theme: ThemeKey = saved === 'light' ? 'light' : 'dark'
  applyTheme(theme)
  return theme
}

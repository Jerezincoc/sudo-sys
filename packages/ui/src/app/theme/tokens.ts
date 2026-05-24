export type ThemeKey = 'dark' | 'light'

type TokenMap = Record<string, string>

const light: TokenMap = {
  '--color-bg-app':          '#f0f0f0',
  '--color-bg-panel':        '#e8eef5',
  '--color-bg-ribbon':       '#dce6f5',
  '--color-bg-white':        '#ffffff',
  '--color-bg-row-even':     '#f0f5fb',
  '--color-bg-row-hover':    '#cfe0f2',
  '--color-bg-row-selected': '#1e4f8a',
  '--color-border-main':     '#a0b4cc',
  '--color-border-light':    '#dddddd',
  '--color-brand':           '#1e4f8a',
  '--color-text-primary':    '#1a1a1a',
  '--color-text-secondary':  '#555555',
  '--color-text-muted':      '#888888',
  '--color-status-bar':      '#1e4f8a',
  '--color-btn-add':         '#1e7e34',
  '--color-btn-del':         '#c0392b',
}

const dark: TokenMap = {
  '--color-bg-app':          '#1a1d23',
  '--color-bg-panel':        '#22262e',
  '--color-bg-ribbon':       '#1e2736',
  '--color-bg-white':        '#2d3340',
  '--color-bg-row-even':     '#252930',
  '--color-bg-row-hover':    '#2e3f52',
  '--color-bg-row-selected': '#1e4f8a',
  '--color-border-main':     '#3a4a5c',
  '--color-border-light':    '#333a45',
  '--color-brand':           '#4a9eda',
  '--color-text-primary':    '#e8eaed',
  '--color-text-secondary':  '#9aa3b0',
  '--color-text-muted':      '#666e7a',
  '--color-status-bar':      '#0d1f35',
  '--color-btn-add':         '#1e7e34',
  '--color-btn-del':         '#c0392b',
}

export const themes: Record<ThemeKey, TokenMap> = { light, dark }

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
  const theme: ThemeKey = saved === 'dark' ? 'dark' : 'light'
  applyTheme(theme)
  return theme
}

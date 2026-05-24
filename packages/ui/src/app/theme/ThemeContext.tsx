import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type ThemeKey, applyTheme, initTheme } from './tokens'

interface ThemeCtx {
  theme: ThemeKey
  toggle: () => void
  setTheme: (t: ThemeKey) => void
}

const ThemeContext = createContext<ThemeCtx>({
  theme: 'dark',
  toggle: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>('dark')

  useEffect(() => {
    const t = initTheme()
    setThemeState(t)
  }, [])

  const setTheme = useCallback((t: ThemeKey) => {
    applyTheme(t)
    setThemeState(t)
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeCtx {
  return useContext(ThemeContext)
}

import React, { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import AppRouter from './Router'
import { ThemeProvider } from './theme/ThemeContext'
import { ipcClient } from '@/api/ipcClient'

type AppState = 'loading' | 'setup' | 'main'

export default function App() {
  const [state, setState] = useState<AppState>('loading')

  useEffect(() => {
    ipcClient.checkInitialized().then((initialized: boolean) => {
      setState(initialized ? 'main' : 'setup')
    }).catch(() => {
      setState('setup')
    })
  }, [])

  if (state === 'loading') {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-app)',
        flexDirection: 'column',
        gap: 8,
      }}>
        <div style={{
          width: 28,
          height: 4,
          background: 'var(--color-brand)',
          animation: 'ldbar 1s ease-in-out infinite alternate',
        }} />
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Iniciando SudoSys…</span>
        <style>{`@keyframes ldbar { from { opacity: 1 } to { opacity: 0.3 } }`}</style>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <AppRouter initialState={state} />
      </HashRouter>
    </ThemeProvider>
  )
}

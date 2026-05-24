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
      // Sem Electron (dev browser) → vai direto pro setup
      setState('setup')
    })
  }, [])

  if (state === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface-900)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: '2px solid var(--brand-600)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Iniciando SudoSys…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
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

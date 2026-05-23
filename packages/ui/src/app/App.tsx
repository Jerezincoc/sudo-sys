import React, { useEffect, useState } from 'react'
import { HashRouter } from 'react-router-dom'
import AppRouter from './Router'
import { ipcClient } from '@/api/ipcClient'

type AppState = 'loading' | 'setup' | 'main'

export default function App() {
  const [state, setState] = useState<AppState>('loading')

  useEffect(() => {
    ipcClient.checkInitialized().then((initialized: boolean) => {
      setState(initialized ? 'main' : 'setup')
    }).catch(() => {
      // Se não há Electron (dev browser), vai direto pro setup
      setState('setup')
    })
  }, [])

  if (state === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Iniciando SudoSys…</p>
        </div>
      </div>
    )
  }

  return (
    <HashRouter>
      <AppRouter initialState={state} />
    </HashRouter>
  )
}

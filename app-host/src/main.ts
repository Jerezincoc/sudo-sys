/**
 * main.ts - Electron Main Process
 * Dev:  carregado via electron-dev.cjs (tsx/cjs bootstrap)
 * Prod: carregado via dist/main/main.js (compilado pelo tsc)
 */
import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { registerSetupHandlers } from './ipc/handlers/setupHandlers'
import { registerAllHandlers } from './ipc/ipcRouter'
import { installIpcAuthGuard } from './ipc/authGuard'
import { initDatabase } from './db/database'

// ── Dev vs Prod ──────────────────────────────────────────────────────────────
const isDev = !!process.env['VITE_DEV_SERVER_URL']

/**
 * Resolve o caminho do preload de acordo com o modo de execucao.
 *
 * Dev  (tsx via electron-dev.cjs): __dirname = app-host/src/
 *   -> app-host/src/../dist/main/preload.js = app-host/dist/main/preload.js
 *
 * Prod (tsc compilado):            __dirname = app-host/dist/main/
 *   -> app-host/dist/main/preload.js
 */
function resolvePreload(): string {
  return isDev
    ? path.join(__dirname, '../dist/main/preload.js')
    : path.join(__dirname, 'preload.js')
}

// ── Seguranca ────────────────────────────────────────────────────────────────
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowedOrigins = new Set([
      'http://localhost:5173',
      `file://${app.getAppPath()}`,
    ])
    try {
      const { origin } = new URL(url)
      if (!allowedOrigins.has(origin)) event.preventDefault()
    } catch {
      event.preventDefault()
    }
  })

  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })
})

// ── Janela principal ──────────────────────────────────────────────────────────
async function createWindow(): Promise<void> {
  const preloadPath = resolvePreload()

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0f1117',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: !app.isPackaged,
    },
    show: false,
  })

  win.once('ready-to-show', () => {
    win.show()
    if (isDev) win.webContents.openDevTools({ mode: 'detach' })
  })

  const devUrl = process.env['VITE_DEV_SERVER_URL']
  try {
    if (devUrl) {
      await win.loadURL(devUrl)
    } else {
      await win.loadFile(path.join(__dirname, '../renderer/index.html'))
    }
  } catch (err) {
    console.error('[main] Falha ao carregar o renderer:', err)
  }
}

// ── IPC ───────────────────────────────────────────────────────────────────────
async function setupIpc(): Promise<void> {
  installIpcAuthGuard() // precisa vir antes de qualquer ipcMain.handle
  registerSetupHandlers()
  initDatabase()        // garante DB + migrations antes dos handlers
  await registerAllHandlers()
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  await setupIpc()
  await createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
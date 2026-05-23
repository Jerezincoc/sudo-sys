/**
 * main.ts - Electron Main Process
 * Ponto de entrada do processo principal.
 */
import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { registerSetupHandlers } from './ipc/handlers/setupHandlers'
import { registerAllHandlers } from './ipc/ipcRouter'

// Seguranca: desabilita navegacao para origens externas
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowedOrigins = new Set([
      'http://localhost:5173',
      `file://${app.getAppPath()}`,
    ])
    const { origin } = new URL(url)
    if (!allowedOrigins.has(origin)) {
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

async function createWindow(): Promise<void> {
  const preloadPath = path.join(__dirname, 'preload.js')

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
    if (!app.isPackaged) {
      win.webContents.openDevTools({ mode: 'detach' })
    }
  })

  const devServerUrl = process.env['VITE_DEV_SERVER_URL']
  if (devServerUrl) {
    await win.loadURL(devServerUrl)
  } else {
    await win.loadFile(
      path.join(__dirname, '../renderer/index.html')
    )
  }
}

function setupIpc(): void {
  registerSetupHandlers()
  registerAllHandlers()
}

app.whenReady().then(async () => {
  setupIpc()
  await createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

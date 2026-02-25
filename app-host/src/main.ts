import { app, BrowserWindow } from "electron";
import path from "node:path";

import { getAppServices, shutdownAppServices } from "./di/compositionRoot";
import { registerIpcHandlers } from "./ipc/ipcRouter";

let mainWindow: BrowserWindow | null = null;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"), // ✅ arquivo compilado
    },
  });

  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // UI em dev (Vite)
    mainWindow.loadURL("http://localhost:5173");
  } else {
    // UI empacotada (ajuste conforme seu build do renderer)
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  // ✅ bootstrap completo: BANCO/ + DB + migrations
  const { banco } = getAppServices();

  // ✅ IPC pronto antes da UI
  registerIpcHandlers();

  console.log("SUDO SYS iniciado.");
  console.log("DB:", banco.dbFile);

  createMainWindow();
});

// Fecha DB de forma limpa
app.on("before-quit", () => {
  shutdownAppServices();
});

// Windows/Linux: encerra quando fechar todas as janelas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
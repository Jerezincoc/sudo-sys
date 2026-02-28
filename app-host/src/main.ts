// app-host/src/main.ts
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
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

function ensureSingleInstance(): boolean {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    app.quit();
    return false;
  }

  app.on("second-instance", () => {
    // Se já tiver janela aberta, foca nela
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  return true;
}

async function bootstrapAndStart(): Promise<void> {
  // ✅ bootstrap completo: BANCO/ + DB + migrations
  const services = await getAppServices();

  // ✅ IPC pronto antes da UI (e com services injetado)
  registerIpcHandlers(services);

  console.log("SUDO SYS iniciado.");
  console.log("DB:", services.banco.dbFile);

  createMainWindow();
}

if (ensureSingleInstance()) {
  app.whenReady().then(async () => {
    try {
      await bootstrapAndStart();
    } catch (err) {
      console.error("Bootstrap failed:", err);
      app.quit();
    }
  });
}

// Fecha DB de forma limpa
app.on("before-quit", async (event) => {
  // garante chance de finalizar o close async
  event.preventDefault();
  try {
    await shutdownAppServices();
  } catch (err) {
    console.error("Shutdown failed:", err);
  } finally {
    app.exit(0);
  }
});

// Windows/Linux: encerra quando fechar todas as janelas
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
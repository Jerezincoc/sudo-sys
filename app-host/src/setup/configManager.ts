/**
 * configManager.ts
 * Le e grava o config.json no userData do Electron.
 * O arquivo e criado so apos o wizard ser concluido.
 */
import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import type { AppConfig, SaveConfigPayload } from '@sudo-sys/shared'

const APP_VERSION = '1.0.0'

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json')
}

export function isInitialized(): boolean {
  const configPath = getConfigPath()
  if (!fs.existsSync(configPath)) return false
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(raw) as AppConfig
    return config.initialized === true
  } catch {
    return false
  }
}

export function readConfig(): AppConfig | null {
  const configPath = getConfigPath()
  if (!fs.existsSync(configPath)) return null
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    return JSON.parse(raw) as AppConfig
  } catch {
    return null
  }
}

export function writeConfig(payload: SaveConfigPayload): void {
  const configPath = getConfigPath()
  const dir = path.dirname(configPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const config: AppConfig = {
    initialized: true,
    version: APP_VERSION,
    database: payload.database,
    empresa: payload.empresa,
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
}

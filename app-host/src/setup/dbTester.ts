/**
 * dbTester.ts
 * Testa conexao com SQLite ou PostgreSQL sem criar schema.
 */
import type { TestDbPayload, TestDbResult } from '@sudo-sys/shared'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export async function testDatabase(payload: TestDbPayload): Promise<TestDbResult> {
  const start = Date.now()

  if (payload.type === 'sqlite') {
    return testSqlite(start)
  }

  if (payload.type === 'postgres') {
    if (!payload.connectionString) {
      return { success: false, error: 'Connection string nao informada.' }
    }
    return testPostgres(payload.connectionString, start)
  }

  return { success: false, error: 'Tipo de banco desconhecido.' }
}

function testSqlite(start: number): TestDbResult {
  try {
    const dbDir = path.join(app.getPath('userData'), 'banco')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    const testFile = path.join(dbDir, '.write-test')
    fs.writeFileSync(testFile, 'ok', 'utf-8')
    fs.unlinkSync(testFile)
    return { success: true, latencyMs: Date.now() - start }
  } catch (err) {
    return {
      success: false,
      error: `Sem permissao de escrita no diretorio de dados: ${String(err)}`,
    }
  }
}

async function testPostgres(connectionString: string, start: number): Promise<TestDbResult> {
  let client: import('pg').Client | undefined
  try {
    // Importacao dinamica para nao falhar se pg nao estiver disponivel
    const { Client } = await import('pg')
    client = new Client({ connectionString })
    await client.connect()
    await client.query('SELECT 1')
    return { success: true, latencyMs: Date.now() - start }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  } finally {
    try { await client?.end() } catch { /* ignora */ }
  }
}

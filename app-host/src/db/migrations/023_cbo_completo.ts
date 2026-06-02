import BetterSqlite3 from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export function runCboSeed(db: BetterSqlite3.Database): void {
  const count = (db.prepare('SELECT COUNT(*) as n FROM cbo').get() as { n: number }).n
  if (count > 200) return

  const csvPath = path.join(__dirname, '../../data/cbo_lista.csv')
  if (!fs.existsSync(csvPath)) {
    console.warn('[cbo] CSV não encontrado em', csvPath)
    return
  }

  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n')
  const insert = db.prepare('INSERT OR IGNORE INTO cbo (codigo, descricao) VALUES (?, ?)')

  const insertMany = db.transaction((rows: { codigo: string; descricao: string }[]) => {
    for (const row of rows) insert.run(row.codigo, row.descricao)
  })

  const rows: { codigo: string; descricao: string }[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const comma = line.indexOf(',')
    if (comma < 0) continue
    const codigo = line.slice(0, comma).trim()
    const descricao = line.slice(comma + 1).trim().replace(/^"|"$/g, '')
    if (codigo && descricao) rows.push({ codigo, descricao })
  }

  insertMany(rows)
  console.log(`[cbo] ${rows.length} registros inseridos.`)
}

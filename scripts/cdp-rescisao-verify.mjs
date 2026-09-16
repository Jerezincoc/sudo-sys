/**
 * cdp-rescisao-verify.mjs — ACAO-0033 / ACAO-0035
 * Valida o cálculo de rescisão (TRCT) via IPC real (CDP), nos 4 cenários calculados à mão:
 *   (a) sem justa causa, (b) pedido de demissão, (c) acordo mútuo (art. 484-A CLT),
 *   (d) salário alto — IRRF > 0 e teto do INSS no saldo e no 13º (ACAO-0035).
 * Cria empresa/funcionários/rescisões de teste, chama rescisao:calcular e rescisao:gerar-pdf,
 * compara cada campo com o esperado e move os PDFs gerados para OUT_DIR.
 *
 * Uso (com o app aberto em --remote-debugging-port=9222, de preferência com um
 * --user-data-dir descartável — o script cria dados e troca a senha do admin seed):
 *   OUT_DIR=<pasta> ADMIN_SENHA_NOVA=<senha> node scripts/cdp-rescisao-verify.mjs
 */
import { createConnection } from 'net'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'

const OUT_DIR = process.env.OUT_DIR ?? '.'
const SENHA_NOVA = process.env.ADMIN_SENHA_NOVA ?? 'Rescisao#Verify2026'

async function getWsUrl() {
  const targets = await (await fetch('http://127.0.0.1:9222/json')).json()
  const r = targets.find((t) => t.url && t.url.includes('localhost:5173'))
  if (!r) throw new Error('Renderer não encontrado em /json')
  return r.webSocketDebuggerUrl
}

function cdpSession(wsUrl) {
  return new Promise((resolve) => {
    const url = new URL(wsUrl)
    const key = createHash('sha1').update(Math.random().toString()).digest('base64')
    const socket = createConnection({ host: url.hostname, port: Number(url.port) }, () => {
      socket.write([`GET ${url.pathname} HTTP/1.1`, `Host: ${url.host}`, 'Upgrade: websocket',
        'Connection: Upgrade', `Sec-WebSocket-Key: ${key}`, 'Sec-WebSocket-Version: 13', '', ''].join('\r\n'))
    })
    let headersDone = false
    let buf = Buffer.alloc(0)
    const pending = new Map()
    let msgId = 1
    function send(method, params = {}) {
      const id = msgId++
      return new Promise((res, rej) => {
        pending.set(id, res)
        const p = Buffer.from(JSON.stringify({ id, method, params }), 'utf8')
        const len = p.length
        const header = len <= 125 ? Buffer.from([0x81, 0x80 | len])
          : Buffer.from([0x81, 0xfe, (len >> 8) & 0xff, len & 0xff])
        const mask = Buffer.from([0xde, 0xad, 0xbe, 0xef])
        const masked = Buffer.alloc(len)
        for (let i = 0; i < len; i++) masked[i] = p[i] ^ mask[i % 4]
        socket.write(Buffer.concat([header, mask, masked]))
        setTimeout(() => rej(new Error(`timeout id=${id} ${method}`)), 30000)
      })
    }
    socket.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk])
      if (!headersDone) {
        const idx = buf.indexOf('\r\n\r\n')
        if (idx === -1) return
        headersDone = true
        buf = buf.slice(idx + 4)
        resolve({ send, close: () => socket.destroy() })
      }
      while (buf.length >= 2) {
        const opcode = buf[0] & 0x0f
        let len = buf[1] & 0x7f
        let off = 2
        if (len === 126) { len = buf.readUInt16BE(2); off = 4 } else if (len === 127) { len = Number(buf.readBigUInt64BE(2)); off = 10 }
        if (buf.length < off + len) break
        const payload = buf.slice(off, off + len)
        buf = buf.slice(off + len)
        if (opcode === 1) {
          try { const m = JSON.parse(payload.toString('utf8')); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } } catch {}
        }
      }
    })
  })
}

let session
async function ipc(expr) {
  const m = await session.send('Runtime.evaluate', {
    expression: `(async () => JSON.stringify(await (${expr})))().catch(e => JSON.stringify({ __error: e.message }))`,
    awaitPromise: true, returnByValue: true,
  })
  const v = JSON.parse(m.result?.result?.value ?? 'null')
  if (v && v.__error) throw new Error(`${expr.slice(0, 60)}… → ${v.__error}`)
  return v
}
const api = (call, arg) => ipc(`window.electronAPI.${call}(${arg === undefined ? '' : JSON.stringify(arg)})`)

let falhas = 0
function confere(label, obtido, esperado) {
  const ok = Math.abs((obtido ?? 0) - esperado) < 0.005
  if (!ok) falhas++
  console.log(`   ${ok ? '[OK]' : '[NG]'} ${label.padEnd(22)} obtido=${obtido}  esperado=${esperado}`)
}

const CENARIOS = [
  {
    nome: '(a) sem justa causa, aviso indenizado',
    func: { nome: 'TESTE ACAO0033 A SEM JUSTA CAUSA', cpf: '11144477735', data_admissao: '2023-03-10', salario_base: 3000 },
    resc: { data_demissao: '2025-09-05', motivo: 'sem_justa_causa', aviso_previo: 'indenizado', salario_referencia: 3000, dias_trabalhados: 5, ferias_vencidas: 0, saldo_fgts: 5492 },
    esperado: { saldo_salario: 500, aviso_previo_valor: 3600, ferias_proporcionais: 1750, um_terco_ferias: 583.33, decimo_terceiro: 2250, total_proventos: 8683.33, inss_rescisao: 37.5, inss_decimo_terceiro: 179.73, irrf_rescisao: 0, irrf_decimo_terceiro: 0, fgts_rescisao: 508, multa_fgts: 2400, total_descontos: 217.23, valor_liquido: 8466.1 },
  },
  {
    nome: '(b) pedido de demissão, aviso trabalhado',
    func: { nome: 'TESTE ACAO0033 B PEDIDO DEMISSAO', cpf: '52998224725', data_admissao: '2024-06-20', salario_base: 3000 },
    resc: { data_demissao: '2025-09-18', motivo: 'pedido_demissao', aviso_previo: 'trabalhado', salario_referencia: 3000, dias_trabalhados: 18, ferias_vencidas: 0, saldo_fgts: 1000 },
    esperado: { saldo_salario: 1800, aviso_previo_valor: 0, ferias_proporcionais: 750, um_terco_ferias: 250, decimo_terceiro: 2250, total_proventos: 5050, inss_rescisao: 139.23, inss_decimo_terceiro: 179.73, irrf_rescisao: 0, irrf_decimo_terceiro: 0, fgts_rescisao: 324, multa_fgts: 0, total_descontos: 318.96, valor_liquido: 4731.04 },
  },
  {
    nome: '(c) acordo mútuo (art. 484-A), aviso indenizado, férias vencidas',
    func: { nome: 'TESTE ACAO0033 C ACORDO MUTUO', cpf: '39053344705', data_admissao: '2020-02-03', salario_base: 4000 },
    resc: { data_demissao: '2025-08-14', motivo: 'acordo_mutuo', aviso_previo: 'indenizado', salario_referencia: 4000, dias_trabalhados: 14, ferias_vencidas: 4000, saldo_fgts: 15424 },
    esperado: { saldo_salario: 1866.67, aviso_previo_valor: 3000, ferias_proporcionais: 2000, um_terco_ferias: 2000, decimo_terceiro: 2333.33, total_proventos: 15200, inss_rescisao: 145.23, inss_decimo_terceiro: 187.23, irrf_rescisao: 0, irrf_decimo_terceiro: 0, fgts_rescisao: 576, multa_fgts: 3200, total_descontos: 332.46, valor_liquido: 14867.54 },
  },
  {
    nome: '(d) sem justa causa, salário alto — IRRF > 0, teto do INSS no saldo e no 13º',
    func: { nome: 'TESTE ACAO0035 D SALARIO ALTO', cpf: '15350946056', data_admissao: '2023-03-10', salario_base: 12000 },
    resc: { data_demissao: '2025-09-25', motivo: 'sem_justa_causa', aviso_previo: 'indenizado', salario_referencia: 12000, dias_trabalhados: 25, ferias_vencidas: 0, saldo_fgts: 20000 },
    esperado: { saldo_salario: 10000, aviso_previo_valor: 14400, ferias_proporcionais: 8000, um_terco_ferias: 2666.67, decimo_terceiro: 10000, total_proventos: 45066.67, inss_rescisao: 951.63, inss_decimo_terceiro: 951.63, irrf_rescisao: 1579.57, irrf_decimo_terceiro: 1579.57, fgts_rescisao: 2752, multa_fgts: 9100.8, total_descontos: 5062.4, valor_liquido: 40004.27 },
  },
]

async function main() {
  session = await cdpSession(await getWsUrl())
  console.log('\n=== CDP Rescisão Verify (ACAO-0033 / ACAO-0035) ===\n')

  // Login com a senha seed implica troca obrigatória (REC-0002); com a senha nova, não.
  let login = await api('login', { email: 'admin@sudosys.local', senha: 'admin123' })
  const usouSenhaSeed = login.success
  if (!login.success) login = await api('login', { email: 'admin@sudosys.local', senha: SENHA_NOVA })
  if (!login.success) throw new Error('login falhou: ' + JSON.stringify(login))
  if (usouSenhaSeed) {
    const t = await api('trocarSenha', { token: login.token, senhaAtual: 'admin123', novaSenha: SENHA_NOVA })
    if (!t.success) throw new Error('trocarSenha falhou: ' + JSON.stringify(t))
    login = await api('login', { email: 'admin@sudosys.local', senha: SENHA_NOVA })
  }
  console.log('login admin: ok')

  const emp = await api('createEmpresa', { codigo: 'A0033', razao_social: 'EMPRESA TESTE ACAO0033 LTDA', cnpj: '11222333000181', status: 'ativa' })
  if (!emp.success) throw new Error('createEmpresa: ' + emp.error)
  const empresaId = emp.data.id

  for (const c of CENARIOS) {
    console.log(`\n-- ${c.nome}`)
    const f = await api('createFuncionario', { empresa_id: empresaId, codigo: '', status: 'ativo', ...c.func })
    if (!f.success) throw new Error('createFuncionario: ' + f.error)
    const r = await api('createRescisao', {
      empresa_id: empresaId, funcionario_id: f.data.id, data_aviso: null, outros_proventos: 0,
      outros_descontos: 0, status: 'rascunho', observacao: null, ...c.resc,
    })
    if (!r.success) throw new Error('createRescisao: ' + r.error)
    const calc = await api('calcularRescisao', r.data.id)
    if (!calc.success) throw new Error('calcularRescisao: ' + calc.error)
    for (const [k, v] of Object.entries(c.esperado)) confere(k, calc.data[k], v)

    const pdf = await api('gerarPdfRescisao', r.data.id)
    if (!pdf.success) throw new Error('gerarPdfRescisao: ' + pdf.error)
    const destino = path.join(OUT_DIR, path.basename(pdf.data.filePath))
    fs.copyFileSync(pdf.data.filePath, destino)
    fs.unlinkSync(pdf.data.filePath)
    console.log(`   PDF: ${destino}`)
  }

  await api('logout', login.token)
  session.close()
  console.log(`\n=== ${falhas === 0 ? 'TODOS OS CAMPOS CONFEREM' : falhas + ' CAMPO(S) DIVERGENTE(S)'} ===\n`)
  process.exit(falhas === 0 ? 0 : 1)
}

main().catch((e) => { console.error('ERRO:', e.message); process.exit(2) })

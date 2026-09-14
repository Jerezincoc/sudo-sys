/**
 * authGuard.ts
 * Gate central de autenticação/autorização para IPC.
 *
 * Antes desta mudança, nenhum `ipcMain.handle` verificava quem estava chamando —
 * qualquer canal exposto no preload podia ser invocado sem login. Em vez de alterar
 * um por um os ~80 handlers já registrados em app-host/src/ipc/handlers/*, este
 * módulo substitui `ipcMain.handle` por uma versão que intercepta todo registro
 * futuro e injeta a checagem antes de delegar ao handler original.
 *
 * A sessão é amarrada ao `WebContents` que fez a chamada (não a um token passado
 * como argumento) — é o próprio Electron quem garante que `event.sender` não pode
 * ser forjado pelo renderer, então isso é mais forte do que confiar num valor
 * recebido como parâmetro.
 *
 * Comportamento por padrão: qualquer canal não listado em CANAIS_PUBLICOS exige
 * sessão autenticada; canais em CANAIS_ADMIN exigem, além disso, papel admin. Um
 * canal novo, se ninguém o adicionar a uma das listas, fica protegido por padrão
 * (fail-safe) — só fica público se alguém explicitamente decidir isso.
 *
 * Extensão da REC-0002: com sessão válida mas `must_change_password = 1`, todo
 * canal autenticado é bloqueado exceto os listados em
 * CANAIS_PERMITIDOS_COM_TROCA_PENDENTE — antes desta checagem, o flag só era
 * respeitado pelo roteamento de tela no frontend (App.tsx); qualquer chamada
 * de IPC direta contornava a troca de senha obrigatória.
 */
import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import type { Usuario } from '@sudo-sys/shared'

const sessionsByWebContentsId = new Map<number, Usuario>()

export function setSessionUser(event: IpcMainInvokeEvent, user: Usuario): void {
  sessionsByWebContentsId.set(event.sender.id, user)
}

export function clearSessionUser(event: IpcMainInvokeEvent): void {
  sessionsByWebContentsId.delete(event.sender.id)
}

export function getSessionUser(event: IpcMainInvokeEvent): Usuario | undefined {
  return sessionsByWebContentsId.get(event.sender.id)
}

// Fluxo de setup (roda antes de existir qualquer usuário) e o próprio boundary de
// login/logout/verificação de sessão. `auth:register` fica de fora de propósito:
// já tem checagem própria de admin via `requestingToken` (independente de sessão)
// e hoje não é chamado por nenhuma tela — não duplicamos a checagem para não mudar
// seu comportamento sem necessidade.
const CANAIS_PUBLICOS = new Set([
  'setup:check-initialized',
  'setup:test-database',
  'setup:save-config',
  'setup:get-config',
  'auth:login',
  'auth:logout',
  'auth:me',
  'auth:register',
])

// Canais que, além de sessão autenticada, exigem papel admin.
const CANAIS_ADMIN = new Set([
  'usuario:list',
  'usuario:create',
  'usuario:delete',
  'admin:backup',
])

// Com must_change_password = 1, todo canal autenticado é bloqueado exceto os
// listados aqui. Hoje só `auth:trocarSenha` é necessário: é o único canal que
// `TrocarSenhaPage.tsx` chama (nenhum outro handler é indispensável para essa
// tela funcionar). `auth:logout`/`auth:me`/`auth:login` não precisam entrar
// nesta lista porque já estão em CANAIS_PUBLICOS e nunca passam por esta
// checagem (retornam antes, no topo de installIpcAuthGuard).
const CANAIS_PERMITIDOS_COM_TROCA_PENDENTE = new Set([
  'auth:trocarSenha',
])

type Listener = (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown

/** Instala o gate. Precisa ser chamado antes do primeiro `ipcMain.handle(...)`
 *  da aplicação (setup incluso), em `main.ts`. */
export function installIpcAuthGuard(): void {
  const originalHandle = ipcMain.handle.bind(ipcMain)

  ipcMain.handle = ((channel: string, listener: Listener) => {
    if (CANAIS_PUBLICOS.has(channel)) {
      return originalHandle(channel, listener)
    }
    return originalHandle(channel, (event, ...args) => {
      const user = getSessionUser(event)
      if (!user) {
        throw new Error('Sessão inválida. Faça login novamente.')
      }
      if (user.must_change_password === 1 && !CANAIS_PERMITIDOS_COM_TROCA_PENDENTE.has(channel)) {
        throw new Error('Troca de senha obrigatória pendente. Use a tela de troca de senha antes de continuar.')
      }
      if (CANAIS_ADMIN.has(channel) && user.papel !== 'admin') {
        throw new Error('Apenas administradores podem executar esta ação.')
      }
      return listener(event, ...args)
    })
  }) as typeof ipcMain.handle
}

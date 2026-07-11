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
      if (CANAIS_ADMIN.has(channel) && user.papel !== 'admin') {
        throw new Error('Apenas administradores podem executar esta ação.')
      }
      return listener(event, ...args)
    })
  }) as typeof ipcMain.handle
}

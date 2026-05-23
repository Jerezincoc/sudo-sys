// ─────────────────────────────────────────────
//  Tipos de IPC compartilhados (main ↔ renderer)
// ─────────────────────────────────────────────

export interface IpcResponse<T = void> {
  success: boolean
  data?: T
  error?: string
}

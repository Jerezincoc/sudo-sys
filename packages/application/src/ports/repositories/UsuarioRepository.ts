export interface UsuarioRepository { findByEmail(email: string): Promise<unknown>; save(u: unknown): Promise<unknown> }

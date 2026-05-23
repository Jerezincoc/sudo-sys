export interface RubricaRepository { findAll(): Promise<unknown[]>; save(r: unknown): Promise<unknown>; delete(id: string): Promise<void> }

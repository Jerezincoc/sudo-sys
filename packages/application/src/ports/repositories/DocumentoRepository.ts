export interface DocumentoRepository { save(d: unknown): Promise<unknown>; findAll(): Promise<unknown[]> }

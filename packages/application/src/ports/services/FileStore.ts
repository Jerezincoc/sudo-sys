export interface FileStore { save(name: string, data: Buffer): Promise<string>; read(name: string): Promise<Buffer> }

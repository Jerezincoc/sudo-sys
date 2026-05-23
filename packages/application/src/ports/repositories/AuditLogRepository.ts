export interface AuditLogRepository { log(entry: unknown): Promise<void>; findAll(): Promise<unknown[]> }

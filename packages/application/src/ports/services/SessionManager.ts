export interface SessionManager { start(userId: string): string; validate(token: string): string | null; end(token: string): void }

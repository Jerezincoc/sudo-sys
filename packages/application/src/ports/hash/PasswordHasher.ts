// packages/application/src/ports/hash/PasswordHasher.ts

export interface PasswordHasher {
  hash(plainText: string): Promise<{ hash: string; salt: string }>;
  compare(plainText: string, hash: string, salt: string): Promise<boolean>;
}

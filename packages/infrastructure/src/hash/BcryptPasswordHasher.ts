// packages/infrastructure/src/hash/BcryptPasswordHasher.ts
import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '@sudo/application';

// bcrypjs já gera o salt e embute no hash que ele retorna quando usamos hashSync/hash (então o salt do DB não é estritamente necessário separado pra bcrypt, mas usamos a API pra manter compatibilidade)
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<{ hash: string; salt: string }> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainText, salt);
    return { hash, salt };
  }

  async compare(plainText: string, hash: string, _salt: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}

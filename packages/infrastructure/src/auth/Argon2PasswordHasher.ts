import crypto from 'crypto'

export class SimplePasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex')
    return `pbkdf2:${salt}:${hash}`
  }

  async verify(plain: string, stored: string): Promise<boolean> {
    const [, salt, hash] = stored.split(':')
    const verify = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex')
    return verify === hash
  }
}

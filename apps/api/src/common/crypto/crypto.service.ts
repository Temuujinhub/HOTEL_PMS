import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

/**
 * AES-256-GCM encryption for sensitive PII (e.g. passport numbers) stored at
 * rest, as required by the security architecture (PCI DSS / GDPR).
 * Output format: base64(iv).base64(authTag).base64(ciphertext)
 */
@Injectable()
export class CryptoService {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    const secret = config.get<string>('encryptionKey') as string;
    // Derive a stable 32-byte key from the configured secret.
    this.key = createHash('sha256').update(secret).digest();
  }

  encrypt(plain: string | null | undefined): string | null {
    if (plain == null || plain === '') return null;
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
  }

  decrypt(payload: string | null | undefined): string | null {
    if (!payload) return null;
    try {
      const [ivB64, tagB64, dataB64] = payload.split('.');
      if (!ivB64 || !tagB64 || !dataB64) return null;
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        Buffer.from(ivB64, 'base64'),
      );
      decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
      const dec = Buffer.concat([
        decipher.update(Buffer.from(dataB64, 'base64')),
        decipher.final(),
      ]);
      return dec.toString('utf8');
    } catch {
      return null;
    }
  }

  /** Masks all but the last 4 characters, for safe display. */
  mask(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.length <= 4) return '****';
    return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
  }
}

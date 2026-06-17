import { ConfigService } from '@nestjs/config';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  const config = { get: () => 'unit-test-encryption-key-1234567890' } as unknown as ConfigService;
  const crypto = new CryptoService(config);

  it('round-trips encryption', () => {
    const plain = 'P1234567';
    const enc = crypto.encrypt(plain);
    expect(enc).not.toBeNull();
    expect(enc).not.toContain(plain);
    expect(crypto.decrypt(enc)).toBe(plain);
  });

  it('returns null for empty input', () => {
    expect(crypto.encrypt(null)).toBeNull();
    expect(crypto.encrypt('')).toBeNull();
    expect(crypto.decrypt(null)).toBeNull();
  });

  it('produces a different ciphertext each time (random IV)', () => {
    expect(crypto.encrypt('same')).not.toBe(crypto.encrypt('same'));
  });

  it('fails closed on tampered ciphertext', () => {
    const enc = crypto.encrypt('secret') as string;
    const tampered = enc.slice(0, -2) + (enc.endsWith('A') ? 'BB' : 'AA');
    expect(crypto.decrypt(tampered)).toBeNull();
  });

  it('masks all but the last 4 characters', () => {
    expect(crypto.mask('AB123456')).toBe('****3456');
    expect(crypto.mask('12')).toBe('****');
  });
});

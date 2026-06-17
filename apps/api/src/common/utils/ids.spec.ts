import { generateCode, slugify } from './ids';

describe('ids utils', () => {
  describe('slugify', () => {
    it('lowercases and hyphenates', () => {
      expect(slugify('Grand Aurora Hospitality')).toBe('grand-aurora-hospitality');
    });
    it('strips punctuation and trims hyphens', () => {
      expect(slugify('  Hotel & Resort!! ')).toBe('hotel-resort');
    });
    it('caps length at 48 chars', () => {
      expect(slugify('a'.repeat(100)).length).toBeLessThanOrEqual(48);
    });
  });

  describe('generateCode', () => {
    it('applies the prefix and length', () => {
      const c = generateCode('CR', 8);
      expect(c).toMatch(/^CR-[A-Z2-9]{8}$/);
    });
    it('avoids ambiguous characters (0,1,I,O)', () => {
      const codes = Array.from({ length: 50 }, () => generateCode('X', 10).split('-')[1]).join('');
      expect(codes).not.toMatch(/[01IO]/);
    });
    it('is reasonably unique', () => {
      const set = new Set(Array.from({ length: 1000 }, () => generateCode('F', 8)));
      expect(set.size).toBe(1000);
    });
  });
});

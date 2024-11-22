import { variantLookupTable, get_hash, getMatchingVariant } from '../utils';
import { ClientAssignedFeatureFlag } from '../types';

describe('utils', () => {
  describe('variantLookupTable', () => {
    it('should create correct lookup table for variants', () => {
      const variants = {
        control: 0.5,
        test: 0.5,
      };

      const result = variantLookupTable(variants);

      expect(result).toEqual([
        { value_min: 0, value_max: 0.5, key: 'control' },
        { value_min: 0.5, value_max: 1, key: 'test' },
      ]);
    });
  });

  describe('get_hash', () => {
    it('should generate consistent hash values', () => {
      const hash1 = get_hash('test-flag', 'user-123');
      const hash2 = get_hash('test-flag', 'user-123');

      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThanOrEqual(1);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = get_hash('test-flag', 'user-123');
      const hash2 = get_hash('test-flag', 'user-456');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getMatchingVariant', () => {
    const testFlag: ClientAssignedFeatureFlag = {
      key: 'test-experiment',
      variants: {
        control: 0.5,
        test: 0.5,
      },
    };

    it('should consistently assign variants', () => {
      const identity = 'test-user-123';
      const variant1 = getMatchingVariant(identity, testFlag);
      const variant2 = getMatchingVariant(identity, testFlag);

      expect(variant1).toBe(variant2);
      expect(['control', 'test']).toContain(variant1);
    });
  });
});

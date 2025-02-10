import {
  generateLocalId,
  variantLookupTable,
  get_hash,
  getMatchingVariant,
  hash,
} from '../utils';
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

    it('should compute the correct hash values', () => {
      const testFlag = 'test-flag';

      // Repeating the hash function should produce the same output
      // Same as: import hashlib; hashlib.sha1("test-flag.distinct_id_1".encode("utf-8")).hexdigest()[:15]
      expect(hash('test-flag.distinct_id_1')).toBe('59f5e7274a66f06');
      expect(hash('test-flag.distinct_id_1')).toBe('59f5e7274a66f06');
      // A different input should produce a different hash
      // Same as: import hashlib; hashlib.sha1("test-flag.distinct_id_2".encode("utf-8")).hexdigest()[:15]
      expect(hash('test-flag.distinct_id_2')).toBe('59589dd697c3745');

      // Same identifier should get same hash
      // distinct_id_1 + test-flag = 0.35140843114131903
      expect(get_hash(testFlag, 'distinct_id_1')).toBeCloseTo(
        0.35140843114131903
      );
      expect(get_hash(testFlag, 'distinct_id_1')).toBeCloseTo(
        0.35140843114131903
      );

      // Different identifiers should get different hashes
      // distinct_id_2 + test-flag = 0.34900843133051557
      expect(get_hash(testFlag, 'distinct_id_2')).toBeCloseTo(
        0.34900843133051557
      );

      // Different salt should produce different hash
      // distinct_id_1 + test-flag + salt = 0.05659409091269017
      expect(get_hash(testFlag, 'distinct_id_1', 'salt')).toBeCloseTo(
        0.05659409091269017
      );

      // Different flag keys should produce different hashes
      const differentFlag = 'different-flag';
      // distinct_id_1 + different-flag = 0.5078604702829128
      expect(get_hash(differentFlag, 'distinct_id_1')).toBeCloseTo(
        0.5078604702829128
      );
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

  describe('evaluate', () => {
    it('should evaluate the correct variant', () => {
      const testFlag: ClientAssignedFeatureFlag = {
        key: 'test-experiment',
        variants: {
          control: 0.5,
          test: 0.5,
        },
      };
      const counts: Record<string, number> = {
        control: 0,
        test: 0,
      };
      for (let i = 0; i < 1000; i++) {
        const variant = getMatchingVariant(generateLocalId(), testFlag);
        if (variant) {
          counts[variant]++;
        }
      }
      expect(counts.control).toBeGreaterThan(400);
      expect(counts.control).toBeLessThan(600);
      expect(counts.test).toBeGreaterThan(400);
      expect(counts.test).toBeLessThan(600);
    });
  });
});

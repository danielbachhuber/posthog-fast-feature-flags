import { instance } from '../posthog-fast-feature-flags';
import { ClientAssignedFeatureFlag } from '../types';

describe('PostHog Fast Feature Flags', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = '';
  });

  it('should generate and store identity in cookie', () => {
    const identity = instance.identity();
    expect(document.cookie).toContain(`pfff=${identity}`);
  });

  it('should reuse existing identity from cookie', () => {
    const testId = 'test-id-123';
    document.cookie = `pfff=${testId}`;

    const identity = instance.identity();
    expect(identity).toBe(testId);
  });

  it('should consistently assign feature flags', () => {
    const flags: ClientAssignedFeatureFlag[] = [
      {
        key: 'test-experiment',
        variants: {
          control: 0.5,
          test: 0.5,
        },
      },
    ];

    const result1 = instance(flags);
    const result2 = instance(flags);

    expect(result1).toEqual(result2);
    expect(result1['test-experiment']).toBeDefined();
    expect(['control', 'test']).toContain(result1['test-experiment']);
  });

  it('should throw error if variants do not sum to 1', () => {
    const flags: ClientAssignedFeatureFlag[] = [
      {
        key: 'invalid-experiment',
        variants: {
          control: 0.3,
          test: 0.3,
        },
      },
    ];

    expect(() => instance(flags)).toThrow();
  });
});

import { getMatchingVariant } from './utils';
import { ClientAssignedFeatureFlag, FlagAssignments } from './types';

interface PFFFInstance {
  (flags: ClientAssignedFeatureFlag[]): FlagAssignments;
  evaluate: (flags: ClientAssignedFeatureFlag[]) => FlagAssignments;
  identity: () => string;
}

function createPFFF(): PFFFInstance {
  const distinctId =
    Math.random().toString(36).substring(2) + Date.now().toString(36);

  const evaluate = (flags: ClientAssignedFeatureFlag[]): FlagAssignments => {
    const assignments: FlagAssignments = {};

    flags.forEach((flag) => {
      // Validate variants sum to 1
      const sum = Object.values(flag.variants).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1) > 0.0001) {
        throw new Error(
          `Variants for flag ${flag.key} must sum to 1, got ${sum}`
        );
      }

      assignments[flag.key] = getMatchingVariant(flag);
    });

    return assignments;
  };

  // Create the callable function
  const pfff = function (flags: ClientAssignedFeatureFlag[]): FlagAssignments {
    return evaluate(flags);
  } as PFFFInstance;

  // Add methods
  pfff.evaluate = evaluate;
  pfff.identity = () => distinctId;

  return pfff;
}

// Create and export the singleton instance
export const instance = createPFFF();

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).PFFF = instance;
}

export default instance;

import { getMatchingVariant } from './utils';
import { ClientAssignedFeatureFlag, FlagAssignments } from './types';

interface PFFFInstance {
  (flags: ClientAssignedFeatureFlag[]): FlagAssignments;
  evaluate: (flags: ClientAssignedFeatureFlag[]) => FlagAssignments;
  identify: () => string;
}

const identify = () => {
  let localId = undefined;
  if (localId) {
    return localId;
  }

  const cookies = document.cookie.split(';');
  const pfffCookie = cookies.find((c) => c.trim().startsWith('pfff='));
  if (pfffCookie) {
    localId = pfffCookie.split('=')[1].trim();
    return localId;
  }

  localId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  document.cookie = `pfff=${localId};path=/;max-age=31536000`; // 1 year expiry
  return localId;
};

function createPFFF(): PFFFInstance {
  const identity = identify();
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

      assignments[flag.key] = getMatchingVariant(identity, flag);
    });

    return assignments;
  };

  // Create the callable function
  const pfff = function (flags: ClientAssignedFeatureFlag[]): FlagAssignments {
    return evaluate(flags);
  } as PFFFInstance;

  // Add methods
  pfff.evaluate = evaluate;
  pfff.identify = identify;

  return pfff;
}

// Create and export the singleton instance
export const instance = createPFFF();

// Make it globally available
if (typeof window !== 'undefined') {
  (window as any).PFFF = instance;
}

export default instance;

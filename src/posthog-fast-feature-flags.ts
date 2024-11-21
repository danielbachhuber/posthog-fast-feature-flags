interface FeatureFlag {
  key: string;
  variants: {
    [key: string]: number;
  };
}

type FlagValue = string | boolean;
type FlagAssignments = { [key: string]: FlagValue };

export function PFFF(flags: FeatureFlag[]): FlagAssignments {
  const assignments: FlagAssignments = {};

  flags.forEach((flag) => {
    // Validate variants sum to 1
    const sum = Object.values(flag.variants).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1) > 0.0001) {
      throw new Error(
        `Variants for flag ${flag.key} must sum to 1, got ${sum}`
      );
    }

    // Generate random number between 0 and 1
    const rand = Math.random();
    let cumulative = 0;

    // For boolean flags (only true/false variants)
    const variants = Object.keys(flag.variants);
    if (
      variants.length === 2 &&
      variants.includes('true') &&
      variants.includes('false')
    ) {
      assignments[flag.key] = rand <= flag.variants.true;
      return;
    }

    // For variant flags
    for (const [variant, probability] of Object.entries(flag.variants)) {
      cumulative += probability;
      if (rand <= cumulative) {
        assignments[flag.key] = variant;
        return;
      }
    }

    // Fallback to last variant
    assignments[flag.key] = variants[variants.length - 1];
  });

  return assignments;
}

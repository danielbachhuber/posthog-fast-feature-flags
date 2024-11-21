import { ClientAssignedFeatureFlag } from './types';
import { instance } from './posthog-fast-feature-flags';

export const getMatchingVariant = (
  identity: string,
  featureFlag: ClientAssignedFeatureFlag
): string | null => {
  const lookupTable = variantLookupTable(featureFlag.variants);
  const hash = get_hash(featureFlag.key, identity, 'variant');

  for (const variant of lookupTable) {
    if (hash >= variant.value_min && hash < variant.value_max) {
      return variant.key;
    }
  }
  return null;
};

// TODO how should this behave for erroneous values?
export const variantLookupTable = (
  variants: Record<string, number>
): { value_min: number; value_max: number; key: string }[] => {
  const lookupTable: { value_min: number; value_max: number; key: string }[] =
    [];
  let valueMin = 0;

  for (const [variant, percentage] of Object.entries(variants)) {
    const valueMax = valueMin + percentage;
    lookupTable.push({
      value_min: valueMin,
      value_max: valueMax,
      key: variant,
    });
    valueMin = valueMax;
  }
  return lookupTable;
};

export const get_hash = (
  featureFlagKey: string,
  distinctId: string,
  salt: string = ''
): number => {
  const hashKey = `${featureFlagKey}.${distinctId}${salt}`;
  const hashHex = hash(hashKey);
  // TODO do we care about IE11 support for BigInt?
  const hashInt = BigInt(`0x${hashHex}`);
  const LONG_SCALE = BigInt('0xFFFFFFFFFFFFFFF');
  return Number(hashInt) / Number(LONG_SCALE); // Normalize the hash to a value between 0 and 1
};

// TODO how much do we trust sonnet to write a hashing function?
export const hash = (input: string): string => {
  function rotateLeft(n: number, s: number): number {
    return ((n << s) | (n >>> (32 - s))) >>> 0;
  }

  let H0 = 0x67452301;
  let H1 = 0xefcdab89;
  let H2 = 0x98badcfe;
  let H3 = 0x10325476;
  let H4 = 0xc3d2e1f0;

  // Convert string to byte array
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    bytes.push(char & 0xff);
  }

  // Add padding
  bytes.push(0x80);
  while ((bytes.length * 8) % 512 !== 448) {
    bytes.push(0);
  }

  const bitLen = input.length * 8;
  bytes.push(0, 0, 0, 0); // JavaScript bitwise ops are 32-bit
  bytes.push((bitLen >>> 24) & 0xff);
  bytes.push((bitLen >>> 16) & 0xff);
  bytes.push((bitLen >>> 8) & 0xff);
  bytes.push(bitLen & 0xff);

  // Process blocks
  for (let i = 0; i < bytes.length; i += 64) {
    const w = new Array(80);
    for (let j = 0; j < 16; j++) {
      w[j] =
        (bytes[i + j * 4] << 24) |
        (bytes[i + j * 4 + 1] << 16) |
        (bytes[i + j * 4 + 2] << 8) |
        bytes[i + j * 4 + 3];
    }

    for (let j = 16; j < 80; j++) {
      w[j] = rotateLeft(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    }

    let [a, b, c, d, e] = [H0, H1, H2, H3, H4];

    for (let j = 0; j < 80; j++) {
      const f =
        j < 20
          ? (b & c) | (~b & d)
          : j < 40
            ? b ^ c ^ d
            : j < 60
              ? (b & c) | (b & d) | (c & d)
              : b ^ c ^ d;

      const k =
        j < 20
          ? 0x5a827999
          : j < 40
            ? 0x6ed9eba1
            : j < 60
              ? 0x8f1bbcdc
              : 0xca62c1d6;

      const temp = (rotateLeft(a, 5) + f + e + k + w[j]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    H0 = (H0 + a) >>> 0;
    H1 = (H1 + b) >>> 0;
    H2 = (H2 + c) >>> 0;
    H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0;
  }

  return [H0, H1, H2, H3, H4]
    .map((n) => n.toString(16).padStart(8, '0'))
    .join('')
    .slice(0, 15);
};

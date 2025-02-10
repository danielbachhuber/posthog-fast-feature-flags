const fs = require('fs');
const path = require('path');
const {
  getMatchingVariant,
  get_hash,
  variantLookupTable,
} = require('../src/utils');

const readCsv = (filePath) => {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');

  // Find indices for all distinct_id columns
  const distinctIdIndices = headers
    .map((h, i) => (h.match(/^actor\.distinct_ids\.\d+$/) ? i : -1))
    .filter((i) => i !== -1);

  return rows.slice(1).map((row) => {
    const values = row.split(',');
    const distinctIds = distinctIdIndices
      .map((index) => values[index])
      .filter((id) => id && id.trim()); // Remove empty/blank IDs
    return distinctIds;
  });
};

const verify = (csvFileName, flagKey, expectedVariant) => {
  const csvFilePath = path.join(__dirname, '..', csvFileName);
  const userDistinctIds = readCsv(csvFilePath);

  // Analyze distinct ID counts
  const idCounts = userDistinctIds.reduce((acc, ids) => {
    const count = ids.length;
    acc[count] = (acc[count] || 0) + 1;
    return acc;
  }, {});

  console.log('\nDistinct ID count distribution:');
  Object.entries(idCounts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .forEach(([count, users]) => {
      console.log(
        `Users with ${count} distinct ID${count === '1' ? '' : 's'}: ${users}`
      );
    });

  const multipleIds = userDistinctIds.filter((ids) => ids.length > 1).length;
  const totalUsers = userDistinctIds.length;

  console.log(`\nTotal users: ${totalUsers}`);
  console.log(
    `Users with multiple IDs: ${multipleIds} (${((multipleIds / totalUsers) * 100).toFixed(2)}%)`
  );

  // Variant distribution analysis
  console.log('\nVariant Distribution Analysis:');
  const counts = {
    control: 0,
    test: 0,
  };

  const hashValues = [];

  const testFlag = {
    key: flagKey,
    variants: {
      control: 0.5,
      test: 0.5,
    },
  };

  // Debug the lookup table
  const lookupTable = variantLookupTable(testFlag.variants);
  console.log('\nVariant lookup table:');
  console.log(lookupTable);

  // Debug sample of mismatched assignments
  const mismatches = [];
  let totalMismatches = 0;

  // Use first distinct ID for each user for variant analysis
  userDistinctIds.forEach((ids) => {
    if (ids.length === 0) return;
    const primaryId = ids[0];

    const hash = get_hash(testFlag.key, primaryId, 'variant');
    hashValues.push(hash);
    const variant = getMatchingVariant(primaryId, testFlag);
    if (variant) {
      counts[variant]++;
      if (variant !== expectedVariant) {
        totalMismatches++;
        if (mismatches.length < 5) {
          mismatches.push({
            id: primaryId,
            hash,
            variant,
            expectedVariant,
          });
        }
      }
    }
  });

  console.log('\nVariant distribution:', counts);
  console.log('Distribution percentages:', {
    control: ((counts.control / totalUsers) * 100).toFixed(2) + '%',
    test: ((counts.test / totalUsers) * 100).toFixed(2) + '%',
  });
  console.log('Hash value statistics:', {
    min: Math.min(...hashValues),
    max: Math.max(...hashValues),
    avg: (hashValues.reduce((a, b) => a + b) / hashValues.length).toFixed(4),
  });

  console.log(
    `\nTotal mismatches: ${totalMismatches} (${((totalMismatches / totalUsers) * 100).toFixed(2)}%)`
  );

  if (mismatches.length > 0) {
    console.log('\nSample of mismatched assignments:');
    mismatches.forEach((sample) => {
      console.log(`ID: ${sample.id}`);
      console.log(`Hash: ${sample.hash}`);
      console.log(`Assigned variant: ${sample.variant}`);
      console.log(`Expected variant: ${sample.expectedVariant}\n`);
    });
  }
};

// Get command line arguments
const [, , csvFileName = null, flagKey = null, expectedVariant = null] =
  process.argv;

verify(csvFileName, flagKey, expectedVariant);

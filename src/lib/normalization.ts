import type { Dispensary } from '../schemas/dispensary';

/**
 * Suffixes stripped during owner/company name normalization.
 */
const STRIP_SUFFIXES = [
  'inc\\.?',
  'llc\\.?',
  'l\\.l\\.c\\.?',
  'corp\\.?',
  'corporation',
  'holdings',
  'company',
  'co\\.?',
  'ltd\\.?',
];

const SUFFIX_PATTERN = new RegExp(
  `\\b(${STRIP_SUFFIXES.join('|')})\\s*$`,
  'i',
);

/**
 * Normalize a name for comparison purposes.
 * Trim, lowercase, collapse whitespace, strip common business suffixes
 * and trailing punctuation.
 */
export function normalizeForComparison(name: string): string {
  let cleaned = name.trim().toLowerCase();
  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  // Strip common suffixes (may need multiple passes)
  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    cleaned = cleaned.replace(SUFFIX_PATTERN, '').trim();
  }
  // Strip trailing commas and periods
  cleaned = cleaned.replace(/[,.\s]+$/, '');
  return cleaned;
}

export interface NormalizationSuggestion {
  normalizedKey: string;
  field: 'owner' | 'parentCompany';
  variants: string[];
  licenseNumbers: string[];
  recordCount: number;
}

/**
 * Generate normalization suggestions by grouping records that have
 * different original spellings but normalize to the same key.
 *
 * Returns groups sorted by recordCount descending.
 */
export function generateNormalizationSuggestions(
  records: Dispensary[],
): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];

  // Process both owner and parentCompany fields
  for (const field of ['owner', 'parentCompany'] as const) {
    const groups = new Map<
      string,
      { variants: Set<string>; licenseNumbers: string[] }
    >();

    for (const record of records) {
      const value = record[field];
      if (!value) continue;

      const normalized = normalizeForComparison(value);
      if (!normalized) continue;

      let group = groups.get(normalized);
      if (!group) {
        group = { variants: new Set(), licenseNumbers: [] };
        groups.set(normalized, group);
      }
      group.variants.add(value);
      group.licenseNumbers.push(record.licenseNumber);
    }

    // Only include groups where multiple distinct original spellings exist
    for (const [normalizedKey, group] of groups) {
      if (group.variants.size > 1) {
        suggestions.push({
          normalizedKey,
          field,
          variants: Array.from(group.variants).sort(),
          licenseNumbers: group.licenseNumbers,
          recordCount: group.licenseNumbers.length,
        });
      }
    }
  }

  // Sort by recordCount descending
  suggestions.sort((a, b) => b.recordCount - a.recordCount);

  return suggestions;
}

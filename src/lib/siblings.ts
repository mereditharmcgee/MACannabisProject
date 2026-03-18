/**
 * Sibling location grouping by parent company.
 *
 * Groups dispensary records that share the same parentCompany,
 * enabling cross-links between locations owned by the same entity.
 */

interface SiblingRecord {
  parentCompany: string | null;
  slug: string;
  researchInconclusive: boolean;
  [key: string]: unknown;
}

/**
 * Build a Map from parentCompany name to array of records.
 *
 * Skips records with null/empty parentCompany and researchInconclusive records.
 */
export function groupByParentCompany<T extends SiblingRecord>(
  records: T[]
): Map<string, T[]> {
  const map = new Map<string, T[]>();

  for (const record of records) {
    if (!record.parentCompany || record.researchInconclusive) {
      continue;
    }

    const group = map.get(record.parentCompany) ?? [];
    group.push(record);
    map.set(record.parentCompany, group);
  }

  return map;
}

/**
 * Get sibling records for a given dispensary, excluding self.
 *
 * Returns empty array if the parentCompany group has only 1 member (self).
 */
export function getSiblings<T extends SiblingRecord>(
  currentSlug: string,
  allRecords: T[],
  siblingMap: Map<string, T[]>
): T[] {
  // Find this record's parentCompany
  const current = allRecords.find((r) => r.slug === currentSlug);
  if (!current?.parentCompany) {
    return [];
  }

  const group = siblingMap.get(current.parentCompany);
  if (!group || group.length <= 1) {
    return [];
  }

  return group.filter((r) => r.slug !== currentSlug);
}

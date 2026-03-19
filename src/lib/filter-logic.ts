/**
 * Pure filter logic functions for the dispensary directory.
 * Operates on simple data structures (Sets, Maps) -- no DOM dependency.
 * Designed for composition with the search system via set intersection.
 */

/**
 * Intersect any number of sets. null means "no constraint" (show all).
 * - All null => null (no constraints)
 * - Mix of null + Set => the Set (null is ignored)
 * - Multiple Sets => their intersection
 */
export function intersectSets(...sets: (Set<string> | null)[]): Set<string> | null {
  const nonNull = sets.filter((s): s is Set<string> => s !== null);
  if (nonNull.length === 0) return null;
  if (nonNull.length === 1) return nonNull[0];

  // Start with smallest set for efficiency
  const sorted = nonNull.sort((a, b) => a.size - b.size);
  const result = new Set<string>();
  for (const item of sorted[0]) {
    if (sorted.every(s => s.has(item))) {
      result.add(item);
    }
  }
  return result;
}

/**
 * Compute slugs matching any active tag (OR / union).
 * Returns null if no tags are active (no constraint).
 */
export function computeTagSlugs(
  activeTags: Set<string>,
  slugToTags: Map<string, string[]>,
): Set<string> | null {
  if (activeTags.size === 0) return null;

  const result = new Set<string>();
  for (const [slug, tags] of slugToTags) {
    for (const tag of tags) {
      if (activeTags.has(tag)) {
        result.add(slug);
        break;
      }
    }
  }
  return result;
}

/**
 * Compute slugs in the selected county.
 * Returns null if no county is selected (no constraint).
 */
export function computeCountySlugs(
  activeCounty: string,
  slugToCounty: Map<string, string>,
): Set<string> | null {
  if (!activeCounty) return null;

  const result = new Set<string>();
  for (const [slug, county] of slugToCounty) {
    if (county === activeCounty) {
      result.add(slug);
    }
  }
  return result;
}

/**
 * Compose search, tag, and county filters via intersection.
 * Each dimension is null (no constraint) or a Set of matching slugs.
 */
export function computeVisibleSlugs(
  searchSlugs: Set<string> | null,
  tagSlugs: Set<string> | null,
  countySlugs: Set<string> | null,
): Set<string> | null {
  return intersectSets(searchSlugs, tagSlugs, countySlugs);
}

/**
 * For each tag, count how many dispensaries have it within baseSlugs.
 * baseSlugs null = count across all dispensaries.
 */
export function computeTagCounts(
  slugToTags: Map<string, string[]>,
  baseSlugs: Set<string> | null,
  tags: string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    counts.set(tag, 0);
  }

  for (const [slug, slugTags] of slugToTags) {
    if (baseSlugs !== null && !baseSlugs.has(slug)) continue;
    for (const tag of slugTags) {
      if (counts.has(tag)) {
        counts.set(tag, counts.get(tag)! + 1);
      }
    }
  }

  return counts;
}

/**
 * For each county, count how many dispensaries are in it within baseSlugs.
 * baseSlugs null = count across all dispensaries.
 */
export function computeCountyCounts(
  slugToCounty: Map<string, string>,
  baseSlugs: Set<string> | null,
  counties: string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const county of counties) {
    counts.set(county, 0);
  }

  for (const [slug, county] of slugToCounty) {
    if (baseSlugs !== null && !baseSlugs.has(slug)) continue;
    if (counts.has(county)) {
      counts.set(county, counts.get(county)! + 1);
    }
  }

  return counts;
}

/**
 * Slug generation utilities with legal suffix stripping and collision disambiguation.
 *
 * Used by the data pipeline (xlsx-parser) and detail page routing.
 */

/**
 * Regex matching common legal entity suffixes (case-insensitive).
 * Matches: Inc, LLC, Corp, Ltd, Co, LP, PLC, PLLC and dotted variants.
 */
const LEGAL_SUFFIXES =
  /[,]?\s*\b(inc\.?|l\.?l\.?c\.?|corp\.?|l\.?t\.?d\.?|co\.?|l\.?p\.?|p\.?l\.?c\.?|p\.?l\.?l\.?c\.?)\b\.?\s*$/i;

/**
 * Strip legal suffixes (Inc, LLC, Corp, Ltd, Co, LP, PLC, PLLC) from a name.
 * Also trims trailing whitespace and commas after stripping.
 */
export function stripLegalSuffix(name: string): string {
  return name.replace(LEGAL_SUFFIXES, '').replace(/[,\s]+$/, '').trim();
}

/**
 * Generate a URL-safe slug from a trade name.
 * Strips legal suffixes first, then lowercases and replaces non-alphanumeric chars.
 */
export function generateSlug(tradeName: string): string {
  const stripped = stripLegalSuffix(tradeName);
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate slugs for an array of records, disambiguating collisions by appending town name.
 * Returns an array of final slugs in the same order as input records.
 */
export function deduplicateSlugs(
  records: Array<{ tradeName: string; town: string | null }>
): string[] {
  // Generate base slugs
  const baseSlugs = records.map((r) => generateSlug(r.tradeName));

  // Detect collisions: map base slug to array of indices
  const seen = new Map<string, number[]>();
  baseSlugs.forEach((slug, i) => {
    const indices = seen.get(slug) ?? [];
    indices.push(i);
    seen.set(slug, indices);
  });

  // Build final slugs, disambiguating by town first, then by numeric suffix if still colliding
  const finalSlugs: string[] = new Array(records.length);
  for (const [slug, indices] of seen) {
    if (indices.length === 1) {
      finalSlugs[indices[0]] = slug;
    } else {
      // Disambiguate by town
      for (const i of indices) {
        const town =
          records[i].town?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown';
        finalSlugs[i] = `${slug}-${town}`;
      }
    }
  }

  // Second pass: resolve any remaining collisions (same name + same town) with numeric suffix
  const slugCounts = new Map<string, number>();
  for (let i = 0; i < finalSlugs.length; i++) {
    const s = finalSlugs[i];
    const count = slugCounts.get(s) ?? 0;
    slugCounts.set(s, count + 1);
    if (count > 0) {
      finalSlugs[i] = `${s}-${count + 1}`;
    }
  }

  return finalSlugs;
}

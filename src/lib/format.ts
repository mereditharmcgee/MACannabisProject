/**
 * Format helpers for dispensary display.
 * Used by DispensaryGridCard and other components.
 */

const UPPERCASE_SUFFIXES = new Set(['llc', 'llp']);

/**
 * Convert an ALL-CAPS trade name to Title Case.
 * Capitalizes first letter after word boundaries (start, space, hyphen, slash).
 * Uppercases legal suffixes (Inc -> Inc., LLC, LLP).
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|[\s\-\/])(\w)/g, (match, letter) =>
      match.slice(0, -1) + letter.toUpperCase()
    )
    .replace(/\b(\w+)\b/g, (word) => {
      if (UPPERCASE_SUFFIXES.has(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word;
    });
}

const LICENSE_LABEL_MAP: Record<string, string> = {
  'Marijuana Retailer': 'Storefront',
  'Marijuana Delivery Operator': 'Delivery',
  'Marijuana Courier': 'Delivery',
  'Marijuana Microbusiness': 'Microbusiness',
  'Medical Marijuana Treatment Center': 'Medical',
  'Microbusiness Delivery': 'Delivery',
};

/**
 * Map official MCC license type names to user-friendly display labels.
 * Returns the raw value as fallback for unrecognized types.
 * Returns null for null/undefined input.
 */
export function getLicenseLabel(licenseType: string | null | undefined): string | null {
  if (licenseType == null) return null;
  return LICENSE_LABEL_MAP[licenseType] ?? licenseType;
}

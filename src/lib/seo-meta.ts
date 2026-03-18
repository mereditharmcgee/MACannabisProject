/**
 * SEO meta title and description generation for dispensary detail pages.
 *
 * Title format is locked per DETL-07: "Who Owns [Name]? | MA Cannabis Directory"
 */

/**
 * Build the meta title for a dispensary detail page.
 *
 * Locked format: "Who Owns {tradeName}? | MA Cannabis Directory"
 */
export function buildMetaTitle(tradeName: string): string {
  return `Who Owns ${tradeName}? | MA Cannabis Directory`;
}

interface MetaDescriptionInput {
  tradeName: string;
  town: string | null;
  licenseType: string | null;
}

/**
 * Build the meta description for a dispensary detail page.
 *
 * Optimized for "who owns [dispensary]" search queries.
 */
export function buildMetaDescription(d: MetaDescriptionInput): string {
  const town = d.town ?? 'Massachusetts';
  const licenseType = d.licenseType ?? 'cannabis business';
  return `Find out who owns ${d.tradeName} in ${town}, Massachusetts. Ownership details, parent company, and license information for this ${licenseType}.`;
}

/**
 * JSON-LD structured data builder for dispensary detail pages.
 *
 * Produces schema.org Store objects for Google Rich Results.
 */

interface JsonLdInput {
  tradeName: string;
  address: string | null;
  town: string | null;
  phone: string | null;
  slug: string;
}

/**
 * Build a schema.org Store JSON-LD object for a dispensary.
 *
 * @param dispensary - Dispensary record fields needed for structured data
 * @param siteUrl - Base site URL (no trailing slash)
 * @returns Plain object suitable for JSON.stringify into a script tag
 */
export function buildJsonLd(
  dispensary: JsonLdInput,
  siteUrl: string
): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: dispensary.tradeName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: dispensary.address,
      addressLocality: dispensary.town,
      addressRegion: 'MA',
      addressCountry: 'US',
    },
    url: `${siteUrl}/dispensary/${dispensary.slug}/`,
  };

  if (dispensary.phone) {
    jsonLd.telephone = dispensary.phone;
  }

  return jsonLd;
}

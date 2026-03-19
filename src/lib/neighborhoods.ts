/**
 * Boston zip code to neighborhood mapping.
 * Used to make Boston dispensaries searchable by neighborhood name
 * (e.g., searching "Brighton" finds dispensaries in 02134/02135).
 */
export const BOSTON_ZIP_TO_NEIGHBORHOOD: Record<string, string> = {
  '02108': 'Beacon Hill',
  '02109': 'Downtown',
  '02110': 'Financial District',
  '02111': 'Chinatown / Leather District',
  '02113': 'North End',
  '02114': 'West End / Beacon Hill',
  '02115': 'Fenway / Longwood',
  '02116': 'Back Bay',
  '02118': 'South End',
  '02119': 'Roxbury',
  '02120': 'Mission Hill',
  '02121': 'Dorchester',
  '02122': 'Dorchester',
  '02124': 'Dorchester',
  '02125': 'Dorchester',
  '02126': 'Mattapan',
  '02127': 'South Boston',
  '02128': 'East Boston',
  '02129': 'Charlestown',
  '02130': 'Jamaica Plain',
  '02131': 'Roslindale',
  '02132': 'West Roxbury',
  '02134': 'Allston / Brighton',
  '02135': 'Brighton',
  '02136': 'Hyde Park',
  '02163': 'Allston',
  '02199': 'Prudential / Back Bay',
  '02210': 'Seaport',
  '02215': 'Fenway',
};

/**
 * Derive neighborhood from zip code for Boston dispensaries.
 * Returns null for non-Boston records or unknown zips.
 */
export function getNeighborhood(town: string | null, zip: string | null): string | null {
  if (!town || !zip) return null;
  if (town.toLowerCase() !== 'boston') return null;
  return BOSTON_ZIP_TO_NEIGHBORHOOD[zip] ?? null;
}

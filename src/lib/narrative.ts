/**
 * Three-state narrative generation from structured dispensary data.
 *
 * Produces prose for detail page ownership narratives based on record state:
 * - "inconclusive": research inconclusive, no narrative shown
 * - "pending": ownership details being researched
 * - "full": 2-3 sentence prose from structured ownershipDetails
 */

interface NarrativeInput {
  tradeName: string;
  owner: string | null;
  town: string | null;
  ownershipDetails: string | null;
  needsNarrative: boolean;
  researchInconclusive: boolean;
}

interface NarrativeResult {
  text: string;
  type: 'full' | 'pending' | 'inconclusive';
}

/**
 * Generate a narrative for a dispensary record.
 *
 * Returns { text, type } where type determines how the template renders the section.
 */
export function generateNarrative(d: NarrativeInput): NarrativeResult {
  if (d.researchInconclusive) {
    return { text: '', type: 'inconclusive' };
  }

  if (d.needsNarrative || !d.ownershipDetails) {
    return {
      text: `Ownership details for ${d.tradeName} are being researched.`,
      type: 'pending',
    };
  }

  return { text: composeProse(d), type: 'full' };
}

/**
 * Compose 2-3 sentence prose from structured ownershipDetails.
 *
 * ownershipDetails is semicolon-delimited (e.g., "Small Chain (2 locations); Retailer Only; Local operator").
 */
function composeProse(d: NarrativeInput): string {
  const facts = (d.ownershipDetails ?? '')
    .split(';')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  // Extract owner name without parenthetical role
  const ownerName = d.owner
    ? d.owner.replace(/\s*\(.*?\)\s*/g, '').trim()
    : null;

  // First sentence: who operates it and where
  const location = d.town ? ` in ${d.town}` : '';
  const operator = ownerName ? ` is operated by ${ownerName}` : '';
  const firstSentence = `${d.tradeName}${location}${operator}.`;

  // Second sentence: weave in ownership facts
  let secondSentence = '';
  if (facts.length > 0) {
    const factList = facts.join(', ').toLowerCase();
    secondSentence = ` This ${d.town ? 'location' : 'business'} is characterized as ${factList}.`;
  }

  return `${firstSentence}${secondSentence}`.trim();
}

import { describe, it, expect } from 'vitest';
import { generateNarrative } from '../src/lib/narrative';

describe('generateNarrative', () => {
  it('returns type "inconclusive" with empty text for researchInconclusive records', () => {
    const result = generateNarrative({
      tradeName: 'Test Store',
      owner: null,
      town: null,
      ownershipDetails: null,
      needsNarrative: false,
      researchInconclusive: true,
    });
    expect(result.type).toBe('inconclusive');
    expect(result.text).toBe('');
  });

  it('returns type "pending" with researching notice for needsNarrative records', () => {
    const result = generateNarrative({
      tradeName: 'Test Store',
      owner: 'John Doe',
      town: 'Boston',
      ownershipDetails: null,
      needsNarrative: true,
      researchInconclusive: false,
    });
    expect(result.type).toBe('pending');
    expect(result.text).toContain('Ownership details for Test Store are being researched');
  });

  it('returns type "full" with prose for records with ownershipDetails', () => {
    const result = generateNarrative({
      tradeName: 'THE HAVEN CENTER',
      owner: 'Christopher Taloumis (Founder/CEO)',
      town: 'Brewster',
      ownershipDetails: 'Small Chain (2 locations); Retailer Only; Local operator',
      needsNarrative: false,
      researchInconclusive: false,
    });
    expect(result.type).toBe('full');
    expect(result.text).toContain('THE HAVEN CENTER');
    expect(result.text).toContain('Christopher Taloumis');
    // Should mention key facts from ownershipDetails
    expect(result.text.length).toBeGreaterThan(20);
  });

  it('generates narrative text that is 2-3 sentences', () => {
    const result = generateNarrative({
      tradeName: 'Green Leaf',
      owner: 'Jane Smith',
      town: 'Salem',
      ownershipDetails: 'Independent; Single Location; Retailer Only',
      needsNarrative: false,
      researchInconclusive: false,
    });
    expect(result.text).toMatch(/\.$/); // ends with period
    const sentences = result.text.split(/\.\s+/).filter(s => s.length > 0);
    expect(sentences.length).toBeGreaterThanOrEqual(2);
    expect(sentences.length).toBeLessThanOrEqual(3);
  });
});

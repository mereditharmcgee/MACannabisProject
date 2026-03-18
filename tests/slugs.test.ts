import { describe, it, expect } from 'vitest';
import { stripLegalSuffix, generateSlug, deduplicateSlugs } from '../src/lib/slugs';

describe('stripLegalSuffix', () => {
  it('strips "INC." with comma prefix', () => {
    expect(stripLegalSuffix('THE HAVEN CENTER, INC.')).toBe('THE HAVEN CENTER');
  });

  it('strips "LLC" without punctuation', () => {
    expect(stripLegalSuffix('Green Leaf LLC')).toBe('Green Leaf');
  });

  it('returns unchanged when no legal suffix', () => {
    expect(stripLegalSuffix('Simply Cannabis')).toBe('Simply Cannabis');
  });

  it('strips "Corp" case-insensitively', () => {
    expect(stripLegalSuffix('Big Corp')).toBe('Big');
  });

  it('strips dotted variants like "L.L.C."', () => {
    expect(stripLegalSuffix('Green Leaf L.L.C.')).toBe('Green Leaf');
  });

  it('strips "Ltd"', () => {
    expect(stripLegalSuffix('Green Leaf Ltd')).toBe('Green Leaf');
  });

  it('strips "LP"', () => {
    expect(stripLegalSuffix('Green Leaf LP')).toBe('Green Leaf');
  });
});

describe('generateSlug', () => {
  it('strips legal suffix and generates slug', () => {
    expect(generateSlug('THE HAVEN CENTER, INC.')).toBe('the-haven-center');
  });

  it('handles ampersands', () => {
    expect(generateSlug('Mac & Cheese LLC')).toBe('mac-cheese');
  });

  it('handles apostrophes', () => {
    expect(generateSlug("Mary's Dispensary")).toBe('marys-dispensary');
  });

  it('handles special characters', () => {
    expect(generateSlug('Test (Store) #1')).toBe('test-store-1');
  });

  it('collapses multiple hyphens', () => {
    expect(generateSlug('A -- B')).toBe('a-b');
  });

  it('trims leading and trailing hyphens', () => {
    expect(generateSlug('  --Hello World--  ')).toBe('hello-world');
  });
});

describe('deduplicateSlugs', () => {
  it('disambiguates collisions by appending town name', () => {
    const records = [
      { tradeName: 'In Good Health Inc', town: 'Sandwich' },
      { tradeName: 'In Good Health LLC', town: 'Brockton' },
    ];
    const slugs = deduplicateSlugs(records);
    expect(slugs).toEqual(['in-good-health-sandwich', 'in-good-health-brockton']);
  });

  it('leaves non-colliding slugs unchanged', () => {
    const records = [
      { tradeName: 'Alpha Store Inc', town: 'Boston' },
      { tradeName: 'Beta Shop LLC', town: 'Salem' },
    ];
    const slugs = deduplicateSlugs(records);
    expect(slugs).toEqual(['alpha-store', 'beta-shop']);
  });

  it('handles null town by using "unknown"', () => {
    const records = [
      { tradeName: 'Same Name Inc', town: null },
      { tradeName: 'Same Name LLC', town: 'Boston' },
    ];
    const slugs = deduplicateSlugs(records);
    expect(slugs).toEqual(['same-name-unknown', 'same-name-boston']);
  });
});

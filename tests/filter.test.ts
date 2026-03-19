import { describe, it, expect } from 'vitest';
import {
  intersectSets,
  computeTagSlugs,
  computeCountySlugs,
  computeVisibleSlugs,
  computeTagCounts,
  computeCountyCounts,
} from '../src/lib/filter-logic';

// Test fixtures: 5 dispensary stubs
const slugToTags = new Map<string, string[]>([
  ['dispensary-a', ['Social Equity', 'Economic Empowerment']],
  ['dispensary-b', ['MTC Priority']],
  ['dispensary-c', ['Social Equity']],
  ['dispensary-d', []],
  ['dispensary-e', ['Economic Empowerment', 'MTC Priority']],
]);

const slugToCounty = new Map<string, string>([
  ['dispensary-a', 'suffolk'],
  ['dispensary-b', 'suffolk'],
  ['dispensary-c', 'middlesex'],
  ['dispensary-d', 'worcester'],
  ['dispensary-e', 'middlesex'],
]);

describe('intersectSets', () => {
  it('returns null when all inputs are null', () => {
    expect(intersectSets(null, null)).toBe(null);
  });

  it('returns the set when one is null and one is a set', () => {
    const s = new Set(['a', 'b']);
    expect(intersectSets(null, s)).toEqual(s);
    expect(intersectSets(s, null)).toEqual(s);
  });

  it('returns intersection of two sets', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    const result = intersectSets(a, b);
    expect(result).toEqual(new Set(['b', 'c']));
  });

  it('returns empty set when sets have no overlap', () => {
    const a = new Set(['a']);
    const b = new Set(['b']);
    expect(intersectSets(a, b)).toEqual(new Set());
  });

  it('handles three or more arguments', () => {
    const a = new Set(['a', 'b', 'c']);
    const b = new Set(['b', 'c', 'd']);
    const c = new Set(['c', 'd', 'e']);
    expect(intersectSets(a, b, c)).toEqual(new Set(['c']));
  });

  it('skips nulls in multi-argument calls', () => {
    const a = new Set(['a', 'b']);
    expect(intersectSets(null, a, null)).toEqual(a);
  });
});

describe('computeTagSlugs', () => {
  it('returns null when no tags are active', () => {
    expect(computeTagSlugs(new Set(), slugToTags)).toBe(null);
  });

  it('returns slugs matching a single tag', () => {
    const result = computeTagSlugs(new Set(['Social Equity']), slugToTags);
    expect(result).toEqual(new Set(['dispensary-a', 'dispensary-c']));
  });

  it('returns union (OR) of slugs for multiple tags', () => {
    const result = computeTagSlugs(new Set(['Social Equity', 'MTC Priority']), slugToTags);
    expect(result).toEqual(new Set(['dispensary-a', 'dispensary-b', 'dispensary-c', 'dispensary-e']));
  });
});

describe('computeCountySlugs', () => {
  it('returns null when no county is selected', () => {
    expect(computeCountySlugs('', slugToCounty)).toBe(null);
  });

  it('returns slugs in the selected county', () => {
    const result = computeCountySlugs('suffolk', slugToCounty);
    expect(result).toEqual(new Set(['dispensary-a', 'dispensary-b']));
  });

  it('returns empty set for county with no matches', () => {
    const result = computeCountySlugs('barnstable', slugToCounty);
    expect(result).toEqual(new Set());
  });
});

describe('computeVisibleSlugs', () => {
  it('returns null when all inputs are null (show all)', () => {
    expect(computeVisibleSlugs(null, null, null)).toBe(null);
  });

  it('composes search + tags via intersection', () => {
    const search = new Set(['dispensary-a', 'dispensary-b', 'dispensary-c']);
    const tags = new Set(['dispensary-a', 'dispensary-c']);
    const result = computeVisibleSlugs(search, tags, null);
    expect(result).toEqual(new Set(['dispensary-a', 'dispensary-c']));
  });

  it('composes all three dimensions', () => {
    const search = new Set(['dispensary-a', 'dispensary-b', 'dispensary-c']);
    const tags = new Set(['dispensary-a', 'dispensary-c']);
    const county = new Set(['dispensary-a', 'dispensary-b']);
    const result = computeVisibleSlugs(search, tags, county);
    expect(result).toEqual(new Set(['dispensary-a']));
  });
});

describe('computeTagCounts', () => {
  it('counts dispensaries per tag within a base set', () => {
    const baseSlugs = new Set(['dispensary-a', 'dispensary-b', 'dispensary-c']);
    const tags = ['Social Equity', 'Economic Empowerment', 'MTC Priority'];
    const counts = computeTagCounts(slugToTags, baseSlugs, tags);
    expect(counts.get('Social Equity')).toBe(2);
    expect(counts.get('Economic Empowerment')).toBe(1);
    expect(counts.get('MTC Priority')).toBe(1);
  });

  it('counts all dispensaries when baseSlugs is null', () => {
    const tags = ['Social Equity', 'Economic Empowerment', 'MTC Priority'];
    const counts = computeTagCounts(slugToTags, null, tags);
    expect(counts.get('Social Equity')).toBe(2);
    expect(counts.get('Economic Empowerment')).toBe(2);
    expect(counts.get('MTC Priority')).toBe(2);
  });
});

describe('computeCountyCounts', () => {
  it('counts dispensaries per county within a base set', () => {
    const baseSlugs = new Set(['dispensary-a', 'dispensary-c', 'dispensary-e']);
    const counties = ['suffolk', 'middlesex', 'worcester'];
    const counts = computeCountyCounts(slugToCounty, baseSlugs, counties);
    expect(counts.get('suffolk')).toBe(1);
    expect(counts.get('middlesex')).toBe(2);
    expect(counts.get('worcester')).toBe(0);
  });

  it('counts all dispensaries when baseSlugs is null', () => {
    const counties = ['suffolk', 'middlesex', 'worcester'];
    const counts = computeCountyCounts(slugToCounty, null, counties);
    expect(counts.get('suffolk')).toBe(2);
    expect(counts.get('middlesex')).toBe(2);
    expect(counts.get('worcester')).toBe(1);
  });
});

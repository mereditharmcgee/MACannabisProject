import { describe, it, expect } from 'vitest';
import Fuse from 'fuse.js';
import { FUSE_OPTIONS } from '../scripts/build-search-index';

interface SearchRecord {
  slug: string;
  tradeName: string;
  town: string;
  owner: string;
}

const fixtures: SearchRecord[] = [
  { slug: 'green-leaf-boston', tradeName: 'GREEN LEAF DISPENSARY', town: 'Boston', owner: 'John Smith' },
  { slug: 'harbor-worcester', tradeName: 'HARBOR CANNABIS', town: 'Worcester', owner: 'Jane Doe' },
  { slug: 'boston-buds-boston', tradeName: 'BOSTON BUDS', town: 'Boston', owner: 'John Smith' },
  { slug: 'cape-relief-barnstable', tradeName: 'CAPE RELIEF', town: 'Barnstable', owner: 'Maria Garcia' },
  { slug: 'worcester-wellness', tradeName: 'WORCESTER WELLNESS', town: 'Worcester', owner: 'Tom Brown' },
  { slug: 'smith-supply-springfield', tradeName: 'SMITH SUPPLY', town: 'Springfield', owner: 'Alice Jones' },
];

function createFuse(records: SearchRecord[]) {
  const index = Fuse.createIndex(FUSE_OPTIONS.keys!, records);
  return new Fuse(records, FUSE_OPTIONS, index);
}

describe('Fuse.js search behavior', () => {
  const fuse = createFuse(fixtures);

  it('search for a dispensary name returns that dispensary', () => {
    const results = fuse.search('GREEN LEAF');
    const slugs = results.map(r => r.item.slug);
    expect(slugs).toContain('green-leaf-boston');
  });

  it('search for a town returns all dispensaries in that town', () => {
    const results = fuse.search('Worcester');
    const slugs = results.map(r => r.item.slug);
    expect(slugs).toContain('harbor-worcester');
    expect(slugs).toContain('worcester-wellness');
  });

  it('search for an owner returns all dispensaries they own', () => {
    const results = fuse.search('John Smith');
    const slugs = results.map(r => r.item.slug);
    expect(slugs).toContain('green-leaf-boston');
    expect(slugs).toContain('boston-buds-boston');
  });

  it('tradeName matches rank higher than town/owner matches', () => {
    // "Smith" appears as tradeName in SMITH SUPPLY and as owner in two others
    const results = fuse.search('Smith');
    // SMITH SUPPLY should rank first because tradeName has weight 2
    expect(results[0].item.slug).toBe('smith-supply-springfield');
  });

  it('fuzzy matching tolerates 1-2 character typos', () => {
    const results = fuse.search('Worcster'); // missing 'e'
    const slugs = results.map(r => r.item.slug);
    expect(slugs.some(s => s.includes('worcester'))).toBe(true);
  });

  it('empty string query is handled gracefully', () => {
    // Empty query should not be passed to fuse.search in app code,
    // but Fuse itself returns empty array for empty string
    const results = fuse.search('');
    expect(results).toEqual([]);
  });
});

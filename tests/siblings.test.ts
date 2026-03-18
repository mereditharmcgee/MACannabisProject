import { describe, it, expect } from 'vitest';
import { groupByParentCompany, getSiblings } from '../src/lib/siblings';

describe('groupByParentCompany', () => {
  it('groups records with same parentCompany', () => {
    const records = [
      { parentCompany: 'Acme Corp', slug: 'store-a', researchInconclusive: false },
      { parentCompany: 'Acme Corp', slug: 'store-b', researchInconclusive: false },
      { parentCompany: 'Beta Inc', slug: 'store-c', researchInconclusive: false },
    ];
    const map = groupByParentCompany(records);
    expect(map.get('Acme Corp')?.length).toBe(2);
    expect(map.get('Beta Inc')?.length).toBe(1);
  });

  it('skips records with null parentCompany', () => {
    const records = [
      { parentCompany: null, slug: 'orphan', researchInconclusive: false },
      { parentCompany: 'Acme Corp', slug: 'store-a', researchInconclusive: false },
    ];
    const map = groupByParentCompany(records);
    expect(map.has('')).toBe(false);
    expect(map.size).toBe(1);
  });

  it('skips records with empty string parentCompany', () => {
    const records = [
      { parentCompany: '', slug: 'orphan', researchInconclusive: false },
    ];
    const map = groupByParentCompany(records);
    expect(map.size).toBe(0);
  });

  it('excludes researchInconclusive records', () => {
    const records = [
      { parentCompany: 'Acme Corp', slug: 'store-a', researchInconclusive: false },
      { parentCompany: 'Acme Corp', slug: 'store-b', researchInconclusive: true },
    ];
    const map = groupByParentCompany(records);
    expect(map.get('Acme Corp')?.length).toBe(1);
  });
});

describe('getSiblings', () => {
  const records = [
    { parentCompany: 'Acme Corp', slug: 'store-a', tradeName: 'Store A', town: 'Boston', researchInconclusive: false },
    { parentCompany: 'Acme Corp', slug: 'store-b', tradeName: 'Store B', town: 'Salem', researchInconclusive: false },
    { parentCompany: 'Acme Corp', slug: 'store-c', tradeName: 'Store C', town: 'Lynn', researchInconclusive: false },
    { parentCompany: 'Solo Inc', slug: 'solo', tradeName: 'Solo', town: 'Quincy', researchInconclusive: false },
  ];

  it('excludes self from sibling list', () => {
    const siblingMap = groupByParentCompany(records);
    const siblings = getSiblings('store-a', records, siblingMap);
    expect(siblings.every((s: any) => s.slug !== 'store-a')).toBe(true);
    expect(siblings.length).toBe(2);
  });

  it('returns empty array for single-location parentCompany', () => {
    const siblingMap = groupByParentCompany(records);
    const siblings = getSiblings('solo', records, siblingMap);
    expect(siblings).toEqual([]);
  });
});

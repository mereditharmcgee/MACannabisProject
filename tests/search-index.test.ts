import { describe, it, expect } from 'vitest';
import Fuse from 'fuse.js';
import { transformRecords, FUSE_OPTIONS } from '../scripts/build-search-index';

const sampleRecords = [
  {
    id: 'MR001',
    tradeName: 'GREEN LEAF DISPENSARY',
    slug: 'green-leaf-dispensary-boston',
    town: 'Boston',
    owner: 'John Smith (CEO)',
    licenseNumber: 'MR001',
    normalizedOwner: null,
    brandCompany: null,
    parentCompany: null,
    address: '123 Main St',
    county: 'Suffolk County',
    phone: '555-0001',
    licenseType: 'Marijuana Retailer',
    ownershipDetails: null,
    independent: null,
    specialStatusTags: [],
  },
  {
    id: 'MR002',
    tradeName: 'HARBOR CANNABIS',
    slug: 'harbor-cannabis-worcester',
    town: 'Worcester',
    owner: 'Jane Doe (President/Founder)',
    licenseNumber: 'MR002',
    normalizedOwner: null,
    brandCompany: null,
    parentCompany: null,
    address: '456 Oak Ave',
    county: 'Worcester County',
    phone: '555-0002',
    licenseType: 'Marijuana Retailer',
    ownershipDetails: null,
    independent: null,
    specialStatusTags: [],
  },
  {
    id: 'MR003',
    tradeName: 'BOSTON BUDS',
    slug: 'boston-buds-boston',
    town: 'Boston',
    owner: 'John Smith (CEO)',
    licenseNumber: 'MR003',
    normalizedOwner: null,
    brandCompany: null,
    parentCompany: null,
    address: '789 Elm St',
    county: 'Suffolk County',
    phone: '555-0003',
    licenseType: 'Marijuana Retailer',
    ownershipDetails: null,
    independent: null,
    specialStatusTags: [],
  },
];

describe('transformRecords', () => {
  it('produces records with only slug, tradeName, town, owner, zip fields', () => {
    const result = transformRecords(sampleRecords);
    for (const record of result) {
      expect(Object.keys(record).sort()).toEqual(['owner', 'slug', 'town', 'tradeName', 'zip']);
    }
  });

  it('strips parenthetical roles from owner field', () => {
    const result = transformRecords(sampleRecords);
    expect(result[0].owner).toBe('John Smith');
    expect(result[1].owner).toBe('Jane Doe');
  });

  it('uses empty string for null town/owner values', () => {
    const records = [
      { ...sampleRecords[0], town: null, owner: null },
    ];
    const result = transformRecords(records);
    expect(result[0].town).toBe('');
    expect(result[0].owner).toBe('');
  });

  it('produces output parseable by Fuse.parseIndex', () => {
    const result = transformRecords(sampleRecords);
    const index = Fuse.createIndex(FUSE_OPTIONS.keys!, result);
    const serialized = index.toJSON();
    // Should not throw
    const parsed = Fuse.parseIndex(serialized);
    expect(parsed).toBeDefined();
    // Should be usable with Fuse
    const fuse = new Fuse(result, FUSE_OPTIONS, parsed);
    expect(fuse).toBeDefined();
  });
});

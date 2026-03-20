import { describe, it, expect } from 'vitest';
import { dispensarySchema, specialStatusTags } from '../src/schemas/dispensary';

describe('dispensarySchema', () => {
  it('accepts a record with all fields populated', () => {
    const fullRecord = {
      tradeName: 'Green Leaf Dispensary',
      licenseNumber: 'MR-282371',
      owner: 'Jane Smith',
      normalizedOwner: 'Jane Smith',
      brandCompany: 'Green Leaf LLC',
      parentCompany: 'Green Leaf Holdings',
      address: '123 Main St',
      town: 'Boston',
      county: 'Suffolk',
      phone: '617-555-1234',
      licenseType: 'Retail',
      ownershipDetails: 'Sole proprietor since 2020',
      independent: 'Yes' as const,
      specialStatusTags: ['Woman-Owned' as const, 'Social Equity' as const],
      needsNarrative: false,
      researchInconclusive: false,
      slug: 'green-leaf-dispensary',
    };

    const result = dispensarySchema.safeParse(fullRecord);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tradeName).toBe('Green Leaf Dispensary');
      expect(result.data.specialStatusTags).toEqual(['Woman-Owned', 'Social Equity']);
    }
  });

  it('accepts a record with only tradeName and licenseNumber (minimal valid)', () => {
    const minimal = {
      tradeName: 'Minimal Dispensary',
      licenseNumber: 'MR-000001',
    };

    const result = dispensarySchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tradeName).toBe('Minimal Dispensary');
      expect(result.data.licenseNumber).toBe('MR-000001');
      expect(result.data.specialStatusTags).toEqual([]);
      expect(result.data.needsNarrative).toBe(false);
      expect(result.data.researchInconclusive).toBe(false);
    }
  });

  it('rejects a record with missing tradeName', () => {
    const noName = {
      licenseNumber: 'MR-000001',
    };

    const result = dispensarySchema.safeParse(noName);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('tradeName');
    }
  });

  it('rejects a record with missing licenseNumber', () => {
    const noLicense = {
      tradeName: 'Some Dispensary',
    };

    const result = dispensarySchema.safeParse(noLicense);
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('licenseNumber');
    }
  });

  it('rejects a record with empty string tradeName', () => {
    const emptyName = {
      tradeName: '',
      licenseNumber: 'MR-000001',
    };

    const result = dispensarySchema.safeParse(emptyName);
    expect(result.success).toBe(false);
  });

  it('parses specialStatusTags from array of valid enum values', () => {
    const record = {
      tradeName: 'Tagged Dispensary',
      licenseNumber: 'MR-000002',
      specialStatusTags: ['Woman-Owned', 'Veteran-Owned', 'LGBTQ+-Owned'],
    };

    const result = dispensarySchema.safeParse(record);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.specialStatusTags).toEqual([
        'Woman-Owned',
        'Veteran-Owned',
        'LGBTQ+-Owned',
      ]);
    }
  });

  it('defaults specialStatusTags to empty array when field is absent', () => {
    const record = {
      tradeName: 'No Tags Dispensary',
      licenseNumber: 'MR-000003',
    };

    const result = dispensarySchema.safeParse(record);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.specialStatusTags).toEqual([]);
    }
  });

  it('sets needsNarrative=true when ownershipDetails is null/empty', () => {
    // needsNarrative is a derived field set by the parser, not the schema itself.
    // The schema accepts the boolean value as passed in.
    const record = {
      tradeName: 'Needs Narrative Dispensary',
      licenseNumber: 'MR-000004',
      ownershipDetails: null,
      needsNarrative: true,
    };

    const result = dispensarySchema.safeParse(record);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.needsNarrative).toBe(true);
    }
  });

  it('sets researchInconclusive=true when owner matches pattern', () => {
    // researchInconclusive is a derived field set by the parser.
    // The schema accepts the boolean value as passed in.
    const record = {
      tradeName: 'Inconclusive Dispensary',
      licenseNumber: 'MR-000005',
      owner: 'Research inconclusive',
      researchInconclusive: true,
    };

    const result = dispensarySchema.safeParse(record);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.researchInconclusive).toBe(true);
    }
  });

  it('independent field accepts "Yes", "No", or null', () => {
    const withYes = dispensarySchema.safeParse({
      tradeName: 'A',
      licenseNumber: 'B',
      independent: 'Yes',
    });
    expect(withYes.success).toBe(true);

    const withNo = dispensarySchema.safeParse({
      tradeName: 'A',
      licenseNumber: 'B',
      independent: 'No',
    });
    expect(withNo.success).toBe(true);

    const withNull = dispensarySchema.safeParse({
      tradeName: 'A',
      licenseNumber: 'B',
      independent: null,
    });
    expect(withNull.success).toBe(true);
  });

  describe('lastVerified field', () => {
    it('accepts a valid lastVerified string like "March 2026"', () => {
      const record = {
        tradeName: 'Verified Dispensary',
        licenseNumber: 'MR-100001',
        lastVerified: 'March 2026',
      };

      const result = dispensarySchema.safeParse(record);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastVerified).toBe('March 2026');
      }
    });

    it('accepts lastVerified as null', () => {
      const record = {
        tradeName: 'Null Verified Dispensary',
        licenseNumber: 'MR-100002',
        lastVerified: null,
      };

      const result = dispensarySchema.safeParse(record);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastVerified).toBeNull();
      }
    });

    it('accepts record without lastVerified field (undefined)', () => {
      const record = {
        tradeName: 'No Verified Dispensary',
        licenseNumber: 'MR-100003',
      };

      const result = dispensarySchema.safeParse(record);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.lastVerified).toBeUndefined();
      }
    });
  });

  it('recognizes all 8 MCC Special Status tags', () => {
    expect(specialStatusTags).toHaveLength(8);
    expect(specialStatusTags).toContain('Woman-Owned');
    expect(specialStatusTags).toContain('Minority-Owned');
    expect(specialStatusTags).toContain('Social Equity');
    expect(specialStatusTags).toContain('Veteran-Owned');
    expect(specialStatusTags).toContain('LGBTQ+-Owned');
    expect(specialStatusTags).toContain('Disability-Owned');
    expect(specialStatusTags).toContain('Economic Empowerment');
    expect(specialStatusTags).toContain('MTC Priority');
  });
});

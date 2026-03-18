import { describe, it, expect } from 'vitest';
import { buildMetaTitle, buildMetaDescription } from '../src/lib/seo-meta';

describe('buildMetaTitle', () => {
  it('returns correct format for THE HAVEN CENTER, INC.', () => {
    expect(buildMetaTitle('THE HAVEN CENTER, INC.')).toBe(
      'Who Owns THE HAVEN CENTER, INC.? | MA Cannabis Directory'
    );
  });

  it('follows exact format "Who Owns {tradeName}? | MA Cannabis Directory"', () => {
    const name = 'Green Leaf';
    const result = buildMetaTitle(name);
    expect(result).toBe(`Who Owns ${name}? | MA Cannabis Directory`);
  });
});

describe('buildMetaDescription', () => {
  it('returns a non-empty string', () => {
    const result = buildMetaDescription({
      tradeName: 'Test Store',
      town: 'Boston',
      licenseType: 'Marijuana Retailer',
    });
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes tradeName and town', () => {
    const result = buildMetaDescription({
      tradeName: 'Green Leaf',
      town: 'Salem',
      licenseType: 'Marijuana Retailer',
    });
    expect(result).toContain('Green Leaf');
    expect(result).toContain('Salem');
  });

  it('includes "Massachusetts"', () => {
    const result = buildMetaDescription({
      tradeName: 'Green Leaf',
      town: 'Salem',
      licenseType: null,
    });
    expect(result).toContain('Massachusetts');
  });

  it('includes licenseType when provided', () => {
    const result = buildMetaDescription({
      tradeName: 'Green Leaf',
      town: 'Salem',
      licenseType: 'Marijuana Retailer',
    });
    expect(result).toContain('Marijuana Retailer');
  });

  it('falls back to "cannabis business" when licenseType is null', () => {
    const result = buildMetaDescription({
      tradeName: 'Green Leaf',
      town: 'Salem',
      licenseType: null,
    });
    expect(result).toContain('cannabis business');
  });
});

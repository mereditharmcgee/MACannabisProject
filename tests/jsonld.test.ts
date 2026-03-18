import { describe, it, expect } from 'vitest';
import { buildJsonLd } from '../src/lib/jsonld';

describe('buildJsonLd', () => {
  const siteUrl = 'https://dispensaries.meredithmcgee.org';

  const dispensary = {
    tradeName: 'THE HAVEN CENTER, INC.',
    address: '4018 Main Street',
    town: 'Brewster',
    phone: '508-360-9644',
    slug: 'the-haven-center',
  };

  it('has @context "https://schema.org" and @type "Store"', () => {
    const result = buildJsonLd(dispensary, siteUrl);
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('Store');
  });

  it('has name matching tradeName', () => {
    const result = buildJsonLd(dispensary, siteUrl);
    expect(result.name).toBe('THE HAVEN CENTER, INC.');
  });

  it('has address object with streetAddress, addressLocality, addressRegion, addressCountry', () => {
    const result = buildJsonLd(dispensary, siteUrl);
    expect(result.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '4018 Main Street',
      addressLocality: 'Brewster',
      addressRegion: 'MA',
      addressCountry: 'US',
    });
  });

  it('includes telephone when phone is truthy', () => {
    const result = buildJsonLd(dispensary, siteUrl);
    expect(result.telephone).toBe('508-360-9644');
  });

  it('excludes telephone when phone is falsy', () => {
    const result = buildJsonLd({ ...dispensary, phone: null }, siteUrl);
    expect(result).not.toHaveProperty('telephone');
  });

  it('has URL following pattern siteUrl/dispensary/slug/', () => {
    const result = buildJsonLd(dispensary, siteUrl);
    expect(result.url).toBe('https://dispensaries.meredithmcgee.org/dispensary/the-haven-center/');
  });
});

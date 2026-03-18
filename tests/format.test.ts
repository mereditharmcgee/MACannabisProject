import { describe, it, expect } from 'vitest';
import { toTitleCase, getLicenseLabel } from '../src/lib/format';

describe('toTitleCase', () => {
  it('converts ALL CAPS trade name to title case', () => {
    expect(toTitleCase('THE HAVEN CENTER, INC.')).toBe('The Haven Center, Inc.');
  });

  it('converts short ALL CAPS words', () => {
    expect(toTitleCase('NETA')).toBe('Neta');
  });

  it('title-cases state abbreviations (acceptable behavior)', () => {
    expect(toTitleCase('CURALEAF MA, INC.')).toBe('Curaleaf Ma, Inc.');
  });

  it('handles hyphenated words', () => {
    expect(toTitleCase('MULTI-STATE')).toBe('Multi-State');
  });

  it('handles slash-separated words', () => {
    expect(toTitleCase('GROW/RETAIL')).toBe('Grow/Retail');
  });

  it('handles LLC suffix', () => {
    expect(toTitleCase('GREEN LEAF LLC')).toBe('Green Leaf LLC');
  });

  it('handles LLP suffix', () => {
    expect(toTitleCase('GREEN LEAF LLP')).toBe('Green Leaf LLP');
  });
});

describe('getLicenseLabel', () => {
  it('maps Marijuana Retailer to Storefront', () => {
    expect(getLicenseLabel('Marijuana Retailer')).toBe('Storefront');
  });

  it('maps Marijuana Delivery Operator to Delivery', () => {
    expect(getLicenseLabel('Marijuana Delivery Operator')).toBe('Delivery');
  });

  it('maps Marijuana Courier to Delivery', () => {
    expect(getLicenseLabel('Marijuana Courier')).toBe('Delivery');
  });

  it('maps Marijuana Microbusiness to Microbusiness', () => {
    expect(getLicenseLabel('Marijuana Microbusiness')).toBe('Microbusiness');
  });

  it('maps Medical Marijuana Treatment Center to Medical', () => {
    expect(getLicenseLabel('Medical Marijuana Treatment Center')).toBe('Medical');
  });

  it('maps Microbusiness Delivery to Delivery', () => {
    expect(getLicenseLabel('Microbusiness Delivery')).toBe('Delivery');
  });

  it('returns raw value for unknown license types', () => {
    expect(getLicenseLabel('Unknown Type')).toBe('Unknown Type');
  });

  it('returns null for null input', () => {
    expect(getLicenseLabel(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(getLicenseLabel(undefined)).toBeNull();
  });
});

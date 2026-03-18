import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import {
  parseDispensarySheet,
  getCellString,
  parseSpecialStatusTags,
} from '../src/lib/xlsx-parser';

describe('getCellString', () => {
  it('handles null', () => {
    expect(getCellString(null)).toBe(null);
  });

  it('handles undefined', () => {
    expect(getCellString(undefined as unknown as ExcelJS.CellValue)).toBe(null);
  });

  it('handles a number', () => {
    expect(getCellString(42)).toBe('42');
  });

  it('handles a string', () => {
    expect(getCellString('hello')).toBe('hello');
  });

  it('handles a string with whitespace', () => {
    expect(getCellString('  hello  ')).toBe('hello');
  });

  it('returns null for empty string', () => {
    expect(getCellString('')).toBe(null);
  });

  it('returns null for whitespace-only string', () => {
    expect(getCellString('   ')).toBe(null);
  });

  it('handles a rich text object', () => {
    const richText = {
      richText: [
        { text: 'Hello ' },
        { text: 'World' },
      ],
    };
    expect(getCellString(richText as unknown as ExcelJS.CellValue)).toBe('Hello World');
  });
});

describe('parseSpecialStatusTags', () => {
  it('splits comma-separated tags and maps to valid enum values', () => {
    const result = parseSpecialStatusTags('Woman-Owned, Veteran-Owned');
    expect(result).toEqual(['Woman-Owned', 'Veteran-Owned']);
  });

  it('ignores unrecognized tag values', () => {
    const result = parseSpecialStatusTags('Woman-Owned, FakeTag, Veteran-Owned');
    expect(result).toEqual(['Woman-Owned', 'Veteran-Owned']);
  });

  it('returns empty array for null input', () => {
    expect(parseSpecialStatusTags(null)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseSpecialStatusTags('')).toEqual([]);
  });

  it('handles semicolons as delimiters', () => {
    const result = parseSpecialStatusTags('Woman-Owned; Social Equity');
    expect(result).toEqual(['Woman-Owned', 'Social Equity']);
  });
});

describe('parseDispensarySheet', () => {
  let workbook: ExcelJS.Workbook;

  function createTestWorkbook(
    dataRows: (string | number | null)[][],
    headers: string[] = [
      'Trade Name', 'License #', 'Owner', 'Normalized Owner',
      'Brand/Company', 'Parent Company', 'Address', 'Town', 'County',
      'Phone', 'License Type', 'Ownership Details', 'Independent', 'Special Status',
    ],
  ) {
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet('Dispensary Directory');
    // Rows 1-3: empty
    sheet.addRow([]);
    sheet.addRow([]);
    sheet.addRow([]);
    // Row 4: headers
    sheet.addRow(headers);
    // Data rows from row 5+
    for (const row of dataRows) {
      sheet.addRow(row);
    }
    return wb;
  }

  it('reads headers from row 4 of "Dispensary Directory" sheet', () => {
    const wb = createTestWorkbook([
      ['Test Shop', 'MR-001', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].tradeName).toBe('Test Shop');
  });

  it('extracts data rows starting from row 5', () => {
    const wb = createTestWorkbook([
      ['Shop A', 'MR-001', null, null, null, null, null, null, null, null, null, null, null, null],
      ['Shop B', 'MR-002', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(2);
    expect(result.records[0].tradeName).toBe('Shop A');
    expect(result.records[1].tradeName).toBe('Shop B');
  });

  it('skips empty rows (no Trade Name and no License #)', () => {
    const wb = createTestWorkbook([
      ['Shop A', 'MR-001', null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      ['Shop B', 'MR-002', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(2);
  });

  it('returns validated Dispensary objects for valid rows', () => {
    const wb = createTestWorkbook([
      ['Good Shop', 'MR-100', 'Jane', null, null, null, '123 Main', 'Boston', 'Suffolk', '617-555-1234', 'Retail', 'Owner info', 'Yes', 'Woman-Owned'],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].tradeName).toBe('Good Shop');
    expect(result.records[0].licenseNumber).toBe('MR-100');
    expect(result.records[0].specialStatusTags).toEqual(['Woman-Owned']);
    expect(result.records[0].independent).toBe('Yes');
  });

  it('returns errors array with row number and field name for invalid rows', () => {
    const wb = createTestWorkbook([
      [null, 'MR-BAD', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Row 5/);
    expect(result.errors[0]).toMatch(/tradeName/);
  });

  it('error message includes "Row N (License #XXX):" format', () => {
    const wb = createTestWorkbook([
      [null, 'MR-BAD', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors[0]).toMatch(/Row 5 \(License #MR-BAD\)/);
  });

  it('error message for row without license includes "Row N (unknown):"', () => {
    const wb = createTestWorkbook([
      ['Has Name', null, null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors[0]).toMatch(/Row 5 \(unknown\)/);
  });

  it('sets needsNarrative=true when ownershipDetails is null/empty', () => {
    const wb = createTestWorkbook([
      ['Shop', 'MR-001', 'Owner', null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records[0].needsNarrative).toBe(true);
  });

  it('sets researchInconclusive=true when owner matches pattern', () => {
    const wb = createTestWorkbook([
      ['Shop', 'MR-001', 'Research inconclusive', null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records[0].researchInconclusive).toBe(true);
  });

  it('generates a slug from tradeName', () => {
    const wb = createTestWorkbook([
      ['Green Leaf Dispensary', 'MR-001', null, null, null, null, null, null, null, null, null, null, null, null],
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records[0].slug).toBe('green-leaf-dispensary');
  });

  it('throws when Dispensary Directory sheet is not found', () => {
    const wb = new ExcelJS.Workbook();
    wb.addWorksheet('Wrong Sheet');
    expect(() => parseDispensarySheet(wb)).toThrow(/Dispensary Directory/);
  });
});

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
      'Trade Name', 'Legal Entity (MCC)', 'Address', 'Town', 'Zip', 'County',
      'Type', 'License #', 'License Type', 'Special Status', 'Owner/Parent',
      'Ownership Details', 'Ownership Source', 'Latitude', 'Longitude', 'Phone',
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

  // Helper: build a row array matching the 16-column header order:
  // Trade Name, Legal Entity (MCC), Address, Town, Zip, County, Type,
  // License #, License Type, Special Status, Owner/Parent,
  // Ownership Details, Ownership Source, Latitude, Longitude, Phone
  function row(fields: {
    tradeName?: string | null; legalEntity?: string | null; address?: string | null;
    town?: string | null; zip?: string | null; county?: string | null;
    type?: string | null; licenseNumber?: string | null; licenseType?: string | null;
    specialStatus?: string | null; owner?: string | null;
    ownershipDetails?: string | null; ownershipSource?: string | null;
    lat?: string | null; lng?: string | null; phone?: string | null;
  } = {}): (string | null)[] {
    return [
      fields.tradeName ?? null, fields.legalEntity ?? null, fields.address ?? null,
      fields.town ?? null, fields.zip ?? null, fields.county ?? null,
      fields.type ?? null, fields.licenseNumber ?? null, fields.licenseType ?? null,
      fields.specialStatus ?? null, fields.owner ?? null,
      fields.ownershipDetails ?? null, fields.ownershipSource ?? null,
      fields.lat ?? null, fields.lng ?? null, fields.phone ?? null,
    ];
  }

  it('reads headers from row 4 of "Dispensary Directory" sheet', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Test Shop', licenseNumber: 'MR-001' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].tradeName).toBe('Test Shop');
  });

  it('extracts data rows starting from row 5', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Shop A', licenseNumber: 'MR-001' }),
      row({ tradeName: 'Shop B', licenseNumber: 'MR-002' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(2);
    expect(result.records[0].tradeName).toBe('Shop A');
    expect(result.records[1].tradeName).toBe('Shop B');
  });

  it('skips empty rows (no Trade Name and no License #)', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Shop A', licenseNumber: 'MR-001' }),
      row(),
      row({ tradeName: 'Shop B', licenseNumber: 'MR-002' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(2);
  });

  it('returns validated Dispensary objects for valid rows', () => {
    const wb = createTestWorkbook([
      row({
        tradeName: 'Good Shop', licenseNumber: 'MR-100', owner: 'Jane',
        legalEntity: 'Good Shop LLC', address: '123 Main', town: 'Boston',
        county: 'Suffolk', phone: '617-555-1234', licenseType: 'Retail',
        ownershipDetails: 'Owner info', specialStatus: 'Woman-Owned',
      }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].tradeName).toBe('Good Shop');
    expect(result.records[0].licenseNumber).toBe('MR-100');
    expect(result.records[0].specialStatusTags).toEqual(['Woman-Owned']);
  });

  it('maps Owner/Parent column to owner field', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Owned Shop', licenseNumber: 'MR-200', owner: 'John Doe' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].owner).toBe('John Doe');
  });

  it('maps Legal Entity (MCC) column to parentCompany field', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Entity Shop', licenseNumber: 'MR-300', legalEntity: 'MCC Corp' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records.length).toBe(1);
    expect(result.records[0].parentCompany).toBe('MCC Corp');
  });

  it('returns errors array with row number and field name for invalid rows', () => {
    const wb = createTestWorkbook([
      row({ licenseNumber: 'MR-BAD' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/Row 5/);
    expect(result.errors[0]).toMatch(/tradeName/);
  });

  it('error message includes "Row N (License #XXX):" format', () => {
    const wb = createTestWorkbook([
      row({ licenseNumber: 'MR-BAD' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors[0]).toMatch(/Row 5 \(License #MR-BAD\)/);
  });

  it('error message for row without license includes "Row N (unknown):"', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Has Name' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.errors[0]).toMatch(/Row 5 \(unknown\)/);
  });

  it('sets needsNarrative=true when ownershipDetails is null/empty', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Shop', licenseNumber: 'MR-001', owner: 'Owner' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records[0].needsNarrative).toBe(true);
  });

  it('sets researchInconclusive=true when owner matches pattern', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Shop', licenseNumber: 'MR-001', owner: 'Research inconclusive' }),
    ]);
    const result = parseDispensarySheet(wb);
    expect(result.records[0].researchInconclusive).toBe(true);
  });

  it('generates a slug from tradeName', () => {
    const wb = createTestWorkbook([
      row({ tradeName: 'Green Leaf Dispensary', licenseNumber: 'MR-001' }),
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

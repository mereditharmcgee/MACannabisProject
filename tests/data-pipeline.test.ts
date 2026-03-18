import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import path from 'node:path';
import {
  parseDispensarySheet,
  parseSummarySheet,
} from '../src/lib/xlsx-parser';

describe('data-pipeline integration (test fixture)', () => {
  it('reads test fixture and returns expected number of valid records', async () => {
    const fixturePath = path.resolve(
      import.meta.dirname,
      'fixtures',
      'test-dispensary.xlsx',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fixturePath);

    const result = parseDispensarySheet(workbook);

    // Rows 5-9 are data rows: 5 valid records, rows 10-11 are invalid
    // Row 5: full valid
    // Row 6: minimal valid
    // Row 7: multi-tag valid
    // Row 8: no details valid (needsNarrative)
    // Row 9: research inconclusive valid
    expect(result.records.length).toBe(5);
  });

  it('returns expected number of errors for invalid rows', async () => {
    const fixturePath = path.resolve(
      import.meta.dirname,
      'fixtures',
      'test-dispensary.xlsx',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fixturePath);

    const result = parseDispensarySheet(workbook);

    // Row 10: missing Trade Name -> error
    // Row 11: missing License # -> error
    expect(result.errors.length).toBe(2);
  });

  it('parseSummarySheet returns stats object', async () => {
    const fixturePath = path.resolve(
      import.meta.dirname,
      'fixtures',
      'test-dispensary.xlsx',
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(fixturePath);

    const stats = parseSummarySheet(workbook);
    expect(stats.totalLicenses).toBe(525);
    expect(stats.percentIndependent).toBe(92);
    expect(stats.totalTowns).toBe(157);
  });
});

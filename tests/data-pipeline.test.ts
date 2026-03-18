import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import {
  parseDispensarySheet,
  parseSummarySheet,
} from '../src/lib/xlsx-parser';
import {
  normalizeForComparison,
  generateNormalizationSuggestions,
} from '../src/lib/normalization';
import { generateQualityReport } from '../src/lib/reports';
import type { Dispensary } from '../src/schemas/dispensary';

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
    // percentIndependent and totalTowns are now computed in build-data.ts
    // from dispensary records, not from the Summary sheet
  });
});

describe('normalization', () => {
  it('normalizeForComparison strips suffixes and normalizes', () => {
    expect(normalizeForComparison('Acme Corp.')).toBe('acme');
    expect(normalizeForComparison('Acme Corporation')).toBe('acme');
    expect(normalizeForComparison('  ACME  LLC  ')).toBe('acme');
    expect(normalizeForComparison('Acme Inc.')).toBe('acme');
    expect(normalizeForComparison('Acme Holdings LLC')).toBe('acme');
    expect(normalizeForComparison('Simple Name')).toBe('simple name');
  });

  it('generates suggestions when variants exist', () => {
    const records: Dispensary[] = [
      {
        tradeName: 'Store A',
        licenseNumber: 'L001',
        owner: 'John Smith LLC',
        specialStatusTags: [],
        needsNarrative: false,
        researchInconclusive: false,
      },
      {
        tradeName: 'Store B',
        licenseNumber: 'L002',
        owner: 'John Smith Inc.',
        specialStatusTags: [],
        needsNarrative: false,
        researchInconclusive: false,
      },
    ] as Dispensary[];

    const suggestions = generateNormalizationSuggestions(records);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].field).toBe('owner');
    expect(suggestions[0].variants).toContain('John Smith LLC');
    expect(suggestions[0].variants).toContain('John Smith Inc.');
    expect(suggestions[0].recordCount).toBe(2);
  });

  it('returns empty when all names are identical', () => {
    const records: Dispensary[] = [
      {
        tradeName: 'Store A',
        licenseNumber: 'L001',
        owner: 'John Smith',
        specialStatusTags: [],
        needsNarrative: false,
        researchInconclusive: false,
      },
      {
        tradeName: 'Store B',
        licenseNumber: 'L002',
        owner: 'John Smith',
        specialStatusTags: [],
        needsNarrative: false,
        researchInconclusive: false,
      },
    ] as Dispensary[];

    const suggestions = generateNormalizationSuggestions(records);
    expect(suggestions.length).toBe(0);
  });
});

describe('quality report', () => {
  it('counts missing fields and flags', () => {
    const records: Dispensary[] = [
      {
        tradeName: 'Store A',
        licenseNumber: 'L001',
        owner: null,
        phone: null,
        address: '123 Main St',
        town: 'Boston',
        needsNarrative: true,
        researchInconclusive: false,
        specialStatusTags: [],
      },
      {
        tradeName: 'Store B',
        licenseNumber: 'L002',
        owner: 'Jane Doe',
        phone: '555-0100',
        address: null,
        town: null,
        needsNarrative: false,
        researchInconclusive: true,
        specialStatusTags: [],
      },
    ] as Dispensary[];

    const report = generateQualityReport(records, ['warning1']);
    expect(report.totalRecords).toBe(2);
    expect(report.needsNarrative.count).toBe(1);
    expect(report.researchInconclusive.count).toBe(1);
    expect(report.missingFields.phone).toBe(1);
    expect(report.missingFields.address).toBe(1);
    expect(report.missingFields.owner).toBe(1);
    expect(report.missingFields.town).toBe(1);
    expect(report.warnings).toEqual(['warning1']);
  });
});

describe('build-data script output', () => {
  it('produces dispensaries.json with id fields', () => {
    // This test relies on build:data having been run (the file should exist from CI or local build)
    const dispensariesPath = path.resolve(
      process.cwd(),
      'src/data/dispensaries.json',
    );
    if (!fs.existsSync(dispensariesPath)) {
      // Run build:data first
      execSync('npx tsx scripts/build-data.ts', { cwd: process.cwd() });
    }

    const data = JSON.parse(fs.readFileSync(dispensariesPath, 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Each entry must have an "id" field
    for (const entry of data.slice(0, 5)) {
      expect(entry).toHaveProperty('id');
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
    }
  });

  it('produces stats.json with numeric values', () => {
    const statsPath = path.resolve(process.cwd(), 'src/data/stats.json');
    if (!fs.existsSync(statsPath)) {
      execSync('npx tsx scripts/build-data.ts', { cwd: process.cwd() });
    }

    const data = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].id).toBe('summary');
    expect(typeof data[0].totalLicenses).toBe('number');
    expect(typeof data[0].percentIndependent).toBe('number');
    expect(typeof data[0].totalTowns).toBe('number');
  });

  it('produces data-quality-report.json with expected structure', () => {
    const reportPath = path.resolve(
      process.cwd(),
      'data/reports/data-quality-report.json',
    );
    if (!fs.existsSync(reportPath)) {
      execSync('npx tsx scripts/build-data.ts', { cwd: process.cwd() });
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    expect(report).toHaveProperty('totalRecords');
    expect(report).toHaveProperty('issueCount');
    expect(report).toHaveProperty('needsNarrative');
    expect(report).toHaveProperty('researchInconclusive');
    expect(report).toHaveProperty('missingFields');
    expect(report).toHaveProperty('warnings');
    expect(typeof report.totalRecords).toBe('number');
  });

  it('produces normalization-suggestions.json as array', () => {
    const suggestionsPath = path.resolve(
      process.cwd(),
      'data/reports/normalization-suggestions.json',
    );
    if (!fs.existsSync(suggestionsPath)) {
      execSync('npx tsx scripts/build-data.ts', { cwd: process.cwd() });
    }

    const data = JSON.parse(fs.readFileSync(suggestionsPath, 'utf-8'));
    expect(Array.isArray(data)).toBe(true);
  });
});

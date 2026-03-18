import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';
import {
  parseDispensarySheet,
  parseSummarySheet,
} from '../src/lib/xlsx-parser';
import { generateNormalizationSuggestions } from '../src/lib/normalization';
import { generateQualityReport } from '../src/lib/reports';

async function main() {
  const xlsxPath = path.resolve(
    process.cwd(),
    'MA_Dispensary_Ownership_Directory.xlsx',
  );

  // Check file exists
  if (!fs.existsSync(xlsxPath)) {
    console.error(
      `XLSX file not found: ${xlsxPath}\nPlace MA_Dispensary_Ownership_Directory.xlsx in the project root.`,
    );
    process.exit(1);
  }

  // Read workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  // Parse Dispensary Directory sheet
  const { records, errors, warnings } = parseDispensarySheet(workbook);

  // Parse Summary sheet (totalLicenses only)
  const summaryStats = parseSummarySheet(workbook);

  // Compute totalTowns from distinct non-null town values
  const towns = new Set(records.filter(r => r.town).map(r => r.town));
  const totalTowns = towns.size;

  // Compute percentIndependent from independent field
  const withIndependent = records.filter(r => r.independent != null);
  let percentIndependent = 0;
  if (withIndependent.length > 0) {
    const independentCount = withIndependent.filter(r => r.independent === 'Yes').length;
    percentIndependent = Math.round((independentCount / records.length) * 100);
  } else {
    console.warn('Independent column not found in XLSX -- percentIndependent set to 0');
  }

  // Merge computed stats with Summary sheet stats
  const stats = {
    totalLicenses: summaryStats.totalLicenses || records.length,
    percentIndependent,
    totalTowns,
  };

  // Check for fatal conditions
  if (records.length === 0) {
    console.error('No records found in Dispensary Directory sheet.');
    process.exit(1);
  }

  // Generate reports
  const normSuggestions = generateNormalizationSuggestions(records);
  const qualityReport = generateQualityReport(records, warnings);

  // Create output directories
  fs.mkdirSync(path.resolve(process.cwd(), 'src/data'), { recursive: true });
  fs.mkdirSync(path.resolve(process.cwd(), 'data/reports'), {
    recursive: true,
  });

  // Write dispensaries.json -- array with "id" field for Astro file() loader
  const dispensariesWithId = records.map((record) => ({
    id: record.licenseNumber,
    ...record,
  }));
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/data/dispensaries.json'),
    JSON.stringify(dispensariesWithId, null, 2),
  );

  // Write stats.json -- single stats object wrapped in array with id "summary"
  fs.writeFileSync(
    path.resolve(process.cwd(), 'src/data/stats.json'),
    JSON.stringify([{ id: 'summary', ...stats }], null, 2),
  );

  // Write reports
  fs.writeFileSync(
    path.resolve(process.cwd(), 'data/reports/data-quality-report.json'),
    JSON.stringify(qualityReport, null, 2),
  );
  fs.writeFileSync(
    path.resolve(process.cwd(), 'data/reports/normalization-suggestions.json'),
    JSON.stringify(normSuggestions, null, 2),
  );

  // Console output
  console.log(`Processed ${records.length} dispensary records`);
  console.log(`Data quality issues: ${qualityReport.issueCount}`);
  console.log(`  Needs narrative: ${qualityReport.needsNarrative.count}`);
  console.log(
    `  Research inconclusive: ${qualityReport.researchInconclusive.count}`,
  );
  console.log(`Normalization suggestions: ${normSuggestions.length} groups`);

  // If validation errors, print and exit non-zero
  if (errors.length > 0) {
    console.error(`\nValidation errors (${errors.length}):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Build data failed:', err);
  process.exit(1);
});

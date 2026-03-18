/**
 * Creates a test XLSX fixture with representative dispensary data.
 * Run once: npx tsx tests/create-fixtures.ts
 */
import ExcelJS from 'exceljs';
import path from 'node:path';

async function createFixture() {
  const workbook = new ExcelJS.Workbook();

  // --- Dispensary Directory sheet ---
  const sheet = workbook.addWorksheet('Dispensary Directory');

  // Rows 1-3: empty (simulating real file structure)
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  // Row 4: Headers
  sheet.addRow([
    'Trade Name',
    'License #',
    'Owner',
    'Normalized Owner',
    'Brand/Company',
    'Parent Company',
    'Address',
    'Town',
    'County',
    'Phone',
    'License Type',
    'Ownership Details',
    'Independent',
    'Special Status',
  ]);

  // Row 5: Full valid record
  sheet.addRow([
    'Green Leaf Dispensary',
    'MR-282371',
    'Jane Smith',
    'Jane Smith',
    'Green Leaf LLC',
    'Green Leaf Holdings',
    '123 Main St',
    'Boston',
    'Suffolk',
    '617-555-1234',
    'Retail',
    'Sole proprietor since 2020',
    'Yes',
    'Woman-Owned, Social Equity',
  ]);

  // Row 6: Minimal valid record (Trade Name + License # only)
  sheet.addRow([
    'Bare Minimum Shop',
    'MR-000001',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  // Row 7: Record with multiple special status tags
  sheet.addRow([
    'Multi Tag Dispensary',
    'MR-000002',
    'John Doe',
    'John Doe',
    'Multi Tag Corp',
    null,
    '456 Oak Ave',
    'Worcester',
    'Worcester',
    '508-555-5678',
    'Retail',
    'Family-owned business',
    'Yes',
    'Veteran-Owned, Minority-Owned, LGBTQ+-Owned',
  ]);

  // Row 8: Record with empty Ownership Details (should flag needsNarrative)
  sheet.addRow([
    'No Details Dispensary',
    'MR-000003',
    'Bob Johnson',
    'Bob Johnson',
    null,
    null,
    '789 Pine Rd',
    'Springfield',
    'Hampden',
    '413-555-9012',
    'Medical',
    null,
    'No',
    null,
  ]);

  // Row 9: Record with "Research inconclusive" owner
  sheet.addRow([
    'Mystery Dispensary',
    'MR-000004',
    'Research inconclusive',
    null,
    null,
    null,
    '321 Elm St',
    'Cambridge',
    'Middlesex',
    null,
    'Retail',
    null,
    null,
    null,
  ]);

  // Row 10: Invalid row - missing Trade Name (for error testing)
  sheet.addRow([
    null,
    'MR-INVALID-1',
    'Nobody',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  // Row 11: Invalid row - missing License # (for error testing)
  sheet.addRow([
    'No License Shop',
    null,
    'Nobody',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  // --- Summary sheet ---
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['MA Cannabis Dispensary Directory - Summary']);
  summarySheet.addRow([]);
  summarySheet.addRow(['Active Licenses', 525]);
  summarySheet.addRow(['Percent Independently Owned', 92]);
  summarySheet.addRow(['Total Towns', 157]);

  // Write to file
  const outPath = path.resolve(
    import.meta.dirname,
    'fixtures',
    'test-dispensary.xlsx',
  );
  await workbook.xlsx.writeFile(outPath);
  console.log(`Created test fixture: ${outPath}`);
}

createFixture().catch((err) => {
  console.error('Failed to create fixture:', err);
  process.exit(1);
});

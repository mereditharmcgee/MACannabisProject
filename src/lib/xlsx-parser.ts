import ExcelJS from 'exceljs';
import { dispensarySchema, specialStatusTags, statsSchema } from '../schemas/dispensary';
import type { Dispensary, Stats } from '../schemas/dispensary';

/**
 * Map of XLSX header strings to schema field names.
 */
const headerMap: Record<string, string> = {
  'Trade Name': 'tradeName',
  'License #': 'licenseNumber',
  'Owner': 'owner',
  'Normalized Owner': 'normalizedOwner',
  'Brand/Company': 'brandCompany',
  'Parent Company': 'parentCompany',
  'Address': 'address',
  'Town': 'town',
  'County': 'county',
  'Phone': 'phone',
  'License Type': 'licenseType',
  'Ownership Details': 'ownershipDetails',
  'Independent': 'independent',
  'Special Status': 'specialStatus',
};

/**
 * Convert an ExcelJS cell value to a trimmed string or null.
 * Handles null, undefined, number, string, rich text, and Date values.
 */
export function getCellString(cellValue: ExcelJS.CellValue): string | null {
  if (cellValue == null) return null;

  // Rich text object
  if (typeof cellValue === 'object' && 'richText' in (cellValue as object)) {
    const rich = cellValue as { richText: Array<{ text: string }> };
    const text = rich.richText.map((part) => part.text).join('');
    return text.trim() || null;
  }

  // Date
  if (cellValue instanceof Date) {
    return cellValue.toISOString();
  }

  // Number
  if (typeof cellValue === 'number') {
    return String(cellValue);
  }

  // String
  if (typeof cellValue === 'string') {
    const trimmed = cellValue.trim();
    return trimmed || null;
  }

  // Boolean or other
  return String(cellValue);
}

/**
 * Parse a raw Special Status string into an array of valid tag enum values.
 * Splits on comma or semicolon, trims each part, filters to recognized tags.
 */
export function parseSpecialStatusTags(raw: string | null): string[] {
  if (!raw) return [];

  return raw
    .split(/[,;]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .filter((tag) => (specialStatusTags as readonly string[]).includes(tag));
}

/**
 * Generate a URL-safe slug from a trade name.
 */
function generateSlug(tradeName: string): string {
  return tradeName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface ParseResult {
  records: Dispensary[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse the "Dispensary Directory" sheet from an ExcelJS workbook.
 *
 * Headers are expected on row 4, data from row 5 onward.
 * Returns validated Dispensary records, errors with row context, and warnings.
 */
export function parseDispensarySheet(workbook: ExcelJS.Workbook): ParseResult {
  const sheet = workbook.getWorksheet('Dispensary Directory');
  if (!sheet) {
    throw new Error('Worksheet "Dispensary Directory" not found in workbook');
  }

  // Read headers from row 4
  const headerRow = sheet.getRow(4);
  const headers: Map<number, string> = new Map();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerName = getCellString(cell.value);
    if (headerName) {
      headers.set(colNumber, headerName);
    }
  });

  const records: Dispensary[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const slugCounts = new Map<string, number>();

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 4) return;

    // Extract raw data using header map
    const rawData: Record<string, string | null> = {};
    headers.forEach((headerName, colNumber) => {
      const fieldName = headerMap[headerName];
      if (fieldName) {
        rawData[fieldName] = getCellString(row.getCell(colNumber).value);
      }
    });

    // Skip completely empty rows
    if (!rawData.tradeName && !rawData.licenseNumber) return;

    // Parse special status tags from raw string
    const parsedTags = parseSpecialStatusTags(rawData.specialStatus ?? null);

    // Determine derived flags
    const needsNarrative = !rawData.ownershipDetails;
    const researchInconclusive = /research inconclusive/i.test(
      rawData.owner ?? '',
    );

    // Generate slug with deduplication
    let slug = rawData.tradeName ? generateSlug(rawData.tradeName) : '';
    if (slug) {
      const count = slugCounts.get(slug) ?? 0;
      slugCounts.set(slug, count + 1);
      if (count > 0) {
        slug = `${slug}-${count + 1}`;
      }
    }

    // Build the record object for validation
    const record = {
      tradeName: rawData.tradeName ?? '',
      licenseNumber: rawData.licenseNumber ?? '',
      owner: rawData.owner ?? null,
      normalizedOwner: rawData.normalizedOwner ?? null,
      brandCompany: rawData.brandCompany ?? null,
      parentCompany: rawData.parentCompany ?? null,
      address: rawData.address ?? null,
      town: rawData.town ?? null,
      county: rawData.county ?? null,
      phone: rawData.phone ?? null,
      licenseType: rawData.licenseType ?? null,
      ownershipDetails: rawData.ownershipDetails ?? null,
      independent: rawData.independent as 'Yes' | 'No' | null ?? null,
      specialStatusTags: parsedTags,
      needsNarrative,
      researchInconclusive,
      slug,
    };

    // Validate through Zod
    const result = dispensarySchema.safeParse(record);

    if (result.success) {
      records.push(result.data);
    } else {
      const licenseLabel = rawData.licenseNumber
        ? `License #${rawData.licenseNumber}`
        : 'unknown';

      for (const issue of result.error.issues) {
        const fieldPath = issue.path.join('.');
        errors.push(
          `Row ${rowNumber} (${licenseLabel}): field '${fieldPath}' ${issue.message}`,
        );
      }
    }

    // Track warnings for missing optional but useful fields
    if (!rawData.phone) {
      warnings.push(`Row ${rowNumber}: missing phone number`);
    }
    if (!rawData.address) {
      warnings.push(`Row ${rowNumber}: missing address`);
    }
  });

  return { records, errors, warnings };
}

/**
 * Parse the "Summary" sheet to extract aggregate stats.
 * Scans for labeled cells and reads adjacent values.
 */
export function parseSummarySheet(workbook: ExcelJS.Workbook): Stats {
  const sheet = workbook.getWorksheet('Summary');
  if (!sheet) {
    return { totalLicenses: 0, percentIndependent: 0, totalTowns: 0 };
  }

  let totalLicenses = 0;
  let percentIndependent = 0;
  let totalTowns = 0;

  sheet.eachRow((row) => {
    const label = getCellString(row.getCell(1).value);
    const value = row.getCell(2).value;

    if (!label) return;

    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('active licenses') || lowerLabel.includes('total licenses')) {
      totalLicenses = typeof value === 'number' ? value : Number(value) || 0;
    } else if (lowerLabel.includes('percent') && lowerLabel.includes('independent')) {
      percentIndependent = typeof value === 'number' ? value : Number(value) || 0;
    } else if (lowerLabel.includes('total towns') || lowerLabel.includes('towns')) {
      totalTowns = typeof value === 'number' ? value : Number(value) || 0;
    }
  });

  return statsSchema.parse({ totalLicenses, percentIndependent, totalTowns });
}

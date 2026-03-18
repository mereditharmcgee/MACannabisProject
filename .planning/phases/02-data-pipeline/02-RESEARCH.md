# Phase 2: Data Pipeline - Research

**Researched:** 2026-03-18
**Domain:** Build-time XLSX-to-JSON data pipeline with Astro Content Collections
**Confidence:** HIGH

## Summary

Phase 2 transforms a 525-record XLSX spreadsheet into validated, structured JSON consumed by Astro Content Collections at build time. The pipeline reads from `MA_Dispensary_Ownership_Directory.xlsx` (two sheets: "Dispensary Directory" with headers on row 4, and "Summary" for aggregate stats), validates with Zod, normalizes owner/company names, generates data quality reports, and fails the build on missing required fields.

The approach uses a custom Astro Content Loader that reads the XLSX file directly in its `load()` function, parses rows with ExcelJS, validates each record through Zod, and populates the content store. This integrates cleanly with Astro 5's Content Layer API (introduced in Astro 5.0, the installed version is 5.18.1) and gives downstream phases type-safe access via `getCollection()` and `getEntry()`.

**Primary recommendation:** Build a custom Astro content loader (`src/loaders/xlsx-loader.ts`) using ExcelJS for XLSX parsing, Zod for validation (via `astro/zod`), and the Content Layer store API for output. Generate JSON data files to `src/data/` and reports to `data/reports/`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- All 8 MCC "Special Status" tags become visible badge tags: Woman-Owned, Minority-Owned, Social Equity, Veteran-Owned, LGBTQ+-Owned, Disability-Owned, Economic Empowerment, MTC Priority
- Use "Minority-Owned" as-is from MCC data -- do NOT map it to "Black-Owned"
- Tags come ONLY from the structured "Special Status" column -- no free-text parsing of Ownership Details
- User will add a manual "Independent" column to the XLSX (boolean: Yes/No/blank) for MSO/Independent distinction
- User will add "Normalized Owner" and "Brand/Company" columns to XLSX
- Pipeline generates a "suggested normalization" report from existing Owner/Parent data that user reviews before adding columns
- Only Trade Name and License # are strictly required -- build fails if either is missing
- All other fields are optional
- 108 records with empty Ownership Details: build succeeds, records flagged as "needs narrative"
- 11 records with "Research inconclusive" owner: include on site but skip ownership section and sibling links
- Build reads XLSX directly -- no manual CSV export step
- Primary input: `MA_Dispensary_Ownership_Directory.xlsx` in project root
- Read "Dispensary Directory" sheet (headers on row 4, data starts row 5)
- Read "Summary" sheet to extract key stats
- Skip "Data Sources" sheet
- Pipeline generates full data quality report file (JSON/CSV) listing every record with issues
- Console build output shows summary counts

### Claude's Discretion
- Header row detection strategy (skip to row 4 or auto-detect)
- XLSX parsing library choice (xlsx, exceljs, or other)
- Zod schema field types and validation rules for optional fields
- JSON output structure and file organization for Astro Content Collections
- Data quality report format and location
- Normalization suggestion report format

### Deferred Ideas (OUT OF SCOPE)
- Data Sources methodology page -- Phase 7
- Black-Owned as a distinct tag -- future enhancement
- Automated MCC data pipeline (API/scraper) -- v2 scope (PLAT-03)

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | Spreadsheet (CSV) is transformed into structured JSON data at build time with schema validation | Custom Astro content loader reads XLSX with ExcelJS, validates with Zod, outputs to content store; `file()` loader reads generated JSON |
| DATA-02 | Build fails if data has missing required fields or invalid values (no silent failures) | Zod `.parse()` throws on validation failure; custom loader catches errors and calls `process.exit(1)` with descriptive error messages identifying row and field |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ExcelJS | 4.4.0 | Read XLSX workbook, access sheets by name, iterate rows | Well-maintained on npm, TypeScript support, handles named sheets and row access natively |
| Zod (via astro/zod) | bundled with Astro | Schema validation and TypeScript type inference | Already bundled with Astro 5 -- import from `astro/zod`, no separate install needed |
| Astro Content Layer | 5.18.1 | Custom content loader, store API, collection queries | Native Astro 5 feature -- custom loaders are the standard way to bring external data into content collections |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js fs/path | built-in | File system access for XLSX path resolution | Used inside the custom loader to resolve the XLSX file path |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ExcelJS | SheetJS (xlsx) | SheetJS npm package frozen at 0.18.5; current version 0.20.3 must be installed from CDN tarball (`cdn.sheetjs.com`). SheetJS has simpler `sheet_to_json` API but the non-standard installation is a maintenance risk. ExcelJS is conventional npm install. |
| ExcelJS | read-excel-file | Lighter weight but less control over named sheets and row-level access; no write capability if needed for reports |
| Custom loader | Pre-build script + file() loader | Two-step approach works but custom loader is more idiomatic Astro 5 and keeps the pipeline in one place |

**Installation:**
```bash
npm install exceljs
```

No Zod install needed -- use `import { z } from 'astro/zod'`.

## Architecture Patterns

### Recommended Project Structure
```
src/
  content.config.ts          # Defines dispensary + stats collections
  loaders/
    xlsx-dispensary-loader.ts # Custom loader: reads XLSX, validates, populates store
  data/                       # Generated JSON (git-ignored or committed -- see note)
data/
  reports/
    data-quality-report.json  # Records with issues, missing fields
    normalization-suggestions.json  # Owner/company name dedup suggestions
```

### Pattern 1: Custom Content Loader
**What:** A function that returns a Loader object with `name`, `load()`, and `schema` properties.
**When to use:** When data comes from a non-standard source (XLSX) that needs transformation.
**Example:**
```typescript
// src/loaders/xlsx-dispensary-loader.ts
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import ExcelJS from 'exceljs';
import path from 'node:path';

export function dispensaryLoader(): Loader {
  return {
    name: 'xlsx-dispensary-loader',
    load: async ({ store, logger, parseData, config }) => {
      const xlsxPath = path.resolve(config.root.pathname, 'MA_Dispensary_Ownership_Directory.xlsx');
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(xlsxPath);

      const sheet = workbook.getWorksheet('Dispensary Directory');
      if (!sheet) throw new Error('Sheet "Dispensary Directory" not found');

      // Row 4 = headers, Row 5+ = data
      const headerRow = sheet.getRow(4);
      const headers: string[] = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.value).trim();
      });

      store.clear();
      const errors: string[] = [];

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 4) return; // Skip header rows

        const rawData: Record<string, unknown> = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) rawData[header] = cell.value;
        });

        // Transform and validate...
        // Use parseData() which runs Zod validation
      });

      if (errors.length > 0) {
        logger.error(`${errors.length} validation errors found`);
        errors.forEach(e => logger.error(e));
        throw new Error('Data validation failed -- see errors above');
      }
    },
    schema: dispensarySchema,
  } satisfies Loader;
}
```
Source: [Astro Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/)

### Pattern 2: Collection Definition with Custom Loader
**What:** Wire the custom loader into `src/content.config.ts`.
**Example:**
```typescript
// src/content.config.ts
import { defineCollection } from 'astro:content';
import { dispensaryLoader } from './loaders/xlsx-dispensary-loader';
import { statsLoader } from './loaders/xlsx-stats-loader';

const dispensaries = defineCollection({
  loader: dispensaryLoader(),
  // schema can be defined here OR in the loader -- loader schema is default,
  // collection schema overrides it
});

const stats = defineCollection({
  loader: statsLoader(),
});

export const collections = { dispensaries, stats };
```
Source: [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/)

### Pattern 3: Querying Collections in Pages
**What:** Downstream phases use `getCollection()` and `getEntry()` for type-safe data access.
**Example:**
```typescript
// In any .astro page
import { getCollection, getEntry } from 'astro:content';

const allDispensaries = await getCollection('dispensaries');
const oneDispensary = await getEntry('dispensaries', 'some-license-number');
```

### Pattern 4: Two-Phase Pipeline (Recommended)
**What:** Split the pipeline into two steps: (1) a pre-build script that reads XLSX, generates JSON + reports, (2) Astro's built-in `file()` loader reads the generated JSON.
**Why this is better than a pure custom loader:**
- Separates concerns: XLSX parsing from Astro content loading
- The normalization report and data quality report are generated independently of the Astro build
- Easier to test and debug the XLSX parsing in isolation
- The `file()` loader is simpler and well-tested

```typescript
// scripts/build-data.ts -- run before astro build
// Reads XLSX, validates, writes JSON files to src/data/

// src/content.config.ts -- uses file() loader on generated JSON
import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const dispensaries = defineCollection({
  loader: file('src/data/dispensaries.json'),
  schema: dispensarySchema,
});
```

```json
// package.json scripts
{
  "scripts": {
    "build:data": "npx tsx scripts/build-data.ts",
    "build": "npm run build:data && astro build",
    "dev": "npm run build:data && astro dev"
  }
}
```

**Recommendation:** Use Pattern 4 (two-phase pipeline). The pre-build script handles XLSX complexity, report generation, and normalization suggestions. Astro consumes clean JSON via `file()` loader. This is simpler to debug and more maintainable.

### Anti-Patterns to Avoid
- **Reading XLSX at request time:** This is a static site -- all data processing must happen at build time
- **Hardcoding column indices:** Use header names from row 4, not column numbers (columns may be reordered)
- **Swallowing validation errors:** Every invalid record must produce a clear error message with row number, license number (if available), and what failed
- **Writing generated JSON to `src/content/`:** Astro 5 content collections use `src/content.config.ts` + loaders, not a `src/content/` directory with files

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XLSX parsing | Custom binary parser | ExcelJS | XLSX format is complex (ZIP of XML files with shared strings, styles, etc.) |
| Schema validation | Manual field checks | Zod via `astro/zod` | Zod gives type inference, error messages with paths, and composable schemas |
| String normalization | Custom fuzzy matching | Simple deterministic rules (trim, collapse whitespace, title case) | Fuzzy matching is overkill for 525 records; deterministic rules + human review is more reliable |
| Content collections | Manual JSON file management | Astro Content Layer + `file()` loader | Handles caching, TypeScript types, and query API |
| Build script runner | Custom Node script orchestration | npm scripts with `&&` chaining | Simple, standard, works with any CI |

**Key insight:** The data set is small (525 records). Avoid over-engineering. A simple sequential pipeline that reads, validates, transforms, and writes JSON is sufficient. No streaming, no parallel processing, no incremental builds needed.

## Common Pitfalls

### Pitfall 1: ExcelJS Cell Values Are Not Always Strings
**What goes wrong:** ExcelJS returns typed values (numbers, dates, rich text objects, formulas). Treating all cell values as strings causes silent data corruption.
**Why it happens:** Excel cells have types. A phone number stored as a number loses leading zeros.
**How to avoid:** Explicitly convert cell values to strings where needed. Check for `cell.value` being an object (rich text) vs primitive.
**Warning signs:** Phone numbers missing digits, dates appearing as serial numbers, "object Object" in output.

### Pitfall 2: Empty Rows in XLSX
**What goes wrong:** XLSX files often have empty rows interspersed or trailing. Processing them creates empty/invalid records.
**Why it happens:** Users add/delete rows in Excel, leaving phantom rows.
**How to avoid:** Skip rows where the Trade Name cell is empty/null. Check `row.actualCellCount` or the required fields before processing.
**Warning signs:** Record count exceeds expected 525, empty JSON entries.

### Pitfall 3: Zod Validation Error Messages Are Technical
**What goes wrong:** Default Zod errors say things like `"Expected string, received undefined"` without context about which row or record failed.
**Why it happens:** Zod validates individual objects, not spreadsheet rows.
**How to avoid:** Catch Zod errors and wrap them with row number and identifying info: `"Row 47 (License #RMD-1234): field 'tradeName' is required but missing"`.
**Warning signs:** Build fails with cryptic Zod errors that don't identify the problem record.

### Pitfall 4: content.config.ts Location
**What goes wrong:** Placing the config at `src/content/config.ts` (Astro 4 location) instead of `src/content.config.ts` (Astro 5 location).
**Why it happens:** Many tutorials and examples online still reference Astro 4's location.
**How to avoid:** Use `src/content.config.ts` (at the root of `src/`, not inside a `content/` folder).
**Warning signs:** Collections not being recognized, empty query results.

### Pitfall 5: Windows File Path Issues
**What goes wrong:** `config.root` in Astro returns a URL object. On Windows, `pathname` may have leading `/` (e.g., `/C:/Users/...`).
**Why it happens:** URL spec always uses forward slashes and may prepend `/` on Windows drive letters.
**How to avoid:** Use `fileURLToPath(config.root)` from `node:url` to get a proper OS path, or resolve paths relative to `process.cwd()`.
**Warning signs:** "File not found" errors only on Windows.

### Pitfall 6: Special Characters in Owner/Company Names
**What goes wrong:** Names with apostrophes, ampersands, accented characters, or LLC suffixes create inconsistent normalization.
**Why it happens:** "Curaleaf Holdings, Inc." vs "Curaleaf" vs "CURALEAF" should all normalize to the same entity.
**How to avoid:** Normalization rules: trim whitespace, collapse multiple spaces, strip common suffixes (Inc., LLC, Corp., Holdings), lowercase for comparison but preserve original casing for display.
**Warning signs:** Same company appearing as multiple entities in the directory.

## Code Examples

### ExcelJS: Reading XLSX with Named Sheet and Row 4 Headers
```typescript
// Source: ExcelJS GitHub docs + verified API
import ExcelJS from 'exceljs';

async function readDispensarySheet(filePath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheet = workbook.getWorksheet('Dispensary Directory');
  if (!sheet) throw new Error('Worksheet "Dispensary Directory" not found in XLSX');

  // Extract headers from row 4
  const headerRow = sheet.getRow(4);
  const headers: Map<number, string> = new Map();
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    headers.set(colNumber, String(cell.value).trim());
  });

  // Extract data from row 5 onward
  const records: Record<string, unknown>[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 4) return;

    const record: Record<string, unknown> = { _rowNumber: rowNumber };
    headers.forEach((header, colNumber) => {
      const cell = row.getCell(colNumber);
      record[header] = cell.value != null ? String(cell.value).trim() : null;
    });

    // Skip completely empty rows
    if (!record['Trade Name'] && !record['License #']) return;

    records.push(record);
  });

  return { headers: [...headers.values()], records };
}
```

### Zod Schema for Dispensary Records
```typescript
// Source: Astro Zod integration docs
import { z } from 'astro/zod';

const specialStatusTags = [
  'Woman-Owned',
  'Minority-Owned',
  'Social Equity',
  'Veteran-Owned',
  'LGBTQ+-Owned',
  'Disability-Owned',
  'Economic Empowerment',
  'MTC Priority',
] as const;

const licenseTypes = [
  'Retail',
  'Medical',
  // Add actual license type values from spreadsheet
] as const;

export const dispensarySchema = z.object({
  // Required fields -- build MUST fail if missing
  tradeName: z.string().min(1, 'Trade Name is required'),
  licenseNumber: z.string().min(1, 'License # is required'),

  // Optional fields -- null/empty allowed
  owner: z.string().nullable().optional(),
  normalizedOwner: z.string().nullable().optional(),
  brandCompany: z.string().nullable().optional(),
  parentCompany: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  town: z.string().nullable().optional(),
  county: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  licenseType: z.string().nullable().optional(),
  ownershipDetails: z.string().nullable().optional(),
  independent: z.enum(['Yes', 'No']).nullable().optional(),

  // Derived fields
  specialStatusTags: z.array(z.enum(specialStatusTags)).default([]),

  // Metadata
  needsNarrative: z.boolean().default(false),
  researchInconclusive: z.boolean().default(false),
});

export type Dispensary = z.infer<typeof dispensarySchema>;
```

### Build Script: Data Pipeline Entry Point
```typescript
// scripts/build-data.ts
import ExcelJS from 'exceljs';
import { z } from 'zod'; // standalone zod for scripts outside Astro
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const xlsxPath = path.resolve(process.cwd(), 'MA_Dispensary_Ownership_Directory.xlsx');

  // 1. Read XLSX
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  // 2. Parse Dispensary Directory sheet
  const records = parseDispensarySheet(workbook);

  // 3. Parse Summary sheet for stats
  const stats = parseSummarySheet(workbook);

  // 4. Validate all records with Zod
  const { valid, errors } = validateRecords(records);

  // 5. Generate normalization suggestions
  const suggestions = generateNormalizationSuggestions(valid);

  // 6. Generate data quality report
  const qualityReport = generateQualityReport(valid);

  // 7. Write outputs
  fs.mkdirSync('src/data', { recursive: true });
  fs.mkdirSync('data/reports', { recursive: true });

  fs.writeFileSync('src/data/dispensaries.json', JSON.stringify(valid, null, 2));
  fs.writeFileSync('src/data/stats.json', JSON.stringify(stats, null, 2));
  fs.writeFileSync('data/reports/data-quality-report.json', JSON.stringify(qualityReport, null, 2));
  fs.writeFileSync('data/reports/normalization-suggestions.json', JSON.stringify(suggestions, null, 2));

  // 8. Console summary
  console.log(`Processed ${valid.length} dispensary records`);
  console.log(`Data quality issues: ${qualityReport.issueCount}`);
  console.log(`Normalization suggestions: ${suggestions.length}`);

  // 9. Fail build on validation errors
  if (errors.length > 0) {
    console.error('\nBUILD FAILED: Validation errors found:');
    errors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Data pipeline failed:', err.message);
  process.exit(1);
});
```

### Normalization Suggestion Logic
```typescript
// Simple deterministic normalization for suggestion report
function normalizeForComparison(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,?\s*(inc\.?|llc\.?|corp\.?|holdings|company|co\.?)$/i, '')
    .trim();
}

function generateNormalizationSuggestions(records: Dispensary[]) {
  const ownerGroups = new Map<string, Set<string>>();

  for (const record of records) {
    if (!record.owner) continue;
    const key = normalizeForComparison(record.owner);
    if (!ownerGroups.has(key)) ownerGroups.set(key, new Set());
    ownerGroups.get(key)!.add(record.owner);
  }

  // Return groups with multiple spellings
  return [...ownerGroups.entries()]
    .filter(([_, variants]) => variants.size > 1)
    .map(([normalized, variants]) => ({
      suggestedNormalized: normalized,
      variants: [...variants],
      recordCount: variants.size,
    }));
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `src/content/config.ts` | `src/content.config.ts` | Astro 5.0 (Dec 2024) | Config file moved to src root |
| `type: 'content'` / `type: 'data'` | `loader: glob()` / `loader: file()` / custom | Astro 5.0 | Loaders replace the old type system |
| SheetJS via npm (`xlsx`) | SheetJS via CDN tarball or use ExcelJS | 2024 | SheetJS npm package frozen at 0.18.5; ExcelJS is the safer npm-native choice |
| Manual Zod install | `import { z } from 'astro/zod'` | Astro 5.0 | Zod bundled with Astro, no separate dependency for content config |

**Deprecated/outdated:**
- `src/content/` directory with Markdown/MDX files as the only content source -- replaced by Content Layer loaders
- `type: 'content'` and `type: 'data'` in defineCollection -- replaced by `loader` property

## Open Questions

1. **Exact column headers in the XLSX**
   - What we know: Headers are on row 4 of "Dispensary Directory" sheet. We know field concepts (Trade Name, License #, Owner, etc.)
   - What's unclear: Exact header strings (e.g., "Trade Name" vs "DBA/Trade Name", spaces, casing)
   - Recommendation: First task should inspect the actual XLSX headers and document them before writing the schema

2. **Summary sheet structure**
   - What we know: Contains aggregate stats like "525 Active Licenses", "92% Independently Owned", "157 Towns"
   - What's unclear: How stats are laid out (key-value pairs? labeled cells? specific cell addresses?)
   - Recommendation: Inspect Summary sheet in first task, extract stats by cell reference or label matching

3. **Special Status column format**
   - What we know: Contains ownership tags from MCC data
   - What's unclear: Delimiter for multiple tags (comma-separated? semicolon? one per row?)
   - Recommendation: Inspect actual data to determine parsing strategy

4. **ID strategy for content collection entries**
   - What we know: License # is unique and required
   - What's unclear: Whether License # format is stable and URL-safe
   - Recommendation: Use License # as the entry ID (slug-ify if needed), since it's the natural unique identifier

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (recommended -- Astro ecosystem standard, Vite-native) |
| Config file | None -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | XLSX transforms to validated JSON at build time | integration | `npx vitest run tests/data-pipeline.test.ts -t "transforms XLSX"` | No -- Wave 0 |
| DATA-01 | Zod schema validates all 525 records | unit | `npx vitest run tests/schema.test.ts -t "validates records"` | No -- Wave 0 |
| DATA-02 | Missing Trade Name fails build with clear error | unit | `npx vitest run tests/validation.test.ts -t "missing required"` | No -- Wave 0 |
| DATA-02 | Missing License # fails build with clear error | unit | `npx vitest run tests/validation.test.ts -t "missing license"` | No -- Wave 0 |
| DATA-02 | Error message identifies problem row and field | unit | `npx vitest run tests/validation.test.ts -t "error identifies row"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration file
- [ ] `tests/schema.test.ts` -- Zod schema validation tests
- [ ] `tests/validation.test.ts` -- Build failure tests for missing required fields
- [ ] `tests/data-pipeline.test.ts` -- Integration test for full XLSX-to-JSON pipeline
- [ ] `tests/fixtures/test-dispensary.xlsx` -- Small test XLSX file (3-5 rows) for testing without the full 525-row file
- [ ] Framework install: `npm install -D vitest` -- Vitest not yet installed

## Sources

### Primary (HIGH confidence)
- [Astro Content Loader API Reference](https://docs.astro.build/en/reference/content-loader-reference/) -- custom loader signature, LoaderContext API, store methods
- [Astro Content Collections Guide](https://docs.astro.build/en/guides/content-collections/) -- defineCollection, file() loader, getCollection/getEntry, schema validation
- [ExcelJS GitHub Repository](https://github.com/exceljs/exceljs) -- readFile API, getWorksheet, eachRow, getCell, cell value types
- [SheetJS Arrays of Data docs](https://docs.sheetjs.com/docs/api/utilities/array/) -- sheet_to_json range/header options (evaluated but not recommended)

### Secondary (MEDIUM confidence)
- [SheetJS Installation docs](https://docs.sheetjs.com/docs/getting-started/installation/nodejs) -- confirmed npm package frozen at 0.18.5, CDN install required for current version
- [npm-compare: exceljs vs xlsx](https://npm-compare.com/excel4node,exceljs,xlsx,xlsx-populate) -- download counts, maintenance status comparison

### Tertiary (LOW confidence)
- Zod API specifics (transform, coerce, enum) -- based on training data + search results; should verify exact syntax against `astro/zod` exports during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- ExcelJS is well-documented on npm; Astro Content Layer API is stable and well-documented in official docs
- Architecture: HIGH -- Custom loader pattern is documented in Astro official docs; two-phase pipeline is a standard pattern
- Pitfalls: HIGH -- Based on known ExcelJS cell typing behavior, Astro 5 migration notes, and Windows path handling
- Validation architecture: MEDIUM -- Vitest recommended based on Astro ecosystem norms but not yet configured in project

**Research date:** 2026-03-18
**Valid until:** 2026-04-17 (stable libraries, 30-day window)

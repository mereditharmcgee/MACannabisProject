import Fuse, { type IFuseOptions } from 'fuse.js';
import fs from 'node:fs';
import path from 'node:path';

export interface SearchRecord {
  slug: string;
  tradeName: string;
  town: string;
  owner: string;
}

export const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  keys: [
    { name: 'tradeName', weight: 2 },
    { name: 'town', weight: 1 },
    { name: 'owner', weight: 1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 1,
  shouldSort: true,
};

/**
 * Transform dispensary records into minimal search records.
 * Strips parenthetical roles from owner, uses empty string for nulls.
 */
export function transformRecords(records: Array<Record<string, unknown>>): SearchRecord[] {
  return records.map((r) => ({
    slug: String(r.slug ?? ''),
    tradeName: String(r.tradeName ?? ''),
    town: r.town ? String(r.town) : '',
    owner: r.owner
      ? String(r.owner).replace(/\s*\(.*?\)\s*/g, '').trim()
      : '',
  }));
}

async function main() {
  const dispensariesPath = path.resolve(process.cwd(), 'src/data/dispensaries.json');

  if (!fs.existsSync(dispensariesPath)) {
    console.error(`dispensaries.json not found at ${dispensariesPath}`);
    console.error('Run "npm run build:data" first.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(dispensariesPath, 'utf-8'));
  const searchData = transformRecords(raw);

  // Create Fuse index
  const index = Fuse.createIndex(FUSE_OPTIONS.keys!, searchData);

  // Ensure output directory exists
  const outDir = path.resolve(process.cwd(), 'public/data');
  fs.mkdirSync(outDir, { recursive: true });

  // Write search data
  const searchDataPath = path.join(outDir, 'search-data.json');
  const searchDataJson = JSON.stringify(searchData);
  fs.writeFileSync(searchDataPath, searchDataJson);

  // Write serialized Fuse index
  const searchIndexPath = path.join(outDir, 'search-index.json');
  const searchIndexJson = JSON.stringify(index.toJSON());
  fs.writeFileSync(searchIndexPath, searchIndexJson);

  console.log(`Search index built: ${searchData.length} records`);
  console.log(`  search-data.json: ${(searchDataJson.length / 1024).toFixed(1)} KB`);
  console.log(`  search-index.json: ${(searchIndexJson.length / 1024).toFixed(1)} KB`);
}

// Only run when executed directly (not when imported by tests)
const isDirectRun = process.argv[1]?.includes('build-search-index');
if (isDirectRun) {
  main().catch((err) => {
    console.error('Build search index failed:', err);
    process.exit(1);
  });
}

export { main };

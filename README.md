# MA Cannabis Dispensary Ownership Directory

A transparent, searchable directory answering "who owns this dispensary?" for every licensed cannabis dispensary in Massachusetts.

## Development

### Prerequisites

- Node.js 20+

### Setup

```bash
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Build data then start Astro dev server |
| `npm run build` | Full production build (data + search index + Astro) |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all tests |

## Updating Data

The site is built from a single source spreadsheet. Here is the full workflow for updating dispensary data:

### Step 1: Update the source spreadsheet

Edit `data/MACannabisDirectory.xlsx` with new or corrected records. Each row represents one dispensary license.

### Step 2: Regenerate JSON from the spreadsheet

```bash
npm run build:data
```

This runs `scripts/build-data.ts`, which reads the XLSX file and produces:
- `src/data/dispensaries.json` -- all dispensary records
- `src/data/stats.json` -- aggregate statistics
- `src/data/data-quality-report.json` -- flags for missing or suspect fields
- `src/data/normalization-suggestions.json` -- potential duplicate entity names

### Step 3: Review the build output

Check the terminal output for:
- **Record count** -- should be 525 or more
- **Validation errors** -- Zod schema failures indicate malformed rows
- **Quality flags** -- missing owners, addresses, or other key fields

### Step 4: Run a full build

```bash
npm run build
```

This runs the data build, generates the search index, and builds all Astro pages (including the sitemap). Confirm the build completes without errors and the page count matches expectations.

### Step 5: Commit and deploy

```bash
git add -A
git commit -m "data: update dispensary records"
git push origin main
```

Cloudflare Pages auto-deploys from the `main` branch. The site typically rebuilds within 1-2 minutes.

### Step 6: Verify on production

After the deploy completes, spot-check a few dispensary pages on the live site to confirm changes appear correctly.

### What to check after a data update

- [ ] Build completes successfully (no errors)
- [ ] Record count matches expectations (525+)
- [ ] No Zod validation errors in build output
- [ ] Spot-check 3-5 dispensary detail pages for correct data
- [ ] Homepage stats reflect updated numbers

## Pre-Launch Checklist

- [ ] Create a Formspree form and replace `FORMSPREE_ID_PLACEHOLDER` in `src/pages/correct.astro` with the real form ID
- [ ] Review 525 records for obvious data errors before sharing publicly
- [ ] Spot-check 5-10 dispensary detail pages for correct ownership info
- [ ] Verify the correction form submits successfully on the deployed site

## Tech Stack

- **Astro 5** -- static site generation
- **Tailwind CSS v4** -- utility-first styling
- **Fuse.js** -- client-side fuzzy search
- **Cloudflare Pages** -- hosting with auto-deploy from GitHub

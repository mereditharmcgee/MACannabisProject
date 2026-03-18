# Phase 3: Detail Pages - Research

**Researched:** 2026-03-18
**Domain:** Astro dynamic routes, JSON-LD structured data, SEO meta, ownership narratives
**Confidence:** HIGH

## Summary

Phase 3 generates 525 pre-rendered dispensary detail pages using Astro's `getStaticPaths()` with the existing Content Collections `file()` loader. Each page needs: dispensary profile info, ownership badges, a 2-3 sentence narrative, JSON-LD structured data (schema.org `Store`), SEO meta tags, and sibling location cross-links. The technical surface is well-understood -- Astro's static routing is mature, JSON-LD is a simple script tag injection, and narrative generation is a pure function over structured data fields.

The main complexity is in three areas: (1) the narrative generation function must handle 3 distinct record states (has ownershipDetails, needsNarrative, researchInconclusive), (2) the slug generation needs updating to strip legal suffixes and disambiguate by town, and (3) sibling grouping by parentCompany requires careful handling of 75 multi-location groups. All of this is build-time logic with no runtime dependencies.

**Primary recommendation:** Build a `src/pages/dispensary/[slug].astro` dynamic route that calls `getCollection('dispensaries')` in `getStaticPaths()`, with helper functions in `src/lib/` for narrative generation, JSON-LD construction, and sibling grouping.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hybrid narrative approach: build-time auto-generates from structured data, optional Custom Narrative XLSX column can override
- For 417 records with ownershipDetails: transform research notes into readable 2-3 sentence prose using template function
- For 108 needsNarrative records: show "Ownership details for this dispensary are being researched" notice
- For 11 researchInconclusive records: show page with name/address/phone/license/badges but hide owner section, narrative, and sibling links with "Ownership information is being researched" notice
- Clean profile card style: centered card with clear sections on subtle background
- Hierarchy: dispensary name + ownership badges most prominent at top
- URL pattern: `/dispensary/[slug]/` with legal suffix stripping and town disambiguation for collisions
- Group siblings by parentCompany field
- Meta title: "Who Owns [Dispensary Name]? | MA Cannabis Directory"
- JSON-LD structured data (schema.org LocalBusiness) on every page
- Must pass Google Rich Results Test validation

### Claude's Discretion
- Exact narrative template sentence structures
- Badge color scheme and styling
- Card spacing, typography, responsive breakpoints
- JSON-LD field mapping details
- Navigation style (back link vs breadcrumb)
- Sibling display format (list vs mini cards)

### Deferred Ideas (OUT OF SCOPE)
- Brand/Company column for more accurate sibling grouping -- user adds to XLSX later
- Custom Narrative XLSX column -- user adds progressively over time
- "Suggest a Correction" form on detail pages -- Phase 7 (Trust and Legal)
- Owner profile/aggregate pages -- not in current roadmap
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DETL-01 | Each of 525 dispensaries has its own pre-rendered page with unique, SEO-friendly URL | Astro `getStaticPaths()` with `[slug].astro` dynamic route; slug generation with legal suffix stripping |
| DETL-02 | Detail page shows dispensary name, owner/parent company, address, phone (tap-to-call), license type | Profile card component consuming dispensary collection entry data |
| DETL-03 | Detail page displays ownership characteristic badges | Badge component rendering `specialStatusTags` array (Economic Empowerment, Social Equity, MTC Priority) |
| DETL-04 | Detail page includes 2-3 sentence ownership narrative unique to that listing | `generateNarrative()` function transforming `ownershipDetails` into prose; 3-state handling |
| DETL-05 | Detail page links to other locations owned by same owner/parent company | Sibling grouping by `parentCompany` field; 75 multi-location groups in data |
| DETL-06 | Detail page includes schema.org structured data (JSON-LD) for rich Google search results | `Store` type JSON-LD with PostalAddress; validated against Rich Results Test |
| DETL-07 | Each detail page has unique meta title and description optimized for "who owns" queries | BaseLayout already accepts title/description props; SEO meta generation function |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | ^5.18.1 | Static site generator, dynamic routes via `getStaticPaths()` | Already in project, handles SSG natively |
| Tailwind CSS | ^4.2.1 | Styling for profile card, badges, responsive layout | Already in project via @tailwindcss/vite |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^4.1.0 | Test narrative generation, JSON-LD output, sibling grouping | Already in project; unit tests for pure functions |

### No Additional Dependencies Needed

All Phase 3 functionality is achievable with the existing stack. JSON-LD is a plain `<script type="application/ld+json">` tag -- no library needed. Narrative generation is a pure TypeScript function. No new npm packages required.

## Architecture Patterns

### Recommended Project Structure
```
src/
  pages/
    dispensary/
      [slug].astro          # Dynamic route for all 525 pages
  components/
    DispensaryCard.astro     # Profile card (name, badges, owner, facts)
    OwnershipBadge.astro     # Individual badge component
    SiblingLinks.astro       # Cross-links to sibling locations
    JsonLd.astro             # JSON-LD script tag component
  lib/
    narrative.ts             # generateNarrative() pure function
    jsonld.ts                # buildLocalBusinessJsonLd() pure function
    siblings.ts              # groupByParentCompany() pure function
    slugs.ts                 # Updated slug generation (legal suffix stripping)
```

### Pattern 1: Astro Dynamic Route with Content Collections

**What:** Single `[slug].astro` file generates all 525 pages at build time
**When to use:** Every dispensary detail page

```astro
---
// src/pages/dispensary/[slug].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import DispensaryCard from '../../components/DispensaryCard.astro';
import JsonLd from '../../components/JsonLd.astro';

export async function getStaticPaths() {
  const dispensaries = await getCollection('dispensaries');
  return dispensaries.map((entry) => ({
    params: { slug: entry.data.slug },
    props: { dispensary: entry.data },
  }));
}

const { dispensary } = Astro.props;
const title = `Who Owns ${dispensary.tradeName}? | MA Cannabis Directory`;
const description = `Find out who owns ${dispensary.tradeName} in ${dispensary.town}, Massachusetts. Ownership details, parent company, and license information.`;
---
<BaseLayout title={title} description={description}>
  <JsonLd dispensary={dispensary} />
  <main>
    <DispensaryCard dispensary={dispensary} />
  </main>
</BaseLayout>
```

**Key detail:** The `file()` loader uses the `id` field from JSON as the collection entry ID. The `slug` field is a separate data property -- use `entry.data.slug` for routing params, not `entry.id` (which is the license number).

### Pattern 2: Three-State Narrative Generation

**What:** Pure function that handles the 3 record states for narrative content
**When to use:** Every detail page's narrative section

```typescript
// src/lib/narrative.ts
interface NarrativeInput {
  tradeName: string;
  owner: string | null;
  town: string | null;
  ownershipDetails: string | null;
  needsNarrative: boolean;
  researchInconclusive: boolean;
}

export function generateNarrative(d: NarrativeInput): {
  text: string;
  type: 'full' | 'pending' | 'inconclusive';
} {
  if (d.researchInconclusive) {
    return { text: '', type: 'inconclusive' };
  }
  if (d.needsNarrative || !d.ownershipDetails) {
    return {
      text: `Ownership details for ${d.tradeName} are being researched.`,
      type: 'pending',
    };
  }
  // Transform ownershipDetails into readable prose
  // Implementation: parse semicolon-delimited facts, compose sentences
  return { text: composeProse(d), type: 'full' };
}
```

### Pattern 3: JSON-LD as Astro Component

**What:** Renders a `<script type="application/ld+json">` tag with structured data
**When to use:** Every detail page `<head>`

```astro
---
// src/components/JsonLd.astro
const { dispensary } = Astro.props;
const siteUrl = Astro.site?.toString().replace(/\/$/, '') ?? '';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": dispensary.tradeName,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": dispensary.address,
    "addressLocality": dispensary.town,
    "addressRegion": "MA",
    "addressCountry": "US"
  },
  ...(dispensary.phone && { "telephone": dispensary.phone }),
  "url": `${siteUrl}/dispensary/${dispensary.slug}/`,
};
---
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

**Important:** Use `set:html` to inject raw JSON into the script tag. Astro will not escape content inside `set:html`, which is what we want for JSON-LD.

### Pattern 4: Sibling Grouping at Build Time

**What:** Pre-compute sibling groups once, pass to each page
**When to use:** In `getStaticPaths()` to avoid redundant computation

```typescript
// Compute sibling map once in getStaticPaths
const dispensaries = await getCollection('dispensaries');
const siblingMap = new Map<string, typeof dispensaries>();
for (const entry of dispensaries) {
  const pc = entry.data.parentCompany;
  if (pc) {
    const group = siblingMap.get(pc) ?? [];
    group.push(entry);
    siblingMap.set(pc, group);
  }
}

return dispensaries.map((entry) => {
  const siblings = (siblingMap.get(entry.data.parentCompany ?? '') ?? [])
    .filter((s) => s.data.slug !== entry.data.slug);
  return {
    params: { slug: entry.data.slug },
    props: { dispensary: entry.data, siblings: siblings.map(s => s.data) },
  };
});
```

### Anti-Patterns to Avoid
- **Querying getCollection inside each page render:** Call it once in `getStaticPaths()` and pass data via props. Never call `getCollection()` in the page frontmatter outside `getStaticPaths()`.
- **Using entry.id as the slug:** The `id` field is the license number (e.g., "MR282481"), not the URL slug. Always use `entry.data.slug`.
- **Hardcoding narrative text in templates:** Keep narrative logic in a testable pure function, not inline in `.astro` files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL slug generation | Custom regex from scratch | Update existing `generateSlug()` in xlsx-parser.ts | Already handles basic slugification; just add legal suffix stripping |
| JSON-LD validation | Manual property checking | Google Rich Results Test (external tool) | Authoritative validation; no runtime dependency needed |
| Responsive card layout | Custom CSS grid/flexbox from scratch | Tailwind utility classes | Consistent with existing project patterns; faster iteration |
| Phone number formatting | Custom parser | Simple `tel:` link with raw phone string | Phone numbers are already formatted in XLSX data |

**Key insight:** This phase is almost entirely build-time template rendering over existing structured data. No runtime JavaScript, no API calls, no state management. Keep it simple.

## Common Pitfalls

### Pitfall 1: Slug Collisions After Legal Suffix Stripping
**What goes wrong:** Stripping "Inc", "LLC", "Corp" etc. from trade names creates duplicate slugs (e.g., two different "Green Leaf Inc" and "Green Leaf LLC" become the same "green-leaf" slug)
**Why it happens:** CONTEXT.md identifies 5 known collisions after stripping
**How to avoid:** After stripping suffixes, detect collisions and append town name (e.g., `green-leaf-springfield`). Implement collision detection in the slug generation function, not as an afterthought.
**Warning signs:** Build fails with duplicate route params, or one page overwrites another silently.

### Pitfall 2: researchInconclusive Pages Missing Required Content
**What goes wrong:** Showing owner/narrative sections for the 8 researchInconclusive records when they should be hidden
**Why it happens:** Forgetting the three-state conditional in the template
**How to avoid:** The narrative function returns a `type` field; template uses this to conditionally render sections. Test all 3 states explicitly.
**Warning signs:** Pages with "null" or empty owner sections visible to users.

### Pitfall 3: JSON-LD Script Tag Escaping
**What goes wrong:** Astro HTML-escapes the JSON inside the script tag, producing invalid JSON-LD
**Why it happens:** Default Astro template expressions escape HTML entities
**How to avoid:** Use `set:html={JSON.stringify(jsonLd)}` on the script tag. This injects raw content.
**Warning signs:** Google Rich Results Test shows JSON parse errors.

### Pitfall 4: Missing Trailing Slash in URLs
**What goes wrong:** Links to `/dispensary/slug` instead of `/dispensary/slug/` cause redirects or 404s
**Why it happens:** Astro's default `trailingSlash` config may not match internal link patterns
**How to avoid:** Be consistent -- if the route is `[slug].astro` in the `dispensary/` directory, Astro generates `/dispensary/slug/` with trailing slash. Ensure all internal links match.
**Warning signs:** 301 redirects on detail page loads, broken sibling links.

### Pitfall 5: Content Collections File Loader ID Uniqueness
**What goes wrong:** If two JSON records share the same `id`, only one loads
**Why it happens:** The `file()` loader uses the `id` field as a unique key
**How to avoid:** The `id` field is already set to `licenseNumber` which is unique. Don't change this.
**Warning signs:** Fewer than 525 entries returned from `getCollection()`.

## Code Examples

### Legal Suffix Stripping for Slugs
```typescript
// src/lib/slugs.ts
const LEGAL_SUFFIXES = /\b(inc|llc|corp|ltd|co|lp|plc|pllc|l\.?l\.?c\.?|l\.?t\.?d\.?)\b\.?/gi;

export function stripLegalSuffix(name: string): string {
  return name.replace(LEGAL_SUFFIXES, '').trim();
}

export function generateSlug(tradeName: string, town?: string | null): string {
  const stripped = stripLegalSuffix(tradeName);
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function deduplicateSlugs(
  records: Array<{ tradeName: string; town: string | null }>
): Map<number, string> {
  const slugMap = new Map<number, string>();
  const seen = new Map<string, number[]>();

  records.forEach((r, i) => {
    const slug = generateSlug(r.tradeName);
    const indices = seen.get(slug) ?? [];
    indices.push(i);
    seen.set(slug, indices);
  });

  for (const [slug, indices] of seen) {
    if (indices.length === 1) {
      slugMap.set(indices[0], slug);
    } else {
      // Disambiguate by town
      for (const i of indices) {
        const town = records[i].town?.toLowerCase().replace(/\s+/g, '-') ?? 'unknown';
        slugMap.set(i, `${slug}-${town}`);
      }
    }
  }

  return slugMap;
}
```

### Tap-to-Call Phone Link
```astro
{dispensary.phone && (
  <a href={`tel:${dispensary.phone.replace(/[^+\d]/g, '')}`}
     class="text-green-700 hover:underline">
    {dispensary.phone}
  </a>
)}
```

### Tappable Address (Google Maps)
```astro
{dispensary.address && dispensary.town && (
  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dispensary.address}, ${dispensary.town}, MA`)}`}
     target="_blank"
     rel="noopener noreferrer"
     class="text-green-700 hover:underline">
    {dispensary.address}, {dispensary.town}, MA
  </a>
)}
```

### Ownership Badge Mapping
```typescript
// Known badge types from data analysis
const BADGE_CONFIG: Record<string, { label: string; color: string }> = {
  'Economic Empowerment': { label: 'Economic Empowerment', color: 'bg-purple-100 text-purple-800' },
  'Social Equity': { label: 'Social Equity', color: 'bg-blue-100 text-blue-800' },
  'MTC Priority': { label: 'MTC Priority', color: 'bg-amber-100 text-amber-800' },
};
```

**Note:** The data currently has only 3 distinct `specialStatusTags` values: "Economic Empowerment", "Social Equity", and "MTC Priority". The badge component should handle unknown tags gracefully with a default style.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Astro Content Collections v1 (frontmatter glob) | Content Collections v2 with `file()` loader | Astro 5.x (2024) | Project already uses v2 pattern |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` plugin | Tailwind v4 (2025) | Project already uses new pattern |
| Microdata/RDFa structured data | JSON-LD in script tag | Google recommendation since ~2020 | JSON-LD is the only format worth using |

## Open Questions

1. **Trailing slash configuration**
   - What we know: Astro defaults to no opinion on trailing slash. The `astro.config.mjs` doesn't set `trailingSlash`.
   - What's unclear: Whether Cloudflare Pages adds/removes trailing slashes automatically.
   - Recommendation: Set `trailingSlash: 'always'` in astro.config.mjs to match the `/dispensary/[slug]/` URL convention. Test on Cloudflare Pages after deploy.

2. **Narrative prose quality at scale**
   - What we know: 417 records have ownershipDetails with semicolon-delimited facts. Template function will produce prose.
   - What's unclear: Whether the auto-generated prose will feel "unique enough" or repetitive across similar records.
   - Recommendation: User decision says "unique data with shared sentence structure is acceptable." Implement, review a sample of ~20 outputs, iterate if needed.

3. **County data in JSON-LD**
   - What we know: Records have county but Google's PostalAddress doesn't have a standard county field.
   - What's unclear: Whether to include county via `addressRegion` sub-property or skip it.
   - Recommendation: Skip county in JSON-LD (use just "MA" for addressRegion). Display county on the page UI only.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.0 |
| Config file | vitest.config.ts |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DETL-01 | 525 pages generated with unique slugs, legal suffixes stripped | unit | `npx vitest run tests/slugs.test.ts -t "slug" --reporter=verbose` | No -- Wave 0 |
| DETL-02 | Page displays name, owner, address, phone, license type | smoke | `npx astro build` (build succeeds with 525 pages) | N/A -- build check |
| DETL-03 | Badges render for specialStatusTags | unit | `npx vitest run tests/badges.test.ts --reporter=verbose` | No -- Wave 0 |
| DETL-04 | Narrative generated for 3 record states | unit | `npx vitest run tests/narrative.test.ts --reporter=verbose` | No -- Wave 0 |
| DETL-05 | Sibling links present for multi-location owners | unit | `npx vitest run tests/siblings.test.ts --reporter=verbose` | No -- Wave 0 |
| DETL-06 | JSON-LD validates as schema.org Store | unit | `npx vitest run tests/jsonld.test.ts --reporter=verbose` | No -- Wave 0 |
| DETL-07 | Unique meta title/description per page | unit | `npx vitest run tests/seo-meta.test.ts --reporter=verbose` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose && npx astro build`
- **Phase gate:** Full suite green + successful `astro build` producing 525+ HTML files

### Wave 0 Gaps
- [ ] `tests/slugs.test.ts` -- covers DETL-01: legal suffix stripping, collision detection, town disambiguation
- [ ] `tests/narrative.test.ts` -- covers DETL-04: 3-state narrative generation (full, pending, inconclusive)
- [ ] `tests/jsonld.test.ts` -- covers DETL-06: JSON-LD structure validation, required fields present
- [ ] `tests/siblings.test.ts` -- covers DETL-05: parentCompany grouping, self-exclusion, empty groups

## Sources

### Primary (HIGH confidence)
- [Astro Routing Docs](https://docs.astro.build/en/guides/routing/) -- dynamic routes, getStaticPaths pattern
- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/) -- file() loader, getCollection API
- [Google LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business) -- required/recommended JSON-LD properties
- [schema.org LocalBusiness](https://schema.org/LocalBusiness) -- Store subtype, property definitions
- Existing codebase: `src/content.config.ts`, `src/lib/xlsx-parser.ts`, `src/data/dispensaries.json` -- actual data schema and 525 records analyzed

### Secondary (MEDIUM confidence)
- [Astro Routing Reference](https://docs.astro.build/en/reference/routing-reference/) -- getStaticPaths return types
- [Cannabis dispensary schema best practices](https://www.thecannabismarketingagency.com/cannabis-seo/schema-markup) -- industry-specific structured data

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all patterns verified against existing codebase
- Architecture: HIGH -- Astro dynamic routes are well-documented and the file() loader is already working in this project
- Pitfalls: HIGH -- identified from direct data analysis (75 sibling groups, 8 inconclusive, 108 needsNarrative, 3 tag types)
- JSON-LD: HIGH -- Google's official docs are clear on LocalBusiness requirements

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable domain, no fast-moving APIs)

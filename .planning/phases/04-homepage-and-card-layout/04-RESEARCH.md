# Phase 4: Homepage and Card Layout - Research

**Researched:** 2026-03-18
**Domain:** Astro static page layout, Tailwind CSS v4 responsive grid, performance for 525-card rendering
**Confidence:** HIGH

## Summary

Phase 4 replaces the placeholder homepage with a production hero section (headline, subtitle, stats, future search placeholder) and a responsive card grid displaying all 525 dispensaries. The entire implementation uses existing project infrastructure: Astro components, Tailwind CSS v4, and Content Collections. No new dependencies are needed.

The main technical consideration is rendering 525 cards without jank. Since Astro pre-renders everything as static HTML (no JS hydration needed for these cards), the DOM will contain ~525 card elements. This is well within browser capability, but CSS `content-visibility: auto` with `contain-intrinsic-size` provides a zero-JS optimization that tells the browser to skip rendering off-screen cards until they scroll into view, yielding significant paint performance gains. No virtual scrolling library is necessary.

**Primary recommendation:** Build the homepage as a single Astro page using `getCollection('dispensaries')` sorted alphabetically, rendered into a CSS Grid with responsive breakpoints. Use `content-visibility: auto` on each card for lazy paint optimization. Create a new `DispensaryGridCard.astro` component (distinct from the detail-page `DispensaryCard.astro`) for the compact card format.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Each card shows: dispensary name, town, owner, ownership badge tags, and license type (as small "Storefront" or "Delivery" text label)
- Consistent card height -- badgeless cards (319 of 525) have empty badge area, same layout as cards with badges
- Subtle hover effect on cards (shadow lift or slight scale) to signal clickability
- Clicking a card navigates to `/dispensary/[slug]/`
- Headline: "Who Owns Your Dispensary?" (unchanged from Phase 1)
- Descriptive subtitle below headline explaining what the site does
- Reserve visual space for future search bar (Phase 5) -- gap or placeholder area below headline
- Stats sourced dynamically from stats.json for totalLicenses and totalTowns; 92% independently owned hardcoded until Independent column is added to XLSX
- Show all 525 cards, lazy-render for performance (virtual scrolling or intersection observer)
- Default sort: alphabetical by trade name (A-Z)
- Visible count above grid: "Showing 525 dispensaries"
- No pagination -- single scrollable page
- Hero section scrolls away naturally (not sticky)
- Grid layout: 1 column mobile, 2 columns tablet, 3 columns desktop
- Footer slightly expanded: "A project by Meredith McGee" plus brief about/data source line

### Claude's Discretion
- Hero background treatment (green accent vs white)
- Card hover animation specifics
- Badge style on cards (reuse or compact)
- Owner name truncation strategy
- Subtitle exact wording
- Footer about/attribution wording
- Responsive breakpoint specifics
- Virtual scrolling implementation approach

### Deferred Ideas (OUT OF SCOPE)
- Search bar in hero section -- Phase 5
- Filter pills above card grid -- Phase 6
- Sticky header with search -- possible future enhancement
- Map view -- v2 scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | Site is fully responsive -- card grid adapts from mobile to desktop | Tailwind CSS v4 responsive grid (grid-cols-1/2/3) with breakpoints at sm/md/lg |
| DSGN-03 | Homepage features prominent headline with key stats (525 Active Licenses, 92% Independently Owned, 157 Towns) | Hero section with stats from getCollection('stats'), 92% hardcoded per user decision |
| SRCH-08 | Search results display as cards showing dispensary name, town, owner, and ownership badge tags | DispensaryGridCard.astro component with name, town, owner, badges, licenseType |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.x | Static page generation, Content Collections | Already installed; getCollection API for dispensaries/stats |
| Tailwind CSS | 4.2.x | Responsive grid, typography, spacing | Already installed via @tailwindcss/vite plugin |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | - | - | No new dependencies for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS content-visibility | JS Intersection Observer | content-visibility is zero-JS, browser-native, simpler; IO needed only if dynamic loading required |
| CSS content-visibility | Virtual scrolling library | Virtual scrolling removes DOM nodes, overkill for 525 static cards; adds JS complexity |
| Tailwind CSS Grid | CSS Flexbox wrap | Grid gives explicit column control; flexbox works but grid is more predictable for card layouts |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── DispensaryGridCard.astro   # NEW: compact card for homepage grid
│   ├── OwnershipBadge.astro       # EXISTING: reuse for card badges
│   ├── DispensaryCard.astro       # EXISTING: detail page card (do not modify)
│   ├── HeroSection.astro          # NEW: hero with headline, subtitle, stats, search placeholder
│   └── StatsBar.astro             # NEW: stats boxes (extracted for reuse)
├── pages/
│   └── index.astro                # REPLACE: full homepage with hero + card grid
└── layouts/
    └── BaseLayout.astro           # EXISTING: no changes needed
```

### Pattern 1: Content Collection Data Fetching
**What:** Fetch all dispensaries at build time, sort, and render as static HTML
**When to use:** Homepage card grid
**Example:**
```astro
---
import { getCollection } from 'astro:content';

const dispensaries = await getCollection('dispensaries');
const sorted = dispensaries
  .map(e => e.data)
  .sort((a, b) => a.tradeName.localeCompare(b.tradeName));
---
```

### Pattern 2: Responsive CSS Grid with Tailwind v4
**What:** 1/2/3 column grid that adapts to viewport
**When to use:** Card grid container
**Example:**
```astro
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {sorted.map(d => <DispensaryGridCard dispensary={d} />)}
</div>
```
Note: Tailwind CSS v4 uses the same responsive prefix syntax (sm:, md:, lg:) as v3. Default breakpoints: sm=640px, md=768px, lg=1024px.

### Pattern 3: CSS content-visibility for Lazy Paint
**What:** Browser skips rendering off-screen cards until they scroll into view
**When to use:** Each card in the grid (525 items)
**Example:**
```astro
<!-- On each card wrapper -->
<a href={`/dispensary/${dispensary.slug}/`}
   class="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
   style="content-visibility: auto; contain-intrinsic-size: auto 280px;">
  <!-- card content -->
</a>
```
The `contain-intrinsic-size: auto 280px` tells the browser "this element is approximately 280px tall when rendered" so scrollbar sizing is accurate. The `auto` keyword lets the browser remember the actual size after first render, preventing layout shifts on re-scroll.

### Pattern 4: Consistent Card Height with Badge Placeholder
**What:** Cards maintain uniform height regardless of badge count (0-3 badges)
**When to use:** DispensaryGridCard layout
**Example:**
```astro
<!-- Fixed-height badge area -->
<div class="min-h-[2rem] flex flex-wrap gap-1.5">
  {dispensary.specialStatusTags.map(tag => (
    <OwnershipBadge tag={tag} />
  ))}
</div>
```
Using `min-h-[2rem]` ensures badgeless cards (319 of 525) reserve the same vertical space.

### Pattern 5: Future-Proof Hero Layout for Search Bar
**What:** Reserve space below headline for Phase 5 search bar
**When to use:** Hero section
**Example:**
```astro
<section class="text-center py-12 px-4">
  <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
    Who Owns Your Dispensary?
  </h1>
  <p class="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
    {subtitle text}
  </p>
  <!-- Phase 5 search bar will go here -->
  <div class="mt-8">
    <!-- Stats boxes -->
  </div>
</section>
```

### Anti-Patterns to Avoid
- **Using client:visible for each card:** This is for hydrating JS components. Cards are pure static HTML -- no framework island needed.
- **JavaScript-based virtual scrolling:** Adds complexity, breaks static HTML benefits, hurts SEO (cards not in initial DOM). 525 cards is not enough to warrant this.
- **Wrapping cards in a React/Svelte island:** No interactivity needed. Pure Astro components are faster and simpler.
- **Using `overflow-hidden` on card container:** Could clip content unexpectedly. Use `overflow-x-hidden` on body if needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid | Custom media query system | Tailwind grid-cols-1/sm:grid-cols-2/lg:grid-cols-3 | Tailwind handles breakpoints reliably |
| Lazy rendering | Custom Intersection Observer JS | CSS `content-visibility: auto` | Zero JS, browser-native, better performance |
| Card hover effects | Custom JS hover handlers | Tailwind `hover:shadow-md transition-shadow` | CSS-only, smooth, no JS needed |
| Owner name truncation | Complex JS truncation | CSS `line-clamp-1` or `truncate` | Browser handles text overflow natively |
| Badge colors | New color mapping | Existing OwnershipBadge.astro colorMap | Already maps all 8 tag types to colors |

**Key insight:** This phase requires zero JavaScript. Everything is static HTML + CSS. Astro's build-time rendering + Tailwind + native CSS features cover all requirements.

## Common Pitfalls

### Pitfall 1: Naming Collision with Existing DispensaryCard
**What goes wrong:** The existing `DispensaryCard.astro` is the detail page component (with narrative, sibling links, address, phone). Modifying it for the grid card would break detail pages.
**Why it happens:** Same conceptual name for two different views of the same data.
**How to avoid:** Create a NEW component named `DispensaryGridCard.astro` for the homepage card. Keep `DispensaryCard.astro` untouched.
**Warning signs:** Import path points to existing DispensaryCard in the homepage.

### Pitfall 2: Stats Data Mismatch
**What goes wrong:** stats.json has totalTowns: 156 but DSGN-03 says "157 Towns". percentIndependent is 0 (not computed yet) but display should show 92%.
**Why it happens:** Stats are computed from XLSX data; the requirement text uses approximate numbers.
**How to avoid:** Use stats.json dynamically for totalLicenses (525) and totalTowns (156). Hardcode "92%" for independently owned per user decision. Accept that totalTowns may show 156 not 157 (data-driven is correct).
**Warning signs:** Hardcoding all three stats instead of reading from stats.json.

### Pitfall 3: ALL CAPS Trade Names
**What goes wrong:** dispensaries.json has trade names in ALL CAPS (e.g., "THE HAVEN CENTER, INC."). Displaying raw values looks aggressive.
**Why it happens:** Source XLSX data uses uppercase.
**How to avoid:** Apply CSS `capitalize` or a title-case transform. Tailwind class: `capitalize` (lowercases then capitalizes first letter of each word). Or use a JS helper to title-case at build time.
**Warning signs:** Cards showing "THE HAVEN CENTER, INC." instead of "The Haven Center, Inc."

### Pitfall 4: License Type Display Labels
**What goes wrong:** User wants "Storefront" or "Delivery" labels, but actual data has "Marijuana Retailer", "Marijuana Delivery Operator", "Marijuana Microbusiness", etc.
**Why it happens:** Data uses official MCC license type names, not user-friendly labels.
**How to avoid:** Map license types to display labels:
- "Marijuana Retailer" -> "Storefront"
- "Marijuana Delivery Operator" -> "Delivery"
- "Marijuana Courier" -> "Delivery"
- "Marijuana Microbusiness" -> "Storefront" (or "Micro")
- "Medical Marijuana Treatment Center" -> "Medical"
- "Microbusiness Delivery" -> "Delivery"
**Warning signs:** Cards showing raw "Marijuana Retailer" text.

### Pitfall 5: Card Link Trailing Slash
**What goes wrong:** Links to `/dispensary/slug` instead of `/dispensary/slug/` causing redirects.
**Why it happens:** Forgetting astro.config has `trailingSlash: "always"`.
**How to avoid:** Always use `href={`/dispensary/${dispensary.slug}/`}` with trailing slash.
**Warning signs:** 301 redirects in browser network tab.

### Pitfall 6: content-visibility and Accessibility
**What goes wrong:** Screen readers might skip content-visibility:auto elements.
**Why it happens:** Early implementations had issues with hidden content and accessibility tree.
**How to avoid:** Modern browsers (2025+) handle this correctly. content-visibility:auto only affects rendering, not the accessibility tree. Still, test with a screen reader if possible.
**Warning signs:** Elements missing from accessibility tree inspection.

## Code Examples

### DispensaryGridCard Component Structure
```astro
---
import OwnershipBadge from './OwnershipBadge.astro';

interface Props {
  dispensary: {
    tradeName: string;
    slug: string;
    town: string | null;
    owner: string | null;
    licenseType: string | null;
    specialStatusTags: string[];
  };
}

const { dispensary } = Astro.props;

// Title-case the trade name (source data is ALL CAPS)
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s|[-/])\w/g, (match) => match.toUpperCase())
    .replace(/\b(Inc|Llc|Llp)\b/gi, (m) => m.toUpperCase());
}

// Map license type to display label
const licenseLabel: Record<string, string> = {
  'Marijuana Retailer': 'Storefront',
  'Marijuana Delivery Operator': 'Delivery',
  'Marijuana Courier': 'Delivery',
  'Marijuana Microbusiness': 'Microbusiness',
  'Medical Marijuana Treatment Center': 'Medical',
  'Microbusiness Delivery': 'Delivery',
};

const displayName = toTitleCase(dispensary.tradeName);
const displayOwner = dispensary.owner
  ? dispensary.owner.replace(/\s*\(.*?\)\s*/g, '').trim()
  : null;
const typeLabel = dispensary.licenseType
  ? licenseLabel[dispensary.licenseType] ?? dispensary.licenseType
  : null;
---

<a href={`/dispensary/${dispensary.slug}/`}
   class="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
   style="content-visibility: auto; contain-intrinsic-size: auto 280px;">
  <div class="p-5">
    <div class="flex items-start justify-between gap-2">
      <h2 class="text-lg font-semibold text-gray-900 line-clamp-2">{displayName}</h2>
      {typeLabel && (
        <span class="shrink-0 text-xs text-gray-500 font-medium mt-1">{typeLabel}</span>
      )}
    </div>
    {dispensary.town && (
      <p class="mt-1 text-sm text-gray-500">{dispensary.town}, MA</p>
    )}
    {displayOwner && (
      <p class="mt-2 text-sm text-gray-700 truncate">{displayOwner}</p>
    )}
    <div class="mt-3 min-h-[2rem] flex flex-wrap gap-1.5">
      {dispensary.specialStatusTags.map(tag => (
        <OwnershipBadge tag={tag} />
      ))}
    </div>
  </div>
</a>
```

### Homepage Data Fetching and Rendering
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import DispensaryGridCard from '../components/DispensaryGridCard.astro';

const dispensaries = await getCollection('dispensaries');
const sorted = dispensaries
  .map(e => e.data)
  .sort((a, b) => a.tradeName.localeCompare(b.tradeName));

const statsEntries = await getCollection('stats');
const stats = statsEntries[0]?.data;
const totalLicenses = stats?.totalLicenses ?? 525;
const totalTowns = stats?.totalTowns ?? 156;
---
```

### Stats Display Pattern
```astro
<div class="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-lg mx-auto">
  <div class="p-4 bg-white rounded-lg shadow-sm text-center">
    <p class="text-2xl font-bold text-green-700">{totalLicenses}</p>
    <p class="text-sm text-gray-500">Active Licenses</p>
  </div>
  <div class="p-4 bg-white rounded-lg shadow-sm text-center">
    <p class="text-2xl font-bold text-green-700">92%</p>
    <p class="text-sm text-gray-500">Independently Owned</p>
  </div>
  <div class="p-4 bg-white rounded-lg shadow-sm text-center">
    <p class="text-2xl font-bold text-green-700">{totalTowns}</p>
    <p class="text-sm text-gray-500">Towns</p>
  </div>
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JS virtual scrolling for large lists | CSS content-visibility: auto | Baseline Sept 2025 | Zero-JS lazy rendering, browser-native |
| Tailwind v3 @apply directives | Tailwind v4 direct utility classes | 2025 | Project already uses v4; avoid @apply |
| JS Intersection Observer for lazy load | CSS content-visibility + contain-intrinsic-size | 2024-2025 | Simpler, no JS bundle, better perf |

**Deprecated/outdated:**
- `@astrojs/tailwind` integration: Project correctly uses `@tailwindcss/vite` plugin instead (per Phase 1 decision)
- Tailwind v3 config file: v4 uses CSS-based config, no `tailwind.config.js` needed

## Open Questions

1. **Trade name display format**
   - What we know: Source data is ALL CAPS with legal suffixes ("THE HAVEN CENTER, INC.")
   - What's unclear: Should ", INC." / ", LLC" be stripped or kept? Detail pages currently show raw names.
   - Recommendation: Apply title-case transformation. Keep legal suffixes for accuracy but style them smaller or strip them. Planner should decide consistency with detail pages.

2. **Badge size on cards vs detail pages**
   - What we know: OwnershipBadge.astro uses px-3 py-1 text-sm (standard pill size). Cards are compact.
   - What's unclear: Whether standard size fits well in the compact card layout.
   - Recommendation: Try standard size first; create compact variant (px-2 py-0.5 text-xs) only if standard is too large. This is a Claude's Discretion item.

3. **contain-intrinsic-size exact value**
   - What we know: Cards will be ~250-300px tall depending on content.
   - What's unclear: Exact height depends on final card design.
   - Recommendation: Use `auto 280px` as initial estimate; adjust after first implementation.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.x |
| Config file | vitest.config.ts |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Responsive grid adapts mobile to desktop | manual-only | Visual inspection at 375px/768px/1024px | N/A |
| DSGN-03 | Hero shows headline + stats | smoke | `npm run build && grep "Who Owns Your Dispensary" dist/index.html` | No - Wave 0 |
| SRCH-08 | Cards show name, town, owner, badges | smoke | `npm run build && grep "dispensary/" dist/index.html` | No - Wave 0 |

Note: This phase is primarily visual/layout. Most validation is through build success and visual inspection. Unit tests are appropriate for helper functions (title-case transform, license type mapping) but not for layout itself.

### Sampling Rate
- **Per task commit:** `npm run build` (ensures 525 cards render without error)
- **Per wave merge:** `npm test && npm run build`
- **Phase gate:** Full build + visual inspection at mobile/tablet/desktop breakpoints

### Wave 0 Gaps
- [ ] `tests/homepage.test.ts` -- smoke tests for title-case helper and license type mapping functions
- [ ] Visual inspection checklist for responsive breakpoints (manual)

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: src/pages/index.astro, src/components/DispensaryCard.astro, src/components/OwnershipBadge.astro, src/content.config.ts, src/data/dispensaries.json, src/data/stats.json
- Astro Content Collections API: getCollection() pattern verified from existing [slug].astro usage
- Tailwind CSS v4 responsive utilities: verified from existing codebase usage (sm:, lg: prefixes)

### Secondary (MEDIUM confidence)
- [CSS content-visibility MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility) - Baseline Sept 2025, all major browsers
- [content-visibility performance](https://web.dev/articles/content-visibility) - Google web.dev guidance on contain-intrinsic-size
- [Can I Use content-visibility](https://caniuse.com/css-content-visibility) - Browser support table

### Tertiary (LOW confidence)
- None -- all findings verified through codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - using only existing project dependencies (Astro, Tailwind)
- Architecture: HIGH - patterns verified from existing codebase (Content Collections, component structure)
- Pitfalls: HIGH - identified from direct data analysis (ALL CAPS names, license types, stats values)
- Performance approach: MEDIUM - content-visibility is well-documented but exact contain-intrinsic-size needs tuning

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable -- no fast-moving dependencies)

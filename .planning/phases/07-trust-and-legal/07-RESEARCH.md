# Phase 7: Trust and Legal - Research

**Researched:** 2026-03-20
**Domain:** Static content pages, Google Forms iframe embedding, Zod schema extension, Astro components
**Confidence:** HIGH

## Summary

Phase 7 adds trust and legal infrastructure to an existing Astro static site: a Google Form correction mechanism embedded on every detail page, per-record "last verified" dates flowing through the data pipeline, data accuracy disclaimers, and a Terms of Service page. All four requirements involve straightforward Astro component modifications and one new static page -- no new libraries, no client-side JavaScript, no API endpoints.

The technical risk is very low. The data pipeline already handles optional fields gracefully, the detail page component has clear insertion points, and the footer has a pre-placed placeholder for the TOS link. The main implementation considerations are: (1) getting the Google Form pre-fill URL parameter format correct, (2) ensuring the iframe is responsive and accessible, and (3) threading the new `lastVerified` field through all three layers (Zod schema, XLSX parser, Content Collections schema).

**Primary recommendation:** Implement in two waves -- first the data pipeline change (lastVerified field) and the new TOS page, then the detail page additions (correction form, disclaimer, lastVerified display) and homepage disclaimer.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Google Form embedded as an iframe at the bottom of each detail page (below all content, after sibling links)
- Pre-fill dispensary name via URL parameter so users don't have to type it
- Structured fields: pre-filled dispensary name (read-only), dropdown of fields to correct (owner, address, phone, license type, ownership tags, other), "correct value" text field (required), email (optional for follow-up)
- Submissions go to a Google Sheet that Meredith already monitors
- Form embedded on every detail page, not just linked
- Add `lastVerified` column to the spreadsheet/data pipeline
- Optional field -- build does NOT fail if missing; detail page simply omits the row when empty
- Display format: "Month Year" (e.g., "March 2026")
- Data pipeline must parse and validate the new field through Zod schema
- Disclaimer appears on BOTH homepage and detail pages
- Homepage: brief disclaimer in the footer area
- Detail pages: more specific disclaimer near the bottom of the card
- Tone: friendly and transparent, not legalistic
- Explicitly name "Massachusetts Cannabis Control Commission (MCC)" as the primary data source
- Link to correction form from the disclaimer
- Standalone page at `/terms/` linked from the site footer
- Footer placeholder `<!-- Phase 7: Terms of Service link goes here -->` already exists
- Plain-language data usage notice, not formal legal boilerplate
- Topics: data sources/accuracy, permitted use, no warranty/liability, contact/corrections
- Contact info: "Published by Meredith McGee" + link to meredithmcgee.org
- No email address published -- contact via correction form

### Claude's Discretion
- Google Form iframe dimensions and styling
- Exact disclaimer copy (within the friendly/transparent tone)
- Exact TOS copy (within the plain-language style)
- Last verified date placement on detail page
- Disclaimer visual treatment (background color, border, icon)
- Whether disclaimer on homepage is in footer or a separate section
- TOS page layout and styling

### Deferred Ideas (OUT OF SCOPE)
- Email notifications when corrections are submitted
- Correction review/approval workflow
- Privacy policy page
- Cookie notice

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRST-01 | Each listing has a "Suggest a Correction" form that submits without requiring user login | Google Form iframe embed with pre-fill parameters; placed in DispensaryCard.astro after SiblingLinks |
| TRST-02 | Site displays a publisher disclaimer about data accuracy and sources | Static Astro components on homepage footer and detail page card; no JS needed |
| TRST-03 | Each listing shows a "last verified" date | New optional `lastVerified` field in Zod schema, XLSX parser, Content Collections, and DispensaryCard |
| TRST-04 | Site includes Terms of Service / data usage notice | New `src/pages/terms.astro` page using BaseLayout, linked from footer |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | 5.18.x | Static site framework | Already in use; all changes are Astro components and pages |
| Zod (astro/zod) | via Astro | Schema validation | Already validates dispensary data; extend for lastVerified |
| Tailwind CSS | 4.2.x | Styling | Already in use for all components |
| ExcelJS | 4.4.x | XLSX parsing | Already parses the data spreadsheet |

### Supporting
No new libraries needed for this phase. Everything is built with existing dependencies.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Google Forms iframe | Formspree, custom form | Google Forms is free, already integrates with Meredith's Google Sheets workflow, zero backend needed |
| Inline disclaimer text | Separate component file | For reuse on both homepage and detail pages, a shared component is cleaner |

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    DispensaryCard.astro    # MODIFY: add lastVerified, disclaimer, correction form
    DataDisclaimer.astro    # NEW: shared disclaimer component
  pages/
    terms.astro             # NEW: Terms of Service page
    index.astro             # MODIFY: add disclaimer + TOS link to footer
    dispensary/
      [slug].astro          # MODIFY: pass lastVerified to DispensaryCard
  schemas/
    dispensary.ts           # MODIFY: add lastVerified field
  lib/
    xlsx-parser.ts          # MODIFY: parse lastVerified column
  content.config.ts         # MODIFY: add lastVerified to collection schema
```

### Pattern 1: Shared Astro Component for Disclaimer
**What:** A `DataDisclaimer.astro` component used on both homepage and detail pages, with a `variant` prop to control verbosity.
**When to use:** When the same content appears in multiple places with slight variations.
**Example:**
```astro
---
interface Props {
  variant: 'brief' | 'detailed';
}
const { variant } = Astro.props;
---
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
  {variant === 'brief' ? (
    <p>Data sourced from Massachusetts Cannabis Control Commission (MCC) public records and may not reflect recent changes. <a href="/terms/" class="underline">Terms</a></p>
  ) : (
    <div>
      <p>This data is manually researched from Massachusetts Cannabis Control Commission (MCC) public records and may not reflect recent changes.</p>
      <p class="mt-1">See something wrong? <a href="#correction-form" class="underline">Suggest a correction</a> below.</p>
    </div>
  )}
</div>
```

### Pattern 2: Optional Field in Data Pipeline
**What:** Adding an optional field that flows through XLSX -> JSON -> Content Collections -> component rendering, gracefully absent when empty.
**When to use:** The established pattern from existing optional fields like `phone`, `address`.
**Example flow:**
1. `xlsx-parser.ts`: Map 'Last Verified' header, parse with `getCellString()`
2. `dispensary.ts` schema: `lastVerified: z.string().nullable().optional()`
3. `content.config.ts`: `lastVerified: z.string().nullable().optional()`
4. `DispensaryCard.astro`: Conditional render `{dispensary.lastVerified && ...}`

### Pattern 3: Google Forms Iframe Embed with Pre-fill
**What:** Embed a Google Form as an iframe, passing the dispensary name via URL parameter.
**When to use:** When you need a form submission that goes to an external service without any backend.
**Example:**
```astro
---
// In DispensaryCard.astro
const formBaseUrl = 'https://docs.google.com/forms/d/e/FORM_ID/viewform';
const prefillParam = `entry.FIELD_ID=${encodeURIComponent(dispensary.tradeName)}`;
const formUrl = `${formBaseUrl}?${prefillParam}&embedded=true`;
---
<section id="correction-form" class="mt-6 border-t border-gray-100 pt-6">
  <h2 class="text-lg font-semibold text-gray-900 mb-3">Suggest a Correction</h2>
  <iframe
    src={formUrl}
    width="100%"
    height="600"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
    title="Suggest a correction for {dispensary.tradeName}"
    loading="lazy"
  >Loading...</iframe>
</section>
```

### Anti-Patterns to Avoid
- **Hardcoding the Google Form URL in multiple places:** Use a single constant or config value. The form URL contains both the form ID and entry field IDs that may change.
- **Making lastVerified a Date type in the schema:** The XLSX cell may contain a plain string like "March 2026". Parse it as a string, not a Date, to avoid timezone and format issues.
- **Putting the TOS link only in the detail page footer:** It must be in the site-wide footer (index.astro) per the decision. The BaseLayout does not currently have a footer -- index.astro has its own.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Correction form submission | Custom form + API endpoint | Google Forms iframe | Zero backend, Google Sheets integration, already decided |
| Date format validation | Custom date parser | Simple string + optional regex check | "Month Year" is a display string, not a Date object |
| Legal text | Complex legal generator | Static plain-language content | User explicitly wants non-legalistic, plain language |

**Key insight:** This phase is almost entirely static content and component wiring. There are no complex algorithmic problems -- the value is in getting the copy right, the layout clean, and the data pipeline field correctly threaded.

## Common Pitfalls

### Pitfall 1: Google Form Pre-fill URL Parameters Not Working in Iframe
**What goes wrong:** The `?entry.XXXXX=value` parameters work when opening the form directly but may not display pre-filled values inside an iframe embed.
**Why it happens:** Google Forms has two URL modes: `/viewform` (interactive, supports pre-fill display) and `/formResponse` (submits directly). The `embedded=true` parameter changes rendering. Some combinations suppress pre-fill display.
**How to avoid:** Use the `/viewform` URL with `?embedded=true` appended AFTER the entry parameters. Test the pre-fill in the actual iframe, not just in a new tab. The form must be configured to show field values (not just headers).
**Warning signs:** Pre-fill parameter present in URL but field appears empty in the iframe.

### Pitfall 2: Iframe Height Cuts Off Form Content
**What goes wrong:** The form is taller than the iframe, requiring scrolling within the iframe -- a poor UX on mobile.
**Why it happens:** Google Forms renders with variable height depending on field count, descriptions, and the user's zoom/font-size settings.
**How to avoid:** Set a generous initial height (600-800px). On mobile, the form will scroll within the iframe, which is acceptable. The `loading="lazy"` attribute prevents the iframe from impacting initial page load.
**Warning signs:** Form appears cut off or shows a double scrollbar.

### Pitfall 3: Content Collections Schema Mismatch
**What goes wrong:** Adding `lastVerified` to `dispensary.ts` (the build-time Zod schema) but forgetting to add it to `content.config.ts` (the Astro Content Collections schema). The field is in the JSON but Astro strips it.
**Why it happens:** This project has TWO schema definitions -- the build-time one in `src/schemas/dispensary.ts` and the Content Collections one in `src/content.config.ts`. Both must be updated.
**How to avoid:** Update both schemas in the same task. Verify the field is accessible in `[slug].astro` after the build.
**Warning signs:** `dispensary.lastVerified` is `undefined` in the template even though it exists in `dispensaries.json`.

### Pitfall 4: Footer Inconsistency Between Pages
**What goes wrong:** TOS link and disclaimer appear on the homepage but not on detail pages (or vice versa), because the site has no shared footer component.
**Why it happens:** `index.astro` has its own inline footer. `[slug].astro` uses `BaseLayout` which has no footer. Detail pages do not currently have a footer at all.
**How to avoid:** The TOS link should go in the homepage footer (where the placeholder is). For detail pages, the disclaimer within the DispensaryCard serves the trust purpose. A "Terms" link can be added to the detail page's back-navigation area or at the bottom of the card.
**Warning signs:** User navigates from detail page and cannot find TOS link.

### Pitfall 5: XLSX Header Name Mismatch
**What goes wrong:** The header map in `xlsx-parser.ts` uses a name like 'Last Verified' but the actual XLSX column header is different (e.g., 'LastVerified', 'Verified Date', etc.).
**Why it happens:** The XLSX is manually maintained and column headers aren't standardized.
**How to avoid:** Check the actual XLSX column headers. Add the new header mapping to the `headerMap` object. Include a fallback or document the expected header name.
**Warning signs:** `lastVerified` is always null/undefined for all records despite having data in the spreadsheet.

## Code Examples

### Adding lastVerified to Zod Schema
```typescript
// src/schemas/dispensary.ts - add to dispensarySchema
lastVerified: z.string().nullable().optional(),
```

### Adding lastVerified to Content Collections Schema
```typescript
// src/content.config.ts - add to dispensaries schema
lastVerified: z.string().nullable().optional(),
```

### Adding lastVerified to XLSX Header Map
```typescript
// src/lib/xlsx-parser.ts - add to headerMap
'Last Verified': 'lastVerified',
```

### Adding lastVerified to parseDispensarySheet Record Construction
```typescript
// In the record construction block of parseDispensarySheet
lastVerified: rawData.lastVerified ?? null,
```

### Google Form Iframe with Pre-fill
```astro
---
// The form URL and entry field ID are constants
// FORM_ID and ENTRY_ID must be obtained from the actual Google Form
const CORRECTION_FORM_BASE = 'https://docs.google.com/forms/d/e/FORM_ID/viewform';
const DISPENSARY_NAME_ENTRY = 'entry.XXXXXXX';
const formUrl = `${CORRECTION_FORM_BASE}?${DISPENSARY_NAME_ENTRY}=${encodeURIComponent(dispensary.tradeName)}&embedded=true`;
---
<iframe
  src={formUrl}
  width="100%"
  height="660"
  frameborder="0"
  marginheight="0"
  marginwidth="0"
  title={`Suggest a correction for ${dispensary.tradeName}`}
  loading="lazy"
  class="rounded-lg border border-gray-200"
>Loading correction form...</iframe>
```

### New Terms Page
```astro
---
// src/pages/terms.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Terms of Service - MA Cannabis Directory" description="Data usage terms and policies for the MA Cannabis Directory.">
  <main class="max-w-2xl mx-auto px-4 py-12">
    <a href="/" class="inline-block mb-4 text-green-700 hover:underline text-sm">&larr; Back to Directory</a>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
    <!-- Plain-language sections here -->
  </main>
</BaseLayout>
```

### Displaying Last Verified Date
```astro
{dispensary.lastVerified && (
  <div>
    <dt class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Last Verified</dt>
    <dd class="mt-0.5 text-gray-800">{dispensary.lastVerified}</dd>
  </div>
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom contact forms with backend | Google Forms iframe (for simple use cases) | Always available | Zero backend maintenance, free |
| `frameborder` HTML attribute | CSS `border` property | HTML5 | `frameborder="0"` still works but is deprecated HTML; use Tailwind border classes |

**Deprecated/outdated:**
- `frameborder` attribute: Deprecated in HTML5 but still universally supported. Use CSS borders instead for standards compliance.

## Open Questions

1. **Google Form URL and Entry Field IDs**
   - What we know: The form needs to be created in Google Forms with the specified fields (dispensary name, field dropdown, correct value, email). The pre-fill URL uses `entry.XXXXXXX` parameters.
   - What's unclear: The actual form ID and entry field IDs can only be obtained after the form is created. Meredith needs to create the Google Form and share the URL.
   - Recommendation: Use placeholder constants for the form URL and entry IDs. Document where to update them. The planner should include a task noting this dependency.

2. **XLSX Column Header for Last Verified**
   - What we know: A 'Last Verified' column will be added to the spreadsheet.
   - What's unclear: The exact header name Meredith will use.
   - Recommendation: Use 'Last Verified' as the default mapping in `headerMap`. Document it so the header name can be adjusted easily.

3. **Detail Page Footer/TOS Link Placement**
   - What we know: Homepage footer has the TOS placeholder. Detail pages have no footer.
   - What's unclear: Whether detail pages need their own footer with a TOS link, or if the disclaimer inside the card is sufficient.
   - Recommendation: Add "Terms" link at the bottom of the DispensaryCard component, perhaps as part of the disclaimer text ("See our Terms of Service").

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.1.x |
| Config file | inferred from package.json (no vitest.config.ts seen) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRST-01 | Correction form iframe renders with pre-fill URL | manual-only | N/A -- iframe rendering requires browser; no Astro component unit testing in project | N/A |
| TRST-02 | Disclaimer displays on homepage and detail pages | manual-only | N/A -- visual/content verification | N/A |
| TRST-03 | lastVerified field parsed from XLSX and available in schema | unit | `npx vitest run tests/schema.test.ts -t "lastVerified" -x` | Wave 0 |
| TRST-03 | lastVerified rendered when present, omitted when absent | manual-only | N/A -- Astro component rendering | N/A |
| TRST-04 | Terms page exists at /terms/ | smoke | `npx astro build && test -f dist/terms/index.html` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose` + `npx astro build`
- **Phase gate:** Full suite green + successful build before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/schema.test.ts` -- add test cases for `lastVerified` field (optional, nullable, valid string)
- [ ] Smoke test for `/terms/` page existence can be verified via `astro build` output (no new test file needed)

## Sources

### Primary (HIGH confidence)
- Project codebase: `src/schemas/dispensary.ts`, `src/lib/xlsx-parser.ts`, `src/content.config.ts`, `src/components/DispensaryCard.astro`, `src/pages/index.astro`, `src/pages/dispensary/[slug].astro` -- direct code inspection
- CONTEXT.md: locked decisions from user discussion

### Secondary (MEDIUM confidence)
- [Google Forms embedding guide](https://www.clappia.com/form-alternative/embed-google-forms-into-website) -- iframe embed patterns
- [Google Forms pre-fill](https://nerdy-form.com/guides/prefill-google-forms) -- URL parameter format
- [Google Drive Community](https://support.google.com/drive/thread/162517544/) -- pre-fill in embedded forms

### Tertiary (LOW confidence)
- Google Forms pre-fill display in iframes: some community reports of pre-fill not showing in embedded mode. Needs testing with actual form.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing libraries
- Architecture: HIGH -- follows established project patterns (optional fields, component composition, static pages)
- Pitfalls: HIGH -- identified from direct code inspection (dual schema issue, no shared footer)
- Google Forms iframe behavior: MEDIUM -- pre-fill in embedded mode needs testing with actual form

**Research date:** 2026-03-20
**Valid until:** 2026-04-20 (stable -- no fast-moving dependencies)

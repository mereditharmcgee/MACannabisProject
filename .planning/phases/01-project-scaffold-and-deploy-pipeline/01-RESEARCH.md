# Phase 1: Project Scaffold and Deploy Pipeline - Research

**Researched:** 2026-03-17
**Domain:** Astro static site generation, Tailwind CSS, Cloudflare Pages deployment
**Confidence:** HIGH

## Summary

This phase establishes a greenfield Astro project with Tailwind CSS that auto-deploys to Cloudflare Pages on every git push. The technology stack is mature and well-documented: Astro defaults to static site generation (no adapter needed for Cloudflare Pages), Tailwind CSS v4 integrates via a Vite plugin (not the deprecated `@astrojs/tailwind` integration), and Cloudflare Pages provides native Git integration with automatic builds.

The user specified "Astro 5" in the phase boundary. However, Astro 6.0.5 is now the latest release (as of March 2026) and requires Node 22.12+. The user's environment has Node 24.12.0, so either version works. Since this is a pure static site with no SSR needs, both versions are functionally equivalent for this use case. I recommend proceeding with Astro 5 as specified unless the user wants to upgrade -- the `npm create astro@latest` command will install Astro 6 by default, so the project creation command must pin to Astro 5.x explicitly.

**Primary recommendation:** Create an Astro 5.x static site with Tailwind CSS v4 via the `@tailwindcss/vite` plugin, deploy to Cloudflare Pages via GitHub Git integration, and configure `dispensaries.meredithmcgee.org` as a custom domain through the Cloudflare dashboard.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Subdomain: `dispensaries.meredithmcgee.org`
- Cloudflare Pages project with CNAME record in Cloudflare DNS pointing to `*.pages.dev`
- Separate deploy pipeline from any existing site on meredithmcgee.org
- Site name: "MA Cannabis Directory" (used in browser tabs, meta titles, Google results)
- Homepage headline remains: "Who Owns Your Dispensary?"
- Footer credit: "A project by Meredith McGee" -- subtle, not prominent
- Primary dataset: `MA_Dispensary_Ownership_Directory.xlsx` (in project root)
- Update workflow: export XLSX to CSV at `data/dispensaries.csv`, git push, auto-rebuild
- CSV is the build input; XLSX stays as the working source of truth
- `data/` directory created in this phase as part of scaffold, but actual pipeline is Phase 2

### Claude's Discretion
- Astro project structure and config details
- Tailwind configuration approach
- Placeholder page content and styling
- Git branch strategy (main only is fine)
- Cloudflare Pages build settings

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-04 | Site deploys to Cloudflare Pages from a git push with zero manual deploy steps | Cloudflare Pages Git integration provides automatic builds on push; build command `npm run build`, output dir `dist`, framework preset "Astro" |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | 5.x (latest 5.x) | Static site generator | User-specified; mature, zero-JS-by-default, ideal for content sites |
| tailwindcss | 4.x (latest: 4.2.1) | Utility-first CSS framework | User-specified; v4 uses Vite plugin instead of PostCSS |
| @tailwindcss/vite | 4.x | Tailwind CSS Vite integration | Official v4 integration method for Vite-based frameworks like Astro |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | - | - | No additional libraries needed for scaffold phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro 5.x | Astro 6.x | Astro 6 is latest, has Vite 7 and improved dev experience, but user specified v5; upgrade can happen later if desired |
| @tailwindcss/vite | @astrojs/tailwind | @astrojs/tailwind is DEPRECATED for Tailwind v4; do NOT use it |
| No adapter (static) | @astrojs/cloudflare | Adapter only needed for SSR/server routes; pure static sites should NOT use it |

**Installation:**
```bash
# Pin to Astro 5.x explicitly (npm create astro@latest installs v6)
npm create astro@latest ma-cannabis-directory -- --template minimal
cd ma-cannabis-directory
npm install tailwindcss @tailwindcss/vite
```

**Important version note:** Running `npm create astro@latest` as of March 2026 installs Astro 6. To get Astro 5, either:
1. Use `npm create astro@5` (if supported by the CLI)
2. Or after creating with `@latest`, downgrade: `npm install astro@5`
3. Verify with `npx astro --version` after creation

## Architecture Patterns

### Recommended Project Structure
```
ma-cannabis-directory/
├── astro.config.mjs       # Astro config with Tailwind Vite plugin
├── package.json
├── tsconfig.json           # Astro generates this
├── public/                 # Static assets (favicon, robots.txt)
├── data/                   # CSV data directory (empty in Phase 1, used in Phase 2)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro  # HTML shell, head tags, global CSS import
│   ├── pages/
│   │   └── index.astro       # Placeholder homepage
│   └── styles/
│       └── global.css         # Tailwind import
└── dist/                   # Build output (gitignored)
```

### Pattern 1: Astro Config with Tailwind v4 Vite Plugin
**What:** Configure Tailwind as a Vite plugin in Astro config (NOT as an Astro integration)
**When to use:** Always for Tailwind v4 + Astro
**Example:**
```javascript
// astro.config.mjs
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Pattern 2: Global CSS with Tailwind Import
**What:** Single CSS file that imports Tailwind, imported once in the base layout
**When to use:** Every Astro + Tailwind v4 project
**Example:**
```css
/* src/styles/global.css */
/* Source: https://tailwindcss.com/docs/installation/framework-guides/astro */
@import "tailwindcss";
```

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MA Cannabis Directory</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Pattern 3: Static Output (Default -- No Config Needed)
**What:** Astro defaults to `output: 'static'`, pre-rendering all pages at build time
**When to use:** This project -- pure static site, no SSR
**Example:**
```javascript
// No output config needed -- static is the default
// Do NOT add output: 'static' explicitly (it's redundant)
// Do NOT install @astrojs/cloudflare (it forces server mode)
```

### Anti-Patterns to Avoid
- **Installing @astrojs/cloudflare for a static site:** This adapter forces server mode and triggers Workers deployment instead of static Pages deployment. Only use it if you need SSR.
- **Using @astrojs/tailwind with Tailwind v4:** This integration is deprecated. Tailwind v4 uses a Vite plugin directly.
- **Adding `output: 'server'` or `output: 'hybrid'`:** Not needed; this is a static site.
- **Forgetting `site` in astro.config.mjs:** Required for generating correct canonical URLs, sitemaps, and absolute paths.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS reset/normalize | Custom reset CSS | Tailwind's built-in preflight | Tailwind v4 includes a modern CSS reset automatically |
| Deploy pipeline | Shell scripts, GitHub Actions | Cloudflare Pages Git integration | Native integration handles build, deploy, preview branches, rollbacks |
| Custom domain SSL | Manual cert management | Cloudflare automatic SSL | Free SSL provisioned automatically when custom domain is added |
| HTML boilerplate | Copy-paste HTML5 template | Astro BaseLayout component | Astro handles doctype, charset, viewport meta automatically in layouts |

**Key insight:** This phase should have almost zero custom code. The value is in correct configuration, not implementation.

## Common Pitfalls

### Pitfall 1: Wrong Tailwind Integration for v4
**What goes wrong:** Using `npx astro add tailwind` may install the deprecated `@astrojs/tailwind` integration instead of the Vite plugin
**Why it happens:** The Astro CLI integration for Tailwind was built for v3. Tailwind v4 changed the integration approach entirely.
**How to avoid:** Install `tailwindcss` and `@tailwindcss/vite` manually via npm, configure in `astro.config.mjs` under `vite.plugins`
**Warning signs:** A `tailwind.config.mjs` file being generated (Tailwind v4 does not use a config file by default)

### Pitfall 2: Installing Cloudflare Adapter for Static Site
**What goes wrong:** Site deploys as a Worker instead of static Pages, slower and more complex
**Why it happens:** Cloudflare's own docs suggest the adapter, but it's only for SSR sites
**How to avoid:** Do NOT run `npx astro add cloudflare`. No adapter needed for static output.
**Warning signs:** Build output includes `_worker.js` directory; deploy goes to Workers instead of Pages

### Pitfall 3: Cloudflare Pages Build Node Version
**What goes wrong:** Build fails because Cloudflare's default Node version is too old
**Why it happens:** Cloudflare Pages build environment may default to an older Node version
**How to avoid:** Set `NODE_VERSION` environment variable in Cloudflare Pages build settings (e.g., `18.17.1` for Astro 5, or `22.12.0` for Astro 6)
**Warning signs:** Build errors mentioning unsupported syntax or Node version

### Pitfall 4: Forgetting the `site` Config
**What goes wrong:** Canonical URLs, sitemap, and RSS feed generate with localhost or undefined URLs
**Why it happens:** Easy to skip during initial setup
**How to avoid:** Set `site: "https://dispensaries.meredithmcgee.org"` in `astro.config.mjs` from day one
**Warning signs:** HTML source shows `localhost` in meta tags

### Pitfall 5: Git Repo Not Initialized
**What goes wrong:** Can't connect to Cloudflare Pages, no auto-deploy
**Why it happens:** Project created locally without `git init`, or XLSX/large files bloat the repo
**How to avoid:** Initialize git early, add proper `.gitignore` (exclude `node_modules/`, `dist/`, `.xlsx` files), push to GitHub
**Warning signs:** No `.git` directory; Cloudflare dashboard shows no repos to connect

## Code Examples

### Complete astro.config.mjs
```javascript
// Source: https://tailwindcss.com/docs/installation/framework-guides/astro
//         https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dispensaries.meredithmcgee.org",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Placeholder Homepage (index.astro)
```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout>
  <main class="min-h-screen flex flex-col items-center justify-center bg-white px-4">
    <h1 class="text-4xl font-bold text-gray-900 mb-4">
      Who Owns Your Dispensary?
    </h1>
    <p class="text-lg text-gray-600 mb-8">
      MA Cannabis Directory — Coming Soon
    </p>
    <div class="flex gap-8 text-center">
      <div>
        <div class="text-3xl font-bold text-green-700">525</div>
        <div class="text-sm text-gray-500">Active Licenses</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-green-700">92%</div>
        <div class="text-sm text-gray-500">Independently Owned</div>
      </div>
      <div>
        <div class="text-3xl font-bold text-green-700">157</div>
        <div class="text-sm text-gray-500">Towns</div>
      </div>
    </div>
    <footer class="mt-16 text-sm text-gray-400">
      A project by Meredith McGee
    </footer>
  </main>
</BaseLayout>
```

### .gitignore
```
# Dependencies
node_modules/

# Build output
dist/

# Astro
.astro/

# Environment
.env
.env.*

# Data source files (large binaries)
*.xlsx
*.xls

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
*.swp
```

### Cloudflare Pages Build Settings
```
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: / (or subdirectory if Astro project is nested)
Environment variable: NODE_VERSION = 18
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @astrojs/tailwind integration | @tailwindcss/vite plugin | Tailwind v4 (Jan 2025) | No tailwind.config.mjs needed; CSS-first configuration |
| tailwind.config.js for customization | CSS @theme directive | Tailwind v4 (Jan 2025) | Theme customization done in CSS, not JavaScript |
| Cloudflare Pages as primary platform | Cloudflare Workers as primary (Pages in maintenance) | April 2025 | Pages still works and is stable; new features go to Workers. For static sites, Pages remains the right choice |
| Astro 4.x | Astro 5.x / 6.x | Dec 2024 / Feb 2026 | Content collections, improved performance; v6 requires Node 22+ |

**Deprecated/outdated:**
- `@astrojs/tailwind`: Deprecated for Tailwind v4. Use `@tailwindcss/vite` instead.
- `tailwind.config.mjs`: Not used in Tailwind v4. Theme customization is done via CSS `@theme` directive.
- Cloudflare Pages new feature development: Pages entered maintenance mode April 2025. Existing functionality is stable and fully supported.

## Open Questions

1. **Astro 5.x exact install command**
   - What we know: `npm create astro@latest` now installs Astro 6. The user specified Astro 5.
   - What's unclear: Whether `npm create astro@5` works or if manual version pinning is needed after creation.
   - Recommendation: Try `npm create astro@5 -- --template minimal` first. If that fails, create with `@latest` then `npm install astro@5`. Verify version before proceeding.

2. **Cloudflare Pages Node.js build version**
   - What we know: Astro 5 needs Node 18.17.1+. Cloudflare Pages allows setting NODE_VERSION env var.
   - What's unclear: The exact default Node version in Cloudflare's current build environment.
   - Recommendation: Explicitly set `NODE_VERSION=18` (or `20`) in Cloudflare Pages environment variables to avoid surprises.

3. **GitHub repository setup**
   - What we know: User needs a GitHub (or GitLab) repo connected to Cloudflare Pages for auto-deploy.
   - What's unclear: Whether user already has a GitHub repo for this project, or if the current project root (with .xlsx files) should become the repo.
   - Recommendation: Create a fresh GitHub repo. The Astro project can live in the project root, with `.gitignore` excluding `.xlsx` files and other non-code assets. Alternatively, create the Astro project in a subdirectory.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (greenfield -- needs setup) |
| Config file | None -- see Wave 0 |
| Quick run command | `npm run build` (build success = primary validation) |
| Full suite command | `npm run build && npx astro check` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-04 | Git push triggers auto build+deploy on Cloudflare Pages | smoke / manual | `npm run build` (local build verification) | N/A -- Wave 0 |
| DSGN-04a | Deployed site loads placeholder at production URL | manual-only | Manual: visit `https://dispensaries.meredithmcgee.org` | N/A |
| DSGN-04b | Tailwind CSS utility classes render correctly | smoke | `npm run build` (build succeeds with Tailwind) | N/A -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (confirms site builds without errors)
- **Per wave merge:** `npm run build && npx astro check` (includes type checking)
- **Phase gate:** Full build succeeds + manual verification of deployed URL + Tailwind rendering

### Wave 0 Gaps
- [ ] Git repository initialization (`git init`)
- [ ] GitHub remote repository creation and push
- [ ] Cloudflare Pages project creation (manual dashboard step)
- [ ] Custom domain configuration (manual dashboard step)
- [ ] No unit tests needed for scaffold phase -- build success is the validation

*(Phase 1 is infrastructure/scaffold -- validation is primarily "does it build and deploy" rather than unit tests)*

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS official Astro install guide](https://tailwindcss.com/docs/installation/framework-guides/astro) - Exact v4 setup steps with Vite plugin
- [Astro deploy to Cloudflare docs](https://docs.astro.build/en/guides/deploy/cloudflare/) - Static deployment, no adapter needed
- [Cloudflare Pages Astro framework guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) - Build settings, Git integration
- [Cloudflare Pages custom domains docs](https://developers.cloudflare.com/pages/configuration/custom-domains/) - CNAME setup for subdomains
- [Cloudflare Pages Git integration guide](https://developers.cloudflare.com/pages/get-started/git-integration/) - Auto-deploy on push

### Secondary (MEDIUM confidence)
- [Astro npm package](https://www.npmjs.com/package/astro) - Version 6.0.5 is latest; 5.x still available
- [Tailwind CSS npm package](https://www.npmjs.com/package/tailwindcss) - Version 4.2.1 is latest
- [Astro configuration reference](https://docs.astro.build/en/reference/configuration-reference/) - `output: 'static'` is default

### Tertiary (LOW confidence)
- Astro 5.x exact latest version number - could not confirm the precise latest 5.x release; npm shows 6.x as latest

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs from both Astro and Tailwind confirm setup approach
- Architecture: HIGH - Standard Astro project structure, well-documented patterns
- Pitfalls: HIGH - Common issues documented across multiple community sources and verified against official docs
- Deploy pipeline: HIGH - Cloudflare Pages Git integration is mature and well-documented
- Astro version pinning: MEDIUM - Need to verify exact `npm create astro@5` behavior at execution time

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable technologies, low churn risk)

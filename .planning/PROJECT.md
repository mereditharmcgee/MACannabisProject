# MA Cannabis Dispensary Ownership Directory

## What This Is

A free, consumer-facing website that reveals who owns every licensed cannabis dispensary in Massachusetts. Built on a manually researched dataset of 525 active retail, delivery, and medical cannabis licenses — each mapped to its parent company or independent owner with ownership characteristic tags (women-owned, Black-owned, veteran-owned, social equity, LGBTQ+-owned). Nobody else publishes this information. The MCC publishes license data but not ownership context; Leafly and Weedmaps list dispensaries but don't tell you who's behind them. This site does.

## Core Value

When someone Googles "who owns [dispensary name]," this site is the answer — a transparent, searchable directory that lets Massachusetts cannabis consumers shop by their values.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Search-first homepage with instant typeahead results (dispensary name, town, or owner)
- [ ] Filter pills for ownership tags: Women-Owned, Black-Owned, Veteran-Owned, Social Equity, LGBTQ+-Owned, Independent
- [ ] County dropdown and MSO Corporate vs Independent toggle
- [ ] Card-based results grid showing dispensary name, town, owner, and ownership badge tags
- [ ] Individual SEO-optimized dispensary detail page with short ownership narrative, structured facts, license info, address, phone number, and links to other locations by same owner
- [ ] Data pipeline from existing spreadsheet (525 records with ownership research)
- [ ] Monthly manual update workflow for data freshness
- [ ] "Suggest a correction" form on each listing
- [ ] Responsive design — works well on mobile and desktop
- [ ] Static/SSG pages for SEO performance

### Out of Scope

- Dispensary owner claim/edit flow — post-launch feature
- User accounts or authentication — not needed for a read-only public resource
- Monetization or sponsored listings — this is a transparency tool
- Real-time MCC data pipeline — future automation, MVP is manual updates
- Multi-state expansion — Massachusetts only for v1
- Map view — cards-first for MVP
- Reviews or ratings — this is about ownership transparency, not dispensary quality

## Context

- Data source: Manually researched Google Sheet/Excel with 525 active MA cannabis licenses, each with owner, parent company, ownership tags, license type, town, address, phone
- The Massachusetts Cannabis Commission (MCC) publishes license lists but not ownership context or equity designation details
- ~92% of licenses are independently owned; the rest are MSO (multi-state operator) chains like Curaleaf
- Ownership tags include: women-owned, Black-owned, veteran-owned, social equity program participant, LGBTQ+-owned
- Domain: Will live as a subdomain or path on meredithmcgee.org (already live, uses Cloudflare)
- Hosting: GitHub Pages or Cloudflare Pages preferred — already in the user's workflow
- This is a public resource / transparency tool with no monetization plans

## Constraints

- **Hosting**: Must work with Cloudflare Pages or GitHub Pages — low/no cost, already in workflow
- **Data updates**: Monthly manual process for MVP — no API integration yet
- **Budget**: Free hosting tier; no paid backend services
- **Domain**: Subdomain or path on meredithmcgee.org via Cloudflare DNS
- **Content**: Short 2-3 sentence ownership narratives per listing, not long-form profiles
- **Quality**: "Get it right" — polished before launch, not a quick prototype

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static site with client-side search | Free hosting on Cloudflare/GitHub Pages, SEO via pre-rendered pages, no backend cost | — Pending |
| Spreadsheet as data source | Data already lives there; build a pipeline to convert to site data | — Pending |
| No auth/user accounts for MVP | Read-only public resource doesn't need them | — Pending |
| Ownership narratives are short (2-3 sentences) | Enough for SEO differentiation without requiring long-form writing for 525 listings | — Pending |

---
*Last updated: 2026-03-17 after initialization*

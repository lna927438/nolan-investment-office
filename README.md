# Nolan Investment Office — V2.4

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home — strict single-screen landing page with connected visual focus board and mobile focus rail
- Focus — interactive sector modules with four distinct sector visual systems
- Office — leadership, linked operating network, interactive decision system and signal deck
- Contact — visual correspondence routing system and signal deck
- Legal
- 404

## Navigation model
- `/` — single-screen brand landing page
- `/focus/` — sector focus and areas of attention
- `/office/` — leadership, operating model and review process
- `/contact/` — correspondence routing categories
- `/legal/` — website disclosures

## Design direction
- Private investment office, not a fund-marketing website
- Warm ivory background
- Charcoal typography
- Muted olive accents
- Editorial serif headlines
- Restrained Nolan wordmark and custom NIO symbol
- Structured hairline dividers, modular diagrams and generous whitespace
- Progressive motion without heavy animation libraries
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V2.4 production polish
- Preserved the strict single-screen homepage
- Expanded practical hit targets for navigation and touch interaction without creating visible button chrome
- Removed sticky hover residue on touch-first devices and separated hover / press behavior
- Added text wrapping resilience for narrow layouts and OS font substitutions
- Added Focus deep-link scroll offsets and native grouped disclosure behavior
- Upgraded the Office process tabs with roving tabindex, Home/End navigation and explicit tab / panel relationships
- Added polite live-region updates to interactive Office and Contact readouts
- Reduced high-frequency pointer and scroll work through requestAnimationFrame scheduling
- Reduced mobile backdrop-filter cost while preserving the visual hierarchy
- Tightened footer height and retained active-route context
- Added prefers-contrast, forced-colors and reduced-motion production fallbacks

## V2.3 refinement and motion layer
- Progressive view-entry movement with static fallbacks
- Active-section handoff to the right-side Page Progress Rail
- Section-heading line-build states
- Scrolled-state response to the Nolan header symbol
- Synchronized micro-transitions for Office and Contact interactive systems
- Homepage Focus Board second-level research readout

## V2.2 sector and routing system
- Four distinct Focus visual languages for Technology, Healthcare, Energy & Infrastructure and Selective Consumer
- Linked Office Operating Network with Research, Operations and Professional Partners states
- Interactive Contact Correspondence Router with Founder, Professional and General routes
- Compact mobile signal deck and interior density rules

## Visual references and asset sourcing
Open-source design references and license notes are documented in `docs/visual-references.md`.

The curated media / texture / SVG / motion shortlist is documented in `docs/nolan-asset-library.md`. The asset library records source URLs, license baselines, intended placement, treatment guidance and recommendation priority before any media is promoted into the production site.

## Development

```bash
npm install
npm run dev
```

## Build verification
Every push to `main` runs an Astro build check and the preview site is deployed through GitHub Pages.

Preview: https://lna927438.github.io/nolan-investment-office/

## Before formal public launch
- Confirm final domain
- Add an official public office email/contact channel when available
- Confirm final legal entity wording and disclosure language
- Decide whether the source repository should remain public
- Switch preview pages from `noindex` to `index`
- Add a social preview image only if needed

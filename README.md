# Nolan Investment Office — V2.1

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home — strict single-screen landing page with interactive visual focus board and mobile focus rail
- Focus — interactive sector modules and context signal deck
- Office — modular leadership, operating model, interactive decision system and signal deck
- Contact — modular correspondence categories and signal deck
- Legal
- 404

## Navigation model
- `/` — single-screen brand landing page
- `/focus/` — sector focus and areas of attention
- `/office/` — leadership, operating model and review process
- `/contact/` — correspondence categories
- `/legal/` — website disclosures

## Design direction
- Private investment office, not a fund-marketing website
- Warm ivory background
- Charcoal typography
- Muted olive accents
- Editorial serif headlines
- Restrained Nolan wordmark and custom NIO symbol
- Structured hairline dividers and generous whitespace
- Modular interaction without heavy animation libraries
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V2.1 Nolan brand system
- Added a custom linear NIO symbol built from a framed N-form, center node and coordinate axes
- Integrated the NIO symbol into the primary header lockup, homepage network core, Office decision system and modular footer
- Updated the favicon to use the same Nolan visual mark
- Added a branded modular footer panel with office identity, location context and route navigation
- Upgraded the Office review process from static rows to an interactive five-stage Decision System
- Added keyboard-accessible process navigation with synchronized stage count, active node, moving orbit, title and explanatory copy
- Added a simplified four-node mobile Focus Rail so tablet and mobile users retain a visual focus map instead of losing the desktop board entirely
- Preserved the homepage as a strict single-screen layout while adding the mobile visual layer
- Preserved the V2.0 connected homepage network, signal decks, page progress rails, focus accordion, page transitions and route modules
- Fixed legacy selector conflicts introduced by the new brand lockup and isolated footer navigation from primary navigation styles
- Fixed Office process display target selectors so interaction updates the correct visual panel
- Preserved reduced-motion accessibility and no-JS content visibility wherever practical

## Visual references
The visual system incorporates selected design ideas from MIT-licensed Astro projects while keeping Nolan's implementation original and intentionally restrained. Reference and license notes are documented in `docs/visual-references.md`.

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

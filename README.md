# Nolan Investment Office — V2.2

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
- Modular interaction without heavy animation libraries
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V2.2 sector and routing system
- Added four distinct Focus visual languages rather than reusing one graphic treatment across every sector
- Technology now uses a distributed node/network visual
- Healthcare now uses diagnostic rings and a measured signal trace
- Energy & Infrastructure now uses a grid, flow lines and infrastructure nodes
- Selective Consumer now uses a repeat-loop / orbit visual
- Integrated each sector visual directly into its accessible Focus disclosure module
- Replaced the Office operating-model card row with a linked three-layer Operating Network
- Added synchronized Research, Operations and Professional Partners states with active connections and Nolan symbol movement
- Replaced static Contact correspondence rows with an interactive Correspondence Router
- Added Founder, Professional and General routing paths with synchronized map, route labels and useful-first-context guidance
- Added dynamic Nolan symbol states inside Office and Contact network systems
- Added a compact mobile density layer for interior pages
- Converted mobile signal decks into a compact three-column information band to reduce unnecessary page length
- Tightened mobile hero, section, route and footer spacing while keeping the modular visual language intact
- Preserved V2.1 NIO branding, homepage focus network, mobile focus rail, Office Decision System, branded footer and page progress rails
- Preserved reduced-motion and keyboard interaction support

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

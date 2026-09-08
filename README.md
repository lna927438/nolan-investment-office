# Nolan Investment Office — V2.0

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home — strict single-screen landing page with interactive visual focus board
- Focus — interactive sector modules and context signal deck
- Office — modular leadership, operating model, process rail and signal deck
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
- Restrained sans-serif wordmark and navigation
- Structured hairline dividers and generous whitespace
- Modular interaction without heavy animation libraries
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V2.0 visual information system
- Preserved the homepage as a strict one-screen layout with no vertical scrolling
- Upgraded the homepage Focus Board into a connected visual network with center node, sector links and active focus states
- Added responsive readout behavior so hover/focus on a sector changes the active connection, endpoint and board label
- Added layered panel depth to the homepage board without images or heavy effects
- Added reusable translucent Page Signal Deck modules to Focus, Office and Contact
- Added page-specific contextual modules for scope, method, horizon, structure, support, base and routing
- Added dynamic right-edge Page Progress Rails to interior pages on larger screens
- Added page coordinate marks such as `NIO / 01`, architectural grid lines, orbital background fields and quiet geometric anchors
- Added native cross-document view transitions where supported
- Added pointer-responsive radial highlight behavior to interactive modules
- Added tactile hover, focus and press states for desktop and touch input
- Converted Focus sectors into accessible native disclosure modules with single-open accordion behavior
- Added direct homepage-to-sector deep links that open the matching Focus module
- Added reusable large Route Module components between major pages
- Added visual decision-rail nodes to the Office process and signal-bar details to Contact modules
- Added interior support-module symbols and leadership watermark treatment
- Preserved reduced-motion accessibility and no-JS content visibility

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

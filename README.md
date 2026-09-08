# Nolan Investment Office — V1.8

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home — strict single-screen landing page
- Focus — interactive sector modules
- Office — modular leadership, operating model and process
- Contact — modular correspondence categories
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

## V1.8 modular interaction system
- Preserved the homepage as a strict one-screen layout with no vertical scrolling
- Added a subtle architectural grid and orbital background field as a shared visual base
- Added page coordinate marks such as `NIO / 01` for stronger editorial structure
- Added three compact route modules to the homepage for Focus, Office and Contact
- Added native cross-document view transitions where supported
- Added pointer-responsive radial highlight behavior to interactive modules
- Added tactile hover, focus and press states for desktop and touch input
- Converted Focus sectors into native accessible disclosure modules
- Added single-open accordion behavior so only one Focus module expands at a time
- Added reusable large Route Module components between major pages
- Added modular index-line states across Office and Contact content blocks
- Added responsive module behavior for tablet and mobile layouts
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

# Nolan Investment Office — V2.3

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

## V2.3 refinement and motion layer
- Preserved the strict single-screen homepage and existing V2.2 modular systems
- Added progressive view-entry movement in supporting browsers while keeping fully visible static fallbacks
- Added active-section handoff to the right-side Page Progress Rail so it now reports both page code and current content section
- Added section-heading line-build states as content enters the active reading zone
- Added a subtle scrolled-state response to the Nolan header symbol
- Added synchronized micro-transitions when Office Operating Network, Office Decision System and Contact Router change state
- Added unified Nolan symbol focus pulses inside interactive systems
- Expanded the homepage Focus Board readout to include selected-sector research keywords without increasing board height
- Added restrained text transition behavior to the Focus Board readout
- Preserved keyboard navigation, reduced-motion support and no-JS content visibility
- Kept mobile density rules intact and avoided adding new mobile page length

## V2.2 sector and routing system
- Four distinct Focus visual languages for Technology, Healthcare, Energy & Infrastructure and Selective Consumer
- Linked Office Operating Network with Research, Operations and Professional Partners states
- Interactive Contact Correspondence Router with Founder, Professional and General routes
- Compact mobile signal deck and interior density rules

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

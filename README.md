# Nolan Investment Office — V1.7

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home — strict single-screen landing page
- Focus
- Office
- Contact
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
- Minimal interaction with no decorative animation dependency
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V1.7 visual refinement
- Preserved the homepage as a strict one-screen layout with no vertical scrolling
- Added a semantic visual token layer inspired by mature MIT-licensed Astro projects
- Refined the translucent header and navigation timing
- Added editorial eyebrow markers and stronger typographic hierarchy
- Structured page intros with restrained divider grids
- Added subtle, low-noise row and card hover states on interior pages
- Refined section headings, CTA surfaces, leadership treatment and legal rows
- Improved visual depth with a very subtle warm/olive ambient background treatment
- Kept reduced-motion and reliability overrides intact
- Removed unfinished public-launch placeholder language from Contact and Legal

Open-source visual references and license notes are documented in `docs/visual-references.md`.

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

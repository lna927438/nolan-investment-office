# Nolan Investment Office — V1.5

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home
- Focus
- Office
- Contact
- Legal
- 404

## Navigation model
The public navigation uses real pages rather than in-page anchor links:

- `/` — Home overview and approach
- `/focus/` — sector focus and areas of attention
- `/office/` — leadership, operating model and review process
- `/contact/` — correspondence categories
- `/legal/` — website disclosures

## Design direction
- Private investment office, not a fund-marketing website
- Warm ivory background
- Charcoal typography
- Editorial serif headlines
- Restrained sans-serif wordmark
- Generous whitespace
- Minimal motion
- No financial dashboards, AUM claims, portfolio-logo walls or sales-style CTAs

## V1.5 refinements
- Reduced the oversized home hero typography so the main statement resolves more cleanly
- Shortened excess empty space above the hero content
- Strengthened the NOLAN wordmark while keeping the identity restrained
- Added a subtle header boundary and understated navigation underline states
- Tightened desktop and mobile spacing across major sections
- Reduced secondary text scale to improve hierarchy
- Refined Focus, Office, Contact and Legal page hero proportions for consistency
- Preserved responsive behavior and reduced-motion accessibility

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
- Add official office email/contact channel
- Confirm final legal entity wording and disclosure language
- Decide whether the source repository should remain public
- Switch preview pages from `noindex` to `index`
- Add a social preview image only if needed

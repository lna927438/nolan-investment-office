# Nolan Investment Office — V1.4

Minimal multi-page website for Nolan Investment Office, built with Astro.

## Current site structure
- Home
- Focus
- Office
- Contact
- Legal
- 404

## Navigation model
The public navigation now uses real pages rather than in-page anchor links:

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

## V1.4 refinements
- Converted the original single-page navigation into a true multi-page site
- Added a shared site layout for consistent navigation, metadata and footer behavior
- Kept Approach on the Home page to avoid unnecessary page fragmentation
- Added a dedicated Focus page with four research areas
- Added a dedicated Office page covering leadership, operating structure and review workflow
- Added a dedicated Contact page without publishing placeholder or invented contact data
- Added current-page navigation states
- Preserved GitHub Pages base-path compatibility and noindex preview status

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

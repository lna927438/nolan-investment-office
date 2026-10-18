# Cala Vale Office

Static website preview for Cala Vale Office.

## Current version

- English, Chinese and Spanish language switching.
- Maria Alvaró and Alissa Bryan appear in parallel member cards with name, role and location.
- Each card opens a detailed member profile. Close, Escape and outside click return to the page.
- Each member uses one original photograph.
- Original animation, layout, image bytes and font are preserved from the latest approved preview package.
- Embedded images and the font are stored separately in `assets/` so browsers can load and cache them individually.

## Preview status

The contact form is a preview and does not send messages. The hero video requires an internet connection and has a local static fallback. Search indexing remains disabled.

## Check and build

Requires Node.js 22 or later. No third-party build dependencies are required.

```sh
npm ci
npm run verify
npm run build
```

The build copies the website into `dist/`. To preview locally, serve that directory with any static HTTP server, or open `index.html` directly.

Pushes to `main` run verification and publish the preview through the existing GitHub Pages workflow.

Preview: https://lna927438.github.io/nolan-investment-office/

See `MATERIALS.md` for source and license notes. The Aspekta font license is included in the HTML.

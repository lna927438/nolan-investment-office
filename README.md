# Nolan Investment Office — V4

Interactive multi-page website for Nolan Investment Office, built with Astro, Three.js and cannon-es.

## Current site structure
- Home — strict single-screen landing page over a real-time WebGL space scene
- Focus — image-forward sector gallery synchronized with the 3D environment
- Office — editorial leadership, operating model and review process over the live space layer
- Contact — large correspondence route modules over the live space layer
- Legal
- 404

## V4 true 3D space system
- Added a site-wide Three.js WebGL scene rendered behind the interface
- Added a real perspective camera with pointer-driven parallax and view rotation
- Added scroll-driven camera depth and scene rotation on interior pages
- Added wheel-driven depth response on the non-scrolling homepage
- Added a three-dimensional star field, dust particles, orbital rings, wireframe structures and a metallic central core
- Added physically based materials, multiple dynamic lights and desktop bloom post-processing
- Added cannon-es rigid-body physics with dynamic 3D objects, collision boundaries, restitution and continuous motion
- Clicking non-interactive parts of the page applies real physical impulses to the floating bodies and creates a temporary spatial pulse
- Pointer movement changes camera position and the live 3D light position in real time
- Focus sector changes synchronize the 3D lighting palette, orbit-node emphasis and spatial focus state
- Added page-specific 3D modes: Deep Space, Sector Orbit, Structure Field and Signal Space
- Preserved `prefers-reduced-motion` with a static 3D render instead of forcing continuous animation
- Reduced particle counts, disabled bloom and lowered pixel ratio on mobile / coarse-pointer devices
- Pauses the render loop when the page is hidden to reduce GPU use

## V3 editorial reset retained above the 3D layer
- Bodoni Moda display typography + Manrope interface typography
- high-contrast editorial composition
- large image and dark-field modules rather than dashboard-like micro-panels
- image-forward Focus gallery adapted from an MIT-licensed Astro gallery project
- dark editorial Office and Contact modules

## Technology
- Astro 5
- Three.js
- cannon-es
- Three.js EffectComposer / UnrealBloomPass
- native Web Animations API for selected foreground transitions

## Licensing
Third-party software and adapted open-source design notices are documented in `THIRD_PARTY_NOTICES.md`.

Media sources and license records are documented in:
- `docs/media-sources.md`
- `docs/nolan-asset-library.md`
- `docs/visual-references.md`

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
- Run a final device/GPU performance pass on iPhone, iPad, integrated-graphics laptops and desktop browsers

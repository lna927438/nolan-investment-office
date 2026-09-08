# Nolan Investment Office — V4.2

Interactive multi-page website for Nolan Investment Office, built with Astro, Three.js and cannon-es.

## Current site structure
- Home — strict single-screen landing page over the real-time WebGL space scene with the native NIO sculpture
- Focus — image-forward sector gallery synchronized with self-hosted external glTF sector models and HDRI lighting
- Office — editorial leadership, operating model and review process over the V4.1 architectural structure model
- Contact — correspondence route modules over the V4.1 live 3D signal-array model
- Legal
- 404

## V4.2 external GLTF / HDRI experience
- Added self-hosted Poly Haven CC0 glTF assets for Technology, Healthcare, Energy & Infrastructure and Selective Consumer
- Technology uses Classic Laptop, Healthcare uses Bunsen Burner, Energy uses Power Box 01 and Selective Consumer uses Jug 01
- Added a desktop-only self-hosted Machine Shop 03 HDRI environment for image-based lighting and material reflections
- Added `GLTFLoader` and `RGBELoader` without hotlinking production assets
- Only the active Focus model is required for initial display; remaining models are prefetched during idle time on desktop
- Mobile skips HDRI loading and uses the lighter live studio-light rig
- Added runtime model normalization so assets from different real-world scales share one controlled presentation stage
- Added three material modes: original PBR, technical graphite and translucent glass
- Added real 3D hotspots attached to each model with Raycaster picking
- Clicking a hotspot flies the camera to that component and opens a projected contextual label beside the selected point
- Added scroll-driven Catmull-Rom camera paths for a true model fly-through rather than simple Z-axis movement
- Desktop drag rotates the loaded glTF asset in real time; clicking the model triggers a closer inspection camera state
- Focus tab changes swap the external 3D asset, accent lighting, hotspot set and model readout in sync with the editorial content
- Added keyboard controls: `M` changes material mode and `Esc` resets the current view
- Poly Haven model/HDRI source and license records are documented in `docs/3d-assets.md`

## V4.1 interactive native model system
- Transparent Three.js model layer above the physics space and below the HTML interface
- Native multi-mesh models for the Home NIO sculpture, Office structure and Contact signal array
- Three.js Raycaster picking, camera fly-to, drag rotation, explode/reassemble and reset behavior
- Responsive model scaling and lower-cost rendering behavior on coarse-pointer/mobile devices

## V4 true 3D space system
- Site-wide Three.js WebGL scene rendered behind the interface
- Real perspective camera with pointer-driven parallax and view rotation
- Three-dimensional star field, dust particles, orbital rings, wireframe structures and a metallic central core
- Physically based materials, multiple dynamic lights and desktop bloom post-processing
- cannon-es rigid-body physics with dynamic 3D objects, collision boundaries, restitution and continuous motion
- Clicking non-interactive page space applies real physical impulses to floating bodies and creates a spatial pulse
- Page-specific 3D modes: Deep Space, Sector Orbit, Structure Field and Signal Space
- Render loop pauses when the page is hidden to reduce GPU use

## V3 editorial system retained above the 3D layers
- Bodoni Moda display typography + Manrope interface typography
- high-contrast editorial composition
- large image and dark-field modules rather than dashboard-like micro-panels
- image-forward Focus gallery adapted from an MIT-licensed Astro gallery project
- dark editorial Office and Contact modules

## Technology
- Astro 5
- Three.js
- cannon-es
- Three.js GLTFLoader / RGBELoader
- Three.js EffectComposer / UnrealBloomPass
- Three.js Raycaster
- native Web Animations API for selected foreground transitions

## Licensing
Third-party software and adapted open-source design notices are documented in `THIRD_PARTY_NOTICES.md`.

Media / model source and license records are documented in:
- `docs/3d-assets.md`
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
- Run a final model-load audit under slow mobile/network conditions and verify graceful fallback behavior

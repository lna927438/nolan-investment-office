# Nolan Investment Office — V4.1

Interactive multi-page website for Nolan Investment Office, built with Astro, Three.js and cannon-es.

## Current site structure
- Home — strict single-screen landing page over a real-time WebGL space scene with an interactive NIO sculpture
- Focus — image-forward sector gallery synchronized with four selectable 3D sector models
- Office — editorial leadership, operating model and review process over a manipulable architectural structure model
- Contact — correspondence route modules over a live 3D signal-array model
- Legal
- 404

## V4.1 interactive model system
- Added a second transparent Three.js model layer above the physics space and below the HTML interface
- Added real multi-mesh 3D model assemblies rather than flat image or CSS pseudo-3D treatments
- Home uses a sculptural 3D NIO mark assembled from volumetric geometry, rings and a glass core
- Focus includes four dedicated model assemblies: Technology Core, Diagnostic Ring, Energy Turbine and Material Object
- Office includes an explodable architectural structure / frame model
- Contact includes an interactive radial signal-array model
- Added Three.js Raycaster picking so visible model geometry can be selected from pointer coordinates
- Clicking a model triggers a camera fly-to / dolly state
- Desktop pointer drag rotates the selected model in real time
- Added an Explode control that separates model components along stored three-dimensional vectors and reassembles them smoothly
- Added Reset and Escape-key behavior to restore camera, rotation and exploded state
- Focus tab changes now synchronize both the existing live-space palette and the foreground 3D model selection
- Dynamic model lighting follows pointer position and changes with the active model/sector
- Added responsive model scaling and lower-cost rendering behavior on coarse-pointer/mobile devices
- Preserved reduced-motion behavior with a static 3D model render
- The V4.1 model layer adds only a small dedicated client chunk while reusing the existing shared Three.js/post-processing bundle

## V4 true 3D space system
- Site-wide Three.js WebGL scene rendered behind the interface
- Real perspective camera with pointer-driven parallax and view rotation
- Scroll-driven camera depth and scene rotation on interior pages
- Wheel-driven depth response on the non-scrolling homepage
- Three-dimensional star field, dust particles, orbital rings, wireframe structures and a metallic central core
- Physically based materials, multiple dynamic lights and desktop bloom post-processing
- cannon-es rigid-body physics with dynamic 3D objects, collision boundaries, restitution and continuous motion
- Clicking non-interactive page space applies real physical impulses to floating bodies and creates a spatial pulse
- Focus sector changes synchronize lighting palette, orbit-node emphasis and spatial focus state
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
- Three.js EffectComposer / UnrealBloomPass
- Three.js Raycaster
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
- Decide whether later V4.x releases should introduce external GLB/GLTF assets in addition to the native Three.js model assemblies

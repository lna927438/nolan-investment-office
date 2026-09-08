# V4.2 3D Asset Sources

Nolan Investment Office self-hosts the production 3D assets listed below. These files were downloaded once from Poly Haven, stored under `public/models/` and `public/hdri/`, and are not hotlinked from the production website.

Poly Haven license: https://polyhaven.com/license

Poly Haven states that its HDRIs, textures and 3D models are released under CC0 and may be used for commercial work without required attribution.

## Technology
- Asset: Classic Laptop
- Source: https://polyhaven.com/a/classic_laptop
- Author: Arrangemonk
- License: CC0
- Local entry: `public/models/classic_laptop/classic_laptop_1k.gltf`
- Runtime role: interactive Technology sector model

## Healthcare
- Asset: Bunsen Burner
- Source: https://polyhaven.com/a/bunsen_burner
- Author: BKS
- License: CC0
- Local entry: `public/models/bunsen_burner/bunsen_burner_1k.gltf`
- Runtime role: laboratory-instrument visual for the Healthcare sector

## Energy & Infrastructure
- Asset: Power Box 01
- Source: https://polyhaven.com/a/power_box_01
- Authors: Rico Cilliers (modeling/texturing), Yann Kervran (rigging)
- License: CC0
- Local entry: `public/models/power_box_01/power_box_01_1k.gltf`
- Runtime role: electrical distribution / physical infrastructure visual

## Selective Consumer
- Asset: Jug 01
- Source: https://polyhaven.com/a/jug_01
- Author: Kuutti Siitonen
- License: CC0
- Local entry: `public/models/jug_01/jug_01_1k.gltf`
- Runtime role: material, form and product-design visual

## HDRI environment
- Asset: Machine Shop 03
- Source: https://polyhaven.com/a/machine_shop_03
- Author: Oliksiy Yakovlyv
- License: CC0
- Local entry: `public/hdri/machine_shop_03_1k.hdr`
- Runtime role: desktop-only image-based lighting / reflections for GLTF models

## Runtime rules
- Only the active Focus model is required for initial display.
- Remaining models are prefetched during idle time on desktop only.
- Mobile does not load the HDRI environment; it uses the lighter live studio-light rig.
- Three material modes are provided at runtime: original PBR, technical graphite, and translucent glass.
- Model hotspots, camera fly-to and scroll-driven camera paths are Nolan-specific interaction code rather than part of the downloaded assets.

Last reviewed: 2026-09-09

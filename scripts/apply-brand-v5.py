from pathlib import Path


def patch(path: str, old: str, new: str):
    p = Path(path)
    text = p.read_text()
    if new in text:
        print(f'skip {path}: already updated')
        return
    if old not in text:
        raise SystemExit(f'{path}: brand patch anchor not found: {old[:120]!r}')
    p.write_text(text.replace(old, new, 1))
    print(f'patched {path}')


# Load the new identity after all legacy brand/space rules.
patch(
    'src/components/SiteLayout.astro',
    'import "../styles/runtime-safety.css";\n',
    'import "../styles/runtime-safety.css";\nimport "../styles/brand-v5.css";\n',
)

# Focus sector tabs: remove text glyph arrows and use the Nolan route icon.
patch(
    'src/components/FocusGallery.astro',
    '---\ninterface FocusItem {',
    '---\nimport NioIcon from "./NioIcon.astro";\n\ninterface FocusItem {',
)
patch(
    'src/components/FocusGallery.astro',
    '        <i aria-hidden="true">↗</i>',
    '        <NioIcon name="arrow-up-right" className="nio-route-icon" />',
)

# Interactive native model controls.
patch(
    'src/components/NioModelLayer.astro',
    '---\ninterface Props {',
    '---\nimport NioIcon from "./NioIcon.astro";\n\ninterface Props {',
)
patch(
    'src/components/NioModelLayer.astro',
    '''      <div class="nio-model-actions">
        <button type="button" data-nio-model-explode aria-pressed="false">Explode</button>
        <button type="button" data-nio-model-reset>Reset</button>
      </div>''',
    '''      <div class="nio-model-actions">
        <button type="button" data-nio-model-explode aria-pressed="false"><NioIcon name="explode" className="nio-action-icon" /><span>Explode</span></button>
        <button type="button" data-nio-model-reset><NioIcon name="reset" className="nio-action-icon" /><span>Reset</span></button>
      </div>''',
)
patch(
    'src/components/NioModelLayer.astro',
    '<strong data-nio-model-label>NIO CORE</strong>',
    '<strong data-nio-model-label>NOLAN ORBIT</strong>',
)

# Replace the old square/box-derived 3D mark with the new Orbit/Vector language.
patch(
    'src/components/NioModelLayer.astro',
    '''    const buildNioCore = () => {
      const m = createModel('NIO SCULPTURE', 0x7ee8ff, 0);
      const mat = metal(0x7ee8ff, { color: 0x101827, emissiveIntensity: 0.28, roughness: 0.12 });
      addPiece(m, new THREE.BoxGeometry(0.24, 2.4, 0.42), mat.clone(), [-0.78, 0, 0], [-1.4, 0.2, 0.4]);
      addPiece(m, new THREE.BoxGeometry(0.24, 2.4, 0.42), mat.clone(), [0.78, 0, 0], [1.4, -0.2, -0.4]);
      addPiece(m, new THREE.BoxGeometry(0.25, 2.15, 0.42), mat.clone(), [0, 0, 0], [0, 1.1, 0.9], [0, 0, -0.67]);
      addPiece(m, new THREE.TorusGeometry(1.48, 0.035, 12, 160), metal(0x9d8cff, { color: 0x0e1420, emissiveIntensity: 0.52 }), [0, 0, -0.14], [0, 0, -1.2], [1.14, 0.3, 0.18]);
      addPiece(m, new THREE.IcosahedronGeometry(0.34, 3), glass(0xe6c98b), [0, 0, 0.3], [0, 0, 1.55]);
      addEdgeShell(m, new THREE.BoxGeometry(2.6, 2.9, 1.1), 0x7ee8ff, 0.18);
      return m;
    };''',
    '''    const buildNioCore = () => {
      const m = createModel('NOLAN ORBIT', 0x7ee8ff, 0);
      const letter = metal(0x7ee8ff, { color: 0x111a28, emissiveIntensity: 0.3, roughness: 0.13 });
      const orbit = metal(0x9d8cff, { color: 0x0b111c, emissiveIntensity: 0.68, roughness: 0.1 });

      addPiece(m, new THREE.BoxGeometry(0.19, 2.5, 0.3), letter.clone(), [-0.72, 0, 0], [-1.35, 0.08, 0.42]);
      addPiece(m, new THREE.BoxGeometry(0.19, 2.5, 0.3), letter.clone(), [0.72, 0, 0], [1.35, -0.08, -0.42]);
      addPiece(m, new THREE.BoxGeometry(0.19, 2.36, 0.3), letter.clone(), [0, 0, 0], [0, 1.25, 0.72], [0, 0, -0.55]);

      addPiece(
        m,
        new THREE.TorusGeometry(1.55, 0.026, 10, 180, Math.PI * 1.42),
        orbit.clone(),
        [0, -0.08, -0.16],
        [0.2, -0.65, -1.25],
        [0.16, 0.32, -0.68]
      );
      addPiece(
        m,
        new THREE.TorusGeometry(1.38, 0.018, 10, 120, Math.PI * 0.62),
        metal(0x7ee8ff, { color: 0x0b111c, emissiveIntensity: 0.44, roughness: 0.12 }),
        [0.02, 0.03, -0.1],
        [-0.35, 0.8, 0.75],
        [0.2, -0.15, 2.38]
      );
      addPiece(
        m,
        new THREE.SphereGeometry(0.115, 28, 28),
        metal(0x7ee8ff, { color: 0x7ee8ff, emissiveIntensity: 2.4, metalness: 0.18, roughness: 0.08 }),
        [1.48, -0.28, 0.18],
        [1.15, -0.35, 1.2]
      );
      return m;
    };''',
)

# Real glTF viewer controls use the same icon family.
patch(
    'src/components/NioAssetGallery3D.astro',
    '---\nconst base = import.meta.env.BASE_URL;',
    '---\nimport NioIcon from "./NioIcon.astro";\n\nconst base = import.meta.env.BASE_URL;',
)
patch(
    'src/components/NioAssetGallery3D.astro',
    '''  <div class="nio-asset-actions">
    <button type="button" data-nio-asset-material>Material 01</button>
    <button type="button" data-nio-asset-reset>Reset view</button>
  </div>''',
    '''  <div class="nio-asset-actions">
    <button type="button" data-nio-asset-material><NioIcon name="layers" className="nio-action-icon" /><span>Material 01</span></button>
    <button type="button" data-nio-asset-reset><NioIcon name="reset" className="nio-action-icon" /><span>Reset</span></button>
  </div>''',
)

# Material state text now lives inside a span because the button also contains an icon.
patch(
    'src/components/NioAssetGallery3D.astro',
    "    const materialButton = controls.querySelector('[data-nio-asset-material]');",
    "    const materialButton = controls.querySelector('[data-nio-asset-material]');\n    const materialLabel = materialButton?.querySelector('span');",
)
patch(
    'src/components/NioAssetGallery3D.astro',
    '      if (materialButton) materialButton.textContent = `Material 0${materialMode + 1}`;',
    '      if (materialLabel) materialLabel.textContent = `Material 0${materialMode + 1}`;',
)

# Final CSS details for the new mark and route lockups.
patch(
    'src/styles/brand-v5.css',
    '''.brand:hover .nio-mark-node,
.brand:focus-visible .nio-mark-node{
  transform:scale(1.35);''',
    '''.brand:hover .nio-mark-node,
.brand:focus-visible .nio-mark-node{
  fill:var(--space-cyan,#7ee8ff);
  transform:scale(1.35);''',
)
patch(
    'src/styles/brand-v5.css',
    '''.nio-route-icon{
  width:20px;''',
    '''.v3-home-routes strong{
  display:flex!important;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.nio-route-icon{
  width:20px;''',
)

print('Nolan Orbit / Vector brand migration complete.')

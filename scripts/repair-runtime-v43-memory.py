from pathlib import Path

path = Path('src/components/NioAssetGallery3D.astro')
text = path.read_text()


def replace_once(old, new):
    global text
    if new in text:
        return
    if old not in text:
        raise SystemExit(f'Patch anchor not found: {old[:120]!r}')
    text = text.replace(old, new, 1)


replace_once(
"""    const prepareMaterials = (object, accent) => {
""",
"""    const disposeObjectResources = (object) => {
      if (!object) return;
      const geometries = new Set();
      const materials = new Set();
      const textures = new Set();
      const collectMaterial = (value) => {
        const list = Array.isArray(value) ? value : value ? [value] : [];
        list.forEach((material) => {
          if (!material || materials.has(material)) return;
          materials.add(material);
          Object.values(material).forEach((candidate) => {
            if (candidate?.isTexture) textures.add(candidate);
          });
        });
      };
      object.traverse((node) => {
        if (node.geometry) geometries.add(node.geometry);
        collectMaterial(node.material);
        collectMaterial(node.userData?.nioOriginalMaterial);
        collectMaterial(node.userData?.nioTechMaterial);
        collectMaterial(node.userData?.nioGlassMaterial);
      });
      textures.forEach((texture) => texture.dispose?.());
      materials.forEach((material) => material.dispose?.());
      geometries.forEach((geometry) => geometry.dispose?.());
    };

    const prepareMaterials = (object, accent) => {
""")

replace_once(
"""        const gltf = await gltfLoader.loadAsync(config.url);
        if (destroyed) return null;
        const root = new THREE.Group();
""",
"""        const gltf = await gltfLoader.loadAsync(config.url);
        if (destroyed) {
          disposeObjectResources(gltf.scene);
          return null;
        }
        const root = new THREE.Group();
""")

replace_once(
"""      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.55));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
""",
"""      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.55));
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      if (reduceMotion && !destroyed) renderer.render(scene, camera);
    };
""")

replace_once(
"""      environmentTexture?.dispose();
      loaded.forEach(({ root }) => {
        root.traverse((node) => {
          node.geometry?.dispose?.();
          const mats = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
          mats.forEach((mat) => mat?.dispose?.());
        });
      });
      document.documentElement.classList.remove('webgl-lost');
""",
"""      scene.environment = null;
      environmentTexture?.dispose();
      loaded.forEach(({ root }) => disposeObjectResources(root));
      loaded.clear();
      loading.clear();
      document.documentElement.classList.remove('webgl-lost');
""")

path.write_text(text)
print('Final 3D memory/resource disposal patches applied.')

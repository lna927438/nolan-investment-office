from pathlib import Path


def patch(path: str, old: str, new: str):
    p = Path(path)
    text = p.read_text()
    if new in text:
        print(f"skip {path}: already patched")
        return
    if old not in text:
        raise SystemExit(f"{path}: patch anchor not found: {old[:120]!r}")
    p.write_text(text.replace(old, new, 1))
    print(f"patched {path}")


# -----------------------------------------------------------------------------
# Site shell: graceful fallback when JavaScript/WebGL is unavailable.
# -----------------------------------------------------------------------------
patch(
    "src/components/SiteLayout.astro",
    'import "../styles/space3d.css";\n',
    'import "../styles/space3d.css";\nimport "../styles/runtime-safety.css";\n',
)
patch(
    "src/components/SiteLayout.astro",
    '<html lang="en">',
    '<html lang="en" class="no-js">',
)
patch(
    "src/components/SiteLayout.astro",
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />\n',
    '''    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script is:inline>
      (() => {
        const root = document.documentElement;
        root.classList.remove('no-js');
        root.classList.add('js');
        try {
          const probe = document.createElement('canvas');
          const gl = probe.getContext('webgl2') || probe.getContext('webgl');
          if (!gl) root.classList.add('no-webgl');
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        } catch {
          root.classList.add('no-webgl');
        }
      })();
    </script>
''',
)


# -----------------------------------------------------------------------------
# NioSpace: no duplicate bloom outside Focus, no reduced-motion pulse leak,
# static redraws when state changes, and WebGL context-loss cleanup.
# -----------------------------------------------------------------------------
patch(
    "src/components/NioSpace.astro",
    "    if (!mobile && !reduceMotion) {\n      composer = new EffectComposer(renderer);",
    "    if (!mobile && !reduceMotion && page === 'focus') {\n      composer = new EffectComposer(renderer);",
)
patch(
    "src/components/NioSpace.astro",
    "    const onClick = (event) => {\n      const target = event.target instanceof Element ? event.target : null;",
    "    const onClick = (event) => {\n      if (reduceMotion) return;\n      const target = event.target instanceof Element ? event.target : null;",
)
patch(
    "src/components/NioSpace.astro",
    """      orbitNodes.forEach((node, index) => {
        node.material.emissive.set(activeAccents[(index + focusIndex) % activeAccents.length]);
        node.material.emissiveIntensity = index === focusIndex ? 3 : 1;
      });
    };""",
    """      orbitNodes.forEach((node, index) => {
        node.material.emissive.set(activeAccents[(index + focusIndex) % activeAccents.length]);
        node.material.emissiveIntensity = index === focusIndex ? 3 : 1;
      });
      if (reduceMotion) renderer.render(scene, camera);
    };""",
)
patch(
    "src/components/NioSpace.astro",
    """      renderer.setSize(window.innerWidth, window.innerHeight, false);
      composer?.setSize(window.innerWidth, window.innerHeight);
    };""",
    """      renderer.setSize(window.innerWidth, window.innerHeight, false);
      composer?.setSize(window.innerWidth, window.innerHeight);
      if (reduceMotion) renderer.render(scene, camera);
    };""",
)
patch(
    "src/components/NioSpace.astro",
    "    window.addEventListener('pointermove', onPointerMove, { passive: true });",
    """    const onContextLost = (event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frame);
      document.documentElement.classList.add('webgl-lost');
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);

    window.addEventListener('pointermove', onPointerMove, { passive: true });""",
)
patch(
    "src/components/NioSpace.astro",
    """      window.removeEventListener('nio:focuschange', onFocusChange);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
      composer?.dispose();""",
    """      window.removeEventListener('nio:focuschange', onFocusChange);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      document.documentElement.classList.remove('webgl-lost');
      composer?.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();""",
)


# -----------------------------------------------------------------------------
# NioModelLayer: reduced-motion still responds to controls, named listeners can
# be removed, pointer cancellation cannot leave drag state stuck, and context
# loss is handled instead of leaving dead controls on-screen.
# -----------------------------------------------------------------------------
patch(
    "src/components/NioModelLayer.astro",
    """      if (closeCamera) {
        cameraTarget.set(focusPosition.x * 0.34, focusPosition.y * 0.2, mobile ? 9.2 : 7.15);
        lookTarget.copy(focusPosition);
        focused = true;
      }
      window.dispatchEvent(new CustomEvent('nio:modelchange', { detail: { index: activeIndex, label: active.userData.label } }));""",
    """      if (closeCamera) {
        cameraTarget.set(focusPosition.x * 0.34, focusPosition.y * 0.2, mobile ? 9.2 : 7.15);
        lookTarget.copy(focusPosition);
        focused = true;
      }
      if (reduceMotion) {
        pageModels.forEach((model) => {
          model.position.copy(model.userData.positionTarget);
          model.scale.setScalar(model.userData.scaleTarget);
          model.rotation.copy(model.userData.rotationTarget);
          setModelVisualOpacity(model, model.userData.opacityTarget ?? 1);
        });
        camera.position.copy(cameraTarget);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
      }
      window.dispatchEvent(new CustomEvent('nio:modelchange', { detail: { index: activeIndex, label: active.userData.label } }));""",
)
patch(
    "src/components/NioModelLayer.astro",
    """      pageModels.forEach((model) => {
        model.userData.explodeTarget = 0;
        model.userData.rotationTarget.set(0.08, -0.22, 0);
      });
      if (explodeButton instanceof HTMLButtonElement) explodeButton.setAttribute('aria-pressed', 'false');
    };""",
    """      pageModels.forEach((model) => {
        model.userData.explodeTarget = 0;
        model.userData.rotationTarget.set(0.08, -0.22, 0);
        if (reduceMotion) {
          model.userData.explode = 0;
          model.rotation.copy(model.userData.rotationTarget);
          model.userData.pieces.forEach((piece) => {
            if (piece.userData.basePosition) piece.position.copy(piece.userData.basePosition);
          });
        }
      });
      if (explodeButton instanceof HTMLButtonElement) explodeButton.setAttribute('aria-pressed', 'false');
      if (reduceMotion) {
        camera.position.copy(cameraTarget);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
      }
    };""",
)
patch(
    "src/components/NioModelLayer.astro",
    """      active.userData.explodeTarget = active.userData.explodeTarget > 0.5 ? 0 : 1;
      if (explodeButton instanceof HTMLButtonElement) explodeButton.setAttribute('aria-pressed', active.userData.explodeTarget ? 'true' : 'false');
    };""",
    """      active.userData.explodeTarget = active.userData.explodeTarget > 0.5 ? 0 : 1;
      if (explodeButton instanceof HTMLButtonElement) explodeButton.setAttribute('aria-pressed', active.userData.explodeTarget ? 'true' : 'false');
      if (reduceMotion) {
        active.userData.explode = active.userData.explodeTarget;
        active.userData.pieces.forEach((piece) => {
          const base = piece.userData.basePosition;
          const vector = piece.userData.explodeVector;
          if (base && vector) piece.position.copy(base).addScaledVector(vector, active.userData.explode);
        });
        renderer.render(scene, camera);
      }
    };""",
)
patch(
    "src/components/NioModelLayer.astro",
    """        active.userData.rotationTarget.x = THREE.MathUtils.clamp(active.userData.rotationTarget.x, -1.05, 1.05);
        lastX = event.clientX;""",
    """        active.userData.rotationTarget.x = THREE.MathUtils.clamp(active.userData.rotationTarget.x, -1.05, 1.05);
        if (reduceMotion) {
          active.rotation.copy(active.userData.rotationTarget);
          renderer.render(scene, camera);
        }
        lastX = event.clientX;""",
)
patch(
    "src/components/NioModelLayer.astro",
    """      if (wasDragging && movedDuringDrag) return;
      updatePointer(event);""",
    """      if (wasDragging && movedDuringDrag) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a,button,summary,input,textarea,select,label')) return;
      updatePointer(event);""",
)
patch(
    "src/components/NioModelLayer.astro",
    """    explodeButton?.addEventListener('click', toggleExplode);
    resetButton?.addEventListener('click', resetView);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') resetView();
      if (event.key.toLowerCase() === 'e' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) toggleExplode();
    });""",
    """    const onKeyDown = (event) => {
      if (event.key === 'Escape') resetView();
      if (event.key.toLowerCase() === 'e' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) toggleExplode();
    };
    const onPointerCancel = () => {
      dragging = false;
      movedDuringDrag = false;
      controls.classList.remove('is-dragging');
    };
    const onContextLost = (event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frame);
      document.documentElement.classList.add('webgl-lost');
    };

    explodeButton?.addEventListener('click', toggleExplode);
    resetButton?.addEventListener('click', resetView);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onPointerCancel);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('webglcontextlost', onContextLost, false);""",
)
patch(
    "src/components/NioModelLayer.astro",
    """      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
      window.removeEventListener('nio:focuschange', onFocusChange);
      document.removeEventListener('visibilitychange', onVisibility);
      renderer.dispose();
      composer?.dispose();""",
    """      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('blur', onPointerCancel);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', resize);
      window.removeEventListener('nio:focuschange', onFocusChange);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      explodeButton?.removeEventListener('click', toggleExplode);
      resetButton?.removeEventListener('click', resetView);
      document.documentElement.classList.remove('webgl-lost');
      composer?.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();""",
)


# -----------------------------------------------------------------------------
# NioAssetGallery3D: async activation races, initial hash/deep-link state,
# duplicate loads, reduced-motion redraws, failed loads and resource cleanup.
# -----------------------------------------------------------------------------
for label, slug in [
    ("TECHNOLOGY / CLASSIC LAPTOP", "technology"),
    ("HEALTHCARE / LAB INSTRUMENT", "healthcare"),
    ("ENERGY / POWER SYSTEM", "energy-infrastructure"),
    ("CONSUMER / MATERIAL OBJECT", "selective-consumer"),
]:
    patch(
        "src/components/NioAssetGallery3D.astro",
        f"        label: '{label}',\n        url:",
        f"        label: '{label}',\n        slug: '{slug}',\n        url:",
    )

patch(
    "src/components/NioAssetGallery3D.astro",
    """    const gltfLoader = new GLTFLoader();
    const loaded = new Map();
    let activeIndex = 0;""",
    """    const gltfLoader = new GLTFLoader();
    const loaded = new Map();
    const loading = new Map();
    let activationToken = 0;
    let destroyed = false;
    let environmentTexture = null;
    let idleCancel = null;
    let activeIndex = 0;""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """        const original = Array.isArray(node.material) ? node.material.map((m) => m.clone()) : node.material.clone();
        node.userData.nioOriginalMaterial = original;""",
    """        node.userData.nioOriginalMaterial = node.material;""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      if (materialButton) materialButton.textContent = `Material 0${materialMode + 1}`;
    };""",
    """      if (materialButton) materialButton.textContent = `Material 0${materialMode + 1}`;
      if (reduceMotion && !destroyed) renderer.render(scene, camera);
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """    const loadAsset = async (index) => {
      if (loaded.has(index)) return loaded.get(index);
      const config = configs[index];
      if (stateEl) stateEl.textContent = 'Loading model';
      const gltf = await gltfLoader.loadAsync(config.url);
      const root = new THREE.Group();
      root.visible = false;
      root.rotation.set(...config.rotation);
      const object = normalizeObject(gltf.scene);
      prepareMaterials(object, config.accent);
      root.add(object);
      const hotspots = createHotspots(root, config);
      stage.add(root);
      const record = { root, object, hotspots, config };
      loaded.set(index, record);
      return record;
    };""",
    """    const loadAsset = async (index, announce = false) => {
      if (loaded.has(index)) return loaded.get(index);
      if (loading.has(index)) return loading.get(index);
      const config = configs[index];
      if (announce && stateEl) stateEl.textContent = 'Loading model';
      const task = (async () => {
        const gltf = await gltfLoader.loadAsync(config.url);
        if (destroyed) return null;
        const root = new THREE.Group();
        root.visible = false;
        root.rotation.set(...config.rotation);
        const object = normalizeObject(gltf.scene);
        prepareMaterials(object, config.accent);
        root.add(object);
        const hotspots = createHotspots(root, config);
        stage.add(root);
        return { root, object, hotspots, config };
      })();
      loading.set(index, task);
      try {
        const record = await task;
        if (record) loaded.set(index, record);
        return record;
      } finally {
        loading.delete(index);
      }
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      marker.getWorldPosition(tempWorld);
      cameraTarget.copy(tempWorld).add(new THREE.Vector3(mobile ? 0.4 : 1.15, 0.45, mobile ? 4.6 : 3.25));
      lookTarget.copy(tempWorld);
    };""",
    """      marker.getWorldPosition(tempWorld);
      cameraTarget.copy(tempWorld).add(new THREE.Vector3(mobile ? 0.4 : 1.15, 0.45, mobile ? 4.6 : 3.25));
      lookTarget.copy(tempWorld);
      if (reduceMotion && !destroyed) {
        camera.position.copy(cameraTarget);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
        requestAnimationFrame(() => updateHotspotOverlay());
      }
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """    const activate = async (index) => {
      activeIndex = Math.max(0, Math.min(configs.length - 1, index));
      clearHotspot();
      const record = await loadAsset(activeIndex);
      loaded.forEach((item, i) => { item.root.visible = i === activeIndex; });
      activeRoot = record.root;
      activeHotspots = record.hotspots;
      rim.color.set(record.config.accent);
      materialMode = 0;
      applyMaterialMode();
      if (labelEl) labelEl.textContent = record.config.label;
      if (stateEl) stateEl.textContent = mobile ? 'Live model · light mode' : 'HDRI environment · live model';
      resetView(false);
      window.dispatchEvent(new CustomEvent('nio:assetmodelchange', { detail: { index: activeIndex, label: record.config.label } }));
    };""",
    """    const activate = async (index) => {
      const requestedIndex = Math.max(0, Math.min(configs.length - 1, index));
      const token = ++activationToken;
      activeIndex = requestedIndex;
      clearHotspot();
      try {
        const record = await loadAsset(requestedIndex, true);
        if (!record || destroyed || token !== activationToken || activeIndex !== requestedIndex) return;
        loaded.forEach((item, i) => { item.root.visible = i === requestedIndex; });
        activeRoot = record.root;
        activeHotspots = record.hotspots;
        rim.color.set(record.config.accent);
        materialMode = 0;
        applyMaterialMode();
        if (labelEl) labelEl.textContent = record.config.label;
        if (stateEl) stateEl.textContent = mobile ? 'Live model · light mode' : (scene.environment ? 'HDRI environment · live model' : 'Live model · studio lights');
        resetView(false);
        if (reduceMotion && !destroyed) renderer.render(scene, camera);
        window.dispatchEvent(new CustomEvent('nio:assetmodelchange', { detail: { index: activeIndex, label: record.config.label } }));
      } catch (error) {
        if (token === activationToken && stateEl) stateEl.textContent = '3D asset unavailable';
        console.warn('Nolan 3D asset failed to load', error);
      }
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      if (activeRoot) {
        activeRoot.rotation.set(...configs[activeIndex].rotation);
      }
    };""",
    """      if (activeRoot) {
        activeRoot.rotation.set(...configs[activeIndex].rotation);
      }
      if (reduceMotion && !destroyed) {
        camera.position.copy(cameraTarget);
        camera.lookAt(lookTarget);
        renderer.render(scene, camera);
      }
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      if (wasDragging && moved) return;
      updatePointer(event);""",
    """      if (wasDragging && moved) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a,button,summary,input,textarea,select,label')) return;
      updatePointer(event);""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      if (!selectedHotspot) {
        cameraTarget.copy(cameraCurve.getPoint(scrollProgress));
        lookTarget.copy(stage.position).add(new THREE.Vector3(
          Math.sin(scrollProgress * Math.PI) * 0.3,
          (0.5 - scrollProgress) * 0.24,
          -scrollProgress * 0.32
        ));
      }
    };""",
    """      if (!selectedHotspot) {
        cameraTarget.copy(cameraCurve.getPoint(scrollProgress));
        lookTarget.copy(stage.position).add(new THREE.Vector3(
          Math.sin(scrollProgress * Math.PI) * 0.3,
          (0.5 - scrollProgress) * 0.24,
          -scrollProgress * 0.32
        ));
        if (reduceMotion && !destroyed) {
          camera.position.copy(cameraTarget);
          camera.lookAt(lookTarget);
          renderer.render(scene, camera);
        }
      }
    };""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('nio:focuschange', (event) => activate(Number(event.detail?.index || 0)));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') resetView();
      if (event.key.toLowerCase() === 'm' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        materialMode = (materialMode + 1) % 3;
        applyMaterialMode();
      }
    });

    materialButton?.addEventListener('click', () => {
      materialMode = (materialMode + 1) % 3;
      applyMaterialMode();
    });
    resetButton?.addEventListener('click', () => resetView());""",
    """    const onFocusChange = (event) => {
      activate(Number(event.detail?.index || 0)).catch((error) => console.warn('Focus 3D activation failed', error));
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') resetView();
      if (event.key.toLowerCase() === 'm' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        materialMode = (materialMode + 1) % 3;
        applyMaterialMode();
      }
    };
    const onMaterialClick = () => {
      materialMode = (materialMode + 1) % 3;
      applyMaterialMode();
    };
    const onResetClick = () => resetView();
    const onPointerCancel = () => {
      dragging = false;
      moved = false;
      controls.classList.remove('is-dragging');
    };
    const onContextLost = (event) => {
      event.preventDefault();
      running = false;
      cancelAnimationFrame(frame);
      document.documentElement.classList.add('webgl-lost');
      if (stateEl) stateEl.textContent = '3D rendering paused';
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur', onPointerCancel);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('nio:focuschange', onFocusChange);
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('webglcontextlost', onContextLost, false);

    materialButton?.addEventListener('click', onMaterialClick);
    resetButton?.addEventListener('click', onResetClick);""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """      new RGBELoader().load(`${base}hdri/machine_shop_03_1k.hdr`, (texture) => {
        const env = pmrem.fromEquirectangular(texture).texture;
        scene.environment = env;
        texture.dispose();
        pmrem.dispose();
        if (stateEl) stateEl.textContent = 'HDRI environment · live model';
      }, undefined, () => {
        pmrem.dispose();
        if (stateEl) stateEl.textContent = 'Live model · studio lights';
      });""",
    """      new RGBELoader().load(`${base}hdri/machine_shop_03_1k.hdr`, (texture) => {
        if (destroyed) {
          texture.dispose();
          pmrem.dispose();
          return;
        }
        environmentTexture?.dispose();
        environmentTexture = pmrem.fromEquirectangular(texture).texture;
        scene.environment = environmentTexture;
        texture.dispose();
        pmrem.dispose();
        if (stateEl) stateEl.textContent = 'HDRI environment · live model';
        if (reduceMotion) renderer.render(scene, camera);
      }, undefined, () => {
        pmrem.dispose();
        if (!destroyed && stateEl) stateEl.textContent = 'Live model · studio lights';
      });""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """    onScroll();
    activate(0).then(() => {
      if (!mobile) {
        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1400));
        idle(() => {
          configs.forEach((_, index) => { if (index !== 0) loadAsset(index).catch(() => {}); });
        });
      }
    }).catch(() => {
      if (stateEl) stateEl.textContent = 'Asset unavailable';
    });

    if (reduceMotion) {
      setTimeout(() => renderer.render(scene, camera), 650);
    } else {
      frame = requestAnimationFrame(animate);
    }""",
    """    onScroll();
    const initialSlug = window.location.hash.replace('#', '');
    const hashIndex = configs.findIndex((config) => config.slug === initialSlug);
    const initialIndex = hashIndex >= 0 ? hashIndex : 0;
    activate(initialIndex).then(() => {
      if (!mobile && !destroyed) {
        const prefetch = () => configs.forEach((_, index) => {
          if (index !== initialIndex) loadAsset(index, false).catch(() => {});
        });
        if ('requestIdleCallback' in window) {
          const id = window.requestIdleCallback(prefetch, { timeout: 2600 });
          idleCancel = () => window.cancelIdleCallback(id);
        } else {
          const id = window.setTimeout(prefetch, 1400);
          idleCancel = () => window.clearTimeout(id);
        }
      }
    }).catch((error) => {
      if (stateEl) stateEl.textContent = '3D asset unavailable';
      console.warn('Initial Nolan 3D asset failed', error);
    });

    if (!reduceMotion) frame = requestAnimationFrame(animate);""",
)
patch(
    "src/components/NioAssetGallery3D.astro",
    """    const cleanup = () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };""",
    """    const cleanup = () => {
      destroyed = true;
      activationToken += 1;
      running = false;
      cancelAnimationFrame(frame);
      idleCancel?.();
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('blur', onPointerCancel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('nio:focuschange', onFocusChange);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', onContextLost, false);
      materialButton?.removeEventListener('click', onMaterialClick);
      resetButton?.removeEventListener('click', onResetClick);
      environmentTexture?.dispose();
      loaded.forEach(({ root }) => {
        root.traverse((node) => {
          node.geometry?.dispose?.();
          const mats = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
          mats.forEach((mat) => mat?.dispose?.());
        });
      });
      document.documentElement.classList.remove('webgl-lost');
      renderer.dispose();
      renderer.forceContextLoss?.();
    };""",
)

print("V4.2 runtime reliability patch complete.")

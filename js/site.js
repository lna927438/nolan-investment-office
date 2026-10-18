
/* Progressive enhancement for the investment office design preview. */
(() => {
  'use strict';

  const run = (initialise) => {
    try { initialise(); } catch (error) {
      // Each enhancement is isolated so the document remains usable.
      console.warn('An optional page enhancement could not start.', error);
    }
  };

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let requestedMotion = true;
  const motionEnabled = () => requestedMotion && !reducedMotion?.matches;
  const motionEvent = 'office-motion-change';
  const language = () => {
    const value = document.documentElement.lang.toLowerCase();
    return value.startsWith('zh') ? 'zh' : value.startsWith('es') ? 'es' : 'en';
  };
  const localize = (en, zh, es) => ({ en, zh, es })[language()] || en;

  run(() => {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  });

  run(() => {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    let wantsOpen = false;
    let previousFocus = null;
    let animation = null;
    let finishTransition = null;
    let revision = 0;
    const inertState = new Map();
    const desktop = window.matchMedia?.('(min-width: 992px)');
    const focusable = () => [...document.querySelectorAll('button[data-set-language]'), toggle, ...menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(element => element.getClientRects().length > 0);
    function labelMenu() {
      toggle.setAttribute('aria-label', wantsOpen
        ? localize('Close navigation menu', '关闭导航菜单', 'Cerrar el menú de navegación')
        : localize('Open navigation menu', '打开导航菜单', 'Abrir el menú de navegación'));
    }

    function transition(open, complete, immediate = false) {
      const token = ++revision;
      const from = menu.hidden ? 'translateY(-100svh)' : getComputedStyle(menu).transform;
      animation?.cancel();
      animation = null;
      menu.hidden = false;
      finishTransition = () => {
        if (token !== revision) return;
        animation?.cancel();
        animation = null;
        finishTransition = null;
        complete();
      };
      // A short navigation transition keeps the menu responsive.
      if (immediate || !motionEnabled() || typeof menu.animate !== 'function') {
        finishTransition();
        return;
      }
      try {
        animation = menu.animate([
          { transform: from === 'none' ? 'translateY(0svh)' : from },
          { transform: open ? 'translateY(0svh)' : 'translateY(-100svh)' }
        ], { duration: 350, easing: 'ease', fill: 'both' });
        animation.finished.then(() => {
          if (token === revision) finishTransition?.();
        }).catch(() => {});
      } catch (_) { finishTransition(); }
    }

    function close(restoreFocus = true, target = null, immediate = false) {
      if (menu.hidden && !wantsOpen) return;
      wantsOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      labelMenu();
      transition(false, () => {
        const focusWasInMenu = menu.contains(document.activeElement);
        menu.hidden = true;
        document.body.classList.remove('menu-open');
        inertState.forEach((wasInert, element) => { element.inert = wasInert; });
        inertState.clear();
        if (target) {
          // Let the hash retain its ordinary history and deep-link behavior.
          const hash = `#${target.id}`;
          if (window.location.hash !== hash) window.location.hash = hash;
          else target.scrollIntoView({ behavior: motionEnabled() ? 'smooth' : 'auto' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        } else if (restoreFocus || focusWasInMenu) {
          const candidates = [previousFocus, toggle, document.querySelector('#site-header a[href]')];
          candidates.find(element => element?.isConnected && element.getClientRects().length)?.focus({ preventScroll: true });
        }
        previousFocus = null;
        document.dispatchEvent(new Event('office-menu-change'));
      }, immediate);
    }

    function open() {
      if (desktop?.matches || window.innerWidth > 991) return;
      if (menu.hidden) {
        previousFocus = document.activeElement;
        document.querySelectorAll('main, footer').forEach(element => {
          if (!('inert' in element)) return;
          inertState.set(element, element.inert);
          element.inert = true;
        });
      }
      wantsOpen = true;
      toggle.setAttribute('aria-expanded', 'true');
      labelMenu();
      document.body.classList.add('menu-open');
      transition(true, () => {});
      const firstLink = focusable().find(element => menu.contains(element) && element.matches('a[href]'));
      (firstLink || toggle).focus({ preventScroll: true });
      document.dispatchEvent(new Event('office-menu-change'));
    }

    toggle.setAttribute('aria-expanded', 'false');
    labelMenu();
    menu.hidden = true;
    document.addEventListener('office-language-change', labelMenu);
    toggle.addEventListener('click', () => wantsOpen ? close() : open());
    menu.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || !menu.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute('href');
      const target = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null;
      if (target) {
        event.preventDefault();
        close(false, target);
      } else close(false, null, true);
    });
    document.addEventListener('keydown', event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !items.includes(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !items.includes(current))) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 991) close(false, null, true);
    }, { passive: true });
    document.addEventListener(motionEvent, () => {
      if (!motionEnabled()) finishTransition?.();
    });
  });

  run(() => {
    const header = document.getElementById('site-header');
    const heroStage = document.querySelector('.hero-stage');
    const progress = document.getElementById('scroll-progress');
    const sections = [...document.querySelectorAll('[data-section]')].filter(section => section.id);
    const links = [...document.querySelectorAll('[data-nav-link]')];
    let queued = false;
    let previousSection = null;
    let previousY = Math.max(0, window.scrollY || 0);

    function update() {
      queued = false;
      const y = Math.max(0, window.scrollY || 0);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const heroBottom = heroStage?.getBoundingClientRect().bottom ?? 0;
      header?.classList.toggle('is-scrolled', heroBottom <= (header?.getBoundingClientRect().height || 0));
      // IX2 a-18/a-19: CSS supplies the 500ms 0% / -130% transition.
      if (header) {
        if (!motionEnabled() || y <= 20 || document.body.classList.contains('menu-open') || header.contains(document.activeElement)) {
          header.classList.remove('is-hidden');
        } else if (Math.abs(y - previousY) > 1) {
          header.classList.toggle('is-hidden', y > previousY);
        }
      }
      previousY = y;
      if (progress) progress.style.transform = `scaleX(${maxScroll ? Math.min(1, y / maxScroll) : 0})`;

      let active = sections[0]?.id;
      const threshold = Math.max(110, (header?.getBoundingClientRect().height || 0) + 48);
      sections.forEach(section => {
        if (section.getBoundingClientRect().top <= threshold) active = section.id;
      });
      if (maxScroll > 0 && y >= maxScroll - 4) active = sections[sections.length - 1]?.id;
      if (active === previousSection) return;
      previousSection = active;
      links.forEach(link => {
        if (link.getAttribute('href') === `#${active}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    function schedule() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule, { once: true });
    document.addEventListener('office-menu-change', schedule);
    document.addEventListener(motionEvent, schedule);
    header?.addEventListener('focusin', schedule);
    header?.addEventListener('focusout', schedule);
    update();
  });

  run(() => {
    const toggle = document.getElementById('motion-toggle');
    const label = document.getElementById('motion-label');
    function labelMotion() {
      const enabled = motionEnabled();
      if (toggle) {
        toggle.setAttribute('aria-label', localize('Motion effects', '动态效果', 'Efectos de movimiento'));
        toggle.title = reducedMotion?.matches
          ? localize('Motion is disabled by your system preference.', '系统偏好设置已关闭动态效果。', 'Las animaciones están desactivadas por la preferencia de tu sistema.')
          : localize('Turn decorative motion on or off', '开启或关闭装饰性动态效果', 'Activar o desactivar las animaciones decorativas');
      }
      if (label) label.textContent = enabled
        ? localize('Motion on', '动态开启', 'Animaciones activadas')
        : localize('Motion off', '动态关闭', 'Animaciones desactivadas');
    }
    function apply() {
      const enabled = motionEnabled();
      document.body.classList.toggle('motion-off', !enabled);
      if (toggle) {
        toggle.setAttribute('aria-pressed', String(enabled));
        toggle.disabled = Boolean(reducedMotion?.matches);
      }
      labelMotion();
      document.dispatchEvent(new CustomEvent(motionEvent, { detail: { enabled } }));
    }

    apply();
    toggle?.addEventListener('click', () => {
      if (reducedMotion?.matches) return;
      requestedMotion = !requestedMotion;
      apply();
    });
    if (reducedMotion?.addEventListener) reducedMotion.addEventListener('change', apply);
    else reducedMotion?.addListener?.(apply);
    document.addEventListener('office-language-change', labelMotion);
  });

  run(() => {
    if (typeof window.Lenis !== 'function') return;
    let lenis = null;
    let frame = 0;
    const locked = () => document.body.classList.contains('menu-open') || document.body.classList.contains('member-dialog-open');
    function updateLock() {
      if (!lenis) return;
      if (locked()) lenis.stop();
      else lenis.start();
    }
    function tick(time) {
      if (!lenis) return;
      lenis.raf(time);
      frame = window.requestAnimationFrame(tick);
    }
    function apply() {
      if (!motionEnabled()) {
        window.cancelAnimationFrame(frame);
        lenis?.destroy();
        lenis = null;
        return;
      }
      if (!lenis) {
        // Supplied locally. syncTouch:false is the current native-touch option.
        lenis = new window.Lenis({
          autoRaf: false, smoothWheel: true, respectReducedMotion: true,
          lerp: 0.1, wheelMultiplier: 0.7,
          gestureOrientation: 'vertical', syncTouch: false,
          prevent: node => Boolean(node.closest?.('#mobile-menu, [data-member-dialog], [data-lenis-prevent]'))
        });
        frame = window.requestAnimationFrame(tick);
      }
      updateLock();
    }
    apply();
    document.addEventListener(motionEvent, apply);
    if ('MutationObserver' in window) {
      new MutationObserver(updateLock).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    document.addEventListener('office-menu-change', updateLock);
  });

  run(() => {
    const roots = [...document.querySelectorAll('[data-word-reveal], [data-hero-lines], [data-body-words]')];
    const ordinary = [...document.querySelectorAll('[data-reveal]')].filter(element =>
      !element.matches('[data-word-reveal], [data-hero-lines], [data-body-words], [data-image-reveal], [data-key-scene]') &&
      !element.querySelector('[data-word-reveal], [data-hero-lines], [data-body-words], [data-image-reveal], [data-key-scene]')
    );
    const records = [...roots.map(root => ({ root, kind: root.hasAttribute('data-hero-lines') ? 'lines' : root.hasAttribute('data-body-words') ? 'body' : 'words', hero: root.matches('h1') || root.hasAttribute('data-hero-lines'), played: false, animations: [] })),
      ...ordinary.map(root => ({ root, kind: 'ordinary', hero: false, played: false, animations: [] }))];
    const canAnimate = typeof Element.prototype.animate === 'function';
    const canObserve = 'IntersectionObserver' in window;
    const byRoot = new Map(records.map(record => [record.root, record]));
    let wordObserver = null;
    let ordinaryObserver = null;
    let heroReady = document.readyState !== 'loading';
    let resizeFrame = 0;

    function cleanup(root) {
      root.querySelectorAll('[data-motion-accessible]').forEach(node => node.remove());
      [...root.querySelectorAll('[data-motion-generated]')].reverse().forEach(node => node.replaceWith(...node.childNodes));
      root.normalize();
    }
    function visible(node) {
      if (node.parentElement?.closest('[hidden]')) return false;
      const translation = node.parentElement?.closest('[data-lang]');
      return !translation || translation.dataset.lang === language();
    }
    function accessibleText(root) {
      const text = root.innerText.replace(/\s+/g, ' ').trim();
      const label = document.createElement('span');
      label.className = 'sr-only';
      label.setAttribute('data-motion-accessible', '');
      label.textContent = text;
      root.prepend(label);
    }
    function wrapper(className, text) {
      const span = document.createElement('span');
      span.className = className;
      span.setAttribute('data-motion-generated', '');
      if (text !== undefined) span.textContent = text;
      return span;
    }
    function wordParts(text) {
      if (/\p{Script=Han}/u.test(text) && typeof Intl.Segmenter === 'function') {
        return [...new Intl.Segmenter('zh', { granularity: 'word' }).segment(text)].map(part => part.segment);
      }
      return text.split(/(\s+)/u).filter(Boolean);
    }
    function splitWords(record) {
      // Keep interactive descendants' names intact; this hook is for plain copy.
      if (record.kind === 'body' && record.root.querySelector('a[href], button, input, select, textarea')) return [];
      const nodes = [];
      const walker = document.createTreeWalker(record.root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) if (visible(walker.currentNode) && walker.currentNode.textContent.trim()) nodes.push(walker.currentNode);
      const pieces = [];
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        wordParts(node.textContent).forEach(text => {
          if (/^\s+$/u.test(text)) { fragment.append(document.createTextNode(text)); return; }
          const word = wrapper('motion-word', text);
          word.style.display = 'inline-block';
          if (record.hero) {
            const mask = wrapper('motion-word-mask');
            mask.style.cssText = 'display:inline-block;overflow:clip;vertical-align:bottom;';
            mask.setAttribute('aria-hidden', 'true');
            mask.append(word);
            fragment.append(mask);
          } else {
            word.setAttribute('aria-hidden', 'true');
            fragment.append(word);
          }
          pieces.push(word);
        });
        node.replaceWith(fragment);
      });
      accessibleText(record.root);
      return pieces;
    }
    function splitLines(record) {
      const container = [...record.root.querySelectorAll('[data-lang]')].find(element => !element.hidden && element.dataset.lang === language()) || record.root;
      // The hero copy is plain translated text. Keep richer markup untouched.
      if ([...container.childNodes].some(node => node.nodeType !== Node.TEXT_NODE)) return [];
      container.normalize();
      const node = container.firstChild;
      if (!node?.textContent?.trim()) return [];
      const text = node.textContent;
      const range = document.createRange();
      const lines = [];
      let previousTop = null;
      let start = 0;
      let offset = 0;
      // Range rectangles retain the browser's actual wrapping, including CJK.
      for (const character of text) {
        const end = offset + character.length;
        range.setStart(node, offset);
        range.setEnd(node, end);
        const rect = range.getBoundingClientRect();
        if (character.trim() && rect.height) {
          if (previousTop !== null && Math.abs(rect.top - previousTop) > 2) {
            lines.push(text.slice(start, offset));
            start = offset;
          }
          previousTop = rect.top;
        }
        offset = end;
      }
      lines.push(text.slice(start));
      range.detach?.();
      const pieces = [];
      const fragment = document.createDocumentFragment();
      lines.forEach(textLine => {
        const mask = wrapper('motion-line-mask');
        mask.style.cssText = 'display:block;overflow:clip;';
        mask.setAttribute('aria-hidden', 'true');
        const line = wrapper('motion-line', textLine);
        line.style.display = 'block';
        mask.append(line);
        fragment.append(mask);
        pieces.push(line);
      });
      container.replaceChildren(fragment);
      accessibleText(record.root);
      return pieces;
    }
    function stop(record) {
      record.animations.forEach(animation => animation.cancel());
      record.animations = [];
    }
    function keyframes(y, unit, power) {
      // Sample the measured power1.out / outQuart curves without a remote engine.
      return Array.from({ length: 61 }, (_, index) => {
        const time = index / 60;
        const value = 1 - Math.pow(1 - time, power);
        return { offset: time, opacity: value, transform: `translateY(${y * (1 - value)}${unit})` };
      });
    }
    const wordFrames = keyframes(-20, '%', 2);
    const lineFrames = keyframes(20, '%', 2);
    const bodyFrames = keyframes(100, '%', 2);
    const ordinaryFrames = keyframes(100, 'px', 4);
    function play(record) {
      if (record.played) return;
      record.played = true;
      record.root.classList.add('is-visible');
      wordObserver?.unobserve(record.root);
      ordinaryObserver?.unobserve(record.root);
      record.animations.forEach(animation => {
        animation.play();
        animation.finished.then(() => animation.cancel()).catch(() => {});
      });
    }
    function prepare(record) {
      stop(record);
      cleanup(record.root);
      record.root.classList.remove('reveal-ready');
      if (!motionEnabled() || !canAnimate || (!record.hero && !canObserve) || record.played) {
        record.root.classList.add('is-visible');
        return;
      }
      try {
        const pieces = record.kind === 'words' || record.kind === 'body' ? splitWords(record) : record.kind === 'lines' ? splitLines(record) : [record.root];
        const frames = record.kind === 'words' ? wordFrames : record.kind === 'body' ? bodyFrames : record.kind === 'lines' ? lineFrames : ordinaryFrames;
        pieces.forEach((piece, index) => {
          const animation = piece.animate(frames, {
            duration: record.kind === 'ordinary' ? 600 : 400,
            delay: record.kind === 'words' ? Math.min(index * 35, 280) : record.kind === 'body' ? Math.min(index * 8, 120) : record.kind === 'lines' ? index * 100 : 0,
            fill: 'both', easing: 'linear'
          });
          animation.pause();
          animation.currentTime = 0;
          animation.finished.catch(() => {});
          record.animations.push(animation);
        });
        // IX3 t-ef093bef uses 0.5s and 0.2s line offsets. Its omitted ease
        // follows the official GSAP quadratic default; deployed overrides are unknown.
        if (record.hero) { if (heroReady) play(record); }
        else {
          record.root.classList.add('reveal-ready');
          (record.kind === 'words' || record.kind === 'body' ? wordObserver : ordinaryObserver)?.observe(record.root);
        }
      } catch (_) {
        stop(record);
        cleanup(record.root);
        record.root.classList.add('is-visible');
      }
    }
    function createObservers() {
      if (!canObserve) return;
      const enter = entries => entries.forEach(entry => {
        if (entry.isIntersecting) play(byRoot.get(entry.target));
      });
      // Pixel bottom margin represents 25% of viewport HEIGHT (IO % uses width).
      wordObserver?.disconnect();
      wordObserver = new IntersectionObserver(enter, { threshold: 0, rootMargin: `0px 0px -${window.innerHeight * 0.25}px 0px` });
      if (!ordinaryObserver) ordinaryObserver = new IntersectionObserver(enter, { threshold: 0 });
    }
    function rebuild() {
      createObservers();
      records.forEach(prepare);
    }
    function loaded() {
      heroReady = true;
      records.filter(record => record.hero).forEach(record => {
        if (motionEnabled()) play(record);
      });
    }
    rebuild();
    if (!heroReady) document.addEventListener('DOMContentLoaded', loaded, { once: true });
    document.fonts?.ready.then(() => {
      records.filter(record => record.kind === 'lines' && !record.played).forEach(prepare);
    }).catch(() => {});
    document.addEventListener('office-language-change', rebuild);
    document.addEventListener(motionEvent, () => {
      if (!motionEnabled()) {
        wordObserver?.disconnect();
        ordinaryObserver?.disconnect();
        records.forEach(record => { record.played = true; prepare(record); });
      } else rebuild();
    });
    window.addEventListener('resize', () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        createObservers();
        records.forEach(record => {
          if (record.kind === 'lines') prepare(record);
          else if (!record.played && (record.kind === 'words' || record.kind === 'body')) wordObserver?.observe(record.root);
        });
      });
    }, { passive: true });
    window.addEventListener('beforeprint', () => records.forEach(record => {
      record.played = true;
      prepare(record);
    }));
    records.forEach(record => record.root.addEventListener('focusin', () => {
      record.played = true;
      prepare(record);
    }));
  });

  run(() => {
    if (typeof Element.prototype.animate !== 'function' || !('IntersectionObserver' in window)) return;
    const records = [];
    const isPortrait = element => Boolean(element.closest('button[data-photo]') || element.querySelector('button[data-photo]'));
    document.querySelectorAll('[data-image-reveal]').forEach(root => {
      const image = root.matches('img, svg') ? root : root.querySelector('img, svg, [data-image-content]');
      if (!image || isPortrait(root) || isPortrait(image) || root.closest('[data-key-scene]')) return;
      records.push({ root, played: false, animations: [], parts: [{ element: image, scale: 1.08, duration: 850, delay: 0 }] });
    });
    document.querySelectorAll('[data-key-scene]').forEach(root => {
      const parts = [];
      const image = root.querySelector('.key-visual-image');
      if (image && !isPortrait(image)) parts.push({ element: image, scale: 0.94, duration: 800, delay: 0 });
      [...root.querySelectorAll('[data-key-card]')].slice(0, 3).forEach((element, index) => {
        if (!isPortrait(element)) parts.push({ element, scale: 0.96, duration: 450, delay: index * 100, opacity: true });
      });
      if (parts.length) records.push({ root, parts, played: false, animations: [] });
    });
    if (!records.length) return;
    let observer = null;
    let frame = 0;
    const byRoot = new Map(records.map(record => [record.root, record]));
    function clear(record) {
      record.animations.forEach(animation => animation.cancel());
      record.animations = [];
    }
    function show(record) {
      record.played = true;
      clear(record);
      observer?.unobserve(record.root);
    }
    function play(record) {
      if (!record || record.played) return;
      record.played = true;
      observer?.unobserve(record.root);
      record.animations.forEach(animation => {
        animation.play();
        animation.finished.then(() => animation.cancel()).catch(() => {});
      });
    }
    function prepare(record) {
      clear(record);
      if (!motionEnabled() || record.played) return;
      try {
        record.parts.forEach(part => {
          // IX2 a-12 / a-20: outQuad. Portrait photographs are never scaled.
          const frames = Array.from({ length: 61 }, (_, index) => {
            const time = index / 60;
            const progress = 1 - (1 - time) ** 2;
            const values = { offset: time, transform: `scale(${part.scale + (1 - part.scale) * progress})` };
            if (part.opacity) values.opacity = progress;
            return values;
          });
          const animation = part.element.animate(frames, { duration: part.duration, delay: part.delay, easing: 'linear', fill: 'both' });
          animation.pause();
          animation.currentTime = 0;
          animation.finished.catch(() => {});
          record.animations.push(animation);
        });
        observer.observe(record.root);
      } catch (_) { show(record); }
    }
    function observe() {
      observer?.disconnect();
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) play(byRoot.get(entry.target));
      }), { threshold: 0, rootMargin: `0px 0px -${window.innerHeight * 0.2}px 0px` });
      records.forEach(record => { if (!record.played && motionEnabled()) observer.observe(record.root); });
    }
    observe();
    records.forEach(prepare);
    records.forEach(record => record.root.addEventListener('focusin', () => show(record)));
    document.addEventListener(motionEvent, () => {
      if (!motionEnabled()) records.forEach(show);
      else { observe(); records.forEach(prepare); }
    });
    window.addEventListener('resize', () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(observe);
    }, { passive: true });
    window.addEventListener('beforeprint', () => records.forEach(show));
  });

  run(() => {
    if (typeof Element.prototype.animate !== 'function') return;
    document.querySelectorAll('.text-link, .hero-identity > a, [data-line-link]').forEach(link => {
      let track = link.querySelector('.link-underline-track');
      if (!track) {
        track = document.createElement('span');
        track.className = 'link-underline-track';
        track.setAttribute('aria-hidden', 'true');
        const line = document.createElement('span');
        line.className = 'link-underline';
        track.append(line);
        link.append(track);
      }
      const line = track.querySelector('.link-underline');
      if (!line) return;
      let animation = null;
      let hovered = false;
      let focused = false;
      const frames = (from, to, start = 0, end = 1) => Array.from({ length: 31 }, (_, index) => {
        const time = index / 30;
        return { offset: start + (end - start) * time, transform: `translateX(${from + (to - from) * (1 - (1 - time) ** 2)}%)` };
      });
      function change() {
        animation?.cancel();
        animation = null;
        if (!motionEnabled()) return;
        const active = hovered || focused;
        // IX2 a-13/a-35: leave crosses right, resets left, then returns in 300+300ms.
        animation = line.animate(active ? frames(-101, 0) : [...frames(0, 100, 0, 0.5), ...frames(-101, 0, 0.5, 1)], {
          duration: active ? 300 : 600, easing: 'linear', fill: 'both'
        });
        const current = animation;
        current.finished.then(() => current.cancel()).catch(() => {});
      }
      link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = true; change(); } });
      link.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') { hovered = false; change(); } });
      link.addEventListener('focus', () => { focused = true; change(); });
      link.addEventListener('blur', () => { focused = false; change(); });
      document.addEventListener(motionEvent, () => { if (!motionEnabled()) animation?.cancel(); });
    });
  });

  run(() => {
    if (typeof Element.prototype.animate !== 'function') return;
    document.querySelectorAll('.hero-button, .header-contact, .contact-arrow').forEach(button => {
      const arrow = button.querySelector('svg');
      if (!arrow) return;
      let animation = null;
      function rotate(active) {
        const from = getComputedStyle(arrow).transform;
        animation?.cancel();
        animation = null;
        if (!motionEnabled()) return;
        // IX2 a-9/a-10: z 0 / -45 degrees, 300ms CSS ease.
        animation = arrow.animate([{ transform: from }, { transform: `rotate(${active ? -45 : 0}deg)` }], {
          duration: 300, easing: 'ease', fill: 'forwards'
        });
      }
      button.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') rotate(true); });
      button.addEventListener('pointerleave', () => rotate(false));
      button.addEventListener('focus', () => rotate(true));
      button.addEventListener('blur', () => rotate(false));
      document.addEventListener(motionEvent, () => { if (!motionEnabled()) animation?.cancel(); });
    });
  });

  run(() => {
    const items = [...document.querySelectorAll('details.focus-item')];
    items.filter(item => item.open).slice(1).forEach(item => { item.open = false; });
    items.forEach(item => {
      item.addEventListener('toggle', () => {
        if (item.open) items.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      });
    });
  });

})();


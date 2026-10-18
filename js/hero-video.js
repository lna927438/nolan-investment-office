/* Decorative stock footage, loaded only after an explicit play action.
 * Scott Unfried / Pexels 19666972, Pexels License.
 */
(() => {
  'use strict';
  const video = document.getElementById('hero-video');
  const button = document.getElementById('hero-video-toggle');
  if (!video || !button) return;
  const root = document.documentElement;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia?.('(max-width: 767px)');
  const connection = navigator.connection;
  let wantsPlayback = false;
  let inView = true;
  let failed = false;
  let pending = false;
  const labels = {
    en: { play: 'Play background', pause: 'Pause background', retry: 'Retry background', playDescription: 'Play background video', pauseDescription: 'Pause background video' },
    zh: { play: '播放背景', pause: '暂停背景', retry: '重试播放', playDescription: '播放背景视频', pauseDescription: '暂停背景视频' },
    es: { play: 'Reproducir fondo', pause: 'Pausar fondo', retry: 'Reintentar vídeo', playDescription: 'Reproducir vídeo de fondo', pauseDescription: 'Pausar vídeo de fondo' }
  };
  const source = () => ((mobile?.matches || window.innerWidth <= 767) && video.dataset.videoSrcMobile) || video.dataset.videoSrc || video.dataset.src;
  const policy = () => `${Boolean(reduced?.matches)}:${document.body.classList.contains('motion-off')}:${Boolean(connection?.saveData)}`;
  let previousPolicy = policy();
  function label() {
    const language = root.lang.startsWith('zh') ? 'zh' : root.lang.startsWith('es') ? 'es' : 'en';
    const copy = labels[language];
    button.hidden = !source();
    button.disabled = !source();
    const playing = wantsPlayback && !failed && (pending || !video.paused);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-busy', String(pending));
    button.textContent = failed ? copy.retry : playing ? copy.pause : copy.play;
    button.setAttribute('aria-label', playing ? copy.pauseDescription : copy.playDescription);
    button.setAttribute('title', playing ? copy.pauseDescription : copy.playDescription);
  }
  async function sync() {
    if (!wantsPlayback || !inView || document.hidden || failed) {
      video.pause();
      label();
      return;
    }
    if (!video.getAttribute('src')) {
      const url = source();
      if (!url) { wantsPlayback = false; label(); return; }
      video.muted = true;
      video.src = url;
      video.load();
    }
    if (video.paused && !pending) {
      pending = true;
      label();
      try { await video.play(); }
      catch (error) { if (error.name !== 'AbortError') wantsPlayback = false; }
      finally { pending = false; }
      if (!wantsPlayback || !inView || document.hidden || failed) video.pause();
    }
    label();
  }
  // A new reduced-motion/data-saving preference pauses playback. A subsequent
  // explicit play action may override it, without enabling decorative motion.
  function preferenceChanged() {
    const next = policy();
    if (next !== previousPolicy && (reduced?.matches || document.body.classList.contains('motion-off') || connection?.saveData)) {
      wantsPlayback = false;
      video.classList.remove('is-ready');
    }
    previousPolicy = next;
    sync();
  }
  video.addEventListener('playing', () => { if (wantsPlayback && inView && !document.hidden) video.classList.add('is-ready'); label(); });
  video.addEventListener('pause', label);
  video.addEventListener('error', () => { failed = true; wantsPlayback = false; video.classList.remove('is-ready'); label(); });
  button.addEventListener('click', () => {
    if (failed) { failed = false; video.removeAttribute('src'); }
    wantsPlayback = !wantsPlayback;
    sync();
  });
  reduced?.addEventListener?.('change', preferenceChanged);
  connection?.addEventListener?.('change', preferenceChanged);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('office-language-change', label);
  document.addEventListener('office-motion-change', preferenceChanged);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(video);
  }
  // No source assignment, preload or autoplay occurs before a visitor presses play.
  label();
})();
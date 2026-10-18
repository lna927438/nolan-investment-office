/* Decorative stock footage, muted and looping automatically on the homepage.
 * Scott Unfried / Pexels 19666972, Pexels License.
 */
(() => {
  'use strict';
  const video = document.getElementById('hero-video');
  if (!video) return;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let inView = true;
  let pending = false;
  let failed = false;
  let blocked = false;
  const shouldPlay = () => inView && !document.hidden && !failed &&
    !reduced?.matches && !document.body.classList.contains('motion-off');

  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;

  async function sync(retryAbort = true) {
    if (!shouldPlay()) {
      video.pause();
      return;
    }
    if (!video.getAttribute('src')) {
      if (!video.dataset.src) return;
      video.src = video.dataset.src;
      video.load();
    }
    if (pending || !video.paused) return;
    pending = true;
    let aborted = false;
    try {
      await video.play();
      blocked = false;
    } catch (error) {
      blocked = error.name === 'NotAllowedError';
      aborted = error.name === 'AbortError';
    } finally {
      pending = false;
    }
    if (!shouldPlay()) video.pause();
    // A quick leave-and-return can cancel an earlier play request. Retry once.
    else if (aborted && retryAbort) sync(false);
  }

  video.addEventListener('playing', () => {
    if (shouldPlay()) video.classList.add('is-ready');
    else video.pause();
  });
  video.addEventListener('error', () => {
    failed = true;
    video.classList.remove('is-ready');
  });
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('office-motion-change', sync);
  reduced?.addEventListener?.('change', sync);
  // If the browser blocks autoplay, retry on the visitor's next interaction.
  const retry = () => { if (blocked) sync(); };
  document.addEventListener('pointerdown', retry, { passive: true });
  document.addEventListener('keydown', retry);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(video);
  }
  sync();
})();

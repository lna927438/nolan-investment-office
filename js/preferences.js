/* Language preferences, translated metadata and shareable language URLs. */
(() => {
  'use strict';
  const root = document.documentElement;
  const languageButtons = [...document.querySelectorAll('[data-set-language]')];
  const storageKey = 'cala-vale-language';
  const validLanguage = value => ['en', 'zh', 'es'].includes(value) ? value : null;
  const defaultLanguage = root.lang.toLowerCase().startsWith('zh') ? 'zh' : root.lang.toLowerCase().startsWith('es') ? 'es' : 'en';
  const metadata = {
    en: { title: 'Cala Vale Office — Independent Investing', description: 'A personal investment office in Southern California, with a focus on early-stage businesses and direct conversations.', locale: 'en_US' },
    zh: { title: 'Cala Vale Office — 独立投资办公室', description: '驻南加州的个人投资办公室，围绕早期企业开展研究与直接交流。', locale: 'zh_CN' },
    es: { title: 'Cala Vale Office — Inversión independiente', description: 'Una oficina personal de inversión en el sur de California, centrada en empresas en sus primeras etapas y en el diálogo directo.', locale: 'es_ES' }
  };
  function savedLanguage() {
    try { return validLanguage(window.localStorage.getItem(storageKey)); } catch (_) { return null; }
  }
  function urlLanguage() {
    try { return validLanguage(new URL(window.location.href).searchParams.get('lang')); } catch (_) { return null; }
  }
  function updateMetadata(selected) {
    const copy = metadata[selected];
    document.title = copy.title;
    const values = {
      'meta[name="description"]': copy.description,
      'meta[property="og:title"]': copy.title,
      'meta[property="og:description"]': copy.description,
      'meta[property="og:locale"]': copy.locale,
      'meta[name="twitter:title"]': copy.title,
      'meta[name="twitter:description"]': copy.description
    };
    Object.entries(values).forEach(([selector, value]) => document.querySelector(selector)?.setAttribute('content', value));
  }
  function setLanguage(value, updateUrl = true) {
    const selected = validLanguage(value) || defaultLanguage;
    root.lang = selected === 'zh' ? 'zh-CN' : selected;
    document.querySelectorAll('[data-lang]').forEach(node => { node.hidden = node.dataset.lang !== selected; });
    languageButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.setLanguage === selected)));
    document.querySelectorAll('option[data-en]').forEach(option => {
      option.textContent = option.getAttribute(`data-${selected}`) ?? option.getAttribute('data-en');
    });
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(attribute => {
      document.querySelectorAll(`[data-${attribute}-en]`).forEach(node => {
        node.setAttribute(attribute, node.getAttribute(`data-${attribute}-${selected}`) ?? node.getAttribute(`data-${attribute}-en`));
      });
    });
    updateMetadata(selected);
    try { window.localStorage.setItem(storageKey, selected); } catch (_) { /* Private browsing may disable storage. */ }
    if (updateUrl) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', selected);
        if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url.href);
      } catch (_) { /* The page also remains usable in a local file preview. */ }
    }
    document.dispatchEvent(new CustomEvent('office-language-change', { detail: { language: selected } }));
    window.dispatchEvent(new Event('resize'));
  }
  languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.setLanguage)));
  window.addEventListener('popstate', () => setLanguage(urlLanguage() || savedLanguage() || defaultLanguage, false));
  setLanguage(urlLanguage() || savedLanguage() || defaultLanguage);
})();
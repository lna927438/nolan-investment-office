/* Prepare a local introduction. This script never submits or stores form entries. */
(() => {
  'use strict';
  function initialize() {
    const form = document.getElementById('contact-form');
    const fields = document.getElementById('contact-fields');
    const submit = form?.querySelector('[type="submit"]');
    const status = document.getElementById('form-state');
    const extra = document.getElementById('contact-actions-extra');
    if (!form || !fields || !submit || !status || !extra) return;
    const config = window.OFFICE_CONFIG || {};
    const candidate = String(config.email || '').trim();
    const email = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(candidate) ? candidate : '';
    const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : document.documentElement.lang.startsWith('es') ? 'es' : 'en';
    const translations = {
      en: {
        copy: 'Copy introduction', open: 'Open email app', pending: 'Contact details coming soon',
        idle: 'Contact details will be available soon. You can prepare and copy an introduction here; this page does not send or save your message.',
        ready: 'Open a draft in your email app, then review and send it there. You can also copy the introduction. This page does not send or save it.',
        copied: 'Introduction copied. No message has been sent.',
        copyFailed: 'Automatic copying is unavailable. Select and copy the introduction below. No message has been sent.',
        opened: 'An email draft has been requested. Review and send it in your email app. If nothing opens, copy the introduction and email the address shown.',
        openFailed: 'Your email app could not be opened. Copy the introduction and use the email address shown.',
        introduction: 'Introduction', name: 'Name', email: 'Email', company: 'Company or project', website: 'Website', topic: 'Topic', message: 'Message', draft: 'Introduction to copy'
      },
      zh: {
        copy: '复制介绍', open: '打开邮件应用', pending: '联系方式即将公布',
        idle: '联系方式即将公布。你可以先整理并复制介绍；本页面不会发送或保存这些内容。',
        ready: '在邮件应用中打开草稿，检查后自行发送。也可以复制介绍；本页面不会发送或保存这些内容。',
        copied: '介绍已复制，尚未发送任何信息。',
        copyFailed: '无法自动复制。请选中并复制下方介绍，尚未发送任何信息。',
        opened: '已请求打开邮件草稿，请在邮件应用中检查后自行发送。如未打开，请复制介绍并发送至页面所示邮箱。',
        openFailed: '无法打开邮件应用。请复制介绍，并使用页面所示邮箱联系。',
        introduction: '项目介绍', name: '姓名', email: '邮箱', company: '公司或项目', website: '网站', topic: '联系事项', message: '留言', draft: '可复制的介绍'
      },
      es: {
        copy: 'Copiar presentación', open: 'Abrir correo', pending: 'Datos de contacto próximamente',
        idle: 'Los datos de contacto estarán disponibles pronto. Puedes preparar y copiar una presentación aquí; esta página no envía ni guarda tu mensaje.',
        ready: 'Abre un borrador en tu aplicación de correo, revísalo y envíalo desde allí. También puedes copiar la presentación. Esta página no la envía ni la guarda.',
        copied: 'Presentación copiada. No se ha enviado ningún mensaje.',
        copyFailed: 'La copia automática no está disponible. Selecciona y copia la presentación que aparece debajo. No se ha enviado ningún mensaje.',
        opened: 'Se ha solicitado abrir un borrador de correo. Revísalo y envíalo en tu aplicación. Si no se abre, copia la presentación y utiliza la dirección indicada.',
        openFailed: 'No se ha podido abrir la aplicación de correo. Copia la presentación y utiliza la dirección indicada.',
        introduction: 'Presentación', name: 'Nombre', email: 'Correo electrónico', company: 'Empresa o proyecto', website: 'Sitio web', topic: 'Tema', message: 'Mensaje', draft: 'Presentación para copiar'
      }
    };
    const copy = () => translations[language()];
    let notice = email ? 'ready' : 'idle';
    let busy = false;
    let fallback = null;
    let copyButton = null;
    const address = document.getElementById('contact-email-value');
    if (address && email) {
      const link = document.createElement('a');
      link.href = 'mailto:' + encodeURIComponent(email);
      link.textContent = email;
      address.replaceChildren(link);
    }
    const profileRow = document.getElementById('contact-profile-row');
    const profileValue = document.getElementById('contact-profile-value');
    if (profileRow && profileValue) {
      profileRow.hidden = true;
      try {
        const url = new URL(String(config.professionalUrl || ''));
        if (url.protocol === 'https:' && !url.username && !url.password) {
          const link = document.createElement('a');
          link.href = url.href;
          link.textContent = url.hostname;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          profileValue.removeAttribute('aria-label');
          ['en', 'zh', 'es'].forEach(lang => profileValue.removeAttribute('data-aria-label-' + lang));
          profileValue.classList.remove('empty-value');
          profileValue.replaceChildren(link);
          profileRow.hidden = false;
        }
      } catch (_) { /* Unconfirmed or invalid profile stays hidden. */ }
    }
    function render() {
      const t = copy();
      submit.textContent = email ? t.open : t.copy;
      submit.disabled = busy;
      if (copyButton) { copyButton.textContent = t.copy; copyButton.disabled = busy; }
      if (address && !email) address.textContent = t.pending;
      if (fallback) fallback.setAttribute('aria-label', t.draft);
      status.textContent = t[notice];
    }
    const value = id => document.getElementById(id)?.value.trim() || '';
    function introduction() {
      const t = copy();
      const reason = document.getElementById('contact-reason');
      const entries = [
        [t.name, value('contact-name')], [t.email, value('contact-email')],
        [t.company, value('contact-company')], [t.website, value('contact-website')],
        [t.topic, reason?.value ? reason.selectedOptions[0]?.textContent || reason.value : '']
      ];
      return entries.filter(([, content]) => content).map(([label, content]) => label + ': ' + content).join('\n') + '\n\n' + t.message + ':\n' + value('contact-message');
    }
    function showFallback(text) {
      if (!fallback) {
        fallback = document.createElement('textarea');
        fallback.readOnly = true;
        fallback.rows = 8;
        extra.append(fallback);
      }
      fallback.value = text;
      fallback.setAttribute('aria-label', copy().draft);
      fallback.focus();
      fallback.select();
    }
    async function copyIntroduction() {
      if (busy || !form.reportValidity()) return;
      busy = true;
      render();
      const text = introduction();
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(text);
        notice = 'copied';
        fallback?.remove();
        fallback = null;
      } catch (_) {
        notice = 'copyFailed';
        showFallback(text);
      } finally {
        busy = false;
        render();
      }
    }
    if (email) {
      copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.addEventListener('click', copyIntroduction);
      extra.append(copyButton);
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      if (!email) { copyIntroduction(); return; }
      const subject = 'Cala Vale Office — ' + copy().introduction + (value('contact-company') ? ': ' + value('contact-company') : '');
      try {
        window.location.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(introduction());
        notice = 'opened';
      } catch (_) { notice = 'openFailed'; }
      render();
    });
    document.addEventListener('office-language-change', render);
    fields.disabled = false;
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();


/* Individual profiles: native dialogs with an accessible local fallback. */
(() => {
  'use strict';
  const dialogs = [...document.querySelectorAll('[data-member-dialog]')];
  const triggers = [...document.querySelectorAll('[data-member-open]')];
  if (!dialogs.length || !triggers.length) return;
  let active = null;
  let backdrop = null;
  const notify = () => document.dispatchEvent(new Event('office-menu-change'));
  const restoreAttribute = (element, name, value) => {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  };
  const focusable = dialog => [...dialog.querySelectorAll(
    'a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]'
  )].filter(element => !element.matches(':disabled') && element.tabIndex >= 0 &&
    !element.closest('[hidden], [inert]') && element.getClientRects().length > 0);

  function focusInitial(state) {
    const close = state.dialog.querySelector('[data-member-close]');
    const target = close && !close.disabled && close.getClientRects().length ? close : focusable(state.dialog)[0];
    if (target) target.focus({ preventScroll: true });
    else {
      state.dialog.setAttribute('tabindex', '-1');
      state.dialog.focus({ preventScroll: true });
    }
  }
  function isolateBackground(state) {
    // Walk the ancestor path so a dialog nested in main never inherits inert.
    let current = state.dialog;
    while (current.parentElement && current.parentElement !== document.documentElement) {
      [...current.parentElement.children].forEach(element => {
        if (element === current || element === backdrop || /^(SCRIPT|STYLE|LINK|META)$/.test(element.tagName)) return;
        const saved = {
          inertAttribute: element.getAttribute('inert'),
          inert: 'inert' in element ? element.inert : null,
          hidden: element.getAttribute('aria-hidden')
        };
        state.background.set(element, saved);
        // The preview exporter can restore these attributes in its cloned DOM.
        element.setAttribute('data-member-background-state', JSON.stringify({ inert: saved.inertAttribute, hidden: saved.hidden }));
        if ('inert' in element) element.inert = true;
        else element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
      });
      current = current.parentElement;
    }
  }
  function finish(state, restoreFocus) {
    if (active !== state) return;
    active = null;
    state.dialog.removeAttribute('open');
    state.dialog.removeAttribute('data-member-fallback-open');
    state.attributes.forEach((value, name) => restoreAttribute(state.dialog, name, value));
    state.background.forEach((saved, element) => {
      if (saved.inert !== null) element.inert = saved.inert;
      restoreAttribute(element, 'inert', saved.inertAttribute);
      restoreAttribute(element, 'aria-hidden', saved.hidden);
      element.removeAttribute('data-member-background-state');
    });
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('member-dialog-open');
    notify();
    if (restoreFocus) {
      const destination = [state.trigger, ...triggers].find(element =>
        element?.isConnected && !element.disabled && !element.closest('[inert], [hidden]') && element.getClientRects().length
      );
      destination?.focus({ preventScroll: true });
    }
  }
  function close(restoreFocus = true) {
    const state = active;
    if (!state) return;
    if (state.native && state.dialog.open) {
      try { state.dialog.close(); } catch (_) { state.dialog.removeAttribute('open'); }
    }
    finish(state, restoreFocus);
  }
  function fallback(state) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'member-dialog-backdrop';
      backdrop.setAttribute('data-member-backdrop', '');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('click', event => {
        if (event.target === backdrop && active && !active.native) close();
      });
      document.body.append(backdrop);
    }
    backdrop.hidden = false;
    state.dialog.hidden = false;
    state.dialog.setAttribute('open', '');
    state.dialog.setAttribute('data-member-fallback-open', '');
    state.dialog.setAttribute('role', 'dialog');
    state.dialog.setAttribute('aria-modal', 'true');
    focusInitial(state);
    isolateBackground(state);
  }
  function open(trigger) {
    const id = trigger.getAttribute('aria-controls') || `profile-${trigger.getAttribute('data-member-open')}`;
    const dialog = document.getElementById(id);
    if (!dialogs.includes(dialog)) return;
    if (active?.dialog === dialog) { focusInitial(active); return; }
    if (active) close(false);
    const state = {
      dialog, trigger, native: false, background: new Map(),
      attributes: new Map(['role', 'aria-modal', 'tabindex', 'hidden'].map(name => [name, dialog.getAttribute(name)]))
    };
    active = state;
    document.body.classList.add('member-dialog-open');
    notify();
    if (typeof dialog.showModal === 'function' && typeof dialog.close === 'function') {
      try {
        dialog.hidden = false;
        if (dialog.open) dialog.close();
        dialog.showModal();
        state.native = true;
        focusInitial(state);
        return;
      } catch (_) {
        // The content remains available if the browser cannot enter the top layer.
      }
    }
    fallback(state);
  }

  triggers.forEach(trigger => trigger.addEventListener('click', () => open(trigger)));
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (active?.dialog !== dialog) return;
      const button = event.target.closest?.('[data-member-close]');
      if (button && dialog.contains(button)) { close(); return; }
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
    dialog.addEventListener('cancel', event => {
      if (active?.dialog !== dialog) return;
      event.preventDefault();
      close();
    });
    dialog.addEventListener('close', () => {
      // A queued close event from a previous opening must not close a new one.
      if (active?.dialog === dialog && !dialog.open) finish(active, true);
    });
  });
  document.addEventListener('keydown', event => {
    if (!active || active.native) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const items = focusable(active.dialog);
    if (!items.length) { event.preventDefault(); focusInitial(active); return; }
    const current = document.activeElement;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (current === first || !items.includes(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (current === last || !items.includes(current))) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('focusin', event => {
    if (active && !active.native && !active.dialog.contains(event.target)) focusInitial(active);
  });
})();


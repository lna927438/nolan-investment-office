import { readFile, readdir, stat, realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const indexPath = path.join(root, 'index.html');
const html = await readFile(indexPath, 'utf8');
const failures = [];
const resources = new Set();
const scriptFiles = new Set();
const styleFiles = new Set();
const jsonFiles = new Set();
let scriptsChecked = 0;
let jsonChecked = 0;

const check = (condition, message) => { if (!condition) failures.push(message); };
const display = filename => path.relative(root, filename).split(path.sep).join('/');
const insideRoot = filename => {
  const relative = path.relative(root, filename);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
};
const decodeEntities = value => value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const number = entity[2].toLowerCase() === 'x'
    ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
  return number <= 0x10ffff ? String.fromCodePoint(number) : entity;
});

function attributes(source) {
  const values = new Map();
  for (const match of source.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    values.set(match[1].toLowerCase(), decodeEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return values;
}

// Ignore raw script/style bodies so HTML strings inside JS are not DOM nodes.
const documentMarkup = html.replace(/<!--[\s\S]*?-->/g, '').replace(
  /<(script|style)\b([^>]*)>[\s\S]*?<\/\1\s*>/gi,
  (_, tag, attrs) => '<' + tag + attrs + '></' + tag + '>',
);
const elements = [...documentMarkup.matchAll(/<([a-z][\w:-]*)\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi)]
  .map(match => ({ tag: match[1].toLowerCase(), attrs: attributes(match[2]) }));
const ids = new Map();
for (const element of elements) {
  const id = element.attrs.get('id');
  if (!id) continue;
  check(!ids.has(id), 'Duplicate HTML id: ' + id);
  ids.set(id, element);
}

async function localResource(raw, from, context) {
  const value = decodeEntities(raw).trim();
  if (!value || value.startsWith('#') || value.startsWith('//') || /^[a-z][\w+.-]*:/i.test(value)) return null;
  let pathname;
  try { pathname = decodeURIComponent(value.split(/[?#]/, 1)[0]); }
  catch { failures.push(context + ': malformed URL ' + value); return null; }
  if (!pathname) return null;
  const resolved = pathname.startsWith('/')
    ? path.resolve(root, '.' + pathname) : path.resolve(path.dirname(from), pathname);
  if (!insideRoot(resolved)) {
    failures.push(context + ': resource escapes the website root: ' + value);
    return null;
  }
  try {
    const info = await stat(resolved);
    const target = info.isDirectory() ? path.join(resolved, 'index.html') : resolved;
    check((await stat(target)).isFile(), context + ': resource is not a file: ' + value);
    check(insideRoot(await realpath(target)), context + ': resource link escapes the website root: ' + value);
    resources.add(target);
    return target;
  } catch (error) {
    failures.push(context + ': cannot read local resource ' + value + ' (' + error.code + ')');
    return null;
  }
}

function srcsetURLs(value) {
  // Commas inside data URLs belong to that candidate, not a new image URL.
  const urls = [];
  let cursor = 0;
  while (cursor < value.length) {
    while (cursor < value.length && /[\s,]/.test(value[cursor])) cursor++;
    const start = cursor;
    const data = value.slice(cursor, cursor + 5).toLowerCase() === 'data:';
    while (cursor < value.length && !/\s/.test(value[cursor]) && (data || value[cursor] !== ',')) cursor++;
    const url = value.slice(start, cursor).replace(/,+$/, '');
    if (url) urls.push(url);
    while (cursor < value.length && value[cursor] !== ',') cursor++;
    if (value[cursor] === ',') cursor++;
  }
  return urls;
}

async function inspectCSS(css, filename) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of clean.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi)) {
    const found = await localResource(match[1] ?? match[2] ?? match[3], filename, display(filename) + ' CSS url()');
    if (found?.endsWith('.css')) styleFiles.add(found);
  }
  for (const match of clean.matchAll(/@import\s+(?:"([^"]+)"|'([^']+)')/gi)) {
    const found = await localResource(match[1] ?? match[2], filename, display(filename) + ' CSS @import');
    if (found) styleFiles.add(found);
  }
}

for (const element of elements) {
  const { tag, attrs } = element;
  const label = '<' + tag + (attrs.has('id') ? ' id="' + attrs.get('id') + '"' : '') + '>';
  for (const attribute of ['href', 'src', 'poster']) {
    if (!attrs.has(attribute)) continue;
    const value = attrs.get(attribute);
    if (attribute === 'href' && value.startsWith('#') && value.length > 1) {
      let anchor;
      try { anchor = decodeURIComponent(value.slice(1)); }
      catch { failures.push(label + ': malformed anchor ' + value); continue; }
      check(ids.has(anchor), label + ': missing anchor target ' + value);
    }
    const found = await localResource(value, indexPath, label + ' ' + attribute);
    if (found && tag === 'script' && attribute === 'src') {
      if ((attrs.get('type') || '').includes('json')) jsonFiles.add(found);
      else scriptFiles.add(found);
    }
    if (found && tag === 'link' && (attrs.get('rel') || '').split(/\s+/).includes('stylesheet')) styleFiles.add(found);
  }
  if (attrs.has('srcset')) {
    for (const value of srcsetURLs(attrs.get('srcset'))) await localResource(value, indexPath, label + ' srcset');
  }
  if (attrs.has('style')) await inspectCSS(attrs.get('style'), indexPath);
  for (const attribute of ['aria-controls', 'aria-labelledby', 'aria-describedby']) {
    if (!attrs.has(attribute)) continue;
    for (const id of attrs.get(attribute).trim().split(/\s+/)) {
      check(Boolean(id) && ids.has(id), label + ': ' + attribute + ' points to missing id ' + id);
    }
  }
  if (tag === 'img') {
    check(attrs.has('alt'), label + ': image needs an alt attribute (empty is allowed for decoration)');
    for (const size of ['width', 'height']) {
      check(/^[1-9]\d*$/.test(attrs.get(size) || ''), label + ': image needs a positive intrinsic ' + size);
    }
  }
  if (attrs.has('data-member-open')) {
    const target = ids.get(attrs.get('aria-controls'));
    check(tag === 'button' && attrs.get('type') === 'button', label + ': member opener must be a non-submit button');
    check(attrs.get('aria-haspopup') === 'dialog', label + ': member opener needs aria-haspopup="dialog"');
    check(target?.tag === 'dialog' && target.attrs.has('data-member-dialog'), label + ': member opener must target a member dialog');
  }
  if (attrs.has('data-member-dialog')) {
    check(tag === 'dialog' && attrs.has('id') && attrs.has('aria-labelledby'), label + ': member dialog needs its id and accessible title');
  }
}

for (const match of html.matchAll(/<dialog\b([^>]*)>([\s\S]*?)<\/dialog\s*>/gi)) {
  const attrs = attributes(match[1]);
  if (!attrs.has('data-member-dialog')) continue;
  check(/<button\b[^>]*\bdata-member-close\b/i.test(match[2]), 'Member dialog ' + attrs.get('id') + ' needs a close button');
}

for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) await inspectCSS(match[1], indexPath);
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
  const attrs = attributes(match[1]);
  if (attrs.has('src')) continue;
  const type = (attrs.get('type') || '').toLowerCase();
  try {
    if (type.includes('json')) { JSON.parse(match[2]); jsonChecked++; }
    else if (!type || /(?:java|ecma)script/.test(type)) {
      new vm.Script(match[2], { filename: 'index.html:inline-script-' + (++scriptsChecked) });
    } else if (type === 'module') {
      failures.push('Inline ES modules need a module-aware syntax check; this static site uses classic scripts.');
    }
  } catch (error) { failures.push('Inline script/content: ' + error.message); }
}

async function collect(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return; throw error; }
  for (const entry of entries) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(filename);
    else if (entry.isFile()) {
      if (/\.js$/i.test(entry.name)) scriptFiles.add(filename);
      if (/\.css$/i.test(entry.name)) styleFiles.add(filename);
      if (/\.json$/i.test(entry.name)) jsonFiles.add(filename);
    }
  }
}
for (const directory of ['assets', 'styles', 'js', 'data']) await collect(path.join(root, directory));
for (const filename of styleFiles) await inspectCSS(await readFile(filename, 'utf8'), filename);
for (const filename of scriptFiles) {
  try {
    new vm.Script(await readFile(filename, 'utf8'), { filename: display(filename) });
    scriptsChecked++;
  } catch (error) { failures.push(display(filename) + ': ' + error.message); }
}
for (const filename of jsonFiles) {
  try { JSON.parse(await readFile(filename, 'utf8')); jsonChecked++; }
  catch (error) { failures.push(display(filename) + ': invalid JSON: ' + error.message); }
}

for (const language of ['en', 'zh', 'es']) {
  check(elements.some(({ attrs }) => attrs.get('data-set-language') === language), 'Missing language switch: ' + language);
  check(elements.some(({ attrs }) => attrs.get('data-lang') === language), 'Missing localized content: ' + language);
}
const documentLanguage = elements.find(element => element.tag === 'html')?.attrs.get('lang');
check(['en', 'zh-CN', 'es'].includes(documentLanguage), 'The document must declare a supported language.');

const robots = elements.find(element => element.tag === 'meta' && element.attrs.get('name')?.toLowerCase() === 'robots');
check((robots?.attrs.get('content') || '').toLowerCase().split(/[\s,]+/).includes('noindex'), 'Preview meta robots must retain noindex.');
const robotsText = await readFile(path.join(root, 'robots.txt'), 'utf8');
check(/^\s*User-agent:\s*\*\s*$/im.test(robotsText) && /^\s*Disallow:\s*\/\s*$/im.test(robotsText), 'Preview robots.txt must retain User-agent: * and Disallow: /.');

if (failures.length) {
  console.error('Static verification failed:\n' + [...new Set(failures)].map(message => ' - ' + message).join('\n'));
  process.exitCode = 1;
} else {
  console.log('Verified ' + resources.size + ' local resources, ' + scriptsChecked + ' scripts, ' + jsonChecked + ' JSON documents, ' + ids.size + ' unique IDs, image dimensions, dialog references and en/zh/es content.');
}


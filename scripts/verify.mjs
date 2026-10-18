import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const refs = [...new Set([...html.matchAll(/\.\/assets\/[A-Za-z0-9._/-]+/g)].map(m => m[0]))];
if (refs.length !== 9) throw new Error('Expected all 9 published image/font assets');
for (const ref of refs) {
  const resolved = path.resolve(root, ref);
  if (!resolved.startsWith(root)) throw new Error('Asset path escapes website root');
  if (!(await stat(resolved)).isFile()) throw new Error('Missing asset: ' + ref);
}
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/type=["']application\/json["']/.test(match[1])) JSON.parse(match[2]);
  else { new vm.Script(match[2], { filename: 'inline-' + scripts + '.js' }); scripts++; }
}
for (const member of ['maria', 'alissa']) {
  if (html.split('data-member-photo="' + member + '"').length !== 2) throw new Error('Expected one original photo for ' + member);
}
if (!html.includes('noindex,nofollow')) throw new Error('Preview search indexing policy changed');
console.log('Verified ' + refs.length + ' local assets, ' + scripts + ' scripts, structured content and both member photos.');


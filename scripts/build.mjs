import { mkdir, copyFile, cp, lstat, realpath, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const dist = path.resolve(root, 'dist');
const expectedDist = path.join(root, 'dist');

// Only remove this project's direct dist/ child, never a link or another path.
if (dist !== expectedDist || path.dirname(dist) !== root || path.basename(dist) !== 'dist') {
  throw new Error('Refusing to clean a directory outside this project: ' + dist);
}
try {
  const existing = await lstat(dist);
  if (!existing.isDirectory() || existing.isSymbolicLink() || await realpath(dist) !== expectedDist) {
    throw new Error('Refusing to clean a linked or unexpected dist directory: ' + dist);
  }
  await rm(dist, { recursive: true, force: false });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await mkdir(dist);
for (const name of ['index.html', 'robots.txt', '.nojekyll']) {
  await copyFile(path.join(root, name), path.join(dist, name));
}

const excluded = path.join(root, 'assets', 'image-variants.json');
const copied = [];
for (const name of ['assets', 'styles', 'js', 'data']) {
  const source = path.join(root, name);
  try {
    const info = await lstat(source);
    if (!info.isDirectory() || info.isSymbolicLink()) {
      throw new Error('Expected a normal source directory: ' + source);
    }
  } catch (error) {
    if (name === 'data' && error.code === 'ENOENT') continue;
    throw error;
  }
  await cp(source, path.join(dist, name), {
    recursive: true,
    filter: candidate => path.resolve(candidate) !== excluded,
  });
  copied.push(name);
}

console.log('Built a clean static website in dist/ (' + copied.join(', ') + ').');


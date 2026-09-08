import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(repoRoot, 'public');
const modelRoot = join(publicRoot, 'models');
const errors = [];
let checkedFiles = 0;
let totalBytes = 0;

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const addSize = async (path) => {
  try {
    const info = await stat(path);
    if (info.isFile()) {
      totalBytes += info.size;
      checkedFiles += 1;
    }
  } catch {
    // Missing files are reported by the caller with more context.
  }
};

if (!(await exists(modelRoot))) {
  errors.push('Missing public/models directory.');
} else {
  const dirs = await readdir(modelRoot, { withFileTypes: true });
  for (const dir of dirs.filter((entry) => entry.isDirectory())) {
    const assetDir = join(modelRoot, dir.name);
    const manifestPath = join(assetDir, 'manifest.json');
    if (!(await exists(manifestPath))) {
      errors.push(`${dir.name}: missing manifest.json`);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    } catch (error) {
      errors.push(`${dir.name}: invalid manifest.json (${error.message})`);
      continue;
    }

    if (manifest.license !== 'CC0') errors.push(`${dir.name}: expected CC0 license metadata.`);
    if (!String(manifest.source || '').startsWith('https://polyhaven.com/a/')) {
      errors.push(`${dir.name}: missing or unexpected source URL.`);
    }

    const entryPath = join(assetDir, manifest.entry || '');
    if (!manifest.entry || !(await exists(entryPath))) {
      errors.push(`${dir.name}: manifest entry does not exist (${manifest.entry || 'empty'}).`);
      continue;
    }
    await addSize(entryPath);

    let gltf;
    try {
      gltf = JSON.parse(await readFile(entryPath, 'utf8'));
    } catch (error) {
      errors.push(`${dir.name}: invalid glTF JSON (${error.message})`);
      continue;
    }

    for (const group of ['buffers', 'images']) {
      for (const item of gltf[group] || []) {
        const uri = item?.uri;
        if (!uri || uri.startsWith('data:') || /^https?:/i.test(uri)) continue;
        const decoded = decodeURIComponent(uri.split('?')[0].split('#')[0]);
        const target = normalize(join(assetDir, decoded));
        if (!target.startsWith(assetDir)) {
          errors.push(`${dir.name}: unsafe ${group} URI ${uri}`);
          continue;
        }
        if (!(await exists(target))) errors.push(`${dir.name}: missing ${group} resource ${uri}`);
        else await addSize(target);
      }
    }
  }
}

const hdriManifestPath = join(publicRoot, 'hdri', 'manifest.json');
if (!(await exists(hdriManifestPath))) {
  errors.push('Missing public/hdri/manifest.json');
} else {
  try {
    const hdri = JSON.parse(await readFile(hdriManifestPath, 'utf8'));
    if (hdri.license !== 'CC0') errors.push('HDRI: expected CC0 license metadata.');
    const entry = join(publicRoot, 'hdri', hdri.entry || '');
    if (!hdri.entry || !(await exists(entry))) errors.push(`HDRI: missing entry ${hdri.entry || 'empty'}`);
    else await addSize(entry);
  } catch (error) {
    errors.push(`HDRI: invalid manifest (${error.message})`);
  }
}

const favicon = join(publicRoot, 'favicon.svg');
if (!(await exists(favicon))) errors.push('Missing public/favicon.svg');
else await addSize(favicon);

const mb = totalBytes / 1024 / 1024;
console.log(`Validated ${checkedFiles} referenced 3D/media files (${mb.toFixed(2)} MB referenced payload).`);
if (mb > 16) console.warn('Warning: referenced 3D payload exceeds 16 MB; review model/texture compression.');

if (errors.length) {
  console.error('\nAsset validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('3D asset integrity check passed.');

import assert from 'node:assert/strict';
import { cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const design = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const folders = process.argv.slice(2);
assert.equal(folders.length, 2, 'usage: node scripts/install-phase4-pair.mjs <pc-folder> <sp-folder>');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

for (const folder of folders) {
  assert.match(folder, /^(pc|sp)-spring-[a-z-]+-layers-v\d+$/);
  const source = join(design, folder);
  const destination = join(root, 'src/assets/validation', folder);
  assert.equal(await stat(destination).then(() => true, () => false), false, `${folder}: destination already exists`);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
  assert.equal(manifest.status, 'review-candidate');
  assert.match(verification.status, /mechanical-checks-passed/);
  const available = await readdir(source);
  const images = available.filter(name => name.endsWith('.png') && !/^(preview|compare|inspection|guide)/.test(name));
  const layers = manifest.staticLayersBottomToTop ?? manifest.layersBottomToTop;
  assert.ok(images.length >= layers.filter(name => !name.includes('{')).length);
  const files = [...images, 'manifest.json', manifest.verification, ...(available.includes('README.md') ? ['README.md'] : [])];
  for (const file of files) await readFile(join(source, file));
  await mkdir(destination, { recursive: false });
  for (const file of files) {
    await cp(join(source, file), join(destination, file), { force: false, errorOnExist: true });
    assert.equal(sha(await readFile(join(destination, file))), sha(await readFile(join(source, file))), `${folder}/${file}: copy changed`);
  }
  console.log(`${folder}: copied ${files.length} source files unchanged`);
}

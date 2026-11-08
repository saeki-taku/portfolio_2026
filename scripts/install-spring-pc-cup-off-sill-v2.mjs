import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const folder = 'pc-spring-day-sunny-cup-off-layers-v2';
const source = join('/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals', folder);
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const previous = join(validation, 'pc-spring-day-sunny-cup-off-layers-v1');
const target = join(validation, folder);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const targetExists = await stat(target).then(() => true, () => false);
if (targetExists) {
  for (const name of ['manifest.json', 'cup-off-sill-verification.json'])
    assert.equal(sha(await readFile(join(source, name))), sha(await readFile(join(target, name))),
      `${name}: partial copy differs`);
}
const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
assert.deepEqual([manifest.width, manifest.height], [1345, 1170]);
assert.deepEqual(manifest.registration, { x: 0, y: 0 });
assert.deepEqual(manifest.layersBottomToTop,
  ['01-exterior.png', '02-interior.png', '02a-cup-off-sill-clean.png',
    '03-rin.png', '05-cup-foreground.png', '10-cup-off-sp-refine.png']);
assert.deepEqual(manifest.conditionalLayers['02a-cup-off-sill-clean.png'], { cup: false });
assert.deepEqual(manifest.conditionalLayers['10-cup-off-sp-refine.png'], { rin: true, cup: false });
for (const filename of manifest.layersBottomToTop) {
  const bytes = await readFile(join(source, filename));
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [1345, 1170]);
  assert.equal(bytes[25], 6);
  if (filename !== '02a-cup-off-sill-clean.png')
    assert.equal(sha(bytes), sha(await readFile(join(previous, filename))),
      `${filename}: previous source changed`);
}
const files = ['manifest.json', 'cup-off-sill-verification.json', ...manifest.layersBottomToTop];
await mkdir(target, { recursive: true });
for (const filename of files) {
  await copyFile(join(source, filename), join(target, filename));
  assert.equal(sha(await readFile(join(source, filename))), sha(await readFile(join(target, filename))));
}
console.log(`${folder}: ${manifest.layersBottomToTop.length} aligned layers copied`);

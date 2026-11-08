import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const pairs = [
  ['pc-spring-evening-cloudy-layers-v1', 'pc-spring-evening-cloudy-layers-v2'],
  ['sp-spring-evening-cloudy-tall-layers-v1', 'sp-spring-evening-cloudy-tall-layers-v2'],
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

for (const [oldFolder, newFolder] of pairs) {
  const oldPath = join(root, oldFolder);
  const newPath = join(root, newFolder);
  const [oldManifest, newManifest, verification] = await Promise.all([
    readFile(join(oldPath, 'manifest.json'), 'utf8').then(JSON.parse),
    readFile(join(newPath, 'manifest.json'), 'utf8').then(JSON.parse),
    readFile(join(newPath, 'verification.json'), 'utf8').then(JSON.parse),
  ]);
  assert.equal(verification.status, 'passed');
  assert.equal(newManifest.width, oldManifest.width);
  assert.equal(newManifest.height, oldManifest.height);
  assert.deepEqual(newManifest.layersBottomToTop, oldManifest.layersBottomToTop);
  assert.deepEqual(newManifest.toggleGroups, oldManifest.toggleGroups);
  for (const filename of oldManifest.layersBottomToTop.filter(name => name !== 'rin.png')) {
    const [oldBytes, newBytes] = await Promise.all([
      readFile(join(oldPath, filename)),
      readFile(join(newPath, filename)),
    ]);
    assert.equal(hash(newBytes), hash(oldBytes), `${newFolder}/${filename}`);
  }
  const [oldBytes, newBytes] = await Promise.all([
    readFile(join(oldPath, 'rin.png')),
    readFile(join(newPath, 'rin.png')),
  ]);
  assert.equal(hash(oldBytes), verification.sourceFigureSha256);
  assert.equal(hash(newBytes), verification.outputFigureSha256);
  const [oldPixels, newPixels] = await Promise.all([
    sharp(oldBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(newBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  assert.equal(oldPixels.info.width, newManifest.width);
  assert.equal(oldPixels.info.height, newManifest.height);
  assert.equal(newPixels.info.width, newManifest.width);
  assert.equal(newPixels.info.height, newManifest.height);
  let changedRgb = 0;
  for (let offset = 0; offset < oldPixels.data.length; offset += 4) {
    assert.equal(newPixels.data[offset + 3], oldPixels.data[offset + 3], `${newFolder}: alpha at ${offset / 4}`);
    if (newPixels.data[offset] !== oldPixels.data[offset]
      || newPixels.data[offset + 1] !== oldPixels.data[offset + 1]
      || newPixels.data[offset + 2] !== oldPixels.data[offset + 2]) {
      assert.notEqual(oldPixels.data[offset + 3], 0, `${newFolder}: RGB outside figure at ${offset / 4}`);
      changedRgb++;
    }
  }
  assert.equal(changedRgb, verification.changedPixels);
  assert.equal(hash(await readFile(join(newPath, 'preview-no-rin.png'))),
    hash(await readFile(join(oldPath, 'preview-no-rin.png'))));
  console.log(`${newFolder}: ${changedRgb} figure RGB pixels changed; alpha and other scene layers unchanged`);
}

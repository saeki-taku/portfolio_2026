import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const root = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const pairs = [
  ['pc-summer-day-clear-layers-v1', 'pc-day-layers-v4', 1345, 1170],
  ['sp-summer-day-clear-tall-layers-v1', 'sp-day-tall-layers-v1', 1024, 2400],
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
for (const [folder, sourceFolder, width, height] of pairs) {
  const target = join(root, folder);
  const source = join(root, sourceFolder);
  const [manifest, verification] = await Promise.all([
    readFile(join(target, 'manifest.json'), 'utf8').then(JSON.parse),
    readFile(join(target, 'verification.json'), 'utf8').then(JSON.parse),
  ]);
  assert.equal(manifest.status, 'review-candidate');
  assert.equal(manifest.seasonCase, 'C22 盛夏・昼・快晴');
  assert.equal(manifest.width, width);
  assert.equal(manifest.height, height);
  assert.equal(manifest.registration.x, 0);
  assert.equal(manifest.registration.y, 0);
  assert.equal(verification.status, 'passed');
  assert.ok(manifest.layersBottomToTop.length >= 5);
  assert.ok(manifest.toggleGroups.rin.length > 0);
  assert.ok(manifest.toggleGroups.cup.length > 0);
  for (const filename of manifest.layersBottomToTop) {
    const [oldBytes, newBytes] = await Promise.all([
      readFile(join(source, filename)),
      readFile(join(target, filename)),
    ]);
    const [oldImage, newImage] = await Promise.all([
      sharp(oldBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(newBytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    ]);
    assert.equal(oldImage.info.width, width);
    assert.equal(oldImage.info.height, height);
    assert.equal(newImage.info.width, width);
    assert.equal(newImage.info.height, height);
    let alphaChanged = 0;
    for (let index = 3; index < oldImage.data.length; index += 4) {
      if (oldImage.data[index] !== newImage.data[index]) alphaChanged++;
    }
    assert.equal(alphaChanged, 0, `${folder}/${filename}: alpha changed`);
    assert.equal(verification.outputAlphaDiff[filename], 0);
    if (verification.unchangedHashes?.[filename]) {
      assert.equal(hash(oldBytes), hash(newBytes), `${folder}/${filename}: protected source changed`);
    }
  }
  for (const preview of Object.values(manifest.previews).filter(name => name.startsWith('preview-'))) {
    const image = await sharp(join(target, preview)).metadata();
    assert.equal(image.width, width);
    assert.equal(image.height, height);
    assert.equal(verification.previewHoles[preview], 0);
  }
  console.log(`${folder}: ${manifest.layersBottomToTop.length} registered layers, source alpha and preview geometry passed`);
}

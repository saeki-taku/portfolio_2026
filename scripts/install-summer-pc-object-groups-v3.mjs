import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const periods = ['day', 'dawn', 'evening', 'night-awake', 'night-asleep'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

for (const period of periods) {
  const folder = `pc-summer-${period}-clear-layers-v3`;
  const source = join(proposals, folder);
  const target = join(validation, folder);
  assert.equal(await stat(target).then(() => true, () => false), false,
    `${folder}: target already exists; inspect revisions before replacing it`);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height], [1345, 1170]);
  assert.deepEqual(manifest.registration, { x: 0, y: 0 });
  assert.deepEqual(verification.dimensions, [1345, 1170]);
  assert.deepEqual(manifest.toggleGroups.plant,
    ['03-plant-scene-underpaint.png', '04-indoor-plant.png']);
  assert.deepEqual(manifest.toggleGroups.cup,
    period === 'dawn' || period === 'night-asleep'
      ? ['02a-cup-body-contact.png', '05-cup-foreground.png']
      : ['02a-cup-body-contact.png', '02b-cup-contact-shadow.png', '05-cup-foreground.png']);
  assert.deepEqual(manifest.conditionalLayers,
    period === 'dawn' || period === 'night-asleep' ? {}
      : { '03a-rin-cup-on-restore.png': { rin: true, cup: true } });
  assert.ok(verification.exteriorRepairPixels > 0,
    `${folder}: hidden exterior behind plant was not repaired`);
  assert.equal(verification.sourceCupForegroundSha256, verification.targetCupForegroundSha256);
  for (const comparison of [verification.allOnVsSource, verification.plantOffVsOn]) {
    assert.equal(comparison.changedOutsidePlantArea, 0, `${folder}: outside plant area changed`);
    assert.equal(comparison.transparentPixels, 0, `${folder}: transparent holes`);
  }
  assert.ok(verification.allOnVsSource.maxChannelDifference <= 1,
    `${folder}: all-ON differs from source`);
  assert.equal(Object.keys(verification.combinationChecks).length,
    period === 'dawn' || period === 'night-asleep' ? 4 : 8);
  for (const result of Object.values(verification.combinationChecks)) {
    assert.deepEqual([result.width, result.height, result.transparentPixels], [1345, 1170, 0]);
  }
  for (const results of Object.values(verification.toggleIsolation)) {
    for (const result of results) assert.equal(result.changedOutsidePlantArea, 0);
  }
  const files = ['manifest.json', 'README.md', manifest.verification, manifest.glassMask,
    ...manifest.layersBottomToTop];
  await mkdir(target);
  for (const filename of files) {
    const original = await readFile(join(source, filename));
    await copyFile(join(source, filename), join(target, filename));
    assert.equal(sha(original), sha(await readFile(join(target, filename))),
      `${folder}/${filename}: copy differs`);
  }
  console.log(`${folder}: ${manifest.layersBottomToTop.length} layers copied unchanged`);
}

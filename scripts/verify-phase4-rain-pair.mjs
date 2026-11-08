import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const design = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const period = process.argv[2];
assert.ok(['dawn', 'evening', 'night-awake', 'night-asleep'].includes(period), 'usage: node scripts/verify-phase4-rain-pair.mjs dawn|evening|night-awake|night-asleep');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const alpha = async file => sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer();
const pixels = async file => sharp(file).ensureAlpha().raw().toBuffer();

for (const [prefix, suffix, width, height] of [['pc', '', 1345, 1170], ['sp', '-tall', 1024, 2400]]) {
  const folder = `${prefix}-spring-${period}-rain${suffix}-layers-v1`;
  const cloudy = `${prefix}-spring-${period}-cloudy${suffix}-layers-v1`;
  const source = join(design, folder);
  const reference = join(design, cloudy);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [width, height, 0, 0]);
  assert.equal(manifest.status, 'review-candidate');
  assert.equal(verification.status, 'mechanical-checks-passed; visual-review-required');
  assert.ok(Object.values(verification.effectLeaks).every(value => value === 0));
  assert.ok(Object.values(verification.previewAlphaHoles).every(value => value === 0));
  assert.ok(Object.values(verification.alphaChanges).every(value => value === 0));
  assert.equal(verification.glassMask.glassVsDay, 0);
  assert.equal(sha(await readFile(join(source, manifest.glassMask))), sha(await readFile(join(reference, manifest.glassMask))));
  for (const [filename, hashes] of Object.entries(verification.copiedHashes ?? {}))
    assert.equal(hashes.source, hashes.output, `${folder}/${filename}: protected file changed`);
  for (const filename of manifest.staticLayersBottomToTop) {
    const metadata = await sharp(join(source, filename)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [width, height, true], `${folder}/${filename}: dimensions/alpha`);
  }
  for (const state of Object.values(manifest.effectStates)) {
    for (const filename of Object.values(state)) {
      const metadata = await sharp(join(source, filename)).metadata();
      assert.deepEqual([metadata.width, metadata.height], [width, height], `${folder}/${filename}: dimensions`);
    }
  }
  const variants = [
    ['all', [], 'default', true],
    ['effectOff', [], 'default', false],
    ['withoutRin', manifest.toggleGroups.rin ?? [], 'rin-off', true],
    ['withoutRinEffectOff', manifest.toggleGroups.rin ?? [], 'rin-off', false],
    ['withoutPlant', manifest.toggleGroups.plant ?? [], 'plant-off', true],
    ['withoutCup', manifest.toggleGroups.cup ?? [], 'default', true],
    ['withoutPlantOrRin', [...(manifest.toggleGroups.plant ?? []), ...(manifest.toggleGroups.rin ?? [])], 'plant-off-rin-off', true],
    ['cityLightsOff', ['01a-city-lights.png'], 'default', true],
  ];
  for (const [variant, excluded, stateName, includeEffect] of variants) {
    const preview = manifest.previews[variant];
    if (!preview) continue;
    const effect = manifest.effectStates[stateName];
    assert.ok(effect, `${folder}/${variant}: effect state missing`);
    const files = manifest.staticLayersBottomToTop.filter(filename => !excluded.includes(filename));
    if (includeEffect) files.push(effect.outdoor, effect.droplets);
    const composite = await sharp({ create: { width, height, channels: 4, background: '#00000000' } })
      .composite(files.map(filename => ({ input: join(source, filename) })))
      .ensureAlpha().raw().toBuffer();
    assert.equal(sha(composite), sha(await pixels(join(source, preview))), `${folder}/${preview}: composite differs`);
  }
  for (const filename of Object.keys(verification.alphaChanges))
    assert.equal(sha(await alpha(join(source, filename))), sha(await alpha(join(reference, filename))), `${folder}/${filename}: cloudy registration`);
  console.log(`${folder}: dimensions, alpha, masks, leaks and variant previews passed`);
}

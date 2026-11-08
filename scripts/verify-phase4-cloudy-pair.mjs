import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const design = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const sources = {
  evening: [
    ['pc-spring-evening-cloudy-layers-v1', 'pc-spring-evening-pose-layers-v2', 1345, 1170],
    ['sp-spring-evening-cloudy-tall-layers-v1', 'sp-evening-tall-layers-v1', 1024, 2400],
  ],
  'night-awake': [
    ['pc-spring-night-awake-cloudy-layers-v1', 'pc-spring-night-awake-pose-layers-v2', 1345, 1170],
    ['sp-spring-night-awake-cloudy-tall-layers-v1', 'sp-night-awake-tall-layers-v1', 1024, 2400],
  ],
  'night-asleep': [
    ['pc-spring-night-asleep-cloudy-layers-v1', 'pc-spring-night-asleep-layers-v1', 1345, 1170],
    ['sp-spring-night-asleep-cloudy-tall-layers-v1', 'sp-night-asleep-tall-layers-v1', 1024, 2400],
  ],
};
const selected = process.argv[2];
assert.ok(selected in sources, 'usage: node scripts/verify-phase4-cloudy-pair.mjs evening|night-awake|night-asleep');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const alpha = async path => sharp(path).ensureAlpha().extractChannel('alpha').raw().toBuffer();
const pixels = async path => sharp(path).ensureAlpha().raw().toBuffer();

for (const [folder, baseFolder, width, height] of sources[selected]) {
  const source = join(design, folder);
  const base = join(root, 'src/assets/validation', baseFolder);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [width, height, 0, 0]);
  assert.equal(manifest.status, 'review-candidate');
  assert.equal(verification.status, 'mechanical-checks-passed; visual-review-required');
  assert.ok(Object.values(verification.previewAlphaHoles).every(value => value === 0));
  for (const filename of manifest.layersBottomToTop) {
    const file = join(source, filename);
    const metadata = await sharp(file).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [width, height, true], `${folder}/${filename}: dimensions/alpha`);
    assert.equal(sha(await alpha(file)), sha(await alpha(join(base, filename))), `${folder}/${filename}: base registration`);
  }
  const referenceMask = width === 1345
    ? join(root, 'src/assets/validation/pc-spring-day-cloudy-layers-v1/glass-mask-v2.png')
    : join(root, 'src/assets/validation/sp-day-cloudy-tall-layers-v1/glass-mask.png');
  assert.equal(sha(await readFile(join(source, manifest.glassMask))), sha(await readFile(referenceMask)), `${folder}: glass mask`);
  for (const [filename, result] of Object.entries(verification.protectedLayerHashes ?? {}))
    assert.equal(result.source, result.output, `${folder}/${filename}: protected layer changed`);
  const variants = [
    ['all', []], ['withoutRin', manifest.toggleGroups.rin ?? []],
    ['withoutCup', manifest.toggleGroups.cup ?? []],
    ['withoutPlantCup', [...(manifest.toggleGroups.plant ?? []), ...(manifest.toggleGroups.cup ?? [])]],
  ];
  for (const [variant, excluded] of variants) {
    const preview = manifest.previews[variant];
    if (!preview) continue;
    const composite = await sharp({ create: { width, height, channels: 4, background: '#00000000' } })
      .composite(manifest.layersBottomToTop.filter(filename => !excluded.includes(filename)).map(filename => ({ input: join(source, filename) })))
      .ensureAlpha().raw().toBuffer();
    assert.equal(sha(composite), sha(await pixels(join(source, preview))), `${folder}/${preview}: composite differs`);
  }
  console.log(`${folder}: dimensions, base alpha, glass, protected layers and previews passed`);
}

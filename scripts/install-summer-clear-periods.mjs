import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const refresh = process.argv.includes('--refresh');
const periods = process.argv.slice(2).filter(argument => argument !== '--refresh');
assert.ok(periods.length && periods.every(period =>
  ['dawn', 'evening', 'night-awake', 'night-asleep'].includes(period)), 'name one or more supported periods');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

for (const period of periods) {
  for (const viewport of ['pc', 'sp']) {
    const folder = `${viewport}-summer-${period}-clear${viewport === 'sp' ? '-tall' : ''}-layers-v1`;
    const source = join(proposals, folder);
    const target = join(validation, folder);
    const exists = await stat(target).then(() => true, () => false);
    assert.ok(!exists || refresh,
      `${folder}: target exists; inspect source changes before replacing it, then use --refresh`);
    const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
    const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
    const expected = viewport === 'pc' ? [1345, 1170] : [1024, 2400];
    assert.deepEqual([manifest.width, manifest.height], expected);
    assert.deepEqual(verification.dimensions, expected);
    assert.deepEqual(manifest.registration, { x: 0, y: 0 });
    assert.ok(Object.values(verification.alphaDifferences).every(value => value === 0));
    assert.ok(Object.values(verification.previews).every(value =>
      value.recompositionExact === true && value.transparentHoles === 0));
    assert.deepEqual(Object.keys(verification.layerMetadata).sort(), [...manifest.layersBottomToTop].sort());
    const files = ['manifest.json', 'README.md', manifest.verification, manifest.glassMask,
      ...manifest.layersBottomToTop];
    await mkdir(target, { recursive: true });
    for (const filename of files) {
      const original = await readFile(join(source, filename));
      await copyFile(join(source, filename), join(target, filename));
      assert.equal(sha(original), sha(await readFile(join(target, filename))),
        `${folder}/${filename}: copy differs`);
    }
    console.log(`${folder}: ${manifest.layersBottomToTop.length} verified layers copied unchanged`);
  }
}

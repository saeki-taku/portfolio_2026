import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const periods = ['day', 'dawn', 'evening', 'night-awake', 'night-asleep'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const present = period => !['dawn', 'night-asleep'].includes(period);

for (const period of periods) {
  for (const [folder, previous, dimensions] of [
    [`pc-summer-${period}-clear-layers-v4`, `pc-summer-${period}-clear-layers-v3`, [1345, 1170]],
    [`sp-summer-${period}-clear-tall-layers-v2`, `sp-summer-${period}-clear-tall-layers-v1`, [1024, 2400]],
  ]) {
    const source = join(proposals, folder);
    const old = join(proposals, previous);
    const target = join(validation, folder);
    assert.equal(await stat(target).then(() => true, () => false), false,
      `${folder}: already installed; inspect before replacing`);
    const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
    assert.deepEqual([manifest.width, manifest.height], dimensions);
    assert.deepEqual(manifest.registration, { x: 0, y: 0 });
    const repaint = '10-cup-off-repaint.png';
    assert.equal(manifest.layersBottomToTop.includes(repaint), present(period));
    assert.deepEqual(manifest.conditionalLayers?.[repaint],
      present(period) ? { rin: true, cup: false } : undefined);
    assert.equal(manifest.toggleGroups.cup.includes(repaint), false);
    const files = ['manifest.json', 'README.md', manifest.verification, manifest.glassMask,
      ...manifest.layersBottomToTop];
    for (const filename of manifest.layersBottomToTop) {
      const bytes = await readFile(join(source, filename));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], dimensions,
        `${folder}/${filename}: dimensions`);
      assert.equal(bytes[25], 6, `${folder}/${filename}: expected RGBA PNG`);
      if (filename !== repaint) {
        assert.equal(sha(bytes), sha(await readFile(join(old, filename))),
          `${folder}/${filename}: existing layer was changed`);
      }
    }
    await mkdir(target);
    for (const filename of files) {
      const original = await readFile(join(source, filename));
      await copyFile(join(source, filename), join(target, filename));
      assert.equal(sha(original), sha(await readFile(join(target, filename))),
        `${folder}/${filename}: copy differs`);
    }
    console.log(`${folder}: ${manifest.layersBottomToTop.length} layers copied unchanged`);
  }
}

import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const exists = path => stat(path).then(() => true, () => false);
const scenes = [
  ['pc-spring-day-sunny-cup-off-layers-v1', 'pc-day-redraw-v1', '10-cup-off-sp-refine.png'],
  ...['dawn', 'day', 'evening', 'night-awake', 'night-asleep'].map(period =>
    [`pc-summer-${period}-clear-layers-v5`, `pc-summer-${period}-clear-layers-v4`,
      ['dawn', 'night-asleep'].includes(period) ? null : '11-cup-off-sp-refine.png']),
];

for (const [folder, previous, repair] of scenes) {
  const source = join(proposals, folder);
  const target = join(validation, folder);
  assert.equal(await exists(target), false, `${folder}: already installed`);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height], [1345, 1170]);
  assert.deepEqual(manifest.registration, { x: 0, y: 0 });
  if (repair) {
    assert.equal(manifest.layersBottomToTop.at(-1), repair);
    assert.deepEqual(manifest.conditionalLayers[repair], { rin: true, cup: false });
    assert.ok(!Object.values(manifest.toggleGroups).some(group => group.includes(repair)));
  } else {
    assert.equal(manifest.layersBottomToTop.includes('11-cup-off-sp-refine.png'), false);
  }
  const extras = folder.startsWith('pc-spring-')
    ? ['cup-off-sp-reference-verification.json']
    : ['README.md', 'verification.json', 'glass-mask.png',
      'cup-off-cleanup-verification.json', 'cup-off-sp-reference-verification.json'];
  const files = ['manifest.json', ...extras, ...manifest.layersBottomToTop];
  for (const filename of files) assert.equal(await exists(join(source, filename)), true,
    `${folder}/${filename}: source missing`);
  for (const filename of manifest.layersBottomToTop) {
    const bytes = await readFile(join(source, filename));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [1345, 1170],
      `${folder}/${filename}: dimensions`);
    assert.equal(bytes[25], 6, `${folder}/${filename}: expected RGBA PNG`);
    if (filename !== repair && (folder.startsWith('pc-summer-') || filename !== '03-rin.png')) {
      assert.equal(sha(bytes), sha(await readFile(join(validation, previous, filename))),
        `${folder}/${filename}: previous layer changed`);
    }
  }
  await mkdir(target);
  for (const filename of files) {
    await copyFile(join(source, filename), join(target, filename));
    assert.equal(sha(await readFile(join(source, filename))), sha(await readFile(join(target, filename))));
  }
  console.log(`${folder}: ${manifest.layersBottomToTop.length} layers copied`);
}

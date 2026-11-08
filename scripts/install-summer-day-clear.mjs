import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
for (const folder of ['pc-summer-day-clear-layers-v1', 'sp-summer-day-clear-tall-layers-v1']) {
  const source = join(proposals, folder);
  const target = join(validation, folder);
  assert.equal(await stat(target).then(() => true, () => false), false, `${folder}: destination exists`);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  const verification = JSON.parse(await readFile(join(source, manifest.verification), 'utf8'));
  assert.equal(verification.status, 'passed');
  const files = ['manifest.json', 'README.md', manifest.verification, manifest.glassMask, ...manifest.layersBottomToTop];
  await mkdir(target);
  for (const filename of files) {
    await copyFile(join(source, filename), join(target, filename));
    assert.equal(sha(await readFile(join(source, filename))), sha(await readFile(join(target, filename))));
  }
  console.log(`${folder}: copied ${files.length} files unchanged`);
}

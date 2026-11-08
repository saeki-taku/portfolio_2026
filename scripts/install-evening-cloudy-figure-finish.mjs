import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const proposals = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const validation = fileURLToPath(new URL('../src/assets/validation/', import.meta.url));
for (const folder of ['pc-spring-evening-cloudy-layers-v2', 'sp-spring-evening-cloudy-tall-layers-v2']) {
  const source = join(proposals, folder);
  const target = join(validation, folder);
  const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
  await mkdir(target, { recursive: true });
  for (const filename of ['manifest.json', ...manifest.layersBottomToTop]) {
    await copyFile(join(source, filename), join(target, filename));
  }
  console.log(`Installed ${folder}: ${manifest.layersBottomToTop.length} layers and manifest`);
}

import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const reviews = [
  {
    source: new URL('../src/assets/validation/pc-day-layers-v2/', import.meta.url),
    stage: new URL('../public/__ennui-review-v2/', import.meta.url),
    files: ['01-exterior.png', '02-interior.png', '04-contact-shadow.png', '03-rin.png', '05-cup-foreground.png', '06-person-edge-restore.png'],
  },
  {
    source: new URL('../src/assets/validation/pc-day-redraw-v1/', import.meta.url),
    stage: new URL('../public/__ennui-review-redraw/', import.meta.url),
    files: ['01-exterior.png', '02-interior.png', '05-cup-foreground.png', 'rin-redraw-transparent-v1.png'],
  },
];
const root = fileURLToPath(new URL('../', import.meta.url));
for (const review of reviews) {
  const existing = await readdir(review.stage).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  if (existing.length) throw new Error('Review staging directory already contains files; refusing to replace them.');
}
for (const review of reviews) {
  await mkdir(review.stage, { recursive: true });
}
try {
  for (const review of reviews) {
    await Promise.all(review.files.map(file => cp(new URL(file, review.source), new URL(file, review.stage))));
  }
  execFileSync(fileURLToPath(new URL('../node_modules/.bin/astro', import.meta.url)), ['build'], {
    cwd: root,
    env: { ...process.env, ENNUI_SCENE_DEV: '1' },
    stdio: 'inherit',
  });
} finally {
  for (const review of reviews) await rm(review.stage, { recursive: true, force: true });
}

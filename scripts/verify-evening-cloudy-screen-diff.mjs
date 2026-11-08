import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../artifacts/', import.meta.url));
for (const [viewport, bounds] of [
  ['pc', [1000, 350, 1400, 710]],
  ['sp', [190, 465, 390, 650]],
]) {
  const oldPath = `${root}spring-phase5-lighting/evening-cloudy-${viewport}-current.png`;
  const newPath = `${root}spring-final/spring-evening-cloudy-${viewport}.png`;
  const [oldImage, newImage] = await Promise.all([
    sharp(oldPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(newPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  assert.equal(oldImage.info.width, newImage.info.width);
  assert.equal(oldImage.info.height, newImage.info.height);
  let changed = 0;
  let outside = 0;
  let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
  const { width, height } = oldImage.info;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const index = (y * width + x) * 4;
    if (oldImage.data[index] === newImage.data[index]
      && oldImage.data[index + 1] === newImage.data[index + 1]
      && oldImage.data[index + 2] === newImage.data[index + 2]) continue;
    changed++;
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    if (x < bounds[0] || y < bounds[1] || x > bounds[2] || y > bounds[3]) outside++;
  }
  assert.ok(changed > 0, `${viewport}: figure did not change`);
  assert.equal(outside, 0, `${viewport}: changed pixels outside figure region`);
  console.log(`${viewport}: ${changed} changed screenshot pixels within [${minX},${minY}]–[${maxX},${maxY}]; outside figure: 0`);
}

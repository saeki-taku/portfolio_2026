import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4500';
const assets = new URL('../src/assets/validation/pc-day-layers-v1/', import.meta.url);
const output = new URL('../artifacts/pc-day-layers/', import.meta.url);
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile(new URL('manifest.json', assets), 'utf8'));
const input = async name => readFile(name === 'original.png' ? new URL('../src/assets/scenes/rin-desktop-corner-soft-v4.png', import.meta.url) : new URL(name, assets));
const hash = data => createHash('sha256').update(data).digest('hex');
const original = await input('original.png');
assert.equal(hash(original), manifest.sourceSha256);
assert.equal(hash(original), hash(await readFile(new URL('../src/assets/scenes/rin-desktop-corner-soft-v4.png', import.meta.url))));
const report = { sourceSha256: hash(original), assets: [], checks: [] };
for (const name of ['original.png', ...manifest.order]) {
  const buffer = await input(name);
  const metadata = await sharp(buffer).metadata();
  assert.equal(metadata.width, 1345);
  assert.equal(metadata.height, 1170);
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = 0, partial = 0;
  for (let i = 3; i < data.length; i += info.channels) {
    if (data[i] === 0) transparent++;
    else if (data[i] < 255) partial++;
  }
  if (name !== 'original.png') assert.ok(metadata.hasAlpha && transparent > 0, `${name}: alpha required`);
  report.assets.push({ name, sha256: hash(buffer), width: metadata.width, height: metadata.height, transparent, partial });
}
const raw = async buffer => sharp(buffer).removeAlpha().raw().toBuffer();
const compare = async (a, b) => {
  const [left, right] = await Promise.all([raw(a), raw(b)]);
  assert.equal(left.length, right.length);
  let changedPixels = 0, maximum = 0, total = 0;
  for (let i = 0; i < left.length; i += 3) {
    let changed = false;
    for (let c = 0; c < 3; c++) {
      const d = Math.abs(left[i + c] - right[i + c]);
      total += d; maximum = Math.max(maximum, d); changed ||= d > 0;
    }
    if (changed) changedPixels++;
  }
  return { changedPixels, maximum, meanAbsoluteChannelDifference: total / left.length };
};
const referenceComposite = async names => sharp({ create: { width: 1345, height: 1170, channels: 4, background: '#ffffff' } })
  .composite(await Promise.all(names.map(async name => ({ input: await input(name), left: 0, top: 0 }))))
  .png().toBuffer();
const expectedComposite = await referenceComposite(manifest.order);
report.sourceDifference = await compare(original, expectedComposite);
// Frame bands immediately outside the transparent glass openings in README.
const exteriorAlpha = await sharp(await input('01-exterior.png')).ensureAlpha().raw().toBuffer();
const interiorAlpha = await sharp(await input('02-interior.png')).ensureAlpha().raw().toBuffer();
report.frameExteriorLeak = {};
for (const [name, x0, y0, x1, y1] of [
  ['top', 270, 178, 1301, 186], ['left', 270, 187, 280, 717],
  ['right', 1289, 187, 1301, 717], ['bottom', 270, 718, 1301, 733],
  ['center', 795, 187, 815, 717],
]) {
  let exposed = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const offset = (y * 1345 + x) * 4 + 3;
    if (exteriorAlpha[offset] > 0 && interiorAlpha[offset] < 255) exposed++;
  }
  report.frameExteriorLeak[name] = exposed;
  assert.equal(exposed, 0, `${name}: exterior exposed over protected frame`);
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(`${base}/dev/pc-day-layers/`);
  assert.equal(response.status(), 200);
  await page.locator('.painting img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  // Served files must remain the exact PNG bytes; no image optimization.
  for (const img of await page.locator('.painting img').all()) {
    const src = await img.getAttribute('src');
    const response = await page.request.get(new URL(src, base).href);
    assert.equal(response.status(), 200);
    const servedHash = hash(await response.body());
    assert.ok(report.assets.some(asset => asset.sha256 === servedHash));
  }
  const person = page.locator('#person');
  const toggles = page.locator('[data-toggle]');
  const painting = page.locator('.painting');
  const capture = async name => {
    const box = await painting.boundingBox();
    const scroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    // DOM layout can put the whole painting at a half CSS pixel. Capture the
    // browser's rounded pixel origin, without including an extra boundary row.
    return page.screenshot({ path: fileURLToPath(new URL(name, output)), clip: {
      x: Math.round(box.x + scroll.x), y: Math.round(box.y + scroll.y),
      width: 1345, height: 1170,
    } });
  };
  const layer = name => page.locator(`[data-layer="${name}"]`);
  const toggle = name => page.locator(`[data-toggle="${name}"]`);
  await page.locator('#size').selectOption('native');
  await page.locator('#background').selectOption('white');
  const assertGeometry = async () => {
    const boxes = await page.locator('.painting img:not([hidden])').evaluateAll(images => images.map(img => {
      const r = img.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }));
    assert.ok(boxes.length > 0);
    for (const box of boxes) {
      assert.deepEqual(box, boxes[0]);
      assert.equal(box.width, 1345); assert.equal(box.height, 1170);
    }
  };
  await assertGeometry();
  const compositeShot = await capture('composite.png');
  report.browserCompositeDifference = await compare(expectedComposite, compositeShot);
  assert.ok(report.browserCompositeDifference.maximum <= 2, 'Browser composition differs from PNG source-over reference');
  await page.getByRole('radio', { name: '採用原本', exact: true }).check();
  assert.equal(await person.isDisabled(), true);
  assert.equal(await page.locator('#layers').evaluate(el => el.disabled), true);
  const originalShot = await capture('original.png');
  assert.deepEqual(await compare(original, originalShot), { changedPixels: 0, maximum: 0, meanAbsoluteChannelDifference: 0 });
  await page.getByRole('radio', { name: 'レイヤー合成', exact: true }).check();
  await person.uncheck();
  for (const name of ['rin', 'shadow']) assert.equal(await layer(name).isVisible(), false);
  for (const name of ['exterior', 'interior', 'cup']) assert.equal(await layer(name).isVisible(), true);
  const noPersonShot = await capture('no-person.png');
  const expectedNoPerson = await referenceComposite(manifest.order.filter(name => !manifest.hidePerson.includes(name)));
  report.browserNoPersonDifference = await compare(expectedNoPerson, noPersonShot);
  assert.ok(report.browserNoPersonDifference.maximum <= 2);
  // All individual controls, mixed person state, and group restoration.
  await person.check();
  await toggle('rin').uncheck();
  assert.equal(await person.evaluate(input => input.indeterminate), true);
  await person.check();
  assert.equal(await toggle('rin').isChecked(), true);
  for (const name of ['exterior', 'interior', 'shadow', 'rin', 'cup']) {
    await toggle(name).uncheck(); assert.equal(await layer(name).isVisible(), false);
    await toggle(name).check(); assert.equal(await layer(name).isVisible(), true);
  }
  for (const t of await toggles.all()) await t.uncheck();
  for (const [value, color] of [['white', 'rgb(255, 255, 255)'], ['gray', 'rgb(128, 128, 128)'], ['black', 'rgb(0, 0, 0)']]) {
    await page.locator('#background').selectOption(value);
    assert.equal(await painting.evaluate(el => getComputedStyle(el).backgroundColor), color);
  }
  await page.locator('#background').selectOption('checker');
  assert.match(await painting.evaluate(el => getComputedStyle(el).backgroundImage), /conic-gradient/);
  for (const name of ['interior', 'rin']) {
    await toggle(name).check();
    await capture(`transparency-${name}.png`);
    await toggle(name).uncheck();
  }
  await page.getByRole('button', { name: '初期表示に戻す' }).click();
  assert.equal(await person.isChecked(), true);
  assert.equal(await person.evaluate(input => input.indeterminate), false);
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    const box = await painting.boundingBox();
    assert.ok(Math.abs(box.width / box.height - 1345 / 1170) < .001);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#size').selectOption('native');
    await assertGeometry();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#size').selectOption('fit');
  }
  await page.setViewportSize({ width: 1440, height: 1700 });
  await page.goto(`${base}/dev/pc-day-layers/`);
  await page.locator('.painting img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  await page.screenshot({ path: fileURLToPath(new URL('page.png', output)), fullPage: true });
  assert.deepEqual(errors, []);
  report.checks = ['Exact source hash and unmodified served PNG bytes', 'Shared 1345x1170 geometry and DOM layer order', 'Browser composite matches source-over reference within 2/255', 'Original screenshot pixel-exact at CSS native size', 'Person toggles rin + shadow, retaining interior + exterior + cup', 'Individual toggles, mixed person checkbox, reset', 'Four transparency backgrounds', 'Fit aspect ratio and native scroller at desktop/tablet/mobile widths', 'No browser runtime errors'];
  assert.deepEqual(await page.locator('[data-layer]').evaluateAll(images => images.map(img => img.dataset.layer)), ['exterior', 'interior', 'shadow', 'rin', 'cup']);
} finally { await browser.close(); }
await writeFile(new URL('verification.json', output), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

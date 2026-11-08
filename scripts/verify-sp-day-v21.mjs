import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4399';
const assetDir = fileURLToPath(new URL('../src/assets/validation/sp-day-layers-v21/', import.meta.url));
const manifest = JSON.parse(await readFile(`${assetDir}manifest.json`, 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(manifest.width, 1024);
assert.equal(manifest.height, 1997);
assert.equal(manifest.layersBottomToTop.length, 9);
for (const file of manifest.layersBottomToTop) {
  const local = `${assetDir}${file}`;
  const source = `${manifest.root}/${file}`;
  assert.equal(digest(await readFile(local)), digest(await readFile(source)), `${file}: copied asset changed`);
  const meta = await sharp(local).metadata();
  assert.equal(meta.width, 1024);
  assert.equal(meta.height, 1997);
  assert.equal(meta.channels, 4);
}
assert.equal(
  digest(await readFile(`${assetDir}08-rin-notebook.png`)),
  digest(await readFile(manifest.referenceRin)),
  'approved v21 figure changed',
);

for (const [label, excluded, reference] of [
  ['composite', [], `${manifest.root}/${manifest.previews.all}`],
  ['person off', manifest.toggleGroups.rin, `${manifest.root}/${manifest.previews.withoutRin}`],
]) {
  const files = manifest.layersBottomToTop.filter(file => !excluded.includes(file));
  const actual = await sharp({ create: { width: 1024, height: 1997, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(files.map(file => ({ input: `${assetDir}${file}` }))).ensureAlpha().raw().toBuffer();
  const expected = await sharp(reference).ensureAlpha().raw().toBuffer();
  let maxDifference = 0;
  for (let i = 0; i < actual.length; i++) maxDifference = Math.max(maxDifference, Math.abs(actual[i] - expected[i]));
  assert.ok(maxDifference <= 1, `${label}: max channel difference ${maxDifference}`);
  console.log(`${label}: native layer recomposition matches reference within 1 channel value`);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const screenshots = 'artifacts/sp-day-v21';
await mkdir(screenshots, { recursive: true });
try {
  for (const [name, width, height] of [
    ['small', 320, 568], ['iphone-se', 375, 667], ['standard', 390, 844],
    ['tall', 430, 932], ['tablet', 768, 1024], ['square', 800, 800],
  ]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.clock.install({ time: new Date('2026-10-11T03:00:00Z') });
    await page.goto(base);
    const images = await page.locator('.mobile-artwork img[data-scene="spring-day-sunny"]').all();
    assert.equal(images.length, 9);
    await Promise.all(images.map(image => image.evaluate(img => img.decode())));
    const state = await page.evaluate(() => {
      const art = document.querySelector('.mobile-artwork');
      const bounds = el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; };
      return {
        layers: [...art.querySelectorAll('img[data-scene="spring-day-sunny"]')].map(img => ({ file: img.dataset.layer, group: img.dataset.spGroup, hidden: img.hidden, bounds: bounds(img) })),
        art: bounds(art), visible: getComputedStyle(art).display !== 'none',
        pcVisible: getComputedStyle(document.querySelector('.pc-artwork')).display !== 'none',
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    assert(state.visible && !state.pcVisible);
    assert.deepEqual(state.layers.map(layer => layer.file), manifest.layersBottomToTop);
    assert(state.layers.every(layer => !layer.hidden && JSON.stringify(layer.bounds) === JSON.stringify(state.art)));
    assert.ok(state.scrollWidth <= width, `${name}: horizontal overflow`);
    await page.screenshot({ path: `${screenshots}/${name}-person.png` });
    await page.locator('.scene-settings summary').click({ force: true });
    await page.locator('[data-sp-toggle="rin"]').uncheck();
    const hidden = await page.locator('.mobile-artwork img[data-scene="spring-day-sunny"][hidden]').evaluateAll(elements => elements.map(img => img.dataset.layer));
    assert.deepEqual(hidden, manifest.toggleGroups.rin);
    await page.locator('.scene-settings summary').click({ force: true });
    await page.screenshot({ path: `${screenshots}/${name}-no-person.png` });
    if (name === 'standard') {
      await page.locator('.scene-settings summary').click({ force: true });
      await page.locator('[data-sp-toggle="cup"]').uncheck();
      await page.locator('[data-sp-toggle="plant"]').uncheck();
      const allHidden = await page.locator('.mobile-artwork img[data-scene="spring-day-sunny"][hidden]').evaluateAll(elements => elements.map(img => img.dataset.layer));
      assert.deepEqual(allHidden, manifest.layersBottomToTop.slice(2));
    }
    console.log(`${name}: aligned 9 layers, responsive frame, person toggle`);
    await page.close();
  }

  for (const [name, width, height] of [['desktop', 1440, 900], ['landscape-boundary', 801, 800]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.clock.install({ time: new Date('2026-10-11T03:00:00Z') });
    await page.goto(base);
    assert.equal(await page.locator('.mobile-artwork').evaluate(el => getComputedStyle(el).display), 'none');
    assert.notEqual(await page.locator('.pc-artwork').evaluate(el => getComputedStyle(el).display), 'none');
    await page.screenshot({ path: `${screenshots}/${name}.png` });
    console.log(`${name}: PC composition retained`);
    await page.close();
  }
} finally { await browser.close(); }

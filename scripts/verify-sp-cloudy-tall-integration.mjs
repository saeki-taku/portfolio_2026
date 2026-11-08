import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-day-cloudy-tall-layers-v1';
const installed = join(root, 'src/assets/validation/sp-day-cloudy-tall-layers-v1');
const day = join(root, 'src/assets/validation/sp-day-tall-layers-v1');
const output = join(root, 'artifacts/sp-day-cloudy-tall-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
const sha = data => createHash('sha256').update(data).digest('hex');
await mkdir(output, { recursive: true });
assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [1024, 2400, 0, 0]);
assert.equal(manifest.layersBottomToTop.length, 10);
for (const file of manifest.layersBottomToTop) {
  const [copy, original] = await Promise.all([readFile(join(installed, file)), readFile(join(source, file))]);
  assert.equal(sha(copy), sha(original), `${file}: installed PNG changed`);
  const meta = await sharp(copy).metadata();
  assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [1024, 2400, true]);
}
const alpha = async file => sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer();
for (const file of ['01-exterior.png', '02-interior-window.png']) {
  assert.equal(sha(await alpha(join(installed, file))), sha(await alpha(join(day, file))), `${file}: sunny geometry differs`);
}
assert.equal(sha(await readFile(join(installed, 'glass-mask.png'))), sha(await readFile(join(day, 'glass-mask.png'))), 'glass mask differs from sunny day');
const composite = async excluded => sharp({ create: { width: 1024, height: 2400, channels: 4, background: '#00000000' } })
  .composite(manifest.layersBottomToTop.filter(file => !excluded.includes(file)).map(file => ({ input: join(installed, file) })))
  .ensureAlpha().raw().toBuffer();
for (const [preview, excluded] of [
  ['all', []], ['withoutRin', manifest.toggleGroups.rin],
  ['withoutRinOrCup', [...manifest.toggleGroups.rin, ...manifest.toggleGroups.cup]],
  ['bareRoom', [...manifest.toggleGroups.rin, ...manifest.toggleGroups.cup, ...manifest.toggleGroups.plant]],
]) {
  assert.equal(sha(await composite(excluded)), sha(await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer()), `${preview}: recomposition differs`);
}
if (process.env.ENNUI_ASSETS_ONLY === '1') {
  console.log('SP cloudy tall copied layers, four composites, window geometry and glass mask: passed');
  process.exit(0);
}

const cases = [
  { name: 'iphone16', w: 393, h: 852 }, { name: 'taller', w: 393, h: 900 },
  { name: 'short-safe34', w: 393, h: 760, safe: true }, { name: 'standard', w: 390, h: 844 },
  { name: 'wide-phone', w: 430, h: 932 }, { name: 'small', w: 320, h: 568 },
  { name: 'mid-portrait', w: 500, h: 700 }, { name: 'large-phone', w: 600, h: 900 },
  { name: 'tablet', w: 768, h: 1024 },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const test of cases) {
    const page = await browser.newPage({ viewport: { width: test.w, height: test.h }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-19T03:00:00Z') });
    await page.goto(base);
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="weather"]').selectOption('cloudy');
    await page.waitForFunction(() => document.querySelector('.mobile-artwork')?.dataset.activeScene === 'spring-day-cloudy');
    if (test.safe) await page.addStyleTag({ content: '.scene-nav { bottom: 34px !important; }' });
    const layers = page.locator('.mobile-artwork img[data-scene="spring-day-cloudy"]');
    assert.equal(await layers.count(), 10);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const geometry = await page.evaluate(() => {
      const rect = selector => { const b = document.querySelector(selector).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height, bottom: b.bottom, right: b.right }; };
      return { art: rect('.mobile-artwork'), nav: rect('.scene-nav'),
        layers: [...document.querySelectorAll('.mobile-artwork img[data-scene="spring-day-cloudy"]')].map(image => ({ file: image.dataset.layer, hidden: image.hidden, box: [image.getBoundingClientRect().x, image.getBoundingClientRect().y, image.getBoundingClientRect().width, image.getBoundingClientRect().height] })),
        scrollWidth: document.documentElement.scrollWidth };
    });
    assert.deepEqual(geometry.layers.map(layer => layer.file), manifest.layersBottomToTop);
    assert.ok(geometry.layers.every(layer => !layer.hidden && layer.box.every((value, i) => Math.abs(value - [geometry.art.x, geometry.art.y, geometry.art.width, geometry.art.height][i]) < .05)), `${test.name}: layer registration`);
    assert.ok(Math.abs(geometry.art.x) < .05 && Math.abs(geometry.art.y) < .05 && Math.abs(geometry.art.width - test.w) < .05, `${test.name}: full-width origin`);
    assert.ok(Math.abs(geometry.art.height - 2400 * test.w / 1024) < .05 && geometry.art.bottom >= test.h && geometry.scrollWidth <= test.w, `${test.name}: aspect/overflow`);
    if (['small', 'mid-portrait', 'large-phone', 'tablet'].includes(test.name)) assert.ok(geometry.nav.y >= geometry.art.bottom + 7, `${test.name}: menu after painting`);
    else assert.ok(geometry.nav.y < test.h && geometry.nav.y > 1648 * test.w / 1024 + 15, `${test.name}: menu clear of figure`);
    await page.locator('.scene-settings summary').click();
    await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true });
    if (['small', 'tablet'].includes(test.name)) {
      await page.locator('.scene-nav').scrollIntoViewIfNeeded();
      const menu = await page.locator('.scene-nav').boundingBox();
      assert.ok(menu.y >= 0 && menu.y + menu.height <= test.h, `${test.name}: menu reachable by scrolling`);
      await page.screenshot({ path: join(output, `${test.name}-menu-visible.png`) });
    }
    if (['iphone16', 'tablet'].includes(test.name)) {
      await page.locator('.scene-settings summary').click();
      await page.locator('[data-sp-toggle="rin"]').uncheck();
      assert.deepEqual(await layers.evaluateAll(images => images.filter(image => image.hidden).map(image => image.dataset.layer)), manifest.toggleGroups.rin);
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-day-cloudy"][data-sp-group="cup"]:not([hidden])').count(), 3);
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-day-cloudy"][data-sp-group="plant"]:not([hidden])').count(), 2);
      await page.locator('.scene-settings summary').click();
      await page.screenshot({ path: join(output, `${test.name}-no-rin.png`), fullPage: true });
    }
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="weather"]').selectOption('sunny');
    await page.evaluate(() => scrollTo(0, 0));
    const sunny = await page.locator('.mobile-artwork').boundingBox();
    assert.ok([sunny.x, sunny.y, sunny.width, sunny.height].every((value, i) => Math.abs(value - [geometry.art.x, geometry.art.y, geometry.art.width, geometry.art.height][i]) < .05), `${test.name}: sunny/cloudy registration differs`);
    await page.close();
  }
  const pc = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pc.clock.install({ time: new Date('2026-10-19T03:00:00Z') });
  await pc.goto(base);
  await pc.locator('.scene-settings summary').click();
  await pc.locator('select[name="mode"]').selectOption('manual');
  await pc.locator('select[name="weather"]').selectOption('cloudy');
  assert.equal(await pc.locator('.pc-artwork').getAttribute('data-active-scene'), 'spring-day-cloudy');
  const pcLayers = pc.locator('.pc-artwork img[data-scene="spring-day-cloudy"]');
  assert.equal(await pcLayers.count(), 5);
  await pcLayers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await pc.locator('.scene-settings summary').click();
  await pc.screenshot({ path: join(output, 'pc-cloudy.png'), fullPage: true });
  await pc.close();
} finally { await browser.close(); }
console.log(`SP cloudy tall sources, nine viewports, toggles, sunny registration and PC cloudy: passed. Screenshots: ${output}`);

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-night-asleep-tall-layers-v1';
const installed = join(root, 'src/assets/validation/sp-night-asleep-tall-layers-v1');
const output = join(root, 'artifacts/sp-night-asleep-tall-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
const sha = data => createHash('sha256').update(data).digest('hex');
await mkdir(output, { recursive: true });
assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [1024, 2400, 0, 0]);
assert.equal(manifest.layersBottomToTop.length, 8);
assert.ok(manifest.layersBottomToTop.every(file => !/rin|shadow/.test(file)), 'sleep scene contains a person layer');
for (const file of manifest.layersBottomToTop) {
  const [copy, original] = await Promise.all([readFile(join(installed, file)), readFile(join(source, file))]);
  assert.equal(sha(copy), sha(original), `${file}: installed PNG changed`);
  const meta = await sharp(copy).metadata();
  assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [1024, 2400, true]);
}
const alpha = async file => sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer();
for (const folder of ['sp-day-tall-layers-v1', 'sp-evening-tall-layers-v1', 'sp-night-awake-tall-layers-v1']) {
  const reference = join(root, 'src/assets/validation', folder);
  assert.equal(sha(await readFile(join(reference, 'glass-mask.png'))), sha(await readFile(join(installed, 'glass-mask.png'))), `${folder}: glass mask changed`);
  for (const file of ['01-exterior.png', '02-interior-window.png']) {
    assert.equal(sha(await alpha(join(reference, file))), sha(await alpha(join(installed, file))), `${folder}/${file}: shape changed`);
  }
}
const awakeLights = await alpha(join(root, 'src/assets/validation/sp-night-awake-tall-layers-v1/01a-city-lights.png'));
const asleepLights = await alpha(join(installed, '01a-city-lights.png'));
const countLit = data => data.reduce((total, value) => total + Number(value > 0), 0);
assert.equal(countLit(awakeLights), 19401);
assert.equal(countLit(asleepLights), 1916);
const composite = async excluded => sharp({ create: { width: 1024, height: 2400, channels: 4, background: '#00000000' } })
  .composite(manifest.layersBottomToTop.filter(file => !excluded.includes(file)).map(file => ({ input: join(installed, file) })))
  .ensureAlpha().raw().toBuffer();
for (const [preview, excluded] of [
  ['all', []], ['withoutRin', []], ['withoutRinOrCup', manifest.toggleGroups.cup],
  ['bareRoom', [...manifest.toggleGroups.cup, ...manifest.toggleGroups.plant]],
]) assert.equal(sha(await composite(excluded)), sha(await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer()), `${preview}: source preview differs`);
const candidate = await sharp('/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-night-asleep-tall-candidate-v1/preview-tall.png').ensureAlpha().raw().toBuffer();
const actual = await composite([]);
let changed = 0;
let maximum = 0;
for (let i = 0; i < actual.length; i++) {
  const delta = Math.abs(actual[i] - candidate[i]);
  changed += Number(delta > 0);
  maximum = Math.max(maximum, delta);
}
assert.deepEqual([changed, maximum], [3120, 1], 'candidate rounding differs from source report');

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
    await page.clock.install({ time: new Date('2026-10-18T14:30:00Z') });
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('.mobile-artwork')?.dataset.activeScene === 'spring-night-sunny-asleep');
    if (test.safe) await page.addStyleTag({ content: '.scene-nav { bottom: 34px !important; }' });
    const layers = page.locator('.mobile-artwork img[data-scene="spring-night-sunny-asleep"]');
    assert.equal(await layers.count(), 8);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const geometry = await page.evaluate(() => {
      const rect = selector => { const b = document.querySelector(selector).getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height, bottom: b.bottom, right: b.right }; };
      return { art: rect('.mobile-artwork'), nav: rect('.scene-nav'),
        layers: [...document.querySelectorAll('.mobile-artwork img[data-scene="spring-night-sunny-asleep"]')].map(image => ({ file: image.dataset.layer, hidden: image.hidden, box: [image.getBoundingClientRect().x, image.getBoundingClientRect().y, image.getBoundingClientRect().width, image.getBoundingClientRect().height] })),
        scrollWidth: document.documentElement.scrollWidth };
    });
    assert.deepEqual(geometry.layers.map(layer => layer.file), manifest.layersBottomToTop);
    assert.ok(geometry.layers.every(layer => !layer.hidden && layer.box.every((value, i) => Math.abs(value - [geometry.art.x, geometry.art.y, geometry.art.width, geometry.art.height][i]) < .05)), `${test.name}: registration`);
    assert.ok(Math.abs(geometry.art.width - test.w) < .05 && Math.abs(geometry.art.height - 2400 * test.w / 1024) < .05, `${test.name}: aspect and full width`);
    assert.ok(Math.abs(geometry.art.y) < .05 && geometry.art.bottom >= test.h && geometry.scrollWidth <= test.w, `${test.name}: no crop or blank strip`);
    if (['small', 'mid-portrait', 'large-phone', 'tablet'].includes(test.name)) assert.ok(geometry.nav.y >= geometry.art.bottom + 7, `${test.name}: menu must follow painting`);
    else assert.ok(geometry.nav.y < test.h, `${test.name}: menu stays in viewport`);
    await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true });
    if (['small', 'tablet'].includes(test.name)) {
      await page.locator('.scene-nav').scrollIntoViewIfNeeded();
      const menu = await page.locator('.scene-nav').boundingBox();
      assert.ok(menu.y >= 0 && menu.y + menu.height <= test.h, `${test.name}: menu reachable by scrolling`);
      await page.screenshot({ path: join(output, `${test.name}-menu-visible.png`) });
    }
    if (test.name === 'iphone16') {
      await page.locator('.scene-settings summary').click();
      assert.equal(await page.locator('[data-sp-toggle="rin"]').isDisabled(), true);
      await page.locator('[data-sp-toggle="cup"]').uncheck();
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-night-sunny-asleep"][data-sp-group="cup"]:not([hidden])').count(), 0);
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-night-sunny-asleep"][data-sp-group="plant"]:not([hidden])').count(), 2);
      await page.locator('.scene-settings summary').click();
      await page.screenshot({ path: join(output, 'iphone16-no-cup.png'), fullPage: true });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await page.clock.install({ time: new Date('2026-10-18T13:59:59Z') });
  await page.goto(base);
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-awake');
  const awake = await page.locator('.mobile-artwork').boundingBox();
  await page.clock.runFor(1100);
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-asleep');
  assert.deepEqual(await page.locator('.mobile-artwork').boundingBox(), awake, 'awake/asleep registration differs');
  await page.locator('.scene-settings summary').click();
  await page.locator('select[name="mode"]').selectOption('manual');
  await page.locator('select[name="period"]').selectOption('day');
  assert.deepEqual(await page.locator('.mobile-artwork').boundingBox(), awake, 'day/asleep registration differs');
  await page.locator('select[name="weather"]').selectOption('cloudy');
  const cloudy = await page.locator('.mobile-artwork').boundingBox();
  assert.deepEqual(cloudy, awake, 'cloudy geometry differs from asleep night');
  await page.close();
  const pc = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pc.clock.install({ time: new Date('2026-10-18T14:30:00Z') });
  await pc.goto(base);
  assert.equal(await pc.locator('.pc-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-asleep');
  assert.equal(await pc.locator('.pc-artwork img[data-scene="spring-night-sunny-asleep"]:not([hidden])').count(), 4);
  await pc.locator('.pc-artwork img[data-scene="spring-night-sunny-asleep"]').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  await pc.screenshot({ path: join(output, 'pc-asleep.png'), fullPage: true });
  await pc.close();
} finally { await browser.close(); }
console.log(`SP asleep night tall source, nine viewports, toggles, scene rollover and legacy cloudy: passed. Screenshots: ${output}`);

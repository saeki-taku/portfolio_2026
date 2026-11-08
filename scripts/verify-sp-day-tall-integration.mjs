import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-day-tall-layers-v1';
const installed = join(root, 'src/assets/validation/sp-day-tall-layers-v1');
const output = join(root, 'artifacts/sp-day-tall-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
const digest = data => createHash('sha256').update(data).digest('hex');
await mkdir(output, { recursive: true });
assert.equal(manifest.status, 'implementation-candidate');
assert.deepEqual([manifest.width, manifest.height], [1024, 2400]);
assert.deepEqual(manifest.registration, { x: 0, y: 0 });
for (const filename of manifest.layersBottomToTop) {
  const [copy, original] = await Promise.all([readFile(join(installed, filename)), readFile(join(source, filename))]);
  assert.equal(digest(copy), digest(original), `${filename}: installed PNG differs`);
  const metadata = await sharp(copy).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [1024, 2400, true]);
}
for (const [preview, excluded] of [['all', []], ['withoutRin', manifest.toggleGroups.rin]]) {
  const layerFiles = manifest.layersBottomToTop.filter(file => !excluded.includes(file));
  const actual = await sharp({ create: { width: 1024, height: 2400, channels: 4, background: '#00000000' } })
    .composite(layerFiles.map(file => ({ input: join(installed, file) }))).ensureAlpha().raw().toBuffer();
  const expected = await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer();
  assert.equal(digest(actual), digest(expected), `${preview}: native recomposition differs`);
}
const candidate = await sharp('/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals/sp-day-tall-candidate-v2/preview-tall.png').ensureAlpha().raw().toBuffer();
const installedComposite = await sharp({ create: { width: 1024, height: 2400, channels: 4, background: '#00000000' } })
  .composite(manifest.layersBottomToTop.map(file => ({ input: join(installed, file) }))).ensureAlpha().raw().toBuffer();
assert.equal(digest(installedComposite), digest(candidate), 'adopted tall candidate differs from installed layer composite');

const cases = [
  { name: 'iphone16', width: 393, height: 852 },
  { name: 'taller', width: 393, height: 900 },
  { name: 'short-safe34', width: 393, height: 760, safe: true },
  { name: 'standard', width: 390, height: 844 },
  { name: 'wide-phone', width: 430, height: 932 },
  { name: 'small', width: 320, height: 568 },
  { name: 'tablet', width: 768, height: 1024 },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const test of cases) {
    const page = await browser.newPage({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-15T03:00:00Z') });
    await page.goto(base);
    await page.waitForFunction(() => document.querySelector('.mobile-artwork')?.dataset.activeScene === 'spring-day-sunny');
    if (test.safe) await page.addStyleTag({ content: '.scene-nav { bottom: 34px !important; }' });
    const layers = page.locator('.mobile-artwork img[data-scene="spring-day-sunny"]');
    assert.equal(await layers.count(), 9);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const geometry = await page.evaluate(() => {
      const r = selector => {
        const bounds = document.querySelector(selector).getBoundingClientRect();
        return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height, right: bounds.right, bottom: bounds.bottom };
      };
      return { art: r('.mobile-artwork'), logo: r('.scene-logo'), nav: r('.scene-nav'),
        images: [...document.querySelectorAll('.mobile-artwork img[data-scene="spring-day-sunny"]')].map(image => {
          const b = image.getBoundingClientRect();
          return { name: image.dataset.layer, hidden: image.hidden, rect: [b.x, b.y, b.width, b.height] };
        }), scrollWidth: document.documentElement.scrollWidth };
    });
    const scale = test.width / 1024;
    assert.deepEqual(geometry.images.map(image => image.name), manifest.layersBottomToTop);
    assert.ok(geometry.images.every(image => !image.hidden && image.rect.every((v, i) => Math.abs(v - [geometry.art.x, geometry.art.y, geometry.art.width, geometry.art.height][i]) < .05)), `${test.name}: aligned layers`);
    assert.ok(Math.abs(geometry.art.width - test.width) < .05, `${test.name}: no right strip`);
    assert.ok(Math.abs(geometry.art.height - 2400 * scale) < .05, `${test.name}: 2400px aspect`);
    assert.ok(Math.abs(geometry.art.y) < .05 && geometry.art.bottom >= test.height, `${test.name}: no blank below painting`);
    assert.ok(geometry.scrollWidth <= test.width, `${test.name}: no horizontal overflow`);
    assert.ok(geometry.logo.bottom + 12 < 330 * scale, `${test.name}: logo/window clearance`);
    assert.ok(geometry.nav.right <= geometry.art.right, `${test.name}: menu inside page width`);
    if (['small', 'tablet'].includes(test.name)) assert.ok(geometry.nav.y >= geometry.art.bottom + 7, `${test.name}: menu must follow painting`);
    else assert.ok(geometry.nav.y < geometry.art.bottom, `${test.name}: menu on painting`);
    if (test.width >= 390 && test.width <= 430) assert.ok(1648 * scale + 20 < geometry.nav.y, `${test.name}: figure and cup clear of menu`);
    await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true });
    if (test.name === 'iphone16' || test.name === 'taller') {
      await page.locator('.scene-settings summary').click();
      await page.locator('[data-sp-toggle="rin"]').uncheck();
      assert.deepEqual(await layers.evaluateAll(images => images.filter(image => image.hidden).map(image => image.dataset.layer)), manifest.toggleGroups.rin);
      assert.equal(await page.locator('.mobile-artwork img[data-sp-group="cup"]:not([hidden])').count(), 3);
      assert.equal(await page.locator('.mobile-artwork img[data-sp-group="plant"]:not([hidden])').count(), 2);
      await page.locator('.scene-settings summary').click();
      await page.screenshot({ path: join(output, `${test.name}-no-rin.png`), fullPage: true });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  await page.clock.install({ time: new Date('2026-10-15T07:59:59Z') });
  await page.goto(base);
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-day-sunny');
  await page.clock.runFor(1100);
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-evening-sunny');
  const evening = await page.locator('.mobile-artwork').boundingBox();
  assert.ok(Math.abs(evening.width - 393) < .05 && Math.abs(evening.height - 2400 * 393 / 1024) < .05, 'evening tall geometry matches day');
  await page.locator('.scene-settings summary').click();
  await page.locator('select[name="mode"]').selectOption('manual');
  await page.locator('select[name="period"]').selectOption('night');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-awake');
  await page.locator('select[name="nightState"]').selectOption('asleep');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-night-sunny-asleep');
  await page.locator('select[name="period"]').selectOption('day');
  await page.locator('select[name="weather"]').selectOption('cloudy');
  assert.equal(await page.locator('.mobile-artwork').getAttribute('data-active-scene'), 'spring-day-cloudy');
  const cloudy = await page.locator('.mobile-artwork').boundingBox();
  assert.ok(Math.abs(cloudy.width - 393) < .05 && Math.abs(cloudy.height - 2400 * 393 / 1024) < .05, 'cloudy day matches sunny geometry');
  await page.locator('select[name="weather"]').selectOption('sunny');
  const sunny = await page.locator('.mobile-artwork').boundingBox();
  assert.ok(Math.abs(sunny.width - 393) < .05 && Math.abs(sunny.height - 2400 * 393 / 1024) < .05, 'manual sunny returns tall geometry');
  await page.close();
} finally { await browser.close(); }
console.log(`SP tall day installed composite, 7 SP viewports, person toggle and all tall scene geometry: passed. Screenshots: ${output}`);

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const output = join(root, 'artifacts/spring-day-cloudy-v1');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });

const assets = {};
for (const [variant, width, height] of [['pc', 1345, 1170], ['sp', 1024, 2400]]) {
  const folder = variant === 'sp' ? 'sp-day-cloudy-tall-layers-v1' : 'pc-spring-day-cloudy-layers-v1';
  const installed = join(root, 'src/assets/validation', folder);
  const original = join(source, folder);
  const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
  assert.equal(manifest.status, variant === 'sp' ? 'implementation-candidate' : 'review-candidate');
  assert.equal(manifest.width, width);
  assert.equal(manifest.height, height);
  assert.deepEqual(manifest.registration, { x: 0, y: 0 });
  for (const filename of manifest.layersBottomToTop) {
    const [copy, input] = await Promise.all([readFile(join(installed, filename)), readFile(join(original, filename))]);
    const digest = data => createHash('sha256').update(data).digest('hex');
    assert.equal(digest(copy), digest(input), `${variant}/${filename}: source differs`);
    const info = await sharp(copy).metadata();
    assert.equal(info.width, width);
    assert.equal(info.height, height);
    assert.equal(info.hasAlpha, true);
  }
  for (const [preview, excluded] of [['all', []], ['withoutRin', manifest.toggleGroups.rin]]) {
    const layers = manifest.layersBottomToTop.filter(filename => !excluded.includes(filename));
    const composite = await sharp({ create: { width, height, channels: 4, background: '#00000000' } })
      .composite(layers.map(filename => ({ input: join(installed, filename) }))).ensureAlpha().raw().toBuffer();
    const reference = await sharp(join(original, manifest.previews[preview])).ensureAlpha().raw().toBuffer();
    let maxDifference = 0;
    for (let i = 0; i < composite.length; i++) maxDifference = Math.max(maxDifference, Math.abs(composite[i] - reference[i]));
    assert.ok(maxDifference <= 1, `${variant}/${preview}: source composite differs by ${maxDifference}`);
  }
  assets[variant] = { folder, manifest, width, height };
}

const cases = [
  { name: 'pc-original', variant: 'pc', width: 1345, height: 1200 },
  { name: 'pc-wide', variant: 'pc', width: 1920, height: 1080 },
  { name: 'pc-near-square', variant: 'pc', width: 1024, height: 821 },
  { name: 'sp-original', variant: 'sp', width: 1024, height: 2400 },
  { name: 'sp-phone', variant: 'sp', width: 390, height: 844 },
  { name: 'sp-tall', variant: 'sp', width: 430, height: 932 },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const test of cases) {
    const page = await browser.newPage({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-12T03:00:00Z') });
    await page.goto(base);
    const selector = test.variant === 'pc' ? '.pc-artwork' : '.mobile-artwork';
    const artwork = page.locator(selector);
    const scene = () => artwork.getAttribute('data-active-scene');
    assert.equal(await scene(), 'spring-day-sunny', `${test.name}: auto sunny unchanged`);
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="weather"]').selectOption('cloudy');
    assert.equal(await scene(), 'spring-day-cloudy', `${test.name}: manual cloudy`);
    assert.match(await page.locator('.scene-status').textContent(), /春・昼・曇り。静止画の確認用候補/);
    const layers = artwork.locator('img[data-scene="spring-day-cloudy"]');
    assert.equal(await layers.count(), assets[test.variant].manifest.layersBottomToTop.length);
    assert.deepEqual(await layers.evaluateAll(images => images.map(image => image.dataset.layer)), assets[test.variant].manifest.layersBottomToTop);
    assert.equal(await layers.evaluateAll(images => images.filter(image => image.hidden).length), 0);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const bounds = await layers.evaluateAll(images => images.map(image => {
      const rect = image.getBoundingClientRect();
      return [rect.x, rect.y, rect.width, rect.height];
    }));
    assert.ok(bounds.every(rect => rect.every((value, i) => Math.abs(value - bounds[0][i]) < .02)), `${test.name}: common coordinates`);
    await page.locator('.scene-settings summary').click();
    await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true });
    if (test.name.endsWith('original')) {
      const rect = await artwork.boundingBox();
      assert.ok(Math.abs(rect.width - assets[test.variant].width) < .02, `${test.name}: original width`);
      assert.ok(Math.abs(rect.height - assets[test.variant].height) < .02, `${test.name}: original height`);
      await artwork.screenshot({ path: join(output, `${test.name}-artwork.png`) });
    }
    await page.locator('.scene-settings summary').click();
    const toggle = test.variant === 'pc' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]';
    await page.locator(toggle).uncheck();
    assert.equal(await layers.filter({ visible: true }).count(), await layers.count() - assets[test.variant].manifest.toggleGroups.rin.length);
    for (const filename of assets[test.variant].manifest.toggleGroups.rin) {
      assert.equal(await artwork.locator(`img[data-scene="spring-day-cloudy"][data-layer="${filename}"]`).getAttribute('hidden'), '', `${test.name}: ${filename} hidden`);
    }
    assert.equal(await artwork.locator('img[data-scene="spring-day-cloudy"][data-layer="05-cup-foreground.png"]:not([hidden])').count(), test.variant === 'pc' ? 1 : 0);
    if (test.variant === 'sp') {
      assert.equal(await artwork.locator('img[data-scene="spring-day-cloudy"][data-sp-group="cup"]:not([hidden])').count(), 3);
      assert.equal(await artwork.locator('img[data-scene="spring-day-cloudy"][data-sp-group="plant"]:not([hidden])').count(), 2);
    }
    await page.locator('.scene-settings summary').click();
    if (test.name.endsWith('original')) await artwork.screenshot({ path: join(output, `${test.name}-no-rin-artwork.png`) });
    await page.screenshot({ path: join(output, `${test.name}-no-rin.png`), fullPage: true });
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="weather"]').selectOption('sunny');
    assert.equal(await scene(), 'spring-day-sunny', `${test.name}: return to sunny`);
    await page.locator('select[name="weather"]').selectOption('rain');
    assert.equal(await scene(), 'spring-day-sunny', `${test.name}: rain unavailable`);
    assert.match(await page.locator('.scene-status').textContent(), /雨は素材未対応/);
    await page.locator('select[name="weather"]').selectOption('cloudy');
    await page.locator('select[name="period"]').selectOption('evening');
    assert.equal(await scene(), 'spring-evening-sunny', `${test.name}: cloudy evening unavailable`);
    assert.match(await page.locator('.scene-status').textContent(), /曇りは素材未対応/);
    if (test.name.endsWith('original')) {
      await page.locator('select[name="period"]').selectOption('night');
      assert.equal(await scene(), 'spring-night-sunny-awake', `${test.name}: cloudy awake night unavailable`);
      await page.locator('select[name="nightState"]').selectOption('asleep');
      assert.equal(await scene(), 'spring-night-sunny-asleep', `${test.name}: cloudy sleep unavailable`);
      await page.locator('select[name="weather"]').selectOption('rain');
      assert.equal(await scene(), 'spring-night-sunny-asleep', `${test.name}: rainy sleep unavailable`);
      await page.locator('select[name="period"]').selectOption('day');
      await page.locator('select[name="weather"]').selectOption('snow');
      assert.equal(await scene(), 'spring-day-sunny', `${test.name}: snow unavailable`);
      assert.match(await page.locator('.scene-status').textContent(), /雪は素材未対応/);
      await page.locator('select[name="weather"]').selectOption('sunny');
      await page.locator('select[name="season"]').selectOption('summer');
      assert.equal(await scene(), 'spring-day-sunny', `${test.name}: other season unavailable`);
      await page.locator('select[name="mode"]').selectOption('auto');
      assert.equal(await scene(), 'spring-day-sunny', `${test.name}: auto remains sunny`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Cloudy day source, PC/SP layer registration, 6 viewports, toggles and fallback: passed. Screenshots: ${output}`);

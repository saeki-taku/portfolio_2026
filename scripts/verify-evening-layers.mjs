import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4506';
const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const out = join(root, 'artifacts/evening-pose-v2');
await mkdir(out, { recursive: true });
for (const [folder, width, height] of [['pc-spring-evening-pose-layers-v2', 1345, 1170], ['sp-spring-evening-pose-layers-v2', 1024, 1997]]) {
  const manifest = JSON.parse(await readFile(join(root, 'src/assets/validation', folder, 'manifest.json'), 'utf8'));
  assert.equal(manifest.width, width);
  assert.equal(manifest.height, height);
  for (const filename of manifest.layersBottomToTop) {
    const original = await readFile(join(sourceRoot, folder, filename));
    const copy = await readFile(join(root, 'src/assets/validation', folder, filename));
    assert.equal(createHash('sha256').update(copy).digest('hex'), createHash('sha256').update(original).digest('hex'), `${folder}/${filename} changed`);
    const info = await sharp(copy).metadata();
    assert.equal(info.width, width);
    assert.equal(info.height, height);
    assert.equal(info.hasAlpha, true);
    if (!manifest.toggleGroups.rin.includes(filename)) {
      const previous = await readFile(join(sourceRoot, folder.replace('-pose-layers-v2', '-layers-v1'), filename));
      assert.equal(createHash('sha256').update(copy).digest('hex'), createHash('sha256').update(previous).digest('hex'), `${folder}/${filename}: background changed`);
    }
  }
  for (const [preview, excluded] of [['all', []], ['withoutRin', manifest.toggleGroups.rin]]) {
    const layerNames = manifest.layersBottomToTop.filter(filename => !excluded.includes(filename));
    const composite = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(layerNames.map(filename => ({ input: join(root, 'src/assets/validation', folder, filename) }))).ensureAlpha().raw().toBuffer();
    const reference = await sharp(join(sourceRoot, folder, manifest.previews[preview])).ensureAlpha().raw().toBuffer();
    let maxDifference = 0;
    for (let i = 0; i < composite.length; i++) maxDifference = Math.max(maxDifference, Math.abs(composite[i] - reference[i]));
    assert.ok(maxDifference <= 1, `${folder}/${preview}: native composite differs by ${maxDifference}`);
  }
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const cases = [
  { name: 'pc-standard', width: 1440, height: 900, count: 5, selector: '.pc-artwork' },
  { name: 'pc-wide', width: 1920, height: 1080, count: 5, selector: '.pc-artwork' },
  { name: 'pc-near-square', width: 1024, height: 821, count: 5, selector: '.pc-artwork' },
  { name: 'sp-standard', width: 390, height: 844, count: 9, selector: '.mobile-artwork' },
  { name: 'sp-tall', width: 430, height: 932, count: 9, selector: '.mobile-artwork' },
  { name: 'sp-tablet', width: 768, height: 1024, count: 9, selector: '.mobile-artwork' },
];
try {
  for (const test of cases) {
    const page = await browser.newPage({ viewport: { width: test.width, height: test.height }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-11T08:30:00Z') }); // 17:30 Tokyo
    await page.goto(base);
    const art = page.locator(test.selector);
    await page.waitForFunction(selector => document.querySelector(selector)?.dataset.activeScene === 'spring-evening-sunny', test.selector);
    const layers = art.locator('img[data-scene="spring-evening-sunny"]');
    assert.equal(await layers.count(), test.count, test.name);
    assert.equal(await layers.evaluateAll(images => images.filter(image => image.hidden).length), 0, `${test.name}: visible layers`);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const bounds = await layers.evaluateAll(images => images.map(image => {
      const rect = image.getBoundingClientRect();
      return [rect.x, rect.y, rect.width, rect.height];
    }));
    assert.ok(bounds.every(rect => rect.every((n, i) => Math.abs(n - bounds[0][i]) < .02)), `${test.name}: layer alignment`);
    await page.screenshot({ path: join(out, `${test.name}.png`), fullPage: true });
    await page.locator('.scene-settings summary').click();
    if (test.selector === '.pc-artwork') {
      assert.equal(await page.locator('[data-layer-toggle="cup"]').isDisabled(), true, 'PC evening cup cannot be independently toggled');
      await page.locator('[data-layer-toggle="rin"]').uncheck();
      assert.equal(await art.locator('[data-control="rin"]:not([hidden])').count(), 0, `${test.name}: Rin group hidden`);
      assert.equal(await art.locator('img[data-layer="05-cup-foreground.png"]:not([hidden])').count(), 1, `${test.name}: cup remains`);
    } else {
      await page.locator('[data-sp-toggle="rin"]').uncheck();
      assert.equal(await art.locator('[data-sp-group="rin"]:not([hidden])').count(), 0, `${test.name}: Rin group hidden`);
      assert.equal(await art.locator('[data-sp-group="cup"]:not([hidden])').count(), 3, `${test.name}: cup remains`);
    }
    await page.locator('.scene-settings summary').click();
    await page.screenshot({ path: join(out, `${test.name}-no-rin.png`), fullPage: true });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.clock.install({ time: new Date('2026-10-11T07:59:59Z') });
  await page.goto(base);
  assert.equal(await page.locator('.scene').getAttribute('data-active-scene'), 'spring-day-sunny');
  await page.clock.runFor(1_100);
  assert.equal(await page.locator('.scene').getAttribute('data-active-scene'), 'spring-evening-sunny', 'SP auto rollover');
  await page.locator('.scene-settings summary').click();
  await page.locator('select[name="mode"]').selectOption('manual');
  await page.locator('select[name="period"]').selectOption('day');
  assert.equal(await page.locator('.scene').getAttribute('data-active-scene'), 'spring-day-sunny', 'SP manual day');
  await page.locator('select[name="period"]').selectOption('evening');
  assert.equal(await page.locator('.scene').getAttribute('data-active-scene'), 'spring-evening-sunny', 'SP manual evening');
  await page.close();
} finally {
  await browser.close();
}
console.log(`Evening pose v2 PC/SP assets, backgrounds, layers, aspect ratios, toggles and time selection: passed. Screenshots: ${out}`);

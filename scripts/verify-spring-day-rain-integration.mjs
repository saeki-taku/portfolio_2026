import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const output = join(root, 'artifacts/spring-day-rain-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(output, { recursive: true });

for (const [folder, dimensions] of [['pc-spring-day-rain-layers-v2', [1345, 1170]], ['sp-spring-day-rain-tall-layers-v1', [1024, 2400]]]) {
  const source = join(sourceRoot, folder);
  const installed = join(root, 'src/assets/validation', folder);
  const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [...dimensions, 0, 0]);
  const layers = manifest.layersBottomToTop.filter(file => !file.includes('{'));
  const effects = folder.startsWith('pc-')
    ? ['rin-on', 'rin-off'].flatMap(state => [`rain-outdoor-${state}.png`, `rain-glass-droplets-${state}.png`])
    : ['rin-on', 'rin-off', 'plant-off-rin-on', 'plant-off-rin-off'].flatMap(state => [`rain-outdoor-${state}.png`, `rain-glass-droplets-${state}.png`]);
  const masks = (folder.startsWith('pc-') ? ['rin-on', 'rin-off'] : ['rin-on', 'rin-off', 'plant-off-rin-on', 'plant-off-rin-off'])
    .map(state => `rain-visibility-alpha-${state}.png`);
  for (const file of [...layers, ...effects, ...masks]) {
    const [original, copy] = await Promise.all([readFile(join(source, file)), readFile(join(installed, file))]);
    assert.equal(sha(copy), sha(original), `${folder}/${file}: copied asset changed`);
    const meta = await sharp(copy).metadata();
    assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [...dimensions, true]);
  }
  for (const [preview, removed, suffix] of folder.startsWith('pc-')
    ? [['all', [], 'rin-on'], ['withoutRin', manifest.toggleGroups.rin, 'rin-off']]
    : [['all', [], 'rin-on'], ['withoutRin', manifest.toggleGroups.rin, 'rin-off'], ['withoutPlant', manifest.toggleGroups.plant, 'plant-off-rin-on'], ['withoutPlantOrRin', [...manifest.toggleGroups.plant, ...manifest.toggleGroups.rin], 'plant-off-rin-off']]) {
    const files = [...layers.filter(file => !removed.includes(file)), `rain-outdoor-${suffix}.png`, `rain-glass-droplets-${suffix}.png`];
    const actual = await sharp({ create: { width: dimensions[0], height: dimensions[1], channels: 4, background: '#00000000' } })
      .composite(files.map(file => ({ input: join(installed, file) }))).ensureAlpha().raw().toBuffer();
    const expected = await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer();
    assert.equal(sha(actual), sha(expected), `${folder}/${preview}: preview recomposition differs`);
  }
}
if (process.env.ENNUI_ASSETS_ONLY === '1') {
  console.log('PC/SP rain source copies and preview recomposition: passed');
  process.exit(0);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of [['pc-wide', 1600, 900], ['pc-standard', 1366, 768], ['pc-near-square', 1080, 1000], ['sp-phone', 393, 852], ['sp-small', 320, 568], ['sp-tablet', 768, 1024]]) {
    const sp = name.startsWith('sp');
    const artwork = sp ? '.mobile-artwork' : '.pc-artwork';
    const toggle = sp ? 'data-sp-toggle' : 'data-layer-toggle';
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-19T03:00:00Z') });
    await page.goto(base);
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="weather"]').selectOption('rain');
    await page.waitForFunction(selector => document.querySelector(selector)?.dataset.activeScene === 'spring-day-rain', artwork);
    const sceneLayers = page.locator(`${artwork} img[data-scene="spring-day-rain"]`);
    await sceneLayers.evaluateAll(images => Promise.all(images.filter(image => !image.hidden).map(image => image.decode())));
    const layout = await page.evaluate(selector => {
      const art = document.querySelector(selector).getBoundingClientRect();
      return [...document.querySelectorAll(`${selector} img[data-scene="spring-day-rain"]`)].map(image => {
        const box = image.getBoundingClientRect();
        return { hidden: image.hidden, effect: image.dataset.rainEffect, variant: [image.dataset.rainRin, image.dataset.rainPlant], box: [box.x, box.y, box.width, box.height], art: [art.x, art.y, art.width, art.height] };
      });
    }, artwork);
    assert.ok(layout.filter(item => !item.hidden).every(item => item.box.every((n, i) => Math.abs(n - item.art[i]) < .1)), `${name}: layer registration`);
    assert.equal(layout.filter(item => item.effect && !item.hidden).length, 2, `${name}: exactly two rain effects`);
    await page.locator('.scene-settings summary').click();
    await page.screenshot({ path: join(output, `${name}.png`), fullPage: true });
    await page.locator('.scene-settings summary').click();
    await page.locator(`[${toggle}="rin"]`).uncheck();
    assert.equal(await page.locator(`${artwork} img[data-rain-effect]:not([hidden])`).count(), 2, `${name}: person-off rain effect`);
    assert.equal(await page.locator(`${artwork} img[data-rain-rin="on"]:not([hidden])`).count(), 0, `${name}: old person rain mask remains`);
    if (sp) {
      await page.locator('[data-sp-toggle="plant"]').uncheck();
      assert.equal(await page.locator(`${artwork} img[data-rain-plant="off"]:not([hidden])`).count(), 2, `${name}: plant-off rain effect`);
      assert.equal(await page.locator(`${artwork} img[data-sp-group="plant"]:not([hidden])`).count(), 0, `${name}: plant remains`);
    }
    await page.locator(`${artwork} img[data-rain-effect]:not([hidden])`).evaluateAll(images => Promise.all(images.map(image => image.decode())));
    await page.locator('.scene-settings summary').click();
    await page.screenshot({ path: join(output, `${name}-no-rin${sp ? '-no-plant' : ''}.png`), fullPage: true });
    await page.locator('.scene-settings summary').click();
    await page.locator('[data-rain-amount="outdoor"]').fill('0');
    await page.locator('[data-rain-amount="glass"]').fill('0');
    assert.equal(await page.locator(`${artwork} img[data-rain-effect]:not([hidden])`).count(), 0, `${name}: effect off`);
    await page.locator('select[name="weather"]').selectOption('cloudy');
    assert.equal(await page.locator(artwork).getAttribute('data-active-scene'), 'spring-day-cloudy');
    await page.locator('select[name="weather"]').selectOption('sunny');
    assert.equal(await page.locator(artwork).getAttribute('data-active-scene'), 'spring-day-sunny');
    await page.close();
  }
} finally { await browser.close(); }
console.log(`PC/SP rain scene, six viewports, person/plant/effect toggles and sunny/cloudy switching: passed. Screenshots: ${output}`);

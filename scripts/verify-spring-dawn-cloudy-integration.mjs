import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const output = join(root, 'artifacts/spring-dawn-cloudy-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const alpha = async file => sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer();
await mkdir(output, { recursive: true });

for (const [folder, reference, width, height] of [
  ['pc-spring-dawn-cloudy-layers-v1', 'pc-spring-dawn-layers-v1', 1345, 1170],
  ['sp-spring-dawn-cloudy-tall-layers-v1', 'sp-spring-dawn-tall-layers-v1', 1024, 2400],
]) {
  const source = join(sourceRoot, folder);
  const installed = join(root, 'src/assets/validation', folder);
  const clear = join(root, 'src/assets/validation', reference);
  const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [width, height, 0, 0]);
  assert.equal(manifest.layersBottomToTop.length, width === 1345 ? 4 : 8);
  assert.ok(manifest.layersBottomToTop.every(file => !/rin|shadow|lamp/i.test(file)), `${folder}: person/lamp layer`);
  for (const file of [...manifest.layersBottomToTop, 'glass-mask.png']) {
    const [copy, original] = await Promise.all([readFile(join(installed, file)), readFile(join(source, file))]);
    assert.equal(sha(copy), sha(original), `${folder}/${file}: copied PNG differs`);
    const meta = await sharp(copy).metadata();
    assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [width, height, file !== 'glass-mask.png'], `${folder}/${file}: dimensions/alpha`);
    if (file !== '01a-city-lights.png' && file !== 'glass-mask.png')
      assert.equal(sha(await alpha(join(installed, file))), sha(await alpha(join(clear, file))), `${folder}/${file}: clear-dawn registration`);
  }
  assert.equal(sha(await readFile(join(installed, '01a-city-lights.png'))), sha(await readFile(join(clear, '01a-city-lights.png'))), `${folder}: city lights changed`);
  assert.equal(sha(await readFile(join(installed, 'glass-mask.png'))), sha(await readFile(join(clear, 'glass-mask.png'))), `${folder}: glass mask changed`);
  const composite = excluded => sharp({ create: { width, height, channels: 4, background: '#00000000' } })
    .composite(manifest.layersBottomToTop.filter(file => !excluded.includes(file)).map(file => ({ input: join(installed, file) })))
    .ensureAlpha().raw().toBuffer();
  const variants = width === 1345
    ? [['all', []], ['cityLightsOff', ['01a-city-lights.png']]]
    : [['all', []], ['cityLightsOff', ['01a-city-lights.png']], ['withoutCup', manifest.toggleGroups.cup], ['withoutPlantCup', [...manifest.toggleGroups.cup, ...manifest.toggleGroups.plant]]];
  for (const [preview, excluded] of variants)
    assert.equal(sha(await composite(excluded)), sha(await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer()), `${folder}/${preview}: preview differs`);
}
if (process.env.ENNUI_ASSETS_ONLY === '1') {
  console.log('PC/SP cloudy dawn copied layers, clear-dawn geometry, city lights and previews: passed');
  process.exit(0);
}

const cases = [
  ['pc-standard', 1440, 900], ['pc-wide', 1920, 1080], ['pc-near-square', 1024, 821],
  ['sp-phone', 393, 852], ['sp-tall', 393, 900], ['sp-short', 393, 760],
  ['sp-small', 320, 568], ['sp-wide', 430, 932], ['sp-tablet', 768, 1024],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of cases) {
    const sp = name.startsWith('sp');
    const selector = sp ? '.mobile-artwork' : '.pc-artwork';
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-17T20:30:00Z') }); // 05:30 JST
    await page.goto(base);
    assert.equal(await page.locator(selector).getAttribute('data-active-scene'), 'spring-dawn-sunny', `${name}: automatic clear dawn`);
    await page.locator('.scene-settings summary').click();
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="period"]').selectOption('dawn');
    await page.locator('select[name="weather"]').selectOption('cloudy');
    await page.waitForFunction(selector => document.querySelector(selector)?.dataset.activeScene === 'spring-dawn-cloudy', selector);
    const layers = page.locator(`${selector} img[data-scene="spring-dawn-cloudy"]`);
    assert.equal(await layers.count(), sp ? 8 : 4);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const cloudy = await page.locator(selector).boundingBox();
    const cloudyScrollY = await page.evaluate(() => scrollY);
    const registration = await layers.evaluateAll(images => images.map(image => {
      const box = image.getBoundingClientRect();
      return { hidden: image.hidden, box: [box.x, box.y, box.width, box.height] };
    }));
    assert.ok(registration.every(item => !item.hidden && item.box.every((value, index) => Math.abs(value - [cloudy.x, cloudy.y, cloudy.width, cloudy.height][index]) < .1)), `${name}: layer registration`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
    assert.equal(await page.locator(sp ? '[data-sp-toggle="rin"]' : '[data-layer-toggle="rin"]').isDisabled(), true, `${name}: person control enabled`);
    assert.equal(await page.locator(`${selector} img[data-scene="spring-dawn-cloudy"][data-control="rin"], ${selector} img[data-scene="spring-dawn-cloudy"][data-sp-group="rin"]`).count(), 0);
    if (sp) {
      assert.ok(Math.abs(cloudy.x) < .1 && Math.abs(cloudy.width - width) < .1 && Math.abs(cloudy.height - 2400 * width / 1024) < .1, `${name}: tall layout`);
      await page.locator('[data-sp-toggle="cup"]').uncheck();
      assert.equal(await page.locator(`${selector} img[data-scene="spring-dawn-cloudy"][data-sp-group="cup"]:not([hidden])`).count(), 0);
      await page.locator('[data-sp-toggle="plant"]').uncheck();
      assert.equal(await page.locator(`${selector} img[data-scene="spring-dawn-cloudy"][data-sp-group="plant"]:not([hidden])`).count(), 0);
      await page.locator('[data-sp-toggle="cup"]').check();
      await page.locator('[data-sp-toggle="plant"]').check();
    }
    await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.screenshot({ path: join(output, `${name}.png`), fullPage: true });
    if (name === 'sp-tablet' || name === 'sp-small') {
      await page.locator('.scene-nav').scrollIntoViewIfNeeded();
      const menu = await page.locator('.scene-nav').boundingBox();
      assert.ok(menu.y >= 0 && menu.y + menu.height <= height, `${name}: menu unreachable`);
    }
    await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="weather"]').selectOption('sunny');
    const clear = await page.locator(selector).boundingBox();
    const clearScrollY = await page.evaluate(() => scrollY);
    assert.ok([clear.x, clear.y + clearScrollY, clear.width, clear.height].every((value, index) => Math.abs(value - [cloudy.x, cloudy.y + cloudyScrollY, cloudy.width, cloudy.height][index]) < .1), `${name}: clear/cloudy layout shifted`);
    await page.close();
  }
} finally { await browser.close(); }
console.log(`PC/SP cloudy dawn, nine viewports, layer groups, clear registration and menu: passed. Screenshots: ${output}`);

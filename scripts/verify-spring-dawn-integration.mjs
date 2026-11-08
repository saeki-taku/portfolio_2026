import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const output = join(root, 'artifacts/spring-dawn-integration');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const sha = data => createHash('sha256').update(data).digest('hex');
await mkdir(output, { recursive: true });
for (const [folder, width, height] of [['pc-spring-dawn-layers-v1', 1345, 1170], ['sp-spring-dawn-tall-layers-v1', 1024, 2400]]) {
  const source = join(sourceRoot, folder);
  const installed = join(root, 'src/assets/validation', folder);
  const manifest = JSON.parse(await readFile(join(installed, 'manifest.json'), 'utf8'));
  assert.deepEqual([manifest.width, manifest.height, manifest.registration.x, manifest.registration.y], [width, height, 0, 0]);
  assert.ok(manifest.layersBottomToTop.every(file => !/rin|shadow/.test(file)), `${folder}: person layer remains`);
  for (const file of manifest.layersBottomToTop) {
    const [copy, original] = await Promise.all([readFile(join(installed, file)), readFile(join(source, file))]);
    assert.equal(sha(copy), sha(original), `${folder}/${file}: installed PNG changed`);
    const meta = await sharp(copy).metadata();
    assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [width, height, true]);
  }
  const composite = excluded => sharp({ create: { width, height, channels: 4, background: '#00000000' } })
    .composite(manifest.layersBottomToTop.filter(file => !excluded.includes(file)).map(file => ({ input: join(installed, file) })))
    .ensureAlpha().raw().toBuffer();
  const variants = folder.startsWith('pc')
    ? [['all', []], ['cityLightsOff', ['01a-city-lights.png']]]
    : [['all', []], ['cityLightsOff', ['01a-city-lights.png']], ['withoutCup', manifest.toggleGroups.cup], ['withoutPlantCup', [...manifest.toggleGroups.cup, ...manifest.toggleGroups.plant]]];
  for (const [preview, excluded] of variants) {
    assert.equal(sha(await composite(excluded)), sha(await sharp(join(source, manifest.previews[preview])).ensureAlpha().raw().toBuffer()), `${folder}/${preview}: recomposition differs`);
  }
}
const spSource = join(root, 'src/assets/validation/sp-spring-dawn-tall-layers-v1');
const alpha = async file => sharp(file).ensureAlpha().extractChannel('alpha').raw().toBuffer();
for (const folder of ['sp-day-tall-layers-v1', 'sp-evening-tall-layers-v1', 'sp-night-awake-tall-layers-v1', 'sp-night-asleep-tall-layers-v1']) {
  const reference = join(root, 'src/assets/validation', folder);
  assert.equal(sha(await readFile(join(spSource, 'glass-mask.png'))), sha(await readFile(join(reference, 'glass-mask.png'))), `${folder}: glass mask changed`);
  for (const file of ['01-exterior.png', '02-interior-window.png']) {
    assert.equal(sha(await alpha(join(spSource, file))), sha(await alpha(join(reference, file))), `${folder}/${file}: shape changed`);
  }
}

const cases = [
  { name: 'sp-iphone16', w: 393, h: 852 }, { name: 'sp-taller', w: 393, h: 900 },
  { name: 'sp-short-safe34', w: 393, h: 760, safe: true }, { name: 'sp-small', w: 320, h: 568 },
  { name: 'sp-wide-phone', w: 430, h: 932 }, { name: 'sp-tablet', w: 768, h: 1024 },
  { name: 'pc-standard', w: 1440, h: 900 }, { name: 'pc-wide', w: 1920, h: 1080 },
  { name: 'pc-near-square', w: 1024, h: 821 },
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const test of cases) {
    const portrait = test.name.startsWith('sp');
    const selector = portrait ? '.mobile-artwork' : '.pc-artwork';
    const page = await browser.newPage({ viewport: { width: test.w, height: test.h }, deviceScaleFactor: 1 });
    await page.clock.install({ time: new Date('2026-10-17T20:30:00Z') }); // 05:30 Tokyo
    await page.goto(base);
    await page.waitForFunction(selector => document.querySelector(selector)?.dataset.activeScene === 'spring-dawn-sunny', selector);
    if (test.safe) await page.addStyleTag({ content: '.scene-nav { bottom: 34px !important; }' });
    const layers = page.locator(`${selector} img[data-scene="spring-dawn-sunny"]`);
    assert.equal(await layers.count(), portrait ? 8 : 4);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const geometry = await page.evaluate(selector => {
      const rect = element => { const b = element.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height, bottom: b.bottom, right: b.right }; };
      const art = document.querySelector(selector);
      return { art: rect(art), nav: rect(document.querySelector('.scene-nav')),
        layers: [...art.querySelectorAll('img[data-scene="spring-dawn-sunny"]')].map(image => ({ file: image.dataset.layer, hidden: image.hidden, box: [image.getBoundingClientRect().x, image.getBoundingClientRect().y, image.getBoundingClientRect().width, image.getBoundingClientRect().height] })),
        scrollWidth: document.documentElement.scrollWidth };
    }, selector);
    const manifest = JSON.parse(await readFile(join(root, 'src/assets/validation', portrait ? 'sp-spring-dawn-tall-layers-v1' : 'pc-spring-dawn-layers-v1', 'manifest.json'), 'utf8'));
    assert.deepEqual(geometry.layers.map(layer => layer.file), manifest.layersBottomToTop);
    assert.ok(geometry.layers.every(layer => !layer.hidden && layer.box.every((value, i) => Math.abs(value - [geometry.art.x, geometry.art.y, geometry.art.width, geometry.art.height][i]) < .05)), `${test.name}: registration`);
    assert.ok(geometry.scrollWidth <= test.w, `${test.name}: horizontal overflow`);
    if (portrait) {
      assert.ok(Math.abs(geometry.art.x) < .05 && Math.abs(geometry.art.y) < .05 && Math.abs(geometry.art.width - test.w) < .05, `${test.name}: full-width origin`);
      assert.ok(Math.abs(geometry.art.height - 2400 * test.w / 1024) < .05 && geometry.art.bottom >= test.h, `${test.name}: tall aspect and no blank`);
      if (['sp-small', 'sp-tablet'].includes(test.name)) assert.ok(geometry.nav.y >= geometry.art.bottom + 7, `${test.name}: menu after painting`);
      else assert.ok(geometry.nav.y < test.h, `${test.name}: menu in viewport`);
    } else assert.ok(geometry.art.width > 0 && geometry.art.height > 0, `${test.name}: PC artwork visible`);
    assert.equal(await page.locator('.scene-logo').evaluate(el => getComputedStyle(el).color), 'rgb(240, 238, 233)', `${test.name}: dawn logo contrast`);
    await page.screenshot({ path: join(output, `${test.name}.png`), fullPage: true });
    if (test.name === 'sp-tablet') {
      await page.locator('.scene-nav').scrollIntoViewIfNeeded();
      const menu = await page.locator('.scene-nav').boundingBox();
      assert.ok(menu.y >= 0 && menu.y + menu.height <= test.h, 'tablet menu reachable');
      await page.screenshot({ path: join(output, 'sp-tablet-menu-visible.png') });
    }
    if (test.name === 'sp-iphone16') {
      await page.locator('.scene-settings summary').click();
      assert.equal(await page.locator('[data-sp-toggle="rin"]').isDisabled(), true);
      await page.locator('[data-sp-toggle="cup"]').uncheck();
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-dawn-sunny"][data-sp-group="cup"]:not([hidden])').count(), 0);
      assert.equal(await page.locator('.mobile-artwork img[data-scene="spring-dawn-sunny"][data-sp-group="plant"]:not([hidden])').count(), 2);
      await page.locator('.scene-settings summary').click();
      await page.screenshot({ path: join(output, 'sp-iphone16-no-cup.png'), fullPage: true });
    }
    if (test.name === 'pc-standard') {
      await page.locator('.scene-settings summary').click();
      assert.equal(await page.locator('[data-layer-toggle="rin"]').isDisabled(), true);
      assert.equal(await page.locator('[data-layer-toggle="cup"]').isDisabled(), true);
    }
    await page.close();
  }
  for (const [time, expected] of [['2026-10-17T19:59:00Z', 'spring-night-sunny-asleep'], ['2026-10-17T20:00:00Z', 'spring-dawn-sunny'], ['2026-10-17T20:59:00Z', 'spring-dawn-sunny'], ['2026-10-17T21:00:00Z', 'spring-day-sunny']]) {
    for (const [viewport, selector] of [[{ width: 390, height: 844 }, '.mobile-artwork'], [{ width: 1440, height: 900 }, '.pc-artwork']]) {
      const page = await browser.newPage({ viewport });
      await page.clock.install({ time: new Date(time) });
      await page.goto(base);
      assert.equal(await page.locator(selector).getAttribute('data-active-scene'), expected, `${selector} ${time}`);
      await page.close();
    }
  }
} finally { await browser.close(); }
console.log(`PC/SP dawn sources, nine viewports, layer groups and 04:59/05:00/05:59/06:00: passed. Screenshots: ${output}`);

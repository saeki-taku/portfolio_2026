import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/summer-day-clear/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const viewports = [
  ['pc-standard', 1440, 900], ['pc-wide', 1920, 1080], ['pc-near-square', 1024, 821],
  ['sp-phone', 393, 852], ['sp-small', 320, 568], ['sp-tablet', 768, 1024],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of viewports) {
    const sp = name.startsWith('sp');
    const art = sp ? '.mobile-artwork' : '.pc-artwork';
    const control = sp ? 'data-sp-toggle' : 'data-layer-toggle';
    const group = sp ? 'data-sp-group' : 'data-control';
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const summary = page.locator('.scene-settings summary');
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('summer');
    await page.locator('select[name="period"]').selectOption('day');
    await page.locator('select[name="weather"]').selectOption('sunny');
    await page.waitForFunction(selector =>
      document.querySelector(selector)?.dataset.activeScene === 'summer-day-sunny', art);
    const layers = page.locator(`${art} img[data-scene="summer-day-sunny"]`);
    assert.ok(await layers.count() >= (sp ? 8 : 5), `${name}: layers missing`);
    await page.waitForFunction(selector => {
      const visible = [...document.querySelectorAll(selector)].filter(image => !image.hidden);
      return visible.length > 0 && visible.every(image => image.complete && image.naturalWidth > 0);
    }, `${art} img[data-scene="summer-day-sunny"]`);
    const artwork = await page.locator(art).boundingBox();
    const rects = await layers.evaluateAll(items => items.filter(image => !image.hidden).map(image => {
      const box = image.getBoundingClientRect();
      return { hidden: image.hidden, rect: [box.x, box.y, box.width, box.height] };
    }));
    assert.ok(rects.length >= (sp ? 8 : 5) && rects.every(item => item.rect.every((value, index) =>
      Math.abs(value - [artwork.x, artwork.y, artwork.width, artwork.height][index]) < .1)),
      `${name}: layer registration`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${name}: horizontal overflow`);
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.screenshot({ path: join(output, `${name}-composite.png`), fullPage: true });
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    for (const toggle of sp ? ['rin', 'cup', 'plant'] : ['rin', 'cup']) {
      const input = page.locator(`[${control}="${toggle}"]`);
      assert.equal(await input.isDisabled(), false, `${name}: ${toggle} control disabled`);
      await input.uncheck();
      assert.equal(await page.locator(`${art} img[data-scene="summer-day-sunny"][${group}="${toggle}"]:not([hidden])`).count(),
        0, `${name}: ${toggle} remains visible`);
      if (toggle === 'rin') {
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${name}-no-rin.png`), fullPage: true });
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      }
      await input.check();
    }
    await page.locator('select[name="season"]').selectOption('spring');
    await page.waitForFunction(selector =>
      document.querySelector(selector)?.dataset.activeScene === 'spring-day-sunny', art);
    assert.equal(await page.locator(`${art} img[data-scene="summer-day-sunny"]:not([hidden])`).count(),
      0, `${name}: summer layers remain in spring`);
    await page.locator('select[name="season"]').selectOption('summer');
    await page.waitForFunction(selector =>
      document.querySelector(selector)?.dataset.activeScene === 'summer-day-sunny', art);
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Summer day clear PC/SP six viewports and spring return passed; screenshots: ${output}`);

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/spring-final/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const scenes = [
  ['dawn', 'sunny', '', 'spring-dawn-sunny'],
  ['dawn', 'cloudy', '', 'spring-dawn-cloudy'],
  ['dawn', 'rain', '', 'spring-dawn-rain'],
  ['day', 'sunny', '', 'spring-day-sunny'],
  ['day', 'cloudy', '', 'spring-day-cloudy'],
  ['day', 'rain', '', 'spring-day-rain'],
  ['evening', 'sunny', '', 'spring-evening-sunny'],
  ['evening', 'cloudy', '', 'spring-evening-cloudy'],
  ['evening', 'rain', '', 'spring-evening-rain'],
  ['night', 'sunny', 'awake', 'spring-night-sunny-awake'],
  ['night', 'cloudy', 'awake', 'spring-night-cloudy-awake'],
  ['night', 'rain', 'awake', 'spring-night-rain-awake'],
  ['night', 'sunny', 'asleep', 'spring-night-sunny-asleep'],
  ['night', 'cloudy', 'asleep', 'spring-night-cloudy-asleep'],
  ['night', 'rain', 'asleep', 'spring-night-rain-asleep'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [viewport, width, height] of [['pc', 1440, 900], ['sp', 393, 852]]) {
    const art = viewport === 'pc' ? '.pc-artwork' : '.mobile-artwork';
    const control = viewport === 'pc' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]';
    const group = viewport === 'pc' ? 'data-control' : 'data-sp-group';
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const summary = page.locator('.scene-settings summary');
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    for (const [period, weather, nightState, id] of scenes) {
      await page.locator('select[name="period"]').selectOption(period);
      if (nightState) await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.locator('select[name="weather"]').selectOption(weather);
      await page.waitForFunction(([selector, expected]) =>
        document.querySelector(selector)?.dataset.activeScene === expected, [art, id]);
      const images = page.locator(`${art} img[data-scene="${id}"]:not([data-rain-effect]):not([hidden])`);
      assert.ok(await images.count() > 0, `${viewport}/${id}: no visible layers`);
      await images.evaluateAll(items => Promise.all(items.map(image => image.decode())));
      const absent = period === 'dawn' || nightState === 'asleep';
      assert.equal(await page.locator(control).isDisabled(), absent, `${viewport}/${id}: person control`);
      assert.equal(await page.locator(`${art} img[data-scene="${id}"][${group}="rin"]:not([hidden])`).count() === 0,
        absent, `${viewport}/${id}: person visibility`);
      assert.equal(await page.locator('.rain-controls').isVisible(), weather === 'rain',
        `${viewport}/${id}: rain controls`);
      if (weather !== 'rain') {
        assert.equal(await page.locator(`${art} canvas.rain-motion`).evaluate(canvas => canvas.hidden),
          true, `${viewport}/${id}: stale rain frame`);
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${viewport}/${id}: horizontal overflow`);
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.screenshot({ path: join(output, `${id}-${viewport}.png`), fullPage: true });
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      if (id === 'spring-evening-cloudy') {
        await page.locator(control).uncheck();
        assert.equal(await page.locator(`${art} img[data-scene="${id}"][${group}="rin"]:not([hidden])`).count(), 0);
        assert.ok(await page.locator(`${art} img[data-scene="${id}"][data-layer*="cup-foreground"]:not([hidden])`).count() > 0);
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${id}-${viewport}-no-rin.png`), fullPage: true });
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.locator(control).check();
        if (viewport === 'sp') {
          await page.locator('[data-sp-toggle="plant"]').uncheck();
          assert.equal(await page.locator(`${art} img[data-scene="${id}"][data-sp-group="plant"]:not([hidden])`).count(), 0);
          await page.locator('[data-sp-toggle="plant"]').check();
        }
      }
    }
    assert.deepEqual(errors, [], `${viewport}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`15 spring scenes × PC/SP passed; screenshots: ${output}`);

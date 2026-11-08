import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = process.env.ENNUI_CAPTURE_DIR || fileURLToPath(new URL('../artifacts/summer-cup-comparison/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const cases = [
  ['dawn', null, 'summer-dawn-sunny'],
  ['day', null, 'summer-day-sunny'],
  ['evening', null, 'summer-evening-sunny'],
  ['night', 'awake', 'summer-night-sunny-awake'],
  ['night', 'asleep', 'summer-night-sunny-asleep'],
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [kind, width, height, sourceWidth, sourceHeight, roi] of [
    ['pc', 1345, 1170, 1345, 1170, { x: 925, y: 665, width: 300, height: 200 }],
    ['sp', 1024, 2400, 1024, 2400, { x: 500, y: 1510, width: 380, height: 250 }],
  ].filter(([kind]) => !process.env.ENNUI_CAPTURE_KIND || kind === process.env.ENNUI_CAPTURE_KIND)) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto(base, { waitUntil: 'networkidle' });
    const summary = page.locator('.scene-settings summary');
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('summer');
    await page.locator('select[name="weather"]').selectOption('sunny');
    const art = page.locator(kind === 'pc' ? '.pc-artwork' : '.mobile-artwork');
    const cup = page.locator(kind === 'pc' ? '[data-layer-toggle="cup"]' : '[data-sp-toggle="cup"]');
    for (const [period, nightState, scene] of cases) {
      await cup.check();
      await page.locator('select[name="period"]').selectOption(period);
      if (nightState) await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.waitForFunction(([selector, id]) => document.querySelector(selector)?.dataset.activeScene === id,
        [kind === 'pc' ? '.pc-artwork' : '.mobile-artwork', scene]);
      await art.locator(`img[data-scene="${scene}"][data-layer]`).evaluateAll(items => Promise.all(items.filter(image => !image.hidden).map(image => image.decode())));
      for (const state of ['on', 'off']) {
        if (state === 'on') await cup.check(); else await cup.uncheck();
        await art.locator(`img[data-scene="${scene}"][data-layer]:not([hidden])`).evaluateAll(items =>
          Promise.all(items.map(image => image.decode())));
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${kind}-${scene}-cup-${state}.png`), fullPage: true });
        const box = await art.boundingBox();
        const scaleX = box.width / sourceWidth;
        const scaleY = box.height / sourceHeight;
        await page.screenshot({ path: join(output, `${kind}-${scene}-cup-${state}-detail.png`),
          clip: { x: box.x + roi.x * scaleX, y: box.y + roi.y * scaleY,
            width: roi.width * scaleX, height: roi.height * scaleY } });
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Summer PC/SP cup ON/OFF comparison captured: ${output}`);

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/spring-phase5-lighting/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const cases = [
  ['evening-cloudy', 'evening', 'cloudy', 'awake'],
  ['night-rain-awake', 'night', 'rain', 'awake'],
  ['night-rain-asleep', 'night', 'rain', 'asleep'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, period, weather, nightState] of cases) {
    for (const [viewport, width, height] of [['pc', 1440, 900], ['sp', 393, 852]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      const summary = page.locator('.scene-settings summary');
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.locator('select[name="mode"]').selectOption('manual');
      await page.locator('select[name="period"]').selectOption(period);
      if (period === 'night') await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.locator('select[name="weather"]').selectOption(weather);
      const artwork = viewport === 'pc' ? '.pc-artwork' : '.mobile-artwork';
      const active = page.locator(`${artwork} img[data-scene="spring-${name}"]:not([hidden])`);
      await active.evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.waitForTimeout(150);
      await page.screenshot({ path: join(output, `${name}-${viewport}-current.png`), fullPage: true });
      if (name === 'evening-cloudy') {
        for (const [variant, filter] of [['soft', 'brightness(.93) saturate(.78)'], ['cool', 'brightness(.90) saturate(.68)']]) {
          await page.addStyleTag({ content: `img[data-scene="spring-evening-cloudy"][data-layer="rin.png"] { filter: ${filter}; }` });
          await page.screenshot({ path: join(output, `${name}-${viewport}-${variant}.png`), fullPage: true });
        }
      } else {
        await page.addStyleTag({ content: `
          img[data-scene^="spring-night-rain"][data-rain-effect="outdoor"] { opacity: .72 !important; }
          img[data-scene^="spring-night-rain"][data-rain-effect="glass"] { opacity: .85 !important; }
          ${artwork} canvas.rain-motion { opacity: 1 !important; }
        ` });
        await page.screenshot({ path: join(output, `${name}-${viewport}-original-rain.png`), fullPage: true });
      }
      await page.close();
    }
  }
} finally { await browser.close(); }
console.log(output);

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/spring-sp-day-cup-underpaint/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of [['phone', 393, 852], ['tablet', 768, 1024]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const settings = page.locator('.scene-settings summary');
    await settings.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('spring');
    await page.locator('select[name="period"]').selectOption('day');
    await page.locator('select[name="weather"]').selectOption('sunny');
    await page.waitForFunction(() =>
      document.querySelector('.mobile-artwork')?.dataset.activeScene === 'spring-day-sunny');
    const scene = '.mobile-artwork img[data-scene="spring-day-sunny"]';
    const underpaint = page.locator(`${scene}[data-layer="07-rin-occluded-underpaint.png"]`);
    assert.equal(await underpaint.getAttribute('data-requires-rin'), 'true');
    assert.equal(await underpaint.getAttribute('data-requires-cup'), 'true');
    for (const rin of [true, false]) for (const cup of [true, false]) for (const plant of [true, false]) {
      for (const [group, checked] of Object.entries({ rin, cup, plant })) {
        await page.locator(`[data-sp-toggle="${group}"]`).setChecked(checked);
      }
      assert.equal(await underpaint.isVisible(), rin && cup,
        `${name}: hidden overlap for rin=${rin} cup=${cup} plant=${plant}`);
      for (const [group, checked] of Object.entries({ rin, cup, plant })) {
        assert.equal(await page.locator(`${scene}[data-sp-group="${group}"]:not([hidden])`).count() > 0,
          checked, `${name}: ${group} visibility`);
      }
      const visible = page.locator(`${scene}:not([hidden])`);
      await visible.evaluateAll(images => Promise.all(images.map(image => image.decode())));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${name}: horizontal overflow`);
      await settings.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.screenshot({ path: join(output, `${name}-rin-${rin ? 'on' : 'off'}-cup-${cup ? 'on' : 'off'}-plant-${plant ? 'on' : 'off'}.png`), fullPage: true });
      await settings.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    }
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Spring day SP cup underpaint: 8 states × 2 viewports passed; screenshots: ${output}`);

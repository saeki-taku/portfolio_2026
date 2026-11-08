import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/spring-pc-cup-off-refine/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of [['standard', 1440, 900], ['wide', 1920, 1080]]) {
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
      document.querySelector('.pc-artwork')?.dataset.activeScene === 'spring-day-sunny');
    const art = page.locator('.pc-artwork');
    const sill = art.locator('img[data-scene="spring-day-sunny"][data-layer="02a-cup-off-sill-clean.png"]');
    const repair = art.locator('img[data-scene="spring-day-sunny"][data-layer="10-cup-off-sp-refine.png"]');
    assert.equal(await sill.count(), 1);
    assert.equal(await sill.getAttribute('data-requires-cup'), 'false');
    assert.equal(await repair.count(), 1);
    assert.equal(await repair.getAttribute('data-requires-rin'), 'true');
    assert.equal(await repair.getAttribute('data-requires-cup'), 'false');
    assert.equal(await page.locator('[data-layer-toggle="plant"]').isDisabled(), true);
    for (const rin of [true, false]) for (const cup of [true, false]) {
      await page.locator('[data-layer-toggle="rin"]').setChecked(rin);
      await page.locator('[data-layer-toggle="cup"]').setChecked(cup);
      assert.equal(await sill.isVisible(), !cup,
        `${name}: sill restoration visibility rin=${rin} cup=${cup}`);
      assert.equal(await repair.isVisible(), rin && !cup,
        `${name}: cloth repair visibility rin=${rin} cup=${cup}`);
      assert.equal(await art.locator('img[data-scene="spring-day-sunny"][data-control="rin"]:not([hidden])').count() > 0, rin);
      assert.equal(await art.locator('img[data-scene="spring-day-sunny"][data-control="cup"]:not([hidden])').count() > 0, cup);
      await art.locator('img[data-scene="spring-day-sunny"]:not([hidden])').evaluateAll(items =>
        Promise.all(items.map(image => image.decode())));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${name}: horizontal overflow`);
      await settings.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.screenshot({ path: join(output,
        `${name}-rin-${rin ? 'on' : 'off'}-cup-${cup ? 'on' : 'off'}.png`), fullPage: true });
      await settings.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    }
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Spring day PC cup-off refinement: 4 states × 2 viewports passed; screenshots: ${output}`);

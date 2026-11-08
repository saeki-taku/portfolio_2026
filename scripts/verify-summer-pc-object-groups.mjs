import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/summer-pc-object-groups/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const scenes = [
  ['dawn', null, 'summer-dawn-sunny', false],
  ['day', null, 'summer-day-sunny', true],
  ['evening', null, 'summer-evening-sunny', true],
  ['night', 'awake', 'summer-night-sunny-awake', true],
  ['night', 'asleep', 'summer-night-sunny-asleep', false],
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [viewportName, width, height] of [['standard', 1440, 900], ['wide', 1920, 1080]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    const summary = page.locator('.scene-settings summary');
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('summer');
    await page.locator('select[name="weather"]').selectOption('sunny');
    for (const [period, nightState, scene, hasRin] of scenes) {
      await page.locator('select[name="period"]').selectOption(period);
      if (nightState) await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.waitForFunction(id => document.querySelector('.pc-artwork')?.dataset.activeScene === id, scene);
      const layers = page.locator(`.pc-artwork img[data-scene="${scene}"][data-layer]`);
      await layers.evaluateAll(items => Promise.all(items.filter(image => !image.hidden).map(image => image.decode())));
      for (const group of ['plant', 'cup']) {
        assert.ok(await page.locator(`.pc-artwork img[data-scene="${scene}"][data-control="${group}"]`).count() > 0,
          `${viewportName} ${scene}: ${group} group missing`);
        assert.equal(await page.locator(`[data-layer-toggle="${group}"]`).isDisabled(), false,
          `${viewportName} ${scene}: ${group} control disabled`);
      }
      assert.equal(await page.locator('[data-layer-toggle="rin"]').isDisabled(), !hasRin,
        `${viewportName} ${scene}: person control`);
      assert.equal(await page.locator('[data-pc-cup-label]').textContent(), 'カップと連動下地',
        `${viewportName} ${scene}: cup label`);
      for (const rinOn of hasRin ? [true, false] : [false]) {
        if (hasRin) {
          const rin = page.locator('[data-layer-toggle="rin"]');
          if (rinOn) await rin.check(); else await rin.uncheck();
        }
        for (const plantOn of [true, false]) {
          const plant = page.locator('[data-layer-toggle="plant"]');
          if (plantOn) await plant.check(); else await plant.uncheck();
          for (const cupOn of [true, false]) {
            const cup = page.locator('[data-layer-toggle="cup"]');
            if (cupOn) await cup.check(); else await cup.uncheck();
            const actual = await layers.evaluateAll(items => items.map(image => ({
              filename: image.dataset.layer,
              hidden: image.hidden,
              control: image.dataset.control,
              requiresRin: image.dataset.requiresRin,
              requiresPlant: image.dataset.requiresPlant,
              requiresCup: image.dataset.requiresCup,
            })));
            for (const layer of actual) {
              const groupOff = layer.control === 'rin' && !rinOn
                || layer.control === 'plant' && !plantOn
                || layer.control === 'cup' && !cupOn;
              const conditionalOff = layer.requiresRin !== undefined && (layer.requiresRin === 'true') !== rinOn
                || layer.requiresPlant !== undefined && (layer.requiresPlant === 'true') !== plantOn
                || layer.requiresCup !== undefined && (layer.requiresCup === 'true') !== cupOn;
              assert.equal(layer.hidden, groupOff || conditionalOff,
                `${viewportName} ${scene} ${layer.filename}: wrong visibility for rin=${rinOn} plant=${plantOn} cup=${cupOn}`);
            }
            assert.equal(await page.locator(`.pc-artwork img[data-scene]:not([data-scene="${scene}"]):not([hidden])`).count(), 0,
              `${viewportName} ${scene}: previous scene remains visible`);
            await layers.evaluateAll(items => Promise.all(items.filter(image => !image.hidden).map(image => image.decode())));
            await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
            const state = `rin-${rinOn ? 'on' : 'off'}-plant-${plantOn ? 'on' : 'off'}-cup-${cupOn ? 'on' : 'off'}`;
            await page.screenshot({ path: join(output, `pc-${viewportName}-${scene}-${state}.png`), fullPage: true });
            await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
          }
        }
      }
      for (const group of ['rin', 'plant', 'cup']) {
        const input = page.locator(`[data-layer-toggle="${group}"]`);
        if (await input.isEnabled()) await input.check();
      }
    }
    assert.deepEqual(errors, [], `${viewportName}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Summer PC plant/cup/person combinations passed at two viewport ratios; screenshots: ${output}`);

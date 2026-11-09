import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const output = fileURLToPath(new URL('../artifacts/summer-five-scenes/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
const allCases = [
  ['dawn', null, 'summer-dawn-sunny', false],
  ['day', null, 'summer-day-sunny', true],
  ['evening', null, 'summer-evening-sunny', true],
  ['night', 'awake', 'summer-night-sunny-awake', true],
  ['night', 'asleep', 'summer-night-sunny-asleep', false],
];
const selected = process.env.ENNUI_SCENES?.split(',') ?? allCases.map(([, , scene]) => scene);
const cases = allCases.filter(([, , scene]) => selected.includes(scene));
assert.equal(cases.length, selected.length, 'unknown scene in ENNUI_SCENES');
const viewports = [
  ['pc-standard', 1440, 900],
  ['pc-wide', 1920, 1080],
  ['sp-phone', 393, 852],
  ['sp-tablet', 768, 1024],
];

await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height] of viewports) {
    const sp = name.startsWith('sp');
    const art = sp ? '.mobile-artwork' : '.pc-artwork';
    const toggleAttribute = sp ? 'data-sp-toggle' : 'data-layer-toggle';
    const groupAttribute = sp ? 'data-sp-group' : 'data-control';
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    const imageRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (request.resourceType() === 'image') imageRequests.push(decodeURIComponent(request.url()));
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(imageRequests.filter(url => url.includes('summer-') && !url.includes('-approved-contact-shadow.png')).length, 0,
      `${name}: unselected summer images fetched on initial load`);
    const summary = page.locator('.scene-settings summary');
    await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('summer');
    await page.locator('select[name="weather"]').selectOption('sunny');

    for (const [period, nightState, scene, hasRin] of cases) {
      await page.locator('select[name="period"]').selectOption(period);
      if (nightState) await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.waitForFunction(([selector, id]) =>
        document.querySelector(selector)?.dataset.activeScene === id, [art, scene]);
      const layers = page.locator(`${art} img[data-scene="${scene}"][data-layer]`);
      assert.ok(await layers.count() >= 3, `${name} ${scene}: missing layers`);
      await layers.evaluateAll(items => Promise.all(items.filter(image => !image.hidden).map(image => image.decode())));
      const artwork = await page.locator(art).boundingBox();
      const rects = await layers.evaluateAll(items => items.map(image => {
        const box = image.getBoundingClientRect();
        return { hidden: image.hidden, rect: [box.x, box.y, box.width, box.height] };
      }));
      assert.ok(rects.filter(item => !item.hidden).every(item => item.rect.every((value, index) =>
        Math.abs(value - [artwork.x, artwork.y, artwork.width, artwork.height][index]) < .1)),
        `${name} ${scene}: layer registration`);
      assert.equal(await page.locator(`${art} img[data-scene]:not([data-scene="${scene}"]):not([hidden])`).count(),
        0, `${name} ${scene}: old scene remains visible`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${name} ${scene}: horizontal overflow`);

      const rin = page.locator(`[${toggleAttribute}="rin"]`);
      assert.equal(await rin.isDisabled(), !hasRin, `${name} ${scene}: person control`);
      if (hasRin) {
        assert.ok(await page.locator(`${art} img[data-scene="${scene}"][${groupAttribute}="rin"]:not([hidden])`).count() > 0,
          `${name} ${scene}: person layers missing`);
        await rin.uncheck();
        assert.equal(await page.locator(`${art} img[data-scene="${scene}"][${groupAttribute}="rin"]:not([hidden])`).count(),
          0, `${name} ${scene}: person layers remain`);
        if (!sp) {
          assert.equal(await page.locator(`${art} img[data-scene="${scene}"][data-control="cup"]:not([hidden])`).count(),
            2, `${name} ${scene}: cup must stay visible when person is off`);
          assert.equal(await page.locator(`${art} img[data-scene="${scene}"][data-requires-rin="true"]:not([hidden])`).count(),
            0, `${name} ${scene}: person/cup overlap remains when person is off`);
        }
      } else {
        assert.equal(await page.locator(`${art} img[data-scene="${scene}"][${groupAttribute}="rin"]:not([hidden])`).count(),
          0, `${name} ${scene}: person exists in empty scene`);
      }
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.screenshot({ path: join(output, `${name}-${scene}${hasRin ? '-no-rin' : ''}.png`), fullPage: true });
      await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      if (hasRin) await rin.check();
      if (hasRin) {
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${name}-${scene}.png`), fullPage: true });
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      }
      const repaint = page.locator(`${art} img[data-scene="${scene}"][data-layer="10-cup-off-repaint.png"]`);
      const refinement = page.locator(`${art} img[data-scene="${scene}"][data-layer="11-cup-off-sp-refine.png"]`);
      if (!sp) assert.equal(await refinement.count(), 0,
        `${name} ${scene}: PC cloth refinement availability`);
      assert.equal(await repaint.count(), 0,
        `${name} ${scene}: cup-off repaint availability`);

      if (sp) {
        const cup = page.locator('[data-sp-toggle="cup"]');
        await cup.uncheck();

        if (hasRin) {
          await rin.uncheck();

          await rin.check();
        }
        await cup.check();
        for (const group of ['cup', 'plant']) {
          const input = page.locator(`[data-sp-toggle="${group}"]`);
          assert.equal(await input.isDisabled(), false, `${name} ${scene}: ${group} disabled`);
          await input.uncheck();
          assert.equal(await page.locator(`${art} img[data-scene="${scene}"][data-sp-group="${group}"]:not([hidden])`).count(),
            0, `${name} ${scene}: ${group} remains`);
          await input.check();
        }
      } else {
        const cup = page.locator('[data-layer-toggle="cup"]');
        assert.equal(await cup.isDisabled(), false, `${name} ${scene}: cup control disabled`);
        const cupLayers = page.locator(`${art} img[data-scene="${scene}"][data-control="cup"]`);
        assert.equal(await cupLayers.count(), hasRin ? 2 : 1,
          `${name} ${scene}: clean cup and existing contact shadow must be switchable`);
        const overlap = page.locator(`${art} img[data-scene="${scene}"][data-requires-rin="true"][data-requires-cup="true"]`);
        const visibleOverlap = page.locator(`${art} img[data-scene="${scene}"][data-requires-rin="true"][data-requires-cup="true"]:not([hidden])`);
        assert.equal(await overlap.count(), 0,
          `${name} ${scene}: person/cup overlap restoration`);
        assert.equal(await visibleOverlap.count(), 0,
          `${name} ${scene}: person/cup overlap must show only when both controls are on`);
        assert.equal(await page.locator('[data-pc-cup-label]').textContent(), 'カップと連動下地',
          `${name} ${scene}: cup control label`);
        await cup.uncheck();
        if (hasRin) {


        }
        assert.equal(await page.locator(`${art} img[data-scene="${scene}"][data-control="cup"]:not([hidden])`).count(),
          0, `${name} ${scene}: cup body or foreground remains`);
        assert.equal(await visibleOverlap.count(), 0,
          `${name} ${scene}: person/cup overlap remains with cup off`);
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${name}-${scene}-no-cup.png`), fullPage: true });
        await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        if (hasRin) {
          await rin.uncheck();


          assert.equal(await visibleOverlap.count(), 0,
            `${name} ${scene}: person/cup overlap remains with person off`);
          await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
          await page.screenshot({ path: join(output, `${name}-${scene}-no-rin-no-cup.png`), fullPage: true });
          await summary.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
          await rin.check();
        }
        await cup.check();
      }
    }
    await page.locator('select[name="season"]').selectOption('spring');
    assert.equal(await page.locator(`${art} img[data-scene^="summer-"]:not([hidden])`).count(),
      0, `${name}: summer remains after spring switch`);
    assert.equal(imageRequests.filter(url =>
      url.includes(sp ? 'pc-summer-' : 'sp-summer-')).length, 0,
    `${name}: assets for the other viewport were fetched`);
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`${cases.length} summer clear scenes × PC/SP viewports passed; screenshots: ${output}`);

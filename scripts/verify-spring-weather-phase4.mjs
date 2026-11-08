import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = fileURLToPath(new URL('..', import.meta.url));
const output = join(root, 'artifacts/spring-weather-phase4');
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512';
await mkdir(output, { recursive: true });

const allScenes = [
  ['dawn-rain', 'dawn', 'rain', '', true],
  ['evening-cloudy', 'evening', 'cloudy', '', false],
  ['evening-rain', 'evening', 'rain', '', false],
  ['night-cloudy-awake', 'night', 'cloudy', 'awake', false],
  ['night-rain-awake', 'night', 'rain', 'awake', false],
  ['night-cloudy-asleep', 'night', 'cloudy', 'asleep', true],
  ['night-rain-asleep', 'night', 'rain', 'asleep', true],
];
const requestedScenes = process.env.ENNUI_SCENES?.split(',');
const scenes = requestedScenes ? allScenes.filter(([name]) => requestedScenes.includes(name)) : allScenes;
assert.ok(scenes.length > 0, 'No matching phase-4 scenes selected');
const viewports = [
  ['pc-standard', 1440, 900], ['pc-wide', 1920, 1080], ['pc-near-square', 1024, 821],
  ['sp-phone', 393, 852], ['sp-small', 320, 568], ['sp-tablet', 768, 1024],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [short, period, weather, nightState, noRin] of scenes) {
    const sceneId = `spring-${short}`;
    for (const [viewport, width, height] of viewports) {
      const sp = viewport.startsWith('sp');
      const artwork = sp ? '.mobile-artwork' : '.pc-artwork';
      const personToggle = sp ? '[data-sp-toggle="rin"]' : '[data-layer-toggle="rin"]';
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.locator('select[name="mode"]').selectOption('manual');
      await page.locator('select[name="period"]').selectOption(period);
      if (nightState) await page.locator('select[name="nightState"]').selectOption(nightState);
      await page.locator('select[name="weather"]').selectOption(weather);
      await page.waitForFunction(([selector, id]) => document.querySelector(selector)?.dataset.activeScene === id, [artwork, sceneId]);
      const layers = page.locator(`${artwork} img[data-scene="${sceneId}"]:not([data-rain-effect])`);
      assert.ok(await layers.count() > 0, `${sceneId}/${viewport}: layers missing`);
      await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
      const art = await page.locator(artwork).boundingBox();
      const rects = await layers.evaluateAll(images => images.map(image => {
        const box = image.getBoundingClientRect();
        return { hidden: image.hidden, box: [box.x, box.y, box.width, box.height] };
      }));
      assert.ok(rects.every(item => !item.hidden && item.box.every((value, index) => Math.abs(value - [art.x, art.y, art.width, art.height][index]) < .1)), `${sceneId}/${viewport}: layer registration`);
      assert.equal(await page.locator(personToggle).isDisabled(), noRin, `${sceneId}/${viewport}: person control`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${sceneId}/${viewport}: horizontal overflow`);
      if (sp) {
        assert.ok(Math.abs(art.x) < .1 && Math.abs(art.width - width) < .1 && Math.abs(art.height - width * 2400 / 1024) < .1, `${sceneId}/${viewport}: tall scene geometry`);
        for (const group of ['plant', 'cup']) {
          await page.locator(`[data-sp-toggle="${group}"]`).uncheck();
          assert.equal(await page.locator(`${artwork} img[data-scene="${sceneId}"][data-sp-group="${group}"]:not([hidden])`).count(), 0, `${sceneId}/${viewport}: ${group} off`);
          await page.locator(`[data-sp-toggle="${group}"]`).check();
        }
      }
      if (!noRin) {
        await page.locator(personToggle).uncheck();
        assert.equal(await page.locator(`${artwork} img[data-scene="${sceneId}"][data-${sp ? 'sp-group' : 'control'}="rin"]:not([hidden])`).count(), 0, `${sceneId}/${viewport}: person off`);
        await page.locator(personToggle).check();
      }
      if (weather === 'rain') {
        const canvas = page.locator(`${artwork} canvas.rain-motion`);
        assert.equal(await page.locator('.rain-controls').isVisible(), true, `${sceneId}/${viewport}: rain controls`);
        assert.equal(await page.locator(`${artwork} img[data-scene="${sceneId}"][data-rain-effect]:not([hidden])`).count(), 2, `${sceneId}/${viewport}: static rain effects`);
        await page.waitForFunction(selector => !document.querySelector(selector)?.hidden, `${artwork} canvas.rain-motion`);
        assert.ok((await canvas.getAttribute('data-mask-url'))?.includes('rain-visibility-alpha'), `${sceneId}/${viewport}: mask missing`);
        const leak = await canvas.evaluate(async element => {
          const mask = new Image();
          mask.src = element.dataset.maskUrl;
          await mask.decode();
          const probe = document.createElement('canvas');
          probe.width = element.width;
          probe.height = element.height;
          const maskContext = probe.getContext('2d');
          maskContext.drawImage(mask, 0, 0, probe.width, probe.height);
          const allowed = maskContext.getImageData(0, 0, probe.width, probe.height).data;
          const painted = element.getContext('2d').getImageData(0, 0, element.width, element.height).data;
          let outside = 0;
          let inside = 0;
          for (let index = 3; index < painted.length; index += 4) {
            if (painted[index] > 0) inside++;
            if (painted[index] > 0 && allowed[index] === 0) outside++;
          }
          return { outside, inside };
        });
        assert.equal(leak.outside, 0, `${sceneId}/${viewport}: animated rain escapes mask`);
        assert.ok(leak.inside > 100, `${sceneId}/${viewport}: animated rain not painted`);
        await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        await page.screenshot({ path: join(output, `${short}-${viewport}-normal.png`), fullPage: true });
        await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
        for (const type of ['outdoor', 'glass']) await page.locator(`[data-rain-amount="${type}"]`).fill('0');
        assert.equal(await page.locator(`${artwork} img[data-scene="${sceneId}"][data-rain-effect]:not([hidden])`).count(), 0, `${sceneId}/${viewport}: zero static effect`);
        assert.equal(await canvas.evaluate(element => element.hidden), true, `${sceneId}/${viewport}: zero animation`);
        for (const type of ['outdoor', 'glass']) await page.locator(`[data-rain-amount="${type}"]`).fill('200');
        assert.equal(await page.locator(`${artwork} img[data-scene="${sceneId}"][data-rain-effect]:not([hidden])`).count(), 2, `${sceneId}/${viewport}: maximum static effect`);
        await page.waitForFunction(selector => !document.querySelector(selector)?.hidden, `${artwork} canvas.rain-motion`);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(selector => document.querySelector(selector)?.hidden, `${artwork} canvas.rain-motion`);
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.waitForFunction(selector => !document.querySelector(selector)?.hidden, `${artwork} canvas.rain-motion`);
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
        assert.equal(await canvas.evaluate(element => element.hidden), true, `${sceneId}/${viewport}: hidden tab animation continued`);
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
        await page.waitForFunction(selector => !document.querySelector(selector)?.hidden, `${artwork} canvas.rain-motion`);
      } else {
        assert.equal(await page.locator('.rain-controls').isVisible(), false, `${sceneId}/${viewport}: rain controls visible`);
        assert.equal(await page.locator(`${artwork} canvas.rain-motion`).evaluate(element => element.hidden), true, `${sceneId}/${viewport}: rain animation visible`);
      }
      await page.locator('.scene-settings summary').evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      await page.screenshot({ path: join(output, `${short}-${viewport}.png`), fullPage: true });
      if (viewport === 'sp-small' || viewport === 'sp-tablet') {
        await page.locator('.scene-nav').scrollIntoViewIfNeeded();
        const nav = await page.locator('.scene-nav').boundingBox();
        assert.ok(nav.y >= 0 && nav.y + nav.height <= height, `${sceneId}/${viewport}: menu unreachable`);
      }
      assert.deepEqual(pageErrors, [], `${sceneId}/${viewport}: browser errors`);
      await page.close();
    }
  }
} finally { await browser.close(); }
console.log(`${scenes.length} PC/SP spring weather scenes across six viewports passed. Screenshots: ${output}`);

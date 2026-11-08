import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const output = fileURLToPath(new URL('../artifacts/spring-day-shared-rin-v6/', import.meta.url));
const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4512/';
await mkdir(output, { recursive: true });
const viewports = [
  ['pc-standard', 1440, 900, false], ['pc-wide', 1920, 1080, false],
  ['sp-phone', 393, 852, true], ['sp-tablet', 768, 1024, true],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  for (const [name, width, height, sp] of viewports) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const panel = page.locator('.scene-settings summary');
    await panel.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    await page.locator('select[name="mode"]').selectOption('manual');
    await page.locator('select[name="season"]').selectOption('spring');
    await page.locator('select[name="period"]').selectOption('day');
    await page.locator('select[name="weather"]').selectOption('sunny');
    const art = page.locator(sp ? '.mobile-artwork' : '.pc-artwork');
    await page.waitForFunction(selector => document.querySelector(selector)?.dataset.activeScene === 'spring-day-sunny', sp ? '.mobile-artwork' : '.pc-artwork');
    const attr = sp ? 'data-sp-toggle' : 'data-layer-toggle';
    for (const key of ['rin', 'cup', 'plant'])
      assert.equal(await page.locator(`[${attr}="${key}"]`).isDisabled(), false, `${name}: ${key} disabled`);
    const person = art.locator(sp ? 'img[data-scene="spring-day-sunny"][data-layer="08-rin-notebook.png"]' : 'img[data-layer="rin-pc-transparent-v6.png"]');
    assert.equal(await person.count(), 1, `${name}: v6 person missing`);
    assert.match(await person.getAttribute('src'), sp ? /rin-sp-transparent/ : /rin-pc-transparent/, `${name}: wrong person source`);
    if (!sp) {
      assert.equal(await art.locator('img[data-layer="10-cup-off-sp-refine.png"]').count(), 0, `${name}: old repair remains`);
      assert.equal(await art.locator('img.pc-rin').count(), 0, `${name}: old person remains`);
    }
    for (const rin of [true, false]) for (const cup of [true, false]) for (const plant of [true, false]) {
      for (const [key, checked] of Object.entries({ rin, cup, plant })) await page.locator(`[${attr}="${key}"]`).setChecked(checked);
      assert.equal(await person.isVisible(), rin, `${name}: person rin=${rin} cup=${cup} plant=${plant}`);
      if (sp) {
        const under = art.locator('img[data-scene="spring-day-sunny"][data-layer="07-rin-occluded-underpaint.png"]');
        assert.equal(await under.isVisible(), rin && cup, `${name}: person/cup underpaint`);
        for (const [group, on] of [['cup', cup], ['plant', plant]])
          assert.equal(await art.locator(`img[data-scene="spring-day-sunny"][data-sp-group="${group}"]:not([hidden])`).count() > 0, on, `${name}: ${group}`);
      } else {
        assert.equal(await art.locator('img[data-layer="pc-contact-shadow-v6.png"]').isVisible(), rin, `${name}: shadow`);
        assert.equal(await art.locator('img[data-layer="02a-cup-off-sill-clean.png"]').isVisible(), !cup, `${name}: cup removal`);
        assert.equal(await art.locator('img[data-layer="plant-off-repair.png"]').isVisible(), !plant, `${name}: plant removal`);
        assert.equal(await art.locator('img[data-scene="spring-day-sunny"][data-control="cup"]').isVisible(), cup, `${name}: cup foreground`);
      }
      const visible = art.locator('img[data-scene="spring-day-sunny"]:not([hidden])');
      await visible.evaluateAll(images => Promise.all(images.map(image => image.decode())));
      const box = await art.boundingBox();
      const rects = await visible.evaluateAll(images => images.map(image => { const b = image.getBoundingClientRect(); return { layer: image.dataset.layer, rect: [b.x,b.y,b.width,b.height] }; }));
      const moved = sp ? ['08-rin-notebook.png'] : ['rin-pc-transparent-v6.png', 'pc-contact-shadow-v6.png'];
      const shift = box.height * (sp ? 11 / 2400 : 8 / 1170);
      assert.ok(rects.every(({layer,rect}) => rect.every((value, i) => Math.abs(value - [box.x, box.y + (moved.includes(layer) ? shift : 0), box.width, box.height][i]) < .1)), `${name}: registration and approved placement`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: horizontal overflow`);
      await panel.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
      const state = `rin-${rin?'on':'off'}-cup-${cup?'on':'off'}-plant-${plant?'on':'off'}`;
      await page.screenshot({ path: join(output, `${name}-${state}.png`), fullPage: true });
      if (rin && plant) {
        const image = await art.screenshot();
        const ratio = (await sharp(image).metadata()).width / (sp ? 1024 : 1345);
        const rect = sp ? {left:530,top:1540,width:315,height:150} : {left:920,top:675,width:410,height:135};
        await sharp(image).extract(Object.fromEntries(Object.entries(rect).map(([k,v])=>[k,Math.round(v*ratio)]))).png().toFile(join(output, `${name}-${state}-feet.png`));
      }
      await panel.evaluate(element => { if (element instanceof HTMLElement) element.click(); });
    }
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.close();
  }
} finally { await browser.close(); }
console.log('Spring day shared Rin v6: 8 states x 4 PC/SP viewports passed; screenshots: ' + output);

import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4508';
const root = fileURLToPath(new URL('..', import.meta.url));
const sourceRoot = '/Users/saekitakuya/Documents/ChatGPT/ポートフォリオ/design-proposals';
const out = join(root, 'artifacts/night-pose-v2');
await mkdir(out, { recursive: true });
const scenes = [
  { variant: 'pc', state: 'awake', id: 'spring-night-sunny-awake', count: 6, width: 1345, height: 1170 },
  { variant: 'pc', state: 'asleep', id: 'spring-night-sunny-asleep', count: 4, width: 1345, height: 1170 },
  { variant: 'sp', state: 'awake', id: 'spring-night-sunny-awake', count: 10, width: 1024, height: 1997 },
  { variant: 'sp', state: 'asleep', id: 'spring-night-sunny-asleep', count: 8, width: 1024, height: 1997 },
];
const lightPixels = {};
for (const scene of scenes) {
  const folder = `${scene.variant}-spring-night-${scene.state}${scene.state === 'awake' ? '-pose-layers-v2' : '-layers-v1'}`;
  const asset = join(root, 'src/assets/validation', folder);
  const source = join(sourceRoot, folder);
  const manifest = JSON.parse(await readFile(join(asset, 'manifest.json'), 'utf8'));
  assert.equal(manifest.width, scene.width);
  assert.equal(manifest.height, scene.height);
  assert.equal(manifest.layersBottomToTop.length, scene.count);
  assert.equal(manifest.layersBottomToTop[1], '01a-city-lights.png');
  if (scene.state === 'asleep') assert.ok(manifest.layersBottomToTop.every(name => !/rin|contact-shadow|person-edge/.test(name)), `${folder}: person layer remains`);
  for (const name of manifest.layersBottomToTop) {
    const original = await readFile(join(source, name));
    const copy = await readFile(join(asset, name));
    assert.equal(createHash('sha256').update(copy).digest('hex'), createHash('sha256').update(original).digest('hex'), `${folder}/${name}`);
    const info = await sharp(copy).metadata();
    assert.equal(info.width, scene.width);
    assert.equal(info.height, scene.height);
    assert.equal(info.hasAlpha, true);
    if (scene.state === 'awake' && !manifest.toggleGroups.rin.includes(name)) {
      const previous = await readFile(join(sourceRoot, `${scene.variant}-spring-night-awake-layers-v1`, name));
      assert.equal(createHash('sha256').update(copy).digest('hex'), createHash('sha256').update(previous).digest('hex'), `${folder}/${name}: background changed`);
    }
  }
  const previews = scene.state === 'awake' ? [['all', []], ['withoutRin', manifest.toggleGroups.rin]] : [['all', []]];
  for (const [key, removed] of previews) {
    const layers = manifest.layersBottomToTop.filter(name => !removed.includes(name));
    const composite = await sharp({create:{width:scene.width,height:scene.height,channels:4,background:{r:0,g:0,b:0,alpha:0}}})
      .composite(layers.map(name => ({input:join(asset,name)}))).ensureAlpha().raw().toBuffer();
    const reference = await sharp(join(source,manifest.previews[key])).ensureAlpha().raw().toBuffer();
    let max = 0;
    for (let i = 0; i < composite.length; i++) max = Math.max(max, Math.abs(composite[i] - reference[i]));
    assert.ok(max <= 1, `${folder}/${key}: reference difference ${max}`);
  }
  const {data} = await sharp(join(asset,'01a-city-lights.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let pixels = 0;
  for(let i=3;i<data.length;i+=4) if(data[i]) pixels++;
  lightPixels[`${scene.variant}-${scene.state}`] = pixels;
}
assert.equal(lightPixels['pc-awake'], 10072);
assert.equal(lightPixels['pc-asleep'], 585);
assert.equal(lightPixels['sp-awake'], 19401);
assert.equal(lightPixels['sp-asleep'], 1916);

const cases = [
  {name:'pc-standard',width:1440,height:900,variant:'pc'},
  {name:'pc-wide',width:1920,height:1080,variant:'pc'},
  {name:'pc-near-square',width:1024,height:821,variant:'pc'},
  {name:'sp-standard',width:390,height:844,variant:'sp'},
  {name:'sp-tall',width:430,height:932,variant:'sp'},
  {name:'sp-tablet',width:768,height:1024,variant:'sp'},
];
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
  for(const view of cases) for(const state of ['awake','asleep']) {
    const scene = scenes.find(item => item.variant === view.variant && item.state === state);
    const page = await browser.newPage({viewport:{width:view.width,height:view.height},deviceScaleFactor:1});
    await page.clock.install({time:new Date(state === 'awake' ? '2026-10-11T11:30:00Z' : '2026-10-11T14:30:00Z')}); // Tokyo 20:30 / 23:30
    await page.goto(base);
    const selector = view.variant === 'pc' ? '.pc-artwork' : '.mobile-artwork';
    const art = page.locator(selector);
    await page.waitForFunction(([selector,id]) => document.querySelector(selector)?.dataset.activeScene === id, [selector,scene.id]);
    const layers = art.locator(`img[data-scene="${scene.id}"]`);
    assert.equal(await layers.count(),scene.count);
    assert.equal(await layers.evaluateAll(images => images.filter(image => image.hidden).length),0);
    await layers.evaluateAll(images => Promise.all(images.map(image => image.decode())));
    const bounds = await layers.evaluateAll(images => images.map(image => {
      const rect=image.getBoundingClientRect();return [rect.x,rect.y,rect.width,rect.height];
    }));
    assert.ok(bounds.every(rect => rect.every((n,i) => Math.abs(n-bounds[0][i])<.02)),`${view.name}-${state}: layer alignment`);
    assert.equal(await page.locator('.scene-logo').evaluate(el => getComputedStyle(el).color),'rgb(240, 238, 233)',`${view.name}-${state}: night logo color`);
    await page.screenshot({path:join(out,`${view.name}-${state}.png`),fullPage:true});
    if(state === 'awake' && (view.name === 'pc-standard' || view.name === 'sp-standard')) {
      await page.locator('.scene-settings summary').click();
      const toggle = view.variant === 'pc' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]';
      await page.locator(toggle).uncheck();
      assert.equal(await art.locator(`img[data-scene="${scene.id}"][${view.variant === 'pc' ? 'data-control' : 'data-sp-group'}="rin"]:not([hidden])`).count(),0);
      if (view.variant === 'pc') assert.equal(await art.locator(`img[data-scene="${scene.id}"][data-layer="05-cup-foreground.png"]:not([hidden])`).count(),1);
      else assert.equal(await art.locator(`img[data-scene="${scene.id}"][data-sp-group="cup"]:not([hidden])`).count(),3);
      await page.locator('.scene-settings summary').click();
      await page.screenshot({path:join(out,`${view.name}-no-rin.png`),fullPage:true});
    }
    if(state === 'asleep') {
      await page.locator('.scene-settings summary').click();
      assert.equal(await page.locator(view.variant === 'pc' ? '[data-layer-toggle="rin"]' : '[data-sp-toggle="rin"]').isDisabled(),true);
    }
    await page.close();
  }
} finally { await browser.close(); }
console.log(`Night pose v2 PC/SP layered scenes, unchanged backgrounds, previews, city-light reduction, 12 viewports, person controls: passed. Screenshots: ${out}`);

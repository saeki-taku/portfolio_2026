import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4501';
const sourceDir = new URL('../src/assets/validation/pc-day-layers-v2/', import.meta.url);
const deliveryDir = new URL('../../../../../Documents/ChatGPT/ポートフォリオ/design-proposals/pc-day-layers-v2/', import.meta.url);
const originalPath = new URL('../src/assets/scenes/rin-desktop-corner-soft-v4.png', import.meta.url);
const output = new URL('../artifacts/pc-day-layers-v2/', import.meta.url);
await mkdir(output, { recursive: true });
const filepath = name => fileURLToPath(new URL(name, output));
const manifest = JSON.parse(await readFile(new URL('manifest.json', sourceDir), 'utf8'));
const readLayer = name => readFile(new URL(name, sourceDir));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.deepEqual(manifest.order, ['01-exterior.png','02-interior.png','04-contact-shadow.png','03-rin.png','05-cup-foreground.png','06-person-edge-restore.png']);
assert.deepEqual(manifest.hidePerson, ['03-rin.png','04-contact-shadow.png','06-person-edge-restore.png']);
const original = await readFile(originalPath);
assert.equal(hash(original), manifest.sourceSha256);
const report = { files: {}, manifest: { changedPixels: manifest.compositeChangedPixels, meanDifference: manifest.meanAbsoluteChannelDifference }, views: {}, screenshots: [] };
for (const name of manifest.order) {
  const bytes = await readLayer(name);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.width, 1345); assert.equal(metadata.height, 1170); assert.equal(metadata.hasAlpha, true);
  assert.equal(hash(bytes), hash(await readFile(new URL(name, deliveryDir))));
  report.files[name] = hash(bytes);
}
const reference = async names => sharp({ create: { width: 1345, height: 1170, channels: 4, background: '#fff' } })
  .composite(await Promise.all(names.map(async name => ({ input: await readLayer(name), left: 0, top: 0 }))))
  .png().toBuffer();
const raw = bytes => sharp(bytes).removeAlpha().raw().toBuffer();
async function difference(a, b) {
  const [left,right] = await Promise.all([raw(a),raw(b)]);
  assert.equal(left.length,right.length);
  let changedPixels = 0, total = 0, maximum = 0;
  for (let i=0;i<left.length;i+=3) {
    let changed=false;
    for (let c=0;c<3;c++) { const d=Math.abs(left[i+c]-right[i+c]); changed ||= d>0; total+=d; maximum=Math.max(maximum,d); }
    if (changed) changedPixels++;
  }
  return { changedPixels, maximum, meanAbsoluteChannelDifference: total / left.length };
}
const complete = await reference(manifest.order);
const noPerson = await reference(manifest.order.filter(name => !manifest.hidePerson.includes(name)));
const suppliedComposite = await readFile(new URL('preview-composite.png', deliveryDir));
const suppliedBackground = await readFile(new URL('preview-background.png', deliveryDir));
report.views.sourceVsComposite = await difference(original, complete);
assert.equal(report.views.sourceVsComposite.changedPixels, manifest.compositeChangedPixels);
assert.ok(Math.abs(report.views.sourceVsComposite.meanAbsoluteChannelDifference - manifest.meanAbsoluteChannelDifference) < 1e-10);
report.views.suppliedComposite = await difference(suppliedComposite, complete);
report.views.suppliedBackground = await difference(suppliedBackground, noPerson);
assert.equal(report.views.suppliedComposite.changedPixels, 0);
assert.equal(report.views.suppliedBackground.changedPixels, 0);
const browser = await chromium.launch({ channel:'chrome', headless:true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 1 });
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  assert.equal((await page.goto(`${base}/dev/pc-day-layers-v2/`)).status(),200);
  await page.locator('.painting img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  const order = await page.locator('#composite img').evaluateAll(images=>images.map(img=>img.dataset.layer));
  assert.deepEqual(order,['exterior','interior','shadow','rin','cup','edge']);
  const geometry = await page.locator('#composite img').evaluateAll(images=>images.map(img=>{
    const r=img.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height};
  }));
  assert.ok(geometry.every(box=>JSON.stringify(box)===JSON.stringify(geometry[0])));
  await page.locator('#size').selectOption('native');
  await page.locator('#background').selectOption('white');
  const capture = async name => {
    const box=await page.locator('.painting').boundingBox();
    const scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
    return page.screenshot({path:filepath(name),clip:{x:Math.round(box.x+scroll.x),y:Math.round(box.y+scroll.y),width:1345,height:1170}});
  };
  report.views.browserComposite = await difference(suppliedComposite,await capture('composite.png'));
  assert.ok(report.views.browserComposite.maximum<=1);
  await page.getByRole('radio',{name:'採用原本'}).check();
  report.views.browserOriginal = await difference(original,await capture('original.png'));
  assert.equal(report.views.browserOriginal.changedPixels,0);
  await page.getByRole('radio',{name:'レイヤー合成'}).check();
  await page.locator('#person').uncheck();
  for (const name of ['rin','shadow','edge']) assert.equal(await page.locator(`[data-layer="${name}"]`).isVisible(),false);
  for (const name of ['exterior','interior','cup']) assert.equal(await page.locator(`[data-layer="${name}"]`).isVisible(),true);
  report.views.browserNoPerson = await difference(suppliedBackground,await capture('no-person.png'));
  assert.equal(report.views.browserNoPerson.changedPixels,0);
  await page.locator('[data-toggle="edge"]').check();
  assert.equal(await page.locator('#person').evaluate(el=>el.indeterminate),true);
  await page.locator('#person').check();
  for (const name of ['rin','shadow','edge']) assert.equal(await page.locator(`[data-toggle="${name}"]`).isChecked(),true);
  await page.goto(`${base}/dev/pc-day-scene-v2/`);
  await page.locator('.pc-artwork img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  for (const [name,width,height] of [['wide',1920,1080],['desktop',1440,900],['tablet-landscape',1180,820],['near-square-pc',1024,900]]) {
    await page.setViewportSize({width,height});
    await page.goto(`${base}/dev/pc-day-scene-v2/`);
    await page.locator('.pc-artwork img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    const rects=await page.locator('.pc-artwork img:not([hidden])').evaluateAll(images=>images.map(img=>{
      const r=img.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};
    }));
    assert.equal(rects.length,6);
    assert.ok(rects.every(rect=>JSON.stringify(rect)===JSON.stringify(rects[0])),`${name}: unequal layer geometry`);
    assert.ok(Math.abs(rects[0].width/rects[0].height-1345/1170)<.001);
    assert.equal(await page.locator('.mobile-artwork').isVisible(),false);
    assert.ok(await page.locator('.scene-logo').isVisible());
    assert.ok(await page.locator('.scene-nav').isVisible());
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:filepath(`scene-${name}.png`),fullPage:true});
    report.screenshots.push({name,width,height,layerRect:rects[0]});
    await page.getByRole('button',{name:'採用原本'}).click();
    const originalRect=await page.locator('.pc-original').evaluate(img=>{const r=img.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
    assert.deepEqual(originalRect,rects[0]);
    await page.locator('#show-person').isDisabled().then(value=>assert.equal(value,true));
    await page.getByRole('button',{name:'v2合成'}).click();
    await page.locator('#show-person').uncheck();
    for (const id of ['rin','shadow','edge']) assert.equal(await page.locator(`.pc-artwork [data-layer="${id}"]`).isVisible(),false);
    assert.equal(await page.locator('.pc-artwork [data-layer="cup"]').isVisible(),true);
  }
  await page.setViewportSize({width:768,height:1024});
  await page.goto(`${base}/dev/pc-day-scene-v2/`);
  assert.equal(await page.locator('.pc-artwork').isVisible(),false);
  assert.equal(await page.locator('.mobile-artwork').isVisible(),true);
  assert.equal(await page.locator('.mobile-artwork img').evaluate(img=>img.naturalWidth),1024);
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
await writeFile(new URL('verification.json',output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

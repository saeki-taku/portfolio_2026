import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from '@playwright/test';

const base = process.env.ENNUI_TEST_URL || 'http://127.0.0.1:4502';
const sourceDir = new URL('../src/assets/validation/pc-day-redraw-v1/', import.meta.url);
const deliveryDir = new URL('../../../../../Documents/ChatGPT/ポートフォリオ/design-proposals/', import.meta.url);
const output = new URL('../artifacts/pc-day-redraw/', import.meta.url);
await mkdir(output, { recursive: true });
const target = name => fileURLToPath(new URL(name, output));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const names = ['01-exterior.png', '02-interior.png', 'rin-redraw-transparent-v1.png', '05-cup-foreground.png'];
const report = { source: {}, sourceSpace: {}, screens: [], checks: [] };
for (const name of names) {
  const local = await readFile(new URL(name, sourceDir));
  const original = await readFile(new URL(name === 'rin-redraw-transparent-v1.png' ? name : `pc-day-layers-v4/${name}`, deliveryDir));
  assert.equal(hash(local), hash(original));
  const meta = await sharp(local).metadata();
  assert.deepEqual([meta.width, meta.height], name === 'rin-redraw-transparent-v1.png' ? [1324, 1188] : [1345, 1170]);
  report.source[name] = hash(local);
}
const figure = await sharp(await readFile(new URL('rin-redraw-transparent-v1.png', sourceDir))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
let minX=1324,minY=1188,maxX=0,maxY=0;
for (let y=0;y<1188;y++) for (let x=0;x<1324;x++) {
  if (figure.data[(y*1324+x)*4+3] > 10) {
    minX=Math.min(minX,x); maxX=Math.max(maxX,x); minY=Math.min(minY,y); maxY=Math.max(maxY,y);
  }
}
const left=1345*.6991, top=1170*.3893, scale=1345*.2633/1324;
report.sourceSpace = { sourceAlphaBounds:[minX,minY,maxX,maxY], imageRect:[left,top,1324*scale,1188*scale], placedAlphaBounds:[left+minX*scale,top+minY*scale,left+maxX*scale,top+maxY*scale] };
assert.ok(report.sourceSpace.placedAlphaBounds[0] > 940 && report.sourceSpace.placedAlphaBounds[0] < 955);
assert.ok(report.sourceSpace.placedAlphaBounds[1] > 460 && report.sourceSpace.placedAlphaBounds[1] < 475);
assert.ok(report.sourceSpace.placedAlphaBounds[2] > 1280 && report.sourceSpace.placedAlphaBounds[2] < 1295);
assert.ok(report.sourceSpace.placedAlphaBounds[3] > 755 && report.sourceSpace.placedAlphaBounds[3] < 780);
const background = await sharp({create:{width:1345,height:1170,channels:4,background:'#fff'}}).composite(await Promise.all(['01-exterior.png','02-interior.png','05-cup-foreground.png'].map(async name=>({input:await readFile(new URL(name,sourceDir)),left:0,top:0})))).png().toBuffer();
const rgb = bytes => sharp(bytes).removeAlpha().raw().toBuffer();
async function compare(a,b) {
  const [aa,bb]=await Promise.all([rgb(a),rgb(b)]); assert.equal(aa.length,bb.length);
  let changed=0,max=0;
  for(let i=0;i<aa.length;i+=3) {
    const d=Math.max(Math.abs(aa[i]-bb[i]),Math.abs(aa[i+1]-bb[i+1]),Math.abs(aa[i+2]-bb[i+2]));
    if(d)changed++; max=Math.max(max,d);
  }
  return {changedPixels:changed,maxChannelDifference:max};
}
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1700},deviceScaleFactor:1});
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  let response=await page.goto(`${base}/dev/pc-day-redraw/`); assert.equal(response.status(),200);
  await page.locator('.painting img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  assert.deepEqual(await page.locator('#composite img').evaluateAll(images=>images.map(img=>img.dataset.layer)),['exterior','interior','redraw','cup']);
  for (const img of await page.locator('#composite img').all()) {
    const src=await img.getAttribute('src');
    const served=await page.request.get(new URL(src,base).href);
    assert.equal(served.status(),200);
    assert.ok(Object.values(report.source).includes(hash(await served.body())));
  }
  await page.locator('#size').selectOption('native');
  await page.locator('#background').selectOption('white');
  const capture = async name => {
    const box=await page.locator('.painting').boundingBox();
    const scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
    return page.screenshot({path:target(name),clip:{x:Math.round(box.x+scroll.x),y:Math.round(box.y+scroll.y),width:1345,height:1170}});
  };
  await capture('composite.png');
  await page.locator('#person').uncheck();
  assert.equal(await page.locator('[data-layer="redraw"]').isVisible(),false);
  for(const id of ['exterior','interior','cup'])assert.equal(await page.locator(`[data-layer="${id}"]`).isVisible(),true);
  report.backgroundPixels=await compare(background,await capture('no-person.png'));
  assert.equal(report.backgroundPixels.changedPixels,0);
  await page.getByRole('radio',{name:'採用原本'}).check();
  await capture('original.png');
  await page.goto(`${base}/dev/pc-day-scene-redraw/`);
  for(const [name,width,height] of [['wide',1920,1080],['desktop',1440,900],['tablet-landscape',1180,820],['near-square',1024,900]]) {
    await page.setViewportSize({width,height});
    await page.goto(`${base}/dev/pc-day-scene-redraw/`);
    await page.locator('.pc-artwork img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
    const rects=await page.locator('.pc-artwork img:not([hidden])').evaluateAll(images=>images.map(img=>{const r=img.getBoundingClientRect();return {id:img.dataset.layer,x:r.x,y:r.y,width:r.width,height:r.height};}));
    assert.deepEqual(rects.map(x=>x.id),['exterior','interior','redraw','cup']);
    for(const id of ['interior','cup']) assert.deepEqual(rects.find(r=>r.id===id),{...rects[0],id});
    const ratio=rects[0].width/1345;
    const figureRect=rects.find(r=>r.id==='redraw');
    assert.ok(Math.abs((figureRect.x-rects[0].x)/ratio-left)<.03);
    assert.ok(Math.abs((figureRect.y-rects[0].y)/ratio-top)<.03);
    assert.ok(Math.abs(figureRect.width/ratio-1324*scale)<.03);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok(await page.locator('.scene-logo').isVisible());
    assert.ok(await page.locator('.scene-nav').isVisible());
    await page.screenshot({path:target(`scene-${name}.png`),fullPage:true});
    report.screens.push({name,width,height,figureRect});
    await page.locator('#show-person').uncheck();
    assert.equal(await page.locator('.pc-artwork [data-layer="redraw"]').isVisible(),false);
    assert.equal(await page.locator('.pc-artwork [data-layer="cup"]').isVisible(),true);
  }
  await page.setViewportSize({width:768,height:1024});
  await page.goto(`${base}/dev/pc-day-scene-redraw/`);
  assert.equal(await page.locator('.pc-artwork').isVisible(),false);
  assert.equal(await page.locator('.mobile-artwork').isVisible(),true);
  await page.locator('.mobile-artwork img').evaluate(img=>img.decode());
  assert.deepEqual(errors,[]);
  report.checks=['Source files unchanged by hash','Only v4 exterior/interior/cup and new Rin in redraw DOM','New Rin placed in original scene coordinate space','Person off retains cup and matches 01+02+05 exactly','PC widths 1920/1440/1180/1024 share proportional placement','SP retains approved mobile artwork','No browser runtime errors'];
} finally { await browser.close(); }
await writeFile(new URL('verification.json',output),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

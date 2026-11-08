import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import sharp from 'sharp';
const out='artifacts/spring-day-pc-contact-forward';await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const [name,width,height,sp] of [['pc-standard',1440,900,false],['pc-wide',1920,1080,false],['sp-phone',393,852,true]]){
const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4512/',{waitUntil:'networkidle'});
await page.locator('.scene-settings summary').click();for(const [key,value] of Object.entries({mode:'manual',season:'spring',period:'day',weather:'sunny'}))await page.locator(`select[name="${key}"]`).selectOption(value);
const art=page.locator(sp?'.mobile-artwork':'.pc-artwork');const attr=sp?'data-sp-toggle':'data-layer-toggle';
for(const cup of [false,true]){await page.locator(`[${attr}="cup"]`).setChecked(cup);await page.locator('.scene-settings summary').click();const captures=[];
for(const [label,offset]of [['before',8],['after',14]]){
const style=await page.addStyleTag({content:`.pc-artwork img[data-layer="rin-pc-hem-cleaned.png"], .pc-artwork img[data-layer="pc-contact-shadow-v6.png"] {transform:translateY(${offset/1170*100}%) !important}`});
await art.locator('img:not([hidden])').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
await page.screenshot({path:`${out}/${name}-cup-${cup?'on':'off'}-${label}.png`,fullPage:true});const buf=await art.screenshot();captures.push(buf);
const ratio=(await sharp(buf).metadata()).width/(sp?1024:1345);const r=sp?{left:530,top:1540,width:315,height:150}:{left:920,top:675,width:410,height:135};await sharp(buf).extract(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Math.round(v*ratio)]))).png().toFile(`${out}/${name}-cup-${cup?'on':'off'}-${label}-feet.png`);
await style.evaluate(el=>el.remove());}
if(sp)assert.ok(captures[0].equals(captures[1]),'SP unchanged');await page.locator('.scene-settings summary').click();}
for(const rin of [false,true])for(const cup of [false,true]){await page.locator(`[${attr}="rin"]`).setChecked(rin);await page.locator(`[${attr}="cup"]`).setChecked(cup);const person=art.locator(sp?'img[data-scene="spring-day-sunny"][data-layer="08-rin-notebook.png"]':'img[data-layer="rin-pc-hem-cleaned.png"]');assert.equal(await person.isVisible(),rin);if(!sp)assert.equal(await art.locator('img[data-layer="pc-contact-shadow-v6.png"]').isVisible(),rin);}
assert.deepEqual(errors,[]);await page.close();}}finally{await browser.close();}console.log('PC 2 viewports × before/after × cup on/off; figure toggles and SP pixel equality passed.');

import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];
try {
for(const weather of ['rain','snow']){
 const p=await browser.newPage({viewport:{width:390,height:844}});let release;
 const gate=new Promise(r=>release=r);
 await p.route('**/src/pages/index.astro?astro&type=script*',async route=>{await gate;await route.continue();});
 await p.goto('http://127.0.0.1:4512/',{waitUntil:'commit'});
 await p.waitForFunction(()=>document.querySelector('.scene-status')?.textContent?.includes('表示中'));
 assert.notEqual(await p.locator('.scene').getAttribute('data-render-ready'),'true');
 await p.locator('.scene-settings summary').click();
 for(const[k,v]of Object.entries({mode:'manual',season:'winter',period:'dawn',weather}))await p.locator(`select[name="${k}"]`).selectOption(v);
 assert.equal(await p.locator('.scene').getAttribute('data-active-scene'),`winter-dawn-${weather}`);
 release();await p.waitForFunction(()=>document.querySelector('.scene')?.dataset.renderReady==='true');
 await p.waitForFunction(()=>!document.querySelector('.mobile-artwork canvas').hidden);
 const r=await p.evaluate(()=>{const el=document.querySelector('.mobile-artwork'),r=el.getBoundingClientRect();return{scene:document.querySelector('.scene').dataset.activeScene,width:r.width,height:r.height,layout:document.querySelector('.scene').getBoundingClientRect().height,canvas:!el.querySelector('canvas').hidden};});
 assert.equal(r.scene,`winter-dawn-${weather}`);assert.ok(Math.abs(r.height/r.width-2400/1024)<.01);assert.ok(r.layout>=844);assert.ok(r.canvas);
 await p.locator('.mobile-artwork img:not([hidden])').evaluateAll(a=>Promise.all(a.map(i=>i.decode())));await p.locator('.scene-settings summary').click();await p.screenshot({path:`artifacts/winter-weather/early-selection-${weather}.png`});results.push({weather,...r});await p.close();
}
await fs.writeFile('artifacts/winter-weather/early-selection-audit.json',JSON.stringify(results,null,2));console.log('2 delayed-render initialization / early selection cases passed');
}finally{await browser.close();}

import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
const data=JSON.parse(await readFile('src/assets/scenes/vertical-extension-v1.json','utf8'));
for(const item of data){
 const kind=item.variant==='pc'?'desktop':'mobile';
 const old=`src/assets/scenes/rin-${kind}-approved-${kind==='desktop'?'v8':'v3'}-20260927.png`;
 const {x:left,y:top,width,height}=item.sourceRect;
 const crop=await sharp(`src/assets/scenes/rin-${kind}-vertical-extended-v1.png`).extract({left,top,width,height}).removeAlpha().raw().toBuffer();
 assert.deepEqual(crop,await sharp(old).removeAlpha().raw().toBuffer());
 console.log(kind+': source rectangle pixels identical');
}
const b=await chromium.launch({channel:'chrome'});
try {for(const [width,height] of [[1533,1026],[1024,1536],[1440,900],[1024,821],[375,667],[430,932],[320,568]]){
 const p=await b.newPage({viewport:{width,height}});
 await p.goto(process.env.ENNUI_TEST_URL||'http://127.0.0.1:4499');
 await p.locator('.scene img').evaluate(i=>i.decode());
 const r=await p.evaluate(()=>{const a=document.querySelector('.scene img').getBoundingClientRect(),s=document.querySelector('.scene').getBoundingClientRect();return {x:a.x,y:a.y,w:a.width,h:a.height,sh:s.height};});
 const d=data[width<=height?1:0],scale=width/d.sourceRect.width;
 const extra=Math.max(0,r.sh-d.sourceRect.height*scale);
 const reveal=Math.min(d.padding.top*scale,extra*d.padding.top/(d.padding.top+d.padding.bottom));
 assert.ok(Math.abs(r.w-width)<.1,'full width');
 assert.ok(Math.abs(r.h-d.canvas.height*scale)<.1,'uniform scale');
 assert.ok(Math.abs(r.y+d.sourceRect.y*scale-reveal)<.1,'source position');
 assert.ok(reveal+d.sourceRect.height*scale<=r.sh+.1,'complete source visible');
 const requests=await p.evaluate(()=>performance.getEntriesByType('resource').filter(e=>/rin-.*webp/.test(e.name)).length);
 assert.equal(requests,1,'only selected image loaded');
 console.log(`${width}x${height}: scale ${scale.toFixed(4)}, source top ${reveal.toFixed(2)}px, no source clipping`);
 await p.close();
}}finally{await b.close();}

import sharp from 'sharp';
// Keep the central painting intact; join decorative strips into a single raster.
for (const [kind,base,wall,floor,w,h,pad] of [
 ['desktop','rin-desktop-wood-floor-20260926.png','desktop-wall-soft-20260927.webp','desktop-floor-extension.webp',1672,941,330],
 ['mobile','rin-mobile-approved-20260926.png','mobile-wall-extension.webp','mobile-floor-extension.webp',1024,1536,400],
]) {
 const root='src/assets/scenes/';
 const core=await sharp(root+base).removeAlpha().raw().toBuffer();
 const strips=[];
 for(const [file,side] of [[wall,'top'],[floor,'bottom']]) {
  const data=await sharp(root+file).resize(w,pad).removeAlpha().raw().toBuffer();
  // Extend the original texture for a short transition, without touching the core.
  for(let y=0;y<8;y++) {
   const t=y/8, a=t*t*(3-2*t);
   const dst=side==='top'?pad-1-y:y;
   const src=side==='top'?0:h-1;
   for(let x=0;x<w*3;x++)data[dst*w*3+x]=Math.round(core[src*w*3+x]*(1-a)+data[dst*w*3+x]*a);
  }
  strips.push(await sharp(data,{raw:{width:w,height:pad,channels:3}}).png().toBuffer());
 }
 await sharp({create:{width:w,height:h+pad*2,channels:3,background:'#eee'}}).composite([{input:strips[0],top:0,left:0},{input:root+base,top:pad,left:0},{input:strips[1],top:pad+h,left:0}]).png().toFile(root+`rin-${kind}-room-unified-20260927.png`);
}

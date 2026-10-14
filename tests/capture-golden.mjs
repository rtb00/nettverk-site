// Referenz-Screenshots vom Original (https://nettverk.app, Flutter-Web).
// Flutter scrollt intern: pro Seite/Viewport werden Viewport-Screenshots in Schritten von einer Viewport-Höhe per Mausrad erzeugt.
// Ablage: tests/golden/<seite>-<viewport>-<NN>.png, Index in meta.json (Scroll-Offset je Frame).
import {chromium} from '@playwright/test';
import fs from 'node:fs'; import crypto from 'node:crypto';
import {routes,viewports} from './routes.mjs';
const base=process.argv[2]||'https://nettverk.app';
const wait=Number(process.env.WAIT||5000);
fs.mkdirSync('tests/golden',{recursive:true});
const meta={};
const hash=b=>crypto.createHash('md5').update(b).digest('hex');
const b=await chromium.launch();
for(const v of viewports) for(const r of routes){
  const p=await b.newPage({viewport:{width:v.width,height:v.height}});
  await p.goto(`${base}/#${r.hash}`,{waitUntil:'networkidle'}); await p.waitForTimeout(wait);
  await p.mouse.move(v.width/2,v.height/2);
  const frames=[]; let prev=null;
  for(let k=0;k<40;k++){
    const buf=await p.screenshot(); const h=hash(buf);
    if(h===prev) break;
    const n=String(k).padStart(2,'0');
    fs.writeFileSync(`tests/golden/${r.name}-${v.name}-${n}.png`,buf);
    frames.push({file:`${r.name}-${v.name}-${n}.png`,offset:k*v.height}); prev=h;
    await p.mouse.wheel(0,v.height); await p.waitForTimeout(1500);
  }
  meta[`${r.name}-${v.name}`]=frames; console.log(r.name,v.name,frames.length,'frames');
  await p.close();
}
fs.writeFileSync('tests/golden/meta.json',JSON.stringify(meta,null,1));
await b.close();

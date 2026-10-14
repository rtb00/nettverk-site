// Visueller Vergleich: lokaler Build (astro preview) gegen tests/golden (Original).
// Aufruf: npm run build && npm run test:visual   (startet `astro preview` selbst)
import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import fs from 'node:fs'; import {PNG} from 'pngjs'; import pixelmatch from 'pixelmatch';
import {routes,viewports} from './routes.mjs';
const PORT=4321, base=`http://localhost:${PORT}`;
const only=process.argv[2]; // optional Filter, z. B. "home-desktop"
const meta=JSON.parse(fs.readFileSync('tests/golden/meta.json','utf8'));
fs.mkdirSync('tests/out',{recursive:true});
const srv=spawn('npx',['astro','preview','--port',String(PORT)],{stdio:'ignore'});
for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break}catch{} await new Promise(r=>setTimeout(r,200));}
const b=await chromium.launch(); const rows=[];
for(const v of viewports) for(const r of routes){
  const key=`${r.name}-${v.name}`; if(only&&!key.includes(only)) continue;
  const ctx=await b.newContext({viewport:{width:v.width,height:v.height},reducedMotion:'reduce'});
  const p=await ctx.newPage();
  await p.goto(`${base}/${r.name==='home'?'':r.name+'/'}`,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
  let tot=0,diff=0; const per=[];
  for(const f of meta[key]){
    await p.evaluate(y=>window.scrollTo(0,y),f.offset); await p.waitForTimeout(150);
    const act=PNG.sync.read(await p.screenshot());
    const ref=PNG.sync.read(fs.readFileSync('tests/golden/'+f.file));
    const d=new PNG({width:ref.width,height:ref.height});
    const n=pixelmatch(ref.data,act.data,d.data,ref.width,ref.height,{threshold:0.1});
    const base_=f.file.replace('.png','');
    fs.writeFileSync(`tests/out/${base_}.actual.png`,PNG.sync.write(act));
    fs.writeFileSync(`tests/out/${base_}.diff.png`,PNG.sync.write(d));
    tot+=ref.width*ref.height; diff+=n; per.push((100*n/(ref.width*ref.height)).toFixed(1));
  }
  rows.push({key,frames:meta[key].length,pct:(100*diff/tot).toFixed(2),per:per.join(' ')});
  await ctx.close();
}
await b.close(); srv.kill();
console.log('Seite-Viewport | Frames | abweichende Pixel % | je Frame %');
for(const r of rows) console.log(r.key.padEnd(34),String(r.frames).padStart(3),r.pct.padStart(7),'  ',r.per);
fs.writeFileSync('tests/out/result.json',JSON.stringify(rows,null,1));

import {chromium}from'playwright-core';
import {createServer}from'node:http';
import {readFile,stat,writeFile,mkdir}from'node:fs/promises';
import path from'node:path';
import {pathToFileURL}from'node:url';
import assert from'node:assert/strict';
const root=path.resolve(process.env.WE_PROJECT),result=path.resolve(process.env.WE_QA_RESULTS),preview=process.env.WE_PREVIEW==='1';await mkdir(result,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.flac':'audio/flac','.otf':'font/otf','.ttf':'font/ttf'};
const server=createServer(async(req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);assert.ok(file.startsWith(root+path.sep)||file===root);const p=(await stat(file)).isDirectory()?path.join(file,'index.html'):file;res.writeHead(200,{'Content-Type':mime[path.extname(p)]??'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(p));}catch{res.writeHead(404);res.end();}});await new Promise(ok=>server.listen(4184,'127.0.0.1',ok));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const report={checks:[],errors:[],externalRequests:[],failedResources:[],fileURL:null};
const pageInit=()=>{
 const NativeAudio=window.Audio;window.Audio=function(...args){const a=new NativeAudio(...args);window.__deliveryAudio=a;return a;};window.Audio.prototype=NativeAudio.prototype;
 window.__audioRegistrations=0;window.wallpaperRegisterAudioListener=fn=>{window.__deliveryAudioListener=fn;window.__audioRegistrations++;};
 localStorage.setItem('three-body.settings.v3',JSON.stringify({presentationRevision:6,physicsRevision:1,galaxyReturnRevision:2,pixelRatio:.5,newproperty63:false,newproperty64:false,newproperty2:false}));window.__wallpaperFPS=20;
};
try{
 const context=await browser.newContext({viewport:{width:1280,height:720},timezoneId:'Asia/Shanghai'});await context.addInitScript(pageInit);
 await context.route('**/*',route=>{const url=route.request().url();if(url.startsWith('http')&&!url.startsWith('http://127.0.0.1:4184/')){report.externalRequests.push(url);return route.abort();}return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))report.failedResources.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:4184/index.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready,{timeout:30000});assert.equal(await page.evaluate(()=>window.threeBody.version),'0.6.1');
 const p=JSON.parse(await readFile(path.join(root,'project.json'),'utf8'));const props=Object.fromEntries(Object.entries(p.general.properties).map(([k,v])=>[k,{value:v.value}]));
 props.newproperty63={value:false};props.newproperty64={value:false};props.newproperty2={value:false};
 await page.evaluate(props=>{window.wallpaperPropertyListener.applyUserProperties(props);window.wallpaperPropertyListener.applyGeneralProperties({fps:30});window.threeBody.applySettings({pixelRatio:.5});window.__deliveryAudioListener(new Array(128).fill(.5));},props);
 await page.waitForFunction(()=>window.threeBody.getState()?.bodies.length===4&&window.__threeBodyDiagnostics().scene.backgroundSizes['4'][0]===8192);
 assert.equal(await page.evaluate(()=>window.__audioRegistrations),1);assert.equal(await page.evaluate(()=>window.__wallpaperFPS),30);assert.equal(await page.evaluate(()=>window.threeBody.wallpaper),true);
 const state=await page.evaluate(()=>window.threeBody.getState());assert.ok(state.algorithm.startsWith('v2-deflect-v2-h4-P5'));assert.equal(state.physics.model,'newtonian');assert.ok(state.bodies.every(b=>Object.values(b).every(Number.isFinite)));report.checks.push('Offline HTTP boot, real Blob Worker, finite V2 state, 8K local textures and all native Web properties');
 await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));await page.waitForTimeout(250);const paused=await page.evaluate(()=>window.threeBody.getState().year);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>window.threeBody.getState().year),paused);await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(false));await page.waitForFunction(y=>window.threeBody.getState().year>y,paused);report.checks.push('Wallpaper Engine pause/resume and FPS callback, audio registration and 128-band callback');
 await page.locator('#settings-toggle').click();await page.locator('#setting-music').check();await page.waitForFunction(()=>window.__deliveryAudio&&!window.__deliveryAudio.paused&&window.__deliveryAudio.readyState>=2);const audioStart=await page.evaluate(()=>window.__deliveryAudio.currentTime);await page.waitForTimeout(250);assert.ok(await page.evaluate(t=>window.__deliveryAudio.currentTime>t,audioStart));await page.locator('#setting-music').uncheck();report.checks.push('Bundled FLAC decodes and plays through a real user gesture without external network');
 await page.locator('#settings-close').click();await page.waitForTimeout(400);if(preview)await page.screenshot({path:path.join(root,'preview.jpg'),type:'jpeg',quality:85});await page.screenshot({path:path.join(result,'offline-desktop.jpg'),type:'jpeg',quality:80});
 await page.setViewportSize({width:2560,height:1080});await page.waitForTimeout(200);assert.equal(await page.locator('#universe').evaluate(n=>n.width>0&&n.height>0),true);report.checks.push('16:9 and 21:9 responsive render');
 report.diagnostics=await page.evaluate(()=>window.__threeBodyDiagnostics());
 // file:// support is a CEF-like probe using explicit local-file access, not a native host claim.
 const files=await browser.newContext({viewport:{width:1280,height:720},timezoneId:'Asia/Shanghai'});await files.addInitScript(pageInit);const fp=await files.newPage();const fe=[];fp.on('pageerror',e=>fe.push(e.message));
 try{await fp.goto(pathToFileURL(path.join(root,'index.html')).href);await fp.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready,{timeout:20000});report.fileURL={pass:true,version:await fp.evaluate(()=>window.threeBody.version),errors:fe};assert.equal(report.fileURL.version,'0.6.1');assert.deepEqual(fe,[]);}catch(e){report.fileURL={pass:false,blocker:e.message,errors:fe};}
 await files.close();assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.failedResources,[]);assert.deepEqual(report.errors,[]);report.pass=true;
}catch(e){report.pass=false;report.failure=e.stack;throw e;}
finally{await writeFile(path.join(result,'offline.json'),JSON.stringify(report,null,2)+'\n');await browser.close();await new Promise(ok=>server.close(ok));console.log(JSON.stringify({pass:report.pass,checks:report.checks,fileURL:report.fileURL},null,2));}

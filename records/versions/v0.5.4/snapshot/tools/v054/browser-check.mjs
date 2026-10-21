import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),checks=[],errors=[],motion=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
await page.addInitScript(()=>{
 if(!localStorage.getItem('qa-initialized')){
  localStorage.setItem('qa-initialized','1');
  localStorage.setItem('three-body.settings.v3',JSON.stringify({presentationRevision:6,physicsRevision:1,galaxyReturnRevision:1,newproperty51:.003,viewSensitivity:.04,pixelRatio:.5,newproperty63:false,newproperty64:false,newproperty2:false,autorestart:false,seed:'V054-BROWSER'}));
  localStorage.setItem('three-body.statistics.v1',JSON.stringify({format:'three-body-statistics',version:1,totalYears:12345,universeNumber:88,universeStart:12000,nextCivilization:99,universes:[{number:70,lifespan:1000}],civilizations:[{number:80,universe:70,lifespan:900}]}));
 }
 window.__wallpaperFPS=30;
});
const scene=()=>page.evaluate(()=>window.__threeBodyDiagnostics().scene),apply=patch=>page.evaluate(p=>window.threeBody.applySettings(p),patch),ready=()=>page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
try{
 await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await ready();
 assert.equal(await page.evaluate(()=>window.threeBody.version),'0.5.4');assert.equal(await page.locator('#setting-newproperty51').inputValue(),'0.006');checks.push('v0.5.4 real Worker starts and migrates the old default to 0.006 deg/s');
 // Test real pointer events in both directions with hover mode enabled.
 await apply({newproperty16:false,newproperty61:1});
 for(const direction of [1,-1]){
  await page.mouse.move(560,650);await page.waitForTimeout(350);await page.mouse.down();await page.mouse.move(560+direction*140,650,{steps:10});await page.waitForTimeout(80);await page.mouse.up();
  const samples=[];for(let i=0;i<24;i++){const s=await scene();samples.push({yaw:s.viewRotation[1],velocity:s.viewVelocity[1]});await page.waitForTimeout(60);}
  assert.ok(samples[0].velocity*direction>0);
  for(let i=1;i<samples.length;i++){assert.ok((samples[i].yaw-samples[i-1].yaw)*direction>=-1e-9,JSON.stringify(samples));assert.ok(samples[i].velocity*direction>=-1e-9);}
  motion.push({direction,samples});
 }
 checks.push('left and right drag releases coast monotonically without a reverse rebound in hover+drag mode');
 await apply({newproperty16:true});await page.mouse.move(560,650);await page.mouse.down();await page.mouse.move(680,650,{steps:8});await page.waitForTimeout(2150);await page.mouse.up();await page.waitForTimeout(100);assert.equal((await scene()).returningToGalaxy,false);checks.push('holding a drag still for more than two seconds does not trigger immediate reverse auto-return upon release');
 const before=await scene();await page.mouse.move(500,620,{steps:5});await page.waitForTimeout(300);const hover=await scene();assert.ok(Math.abs(hover.viewRotation[1]-before.viewRotation[1])>1e-5);checks.push('fresh hover input resumes without requiring a click');
 await apply({newproperty16:true});await page.waitForTimeout(2200);const a=await scene(),t=Date.now();assert.equal(a.returningToGalaxy,true);assert.deepEqual(a.viewVelocity,[0,0]);await page.waitForTimeout(900);const b=await scene(),elapsed=(Date.now()-t)/1000,travel=Math.hypot(...a.viewRotation.slice(0,2))-Math.hypot(...b.viewRotation.slice(0,2)),cap=.006*Math.PI/180*elapsed;assert.ok(travel>cap*.3&&travel<cap*1.5,{travel,cap});checks.push('idle return uses the slightly increased speed without residual inertia or overshoot');
 // Seed actual IndexedDB archives/background and reload to exercise loading and deletion.
 await page.evaluate(async()=>{
  await new Promise((resolve,reject)=>{const r=indexedDB.open('three-body-observatory',1);r.onerror=reject;r.onsuccess=()=>{const db=r.result,tx=db.transaction(['history','assets'],'readwrite');tx.objectStore('history').put({key:'qa-old-civilization',number:80,universe:70,generation:70,lifespan:900,year:12340,savedAt:Date.now(),seed:'OLD',destructionEvent:'QA',settings:{}});const c=document.createElement('canvas');c.width=c.height=1;tx.objectStore('assets').put(new Blob([Uint8Array.from(atob(c.toDataURL().split(',')[1]),x=>x.charCodeAt(0))],{type:'image/png'}),'background');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=reject;};});
 });
 await page.reload({waitUntil:'networkidle'});await ready();await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));assert.equal(await page.evaluate(()=>window.__threeBodyDiagnostics().history),1);
 await page.locator('#settings-toggle').click();await page.locator('[data-tab="history"]').click();await page.waitForTimeout(400);
 page.once('dialog',d=>d.dismiss());await page.locator('#reset-history').click();assert.equal(await page.evaluate(()=>window.__threeBodyDiagnostics().history),1);assert.ok((await page.evaluate(()=>window.threeBody.getState().year))>12345);checks.push('canceling complete reset retains archives, rankings and accumulated time');
 // Queue a preceding write, then clear: it must not resurrect history after completion.
 await page.evaluate(()=>{const r=indexedDB.open('three-body-observatory',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('history','readwrite');for(let i=0;i<20;i++)tx.objectStore('history').put({key:'pending-'+i,number:81+i,lifespan:5});tx.oncomplete=()=>db.close();};});
 page.once('dialog',d=>d.accept());await page.locator('#reset-history').click();await page.waitForFunction(()=>window.threeBody.getState()?.generation===1&&window.__threeBodyDiagnostics().history===0);
 const resetState=await page.evaluate(()=>window.threeBody.getState());assert.ok(resetState.year<1);assert.equal(resetState.statisticsCheckpoint.nextCivilization,1);assert.deepEqual(resetState.statisticsCheckpoint.civilizations,[]);assert.deepEqual(resetState.statisticsCheckpoint.universes,[]);assert.deepEqual(resetState.logItems,[]);assert.equal(await page.locator('#setting-viewSensitivity').inputValue(),'0.04');
 const readStorage=()=>page.evaluate(async()=>{
  const db=await new Promise(resolve=>{const r=indexedDB.open('three-body-observatory',1);r.onsuccess=()=>resolve(r.result);});
  const history=await new Promise(resolve=>{const r=db.transaction('history').objectStore('history').getAll();r.onsuccess=()=>resolve(r.result);});const bg=await new Promise(resolve=>{const r=db.transaction('assets').objectStore('assets').get('background');r.onsuccess=()=>resolve(r.result);});db.close();return{records:history.length,background:!!bg,stats:JSON.parse(localStorage.getItem('three-body.statistics.v1')),pending:localStorage.getItem('three-body.reset-pending.v1')};
 });
 const cleared=await readStorage();assert.equal(cleared.records,0);assert.equal(cleared.background,true);assert.equal(cleared.pending,null);assert.ok(cleared.stats.totalYears<1);checks.push('confirmed reset clears IndexedDB archives, pending writes, in-memory logs, rankings, numbering and statistics; settings/background survive');
 await page.screenshot({path:'docs/v054/results/reset-history.png'});
 await page.reload({waitUntil:'networkidle'});await ready();await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));assert.equal((await readStorage()).records,0);assert.ok((await page.evaluate(()=>window.threeBody.getState().year))<5);assert.equal(await page.evaluate(()=>window.__threeBodyDiagnostics().history),0);checks.push('cleared history and old statistics do not return after reload');
 // Simulate an interrupted reset between marker creation and database clearing.
 await page.evaluate(()=>{localStorage.setItem('three-body.reset-pending.v1','1');localStorage.setItem('three-body.statistics.v1',JSON.stringify({format:'three-body-statistics',version:1,totalYears:54321,universeNumber:333}));});await page.reload({waitUntil:'networkidle'});await ready();await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));assert.equal(await page.evaluate(()=>window.threeBody.getState().generation),1);assert.ok((await page.evaluate(()=>window.threeBody.getState().year))<3);assert.equal((await readStorage()).pending,null);checks.push('an interrupted reset is completed on startup before old checkpoints can load');
 const escaping=[{x:-.5,y:-1,z:0,vx:0,vy:0,vz:0,mass:5e6},{x:.5,y:1,z:0,vx:0,vy:0,vz:0,mass:5e6},{x:2,y:.5,z:0,vx:0,vy:0,vz:0,mass:5e6},{x:30,y:0,z:0,vx:1,vy:0,vz:0,mass:1000}];
 await apply({newproperty50:true,manualInitialBodies:escaping,autorestart:false});await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(false));await page.waitForFunction(()=>window.threeBody.getState()?.escapeStatus?.confirmed,{},{timeout:15000});await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));assert.equal(await page.locator('#restart-prompt').isVisible(),true);const universe=await page.evaluate(()=>window.threeBody.getState().generation);await apply({autorestart:true});await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(false));await page.waitForFunction(u=>window.threeBody.getState()?.generation>u,universe);await page.evaluate(()=>window.wallpaperPropertyListener.setPaused(true));assert.equal(await page.locator('#restart-prompt').isVisible(),false);checks.push('real Worker exposes confirmed escape and manual restart when disabled, then rebuilds once automatic restart is enabled');
 const restricted=await browser.newContext({viewport:{width:800,height:600}}),restrictedPage=await restricted.newPage();
 restrictedPage.on('pageerror',e=>errors.push(e.message));await restrictedPage.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw new DOMException('Storage denied','SecurityError');};window.__wallpaperFPS=10;});
 await restrictedPage.goto('http://localhost:4173',{waitUntil:'networkidle'});await restrictedPage.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);await restricted.close();checks.push('denied localStorage access still allows the simulation to boot');
 assert.deepEqual(errors,[]);await writeFile('docs/v054/results/browser.json',JSON.stringify({passed:true,checks,errors,motion,returnMotion:{elapsed,travelRadians:travel,capRadians:cap},storage:cleared,limits:'Chromium actual pointer/Worker/IndexedDB, software WebGL; native Wallpaper Engine unavailable'},null,2)+'\n');console.log(JSON.stringify({passed:true,checks},null,2));
}catch(error){await writeFile('docs/v054/results/browser-failure.json',JSON.stringify({passed:false,checks,errors,motion,error:error.stack},null,2)+'\n');throw error;}
finally{await browser.close();}

import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{
 localStorage.setItem('three-body.settings.v3',JSON.stringify({bodyLabels:true,newproperty63:false,newproperty64:false,pixelRatio:.5,newproperty2:false,newproperty17:'2',newproperty40:'0 0 0',dust:false,newproperty16:false,newproperty61:'2',autorestart:false}));
 const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{constructor(...args){super(...args);window.__fixtureWorker=this;}};
});
try{
 await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
 assert.equal(await page.evaluate(()=>window.__threeBodyDiagnostics().scene.bodyLabelsVisible),false);checks.push('old v0.3 settings migrate to hidden body labels');
 assert.equal(await page.locator('#habitability-warning').count(),0);checks.push('activity-temperature small print removed from HUD');
 // A real, stationary close passage with zero integration gravity makes repeatable damage.
 await page.evaluate(()=>{
  const patch={newproperty50:true,newproperty60:false,newproperty52:0,_110:5000000,_26:0,_34:0,x11:.12,y11:0,z1:0,x21:10,y21:0,z2:0,x3:-10,y3:0,z3:0,x4:0,y4:0,z4:0,v1:0,vy1:0,vz1:0,vx2:0,vy2:0,vz2:0,vx3:0,vy3:0,vz3:0,vx4:0,vy4:0,vz4:0};
  window.threeBody.applySettings(patch);
 });
 await page.waitForFunction(()=>window.__threeBodyState.world.planet.damaged&&window.__threeBodyState.habitability.score===0);
 assert.equal(await page.evaluate(()=>window.__threeBodyState.world.planet.terminal),null);assert.equal(await page.locator('#habitability-score').textContent(),'0%');await page.waitForFunction(()=>!document.querySelector('#restart-prompt').hidden&&document.querySelector('#restart-prompt strong').textContent.includes('第2号宇宙'));
 checks.push('actual worker damage shows zero suitability and enables the next universe before terminal destruction');
 await page.locator('#restart-prompt').click();await page.waitForFunction(()=>window.__threeBodyState.generation===2);checks.push('manual damaged-planet action starts universe 2');
 // Feed deterministic trajectories through the real Worker message handler and real GPU renderer.
 // This fixture changes only the QA page; no production test API is shipped.
 await page.evaluate(()=>{window.__fixtureWorker.terminate();window.__trailFixture=structuredClone(window.__threeBodyState);window.__trailFixture.revision++;window.__trailFixture.events=[];window.__trailFixture.world.planet.terminal=null;window.__trailFixture.world.planet.damaged=false;window.__trailFixture.world.planet.restartRequired=false;window.__trailFixture.com={x:0,y:0,z:0};window.threeBody.applySettings({trailsLength:400});});
 async function feed(kind,count){
  await page.evaluate(async({kind,count})=>{
   const s=window.__trailFixture;
   for(let i=0;i<count;i++){
    s.tick+=2;s.runtime+=1/30;
    s.bodies=s.bodies.map((body,b)=>({...body,x:kind==='calm'?-1.65+i*.003:Math.sin(i*.7+b*.3)*.5,y:kind==='calm'?(b-1.5)*.45:((i+b)%2?1:-1)*.38,z:0}));
    window.__fixtureWorker.dispatchEvent(new MessageEvent('message',{data:{type:'state',state:structuredClone(s)}}));
    if(i%50===0)await new Promise(requestAnimationFrame);
   }
  },{kind,count});
 }
 await mkdir('docs/qa',{recursive:true});await feed('calm',1100);await page.waitForTimeout(1500);
 const calm=await page.evaluate(()=>window.__threeBodyDiagnostics().scene);assert.ok(calm.trailMetrics.every(m=>m.seconds>20&&m.arcPixels>250));await page.screenshot({path:'docs/qa/v03-local-calm.png'});checks.push('slow simple motion retains more than 20 seconds of visible physical history');
 await feed('complex',240);await page.waitForTimeout(3500);
 const complex=await page.evaluate(()=>window.__threeBodyDiagnostics().scene);assert.ok(complex.trailComplexity>.8);
 assert.ok(complex.trailMetrics.every((m,i)=>m.arcPixels<calm.trailMetrics[i].arcPixels*.65&&m.arcPixels<=m.budget+1));
 assert.ok(complex.trailMetrics.every(m=>m.segments<=1999));await page.screenshot({path:'docs/qa/v03-local-complex.png'});checks.push('complex crossing motion reduces actual on-screen trail arcs within fixed GPU capacity');
 assert.deepEqual(errors,[]);const report={passed:checks.length,checks,errors,calm,complex,fixture:'real worker for damage/restart; controlled Worker messages for repeatable visual trail comparison',publication:'local v0.3 work only, no source push or deployment'};
 await writeFile('docs/qa/v03-local-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

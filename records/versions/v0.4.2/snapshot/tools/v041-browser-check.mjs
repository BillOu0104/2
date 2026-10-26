import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{
 if(!localStorage.getItem('v041-qa')){localStorage.setItem('three-body.settings.v3',JSON.stringify({newproperty63:false,newproperty64:false,newproperty2:false,pixelRatio:.5,dust:false,autorestart:false,seed:'V041-GALAXY'}));localStorage.setItem('v041-qa','1');}
 window.__wallpaperFPS=20;const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{constructor(...args){super(...args);window.__fixtureWorker=this;}};
});
const diag=()=>page.evaluate(()=>window.__threeBodyDiagnostics().scene);
const ready=()=>page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
try{
 await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await ready();
 assert.equal(await page.locator('#civilization-phase').isVisible(),true);checks.push('left civilization phase readout is present with the real Worker');
 const initial=await diag();assert.ok(Math.abs(initial.galaxyCoreScreen[0])<.03&&Math.abs(initial.galaxyCoreScreen[1])<.03);assert.equal(initial.compassVisible,false);checks.push('measured bright Milky Way patch projects to the initial camera center; idle rings remain hidden');
 await mkdir('docs/qa',{recursive:true});await page.screenshot({path:'docs/qa/v041-galaxy-default.png'});
 await page.locator('#settings-toggle').click();await page.waitForTimeout(300);
 assert.equal(await page.locator('#extension-controls>[data-category]').count(),5);assert.equal(await page.locator('#advanced-controls').getAttribute('open'),null);assert.equal(await page.locator('#setting-layout\\.clock\\.x').count(),1);checks.push('settings are categorized with a collapsed original advanced section and ten position controls');
 await page.locator('[data-category=layout]>summary').click();await page.locator('#layout-edit').click();await page.waitForTimeout(300);assert.equal((await diag()).layoutEditing,true);
 const box=await page.locator('#clock-widget').boundingBox();await page.mouse.move(box.x+20,box.y+20);await page.mouse.down();await page.mouse.move(box.x+140,box.y+90,{steps:8});await page.mouse.up();
 const moved=await page.locator('#clock-widget').boundingBox();assert.ok(Math.abs(moved.x-box.x-120)<2&&Math.abs(moved.y-box.y-70)<2);assert.ok(Math.hypot(...(await diag()).viewVelocity)<.001);await page.locator('#layout-done').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('three-body.settings.v3')).layout.clock);assert.ok(saved.x>0);checks.push('dragging the clock changes its position without rotating the scene and saves normalized coordinates');
 await page.reload({waitUntil:'networkidle'});await ready();const restored=await page.locator('#clock-widget').boundingBox();assert.ok(Math.abs(restored.x-moved.x)<2&&Math.abs(restored.y-moved.y)<2);checks.push('custom window positions survive reload');
 await page.evaluate(()=>window.threeBody.applySettings({layout:{left:{x:95,y:95},right:{x:95,y:95},clock:{x:95,y:95},logs:{x:95,y:95},years:{x:95,y:95}}}));
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>['#era-widget','#distance-widget','#clock-widget','#civilization-widget','.simulation-time'].every(selector=>{const b=document.querySelector(selector).getBoundingClientRect();return b.x>=3&&b.y>=3&&b.right<=innerWidth+1&&b.bottom<=innerHeight+1;}));
 for(const selector of ['#era-widget','#distance-widget','#clock-widget','#civilization-widget','.simulation-time']){const b=await page.locator(selector).boundingBox();assert.ok(b.x>=3&&b.y>=3&&b.x+b.width<=391&&b.y+b.height<=845,`${selector}: ${JSON.stringify(b)}`);}checks.push('all five custom windows clamp to the viewport after a mobile resize');
 await page.setViewportSize({width:1440,height:900});await page.locator('#settings-toggle').click();await page.waitForTimeout(300);await page.locator('[data-category=layout]>summary').click();await page.locator('#layout-reset').click();assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('three-body.settings.v3')).layout),{});await page.locator('#settings-close').click();checks.push('reset layout restores the default arrangement');
 await page.evaluate(()=>window.threeBody.applySettings({newproperty16:false,newproperty61:0}));await page.mouse.move(500,700);await page.mouse.down();await page.mouse.move(1100,700,{steps:2});
 await page.waitForFunction(()=>window.__threeBodyDiagnostics().scene.compassVisible);const drag=await diag();assert.ok(Math.abs(drag.viewVelocity[1])>.55);assert.ok(drag.compassOpacity.every(v=>v>0&&v<=.12));await page.mouse.up();checks.push('real drag exceeds the former speed cap and shows translucent fading rotation rings');
 await page.waitForFunction(()=>!window.__threeBodyDiagnostics().scene.compassVisible,{timeout:12000});checks.push('rotation rings disappear when manual rotation settles');
 // Only phase/presentation states below use controlled snapshots; startup, camera and persistence above use the real Worker.
 await page.evaluate(()=>window.__fixtureWorker.terminate());
 for(const[phase,label]of[['active','文明发展'],['dehydrating','脱水保存'],['dormant','干仓储存'],['rehydrating','浸泡复苏'],['destroyed','文明已终结']]){
  await page.evaluate(phase=>{const s=structuredClone(window.__threeBodyState);s.events=[];s.alive=phase!=='destroyed';s.generation=9;s.civilization=101;s.lifespan=75;s.civilizationState={phase};s.world.planet.terminal=null;s.world.planet.restartRequired=false;s.world.planet.condition='recovering';s.text[0]='宇宙9 · 文明101';s.text[6]='文明已延续：75年';s.logItems=[{id:999,kind:'rare',zh:'宇宙9：三日连珠',en:'Universe 9: alignment',year:100,at:s.runtime}];s.statistics={totalYears:260,universe:{number:9,lifespan:80,active:true},civilization:{number:101,universe:9,lifespan:75,active:true},civilizationRanking:[{number:101,universe:9,lifespan:75,active:true},{number:10,universe:3,lifespan:70}],universeRanking:[{number:9,lifespan:80,active:true},{number:1,lifespan:70}]};window.__fixtureWorker.dispatchEvent(new MessageEvent('message',{data:{type:'state',state:s}}));},phase);
  assert.ok((await page.locator('#civilization-phase').textContent()).includes(label));
 }
 checks.push('left HUD renders development, dehydration, dry storage, rehydration and final extinction independently');
 assert.equal(await page.locator('#current-civilization').textContent(),'宇宙9 · 文明101');assert.ok((await page.locator('#civilization-ranking li').nth(1).textContent()).includes('宇宙3 · 文明10'));assert.equal(await page.locator('#civilization-log li').count(),1);assert.equal(await page.locator('#restart-prompt').isHidden(),true);checks.push('qualified civilization ranking names, sparse rare logs and no recoverable-planet restart prompt');
 await page.evaluate(()=>{const s=structuredClone(window.__threeBodyState);s.alive=true;s.civilizationState={phase:'dormant'};window.__fixtureWorker.dispatchEvent(new MessageEvent('message',{data:{type:'state',state:s}}));window.threeBody.applySettings({pixelRatio:1,newproperty16:true});});
 await page.waitForTimeout(500);await page.screenshot({path:'docs/qa/v041-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'docs/qa/v041-mobile.png'});
 assert.deepEqual(errors,[]);checks.push('no browser JavaScript errors');const report={passed:checks.length,checks,errors,initial,limits:['Phase and ranking presentation coverage uses controlled Worker snapshots after real Worker startup, motion, layout persistence and viewport tests.','Windows Wallpaper Engine and target GPU performance are not available in this environment.']};await writeFile('docs/qa/v041-browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

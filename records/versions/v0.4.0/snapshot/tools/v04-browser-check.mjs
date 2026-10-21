import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:800}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{
 if(!localStorage.getItem('v04-qa-seeded')){
  localStorage.setItem('three-body.settings.v3',JSON.stringify({newproperty63:false,newproperty64:false,newproperty2:false,pixelRatio:.5,dust:false,autorestart:false,newproperty39:false}));
  localStorage.setItem('three-body.statistics.v1',JSON.stringify({format:'three-body-statistics',version:1,totalYears:150,universeNumber:7,universeStart:130,nextCivilization:100,activeCivilization:{number:99,start:120},universes:[{number:1,lifespan:70},{number:2,lifespan:40},{number:3,lifespan:15},{number:4,lifespan:5},{number:5,lifespan:4}],civilizations:[{number:10,lifespan:70},{number:20,lifespan:40},{number:30,lifespan:20},{number:40,lifespan:15},{number:50,lifespan:8}]}));
  localStorage.setItem('v04-qa-seeded','true');
 }
 const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{constructor(...args){super(...args);window.__fixtureWorker=this;}};
});
try{
 await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
 const layout=await page.evaluate(()=>{const $=id=>document.querySelector(id),probe=document.createElement('li');$('#civilization-log').append(probe);const logSize=getComputedStyle(probe).fontSize;probe.remove();const clock=$('#clock-widget').getBoundingClientRect(),time=$('#clock-time').getBoundingClientRect(),calendar=$('.clock-calendar').getBoundingClientRect();return{clockTop:clock.y,calendarGap:calendar.y-time.bottom,date:getComputedStyle($('#clock-date')).fontSize,day:getComputedStyle($('#clock-day')).fontSize,log:logSize,height:innerHeight};});
 assert.ok(layout.clockTop<layout.height*.12);assert.ok(layout.calendarGap<=3);assert.equal(layout.date,layout.day);assert.equal(layout.log,'9.5px');checks.push('clock moves upward, date/week align directly under it with equal font sizes; log is smaller');
 assert.equal(await page.locator('.distance-row,#audio-bars').count(),0);checks.push('old alpha/beta/gamma distance rows and the dotted audio line are removed');
 assert.equal(await page.locator('#ranking-widget').isVisible(),true);assert.equal(await page.locator('#civilization-ranking li').count(),5);assert.equal(await page.locator('#universe-ranking li').count(),5);checks.push('upgraded settings show both top-five rankings by default');
 await page.evaluate(()=>document.querySelector('#pause-button').click());await page.waitForTimeout(250);
 const before=await page.evaluate(()=>window.__threeBodyState);assert.equal(before.generation,8);assert.ok(before.statistics.totalYears>150);
 const visible=await page.locator('#total-years').textContent();await page.waitForTimeout(450);assert.equal(await page.locator('#total-years').textContent(),visible);checks.push('simulation-year totals and current universe age freeze while paused');
 await page.evaluate(()=>{window.wallpaperPropertyListener.applyUserProperties({timespeed:{value:2}});document.querySelector('#pause-button').click();});
 await page.waitForFunction(year=>window.__threeBodyState.statistics.totalYears>year+.5,before.statistics.totalYears);
 const running=await page.evaluate(()=>window.__threeBodyState);assert.ok(running.statistics.universe.lifespan<running.statistics.totalYears);checks.push('total, universe and civilization ages use separate simulation-year counters');
 await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
 const restored=await page.evaluate(()=>window.__threeBodyState);assert.equal(restored.generation,running.generation+1);assert.ok(restored.statistics.totalYears>=running.statistics.totalYears);assert.ok(restored.statistics.universe.lifespan<restored.statistics.totalYears-running.statistics.totalYears+2);checks.push('reload preserves cumulative years and rankings while starting the next numbered universe');
 await page.evaluate(()=>window.threeBody.applySettings({newproperty61:'0',newproperty16:false}));await page.mouse.move(300,400);await page.mouse.down();await page.mouse.move(900,420,{steps:15});await page.waitForTimeout(150);
 const drag=await page.evaluate(()=>window.__threeBodyDiagnostics().scene);assert.ok(Math.hypot(...drag.viewVelocity)<=drag.maxAngularSpeed+1e-10);await page.mouse.up();await page.waitForTimeout(900);
 const stopped=await page.evaluate(()=>window.__threeBodyDiagnostics().scene);assert.ok(Math.hypot(...stopped.viewVelocity)<.3);checks.push('real pointer drag obeys the angular-speed cap and stronger release damping');
 // Inject a complete, documented snapshot to inspect a populated 10-line HUD and active ranks.
 await page.evaluate(()=>{
  window.__fixtureWorker.terminate();const s=structuredClone(window.__threeBodyState);s.events=[];s.year=260;s.temperature=22.6;s.era='恒纪元';s.alive=true;s.generation=9;s.world.planet={...s.world.planet,temperature:22.6,terminal:null,condition:'temperate',damaged:false,restartRequired:false,integrity:1};s.world.phenomena=[];s.habitability={...s.habitability,score:1,health:1};s.text[0]='第101号文明 · 正常活动';s.text[6]='文明已延续：75年';window.threeBody.applySettings({pixelRatio:1});
  s.logItems=Array.from({length:12},(_,i)=>({id:1000+i,kind:'test',zh:`第${12-i}次天象观测：文明状态已记录`,en:`Observation ${12-i}: civilization state recorded`,year:100-i,at:s.runtime-i*.5}));
  s.statistics={totalYears:260,universe:{number:9,lifespan:80,active:true},civilization:{number:101,lifespan:75,active:true},civilizationRanking:[{number:101,lifespan:75,active:true},{number:10,lifespan:70},{number:20,lifespan:40},{number:99,lifespan:30},{number:30,lifespan:20}],universeRanking:[{number:9,lifespan:80,active:true},{number:1,lifespan:70},{number:2,lifespan:40},{number:7,lifespan:20},{number:3,lifespan:15}]};
  window.__fixtureWorker.dispatchEvent(new MessageEvent('message',{data:{type:'state',state:s}}));
 });
 assert.equal(await page.locator('#civilization-log li').count(),10);assert.equal(await page.locator('#current-universe').textContent(),'#9');assert.equal(await page.locator('#current-civilization').textContent(),'#101');
 assert.equal(await page.locator('#civilization-ranking li').first().getAttribute('data-active'),'true');assert.equal(await page.locator('#universe-ranking li').first().getAttribute('data-active'),'true');checks.push('10 compact log rows and the requested runtime fields render with active ranking markers');
 await mkdir('docs/qa',{recursive:true});await page.screenshot({path:'docs/qa/v04-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(700);
 const mobile=await page.locator('#distance-widget').boundingBox();assert.ok(mobile.x>=0&&mobile.x+mobile.width<=390&&mobile.y+mobile.height<800);await page.screenshot({path:'docs/qa/v04-mobile.png'});checks.push('mobile runtime overview and both rankings fit above the bottom controls');
 assert.deepEqual(errors,[]);const report={passed:checks.length,checks,errors,layout,limits:['A controlled Worker snapshot populates the final screenshot; counters, reload and pointer motion were verified with the real Worker beforehand.','Actual Windows Wallpaper Engine and target GPU performance are not available in this environment.']};await writeFile('docs/qa/v04-browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

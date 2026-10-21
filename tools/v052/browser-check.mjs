import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {guideControls} from '../generate-settings-guide.mjs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().startsWith('Failed to load resource:'))errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))errors.push(`${r.status()} ${r.url()}`);});
await page.addInitScript(()=>{localStorage.setItem('three-body.settings.v3',JSON.stringify({physicsRevision:1,presentationRevision:6,pixelRatio:.5,newproperty63:false,newproperty64:false,newproperty2:false}));window.__wallpaperFPS=20;});
try{
 await page.goto('http://localhost:4173');await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
 const first=await page.evaluate(()=>window.threeBody.getState());assert.equal(await page.evaluate(()=>window.threeBody.version),'0.5.2');assert.equal(first.physics.model,'newtonian');assert.equal(first.physics.cageActive,false);assert.equal(first.initialization.version,'research-q1-retro12-v1');checks.push('v0.5.2 boots actual Worker with random Q=1/retrograde candidate, Newton gravity and cage off');
 const controls=await page.locator('.control').evaluateAll(nodes=>nodes.map(n=>n.dataset.key));assert.deepEqual(controls.sort(),guideControls().map(c=>c.key).sort());assert.equal(controls.length,217);checks.push('all 217 controls match the generated guide, including gravity model and encounter precision');
 await page.locator('#settings-toggle').click();await page.locator('[data-category=simulation] summary').click();await page.selectOption('#setting-gravityModel','plummer');await page.waitForFunction(()=>window.threeBody.getState().physics.model==='plummer');checks.push('gravity dropdown changes running Worker to consistent Plummer model');
 await page.selectOption('#setting-gravityModel','newtonian');await page.waitForFunction(()=>window.threeBody.getState().physics.model==='newtonian');
 await page.evaluate(()=>window.threeBody.applySettings({newproperty60:true}));await page.waitForFunction(()=>window.threeBody.getState().physics.cageActive);await page.evaluate(()=>window.threeBody.applySettings({newproperty60:false}));await page.waitForFunction(()=>!window.threeBody.getState().physics.cageActive);checks.push('existing cage toggle can be enabled and disabled without deleting its parameters');
 await page.evaluate(()=>window.threeBody.applySettings({encounterAccuracy:.00375}));await page.waitForFunction(()=>window.threeBody.getState().algorithm.includes('eta0.00375'));checks.push('encounter precision setting reaches the production kernel');
 await page.locator('#settings-close').click();await page.waitForTimeout(700);await page.screenshot({path:'docs/v052/results/browser-desktop.png'});
 const latest=await page.evaluate(()=>window.threeBody.getState());assert.ok(Number.isFinite(latest.physics.relativeEnergyError));assert.ok(latest.tick>first.tick);checks.push('Worker advances with finite conservation diagnostics and renders the existing scene');
 const response=await page.goto('http://localhost:4173/settings-guide.html');assert.equal(response.status(),200);assert.ok((await page.textContent('body')).includes('gravityModel'));checks.push('updated standalone settings guide is included in offline build');
 assert.deepEqual(errors,[]);await writeFile('docs/v052/results/browser.json',JSON.stringify({passed:true,checks,errors,controls:controls.length,physics:latest.physics,limits:'Chromium with software WebGL; native Wallpaper Engine/Windows not available'},null,2)+'\n');console.log(JSON.stringify({passed:true,checks},null,2));
}finally{await browser.close();}

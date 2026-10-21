import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:720}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{localStorage.setItem('three-body.settings.v3',JSON.stringify({newproperty63:false,newproperty64:false,newproperty2:false,pixelRatio:.5,dust:false,compass:true,newproperty61:'0'}));window.__wallpaperFPS=15;});
const diag=()=>page.evaluate(()=>window.__threeBodyDiagnostics());
try{
 await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
 assert.equal(await page.locator('.signature,.coordinates,#running-caption').count(),0);checks.push('removed upper-left/right text and sentence below YEARS');
 assert.equal((await diag()).scene.compassVisible,false);checks.push('rotation rings stay hidden during slow galaxy return');
 assert.equal(await page.locator('#setting-newproperty51').inputValue(),'0.01');assert.equal(await page.locator('#setting-newproperty45').inputValue(),'-20');assert.equal(await page.locator('#setting-newproperty46').inputValue(),'40');checks.push('gentler idle speed and -20 to 40 C activity thresholds');
 const bounds=await page.locator('#civilization-widget').boundingBox(),clock=await page.locator('#clock-widget').boundingBox();assert.ok(bounds.y>=clock.y+clock.height-2);checks.push('compact civilization block fits below the clock');
 await page.waitForFunction(()=>Object.values(window.__threeBodyDiagnostics().scene.backgroundSizes).every(v=>v[0]===8192&&v[1]===4096));checks.push('both active background textures loaded at native 8192x4096');
 await page.evaluate(()=>{window.__wallpaperFPS=2;window.threeBody.applySettings({renderQuality:'8k',dust:true,newproperty17:'2',newproperty40:'0 0 0',newproperty14:false,newproperty16:false,newproperty61:'2'});});
 await page.waitForFunction(()=>window.__threeBodyDiagnostics().scene.drawingBuffer[0]===7680&&window.__threeBodyDiagnostics().scene.drawingBuffer[1]===4320,{timeout:30000});
 const first=(await diag()).scene.renderedFrames;await page.waitForFunction(n=>window.__threeBodyDiagnostics().scene.renderedFrames>n+1,first,{timeout:60000});
 const eightK=await diag();assert.deepEqual(eightK.scene.canvas,[7680,4320]);assert.deepEqual(eightK.scene.drawingBuffer,[7680,4320]);checks.push('actual WebGL drawing buffer renders multiple frames at 7680x4320');
 await page.evaluate(()=>window.threeBody.applySettings({newproperty2:true}));const postFirst=(await diag()).scene.renderedFrames;await page.waitForFunction(n=>window.__threeBodyDiagnostics().scene.renderedFrames>n+1,postFirst,{timeout:60000});assert.deepEqual((await diag()).scene.drawingBuffer,[7680,4320]);checks.push('8K render also completes frames with the postprocessing pipeline enabled');
 await page.evaluate(()=>window.threeBody.applySettings({newproperty2:false}));
 await page.evaluate(()=>window.threeBody.applySettings({renderQuality:'native',newproperty17:'4',newproperty14:true,newproperty16:true,newproperty61:'0',pixelRatio:1}));await page.waitForTimeout(700);
 await mkdir('docs/qa',{recursive:true});await page.screenshot({path:'docs/qa/v3-overview.png'});
 assert.deepEqual(errors,[]);const report={passed:checks.length,checks,errors,eightK,limits:['8K frame buffer verified using software WebGL; this is not a target GPU frame-rate benchmark.','Native Windows Wallpaper Engine host is unavailable in this environment.']};
 await writeFile('docs/qa/state-ui-8k-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

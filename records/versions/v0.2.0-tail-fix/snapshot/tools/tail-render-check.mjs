import { chromium } from 'playwright-core';
import { spawnSync } from 'node:child_process';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(() => localStorage.setItem('three-body.settings.v2', JSON.stringify({newproperty63:false,newproperty64:false,newproperty14:true,newproperty2:false,pixelRatio:1,newproperty17:'2',newproperty40:'0 0 0',dust:false,compass:false,newproperty16:false,newproperty61:2,timespeed:2.5,seed:'TAIL-CHECK'})));
try {
  await page.goto('http://localhost:4173',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__threeBodyDiagnostics?.().ready);
  await page.evaluate(()=>{document.querySelector('#hud').hidden=true;document.querySelector('#body-labels').hidden=true;document.querySelector('#settings-toggle').style.visibility='hidden';});
  await page.waitForTimeout(2200);
  await page.evaluate(()=>document.querySelector('#pause-button').click()); await page.waitForTimeout(400);
  await page.screenshot({path:'docs/qa/tails-on.png'});
  await page.evaluate(()=>window.threeBody.applySettings({newproperty14:false}));await page.waitForTimeout(400);
  await page.screenshot({path:'docs/qa/tails-off.png'});
  if(errors.length)throw new Error(JSON.stringify(errors));
} finally { await browser.close(); }
const result=spawnSync('python',['-c',`
from PIL import Image,ImageChops
from pathlib import Path
import json
on=Image.open('docs/qa/tails-on.png').convert('RGB');off=Image.open('docs/qa/tails-off.png').convert('RGB')
diff=ImageChops.difference(on,off)
pixels=diff.get_flattened_data() if hasattr(diff,'get_flattened_data') else diff.getdata()
n=sum(1 for pixel in pixels if max(pixel)>12)
assert n>200, f'Trails did not render: only {n} changed pixels'
report={'changedPixelsAbove12':n,'passed':True,'comparison':'same paused orbit, only trail visibility changes'}
Path('docs/qa/tail-render-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
`],{encoding:'utf8'});
process.stdout.write(result.stdout);process.stderr.write(result.stderr);
if(result.status)process.exit(result.status);

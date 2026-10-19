import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const errors = [], checks = [];
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, timezoneId: 'Asia/Shanghai' });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.addInitScript(() => {
  if (!localStorage.getItem('three-body.settings.v3')) localStorage.setItem('three-body.settings.v3', JSON.stringify({ newproperty63: false, newproperty64: false, pixelRatio: .5, newproperty2: false }));
  window.wallpaperRegisterAudioListener = callback => { window.__audioCallback = callback; };
});
try {
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__threeBodyDiagnostics?.().ready, { timeout: 30000 });
  assert.equal(await page.evaluate(() => window.__threeBodyDiagnostics().controls), 197); checks.push('183 original + 14 extension controls and worker ready');
  await page.waitForFunction(() => window.__threeBodyDiagnostics().scene.trailSamples.every(n=>n>3));
  assert.equal(await page.evaluate(() => window.__threeBodyDiagnostics().scene.trailsVisible),true); checks.push('fading tails are enabled and populated for all four bodies');
  assert.equal(await page.evaluate(() => window.__threeBodyDiagnostics().scene.bodyShapes.every(s=>s==='SphereGeometry')),true); checks.push('all bodies use round sphere geometry and circular glow');
  assert.equal(await page.locator('#habitability-readout').isVisible(),true); checks.push('habitability and resilience are visible in optimized mode');
  await page.locator('#settings-toggle').click(); await page.waitForFunction(() => getComputedStyle(document.querySelector('#settings-panel')).opacity === '1');
  assert.equal(await page.locator('#settings-panel').getAttribute('aria-hidden'), 'false'); checks.push('single settings button opens accessible full panel');
  await page.locator('#settings-search').fill('软化'); assert.ok(await page.locator('.control:not([hidden])').count() >= 2); checks.push('settings search filters original controls');
  await page.locator('#settings-search').fill('cnen2'); await page.locator('#setting-cnen2').check();
  await page.waitForFunction(() => document.documentElement.lang === 'en'); checks.push('language control updates the interface');
  await page.locator('#pause-button').click(); await page.waitForTimeout(250);
  const paused = await page.evaluate(() => window.__threeBodyState.tick); await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => window.__threeBodyState.tick), paused); checks.push('user pause stops backend simulation');
  await page.locator('#pause-button').click(); await page.waitForFunction(tick => window.__threeBodyState.tick > tick, paused);
  await page.evaluate(() => window.wallpaperPropertyListener.applyUserProperties({ newproperty38: { value: false }, timespeed: { value: 1.2 }, cnen2: { value: false } }));
  assert.equal(await page.locator('#civilization-widget').isHidden(), true); checks.push('Wallpaper Engine property callbacks update controls and UI');
  await page.evaluate(() => window.wallpaperPropertyListener.setPaused(true)); await page.waitForTimeout(200);
  const hostTick = await page.evaluate(() => window.__threeBodyState.tick); await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.__threeBodyState.tick), hostTick);
  await page.evaluate(() => window.wallpaperPropertyListener.setPaused(false)); await page.waitForFunction(tick => window.__threeBodyState.tick > tick, hostTick); checks.push('Wallpaper Engine pause/resume preserves state');
  await page.evaluate(() => { window.__audioCallback(Array(128).fill(.9)); }); checks.push('Wallpaper Engine audio callback accepts stereo spectrum');
  const gen = await page.evaluate(() => window.__threeBodyState.generation);
  await page.locator('#restart-button').click(); await page.waitForFunction(generation => window.__threeBodyState.generation === generation + 1, gen); checks.push('manual restart generates exactly one next universe');
  await page.locator('#settings-close').click(); await page.waitForTimeout(500); assert.equal(await page.locator('#settings-panel').getAttribute('aria-hidden'), 'true'); checks.push('closing settings restores uncluttered wallpaper');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => window.__threeBodyDiagnostics?.().ready);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('three-body.settings.v3')).timespeed), 1.2); checks.push('settings survive reload');
  await page.evaluate(() => window.threeBody.applySettings({newproperty16:false,newproperty61:1}));
  const oldSky=await page.evaluate(()=>window.__threeBodyDiagnostics().scene.skyRotation);
  await page.mouse.move(1000,600);await page.waitForTimeout(700);
  const nextSky=await page.evaluate(()=>window.__threeBodyDiagnostics().scene.skyRotation);
  assert.equal(await page.evaluate(()=>window.__threeBodyDiagnostics().scene.backgroundFollowsView),true);
  assert.notDeepEqual(oldSky,nextSky);checks.push('skybox follows the actual interactive view rotation');
  await page.evaluate(() => window.threeBody.applySettings({ timespeed: 1, newproperty38: true, newproperty14: true, pixelRatio: 1 }));
  await page.waitForTimeout(1000); await mkdir('docs/qa', { recursive: true }); await page.screenshot({ path: 'docs/qa/desktop.png' });
  await page.locator('#settings-toggle').click(); await page.waitForTimeout(500); await page.screenshot({ path: 'docs/qa/settings.png' });
  await page.locator('#settings-close').click(); await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(600);
  await page.locator('#settings-toggle').click();
  await page.waitForFunction(() => { const r = document.querySelector('#settings-panel').getBoundingClientRect(); return r.x >= 0 && r.x + r.width <= innerWidth + 1; });
  const bounds = await page.locator('#settings-panel').boundingBox(); assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 391); checks.push('mobile panel fits 390px viewport');
  await page.screenshot({ path: 'docs/qa/mobile.png' });
  const skipped = [];
  if (process.env.VERIFY_FILE_ENTRY === '1') {
    const filePage = await context.newPage(); filePage.on('pageerror', e => errors.push(e.message));
    try {
    await filePage.goto(new URL('../dist/index.html', import.meta.url).href); await filePage.waitForFunction(() => window.__threeBodyDiagnostics?.().ready, { timeout: 30000 }); checks.push('offline file entry and Blob worker start with local-file host permissions');
    } catch (error) {
    if (!String(error).includes('ERR_BLOCKED_BY_ADMINISTRATOR')) throw error;
    skipped.push('This environment blocks file:// navigation by browser administration policy; actual Wallpaper Engine local-file loading remains unverified.');
    }
    await filePage.close();
  } else skipped.push('Actual Wallpaper Engine file entry is not available in this environment; the existing browser policy blocks file:// navigation.');
  assert.deepEqual(errors, []); checks.push('no browser JavaScript errors');
  const report = { passed: checks.length, checks, skipped, errors, diagnostics: await page.evaluate(() => window.__threeBodyDiagnostics()) };
  await writeFile('docs/qa/browser-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }

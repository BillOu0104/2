import test from 'node:test';
import assert from 'node:assert/strict';
import {ViewMotion} from '../src/view-motion.js';
import {normalizeSettings,migrateSettings} from './support/legacy-v055.js';
import {civilizationLevels,levelFor} from '../src/civilization-levels.js';
import {CivilizationState} from '../src/civilization-state.js';
import {Simulation} from './support/legacy-v055.js';

test('idle return cancels residual inertia and obeys one total angular-speed cap without overshoot',()=>{
 const m=new ViewMotion();m.x=.1;m.y=2*Math.PI+.2;m.vx=2;m.vy=-4;
 const distance=Math.hypot(.1,.2),speed=.003*Math.PI/180;
 m.returnToOrigin(1,.003);assert.equal(m.vx,0);assert.equal(m.vy,0);assert.ok(Math.abs(Math.hypot(m.x,m.y)-(distance-speed))<1e-14);
 let previous=Math.hypot(m.x,m.y);for(let i=0;i<100;i++){m.returnToOrigin(1/60,.003);const current=Math.hypot(m.x,m.y);assert.ok(current<=previous);assert.ok(previous-current<=speed/60+1e-14);previous=current;}
 m.returnToOrigin(100000,.003);assert.equal(m.x,0);assert.equal(m.y,0);m.returnToOrigin(1);assert.equal(m.y,0);
});
test('galaxy-return migration is once-only and retains custom speeds and independent view preferences',()=>{
 const old=migrateSettings({presentationRevision:6,newproperty51:.01,viewSensitivity:.04,layout:{clock:{x:20,y:12}}});assert.equal(old.newproperty51,.006);assert.equal(old.viewSensitivity,.04);assert.deepEqual(old.layout.clock,{x:20,y:12});
 assert.equal(migrateSettings({presentationRevision:6,newproperty51:.001}).newproperty51,.001);
 assert.equal(migrateSettings({...old,newproperty51:.01}).newproperty51,.01);assert.equal(normalizeSettings().newproperty51,.006);
});
test('centering toggle and galaxy motion settings do not change trajectories or energy diagnostics',()=>{
 const a=new Simulation({seed:'V053-RENDER-ONLY',autorestart:false}),b=new Simulation({seed:'V053-RENDER-ONLY',autorestart:false,centerOnSystem:false,newproperty51:.1});
 for(let i=0;i<1200;i++){a.tick();b.tick();}assert.deepEqual(a.snapshot().bodies,b.snapshot().bodies);assert.deepEqual(a.snapshot().physics,b.snapshot().physics);
});
test('technology starts at the Paleolithic age and no longer reaches a space age after 350 production years',()=>{
 assert.equal(civilizationLevels.length,12);assert.equal(levelFor(0).zh,'旧石器时代');assert.equal(levelFor(199.9).level,1);assert.equal(levelFor(200).zh,'新石器时代');assert.equal(levelFor(350).level,2);assert.equal(levelFor(800).zh,'青铜时代');assert.equal(levelFor(40000).level,12);
 assert.equal(levelFor(40000,false).level,1);
});
test('technology never advances during current-frame unsafe climate, dormancy or terminal destruction',()=>{
 const config=normalizeSettings(),shared={civilizationAlive:true,civilizationCount:1,civilizationStartTime:0,civilizationRecords:[],universeNumber:1},c=new CivilizationState(shared);
 const safe={planet:{temperature:20,terminal:null},phenomena:[],safeToWake:true},hab={canGrow:true,comfortable:true,thermalFatal:false};c.update(safe,hab,config,0,0);
 c.update({...safe,planet:{temperature:1500,terminal:null}},{...hab,canGrow:false,comfortable:false},config,100,1);assert.equal(c.developmentYears,0);
 c.phase='dormant';c.update(safe,hab,config,200,2);assert.equal(c.developmentYears,0);
 c.phase='active';c.update({...safe,planet:{temperature:20,terminal:{kind:'engulfed',zh:'测试',en:'Test'}}},hab,config,300,3);assert.equal(c.developmentYears,0);assert.equal(shared.civilizationAlive,false);
});

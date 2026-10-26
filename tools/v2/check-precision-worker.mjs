import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'v2-h8-smoke-'));
try {
 const cfg={prefix:'V2-H8-SMOKE',start:0,seeds:1,modes:['deflect-v2','reflect-v2'],horizons:[1],precision:{maxStep:.00009375,eta:.0009375},output:dir};
 const config=path.join(dir,'config.json');fs.writeFileSync(config,JSON.stringify(cfg));
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({sourceHash:'SMOKE_NOT_FORMAL_EVIDENCE',configHash:sha(config),files:{'tools/v2/batch-precision-v2.mjs':sha('tools/v2/batch-precision-v2.mjs'),'tools/v2/precision-options.mjs':sha('tools/v2/precision-options.mjs')}}));
 const run=()=>spawnSync(process.execPath,['tools/v2/batch-precision-v2.mjs',config,'0','1'],{encoding:'utf8'});
 let r=run();assert.equal(r.status,0,r.stderr);
 let files=fs.readdirSync(path.join(dir,'endpoints'));assert.equal(files.length,2);
 const frozen=new Map();
 for(const file of files){const p=path.join(dir,'endpoints',file),v=JSON.parse(fs.readFileSync(p));assert.equal(v.integratedYears,1);assert(v.steps>=4800);assert.equal(v.stellarIntact,true);assert.equal(v.numericalUNKNOWN,null);for(const p2 of [p,v.rawFile,v.checkpoint])frozen.set(p2,sha(p2));}
 r=run();assert.equal(r.status,0,r.stderr);assert(!r.stdout.includes('"complete"'));
 for(const[p,h]of frozen)assert.equal(sha(p),h,'Completed result must not be overwritten');
 const deleted=path.join(dir,'endpoints',files[0]);fs.unlinkSync(deleted);r=run();assert.equal(r.status,0,r.stderr);assert.equal(fs.readdirSync(path.join(dir,'endpoints')).length,2);
 assert(fs.readdirSync(dir).some(p=>p.includes('.unpublished-')),'Prepublication files must be preserved');
 const cp=path.join(dir,'V2-H8-SMOKE-0-deflect-v2.checkpoint.json'),x=JSON.parse(fs.readFileSync(cp));x.precision.maxStep=.0001875;fs.writeFileSync(cp,JSON.stringify(x));
 r=run();assert.notEqual(r.status,0,'Mismatched complete-state precision must reject recovery');
 console.log(JSON.stringify({status:'PASS',scope:'One-year smoke only; not a long-window result',modes:2,realStepsPerFrameAtLeast:80,unchangedCompletedEndpoints:true,prepublicationRecovery:true,precisionMismatchRejected:true,temporaryFilesCleaned:true}));
} finally {fs.rmSync(dir,{recursive:true,force:true});}

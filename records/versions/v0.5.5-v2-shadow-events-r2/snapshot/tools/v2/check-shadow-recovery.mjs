import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {decodeV2} from '../../src/v2-checkpoint.js';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'v2-recovery-')),output=process.argv[2]??'docs/integration-v2/results/batch-shadow-recovery.json',checks=[],logs=[];
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
try{
 const config=root+'/study.json',dir=root+'/results';fs.mkdirSync(dir);fs.writeFileSync(config,JSON.stringify({prefix:'V2-RECOVERY-SMOKE',seeds:1,modes:['deflect-v2'],start:0,horizons:[1,2],output:dir}));fs.writeFileSync(dir+'/manifest.json',JSON.stringify({sourceHash:'recovery-test-only',configHash:sha(config),files:{[config]:sha(config),'tools/v2/batch-worker-v2.mjs':sha('tools/v2/batch-worker-v2.mjs')}}));
 const run=()=>{const r=spawnSync(process.execPath,['tools/v2/batch-worker-v2.mjs',config],{encoding:'utf8'});logs.push({status:r.status,stdout:r.stdout,stderr:r.stderr});return r;};
 assert.equal(run().status,0);const rowsFile=dir+'/shard0.jsonl',lines=fs.readFileSync(rowsFile,'utf8').trim().split('\n');assert.equal(lines.length,2);const last=JSON.parse(lines[1]),continuous=decodeV2(fs.readFileSync(last.checkpoint,'utf8'));
 assert.equal(run().status,0);assert.equal(fs.readFileSync(rowsFile,'utf8').trim().split('\n').length,2);checks.push('Primary+shadow endpoint keys are audited and skipped without duplicate rows');
 // Emulate a stop after the atomic full-state checkpoint and before appending its endpoint row.
 fs.writeFileSync(rowsFile,lines[0]+'\n');assert.equal(run().status,0);const restored=JSON.parse(fs.readFileSync(rowsFile,'utf8').trim().split('\n')[1]),resumed=decodeV2(fs.readFileSync(restored.checkpoint,'utf8'));assert.deepEqual(resumed.simulation,continuous.simulation);assert.deepEqual(resumed.observer,continuous.observer);assert.equal(restored.integratedYears,2);checks.push('Checkpoint-to-result interruption resumes the same physical state without resetting or double-counting');
 fs.appendFileSync(restored.rawFile,' ');assert.notEqual(run().status,0);checks.push('Changed raw-result SHA is rejected before continuing');
 fs.writeFileSync(output,JSON.stringify({pass:true,checks,logs,scope:'Temporary runner fault/restore tests; all fixture files removed afterward, no research outcomes'},null,2)+'\n');console.log(JSON.stringify({pass:true,checks}));
}finally{fs.rmSync(root,{recursive:true,force:true});}

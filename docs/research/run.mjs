import {readFileSync,writeFileSync,openSync,writeSync,fsyncSync,closeSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {runTrial} from './engine.mjs';
const configPath=process.argv[2];if(!configPath)throw Error('Usage: node docs/research/run.mjs CONFIG.json');
const cfg=JSON.parse(readFileSync(configPath)),dir=path.dirname(configPath),out=path.join(dir,cfg.output),manifest=out+'.manifest.json';mkdirSync(path.dirname(out),{recursive:true});
const hash=createHash('sha256').update(readFileSync(new URL('./engine.mjs',import.meta.url))).update(readFileSync(configPath)).digest('hex');
if(existsSync(manifest)&&JSON.parse(readFileSync(manifest)).hash!==hash)throw Error('Engine/config hash mismatch: create a new output instead of mixing results');
writeFileSync(manifest,JSON.stringify({hash,config:cfg,baseline:'c7a53a01def5f9d60389ee20ec0f8bac5210ed69',node:process.version,started:new Date().toISOString()},null,2)+'\n');
const keys=new Set();if(existsSync(out)){const raw=readFileSync(out,'utf8');if(raw&&!raw.endsWith('\n'))throw Error('Truncated JSONL tail: repair explicitly before resume');for(const l of raw.trim().split('\n').filter(Boolean)){const r=JSON.parse(l);keys.add(`${r.profile}:${r.seed}`);}}
const fd=openSync(out,'a');let done=0;const start=performance.now();
try{for(let i=cfg.start??0;i<(cfg.start??0)+cfg.seeds;i++)for(const profile of cfg.profiles){const seed=`${cfg.prefix}-${i}`,key=`${profile.id}:${seed}`;if(keys.has(key))continue;const r=runTrial(seed,profile,profile.horizon??cfg.horizon);writeSync(fd,JSON.stringify(r)+'\n');fsyncSync(fd);done++;if(done%8===0)console.log(JSON.stringify({done,seed,profile:profile.id,seconds:Math.round((performance.now()-start)/1000),lastSteps:r.steps}));}}finally{closeSync(fd);}
console.log(JSON.stringify({complete:true,newRuns:done,totalExisting:keys.size,output:out,seconds:(performance.now()-start)/1000}));

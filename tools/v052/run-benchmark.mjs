import {runTrial} from './benchmark-engine.mjs';
import {readFile,writeFile,mkdir,appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const config=JSON.parse(await readFile(process.argv[2]??'tools/v052/acceptance-config.json','utf8'));
await mkdir('docs/v052/results',{recursive:true});
const files=['src/physics/gravity.js','src/orbital-initialization.js','src/legacy/008.js','src/settings.js','src/world-state.js','tools/v052/research-reference.mjs','tools/v052/benchmark-engine.mjs','tools/v052/run-benchmark.mjs'];
const hashes=Object.fromEntries(await Promise.all(files.map(async f=>[f,createHash('sha256').update(await readFile(f)).digest('hex')])));
const out=config.output,manifest={config,hashes,baseCommit:'c7a53a01def5f9d60389ee20ec0f8bac5210ed69',researchCommit:'c198020',node:process.version,started:new Date().toISOString(),protocol:'Research first-loss endpoints; absorbing planet losses terminate integration. All seeds retained, no trajectory selection. Full-window stable fraction after first loss is zero. Numerical failure is separately censored, never a physical death.'};
// Refuse to overwrite results. A new prefix/file is required for a distinct experiment.
await writeFile(out,'',{flag:'wx'});
await writeFile(out+'.manifest.json',JSON.stringify(manifest,null,2)+'\n');
let count=0;
for(let n=config.start??0;n<(config.start??0)+config.seeds;n++)for(const profile of config.profiles){
 const row=runTrial(`${config.prefix}-${n}`,profile,config.horizon);
 await appendFile(out,JSON.stringify(row)+'\n');
 if(++count%24===0)console.log(`${count}/${config.seeds*config.profiles.length} observations complete`);
}
for(const [file,hash]of Object.entries(hashes))if(createHash('sha256').update(await readFile(file)).digest('hex')!==hash)throw Error(`Source changed during experiment: ${file}`);
manifest.finished=new Date().toISOString();manifest.observations=count;
await writeFile(out+'.manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log(`Saved ${count} observations: ${out}`);

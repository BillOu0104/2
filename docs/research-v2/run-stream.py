#!/usr/bin/env python3
"""Transport-only fallback: identical frozen native binary/input, unbounded file stdout.

Install ijson3.3.0 into /tmp/codex-v2-python; no production dependencies change.
The scientific source/config hashes remain unchanged; this transport has its own hash.
"""
import datetime,fcntl,gzip,hashlib,json,os,pathlib,shutil,subprocess,sys,time
sys.path.insert(0,'/tmp/codex-v2-python')
import ijson
from ijson.common import ObjectBuilder
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
def metadata(file):
 data={};key=None;builder=None;events=0
 with open(file,'rb') as f:
  for prefix,event,value in ijson.parse(f,use_float=True):
   if prefix=='' and event=='map_key':key=value;builder=None;continue
   if key in ['events','history']:
    if key=='events' and prefix=='events.item' and event=='end_map':events+=1
    continue
   if key is None:continue
   if builder is not None:
    builder.event(event,value)
    if prefix==key and event in ['end_array','end_map']:data[key]=builder.value;builder=None
   elif prefix==key:
    if event in ['start_array','start_map']:builder=ObjectBuilder();builder.event(event,value)
    elif event not in ['map_key','end_array','end_map']:data[key]=value
 return data,events
def digest(file):
 h=hashlib.sha256()
 with open(file,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def main():
 config=sys.argv[1];shard=int(sys.argv[2]) if len(sys.argv)>2 else 0;shards=int(sys.argv[3]) if len(sys.argv)>3 else 1;cfg=json.load(open(config));out=cfg['output'].replace('.jsonl',f'.shard{shard}.jsonl' if shards>1 else '.jsonl');pathlib.Path(out).parent.mkdir(parents=True,exist_ok=True)
 manifest=pathlib.Path(out+'.manifest.json')
 if not manifest.exists():
  files=['docs/research-v2/native.cpp','docs/research-v2/vendor/json.hpp','docs/research-v2/build-native.sh','docs/research-v2/run-native.mjs','docs/research-v2/engine.mjs','docs/research-v2/controllers/index.mjs']+[str(p) for p in sorted(pathlib.Path('src').glob('*.js'))]+['src/physics/gravity.js','src/legacy/008.js','src/legacy/079.js','src/legacy/010.js'];h=hashlib.sha256()
  for p in files:h.update(p.encode()+b'\0');h.update(pathlib.Path(p).read_bytes())
  mf={'sourceHash':h.hexdigest(),'configHash':digest(config),'binaryHash':digest('docs/research-v2/bin/native'),'sourceFiles':files,'config':cfg,'shard':shard,'shards':shards,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'compiler':subprocess.check_output(['g++','--version'],text=True).splitlines()[0],'flags':'-std=c++17 -O3 -ffp-contract=off -Wall -Wextra -pedantic'};manifest.write_text(json.dumps(mf,indent=2)+'\n')
 else:mf=json.load(open(manifest))
 h=hashlib.sha256()
 for p in mf['sourceFiles']:h.update(p.encode()+b'\0');h.update(pathlib.Path(p).read_bytes())
 assert h.hexdigest()==mf['sourceHash'],'frozen scientific sources changed'
 assert digest(config)==mf['configHash'],'config changed';assert digest('docs/research-v2/bin/native')==mf['binaryHash'],'binary changed'
 transportHash=digest(__file__);version=mf['sourceHash'][:16]+'-'+mf['configHash'][:16];rawdir=pathlib.Path(out).parent/'raw'/version;rawdir.mkdir(exist_ok=True,parents=True)
 with open(out+'.lock','a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-running');return
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'config':config,'shard':shard,'started':time.time()},lock);lock.flush();os.fsync(lock.fileno());pathlib.Path(out).touch(exist_ok=True);done=set()
  with open(out) as f:
   for line in f:
    r=json.loads(line);key=(r['seed'],r['profile']);assert key not in done,'duplicate';done.add(key)
  initJS="import{initialize,keys}from'./docs/research-v2/engine.mjs';let{bodies,settings}=initialize(process.argv[1],JSON.parse(process.argv[2]));console.log(JSON.stringify({settings,bodies:bodies.map(b=>({r:keys.slice(0,3).map(k=>b[k]),v:keys.slice(3).map(k=>b[k]),mass:b.mass}))}));"
  for i in range(cfg.get('start',0),cfg.get('start',0)+cfg['seeds']):
   if i%shards!=shard:continue
   seed=cfg['prefix']+'-'+str(i)
   for profile in cfg['profiles']:
    key=(seed,profile['id'])
    if key in done:continue
    stem=pathlib.Path(f"docs/research-v2/work/{version}-{i}-{profile['id']}");ip=str(stem)+'.input.json';cp=str(stem)+'.stream.checkpoint.json';full=str(stem)+'.stdout.json';err=str(stem)+'.stderr.log'
    initial=json.loads(subprocess.check_output(['node','--input-type=module','-e',initJS,seed,json.dumps(profile)]));input={'seed':seed,'profile':profile['id'],'sourceHash':mf['sourceHash'],'configHash':mf['configHash'],'horizon':cfg['horizon'],'controller':profile,**initial};pathlib.Path(ip).write_text(json.dumps(input,separators=(',',':')))
    start=time.monotonic()
    with open(full,'wb') as stdout,open(err,'wb') as stderr:code=subprocess.run(['docs/research-v2/bin/native',ip,cp],stdout=stdout,stderr=stderr,pass_fds=(lock.fileno(),)).returncode
    if code:print(json.dumps({'seed':seed,'profile':profile['id'],'status':code,'checkpoint':cp}),flush=True);raise SystemExit(code)
    elapsed=time.monotonic()-start;r,n=metadata(full);assert (r['seed'],r['profile'],r['sourceHash'],r['configHash'])==(seed,profile['id'],mf['sourceHash'],mf['configHash'])
    target=rawdir/f"{seed}-{profile['id']}.json.gz"
    with open(full,'rb') as src,open(str(target)+'.tmp','wb') as dest:
     with gzip.GzipFile(filename='',mode='wb',compresslevel=6,fileobj=dest,mtime=0) as z:shutil.copyfileobj(src,z,1024*1024)
     dest.flush();os.fsync(dest.fileno())
    os.replace(str(target)+'.tmp',target);r.update(rawFile=str(target),rawSHA256=digest(target),eventCount=n,transportSHA256=transportHash,transport='file stdout + ijson metadata, identical frozen physics',transportWallSeconds=elapsed)
    if pathlib.Path(cp).exists() and (cfg.get('saveCheckpoints',False) or r['numericallyCensored']):
     statedir=pathlib.Path(out).parent/'checkpoints'/version;statedir.mkdir(parents=True,exist_ok=True);statefile=statedir/f"{seed}-{profile['id']}.state.json.gz";inputfile=statedir/f"{seed}-{profile['id']}.input.json"
     with open(cp,'rb') as src,open(str(statefile)+'.tmp','wb') as dest:
      with gzip.GzipFile(filename='',mode='wb',compresslevel=6,fileobj=dest,mtime=0) as z:shutil.copyfileobj(src,z,1024*1024)
      dest.flush();os.fsync(dest.fileno())
     os.replace(str(statefile)+'.tmp',statefile);shutil.copyfile(ip,inputfile);r.update(stateCheckpoint=str(statefile),stateCheckpointSHA256=digest(statefile),stateInput=str(inputfile),stateInputSHA256=digest(inputfile))
    with open(out,'a') as f:f.write(json.dumps(r,separators=(',',':'))+'\n');f.flush();os.fsync(f.fileno())
    done.add(key)
    for p in [ip,cp,full,err]:pathlib.Path(p).unlink(missing_ok=True)
    print(json.dumps({'seed':seed,'profile':profile['id'],'stars':r['stellarIntact'],'years':r['integratedYears'],'events':n,'seconds':elapsed,'maxRSSMiB':r['maxRSSKiB']/1024}),flush=True)
if __name__=='__main__':main()

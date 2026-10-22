#!/usr/bin/env python3
"""Two-worker, hash-locked JS integration diagnostics. Never modifies main."""
import argparse,datetime,fcntl,hashlib,json,os,pathlib,subprocess,time
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
BRANCH='integration/minimal-chaos-control-v2'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
def run(*args,**kw):return subprocess.run(args,check=True,**kw)
def write(p,data):
 p=pathlib.Path(p);tmp=pathlib.Path(str(p)+'.tmp');p.parent.mkdir(parents=True,exist_ok=True)
 with tmp.open('w') as f:json.dump(data,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 os.replace(tmp,p)
def spec(config):
 cfg=json.load(open(config));assert git('branch','--show-current')==BRANCH
 files=[str(p) for p in sorted(pathlib.Path('src').rglob('*.js'))]+[config,'tools/v2/batch-worker.mjs','tools/v2/supervise.py',cfg['protocol']]
 hashes={p:sha(p) for p in files};h=hashlib.sha256()
 for p in files:h.update(p.encode()+b'\0'+bytes.fromhex(hashes[p]))
 return cfg,{'sourceHash':h.hexdigest(),'configHash':sha(config),'files':hashes}
def audit(cfg,mf):
 d=pathlib.Path(cfg['output']);rows=[];keys=set()
 for f in d.glob('shard*.jsonl'):
  for line in f.read_text().splitlines():
   r=json.loads(line);key=(r['seed'],r['mode'],r['horizon']);assert key not in keys;keys.add(key)
   assert r['sourceHash']==mf['sourceHash'] and r['configHash']==mf['configHash']
   for p,h in [('rawFile','rawSHA256'),('checkpoint','checkpointSHA256')]:assert sha(r[p])==r[h],r[p]
   raw=json.load(open(r['rawFile']));assert (raw['seed'],raw['mode'],raw['horizon'],raw['sourceHash'])==(*key,mf['sourceHash'])
   cp=json.load(open(r['checkpoint']));assert cp['sourceHash']==mf['sourceHash'] and cp['configHash']==mf['configHash']
   assert cp['simulation']['controlled']['frame']/60==r['integratedYears'];assert r['generation']==1
   rows.append(r)
 return rows

def main():
 ap=argparse.ArgumentParser();ap.add_argument('config');ap.add_argument('--register',action='store_true');ap.add_argument('--audit-only',action='store_true');a=ap.parse_args();cfg,expected=spec(a.config);d=pathlib.Path(cfg['output']);d.mkdir(parents=True,exist_ok=True);mp=d/'manifest.json'
 if a.register:
  run('git','diff','--quiet','HEAD','--',*expected['files']);run('git','ls-files','--error-unmatch','--',*expected['files'],stdout=subprocess.DEVNULL)
  if mp.exists():
   old=json.load(open(mp));assert {k:old[k] for k in expected}==expected
  else:write(mp,{**expected,'sourceCommit':git('rev-parse','HEAD'),'registered':now(),'scope':cfg['designation']})
  print(json.dumps({'registration':'PASS','sourceHash':expected['sourceHash']}));return
 mf=json.load(open(mp));assert {k:mf[k] for k in expected}==expected
 run('git','diff','--quiet','HEAD','--',*expected['files']);run('git','ls-files','--error-unmatch',str(mp),stdout=subprocess.DEVNULL)
 if a.audit_only:
  rows=audit(cfg,mf);print(json.dumps({'audit':'PASS','rows':len(rows),'UNKNOWN':sum(r['numericalUNKNOWN'] is not None for r in rows)}));return
 with (d/'supervise.lock').open('a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-active');return
  # Both research and integration worktrees share the same two CPUs.
  for root in [pathlib.Path('/workspace/2/docs/research-v2/results'),pathlib.Path('docs/integration-v2/results')]:
   for p in root.rglob('*.lock'):
    if p.resolve()==(d/'supervise.lock').resolve():continue
    with p.open('a+') as other:
     try:fcntl.flock(other,fcntl.LOCK_EX|fcntl.LOCK_NB)
     except BlockingIOError:print('other-active-lock',p);return
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'started':now(),'config':a.config},lock);lock.flush();os.fsync(lock.fileno())
  statepath=d/'supervise.state.json';old=json.load(open(statepath)) if statepath.exists() else {}
  if old.get('status')=='STOPPED_REVIEW_REQUIRED':raise RuntimeError('Prior stop requires evidence review; do not silently restart')
  rows=audit(cfg,mf);assert not any(r['numericalUNKNOWN'] for r in rows),'Existing UNKNOWN requires review'
  state={'status':'RUNNING','researchComplete':False,'sourceHash':mf['sourceHash'],'configHash':mf['configHash'],'started':old.get('started',now()),'updated':now(),'rows':len(rows),'expectedRows':cfg['seeds']*len(cfg['modes'])*len(cfg['horizons']),'sourceCommit':mf['sourceCommit']}
  workers=[]
  try:
   for shard in range(2):
    log=open(d/f'worker{shard}.log','a');p=subprocess.Popen(['node','tools/v2/batch-worker.mjs',a.config,str(shard),'2'],stdout=log,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((p,log))
   state['workers']=[p.pid for p,_ in workers];write(statepath,state)
   while any(p.poll() is None for p,_ in workers):
    time.sleep(10);state.update(updated=now(),rows=sum(len(f.read_text().splitlines()) for f in d.glob('shard*.jsonl')));write(statepath,state)
   codes=[p.wait() for p,_ in workers]
   for _,log in workers:log.close()
   if any(codes):raise RuntimeError('Worker interruption '+repr(codes)+'; raw/checkpoints preserved')
   assert spec(a.config)[1]==expected;rows=audit(cfg,mf);assert len(rows)==state['expectedRows'];assert not any(r['numericalUNKNOWN'] for r in rows)
   summary={'scope':cfg['designation'],'sourceHash':mf['sourceHash'],'rows':len(rows),'UNKNOWN':0,'groups':{}}
   for horizon in cfg['horizons']:
    for mode in cfg['modes']:
     rr=[r for r in rows if r['mode']==mode and r['horizon']==horizon];summary['groups'][f'{mode}-{horizon}']={'n':len(rr),'stellarIntact':sum(r['stellarIntact'] for r in rr),'stableMeanAll':sum(r['stableFraction'] for r in rr)/len(rr),'matureMeanAll':sum(r['matureStableFraction'] for r in rr)/len(rr) if horizon>10000 else None,'planetLosses':sum(r['planetLosses'] for r in rr),'chaosStatus':'GEOMETRY_ONLY_FTLE_NOT_MEASURED; not a chaos-qualified confirmation'}
   write(d/'summary.json',summary);state.update(status='DIAGNOSTICS_COMPLETE_REVIEW_REQUIRED',rows=len(rows),updated=now());write(statepath,state)
   previous=git('rev-parse','HEAD');run('git','add','--',str(d))
   if subprocess.run(['git','diff','--cached','--quiet']).returncode:run('git','commit','-qm','integration: preserve checkpointed JS1000/10000/30000 diagnostic results')
   ref=git('rev-parse','HEAD');ident='minimal-chaos-v2-js-diagnostics-'+cfg['id']
   if not (pathlib.Path('records/analyses')/ident).exists():
    run('python3','tools/records.py','capture','--kind','analysis','--id',ident,'--ref',ref,'--previous',previous,'--title','JS集成逐级窗口验证','--summary','同版完整状态续算、原始事件/失败/UNKNOWN及控制和行星成本；小样本数值诊断，不是128Seed长期确认，FTLE未测，main未改。');run('python3','tools/records.py','check');run('git','add','records');run('git','commit','-qm','records: archive JS integration diagnostic evidence')
   with (d/'push.log').open('a') as log:
    p=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=log,stderr=subprocess.STDOUT,timeout=180)
   state['push']={'confirmed':p.returncode==0,'returncode':p.returncode,'commit':git('rev-parse','HEAD'),'time':now()};write(statepath,state)
  except Exception as e:
   state.update(status='STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(statepath,state);raise
if __name__=='__main__':main()

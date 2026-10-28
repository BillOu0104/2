#!/usr/bin/env python3
"""Remaining96 h8 repeats after inconclusive first32; frozen physics, combined128 review."""
import argparse, datetime, fcntl, hashlib, json, os, pathlib, runpy, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
F=runpy.run_path(str(ROOT/'tools/v2/run-js-confirmation.py'))
sha,write,now=F['sha'],F['write'],F['now']
STUDY='docs/integration-v2/js-precision-h8-extension-v1/study.json'
BRANCH='integration/minimal-chaos-control-v2'
def spec():
 assert F['git']('branch','--show-current')==BRANCH
 s=json.load(open(STUDY));assert s['designation']=='JS_H8_NUMERICAL_EXTENSION_V1' and s['seeds']==96
 assert s['precision']=={'maxStep':.00009375,'eta':.0009375}
 # Preserve and revalidate every frozen computing input from the completed study.
 old=json.load(open(s['priorH8Manifest']))
 for p,h in old['files'].items():assert sha(p)==h,('Frozen confirmation source changed',p)
 files=list(old['files'])+[STUDY,s['protocol'],'tools/v2/run-js-precision-extension.py','tools/v2/check-js-h8-extension.py',s['priorH8Manifest'],s['priorH8Review']]
 prior=json.load(open(s['priorH8Study']))
 for p in prior['configs']:
  c=json.load(open(p));m=json.load(open(pathlib.Path(c['output'])/'manifest.json'));rr=audit(c,m,prior)
  assert len(rr)==64 and not any(r['numericalUNKNOWN'] for r in rr)
  files+=list(map(str,F['endpoints'](c)))
 for i,p in enumerate(s['configs']):
  c=json.load(open(p));assert c['start']==32+8*i and c['seeds']==8 and c['precision']==s['precision']
  assert c['modes']==['deflect-v2','reflect-v2'] and c['horizons']==[1000,10000,30000,100000]
  assert c['prefix']==s['prefix'] and c['initialRegistry']==s['initialRegistry'];files.append(p)
 assert len(s['configs'])==12
 # Freeze all256 matched h4 outcomes, including failures of chaos gates.
 for config in s['baseConfigs']:
  c=json.load(open(config));bm=json.load(open(pathlib.Path(c['output'])/'manifest.json'))
  rows=F['audit'](c,bm,json.load(open(s['initialRegistry'])))
  assert len(rows)==64 and not any(r['numericalUNKNOWN'] for r in rows)
  files+=list(map(str,F['endpoints'](c)))
 hashes={p:sha(p) for p in files};h=hashlib.sha256()
 for p,v in hashes.items():h.update(p.encode()+b'\0'+bytes.fromhex(v))
 return s,{'sourceHash':h.hexdigest(),'files':hashes,'studyHash':sha(STUDY)}
def audit(c,mf,s):
 rows=F['audit'](c,mf,json.load(open(s['initialRegistry'])))
 for r in rows:
  raw=json.load(open(r['rawFile']));cp=json.load(open(r['checkpoint']))
  assert r['precision']==raw['precision']==cp['precision']==s['precision']
  assert r['steps']>=80*cp['simulation']['controlled']['frame']
 return rows
def push(d,label):
 with (d/(label+'.push.log')).open('a') as f:
  try:
   r=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=f,stderr=subprocess.STDOUT,timeout=180)
   return {'confirmed':r.returncode==0,'returncode':r.returncode,'commit':F['git']('rev-parse','HEAD'),'time':now()}
  except Exception as e:return {'confirmed':False,'error':str(e),'time':now()}
def archive(d,c,rows):
 closed=F['endpoints'](c);tracked=set(F['git']('ls-files','--',str(pathlib.Path(c['output'])/'endpoints')).splitlines())
 new=[p for p in closed if str(p) not in tracked];label=c['id']+f'-e{len(closed):03}'
 proof=d/'archives'/(label+'.json');rid='minimal-chaos-v2-js-h8-extension-'+label;record=pathlib.Path('records/analyses')/rid
 if not new and record.exists():
  if not F['git']('ls-files','--',str(record/'record.json')):
   F['run']('python3','tools/records.py','check');F['run']('git','add','records');F['run']('git','commit','-qm','records: complete interrupted h8 archive '+label);return push(d,label)
  return None
 if new:
  assert subprocess.run(['git','diff','--cached','--quiet']).returncode==0,'Unexpected staged changes'
  previous=F['git']('rev-parse','HEAD');paths=[]
  for p in new:
   r=json.load(open(p));paths += [str(p),r['rawFile'],r['checkpoint']]
  write(proof,{'scope':'Matched h8 numerical diagnosis; not new independent seeds','time':now(),'sourceHash':rows[0]['sourceHash'],'previous':previous,'keys':[[r['seed'],r['mode'],r['horizon']] for r in rows]})
  F['run']('git','add','--',*paths,str(proof));F['run']('git','commit','-qm','research: checkpoint JS h8 diagnosis '+label)
 elif not proof.exists():return None
 ref=F['git']('log','-1','--format=%H','--',str(proof))
 if not record.exists():
  previous=json.load(open(proof))['previous']
  F['run']('python3','tools/records.py','capture','--kind','analysis','--id',rid,'--ref',ref,'--previous',previous,'--title','JS同初值h8数值诊断 '+label,'--summary','剩余96确认Seed重复精度，不作新独立确认；只收已完成端点和完整原始/主影子状态，保留全部失败UNKNOWN及成本，main未改。')
  F['run']('python3','tools/records.py','check');F['run']('git','add','records');F['run']('git','commit','-qm','records: archive JS h8 '+label)
 return push(d,label)
def review(s,rows,d):
 import numpy as np
 prior=json.load(open(s['priorH8Study']))
 for p in prior['configs']:
  c=json.load(open(p));rows+=audit(c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),prior)
 assert len(rows)==1024 and len({(r['seed'],r['mode'],r['horizon']) for r in rows})==1024
 old=[]
 for config in s['baseConfigs']:
  c=json.load(open(config));old+=F['audit'](c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),json.load(open(s['initialRegistry'])))
 base={(r['seed'],r['mode']):r for r in old if r['horizon']==100000}
 idx=np.random.default_rng(20261026).integers(0,128,size=(20000,128));groups={}
 for mode in ['deflect-v2','reflect-v2']:
  rr=sorted([r for r in rows if r['horizon']==100000 and r['mode']==mode],key=lambda r:int(r['seed'].rsplit('-',1)[1]))
  assert len(rr)==128 and not any(r['numericalUNKNOWN'] for r in rr)
  delta=np.array([r['matureStableFraction']-base[(r['seed'],mode)]['matureStableFraction'] for r in rr]);ci=np.quantile(delta[idx].mean(axis=1),[.025,.975]).tolist()
  groups[mode]={'n':128,'h8Intact':sum(r['stellarIntact'] for r in rr),'h8Joint':sum(r['joint'] for r in rr),'h4MatureMean':float(np.mean([base[(r['seed'],mode)]['matureStableFraction'] for r in rr])),'h8MatureMean':float(np.mean([r['matureStableFraction'] for r in rr])),'h8MinusH4Mean':float(delta.mean()),'pairedBootstrap95':ci,'withinPrespecified5PercentagePointDiagnosticMargin':ci[0]>=-.05 and ci[1]<=.05,'stellarWilson95':F['wilson'](sum(r['stellarIntact'] for r in rr),128)}
 write(d/'review.json',{'status':'JS_PRECISION_H8_EXTENSION_COMPLETE_REVIEW_REQUIRED','researchComplete':False,'scope':'128 matched numerical repeats (32 original plus96 extension); does not increase independent confirmation size; non-significance is not equivalence','rows':len(rows),'UNKNOWN':0,'groups':groups,'bootstrap':{'seed':20261026,'replicates':20000},'next':'Review complete cost/chaos/precision evidence. If CI does not fit fixed margin, do not declare convergence; retain uncertainty; evaluate additional precision only with a new protocol, never relabel non-significance as equivalence.'})
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--register',action='store_true');ap.add_argument('--audit-only',action='store_true');a=ap.parse_args()
 s,expected=spec();d=pathlib.Path(s['output']);d.mkdir(parents=True,exist_ok=True);mp=d/'manifest.json';sp=d/'supervise.state.json'
 if a.register:
  F['run']('git','diff','--quiet','HEAD','--',*expected['files']);F['run']('git','ls-files','--error-unmatch','--',*expected['files'],stdout=subprocess.DEVNULL)
  if mp.exists():assert {k:json.load(open(mp))[k] for k in expected}==expected
  else:write(mp,{**expected,'sourceCommit':F['git']('rev-parse','HEAD'),'registered':now()})
  registered=json.load(open(mp))
  for p in s['configs']:
   c=json.load(open(p));bm={**expected,'sourceCommit':registered['sourceCommit'],'configHash':sha(p)};target=pathlib.Path(c['output'])/'manifest.json'
   if target.exists():assert json.load(open(target))==bm
   else:write(target,bm)
  print(json.dumps({'registration':'PASS','sourceHash':expected['sourceHash']}));return
 assert {k:json.load(open(mp))[k] for k in expected}==expected
 if a.audit_only:
  rows=[]
  for p in s['configs']:
   c=json.load(open(p));rows+=audit(c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),s)
  print(json.dumps({'audit':'PASS','rows':len(rows),'UNKNOWN':sum(bool(r['numericalUNKNOWN']) for r in rows)}));return
 with (d/'supervise.lock').open('a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-active');return
  for folder in ['/workspace/2/docs/research-v2/results','docs/integration-v2/results']:
   for p in pathlib.Path(folder).rglob('*.lock'):
    if p.resolve()==(d/'supervise.lock').resolve():continue
    with p.open() as f:
     try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
     except BlockingIOError:print('other-active',p);return
  state=json.load(open(sp)) if sp.exists() else {'started':now(),'researchComplete':False,'completed':[]}
  if state.get('status')=='JS_PRECISION_H8_EXTENSION_COMPLETE_REVIEW_REQUIRED':print('completed; review required; no integration restarted');return
  assert state.get('status')!='STOPPED_REVIEW_REQUIRED','Review preserved error/UNKNOWN first'
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'study':STUDY,'started':now()},lock);lock.flush();os.fsync(lock.fileno())
  workers=[];allrows=[];c=None;bm=None
  try:
   state['recoveryPush']=push(d,'recovery-current')
   for p in s['configs']:
    assert spec()[1]==expected;c=json.load(open(p));bm=json.load(open(pathlib.Path(c['output'])/'manifest.json'));rows=audit(c,bm,s)
    assert not any(r['numericalUNKNOWN'] for r in rows)
    state.update(status='RUNNING',batch=c['id'],updated=now(),sourceHash=expected['sourceHash'],rows=len(allrows)+len(rows),expectedRows=768);write(sp,state)
    if len(rows)<64:
     for shard in range(2):
      f=open(pathlib.Path(c['output'])/f'worker{shard}.log','a');worker=subprocess.Popen(['node','tools/v2/batch-precision-v2.mjs',p,str(shard),'2'],stdout=f,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((worker,f))
     state['workers']=[w.pid for w,_ in workers];write(sp,state);last=time.monotonic()
     while any(w.poll() is None for w,_ in workers):
      time.sleep(10);codes=[w.poll() for w,_ in workers]
      if any(code not in [None,0] for code in codes):
       if any(code is not None and code<0 for code in codes):raise InterruptedError('Worker signal; complete same-version checkpoint retained')
       raise RuntimeError('Worker error/UNKNOWN; review preserved logs '+repr(codes))
      state.update(updated=now(),rows=len(allrows)+len(F['endpoints'](c)));write(sp,state)
      if time.monotonic()-last>=600:
       saved=archive(d,c,audit(c,bm,s))
       if saved:state['lastPush']=saved;write(sp,state)
       last=time.monotonic()
     for _,f in workers:f.close()
     workers=[]
    rows=audit(c,bm,s);assert len(rows)==64 and not any(r['numericalUNKNOWN'] for r in rows)
    saved=archive(d,c,rows);allrows+=rows
    state.update(rows=len(allrows),updated=now());state['completed']=sorted(set(state['completed']+[c['id']]))
    if saved:state['lastPush']=saved
    write(sp,state)
   review(s,allrows,d);previous=F['git']('rev-parse','HEAD');F['run']('git','add','--',str(d/'review.json'));F['run']('git','commit','-qm','research: preserve matched JS h8 diagnostic statistics')
   F['run']('python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-js-h8-extension-final-review','--ref','HEAD','--previous',previous,'--title','JS同初值h8数值诊断统计','--summary','合计128重复Seed两候选，含固定配对区间与5个百分点诊断边界，非新确认，全部失败/UNKNOWN保留。')
   F['run']('python3','tools/records.py','check');F['run']('git','add','records');F['run']('git','commit','-qm','records: archive JS h8 diagnostic statistics');state['lastPush']=push(d,'final-review')
   state.update(status='JS_PRECISION_H8_EXTENSION_COMPLETE_REVIEW_REQUIRED',updated=now());write(sp,state)
  except BaseException as e:
   for w,f in workers:
    if w.poll() is None:w.terminate()
    try:w.wait(timeout=30)
    except subprocess.TimeoutExpired:w.kill();w.wait()
    f.close()
   try:
    if c is not None and spec()[1]==expected:
     saved=archive(d,c,audit(c,bm,s))
     if saved:state['lastPush']=saved
   except Exception as err:state['errorArchive']=str(err)
   state.update(status='INTERRUPTED_RESUMABLE' if isinstance(e,(KeyboardInterrupt,InterruptedError)) else 'STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(sp,state);raise
if __name__=='__main__':main()

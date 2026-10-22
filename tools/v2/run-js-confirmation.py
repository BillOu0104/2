#!/usr/bin/env python3
"""Frozen128Seed JS holdout; immutable endpoints, complete primary+shadow resume."""
import argparse,datetime,fcntl,hashlib,json,math,os,pathlib,signal,struct,subprocess,time
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT);BRANCH='integration/minimal-chaos-control-v2'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def git(*a):return subprocess.check_output(['git',*a],text=True).strip()
def run(*a,**kw):return subprocess.run(a,check=True,**kw)
def write(p,x):
 p=pathlib.Path(p);p.parent.mkdir(parents=True,exist_ok=True);tmp=pathlib.Path(str(p)+'.tmp')
 with tmp.open('w') as f:json.dump(x,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 os.replace(tmp,p)
def spec(file):
 assert git('branch','--show-current')==BRANCH;s=json.load(open(file));assert s['designation']=='INDEPENDENT_JS_CONFIRMATION_V1' and s['seeds']==128 and len(s['configs'])==16
 reg=json.load(open(s['initialRegistry']));assert reg['count']==reg['uniqueInitialStates']==128 and reg['overlapWithPrior']==0
 for i,p in enumerate(s['configs']):
  c=json.load(open(p));assert c['start']==i*8 and c['seeds']==8 and c['prefix']==s['prefix'] and c['modes']==['deflect-v2','reflect-v2'] and c['horizons']==[1000,10000,30000,100000] and c['initialRegistry']==s['initialRegistry']
 files=[str(p) for p in sorted(pathlib.Path('src').rglob('*.js'))]+[file,s['protocol'],s['initialRegistry'],s['priorRegistry'],'tools/v2/register-js-initials.mjs','tools/v2/chaos-observer.mjs','tools/v2/batch-worker-v2.mjs','tools/v2/run-js-confirmation.py','tools/v2/review-js-confirmation.py',*s['configs']]
 hashes={p:sha(p) for p in files};h=hashlib.sha256()
 for p in files:h.update(p.encode()+b'\0'+bytes.fromhex(hashes[p]))
 return s,{'sourceHash':h.hexdigest(),'studyHash':sha(file),'files':hashes}
def endpoints(c):return sorted((pathlib.Path(c['output'])/'endpoints').glob('*.json'))
def audit(c,mf,registry):
 rows=[];keys=set()
 for p in endpoints(c):
  r=json.load(open(p));key=(r['seed'],r['mode'],r['horizon']);assert key not in keys;keys.add(key);assert r['sourceHash']==mf['sourceHash'] and r['configHash']==mf['configHash'];assert r['mode'] in c['modes'] and r['horizon'] in c['horizons'];assert r['seed'] in {c['prefix']+'-'+str(i) for i in range(c['start'],c['start']+c['seeds'])}
  for k,h in [('rawFile','rawSHA256'),('checkpoint','checkpointSHA256')]:assert sha(r[k])==r[h],r[k]
  raw=json.load(open(r['rawFile']));cp=json.load(open(r['checkpoint']));assert (raw['seed'],raw['mode'],raw['horizon'],raw['sourceHash'],raw['configHash'])==(*key,mf['sourceHash'],mf['configHash']);assert cp['sourceHash']==mf['sourceHash'] and cp['configHash']==mf['configHash'];assert cp['seed']==r['seed'] and cp['mode']==r['mode']
  primary=cp['simulation']['controlled'];assert primary['frame']/60==r['integratedYears'] and r['generation']==1 and r['steps']>=40*primary['frame'];assert r['integratedYears']<=r['horizon']
  assert abs(r['solverTime']-.45*r['integratedYears'])<.01,'physical time mismatch'
  values=[b[k] for b in raw['initialBodies'] for k in ['x','y','z','vx','vy','vz','mass']];signature=hashlib.sha256(b''.join(struct.pack('>d',float(v)) for v in values)).hexdigest();assert signature==registry['seeds'][r['seed']]['initialSHA256']
  if not r['observerUNKNOWN']:assert cp['observer']['state']['frame']==primary['frame']
  assert r['starFailure']==raw['stellarFailure'] and r['observerUNKNOWN']==raw['metrics']['observerUNKNOWN']
  total=r['horizon']*60;metrics=raw['metrics'];mature=(r['horizon']-10000)*60
  assert r['stableFraction']==metrics['stableFrames']/total and r['absentFraction']==metrics['absentFrames']/total
  assert r['matureStableFraction']==(metrics['matureStableFrames']/mature if mature>0 else None)
  assert r['civilizationBirths']==metrics['births'] and r['civilizationDeaths']==metrics['deaths'] and r['civilizationAliveFraction']==metrics['aliveFrames']/total
  assert r['control']==raw['control']==primary['cost'] and r['planetExternal']==raw['planetExternal']==primary['external']
  assert r['planetLosses']==primary['planetLosses'] and r['planetRespawns']==primary['planetRespawns'] and r['firstPlanetLoss']==primary['firstPlanetLoss']
  assert raw['finalBodies']==primary['bodies'] and r['steps']==cp['simulation']['integrator']['steps'] and r['solverTime']==cp['simulation']['integrator']['time']
  for key,value in raw['chaos'].items():assert r[key]==value,(key,'raw chaos/index mismatch')
  cs=cp['observer']['state'];ftle=cs['matureLog']/cs['matureYears'] if cs['matureYears']>0 else None;assert r['matureConditionalFTLE']==ftle
  expected_joint=r['horizon']==100000 and r['stellarIntact'] and ftle is not None and ftle>.003 and r['tightPairChanges']>=20 and r['longestDynamicalHierarchyYears']<1000 and r['longestHierarchyYears']<=5000 and r['matureNonhierFraction']>=.1
  assert r['joint']==expected_joint
  if r['stellarIntact']:assert r['integratedYears']==r['horizon'] and r['starFailure'] is None and r['numericalUNKNOWN'] is None
  rows.append(r)
 return rows
def push(d,label):
 try:
  p=d/(label+'.push.log')
  with p.open('a') as f:r=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=f,stderr=subprocess.STDOUT,timeout=180)
  return {'confirmed':r.returncode==0,'returncode':r.returncode,'time':now(),'commit':git('rev-parse','HEAD')}
 except Exception as e:return {'confirmed':False,'error':str(e),'time':now()}
def archive(d,c,rows):
 closed=endpoints(c);tracked=set(git('ls-files','--',str(pathlib.Path(c['output'])/'endpoints')).splitlines());new=[p for p in closed if str(p) not in tracked]
 count=len(closed);label=c['id']+f'-e{count:03}';progress=d/'archives'/(label+'.json');record=pathlib.Path('records/analyses')/('minimal-chaos-v2-js-confirm-'+label)
 if not new and record.exists():
  if not git('ls-files','--',str(record/'record.json')):
   run('python3','tools/records.py','check');run('git','add','records');run('git','commit','-qm','records: complete interrupted JS archive '+label);return push(d,label)
  return None
 if not new and not progress.exists():return None
 if new:
  assert subprocess.run(['git','diff','--cached','--quiet']).returncode==0,'Unexpected staged changes'
  paths=[]
  for p in new:
   r=json.load(open(p));paths += [str(p),r['rawFile'],r['checkpoint']]
  data={'scope':'Partial JS holdout endpoints; not completed128Seed100000year claim','batch':c['id'],'closedEndpoints':count,'keys':[[r['seed'],r['mode'],r['horizon']] for r in rows],'sourceHash':rows[0]['sourceHash'],'baseCommit':git('rev-parse','HEAD'),'time':now()};write(progress,data);paths.append(str(progress));run('git','add','--',*paths);run('git','commit','-qm','integration: checkpoint immutable JS holdout '+label);ref=git('rev-parse','HEAD')
 else:ref=git('log','-1','--format=%H','--',str(progress))
 if not record.exists():
  data=json.load(open(progress));run('python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-js-confirm-'+label,'--ref',ref,'--previous',data['baseCommit'],'--title','独立JS确认中间检查点 '+label,'--summary','只归档已实测端点、全原始事件和主/影子完整状态；短窗口和pending不称100000年完成，全部失败/UNKNOWN/行星/文明/脉冲成本保留，main未改。');run('python3','tools/records.py','check');run('git','add','records');run('git','commit','-qm','records: archive JS holdout checkpoint '+label)
 return push(d,label)
def wilson(k,n):
 if not n:return None
 z=1.959963984540054;p=k/n;den=1+z*z/n;center=(p+z*z/(2*n))/den;half=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [max(0,center-half),min(1,center+half)]
def summary(study,rows):
 out={'researchComplete':False,'scope':'JS independent confirmation; pending never counted as failure or success','registeredSeeds':128,'windowRowsObserved':len(rows),'groups':{}}
 for mode in ['deflect-v2','reflect-v2']:
  rr=[r for r in rows if r['mode']==mode and r['horizon']==100000];complete=[r for r in rr if r['stellarIntact']];known=[r for r in rr if not r['numericalUNKNOWN']];joint=sum(r['joint'] for r in rr);n=len(rr)
  out['groups'][mode]={'planned':128,'observed':n,'pending':128-n,'intact':len(complete),'physicalFailures':sum(r['starFailure'] is not None for r in rr),'UNKNOWN':sum(r['numericalUNKNOWN'] is not None for r in rr),'stellarWilson95':wilson(len(complete),len(known)),'joint':joint,'jointWilson95':wilson(joint,len(known)),'matureMeanAllObserved':sum(r['matureStableFraction'] for r in rr)/n if n else None,'matureMeanStellarSurvivors':sum(r['matureStableFraction'] for r in complete)/len(complete) if complete else None}
 return out
def main():
 ap=argparse.ArgumentParser();ap.add_argument('study');ap.add_argument('--register',action='store_true');ap.add_argument('--audit-only',action='store_true');a=ap.parse_args();s,expected=spec(a.study);d=pathlib.Path(s['output']);d.mkdir(parents=True,exist_ok=True);mp=d/'manifest.json'
 if a.register:
  run('git','diff','--quiet','HEAD','--',*expected['files']);run('git','ls-files','--error-unmatch','--',*expected['files'],stdout=subprocess.DEVNULL)
  if mp.exists():assert {k:json.load(open(mp))[k] for k in expected}==expected
  else:write(mp,{**expected,'sourceCommit':git('rev-parse','HEAD'),'registered':now(),'scope':s['designation']})
  for config in s['configs']:
   c=json.load(open(config));p=pathlib.Path(c['output'])/'manifest.json';mf={'sourceHash':expected['sourceHash'],'configHash':sha(config),'files':expected['files'],'sourceCommit':json.load(open(mp))['sourceCommit']}
   if p.exists():assert json.load(open(p))==mf
   else:write(p,mf)
  print(json.dumps({'registration':'PASS','sourceHash':expected['sourceHash']}));return
 mf=json.load(open(mp));assert {k:mf[k] for k in expected}==expected;run('git','diff','--quiet','HEAD','--',*expected['files']);registry=json.load(open(s['initialRegistry']))
 if a.audit_only:
  rows=[]
  for config in s['configs']:
   c=json.load(open(config));rows+=audit(c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),registry)
  print(json.dumps({'audit':'PASS','rows':len(rows),'UNKNOWN':sum(bool(r['numericalUNKNOWN']) for r in rows)}));return
 with (d/'supervise.lock').open('a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-active');return
  for root in ['/workspace/2/docs/research-v2/results','docs/integration-v2/results']:
   for p in pathlib.Path(root).rglob('*.lock'):
    if p.resolve()==(d/'supervise.lock').resolve():continue
    with p.open() as f:
     try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
     except BlockingIOError:print('other-active',p);return
  statepath=d/'supervise.state.json';state=json.load(open(statepath)) if statepath.exists() else {'started':now(),'completed':[],'researchComplete':False}
  if state.get('status')=='STOPPED_REVIEW_REQUIRED':raise RuntimeError('Review preserved UNKNOWN/source/programming error before recovery; do not bypass status')
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'started':now(),'study':a.study},lock);lock.flush();os.fsync(lock.fileno());allrows=[];workers=[]
  try:
   state['recoveryPush']=push(d,'recovery-current');write(statepath,state)
   for config in s['configs']:
    assert spec(a.study)[1]==expected;c=json.load(open(config));bm=json.load(open(pathlib.Path(c['output'])/'manifest.json'));rows=audit(c,bm,registry);assert not any(r['numericalUNKNOWN'] for r in rows),'Existing UNKNOWN; review required'
    target=c['seeds']*len(c['modes'])*len(c['horizons']);state.update(status='RUNNING',batch=c['id'],sourceHash=expected['sourceHash'],updated=now(),rows=len(allrows)+len(rows),expectedRows=1024);write(statepath,state)
    if len(rows)<target:
     workers=[]
     for shard in range(2):
      f=open(pathlib.Path(c['output'])/f'worker{shard}.log','a');p=subprocess.Popen(['node','tools/v2/batch-worker-v2.mjs',config,str(shard),'2'],stdout=f,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((p,f))
     state['workers']=[p.pid for p,_ in workers];write(statepath,state);last_archive=time.monotonic()
     while any(p.poll() is None for p,_ in workers):
      time.sleep(10);codes=[p.poll() for p,_ in workers]
      if any(code not in [0,None] for code in codes):
       for p,_ in workers:
        if p.poll() is None:p.terminate()
       for p,_ in workers:p.wait(timeout=30)
       if any(code is not None and code<0 for code in codes):raise InterruptedError('Worker received signal; same-version complete checkpoint is resumable')
       raise RuntimeError('Worker error/UNKNOWN; inspect preserved logs and checkpoints '+repr(codes))
      state.update(updated=now(),rows=len(allrows)+len(endpoints(c)));write(statepath,state)
      if time.monotonic()-last_archive>=600:
       rows=audit(c,bm,registry);pushed=archive(d,c,rows)
       if pushed:state['lastPush']=pushed;write(statepath,state)
       last_archive=time.monotonic()
     for _,f in workers:f.close()
     workers=[]
    rows=audit(c,bm,registry);assert len(rows)==target and not any(r['numericalUNKNOWN'] for r in rows);pushed=archive(d,c,rows);allrows+=rows
    state.update(updated=now(),rows=len(allrows));state['completed']=sorted(set(state.get('completed',[])+[c['id']]))
    if pushed:state['lastPush']=pushed
    write(statepath,state);write(d/'summary.json',summary(s,allrows))
   run('python3','tools/v2/review-js-confirmation.py',a.study)
   run('git','add','--',str(d/'final-review.json'),str(d/'final-seeds.csv'),str(d/'summary.json'))
   run('git','commit','-qm','integration: preserve predefined JS confirmation final statistical review')
   ref=git('rev-parse','HEAD');run('python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-js-confirm-final-statistics','--ref',ref,'--previous','HEAD~1','--title','JS128Seed100000年预定统计审查','--summary','只在256长窗全部有结局且无UNKNOWN后形成，含置信区间、逐Seed和匹配差；不等于main验收。');run('python3','tools/records.py','check');run('git','add','records');run('git','commit','-qm','records: archive JS confirmation statistics');state['lastPush']=push(d,'final-statistics')
   state.update(status='JS_CONFIRMATION_COMPLETE_REVIEW_REQUIRED',updated=now(),rows=len(allrows));write(statepath,state);write(d/'summary.json',summary(s,allrows))
  except BaseException as e:
   for p,f in workers:
    if p.poll() is None:p.terminate()
    f.close()
   try:
    if spec(a.study)[1]==expected:
     preserved=audit(c,bm,registry);saved=archive(d,c,preserved)
     if saved:state['lastPush']=saved
   except Exception as archive_error:state['errorArchive']=str(archive_error)
   state.update(status='INTERRUPTED_RESUMABLE' if isinstance(e,(InterruptedError,KeyboardInterrupt)) else 'STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(statepath,state);raise
if __name__=='__main__':main()

#!/usr/bin/env python3
"""Run the preregistered independent cohort in recoverable 8-seed checkpoints."""
import argparse,datetime,fcntl,hashlib,json,os,pathlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
R=pathlib.Path('docs/research-v2/results');BRANCH='research/minimal-chaos-control-v2';PREFIX='V2-CONFIRM-20261021'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(args,**kw):return subprocess.run(args,check=True,**kw)
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
def sha(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def write(p,value):
 p=pathlib.Path(p);temp=pathlib.Path(str(p)+'.tmp')
 with temp.open('w') as f:json.dump(value,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 os.replace(temp,p)
def spec(studyfile):
 assert git('branch','--show-current')==BRANCH
 s=json.load(open(studyfile));assert s['designation']=='CONFIRMATORY' and s['prefix']==PREFIX and s['mainSeeds']==128 and s['auxSeeds']==32 and s['horizon']==100000 and len(s['configs'])==16
 for i,c in enumerate(s['configs']):
  q=json.load(open(c));assert q['prefix']==PREFIX and q['start']==i*8 and q['seeds']==8 and q['horizon']==100000
  assert q['profiles']==s['primaryProfiles']+(s['auxiliaryProfiles'] if i<4 else []);assert q['output']==f'docs/research-v2/results/confirmation-v1/b{i:02}.jsonl'
 mf=json.load(open(R/'weak30k.shard0.jsonl.manifest.json'));h=hashlib.sha256()
 for p in mf['sourceFiles']:h.update(p.encode()+b'\0');h.update(pathlib.Path(p).read_bytes())
 assert h.hexdigest()==mf['sourceHash'] and sha('docs/research-v2/bin/native')==mf['binaryHash']
 files=[studyfile,s['initialAudit'],'docs/research-v2/CONFIRMATION_PROTOCOL.md',__file__,'docs/research-v2/audit-confirmation.py','docs/research-v2/run-stream.py','docs/research-v2/audit.py','docs/research-v2/verify-provenance.py','docs/research-v2/summarize.py','docs/research-v2/chaos-summary.py','docs/research-v2/intervention-analysis.py',*s['configs']]
 files=[str(pathlib.Path(p).resolve().relative_to(ROOT)) for p in files]
 return {'sourceRef':'7f64a8a','sourceHash':mf['sourceHash'],'binaryHash':mf['binaryHash'],'files':{p:sha(p) for p in files}}
def push(label):
 assert git('branch','--show-current')==BRANCH
 try:
  with open('docs/research-v2/work/confirmation-'+label+'.push.log','a') as f:p=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=f,stderr=subprocess.STDOUT,timeout=180)
  return {'time':now(),'returncode':p.returncode,'confirmed':p.returncode==0}
 except (OSError,subprocess.TimeoutExpired) as e:return {'time':now(),'confirmed':False,'error':str(e)}
def checkpoint(label,stem,base):
 assert git('branch','--show-current')==BRANCH
 record=pathlib.Path('records/analyses')/('minimal-chaos-v2-confirmation-'+label)
 if record.exists():run(['python3','tools/records.py','check']);return json.load(open(record/'record.json'))['source_commit']
 assert subprocess.run(['git','diff','--cached','--quiet']).returncode==0,'unrelated staged changes'
 paths=[str(p) for p in pathlib.Path(stem).parent.glob(pathlib.Path(stem).name+'*') if p.is_file() and p.suffix not in ['.lock','.tmp']]
 paths+=['docs/research-v2/EXPERIMENT_LOG.md',str(R/'confirmation-v1.state.json')]+[str(p) for p in (R/'confirmation-v1').glob('cohort.*') if p.suffix!='.tmp']
 for file in pathlib.Path(stem).parent.glob(pathlib.Path(stem).name+'.shard*.jsonl.manifest.json'):
  m=json.load(open(file));v=m['sourceHash'][:16]+'-'+m['configHash'][:16]
  for d in ['raw','checkpoints']:
   p=pathlib.Path(stem).parent/d/v
   if p.exists():paths.append(str(p))
 run(['git','add','--',*sorted(set(paths))])
 if subprocess.run(['git','diff','--cached','--quiet']).returncode:run(['git','commit','-qm','research: preserve independent confirmation '+label])
 ref=git('rev-parse','HEAD');run(['python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-confirmation-'+label,'--ref',ref,'--previous',base,'--title','独立确认批次 '+label,'--summary','预注册128新Seed队列的8Seed批次；保留全部失败/UNKNOWN/原始与恢复哈希及队列进度，不把部分批次称为完成128Seed，不修改main。'])
 run(['python3','tools/records.py','check']);run(['git','add','records']);run(['git','commit','-qm','records: archive independent confirmation '+label]);return ref
def main():
 ap=argparse.ArgumentParser();ap.add_argument('study');ap.add_argument('--preflight-only',action='store_true');a=ap.parse_args();s=json.load(open(a.study));expected=spec(a.study)
 if a.preflight_only:print(json.dumps({'preflight':'PASS','spec':expected}));return
 manifest=R/'confirmation-v1.manifest.json';assert json.load(open(manifest))==expected,'registered confirmation inputs changed'
 run(['git','ls-files','--error-unmatch','--',*expected['files']],stdout=subprocess.DEVNULL);run(['git','diff','--quiet','HEAD','--',*expected['files']])
 with (R/'confirmation-v1.lock').open('a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-running-confirmation');return
  for p in R.rglob('*.lock'):
   if p==R/'confirmation-v1.lock':continue
   with p.open('a+') as f:
    try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError:print('other-active-worker',p);return
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'started':now(),'study':a.study},lock);lock.flush();os.fsync(lock.fileno())
  state={'researchComplete':False,'status':'RUNNING','started':now(),'registrationCommit':git('rev-parse','HEAD'),'completed':[]};statefile=R/'confirmation-v1.state.json'
  try:
   for i,config in enumerate(s['configs']):
    assert spec(a.study)==expected;label=f'b{i:02}';cfg=json.load(open(config));stem=cfg['output'][:-6];state.update(batch=label,updated=now(),status='RUNNING');write(statefile,state)
    infofile=pathlib.Path(stem+'.batch.json');info=json.load(open(infofile)) if infofile.exists() else {'started':now(),'baseCommit':git('rev-parse','HEAD'),'config':config,'configHash':sha(config)};write(infofile,info)
    workers=[]
    for shard in range(2):
     f=open(stem+f'-worker{shard}.log','a');p=subprocess.Popen(['python3','docs/research-v2/run-stream.py',config,str(shard),'2'],stdout=f,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((p,f))
    codes=[]
    for p,f in workers:codes.append(p.wait());f.close()
    if any(codes):raise RuntimeError(label+' transport/worker interruption '+repr(codes)+'; preserve work checkpoints and resume identical version')
    assert spec(a.study)==expected
    run(['python3','docs/research-v2/audit.py',config]);run(['python3','docs/research-v2/verify-provenance.py',config,'--source-ref','7f64a8a']);run(['python3','docs/research-v2/audit-confirmation.py',a.study])
    cohort=str(R/'confirmation-v1/cohort');run(['python3','docs/research-v2/summarize.py',cohort]);run(['python3','docs/research-v2/chaos-summary.py',cohort]);run(['python3','docs/research-v2/intervention-analysis.py',cohort])
    audit=json.load(open(stem+'.audit.json'));archive=pathlib.Path('records/analyses')/('minimal-chaos-v2-confirmation-'+label)
    if not archive.exists():
     info.update(completed=now(),audit=audit);write(infofile,info)
     log='docs/research-v2/EXPERIMENT_LOG.md';assert subprocess.run(['git','diff','--quiet','--',log]).returncode==0,'concurrent research log edits'
     with open(log,'a') as f:f.write('\n独立确认 '+label+' '+now()+'：'+str(audit['rows'])+'/'+str(audit['expected'])+'条，数值UNKNOWN='+str(audit['unknownNumerical'])+'；原始、源码/配置/恢复和初值哈希审计通过，见confirmation-v1队列进度。部分批次不代表已完成128Seed。\n')
    ref=checkpoint(label,stem,info['baseCommit']);state['completed'].append({'batch':label,'resultCommit':ref,'push':push(label)});state.update(updated=now());write(statefile,state)
    if audit['unknownNumerical']:raise RuntimeError('numerical UNKNOWN; later batches stopped for review')
   state.update(status='CONFIRMATION_COMPLETE_REVIEW_REQUIRED',updated=now());write(statefile,state)
  except Exception as e:state.update(status='STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(statefile,state);raise
if __name__=='__main__':main()

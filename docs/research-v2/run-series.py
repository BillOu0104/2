#!/usr/bin/env python3
"""Finite, resumable two-worker sequence; never selects or starts holdout seeds."""
import argparse,datetime,fcntl,hashlib,json,os,pathlib,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
RESULTS=pathlib.Path('docs/research-v2/results');BRANCH='research/minimal-chaos-control-v2';SOURCE='7f64a8a'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def run(args,**kw):return subprocess.run(args,check=True,**kw)
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
def write(p,value):
 temp=pathlib.Path(str(p)+'.tmp')
 with temp.open('w') as f:json.dump(value,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
 os.replace(temp,p)
def frozen(configs):
 assert git('branch','--show-current')==BRANCH,'wrong branch'
 mf=json.load(open(RESULTS/'weak30k.shard0.jsonl.manifest.json'));h=hashlib.sha256()
 for p in mf['sourceFiles']:h.update(p.encode()+b'\0');h.update(pathlib.Path(p).read_bytes())
 assert h.hexdigest()==mf['sourceHash'],'computing source changed'
 assert digest('docs/research-v2/bin/native')==mf['binaryHash'],'native binary changed'
 for p in configs:
  c=json.load(open(p));assert c['prefix']!='V2-CONFIRM-20261021','holdout forbidden in exploration series'
 return {'sourceRef':SOURCE,'sourceHash':mf['sourceHash'],'binaryHash':mf['binaryHash'],'driverHash':digest(__file__),'configs':{p:digest(p) for p in configs}}
def push(stage):
 assert git('branch','--show-current')==BRANCH,'branch changed before push'
 try:
  with (pathlib.Path('docs/research-v2/work')/(stage+'.push.log')).open('a') as f:
   p=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=f,stderr=subprocess.STDOUT,timeout=180)
  return {'time':now(),'returncode':p.returncode,'confirmed':p.returncode==0}
 except (subprocess.TimeoutExpired,OSError) as e:return {'time':now(),'confirmed':False,'error':str(e)}
def checkpoint(stage,stem,base):
 assert git('branch','--show-current')==BRANCH,'branch changed before checkpoint'
 record=pathlib.Path('records/analyses')/('minimal-chaos-v2-auto-'+stage)
 if record.exists():
  run(['python3','tools/records.py','check']);return json.load(open(record/'record.json'))['source_commit']
 assert subprocess.run(['git','diff','--cached','--quiet']).returncode==0,'unrelated staged changes; save results without committing them'
 files=[str(p) for p in RESULTS.glob(pathlib.Path(stem).name+'*') if p.is_file() and p.suffix not in ['.lock','.tmp']]
 files+=['docs/research-v2/EXPERIMENT_LOG.md',str(RESULTS/'series-v1.manifest.json'),str(RESULTS/'series-v1.state.json')]
 for file in sorted(RESULTS.glob(pathlib.Path(stem).name+'.shard*.jsonl.manifest.json')):
  mf=json.load(open(file));version=mf['sourceHash'][:16]+'-'+mf['configHash'][:16]
  for d in ['raw','checkpoints']:
   path=RESULTS/d/version
   if path.exists():files.append(str(path))
 files=sorted(set(files));run(['git','add','--',*files])
 if subprocess.run(['git','diff','--cached','--quiet']).returncode:run(['git','commit','-qm','research: checkpoint complete '+stage+' evidence'])
 ref=git('rev-parse','HEAD');run(['python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-auto-'+stage,'--ref',ref,'--previous',base,'--title','V2自动阶段 '+stage,'--summary','已注册探索阶段原始结果、失败与UNKNOWN、源码/配置/检查点哈希和统计；不是正式确认，不更改main。详见阶段series.json及对应协议。'])
 run(['python3','tools/records.py','check']);run(['git','add','records']);run(['git','commit','-qm','records: archive autonomous '+stage+' evidence']);return ref
def main():
 ap=argparse.ArgumentParser();ap.add_argument('configs',nargs='+');ap.add_argument('--preflight-only',action='store_true');args=ap.parse_args();spec=frozen(args.configs)
 if args.preflight_only:print(json.dumps({'preflight':'PASS','spec':spec}));return
 with (RESULTS/'series-v1.lock').open('a+') as lock:
  try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  except BlockingIOError:print('already-running-series');return
  for file in RESULTS.glob('*.lock'):
   if file.name=='series-v1.lock':continue
   with file.open('a+') as h:
    try:fcntl.flock(h,fcntl.LOCK_EX|fcntl.LOCK_NB)
    except BlockingIOError:print('other-active-worker',file);return
  manifest=RESULTS/'series-v1.manifest.json'
  if manifest.exists():assert json.load(open(manifest))==spec,'series source/config/driver changed'
  else:write(manifest,spec)
  lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'started':now(),'configs':args.configs},lock);lock.flush();os.fsync(lock.fileno())
  state={'researchComplete':False,'started':now(),'status':'RUNNING','completed':[]};statepath=RESULTS/'series-v1.state.json'
  try:
   for config in args.configs:
    assert frozen(args.configs)==spec,'source/config/binary changed while running'
    cfg=json.load(open(config));stage=pathlib.Path(config).stem;stem=cfg['output'][:-6];state.update(stage=stage,status='RUNNING',updated=now());write(statepath,state)
    stagefile=pathlib.Path(stem+'.series.json');info=json.load(open(stagefile)) if stagefile.exists() else {'baseCommit':git('rev-parse','HEAD'),'started':now(),'config':config,'configHash':digest(config),'researchComplete':False};write(stagefile,info)
    workers=[]
    for shard in range(2):
     log=open(stem+f'-worker{shard}.log','a');proc=subprocess.Popen(['python3','docs/research-v2/run-stream.py',config,str(shard),'2'],stdout=log,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((proc,log))
    codes=[]
    for proc,log in workers:codes.append(proc.wait());log.close()
    if any(codes):raise RuntimeError('worker interruption '+stage+' '+repr(codes)+'; inspect work checkpoints and logs, do not classify physical success')
    assert frozen(args.configs)==spec,'source/config/binary changed before audit'
    run(['python3','docs/research-v2/audit.py',config]);run(['python3','docs/research-v2/verify-provenance.py',config,'--source-ref',SOURCE]);run(['python3','docs/research-v2/summarize.py',stem]);run(['python3','docs/research-v2/chaos-summary.py',stem]);run(['python3','docs/research-v2/intervention-analysis.py',stem])
    pairedCode=0
    if stage in ['precision30k','shadow30k']:pairedCode=subprocess.run(['python3','docs/research-v2/paired-robustness.py',config]).returncode
    audit=json.load(open(stem+'.audit.json'));info.update(status='MEASUREMENT_REVIEW_REQUIRED' if pairedCode else ('NUMERICAL_REVIEW_REQUIRED' if audit['unknownNumerical'] else 'COMPLETE'),audit=audit)
    archive=pathlib.Path('records/analyses')/('minimal-chaos-v2-auto-'+stage)
    if not archive.exists():
     info['completed']=now();write(stagefile,info)
     logpath='docs/research-v2/EXPERIMENT_LOG.md';assert subprocess.run(['git','diff','--quiet','--',logpath]).returncode==0,'research log has concurrent edits'
     with open(logpath,'a') as f:f.write('\n自动阶段 '+stage+' '+now()+'：'+str(audit['rows'])+'/'+str(audit['expected'])+'条，原始及版本/恢复哈希审计通过，数值UNKNOWN='+str(audit['unknownNumerical'])+'，影子主轨迹检查退出码='+str(pairedCode)+'。完整记录见results/'+stage+'.series.json、summary及paired；本次不是正式确认。\n')
    ref=checkpoint(stage,stem,info['baseCommit']);pushed=push(stage);state['completed'].append({'stage':stage,'sourceResultCommit':ref,'push':pushed});state.update(updated=now(),status=info['status']);write(statepath,state)
    if audit['unknownNumerical'] or pairedCode:raise RuntimeError(info['status']+' '+stage+'; later stages not started')
   state.update(status='SERIES_COMPLETE_REVIEW_REQUIRED',updated=now());write(statepath,state)
  except Exception as e:
   state.update(status='STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(statepath,state);raise
if __name__=='__main__':main()

#!/usr/bin/env python3
"""Matched h4 Newtonian/cage baselines, checkpointed on the research branch."""
import argparse,datetime,fcntl,hashlib,json,os,pathlib,runpy,struct,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[2];os.chdir(ROOT)
R=pathlib.Path('docs/research-v2/results');D=R/'precision-baselines'
BRANCH='research/minimal-chaos-control-v2'
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def run(args,**kw):return subprocess.run(args,check=True,**kw)
def git(*args):return subprocess.check_output(['git',*args],text=True).strip()
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def write(p,value):
    p=pathlib.Path(p);tmp=pathlib.Path(str(p)+'.tmp')
    with tmp.open('w') as f:json.dump(value,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
    os.replace(tmp,p)
def spec(studyfile):
    assert git('branch','--show-current')==BRANCH
    old=runpy.run_path('docs/research-v2/run-confirmation.py')['spec']('docs/research-v2/confirmation-v1/study.json')
    assert old==json.load(open(R/'confirmation-v1.manifest.json')),'original registration changed'
    s=json.load(open(studyfile));assert s['designation']=='POST_CONFIRMATION_MATCHED_H4_BASELINES'
    assert len(s['configs'])==16
    primary=json.load(open('docs/research-v2/confirmation-v1/study.json'))['primaryProfiles'][:2]
    for i,path in enumerate(s['configs']):
        c=json.load(open(path))
        assert c['prefix']=='V2-CONFIRM-20261021'
        assert c['start']==i*8
        assert c['seeds']==8 and c['horizon']==100000 and c['saveCheckpoints']
        expected=json.loads(json.dumps(primary))
        for p in expected:p.update(id=p['id']+'__h4',dt=.0001875,eta=.001875)
        assert c['profiles']==expected and c['output']==str(D/f'p{i:02}.jsonl')
    prior=runpy.run_path('docs/research-v2/run-h4-extension.py')['spec']('docs/research-v2/precision-h4/study.json')
    assert prior==json.load(open(R/'precision-h4.manifest.json')),'prior h4 registration changed'
    files=[studyfile,s['protocol'],__file__,'docs/research-v2/analyze-h4-extension.py','docs/research-v2/results/precision-h4/h4-review.json',*s['configs']]
    files=[str(pathlib.Path(p).resolve().relative_to(ROOT)) for p in files]
    return {'originalConfirmationSpec':old,'priorPrecisionSpec':prior,'files':{p:sha(p) for p in files}}
def initial_audit(stem):
    registered=json.load(open('docs/research-v2/confirmation-v1/initial-state-audit.json'))['seeds']
    for file in pathlib.Path(stem).parent.glob(pathlib.Path(stem).name+'.shard*.jsonl'):
        for line in file.read_text().splitlines():
            r=json.loads(line)
            packed=b''.join(struct.pack('>d',float(x)) for b in r['initialBodies'] for x in [*b['r'],*b['v'],b['mass']])
            assert hashlib.sha256(packed).hexdigest()==registered[r['seed']]['initialSHA256'],'registered initial state changed'
def push(label):
    assert git('branch','--show-current')==BRANCH
    try:
        with open('docs/research-v2/work/precision-baselines-'+label+'.push.log','a') as f:
            p=subprocess.run(['git','-c','pack.windowMemory=128m','-c','pack.threads=1','-c','http.postBuffer=536870912','push','origin',BRANCH],stdout=f,stderr=subprocess.STDOUT,timeout=180)
        return {'time':now(),'returncode':p.returncode,'confirmed':p.returncode==0}
    except (OSError,subprocess.TimeoutExpired) as e:return {'time':now(),'confirmed':False,'error':str(e)}
def checkpoint(label,stem,base):
    assert git('branch','--show-current')==BRANCH
    record=pathlib.Path('records/analyses')/('minimal-chaos-v2-h4-baselines-'+label)
    if record.exists():run(['python3','tools/records.py','check']);return json.load(open(record/'record.json'))['source_commit']
    assert subprocess.run(['git','diff','--cached','--quiet']).returncode==0
    paths=[str(p) for p in D.glob(pathlib.Path(stem).name+'*') if p.is_file() and p.suffix not in ['.lock','.tmp']]
    paths+=['docs/research-v2/EXPERIMENT_LOG.md',str(R/'precision-baselines.state.json')]
    for file in D.glob(pathlib.Path(stem).name+'.shard*.jsonl.manifest.json'):
        m=json.load(open(file));version=m['sourceHash'][:16]+'-'+m['configHash'][:16]
        for name in ['raw','checkpoints']:
            p=D/name/version
            if p.exists():paths.append(str(p))
    run(['git','add','--',*sorted(set(paths))])
    if subprocess.run(['git','diff','--cached','--quiet']).returncode:run(['git','commit','-qm','research: preserve matched h4 baseline diagnostic '+label])
    ref=git('rev-parse','HEAD')
    run(['python3','tools/records.py','capture','--kind','analysis','--id','minimal-chaos-v2-h4-baselines-'+label,'--ref',ref,'--previous',base,'--title','确认后精度诊断 '+label,'--summary','100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。'])
    run(['python3','tools/records.py','check']);run(['git','add','records']);run(['git','commit','-qm','records: archive h4 precision '+label]);return ref
def main():
    ap=argparse.ArgumentParser();ap.add_argument('study');ap.add_argument('--preflight-only',action='store_true');args=ap.parse_args();expected=spec(args.study)
    if args.preflight_only:print(json.dumps({'preflight':'PASS','spec':expected}));return
    assert json.load(open(R/'precision-baselines.manifest.json'))==expected
    run(['git','ls-files','--error-unmatch','--',*expected['files']],stdout=subprocess.DEVNULL)
    run(['git','diff','--quiet','HEAD','--',*expected['files']])
    D.mkdir(exist_ok=True)
    with (R/'precision-baselines.lock').open('a+') as lock:
        try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except BlockingIOError:print('already-running-precision');return
        for p in R.rglob('*.lock'):
            if p==R/'precision-baselines.lock':continue
            with p.open('a+') as f:
                try:fcntl.flock(f,fcntl.LOCK_EX|fcntl.LOCK_NB)
                except BlockingIOError:print('other-active-worker',p);return
        lock.seek(0);lock.truncate();json.dump({'pid':os.getpid(),'started':now(),'study':args.study},lock);lock.flush();os.fsync(lock.fileno())
        statefile=R/'precision-baselines.state.json';state=json.load(open(statefile)) if statefile.exists() else {'researchComplete':False,'started':now(),'registrationCommit':git('rev-parse','HEAD'),'completed':[]}
        try:
            for i,cfgfile in enumerate(json.load(open(args.study))['configs']):
                assert spec(args.study)==expected
                label=f'p{i:02}';cfg=json.load(open(cfgfile));stem=cfg['output'][:-6]
                done=next((x for x in state['completed'] if x['batch']==label),None)
                if done:
                    run(['python3','docs/research-v2/audit.py',cfgfile]);run(['python3','docs/research-v2/verify-provenance.py',cfgfile,'--source-ref','7f64a8a']);initial_audit(stem)
                    assert not json.load(open(stem+'.audit.json'))['unknownNumerical'],'completed batch has UNKNOWN; review required'
                    continue
                state.update(status='RUNNING',batch=label,updated=now());write(statefile,state)
                infofile=pathlib.Path(stem+'.batch.json');info=json.load(open(infofile)) if infofile.exists() else {'started':now(),'baseCommit':git('rev-parse','HEAD'),'configHash':sha(cfgfile)};write(infofile,info)
                workers=[]
                for shard in range(2):
                    f=open(stem+f'-worker{shard}.log','a');p=subprocess.Popen(['python3','docs/research-v2/run-stream.py',cfgfile,str(shard),'2'],stdout=f,stderr=subprocess.STDOUT,pass_fds=(lock.fileno(),));workers.append((p,f))
                codes=[]
                for p,f in workers:codes.append(p.wait());f.close()
                if any(codes):raise RuntimeError('worker interruption '+label+' '+repr(codes))
                assert spec(args.study)==expected
                for script in ['audit.py','verify-provenance.py']:
                    run(['python3','docs/research-v2/'+script,cfgfile]+(['--source-ref','7f64a8a'] if script=='verify-provenance.py' else []))
                initial_audit(stem)
                for script in ['summarize.py','chaos-summary.py','intervention-analysis.py']:run(['python3','docs/research-v2/'+script,stem])
                audit=json.load(open(stem+'.audit.json'));info.update(completed=now(),audit=audit);write(infofile,info)
                if not (pathlib.Path('records/analyses')/('minimal-chaos-v2-h4-baselines-'+label)).exists():
                    assert subprocess.run(['git','diff','--quiet','--','docs/research-v2/EXPERIMENT_LOG.md']).returncode==0
                    with open('docs/research-v2/EXPERIMENT_LOG.md','a') as f:f.write('\nh4同精度基准 '+label+' '+now()+'：'+str(audit['rows'])+'/'+str(audit['expected'])+'条，UNKNOWN='+str(audit['unknownNumerical'])+'；原始/源码/配置/恢复哈希审计通过。属于确认后数值诊断，不替换主确认。\n')
                ref=checkpoint(label,stem,info['baseCommit']);state['completed'].append({'batch':label,'resultCommit':ref,'push':push(label)});state.update(updated=now());write(statefile,state)
                if audit['unknownNumerical']:raise RuntimeError('numerical UNKNOWN; stop for review')
            state.update(status='BASELINES_COMPLETE_REVIEW_REQUIRED',updated=now());write(statefile,state)
        except Exception as e:state.update(status='STOPPED_REVIEW_REQUIRED',error=str(e),updated=now());write(statefile,state);raise
if __name__=='__main__':main()

#!/usr/bin/env python3
"""Audit and aggregate a registered chunked cohort without changing row provenance."""
import collections,gzip,hashlib,json,math,pathlib,statistics,struct,sys
sys.path.insert(0,'/tmp/codex-v2-python')
import ijson
from ijson.common import ObjectBuilder
import numpy as np
from scipy.stats import beta
studyfile=sys.argv[1];study=json.load(open(studyfile));outdir=pathlib.Path('docs/research-v2/results/confirmation-v1');outdir.mkdir(exist_ok=True)
manifest=json.load(open('docs/research-v2/results/confirmation-v1.manifest.json'))
def sha(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def signature(b):return hashlib.sha256(b''.join(struct.pack('>d',float(x)) for body in b for x in [*body['r'],*body['v'],body['mass']])).hexdigest()
def rawmetadata(file):
 data={};key=None;builder=None
 with gzip.open(file,'rb') as f:
  for prefix,event,value in ijson.parse(f,use_float=True):
   if prefix=='' and event=='map_key':key=value;builder=None;continue
   if key in ['events','history'] or key is None:continue
   if builder is not None:
    builder.event(event,value)
    if prefix==key and event in ['end_array','end_map']:data[key]=builder.value;builder=None
   elif prefix==key:
    if event in ['start_array','start_map']:builder=ObjectBuilder();builder.event(event,value)
    elif event not in ['map_key','end_array','end_map']:data[key]=value
 return data
assert sha(studyfile)==manifest['files'][studyfile],'study changed'
initial=json.load(open(study['initialAudit']));expected=set();rows=[];seen=set()
for cfgfile in study['configs']:
 cfg=json.load(open(cfgfile));assert sha(cfgfile)==manifest['files'][cfgfile]
 keys={(cfg['prefix']+'-'+str(i),p['id']) for i in range(cfg['start'],cfg['start']+cfg['seeds']) for p in cfg['profiles']};assert not expected.intersection(keys);expected.update(keys)
 stem=cfg['output'][:-6]
 for shard in range(2):
  file=pathlib.Path(stem+f'.shard{shard}.jsonl')
  if not file.exists():continue
  mf=json.load(open(str(file)+'.manifest.json'));assert mf['sourceHash']==manifest['sourceHash'] and mf['binaryHash']==manifest['binaryHash'];assert mf['configHash']==sha(cfgfile) and mf['config']==cfg
  text=file.read_text();assert not text or text.endswith('\n'),'truncated tail'
  for line in text.splitlines():
   r=json.loads(line);key=(r['seed'],r['profile']);assert key in keys and key not in seen,'unregistered/duplicate key';seen.add(key)
   assert r['sourceHash']==mf['sourceHash'] and r['configHash']==mf['configHash'];assert signature(r['initialBodies'])==initial['seeds'][r['seed']]['initialSHA256'],'initial state changed'
   assert sha(r['rawFile'])==r['rawSHA256']
   for field,value in rawmetadata(r['rawFile']).items():assert r[field]==value,'native raw/index metadata mismatch: '+field
   if 'stateCheckpoint' in r:assert sha(r['stateCheckpoint'])==r['stateCheckpointSHA256'] and sha(r['stateInput'])==r['stateInputSHA256']
   if r['stellarIntact']:assert not r['starFailure'] and not r['error'] and abs(r['integratedYears']-100000)<.01
   assert not(r['numericallyCensored'] and r['stellarIntact']);rows.append(r)
rows.sort(key=lambda r:(int(r['seed'].rsplit('-',1)[1]),r['profile']))
temp=outdir/'cohort.jsonl.tmp'
with temp.open('w') as f:
 for r in rows:f.write(json.dumps(r,separators=(',',':'))+'\n')
temp.replace(outdir/'cohort.jsonl')
def wilson(k,n):
 if not n:return None
 z=1.959963984540054;p=k/n;d=1+z*z/n;c=(p+z*z/(2*n))/d;e=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-e,c+e]
def adjusted(k,n):
 if not n:return None
 a=.05/4;return [0 if k==0 else float(beta.ppf(a/2,k,n-k+1)),1 if k==n else float(beta.ppf(1-a/2,k+1,n-k))]
def chaos(r):
 exchanges=r['tightPairChanges']-next((b['tightPairChanges'] for b in r['bins'] if b['year']==10000),0)
 old=r['stellarIntact'] and r['matureConditionalFTLE'] is not None and r['matureConditionalFTLE']>.003 and exchanges>=20 and r['longestDynamicalHierarchyYears']<1000
 return old,old and r['longestHierarchyYears']<=5000 and r['matureNonhierFraction']>=.1
groups={};rng=np.random.default_rng(20261021)
for name in sorted({p['id'] for file in study['configs'] for p in json.load(open(file))['profiles']}):
 a=[r for r in rows if r['profile']==name];known=[r for r in a if not r['numericallyCensored']];planned=sum(k[1]==name for k in expected);k=sum(r['stellarIntact'] for r in known);old=sum(chaos(r)[0] for r in known);joint=sum(chaos(r)[1] for r in known);unknown=len(a)-len(known)
 q={'planned':planned,'observed':len(a),'pending':planned-len(a),'numericalUnknowns':unknown,'stellarSuccesses':k,'oldDiagnosticJointSuccesses':old,'continuousParticipationJointSuccesses':joint,'stellarWilson95KnownOnly':wilson(k,len(known)),'jointWilson95KnownOnly':wilson(joint,len(known)),'stellarUnknownWorstBestWithinObserved':[k/len(a),(k+unknown)/len(a)] if a else None,'jointUnknownWorstBestWithinObserved':[joint/len(a),(joint+unknown)/len(a)] if a else None,'seeds':{r['seed']:{'stellarIntact':r['stellarIntact'],'numericUnknown':r['numericallyCensored'],'oldDiagnostic':chaos(r)[0],'continuousJoint':chaos(r)[1],'fullStableFraction':r['stableFraction'],'matureStableFraction':r['matureStableFraction']} for r in a}}
 if name in study['candidates']:
  q.update(stellarClopperPearsonBonferroni4=adjusted(k,len(known)),jointClopperPearsonBonferroni4=adjusted(joint,len(known)))
 if len(a)==planned and not unknown:
  stats={}
  for label,subset in [('allSeeds',a),('stellarSurvivors',[r for r in a if r['stellarIntact']]),('continuousJoint',[r for r in a if chaos(r)[1]])]:
   stats[label]={}
   for field in ['stableFraction','matureStableFraction']:
    x=np.array([r[field] for r in subset],dtype=float)
    stats[label][field]={'n':len(x),'mean':float(x.mean()),'quantiles0_10_50_90_100':np.quantile(x,[0,.1,.5,.9,1]).tolist(),'bootstrapSeedMean95':np.quantile(x[rng.integers(0,len(x),size=(10000,len(x)))].mean(axis=1),[.025,.975]).tolist()} if len(x) else {'n':0,'mean':None,'bootstrapSeedMean95':None}
  q['stableStatistics']=stats
 groups[name]=q
progress={'researchComplete':False,'study':studyfile,'expectedRows':len(expected),'observedRows':len(rows),'pendingRows':len(expected-seen),'numericalUnknowns':sum(r['numericallyCensored'] for r in rows),'status':'COMPLETE_DATA_REVIEW_REQUIRED' if expected==seen and not any(r['numericallyCensored'] for r in rows) else 'IN_PROGRESS_OR_REVIEW_REQUIRED','scope':'Pending seeds are not failures; no full confirmatory conclusion until registered cohort and numerical review complete.','groups':groups}
(outdir/'cohort.endpoints.json').write_text(json.dumps(progress,indent=2)+'\n');print(json.dumps({k:v for k,v in progress.items() if k!='groups'}))

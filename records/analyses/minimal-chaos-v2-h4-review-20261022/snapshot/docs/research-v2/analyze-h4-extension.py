#!/usr/bin/env python3
"""Audit completed128-seed h4 raw metadata and compare matched seeds, never pool steps."""
import collections,gzip,hashlib,json,math,pathlib,struct,sys
sys.path.insert(0,'/tmp/codex-v2-python')
import ijson
from ijson.common import ObjectBuilder
import numpy as np

R=pathlib.Path('docs/research-v2/results');D=R/'precision-h4'
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
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
def signature(b):return hashlib.sha256(b''.join(struct.pack('>d',float(x)) for body in b for x in [*body['r'],*body['v'],body['mass']])).hexdigest()
def reasons(r):
    ex=r['tightPairChanges']-next(b['tightPairChanges'] for b in r['bins'] if b['year']==10000)
    return [name for good,name in [(r['stellarIntact'],'stellar'),(r['matureConditionalFTLE'] is not None and r['matureConditionalFTLE']>.003,'FTLE'),(ex>=20,'exchanges'),(r['longestDynamicalHierarchyYears']<1000,'dynamical-hierarchy'),(r['longestHierarchyYears']<=5000,'geometric-isolation'),(r['matureNonhierFraction']>=.1,'nonhierarchical-participation')] if not good]
def wilson(k,n):
    z=1.959963984540054;p=k/n;den=1+z*z/n;c=(p+z*z/(2*n))/den;e=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [c-e,c+e]
def main():
    initial=json.load(open('docs/research-v2/confirmation-v1/initial-state-audit.json'))['seeds']
    manifest=json.load(open(R/'precision-h4.manifest.json'))
    for p,h in manifest['files'].items():assert sha(p)==h,'frozen extension file changed: '+p
    base=[json.loads(l) for l in open(R/'precision-extension/comparisons.jsonl')];assert len(base)==832
    rows=list(base);new=[]
    for cfgfile in json.load(open('docs/research-v2/precision-h4/study.json'))['configs']:
        cfg=json.load(open(cfgfile));stem=cfg['output'][:-6];found=[]
        expected={(cfg['prefix']+'-'+str(i),p['id']) for i in range(cfg['start'],cfg['start']+cfg['seeds']) for p in cfg['profiles']}
        for f in sorted(pathlib.Path(stem).parent.glob(pathlib.Path(stem).name+'.shard*.jsonl')):
            mf=json.load(open(str(f)+'.manifest.json'));assert mf['configHash']==sha(cfgfile) and mf['config']==cfg
            assert mf['sourceHash']==manifest['originalConfirmationSpec']['sourceHash'] and mf['binaryHash']==manifest['originalConfirmationSpec']['binaryHash']
            for line in f.read_text().splitlines():
                r=json.loads(line);assert sha(r['rawFile'])==r['rawSHA256']
                assert r['sourceHash']==mf['sourceHash'] and r['configHash']==mf['configHash']
                for field,value in rawmetadata(r['rawFile']).items():assert r[field]==value,'raw/index mismatch: '+field
                assert signature(r['initialBodies'])==initial[r['seed']]['initialSHA256']
                assert sha(r['stateCheckpoint'])==r['stateCheckpointSHA256'] and sha(r['stateInput'])==r['stateInputSHA256']
                assert abs(r['integratedYears']-100000)<.01 or not r['stellarIntact']
                found.append(r)
        keys=[(r['seed'],r['profile']) for r in found];assert len(keys)==len(set(keys)) and set(keys)==expected
        rows+=found;new+=found
    assert len(new)==192
    idx={(r['seed'],r['profile']):r for r in rows};assert len(idx)==len(rows)==1024
    (D/'comparisons.jsonl').write_text(''.join(json.dumps(r,separators=(',',':'))+'\n' for r in rows))
    rng=np.random.default_rng(20261022)
    def stats(x):
        x=np.array(x,dtype=float);n=len(x)
        return {'n':n,'mean':float(x.mean()),'quantiles0_10_50_90_100':np.quantile(x,[0,.1,.5,.9,1]).tolist(),'bootstrapMean95':np.quantile(x[rng.integers(n,size=(20000,n))].mean(1),[.025,.975]).tolist()}
    out={'researchComplete':False,'status':'H4_DATA_COMPLETE_REVIEW_REQUIRED','mainConfirmationUnchanged':True,'baseRows':832,'newRows':192,'rawMetadataAuditedRows':192,'numericUnknowns':sum(r['numericallyCensored'] for r in new),'scope':'Matched numerical repeats; confidence intervals descriptive, not independent new confirmation or proof of equivalence. Raw/index/source/config/initial/state/input hashes verified. Original base cohort audited separately.','groups':{},'pairs':{}}
    for p in ['deflect4-trigger8','reflect-trigger8']:
        for suffix,n in [('',128),('__h2',128),('__h4',128)]:
            a=[idx[(f'V2-CONFIRM-20261021-{i}',p+suffix)] for i in range(n)]
            k=sum(r['stellarIntact'] for r in a);j=sum(not reasons(r) for r in a)
            q={'n':n,'stellarSuccesses':k,'stellarWilson95':wilson(k,n),'jointSuccesses':j,'jointWilson95':wilson(j,n),'unknowns':sum(r['numericallyCensored'] for r in a),'matureStable':stats([r['matureStableFraction'] for r in a]),'fullStable':stats([r['stableFraction'] for r in a]),'matureConditionalFTLE':stats([r['matureConditionalFTLE'] for r in a]),'planetLosses':stats([r['planetLosses'] for r in a]),'grossWorkOverE0':stats([r['control']['absoluteWork']/abs(r['initialEnergy']) for r in a]),'activeFrameFractionMean':float(np.mean([r['controlActiveFrameFraction'] for r in a])),'maxSampledEnergyResidual':max(r['maxNumericalEnergyResidual'] for r in a),'stepsMin':min(r['steps'] for r in a),'stepsMax':max(r['steps'] for r in a),'jointInsufficient':{r['seed']:reasons(r) for r in a if reasons(r)},'perSeed':{r['seed']:{'matureStableFraction':r['matureStableFraction'],'jointPass':not reasons(r),'rawSHA256':r['rawSHA256'],'configHash':r['configHash']} for r in a}}
            out['groups'][p+suffix]=q
        for lo,hi,n in [('', '__h2',128),('__h2','__h4',128),('','__h4',128)]:
            a=[idx[(f'V2-CONFIRM-20261021-{i}',p+lo)] for i in range(n)];b=[idx[(r['seed'],p+hi)] for r in a]
            for x,y in zip(a,b):assert x['initialBodies']==y['initialBodies']
            q={'n':n,'lower':p+lo,'higher':p+hi,'jointPassDiscordance':dict(collections.Counter(str(not reasons(x))+'->'+str(not reasons(y)) for x,y in zip(a,b)))}
            for field in ['stableFraction','matureStableFraction','matureConditionalFTLE','planetLosses','controlActiveFrameFraction']:
                x=np.array([r[field] for r in a]);y=np.array([r[field] for r in b]);q[field]={'lowerMean':float(x.mean()),'higherMean':float(y.mean()),'higherMinusLower':stats(y-x),'pairedCorrelation':float(np.corrcoef(x,y)[0,1]) if x.std()>0 and y.std()>0 else None}
            out['pairs'][p+':'+(lo or 'default')+'->'+hi]=q
    path=D/'h4-review.json';path.write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({'newRows':len(new),'allRows':len(rows),'numericUnknowns':out['numericUnknowns'],'output':str(path)}))
if __name__=='__main__':main()

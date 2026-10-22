#!/usr/bin/env python3
"""Post-confirmation review; leaves the registered analysis scripts frozen.

Paired bootstrap intervals here are descriptive post-hoc diagnostics, not new
confirmatory endpoints. Event angular budgets cover deflection events only.
"""
import collections,gzip,hashlib,json,math,pathlib,sys
sys.path.insert(0,'/tmp/codex-v2-python')
import ijson
import numpy as np

stem='docs/research-v2/results/confirmation-v1/cohort'
rows=[json.loads(l) for l in open(stem+'.jsonl')]
assert len(rows)==576 and len({(r['seed'],r['profile']) for r in rows})==576
assert not any(r['numericallyCensored'] for r in rows)
idx={(r['seed'],r['profile']):r for r in rows}
rng=np.random.default_rng(20261022)
def gate(r):
    changes=r['tightPairChanges']-next(b['tightPairChanges'] for b in r['bins'] if b['year']==10000)
    reasons=[]
    for ok,label in [(r['stellarIntact'],'stellar-integrity'),
        (r['matureConditionalFTLE'] is not None and r['matureConditionalFTLE']>.003,'mature-FTLE'),
        (changes>=20,'mature-exchanges'),(r['longestDynamicalHierarchyYears']<1000,'dynamical-hierarchy'),
        (r['longestHierarchyYears']<=5000,'geometric-isolation'),(r['matureNonhierFraction']>=.1,'mature-nonhier')]:
        if not ok:reasons.append(label)
    return reasons
out={'scope':'Post-hoc numerical/cost review; original registered endpoints unchanged.',
     'cohortSHA256':hashlib.sha256(pathlib.Path(stem+'.jsonl').read_bytes()).hexdigest(),'groups':{}}
for p in ['deflect4-trigger8','reflect-trigger8']:
    a=[r for r in rows if r['profile']==p];b=[idx[(f'V2-CONFIRM-20261021-{i}',p)] for i in range(32)]
    fine=[idx[(r['seed'],p+'__h2')] for r in b]
    q={'pairedPrecision32':{},'failedContinuousJoint':[], 'perSeedEvents':[]}
    for field in ['matureStableFraction','stableFraction','matureConditionalFTLE','planetLosses','controlActiveFrameFraction']:
        x=np.array([r[field] for r in b]);y=np.array([r[field] for r in fine]);d=y-x
        q['pairedPrecision32'][field]={'defaultMean':float(x.mean()),'halfMean':float(y.mean()),
            'halfMinusDefault':float(d.mean()),'pairedBootstrapMeanDifference95':
            np.quantile(d[rng.integers(32,size=(20000,32))].mean(1),[.025,.975]).tolist()}
    q['pairedPrecision32']['jointDefault']=sum(not gate(r) for r in b)
    q['pairedPrecision32']['jointHalf']=sum(not gate(r) for r in fine)
    for r in a:
        reasons=gate(r)
        if reasons:q['failedContinuousJoint'].append({'seed':r['seed'],'reasons':reasons,
            **{k:r[k] for k in ['matureConditionalFTLE','matureNonhierFraction','longestHierarchyYears','longestDynamicalHierarchyYears','matureStableFraction']}})
        peak=absoluteL=netImpulse=0.;counts=collections.Counter()
        with gzip.open(r['rawFile'],'rb') as f:
            for e in ijson.items(f,'events.item',use_float=True):
                counts[e['kind']]+=1
                if 'deltaVelocity' in e:
                    dvs=e['deltaVelocity'];ids=e.get('pair',list(range(len(dvs))))
                    peak=max(peak,max((math.hypot(*v) for v in dvs),default=0))
                    netImpulse+=sum(r['initialBodies'][i]['mass']*math.hypot(*v) for i,v in zip(ids,dvs))
                if 'deltaAngularMomentum' in e:absoluteL+=math.hypot(*e['deltaAngularMomentum'])
        Lscale=math.sqrt(1.3275440274585598e-8*(15e6)**3*r['initialScale'])
        q['perSeedEvents'].append({'seed':r['seed'],'rawSHA256':r['rawSHA256'],'eventCounts':dict(counts),
            'peakRecordedNetDeltaV':peak,'netEventImpulseSum':netImpulse,
            'deflectionCumulativeNormDeltaLNormalized':absoluteL/Lscale,
            'totalSignedDeltaLNormNormalized':math.hypot(*r['control']['deltaL'])/Lscale})
    for field in ['peakRecordedNetDeltaV','deflectionCumulativeNormDeltaLNormalized','totalSignedDeltaLNormNormalized']:
        values=[r[field] for r in q['perSeedEvents']];q[field]={'mean':float(np.mean(values)),'max':max(values)}
    for field in ['matureStablePostRespawn25Contribution','matureStableOlderPlanetContribution','initialCrossingYears','steps']:
        values=[r[field] for r in a];q[field]={'mean':float(np.mean(values)),'min':min(values),'max':max(values)}
    q['angularScope']='Cumulative norm only for logged deflections; net L includes capture. Missing per-subprojection capture angular budget cannot be reconstructed.'
    out['groups'][p]=q
pathlib.Path(stem+'.review.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({p:{k:v for k,v in q.items() if k!='perSeedEvents'} for p,q in out['groups'].items()},indent=2))

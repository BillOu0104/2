#!/usr/bin/env python3
"""Predefined final analysis; refuses pending/UNKNOWN as completed128Seed evidence."""
import csv,json,pathlib,statistics,sys
import numpy as np
from scipy.stats import beta
import runpy
F=runpy.run_path(str(pathlib.Path(__file__).with_name('run-js-confirmation.py')))
if '--selftest' in sys.argv:
 assert abs(F['wilson'](128,128)[0]-.9708630437264916)<1e-12
 assert abs(float(beta.ppf(.05/4/2,128,1))-.961126)<1e-5
 print('PASS: Wilson/Bonferroni boundary checks; final analysis requires256complete observed outcomes and no UNKNOWN');raise SystemExit
study=sys.argv[1];s,expected=F['spec'](study);d=pathlib.Path(s['output']);mf=json.load(open(d/'manifest.json'));assert {k:mf[k] for k in expected}==expected;registry=json.load(open(s['initialRegistry']));rows=[]
for config in s['configs']:
 c=json.load(open(config));rows+=F['audit'](c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),registry)
rr=[r for r in rows if r['horizon']==100000];assert len(rr)==256 and not any(r['numericalUNKNOWN'] for r in rr),'Incomplete or UNKNOWN: cannot finalize128Seed confirmation';out=F['summary'](s,rows);out.update(status='JS_CONFIRMATION_FINAL_REVIEW_REQUIRED',researchComplete=False,sourceHash=mf['sourceHash'],bootstrap={'replicates':20000,'seed':20261022,'unit':'Seed, matched across candidates'},limits='Not a proof of exact trajectory/statistical equivalence or unlimited-time stability; production integration/main replacement still requires review')
idx=np.random.default_rng(20261022).integers(0,128,size=(20000,128));arrays={}
def interval(x,mask=None):
 x=np.asarray(x);v=x[idx]
 if mask is None:b=v.mean(axis=1)
 else:
  m=np.asarray(mask,dtype=bool)[idx];den=m.sum(axis=1);b=(v*m).sum(axis=1)[den>0]/den[den>0]
 return np.quantile(b,[.025,.975]).tolist() if len(b) else None
for mode in ['deflect-v2','reflect-v2']:
 r=sorted([q for q in rr if q['mode']==mode],key=lambda q:int(q['seed'].rsplit('-',1)[1]));assert len({q['seed'] for q in r})==128;g=out['groups'][mode];n=128
 for name,key in [('stellar','stellarIntact'),('joint','joint')]:
  k=sum(q[key] for q in r);g[name+'BonferroniClopperPearson95']=[0 if k==0 else float(beta.ppf(.05/8,k,n-k+1)),1 if k==n else float(beta.ppf(1-.05/8,k+1,n-k))]
 for scope,key in [('full','stableFraction'),('mature','matureStableFraction')]:
  values=np.array([q[key] for q in r]);g[scope+'StableAll']={'mean':float(values.mean()),'quantiles':np.quantile(values,[0,.1,.25,.5,.75,.9,1]).tolist(),'bootstrap95':interval(values)}
  for label,flag in [('StellarSurvivors','stellarIntact'),('JointSurvivors','joint')]:
   mask=[q[flag] for q in r];g[scope+label]={'n':sum(mask),'mean':float(values[mask].mean()) if any(mask) else None,'bootstrap95':interval(values,mask)}
  if scope=='mature':arrays[mode]=values
 g['planetLossesMean']=statistics.mean(q['planetLosses'] for q in r);g['originalPlanetSurvived']=sum(q['originalPlanetSurvived'] for q in r);g['originalCivilizationSurvived']=sum(q['originalCivilizationSurvived'] for q in r);g['controlAbsoluteWorkMean']=statistics.mean(q['control']['absoluteWork'] for q in r);g['controlImpulseMean']=statistics.mean(q['control']['impulse'] for q in r);g['controlActiveFractionMean']=statistics.mean(q['controlObservedActiveFrameFraction'] for q in r)
diff=arrays['deflect-v2']-arrays['reflect-v2'];out['pairedMatureDifferenceDeflectMinusReflect']={'mean':float(diff.mean()),'bootstrap95':interval(diff)};F['write'](d/'final-review.json',out)
fields=['seed','mode','horizon','stellarIntact','joint','stableFraction','matureStableFraction','matureConditionalFTLE','tightPairChanges','longestDynamicalHierarchyYears','longestHierarchyYears','planetLosses','planetRespawns','originalPlanetSurvived','originalCivilizationSurvived','civilizationAliveFraction','controlObservedActiveFrameFraction','maxNumericalEnergyResidual','rawFile','rawSHA256','checkpoint','checkpointSHA256']
with (d/'final-seeds.csv').open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rr)
print(json.dumps({'status':out['status'],'100000yearRows':len(rr),'sourceHash':mf['sourceHash']}))

#!/usr/bin/env python3
"""Post-confirmation review, preserving the frozen preregistered analysis."""
import collections, csv, datetime, hashlib, json, math, pathlib, runpy, statistics
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
ROOT=pathlib.Path(__file__).resolve().parents[2]
F=runpy.run_path(str(ROOT/'tools/v2/run-js-confirmation.py'))
study='docs/integration-v2/js-confirmation-v1/study.json'
s,expected=F['spec'](study);base=pathlib.Path(s['output']);registry=json.load(open(s['initialRegistry']))
mf=json.load(open(base/'manifest.json'));assert all(mf[k]==v for k,v in expected.items())
rows=[]
for config in s['configs']:
 c=json.load(open(config));rows+=F['audit'](c,json.load(open(pathlib.Path(c['output'])/'manifest.json')),registry)
assert len(rows)==1024
rr=sorted((r for r in rows if r['horizon']==100000),key=lambda r:(r['mode'],int(r['seed'].rsplit('-',1)[1])))
assert len(rr)==256 and not any(r['numericalUNKNOWN'] for r in rr)
out=pathlib.Path('docs/integration-v2/results/js-confirmation-review-20261026');assert not out.exists();out.mkdir()
detail=[];gates=collections.defaultdict(list);bins=collections.defaultdict(list)
norm=lambda a:math.sqrt(sum(x*x for x in a))
for r in rr:
 raw=json.load(open(r['rawFile']));cp=json.load(open(r['checkpoint']));c=cp['simulation']['controlled'];E0=abs(c['initialEnergy'])
 L0=[sum(b['mass']*(b[a]*b[v]-b[z]*b[u]) for b in raw['initialBodies']) for a,z,u,v in [('y','z','vy','vz'),('z','x','vz','vx'),('x','y','vx','vy')]]
 events=[e['detail'] for e in raw['metrics']['events'] if e['type'] in ['physics:capture','physics:deflect','physics:reflect']]
 assert len(events)==r['control']['projectionEvents']
 for key in ['work','absoluteWork','impulse']:
  measured=math.fsum(e[key] for e in events)
  assert abs(measured-r['control'][key])<=1e-6+1e-9*max(abs(measured),r['control']['absoluteWork']), (r['seed'],key)
 for key in ['deltaP','deltaL']:
  for k in range(3):
   measured=math.fsum(e[key][k] for e in events)
   assert abs(measured-r['control'][key][k])<=1e-6+1e-9*max(abs(measured),r['control']['cumulativeBodyAngularImpulse'])
 assert max((e['peakNetVelocityJump'] for e in events),default=0)==r['control']['peakNetVelocityJump']
 failed=[]
 for label,ok in [('FTLE',r['matureConditionalFTLE']>.003),('tightPairChanges',r['tightPairChanges']>=20),('dynamicHierarchy',r['longestDynamicalHierarchyYears']<1000),('geometricIsolation',r['longestHierarchyYears']<=5000),('nonhierFraction',r['matureNonhierFraction']>=.1)]:
  if not ok:failed.append(label)
 assert r['joint']==(r['stellarIntact'] and not failed)
 if failed:gates[r['mode']].append({'seed':r['seed'],'failedGates':failed,'matureStableFraction':r['matureStableFraction'],'FTLE':r['matureConditionalFTLE'],'longestIsolation':r['longestHierarchyYears'],'longestDynamicHierarchy':r['longestDynamicalHierarchyYears'],'matureNonhierFraction':r['matureNonhierFraction'],'tightPairChanges':r['tightPairChanges']})
 row={k:r[k] for k in ['seed','mode','stellarIntact','joint','stableFraction','matureStableFraction','matureConditionalFTLE','tightPairChanges','longestHierarchyYears','longestDynamicalHierarchyYears','matureNonhierFraction','planetLosses','planetRespawns','originalPlanetSurvived','originalCivilizationSurvived','absentFraction','civilizationAliveFraction','civilizationActiveFraction','controlObservedActiveFrameFraction','matureStablePostRespawn25Contribution','maxNumericalEnergyResidual','wallSeconds','maxRSSMiB','steps']}
 row.update(controlWorkOverE0=r['control']['work']/E0,controlAbsoluteWorkOverE0=r['control']['absoluteWork']/E0,controlImpulse=r['control']['impulse'],controlDeltaLNormOverL0=norm(r['control']['deltaL'])/max(norm(L0),1e-20),controlCumulativeBodyAngularImpulseOverL0=r['control']['cumulativeBodyAngularImpulse']/max(norm(L0),1e-20),controlPeakNetVelocityJump=r['control']['peakNetVelocityJump'],controlEvents=len(events),planetExternalWork=r['planetExternal']['work'],planetExternalAbsoluteWork=r['planetExternal']['absoluteWork'],planetExternalImpulseMagnitudeChange=r['planetExternal']['impulse'],failedGates=';'.join(failed))
 detail.append(row)
 previous=0
 for b in raw['metrics']['bins']:
  if b['year'] in [10000,30000,100000]:
   bins[r['mode']].append({'seed':r['seed'],'endYear':b['year'],'startYear':previous,'stableFrames':b['stableFrames']})
  previous=b['year']
def dist(values):
 a=np.array(values,dtype=float);return {'n':len(a),'mean':float(a.mean()),'min':float(a.min()),'median':float(np.median(a)),'p90':float(np.quantile(a,.9)),'max':float(a.max())}
review={'timeUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceHash':mf['sourceHash'],'auditedWindowRows':1024,'auditedLongRows':256,'UNKNOWN':0,'projectionEventAudit':'all per-event work/absoluteWork/impulse/P/L sums and peak net velocity jump agree with cumulative ledgers within recorded rounding tolerance','groups':{},'chaosInsufficient':dict(gates),'limits':['Observed-active FRAME fraction is not physical pulse-duration duty cycle. Finite acceleration undefined without a pulse duration.','Planet external impulse is the sum of absolute changes of momentum MAGNITUDE; it is not the full vector-jump impulse and can underestimate it. Existing signed/absolute energy and deltaP/deltaL ledgers are separate. Do not relabel this quantity as complete P5 impulse.','Energy residual is yearly sampled, not a continuous bound or proof of long-term statistics convergence.','RSS is endpoint process RSS, not a measured process-wide peak; wall time includes checkpoint activity and shared-CPU execution.','Formal source/configuration frozen; post-hoc cost review does not change the preregistered outcomes.']}
for mode in ['deflect-v2','reflect-v2']:
 dr=[r for r in detail if r['mode']==mode]
 review['groups'][mode]={k:dist([r[k] for r in dr]) for k in dr[0] if k not in ['seed','mode','failedGates']}
F['write'](out/'review.json',review)
with (out/'all-seeds.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(detail[0]));w.writeheader();w.writerows(detail)
provenance={'sourceCommit':F['git']('rev-parse','HEAD'),'sourceHash':mf['sourceHash'],'audit':'PASS','rows':1024,'inputs':{}}
for p in [str(base/'manifest.json'),str(base/'final-review.json'),*map(str,base.rglob('endpoints/*.json'))]:provenance['inputs'][p]=F['sha'](p)
F['write'](out/'provenance.json',provenance)
fig,axes=plt.subplots(1,3,figsize=(14,4),layout='constrained')
for mode,color in [('deflect-v2','#167d9a'),('reflect-v2','#cf6931')]:
 d=[r for r in detail if r['mode']==mode]
 axes[0].scatter([r['controlAbsoluteWorkOverE0'] for r in d],[100*r['matureStableFraction'] for r in d],label=mode,s=15,alpha=.65,color=color)
 axes[1].scatter([r['controlDeltaLNormOverL0'] for r in d],[r['matureConditionalFTLE'] for r in d],label=mode,s=15,alpha=.65,color=color)
 axes[2].plot(np.arange(1,129)/128,np.sort([100*r['matureStableFraction'] for r in d]),label=mode,color=color)
axes[0].set(xscale='symlog',xlabel='Cumulative absolute control work / |E0|',ylabel='Mature stable epoch (%)')
axes[1].set(xscale='symlog',xlabel='Norm of net control delta L / |L0|',ylabel='Conditional stellar FTLE / year');axes[1].axhline(.003,color='gray',ls=':')
axes[2].set(xlabel='Empirical quantile',ylabel='Mature stable epoch (%)');axes[2].axhspan(10,15,color='gray',alpha=.15)
axes[0].legend();fig.suptitle('JS h4: 128 fresh matched seeds, actual 100,000 display years; all outcomes retained')
fig.savefig(out/'tradeoffs.png',dpi=180);fig.savefig(out/'tradeoffs.svg');plt.close(fig)
print(json.dumps({'review':'PASS','longRows':len(rr),'UNKNOWN':0,'output':str(out),'chaosInsufficient':{k:len(v) for k,v in gates.items()}}))

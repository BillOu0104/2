import json,pathlib,collections,math,statistics,numpy as np
root=pathlib.Path(__file__).resolve().parents[2];folder=root/'docs/v052/results'
def read(name):return [json.loads(x) for x in (folder/f'{name}.jsonl').read_text().splitlines()]
def wilson(k,n):
 z=1.95996398454;p=k/n;d=1+z*z/n;c=(p+z*z/(2*n))/d;h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;return [c-h,c+h]
def describe(rows):
 n=len(rows);faults=[r for r in rows if r['error']];censored=[r for r in rows if r['numericallyCensored']]
 assert n==128 and not censored,(n,censored)
 return {'n':n,'windowYears':rows[0]['horizon'],'meanRestrictedLifeYears':statistics.mean(r['restrictedLife'] for r in rows),'planetSurvivors':sum(r['survived'] for r in rows),'planetSurvivalWilson95':wilson(sum(r['survived'] for r in rows),n),'jointSurvivors':sum(r['jointSurvived'] for r in rows),'jointSurvivalWilson95':wilson(sum(r['jointSurvived'] for r in rows),n),'stableFractionFullWindow':statistics.mean(r['stableFraction'] for r in rows),'lossCounts':dict(collections.Counter(r['lossReason'] or 'survived' for r in rows)),'stellarContactBeforePlanetEndpoint':sum(r['starContactAt'] is not None for r in rows),'numericalFaults':len(faults),'numericallyCensored':len(censored),'energyErrorBeforeLossOrContact':{'median':statistics.median(r['maxEnergyErrorBeforeLoss'] for r in rows),'max':max(r['maxEnergyErrorBeforeLoss'] for r in rows)},'angularErrorBeforeLossOrContact':{'median':statistics.median(r['maxLErrorBeforeLoss'] for r in rows),'max':max(r['maxLErrorBeforeLoss'] for r in rows)},'normalizedMomentumErrorBeforeLossOrContact':{'median':statistics.median(r['maxMomentumErrorBeforeLoss'] for r in rows),'max':max(r['maxMomentumErrorBeforeLoss'] for r in rows)}}
rows=read('acceptance');assert len(rows)==384
profiles={p:[r for r in rows if r['profile']==p] for p in dict.fromkeys(r['profile'] for r in rows)}
assert all([r['seed'] for r in a]==[f'V052-ACCEPTANCE-{i}' for i in range(128)] for a in profiles.values())
a,b,c=profiles.values();report={'cohort':'V052-ACCEPTANCE-0..127; fresh implementation experiment, separate from historical HOLDOUT-C','profiles':{p:describe(r) for p,r in profiles.items()}}
rng=np.random.default_rng(52021);indices=rng.integers(0,128,(10000,128));comparisons={}
for label,first,last in [('engineOnly',a,b),('newDefaultVsOld',a,c),('initializationOnly',b,c)]:
 comparisons[label]={}
 for key in ['restrictedLife','stableFraction','survived','jointSurvived']:
  delta=np.array([float(y[key])-float(x[key]) for x,y in zip(first,last)])
  comparisons[label][key]={'difference':float(np.mean(delta)),'pairedSeedBootstrap95':[float(x) for x in np.quantile(delta[indices].mean(axis=1),[.025,.975])]}
report['pairedComparisons']=comparisons
fine=read('convergence');long=read('long');report['fine']=describe(fine);report['long']=describe(long)
report['convergenceComparison']={'survivalClassificationsChanged':sum(r['survived']!=s['survived'] for r,s in zip(c,fine)),'jointClassificationsChanged':sum(r['jointSurvived']!=s['jointSurvived'] for r,s in zip(c,fine)),'maxFirstLossTimeDifferenceYears':max(abs(r['restrictedLife']-s['restrictedLife']) for r,s in zip(c,fine)),'meanAbsoluteFirstLossTimeDifferenceYears':statistics.mean(abs(r['restrictedLife']-s['restrictedLife']) for r,s in zip(c,fine))}
# Full cohort includes failures; the long experiment is never used to select initial conditions.
assert [r['seed'] for r in fine]==[r['seed'] for r in c]==[r['seed'] for r in long]
# Verify every hashed production source is exactly the tested source.
import hashlib
for name in ['acceptance','convergence','long']:
 m=json.loads((folder/f'{name}.jsonl.manifest.json').read_text());assert m.get('finished'),name
 for f,h in m['hashes'].items():assert hashlib.sha256((root/f).read_bytes()).hexdigest()==h,f
report['sourceHashesVerified']=True
(folder/'summary.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))

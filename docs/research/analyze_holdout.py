import json,pathlib,collections,math
import numpy as np
from scipy.stats import binomtest

root=pathlib.Path(__file__).resolve().parent;G=1.3275440274585598e-8
def final_hierarchy(row):
    b=row['finalBodies'][:3];pairs=[(0,1),(0,2),(1,2)]
    i,j=min(pairs,key=lambda ij:sum((b[ij[0]][k]-b[ij[1]][k])**2 for k in ['x','y','z']))
    k=3-i-j;p=np.array([[x[q] for q in ['x','y','z']] for x in b]);v=np.array([[x[q] for q in ['vx','vy','vz']] for x in b]);m=np.array([x['mass'] for x in b]);r=np.linalg.norm(p[i]-p[j]);vi=v[i]-v[j];mu=G*(m[i]+m[j]);eb=np.dot(vi,vi)/2-mu/r
    d=[np.linalg.norm(p[a]-p[c]) for a,c in pairs]
    if eb>=0:return {'boundInner':False,'shape':max(d)/min(d),'hierarchicalBound':False,'outerUnbound':None}
    ain=-mu/(2*eb);pc=(m[i]*p[i]+m[j]*p[j])/(m[i]+m[j]);vc=(m[i]*v[i]+m[j]*v[j])/(m[i]+m[j]);dr=p[k]-pc;dv=v[k]-vc;R=np.linalg.norm(dr);M=G*m.sum();eo=np.dot(dv,dv)/2-M/R;h=np.linalg.norm(np.cross(dr,dv));ecc=math.sqrt(max(0,1+2*eo*h*h/M**2));q=h*h/(M*(1+ecc))
    return {'boundInner':True,'innerSemimajor':float(ain),'outerEnergy':float(eo),'outerUnbound':bool(eo>=0),'outerPericenterToInnerA':float(q/ain),'hierarchicalBound':bool(eo<0 and q/ain>3),'shape':float(max(d)/min(d))}

output={}
for name in ['phase3','extended-3000','extended-10000-v2']:
    path=root/'results'/f'{name}.jsonl'
    if not path.exists():continue
    rows=[json.loads(x) for x in path.read_text().splitlines()];g=collections.defaultdict(list)
    for r in rows:g[r['profile']].append(r)
    if len(rows)!=512 or any(len(v)!=128 for v in g.values()):
        if name=='phase3':raise RuntimeError('Incomplete holdout: do not analyze early')
        continue
    if any(r['error'] for r in rows):raise RuntimeError('Unresolved numerical stops must not be analyzed as physical failures')
    detail={}
    for p,rr in g.items():
        surviving=[r for r in rr if r['survived']];classify=[final_hierarchy(r) for r in surviving]
        detail[p]={'n':len(rr),'survivors':len(surviving),'jointSurvivors':sum(r['jointSurvived'] for r in rr),'jointAndNonhierOverHalf':sum(r['jointSurvived'] and r['compactNonhierFraction'] is not None and r['compactNonhierFraction']>=.5 for r in rr),'survivorBoundHierarchies':sum(c['hierarchicalBound'] for c in classify),'survivorOuterUnbound':sum(c['outerUnbound'] is True for c in classify),'survivorFinalShapeBelow3':sum(c['shape']<3 for c in classify),'survivorDetails':[{'seed':r['seed'],'hierarchy':c,'jointSurvived':r['jointSurvived'],'nonhierFraction':r['compactNonhierFraction']} for r,c in zip(surviving,classify)],'initialMeanCrossingYears':float(np.mean([r['initial']['crossingTime'] for r in rr])),'energyBeforeLossMedian':float(np.median([r.get('maxEnergyErrorBeforeLoss',0) for r in rr])),'energyBeforeLossMax':max(r.get('maxEnergyErrorBeforeLoss',0) for r in rr)}
    base={r['seed']:r for r in g['legacy-random']};candidate={r['seed']:r for r in g['candidate']};wins=sum(candidate[s]['survived'] and not base[s]['survived'] for s in base);losses=sum(base[s]['survived'] and not candidate[s]['survived'] for s in base)
    output[name]={'groups':detail,'pairedDiscordance':{'candidateOnlySurvived':wins,'baselineOnlySurvived':losses,'exactMcNemarP':float(binomtest(wins,wins+losses,.5).pvalue) if wins+losses else 1}}
(root/'results/holdout-diagnostics.json').write_text(json.dumps(output,indent=2)+'\n')
print(json.dumps(output,indent=2))

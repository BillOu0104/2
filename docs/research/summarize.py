import sys,json,pathlib,collections,math
import numpy as np

def wilson(k,n):
    z=1.95996398454;p=k/n;den=1+z*z/n
    m=(p+z*z/(2*n))/den;d=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den
    return [m-d,m+d]

def unresolved(r):
    # A numerical stop AFTER an already observed absorbing physical loss does
    # not make that loss unknown. Stops before loss are censored, never deaths.
    return r['error'] is not None and r['lossReason'] not in ['engulfed','disrupted','boundary-crossing','positive-energy-escape']

path=pathlib.Path(sys.argv[1]);groups=collections.defaultdict(list)
for line in path.read_text().splitlines():
    r=json.loads(line);groups[r['profile']].append(r)
metrics=['restrictedLife','stableFraction','stableConditional','temperateFraction','compactNonhierFraction','jointStableFraction','maxEnergyError','maxEnergyErrorBeforeContact','maxLError','minSS','minSP']
summary={}
for name,rows in groups.items():
    n=len(rows);k=sum(r['survived'] for r in rows)
    s={'n':n,'survivors':k,'survival':k/n,'survival95':wilson(k,n),'jointSurvivors':sum(r['jointSurvived'] for r in rows),'stellarContacts':sum(r['starContactAt'] is not None for r in rows),'stellarBoundaryCrossings':sum(r['starBoundaryAt'] is not None for r in rows),'positiveEscapes':sum(r['positiveEscapeAt'] is not None for r in rows),'lossReasons':dict(collections.Counter(r['lossReason'] for r in rows)),'errors':sum(r['error'] is not None for r in rows),'cpuWallSeconds':sum(r['wallSeconds'] for r in rows)}
    s['unresolvedPrimaryOutcomes']=sum(unresolved(r) for r in rows)
    s['survivalBoundsWithUnresolved']=[k/n,(k+s['unresolvedPrimaryOutcomes'])/n]
    if s['unresolvedPrimaryOutcomes']:
        s['warning']='Numerical resource stops are censored/UNRESOLVED, never physical failures; survival is only bounded and other horizon statistics may be incomplete.'
        s['survival']=None;s['survival95']=None
    elif s['errors']:
        s['warning']='Numerical stop occurred only after known absorbing physical loss; primary survival/lifetime/stable-time outcomes are known, later dynamical diagnostics are incomplete.'
    for key in metrics:
        a=np.array([r[key] for r in rows if r[key] is not None]);s[key]={'nKnown':len(a),'mean':float(np.mean(a)) if len(a) else None,'median':float(np.median(a)) if len(a) else None,'p90':float(np.quantile(a,.9)) if len(a) else None,'max':float(np.max(a)) if len(a) else None}
    s['initialBoundAnyHost']=sum(any(x<0 for x in r['initial']['hostEnergies']) for r in rows)
    s['initialMeanQ']=float(np.mean([r['initial']['stars']['Q'] for r in rows]))
    s['initialMeanL']=float(np.mean([r['initial']['dimensionlessL'] for r in rows]))
    summary[name]=s

comparisons={};rng=np.random.default_rng(20261020)
for base,base_rows in groups.items():
    if base not in ['legacy-random','newton-random','newton-bound20','candidate','anchor']:continue
    a={r['seed']:r for r in base_rows}
    for target,rr in groups.items():
        if any(unresolved(r) for r in base_rows+rr):continue
        common=sorted(set(a)&{r['seed'] for r in rr})
        if not common or base==target:continue
        b={r['seed']:r for r in rr};entry={}
        for key in ['survived','jointSurvived','restrictedLife','stableFraction','jointStableFraction','compactNonhierFraction']:
            known=[s for s in common if b[s][key] is not None and a[s][key] is not None]
            if not known:continue
            delta=np.array([float(b[s][key])-float(a[s][key]) for s in known]);boot=delta[rng.integers(0,len(delta),(10000,len(delta)))].mean(axis=1)
            entry[key]={'pairedDifference':float(delta.mean()),'bootstrap95':np.quantile(boot,[.025,.975]).tolist(),'n':len(delta)}
        comparisons[base+' -> '+target]=entry
output={'source':str(path),'seedIndependentUnit':True,'bootstrapDraws':10000,'summary':summary,'comparisons':comparisons}
dest=path.with_suffix('.summary.json');dest.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print('profile n survival joint life stable jointStable nonhier errorMedian errors')
for k,s in summary.items():print(k,s['n'],round(s['survival'],3) if s['survival'] is not None else 'UNRESOLVED',s['jointSurvivors'],round(s['restrictedLife']['mean'],2),round(s['stableFraction']['mean'],3),round(s['jointStableFraction']['mean'],3),round(s['compactNonhierFraction']['mean'],3) if s['compactNonhierFraction']['mean'] is not None else 'unknown',format(s['maxEnergyError']['median'],'.2g') if s['maxEnergyError']['median'] is not None else 'unknown',s['errors'])
print('saved:',dest)

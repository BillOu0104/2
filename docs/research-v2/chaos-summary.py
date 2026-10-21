#!/usr/bin/env python3
"""Reproduce the preregistered diagnostic; retain unmeasured/short-window states.

This is a diagnostic gate, not proof of sustained three-way chaos. The geometric
isolation duration and nonhierarchical fraction remain necessary separate checks.
"""
import glob,json,math,pathlib,statistics,sys
stem=sys.argv[1]
rows=[json.loads(line) for f in sorted(glob.glob(stem+'.shard*.jsonl')) for line in pathlib.Path(f).read_text().splitlines() if line.strip()]
out={}
for name in sorted({r['profile'] for r in rows}):
 a=[r for r in rows if r['profile']==name];details={}
 for r in a:
  matureYears=max(0,r['horizon']-10000)
  exchanges=r['tightPairChanges']-next((b['tightPairChanges'] for b in r['bins'] if b['year']==10000),0)
  required=math.ceil(20*matureYears/90000) if matureYears else None
  measured=r.get('matureConditionalFTLE') is not None and matureYears>0
  gate=(r['stellarIntact'] and r['matureConditionalFTLE']>.003 and exchanges>=required and r['longestDynamicalHierarchyYears']<1000) if measured else None
  details[r['seed']]={'stellarIntact':r['stellarIntact'],'numericUnknown':r['numericallyCensored'],'diagnosticPass':gate,'requiredMatureExchanges':required,'matureTightExchanges':exchanges if matureYears else None,'matureConditionalFTLE':r.get('matureConditionalFTLE'),'matureNonhierFraction':r.get('matureNonhierFraction'),'longestGeometricHierarchyYears':r['longestHierarchyYears'],'longestDynamicalHierarchyYears':r['longestDynamicalHierarchyYears'],'matureStableFraction':r.get('matureStableFraction'),'matureStablePostRespawn25Contribution':r.get('matureStablePostRespawn25Contribution'),'normalizedControlDeltaL':math.hypot(*r['control']['deltaL'])/math.sqrt(1.3275440274585598e-8*(15e6)**3*r['initialScale'])}
  # Positive FTLE alone can mask a very long weakly bound excursion.
  details[r['seed']]['secondaryParticipationConcern']=r['longestHierarchyYears']>5000 or (r.get('matureNonhierFraction') is not None and r['matureNonhierFraction']<.1)
 out[name]={'n':len(a),'diagnosticPassCount':sum(d['diagnosticPass'] is True for d in details.values()),'unmeasuredCount':sum(d['diagnosticPass'] is None for d in details.values()),'secondaryParticipationConcernCount':sum(d['secondaryParticipationConcern'] for d in details.values()),'seeds':details}
pathlib.Path(stem+'.chaos-analysis.json').write_text(json.dumps({'scope':'FTLE>0.003, mature exchange rate>=20/90000yr, longest dynamical hierarchy<1000yr; geometric isolation separately disclosed','participationConcern':'Exploratory sensitivity screen only: geometric isolation>5000yr or mature nonhier<10%; not calibrated proof or replacement for raw distributions','groups':out},indent=2)+'\n')
for n,r in out.items():print(n,'diagnosticPass',r['diagnosticPassCount'],'unmeasured',r['unmeasuredCount'],'participationConcern',r['secondaryParticipationConcernCount'],'of',r['n'])

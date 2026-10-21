#!/usr/bin/env python3
"""Compare registered precision/shadow variants with the frozen D baseline."""
import glob,json,pathlib,sys
config=json.load(open(sys.argv[1]));stem=config['output'][:-6]
def read(stem):return [json.loads(l) for f in sorted(glob.glob(stem+'.shard*.jsonl')) for l in pathlib.Path(f).read_text().splitlines() if l.strip()]
baseline={(r['seed'],r['profile']):r for r in read('docs/research-v2/results/weak30k')}
fields=['finalBodies','initialBodies','stellarIntact','starFailure','stableFraction','matureStableFraction','control','planetExternal','steps','planetLosses','planetRespawns','civilizationBirths','civilizationDeaths','civilizationAliveFraction','civilizationActiveFraction','firstPlanetLoss','minSS']
details=[];errors=[]
for r in read(stem):
 name=r['profile'].split('__')[0];b=baseline[(r['seed'],name)];assert r['initialBodies']==b['initialBodies'],'paired initial mismatch'
 differences=[k for k in fields if r.get(k)!=b.get(k)]
 if config['prefix']=='V2-D' and pathlib.Path(sys.argv[1]).stem=='shadow30k' and differences:errors.append({'seed':r['seed'],'profile':r['profile'],'primaryDifferences':differences})
 details.append({'seed':r['seed'],'profile':r['profile'],'primaryDifferences':differences,'baselineMatureFTLE':b['matureConditionalFTLE'],'variantMatureFTLE':r['matureConditionalFTLE'],'baselineMatureStable':b['matureStableFraction'],'variantMatureStable':r['matureStableFraction'],'baselineResidual':b['maxNumericalEnergyResidual'],'variantResidual':r['maxNumericalEnergyResidual'],'baselineSteps':b['steps'],'variantSteps':r['steps'],'variantStellarIntact':r['stellarIntact'],'variantUnknown':r['numericallyCensored']})
out={'comparison':'shadow measurement must not change primary; precision trajectories may diverge chaotically','errors':errors,'rows':details}
pathlib.Path(stem+'.paired.json').write_text(json.dumps(out,indent=2)+'\n');print('paired comparisons',len(details),'primary measurement errors',len(errors));sys.exit(1 if errors else 0)

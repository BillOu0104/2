#!/usr/bin/env python3
"""Additional impulse diagnostics from immutable event records, without rerunning.

The native ledger counts all sequential body updates. Capture-frame net velocity
changes complement that ledger and may cancel; neither replaces the other.
"""
import glob,gzip,json,math,pathlib,sys
sys.path.insert(0,'/tmp/codex-v2-python')
import ijson
stem=sys.argv[1];rows=[json.loads(l) for f in (sorted(glob.glob(stem+'.shard*.jsonl')) or [stem+'.jsonl']) for l in pathlib.Path(f).read_text().splitlines() if l.strip()];out=[]
assert rows,'No result rows found; refuse an empty diagnostic'
for r in rows:
 counts={};peak=impulse=absoluteL=peakL=0.
 with gzip.open(r['rawFile'],'rb') as f:
  for e in ijson.items(f,'events.item',use_float=True):
   kind=e['kind'];counts[kind]=counts.get(kind,0)+1
   if 'deltaVelocity' not in e:continue
   dvs=e['deltaVelocity'];ids=e.get('pair',list(range(len(dvs))))
   peak=max(peak,max(map(lambda v:math.hypot(*v),dvs),default=0))
   impulse+=sum(r['initialBodies'][i]['mass']*math.hypot(*v) for i,v in zip(ids,dvs))
   if 'deltaAngularMomentum' in e:
    jump=math.hypot(*e['deltaAngularMomentum']);absoluteL+=jump;peakL=max(peakL,jump)
 scaleL=math.sqrt(1.3275440274585598e-8*(15e6)**3*r['initialScale'])
 out.append({'seed':r['seed'],'profile':r['profile'],'rawSHA256':r['rawSHA256'],'eventCounts':counts,'peakRecordedNetEventDeltaV':peak,'netEventImpulseSum':impulse,'nativeSequentialImpulse':r['control']['impulse'],'nativeSequentialPeakDeltaV':r['control']['peakVelocityJump'],'deflectionCumulativeNormDeltaLNormalized':absoluteL/scaleL,'deflectionPeakDeltaLNormalized':peakL/scaleL,'totalSignedDeltaLNormNormalized':math.hypot(*r['control']['deltaL'])/scaleL,'angularScope':'Cumulative norm recorded for pericenter-deflection events only; capture-frame net velocities do not reconstruct unrecorded per-subprojection angular budgets. Continuous force impulse remains in native ledger.'})
pathlib.Path(stem+'.interventions.json').write_text(json.dumps(out,indent=2)+'\n');print('Audited event diagnostics:',len(out))

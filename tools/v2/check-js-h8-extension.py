#!/usr/bin/env python3
"""Validate real frozen inputs and synthetic aggregation only; no physical experiments."""
import copy,json,pathlib,runpy,tempfile
M=runpy.run_path('tools/v2/run-js-precision-extension.py')
s,expected=M['spec']()
ids=[i for p in s['configs'] for c in [json.load(open(p))] for i in range(c['start'],c['start']+c['seeds'])]
assert ids==list(range(32,128)) and len(set(ids))==96
assert len(s['baseConfigs'])==16
# Synthetic constant offset checks combining all32 prior and96 extension seeds,
# sign/units/sample size, and rejection of duplicate/missing outcome keys.
def fixture(c,offset):
 return [dict(seed=c['prefix']+'-'+str(i),mode=mode,horizon=h,
              matureStableFraction=.2+offset,stellarIntact=True,joint=True,numericalUNKNOWN=None)
         for i in range(c['start'],c['start']+c['seeds']) for mode in c['modes'] for h in c['horizons']]
G=M['review'].__globals__;original_audit=G['audit'];original_f=G['F']
f=copy.copy(original_f);f['audit']=lambda c,*args:fixture(c,0)
try:
 G['audit']=lambda c,*args:fixture(c,.01);G['F']=f
 rows=[r for p in s['configs'] for r in fixture(json.load(open(p)),.01)]
 with tempfile.TemporaryDirectory(prefix='v2-h8-extension-review-') as td:
  d=pathlib.Path(td);M['review'](s,copy.deepcopy(rows),d);r=json.load(open(d/'review.json'))
  assert r['rows']==1024
  for v in r['groups'].values():
   assert v['n']==128 and v['h8Intact']==128 and v['h8Joint']==128
   assert abs(v['h8MinusH4Mean']-.01)<1e-12
   assert all(abs(x-.01)<1e-12 for x in v['pairedBootstrap95'])
   assert v['withinPrespecified5PercentagePointDiagnosticMargin']
  invalid=copy.deepcopy(rows);invalid[-1]=copy.deepcopy(invalid[0])
  try:M['review'](s,invalid,d)
  except AssertionError:pass
  else:raise AssertionError('Duplicate key was not rejected')
finally:G['audit']=original_audit;G['F']=original_f
print(json.dumps({'check':'PASS','realFrozenInputs':'all original h4/h8 source/config/raw/state/initial/step audits PASS','extensionSeeds':96,'range':[32,127],'aggregationTest':'SYNTHETIC constant +1 percentage point on128 keys; duplicate rejection; NOT simulated research data','sourceHashPreview':expected['sourceHash']}))

#!/usr/bin/env python3
"""Full raw-metadata audit and equal-precision comparison. No simulation reruns."""
import collections,json,pathlib,runpy,statistics
helpers=runpy.run_path('docs/research-v2/analyze-precision-extension.py')
sha,rawmetadata,signature,wilson,reasons=[helpers[k] for k in ['sha','rawmetadata','signature','wilson','reasons']]
R=pathlib.Path('docs/research-v2/results');D=R/'precision-baselines'
manifest=json.load(open(R/'precision-baselines.manifest.json'))
for p,h in manifest['files'].items():assert sha(p)==h,p
initial=json.load(open('docs/research-v2/confirmation-v1/initial-state-audit.json'))['seeds']
base=[json.loads(l) for l in open(R/'precision-h4/comparisons.jsonl')];assert len(base)==1024
new=[]
for cfgfile in json.load(open('docs/research-v2/precision-baselines/study.json'))['configs']:
    cfg=json.load(open(cfgfile));stem=cfg['output'][:-6];found=[]
    expected={(cfg['prefix']+'-'+str(i),p['id']) for i in range(cfg['start'],cfg['start']+cfg['seeds']) for p in cfg['profiles']}
    for f in sorted(D.glob(pathlib.Path(stem).name+'.shard*.jsonl')):
        mf=json.load(open(str(f)+'.manifest.json'));assert mf['configHash']==sha(cfgfile) and mf['config']==cfg
        assert mf['sourceHash']==manifest['originalConfirmationSpec']['sourceHash'] and mf['binaryHash']==manifest['originalConfirmationSpec']['binaryHash']
        for line in f.read_text().splitlines():
            r=json.loads(line);assert sha(r['rawFile'])==r['rawSHA256']
            for k,v in rawmetadata(r['rawFile']).items():assert r[k]==v,'native raw/index mismatch: '+k
            assert r['sourceHash']==mf['sourceHash'] and r['configHash']==mf['configHash']
            assert signature(r['initialBodies'])==initial[r['seed']]['initialSHA256']
            if 'stateCheckpoint' in r:
                assert sha(r['stateCheckpoint'])==r['stateCheckpointSHA256'] and sha(r['stateInput'])==r['stateInputSHA256']
            assert not r['stellarIntact'] or abs(r['integratedYears']-100000)<.01
            found.append(r)
    keys=[(r['seed'],r['profile']) for r in found];assert len(keys)==len(set(keys)) and set(keys)==expected
    new+=found
assert len(new)==256
keys=[(r['seed'],r['profile']) for r in base+new];assert len(keys)==len(set(keys))==1280
rows=[r for r in base if r['profile'].endswith('__h4')]+new;assert len(rows)==512
(D/'matched-h4.jsonl').write_text(''.join(json.dumps(r,separators=(',',':'))+'\n' for r in rows))
groups={}
for p in sorted({r['profile'] for r in rows}):
    a=[r for r in rows if r['profile']==p];s=[r for r in a if r['stellarIntact']];j=sum(not reasons(r) for r in s)
    groups[p]={'n':len(a),'stellarIntact':len(s),'stellarWilson95':wilson(len(s),len(a)),'joint':j,'jointWilson95':wilson(j,len(a)),'numericUnknown':sum(r['numericallyCensored'] for r in a),'failureKinds':dict(collections.Counter((r['starFailure'] or {}).get('kind','complete') for r in a)),'matureStableAll':statistics.mean(r['matureStableFraction'] for r in a),'matureStableStellarSurvivors':statistics.mean(r['matureStableFraction'] for r in s) if s else None,'terminationOrCensoringMedianYear':statistics.median(r['integratedYears'] for r in a)}
out={'researchComplete':False,'status':'MATCHED_BASELINES_AUDIT_COMPLETE','newRows':256,'matchedH4Rows':512,'allUniqueKeysIncludingEarlierPrecision':1280,'rawMetadataAuditedRows':256,'numericUnknowns':sum(r['numericallyCensored'] for r in new),'scope':'Same128initial conditions, identical h4 steps/eta/P5/stellar failure/epoch rules; earlier terminal failures retained and not called completed100000years. Distinct config hashes retained.','groups':groups}
(D/'matched-review.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out,indent=2))

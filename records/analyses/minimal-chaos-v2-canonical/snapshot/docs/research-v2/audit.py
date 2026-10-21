#!/usr/bin/env python3
"""Check immutable raw records, full seed keys and provenance of a registered run."""
import glob,gzip,hashlib,json,pathlib,sys
config=json.load(open(sys.argv[1]));stem=config['output'][:-6];files=sorted(glob.glob(stem+'.shard*.jsonl')) or [config['output']];rows=[]
for f in files:
 p=pathlib.Path(f);assert p.exists(),f;data=p.read_text();assert not data or data.endswith('\n'),'truncated tail';manifest=json.load(open(f+'.manifest.json'))
 assert manifest['config']==config,'different registered config'
 for l in data.splitlines():
  r=json.loads(l);assert r['sourceHash']==manifest['sourceHash'] and r['configHash']==manifest['configHash'],'provenance mismatch'
  if 'rawFile' in r:
   raw=pathlib.Path(r['rawFile']).read_bytes();assert hashlib.sha256(raw).hexdigest()==r['rawSHA256'],r['rawFile'];q=json.loads(gzip.decompress(raw));assert (q['seed'],q['profile'],q['sourceHash'],q['configHash'])==(r['seed'],r['profile'],r['sourceHash'],r['configHash']);assert len(q['events'])==r['eventCount']
  assert len(r['initialBodies'])==4 and all(x['mass']>0 for x in r['initialBodies']),'invalid initial population'
  if r['stellarIntact']:assert not r['starFailure'] and not r['error'] and abs(r['integratedYears']-r['horizon'])<.01,'unintegrated success'
  if r['numericallyCensored']:assert not r['stellarIntact'],'numeric interruption called success'
  assert r['planetRespawns']<=r['planetLosses'];assert 0<=r['stableFraction']<=1;rows.append(r)
keys=[(r['seed'],r['profile']) for r in rows];assert len(set(keys))==len(keys),'duplicate seed result'
expected={(config['prefix']+'-'+str(i),p['id']) for i in range(config.get('start',0),config.get('start',0)+config['seeds']) for p in config['profiles']};missing=sorted(expected-set(keys));extra=sorted(set(keys)-expected);assert not extra,extra
report={'rows':len(rows),'expected':len(expected),'missing':missing,'unknownNumerical':sum(r['numericallyCensored'] for r in rows),'rawChecksumsPass':True,'duplicates':0,'complete':not missing};pathlib.Path(stem+'.audit.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));sys.exit(0 if not missing else 1)

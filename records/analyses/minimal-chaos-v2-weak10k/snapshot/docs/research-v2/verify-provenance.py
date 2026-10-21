#!/usr/bin/env python3
"""Verify frozen Git source bytes plus config, raw and saved recovery hashes."""
import argparse,glob,hashlib,json,pathlib,subprocess
p=argparse.ArgumentParser();p.add_argument('config');p.add_argument('--source-ref',required=True);args=p.parse_args()
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
cfg=json.load(open(args.config));stem=cfg['output'][:-6];count=states=0;initialBySeed={}
initialization={p['id']:p.get('initialization','research') for p in cfg['profiles']}
for file in sorted(glob.glob(stem+'.shard*.jsonl')):
 mf=json.load(open(file+'.manifest.json'));h=hashlib.sha256()
 for name in mf['sourceFiles']:
  h.update(name.encode()+b'\0');h.update(subprocess.check_output(['git','show',args.source_ref+':'+name]))
 assert h.hexdigest()==mf['sourceHash'],'Git source bytes mismatch'
 assert sha(args.config)==mf['configHash'],'config byte hash mismatch'
 for line in pathlib.Path(file).read_text().splitlines():
  r=json.loads(line);assert (r['sourceHash'],r['configHash'])==(mf['sourceHash'],mf['configHash'])
  key=(r['seed'],initialization[r['profile']]);assert initialBySeed.setdefault(key,r['initialBodies'])==r['initialBodies'],'mismatched paired initial conditions'
  assert sha(r['rawFile'])==r['rawSHA256'];count+=1
  if 'stateCheckpoint' in r:
   assert sha(r['stateCheckpoint'])==r['stateCheckpointSHA256']
   assert sha(r['stateInput'])==r['stateInputSHA256']
   ip=json.load(open(r['stateInput']));assert (ip['seed'],ip['profile'],ip['sourceHash'],ip['configHash'])==(r['seed'],r['profile'],r['sourceHash'],r['configHash']);assert ip['bodies']==r['initialBodies'];states+=1
report={'sourceRef':args.source_ref,'sourceCommit':subprocess.check_output(['git','rev-parse',args.source_ref],text=True).strip(),'rows':count,'savedStatesAndInputs':states,'sourceBytesVerified':True,'configBytesVerified':True,'rawChecksumsVerified':True,'savedStateInputChecksumsVerified':True,'pairedInitialConditionsVerified':True,'binaryRebuiltDuringAudit':False}
pathlib.Path(stem+'.provenance.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))

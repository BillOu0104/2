#!/usr/bin/env python3
"""Per-shard advisory lock; the OS releases it after interruption."""
import fcntl,json,os,pathlib,subprocess,sys,time
root=pathlib.Path(__file__).resolve().parents[2];os.chdir(root)
if len(sys.argv)<2:raise SystemExit('usage: supervise.py CONFIG.json [SHARD] [SHARDS]')
config=sys.argv[1];shard=int(sys.argv[2]) if len(sys.argv)>2 else 0;shards=int(sys.argv[3]) if len(sys.argv)>3 else 1
cfg=json.load(open(config));output=cfg['output'].replace('.jsonl',f'.shard{shard}.jsonl' if shards>1 else '.jsonl');lock=pathlib.Path(output+'.lock');lock.parent.mkdir(parents=True,exist_ok=True)
with lock.open('a+') as fd:
 try:fcntl.flock(fd.fileno(),fcntl.LOCK_EX|fcntl.LOCK_NB)
 except BlockingIOError:print(json.dumps({'status':'already-running','config':config,'shard':shard}));raise SystemExit(0)
 fd.seek(0);fd.truncate();json.dump({'pid':os.getpid(),'config':config,'shard':shard,'started':time.time()},fd);fd.flush();os.fsync(fd.fileno())
 code=subprocess.run(['node','docs/research-v2/run-native.mjs',config,str(shard),str(shards)],pass_fds=(fd.fileno(),)).returncode
 raise SystemExit(code)

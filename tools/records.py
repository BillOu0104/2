#!/usr/bin/env python3
"""Versioned evidence archive, using Git objects and standard-library-only hashing."""
import argparse,datetime,hashlib,json,pathlib,re,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
ARCHIVE=ROOT/'records'
def git(*args):return subprocess.check_output(['git','-c','core.quotePath=false',*args],cwd=ROOT)
def sha(data):return hashlib.sha256(data).hexdigest()
def revision(ref):return git('rev-parse','--verify',f'{ref}^{{commit}}').decode().strip()
def selected(path):return path.startswith(('docs/','tests/','tools/','.github/')) or path in ['README.md','FINAL_REPORT.md','STATUS.md','package.json','package-lock.json']
def runtime_fingerprint(ref=None):
 if ref:
  entries=git('ls-tree','-r',ref,'--','src','assets','index.html').decode().splitlines()
  files=[(line.split('\t',1)[1],git('show',f'{ref}:{line.split(chr(9),1)[1]}')) for line in entries]
 else:
  files=[(p, (ROOT/p).read_bytes()) for p in git('ls-files','--','src','assets','index.html').decode().splitlines() if (ROOT/p).is_file()]
 return sha(''.join(f'{p}\0{sha(data)}\n' for p,data in sorted(files)).encode())
def load_records():return sorted([json.loads(p.read_text()) for p in ARCHIVE.glob('*/*/record.json')],key=lambda r:(r['kind']!='version',r['id']))
def render_index():
 records=load_records();index={'format':1,'records':[{'id':r['id'],'kind':r['kind'],'path':r['path'],'source_commit':r['source_commit'],'version':r.get('version'),'title':r['title']} for r in records]}
 (ARCHIVE/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
 s='# 三体壁纸：版本、分析与测试记录\n\n这里集中保存v0.1起每次发布/修订当时的修改、测试代码、测试输出、截图和研究数据。快照直接取自对应Git提交，不把当前测试冒充历史测试；文件SHA256及原始路径见各目录的record.json。\n\n'
 s+='源码和记录上传GitHub；默认预览入口继续使用原私有网页。具体约定见 [后续维护规范](POLICY.md)；按问题查阅见 [分析索引](analyses/README.md)。\n\n| 版本 / 分析 | 内容 | 原始提交 |\n|---|---|---|\n'
 for r in records:s+=f"| [{r['id']}]({r['path']}/README.md) | {r['title']} | [{r['source_commit'][:7]}](https://github.com/BillOu0104/2/commit/{r['source_commit']}) |\n"
 s+='\n## 怎么查看\n\n每个目录的README介绍本次改动；snapshot保留原始目录结构，docs/qa是当时测试输出与截图，tests是测试源码，tools是运行/分析脚本。changes.patch记录源代码差异；record.json提供精确提交、上一个提交、文件清单和哈希。只复制该次新增/修改的文件，继承项沿previous_commit及前一版查阅。原始代码可在提交链接或独立历史分支直接查看。\n\n原私有仓库v0.1–v0.5完整代码历史还保存在 [history/sites-v0.1-v0.5](https://github.com/BillOu0104/2/tree/history/sites-v0.1-v0.5)。历史Markdown内部的相对代码链接以原提交根目录为准；snapshot是证据副本，不是另一个可直接运行的工程。\n\n## 分析阅读顺序\n\n1. v0.1的SOURCE-AUDIT：原版公式、接口、移植缺陷与兼容边界。\n2. v0.2的CIVILIZATION-UPDATE：文明频繁灭绝、韧性与视觉修正。\n3. v0.3的REFERENCE-MODEL：纪元/天象/行星/文明分层与脱水复苏。\n4. v0.4.1-hotfix、v0.4.2、v0.5的轨道抽样：稳定初值、混沌恢复、回拉效果与文明寿命。\n5. analyses/newtonian-survival：无牢笼研究全报告、阶段分析、原始数据与数值验证。\n6. v0.5.2的ACCEPTANCE：实际引擎修复后的独立新队列及其限制。\n\n未保存成文件的历史对话不被冒称为逐字聊天记录；已保存的分析文件和实验均按来源提交归档。\n'
 (ARCHIVE/'README.md').write_text(s)
def capture(args):
 if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*',args.id):raise ValueError('Invalid record id')
 ref=revision(args.ref);prev=revision(args.previous) if args.previous else None
 folder=('versions' if args.kind=='version' else 'analyses')+'/'+args.id;target=ARCHIVE/folder
 if target.exists():raise ValueError('Record exists; use a new revision id instead of rewriting history')
 files=git('diff','--name-only','--diff-filter=ACMRT',prev,ref).decode().splitlines() if prev else git('ls-tree','-r','--name-only',ref).decode().splitlines()
 source_files=[p for p in files if selected(p) and not p.startswith('tools/records')]
 target.mkdir(parents=True)
 entries=[]
 for p in source_files:
  data=git('show',f'{ref}:{p}');dest=target/'snapshot'/p;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
  entries.append({'source_path':p,'archive_path':'snapshot/'+p,'sha256':sha(data),'bytes':len(data)})
 patch=git('diff',prev or '4b825dc642cb6eb9a060e54bf8d69288fbee4904',ref,'--','src','index.html','package.json','package-lock.json','tests','tools','.github')
 (target/'changes.patch').write_bytes(patch);entries.append({'source_path':None,'archive_path':'changes.patch','sha256':sha(patch),'bytes':len(patch)})
 version=json.loads(git('show',f'{ref}:package.json')).get('version') if args.kind=='version' else None
 record={'format':1,'id':args.id,'path':folder,'kind':args.kind,'version':version,'title':args.title,'summary':args.summary,'source_commit':ref,'previous_commit':prev,'source_repository':'https://github.com/BillOu0104/2','source_subject':git('show','-s','--format=%s',ref).decode().strip(),'source_date':git('show','-s','--format=%cI',ref).decode().strip(),'archived_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'runtime_fingerprint':runtime_fingerprint(ref) if version else None,'deleted_paths':git('diff','--name-only','--diff-filter=D',prev,ref).decode().splitlines() if prev else [],'files':entries}
 (target/'record.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
 readme=f"# {args.id} — {args.title}\n\n{args.summary}\n\n原始提交：[{ref[:7]}](https://github.com/BillOu0104/2/commit/{ref})；提交时间：{record['source_date']}。\n\n这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。\n\n[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)\n\n"
 groups=[('修改、分析和说明',lambda p:p.endswith('.md') or p=='docs/settings-guide.html'),('测试结果、截图与实验数据',lambda p:'/qa/' in p or '/results/' in p or p.startswith('docs/v052/results/')),('测试与实验脚本',lambda p:p.startswith(('tests/','tools/')))]
 seen=set()
 for title,predicate in groups:
  chosen=[p for p in source_files if p not in seen and predicate(p)]
  if chosen:
   readme+=f'## {title}\n\n'
   for p in chosen:readme+=f'- [{p}](snapshot/{p})\n';seen.add(p)
 remaining=[p for p in source_files if p not in seen]
 if remaining:readme+='\n其他原始文件位于snapshot，完整清单见record.json。\n'
 if prev:readme+=f'\n仅归档相对 [{prev[:7]}](https://github.com/BillOu0104/2/commit/{prev}) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。\n'
 (target/'README.md').write_text(readme);render_index();print(f'{folder}: {len(entries)} files, source {ref[:7]}')
def check(args):
 records=load_records();assert records,'No records'
 index=json.loads((ARCHIVE/'index.json').read_text());assert {r['id'] for r in records}=={r['id'] for r in index['records']}
 total=0
 for r in records:
  base=ARCHIVE/r['path'];listed=set()
  for f in r['files']:
   file=(base/f['archive_path']).resolve();assert file.is_relative_to(base.resolve()),file
   data=file.read_bytes();assert len(data)==f['bytes'] and sha(data)==f['sha256'],file;listed.add(file);total+=1
  actual={p.resolve() for p in (base/'snapshot').rglob('*') if p.is_file()}|{(base/'changes.patch').resolve()}
  assert listed==actual,base
 version=json.loads((ROOT/'package.json').read_text())['version'];candidates=[r for r in records if r.get('version')==version]
 assert candidates and runtime_fingerprint() in {r['runtime_fingerprint'] for r in candidates},'Current runtime/version has no matching archive; capture the new source commit first'
 print(f'Archive valid: {len(records)} records, {total} files; runtime {version} matches an archived source')
parser=argparse.ArgumentParser(description=__doc__);sub=parser.add_subparsers(dest='command',required=True)
c=sub.add_parser('capture');c.add_argument('--id',required=True);c.add_argument('--kind',choices=['version','analysis'],default='version');c.add_argument('--ref',default='HEAD');c.add_argument('--previous');c.add_argument('--title',required=True);c.add_argument('--summary',required=True);sub.add_parser('check');args=parser.parse_args()
try: capture(args) if args.command=='capture' else check(args)
except (ValueError,AssertionError) as error: print(f'Archive error: {error}',file=sys.stderr);sys.exit(1)

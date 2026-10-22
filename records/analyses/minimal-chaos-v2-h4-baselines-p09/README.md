# minimal-chaos-v2-h4-baselines-p09 — 确认后精度诊断 p09

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[b02ef62](https://github.com/BillOu0104/2/commit/b02ef620bb169b05f0c6066684b916208a4a8185)；提交时间：2026-10-22T18:39:57Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p09-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p09-worker0.log)
- [docs/research-v2/results/precision-baselines/p09-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p09-worker1.log)
- [docs/research-v2/results/precision-baselines/p09.audit.json](snapshot/docs/research-v2/results/precision-baselines/p09.audit.json)
- [docs/research-v2/results/precision-baselines/p09.batch.json](snapshot/docs/research-v2/results/precision-baselines/p09.batch.json)
- [docs/research-v2/results/precision-baselines/p09.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p09.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p09.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p09.interventions.json)
- [docs/research-v2/results/precision-baselines/p09.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p09.provenance.json)
- [docs/research-v2/results/precision-baselines/p09.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p09.seeds.csv)
- [docs/research-v2/results/precision-baselines/p09.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p09.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p09.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p09.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p09.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p09.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p09.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p09.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p09.summary.json](snapshot/docs/research-v2/results/precision-baselines/p09.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-72-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-73-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-73-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-73-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-73-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-74-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-74-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-74-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-74-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-75-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-75-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-75-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-75-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-76-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-76-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-76-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-76-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-77-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-77-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-77-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-77-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-78-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-79-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-79-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-79-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-c282288e62b2b864/V2-CONFIRM-20261021-79-newton__h4.json.gz)

仅归档相对 [ecedeb4](https://github.com/BillOu0104/2/commit/ecedeb4c3b4befdd8679b5de1f05ea74e0d4160c) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

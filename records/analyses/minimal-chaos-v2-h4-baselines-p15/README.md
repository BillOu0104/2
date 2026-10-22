# minimal-chaos-v2-h4-baselines-p15 — 确认后精度诊断 p15

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[7d3e01c](https://github.com/BillOu0104/2/commit/7d3e01c208e83328df5338060a4a44d2a3e82fc2)；提交时间：2026-10-22T18:50:14Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p15-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p15-worker0.log)
- [docs/research-v2/results/precision-baselines/p15-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p15-worker1.log)
- [docs/research-v2/results/precision-baselines/p15.audit.json](snapshot/docs/research-v2/results/precision-baselines/p15.audit.json)
- [docs/research-v2/results/precision-baselines/p15.batch.json](snapshot/docs/research-v2/results/precision-baselines/p15.batch.json)
- [docs/research-v2/results/precision-baselines/p15.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p15.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p15.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p15.interventions.json)
- [docs/research-v2/results/precision-baselines/p15.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p15.provenance.json)
- [docs/research-v2/results/precision-baselines/p15.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p15.seeds.csv)
- [docs/research-v2/results/precision-baselines/p15.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p15.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p15.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p15.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p15.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p15.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p15.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p15.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p15.summary.json](snapshot/docs/research-v2/results/precision-baselines/p15.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-120-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-120-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-120-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-120-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-121-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-122-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-122-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-122-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-122-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-123-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-124-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-124-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-124-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-124-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-125-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-125-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-125-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-125-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-126-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-126-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-126-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-126-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-d8d6005cdd7f666c/V2-CONFIRM-20261021-127-newton__h4.json.gz)

仅归档相对 [757a8fd](https://github.com/BillOu0104/2/commit/757a8fda7ac0577cf961aeedb8c91c939e6167a7) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

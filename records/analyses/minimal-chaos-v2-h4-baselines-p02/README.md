# minimal-chaos-v2-h4-baselines-p02 — 确认后精度诊断 p02

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[47bd30d](https://github.com/BillOu0104/2/commit/47bd30de3a8a04f0b1f29935c72d70f55c493bd0)；提交时间：2026-10-22T18:24:33Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p02-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p02-worker0.log)
- [docs/research-v2/results/precision-baselines/p02-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p02-worker1.log)
- [docs/research-v2/results/precision-baselines/p02.audit.json](snapshot/docs/research-v2/results/precision-baselines/p02.audit.json)
- [docs/research-v2/results/precision-baselines/p02.batch.json](snapshot/docs/research-v2/results/precision-baselines/p02.batch.json)
- [docs/research-v2/results/precision-baselines/p02.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p02.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p02.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p02.interventions.json)
- [docs/research-v2/results/precision-baselines/p02.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p02.provenance.json)
- [docs/research-v2/results/precision-baselines/p02.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p02.seeds.csv)
- [docs/research-v2/results/precision-baselines/p02.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p02.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p02.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p02.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p02.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p02.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p02.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p02.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p02.summary.json](snapshot/docs/research-v2/results/precision-baselines/p02.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-16-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-17-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-17-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-17-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-17-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-18-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-19-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-19-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-19-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-19-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-20-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-20-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-20-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-20-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-21-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-21-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-21-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-21-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-22-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-23-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-23-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-23-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-17f661807ec70dcf/V2-CONFIRM-20261021-23-newton__h4.json.gz)

仅归档相对 [a41fe11](https://github.com/BillOu0104/2/commit/a41fe11d4eea03d7fb730ffe602469ba9264251f) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

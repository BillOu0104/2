# minimal-chaos-v2-h4-baselines-p06 — 确认后精度诊断 p06

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[9a8f6f6](https://github.com/BillOu0104/2/commit/9a8f6f68cb7f267ee914fd3d46e8251383bb2437)；提交时间：2026-10-22T18:37:01Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p06-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p06-worker0.log)
- [docs/research-v2/results/precision-baselines/p06-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p06-worker1.log)
- [docs/research-v2/results/precision-baselines/p06.audit.json](snapshot/docs/research-v2/results/precision-baselines/p06.audit.json)
- [docs/research-v2/results/precision-baselines/p06.batch.json](snapshot/docs/research-v2/results/precision-baselines/p06.batch.json)
- [docs/research-v2/results/precision-baselines/p06.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p06.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p06.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p06.interventions.json)
- [docs/research-v2/results/precision-baselines/p06.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p06.provenance.json)
- [docs/research-v2/results/precision-baselines/p06.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p06.seeds.csv)
- [docs/research-v2/results/precision-baselines/p06.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p06.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p06.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p06.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p06.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p06.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p06.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p06.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p06.summary.json](snapshot/docs/research-v2/results/precision-baselines/p06.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-48-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-48-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-48-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-48-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-49-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-49-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-49-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-49-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-50-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-51-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-51-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-51-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-51-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-52-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-52-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-52-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-52-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-53-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-53-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-53-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-53-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-54-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b8faa3b6fe5c8994/V2-CONFIRM-20261021-55-newton__h4.json.gz)

仅归档相对 [d3e87e1](https://github.com/BillOu0104/2/commit/d3e87e1e514f1742c0a1d4998f313bc5d4b68a85) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

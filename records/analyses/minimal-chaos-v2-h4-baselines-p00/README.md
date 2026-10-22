# minimal-chaos-v2-h4-baselines-p00 — 确认后精度诊断 p00

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[4cb10d1](https://github.com/BillOu0104/2/commit/4cb10d1aa74316c88adbdb8e1587654a66fa38b0)；提交时间：2026-10-22T18:10:40Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p00-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p00-worker0.log)
- [docs/research-v2/results/precision-baselines/p00-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p00-worker1.log)
- [docs/research-v2/results/precision-baselines/p00.audit.json](snapshot/docs/research-v2/results/precision-baselines/p00.audit.json)
- [docs/research-v2/results/precision-baselines/p00.batch.json](snapshot/docs/research-v2/results/precision-baselines/p00.batch.json)
- [docs/research-v2/results/precision-baselines/p00.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p00.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p00.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p00.interventions.json)
- [docs/research-v2/results/precision-baselines/p00.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p00.provenance.json)
- [docs/research-v2/results/precision-baselines/p00.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p00.seeds.csv)
- [docs/research-v2/results/precision-baselines/p00.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p00.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p00.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p00.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p00.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p00.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p00.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p00.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p00.summary.json](snapshot/docs/research-v2/results/precision-baselines/p00.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-0-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-1-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-1-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-1-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-1-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-2-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-2-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-2-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-2-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-3-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-3-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-3-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-3-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-4-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-4-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-4-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-4-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-5-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-5-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-5-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-5-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-6-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-6-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-6-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-6-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-045a370d725613a6/V2-CONFIRM-20261021-7-newton__h4.json.gz)

仅归档相对 [923d581](https://github.com/BillOu0104/2/commit/923d581a3fda1cfe726580adc3675e352283cc9b) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

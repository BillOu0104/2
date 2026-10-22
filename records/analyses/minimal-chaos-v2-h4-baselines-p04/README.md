# minimal-chaos-v2-h4-baselines-p04 — 确认后精度诊断 p04

100000年匹配精度诊断；不新增独立确认Seed，不替换主确认，保留失败/UNKNOWN、原始/恢复哈希及控制和行星预算；main未修改。

原始提交：[3299d74](https://github.com/BillOu0104/2/commit/3299d7453d1f206dad355c4497c6d276a2871aa4)；提交时间：2026-10-22T18:35:42Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/research-v2/EXPERIMENT_LOG.md](snapshot/docs/research-v2/EXPERIMENT_LOG.md)
## 测试结果、截图与实验数据

- [docs/research-v2/results/precision-baselines.state.json](snapshot/docs/research-v2/results/precision-baselines.state.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.input.json](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.input.json)
- [docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.state.json.gz](snapshot/docs/research-v2/results/precision-baselines/checkpoints/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.state.json.gz)
- [docs/research-v2/results/precision-baselines/p04-worker0.log](snapshot/docs/research-v2/results/precision-baselines/p04-worker0.log)
- [docs/research-v2/results/precision-baselines/p04-worker1.log](snapshot/docs/research-v2/results/precision-baselines/p04-worker1.log)
- [docs/research-v2/results/precision-baselines/p04.audit.json](snapshot/docs/research-v2/results/precision-baselines/p04.audit.json)
- [docs/research-v2/results/precision-baselines/p04.batch.json](snapshot/docs/research-v2/results/precision-baselines/p04.batch.json)
- [docs/research-v2/results/precision-baselines/p04.chaos-analysis.json](snapshot/docs/research-v2/results/precision-baselines/p04.chaos-analysis.json)
- [docs/research-v2/results/precision-baselines/p04.interventions.json](snapshot/docs/research-v2/results/precision-baselines/p04.interventions.json)
- [docs/research-v2/results/precision-baselines/p04.provenance.json](snapshot/docs/research-v2/results/precision-baselines/p04.provenance.json)
- [docs/research-v2/results/precision-baselines/p04.seeds.csv](snapshot/docs/research-v2/results/precision-baselines/p04.seeds.csv)
- [docs/research-v2/results/precision-baselines/p04.shard0.jsonl](snapshot/docs/research-v2/results/precision-baselines/p04.shard0.jsonl)
- [docs/research-v2/results/precision-baselines/p04.shard0.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p04.shard0.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p04.shard1.jsonl](snapshot/docs/research-v2/results/precision-baselines/p04.shard1.jsonl)
- [docs/research-v2/results/precision-baselines/p04.shard1.jsonl.manifest.json](snapshot/docs/research-v2/results/precision-baselines/p04.shard1.jsonl.manifest.json)
- [docs/research-v2/results/precision-baselines/p04.summary.json](snapshot/docs/research-v2/results/precision-baselines/p04.summary.json)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-32-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-32-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-32-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-32-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-33-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-33-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-33-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-33-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-34-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-35-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-36-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-36-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-36-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-36-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-37-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-38-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-38-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-38-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-38-newton__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-legacy-cage__h4.json.gz)
- [docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-newton__h4.json.gz](snapshot/docs/research-v2/results/precision-baselines/raw/dd9de546d74b6248-b110490135ec334d/V2-CONFIRM-20261021-39-newton__h4.json.gz)

仅归档相对 [d11976e](https://github.com/BillOu0104/2/commit/d11976ecbe09c8d658f9a64bc7cd137e3ea015a5) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

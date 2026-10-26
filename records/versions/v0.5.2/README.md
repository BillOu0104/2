# v0.5.2 — 牛顿引力修复与研究候选初始化

修复近距异常引力，保留Yoshida并加入近遇自适应、守恒和接触诊断；默认随机非层级三星Q=1、0.12D逆向宿主轨道与质量反冲。128个新匹配种子三组对照、细步长复算、一万年扩展及独立DOP853验证；完整保存原始数据，不掩盖长期存活失败。

原始提交：[a219cf9](https://github.com/BillOu0104/2/commit/a219cf9bad9b50da639cc1c4f42af65f2bc19721)；提交时间：2026-10-21T09:53:53Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SETTINGS-GUIDE-v0.5.md](snapshot/docs/SETTINGS-GUIDE-v0.5.md)
- [docs/settings-guide.html](snapshot/docs/settings-guide.html)
- [docs/v052/ACCEPTANCE.md](snapshot/docs/v052/ACCEPTANCE.md)
- [docs/v052/RESEARCH_FINAL_REPORT.md](snapshot/docs/v052/RESEARCH_FINAL_REPORT.md)
## 测试结果、截图与实验数据

- [docs/v052/results/acceptance.jsonl](snapshot/docs/v052/results/acceptance.jsonl)
- [docs/v052/results/acceptance.jsonl.manifest.json](snapshot/docs/v052/results/acceptance.jsonl.manifest.json)
- [docs/v052/results/browser-desktop.png](snapshot/docs/v052/results/browser-desktop.png)
- [docs/v052/results/browser.json](snapshot/docs/v052/results/browser.json)
- [docs/v052/results/build.txt](snapshot/docs/v052/results/build.txt)
- [docs/v052/results/convergence.jsonl](snapshot/docs/v052/results/convergence.jsonl)
- [docs/v052/results/convergence.jsonl.manifest.json](snapshot/docs/v052/results/convergence.jsonl.manifest.json)
- [docs/v052/results/independent-validation.json](snapshot/docs/v052/results/independent-validation.json)
- [docs/v052/results/long.jsonl](snapshot/docs/v052/results/long.jsonl)
- [docs/v052/results/long.jsonl.manifest.json](snapshot/docs/v052/results/long.jsonl.manifest.json)
- [docs/v052/results/summary.json](snapshot/docs/v052/results/summary.json)
- [docs/v052/results/unit-tests.txt](snapshot/docs/v052/results/unit-tests.txt)
- [docs/v052/results/validation-samples.json](snapshot/docs/v052/results/validation-samples.json)
## 测试与实验脚本

- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v041-hotfix.test.js](snapshot/tests/v041-hotfix.test.js)
- [tests/v042.test.js](snapshot/tests/v042.test.js)
- [tests/v052-physics.test.js](snapshot/tests/v052-physics.test.js)
- [tools/generate-settings-guide.mjs](snapshot/tools/generate-settings-guide.mjs)
- [tools/v042-orbital-audit.mjs](snapshot/tools/v042-orbital-audit.mjs)
- [tools/v052/acceptance-config.json](snapshot/tools/v052/acceptance-config.json)
- [tools/v052/benchmark-engine.mjs](snapshot/tools/v052/benchmark-engine.mjs)
- [tools/v052/browser-check.mjs](snapshot/tools/v052/browser-check.mjs)
- [tools/v052/convergence-config.json](snapshot/tools/v052/convergence-config.json)
- [tools/v052/independent-validation.py](snapshot/tools/v052/independent-validation.py)
- [tools/v052/long-config.json](snapshot/tools/v052/long-config.json)
- [tools/v052/research-reference.mjs](snapshot/tools/v052/research-reference.mjs)
- [tools/v052/run-benchmark.mjs](snapshot/tools/v052/run-benchmark.mjs)
- [tools/v052/summarize.py](snapshot/tools/v052/summarize.py)
- [tools/v052/validation-samples.mjs](snapshot/tools/v052/validation-samples.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [c7a53a0](https://github.com/BillOu0104/2/commit/c7a53a01def5f9d60389ee20ec0f8bac5210ed69) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

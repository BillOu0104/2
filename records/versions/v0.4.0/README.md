# v0.4.0 — 累计运行、双排行与紧凑布局

包含此前未发布的v0.3局部修订及其专项测试：隐藏天体字母、修复适宜度、受损后重建入口、删除活动温区小字和自适应尾迹。v0.4增加时钟/日志布局、累计年份、宇宙和文明双排行、检查点保存及视角控制。v0.3局部修订未形成独立Git提交，在本目录按真实来源保存。

原始提交：[6e0f000](https://github.com/BillOu0104/2/commit/6e0f0000d3028c42a61a7a1d34288aa977b95d3d)；提交时间：2026-10-19T15:05:05Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/REFERENCE-MODEL.md](snapshot/docs/REFERENCE-MODEL.md)
- [docs/V03-LOCAL-ADJUSTMENTS.md](snapshot/docs/V03-LOCAL-ADJUSTMENTS.md)
- [docs/V04-UPDATE.md](snapshot/docs/V04-UPDATE.md)
- [docs/qa/V0.4-VALIDATION.md](snapshot/docs/qa/V0.4-VALIDATION.md)
## 测试结果、截图与实验数据

- [docs/qa/browser-report.json](snapshot/docs/qa/browser-report.json)
- [docs/qa/desktop.png](snapshot/docs/qa/desktop.png)
- [docs/qa/mobile.png](snapshot/docs/qa/mobile.png)
- [docs/qa/settings.png](snapshot/docs/qa/settings.png)
- [docs/qa/state-ui-8k-report.json](snapshot/docs/qa/state-ui-8k-report.json)
- [docs/qa/tail-render-report.json](snapshot/docs/qa/tail-render-report.json)
- [docs/qa/tails-off.png](snapshot/docs/qa/tails-off.png)
- [docs/qa/tails-on.png](snapshot/docs/qa/tails-on.png)
- [docs/qa/v03-local-calm.png](snapshot/docs/qa/v03-local-calm.png)
- [docs/qa/v03-local-complex.png](snapshot/docs/qa/v03-local-complex.png)
- [docs/qa/v03-local-report.json](snapshot/docs/qa/v03-local-report.json)
- [docs/qa/v03-local-unit-report.txt](snapshot/docs/qa/v03-local-unit-report.txt)
- [docs/qa/v04-browser-report.json](snapshot/docs/qa/v04-browser-report.json)
- [docs/qa/v04-desktop.png](snapshot/docs/qa/v04-desktop.png)
- [docs/qa/v04-mobile.png](snapshot/docs/qa/v04-mobile.png)
- [docs/qa/v04-simulation-report.txt](snapshot/docs/qa/v04-simulation-report.txt)
- [docs/qa/v3-overview.png](snapshot/docs/qa/v3-overview.png)
## 测试与实验脚本

- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v03-adjustments.test.js](snapshot/tests/v03-adjustments.test.js)
- [tests/v04.test.js](snapshot/tests/v04.test.js)
- [tools/build.mjs](snapshot/tools/build.mjs)
- [tools/state-ui-8k-check.mjs](snapshot/tools/state-ui-8k-check.mjs)
- [tools/v03-local-check.mjs](snapshot/tools/v03-local-check.mjs)
- [tools/v04-browser-check.mjs](snapshot/tools/v04-browser-check.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [f629c50](https://github.com/BillOu0104/2/commit/f629c50f5bfc2ec1f78f1caf4996dfc15f0c11a7) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

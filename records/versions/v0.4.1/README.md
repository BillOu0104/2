# v0.4.1 — 文明阶段、自定义窗口和精选日志

恢复左侧文明状态，按类别组织设置，支持五个窗口位置调整；精选稀有天象和文明里程碑，榜单使用宇宙号与文明号。改进恢复/重建条件、结构强度、转动环及默认银河视角。

原始提交：[49047ad](https://github.com/BillOu0104/2/commit/49047ad621da970afe68ada7357252f10ad1e634)；提交时间：2026-10-20T07:53:13Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/REFERENCE-MODEL.md](snapshot/docs/REFERENCE-MODEL.md)
- [docs/V041-UPDATE.md](snapshot/docs/V041-UPDATE.md)
## 测试结果、截图与实验数据

- [docs/qa/browser-report.json](snapshot/docs/qa/browser-report.json)
- [docs/qa/desktop.png](snapshot/docs/qa/desktop.png)
- [docs/qa/mobile.png](snapshot/docs/qa/mobile.png)
- [docs/qa/settings.png](snapshot/docs/qa/settings.png)
- [docs/qa/state-ui-8k-report.json](snapshot/docs/qa/state-ui-8k-report.json)
- [docs/qa/tail-render-report.json](snapshot/docs/qa/tail-render-report.json)
- [docs/qa/tails-off.png](snapshot/docs/qa/tails-off.png)
- [docs/qa/tails-on.png](snapshot/docs/qa/tails-on.png)
- [docs/qa/v041-browser-report.json](snapshot/docs/qa/v041-browser-report.json)
- [docs/qa/v041-desktop.png](snapshot/docs/qa/v041-desktop.png)
- [docs/qa/v041-galaxy-default.png](snapshot/docs/qa/v041-galaxy-default.png)
- [docs/qa/v041-mobile.png](snapshot/docs/qa/v041-mobile.png)
- [docs/qa/v041-simulation-report.txt](snapshot/docs/qa/v041-simulation-report.txt)
- [docs/qa/v3-overview.png](snapshot/docs/qa/v3-overview.png)
## 测试与实验脚本

- [tests/habitability.test.js](snapshot/tests/habitability.test.js)
- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v03-adjustments.test.js](snapshot/tests/v03-adjustments.test.js)
- [tests/v04.test.js](snapshot/tests/v04.test.js)
- [tests/v041.test.js](snapshot/tests/v041.test.js)
- [tools/browser-smoke.mjs](snapshot/tools/browser-smoke.mjs)
- [tools/build.mjs](snapshot/tools/build.mjs)
- [tools/state-ui-8k-check.mjs](snapshot/tools/state-ui-8k-check.mjs)
- [tools/v041-browser-check.mjs](snapshot/tools/v041-browser-check.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [6e0f000](https://github.com/BillOu0104/2/commit/6e0f0000d3028c42a61a7a1d34288aa977b95d3d) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

# v0.4.1-hotfix — 悬停视角、缓慢归位与束缚初值

同版本修复：恢复不点击的悬停旋转，进一步降低灵敏度，旋转环缩至0.3倍；停止输入后极慢回归银河。实验性束缚初始化提高恒纪元和发展时间，并保留逐种子轨道对照和鼠标专项报告。后续v0.4.2恢复混沌，不把本版规则轨道视为最终方案。

原始提交：[7fe7fed](https://github.com/BillOu0104/2/commit/7fe7fed36881c9eecbac2149a47bb57fb40e00e1)；提交时间：2026-10-20T08:48:31Z。

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
- [docs/qa/v041-hotfix-browser.json](snapshot/docs/qa/v041-hotfix-browser.json)
- [docs/qa/v041-hotfix-desktop.png](snapshot/docs/qa/v041-hotfix-desktop.png)
- [docs/qa/v041-hotfix-orbits.json](snapshot/docs/qa/v041-hotfix-orbits.json)
- [docs/qa/v041-hotfix-simulation.txt](snapshot/docs/qa/v041-hotfix-simulation.txt)
- [docs/qa/v041-mobile.png](snapshot/docs/qa/v041-mobile.png)
- [docs/qa/v3-overview.png](snapshot/docs/qa/v3-overview.png)
## 测试与实验脚本

- [tests/habitability.test.js](snapshot/tests/habitability.test.js)
- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v04.test.js](snapshot/tests/v04.test.js)
- [tests/v041-hotfix.test.js](snapshot/tests/v041-hotfix.test.js)
- [tests/v041.test.js](snapshot/tests/v041.test.js)
- [tools/build.mjs](snapshot/tools/build.mjs)
- [tools/orbital-audit.mjs](snapshot/tools/orbital-audit.mjs)
- [tools/state-ui-8k-check.mjs](snapshot/tools/state-ui-8k-check.mjs)
- [tools/v041-hotfix-browser.mjs](snapshot/tools/v041-hotfix-browser.mjs)

仅归档相对 [49047ad](https://github.com/BillOu0104/2/commit/49047ad621da970afe68ada7357252f10ad1e634) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

# v0.4.2 — 恢复混沌、可调灵敏度与前景粒子

恢复更大尺度的不规则三维随机系统；灵敏度可调，旋转环透明度和淡入淡出可调，恢复两层粒子。保留匹配种子远抛/恒纪元统计、微扰敏感性和实际粒子像素检查。

原始提交：[5bae340](https://github.com/BillOu0104/2/commit/5bae3406c53b6b45b5811ad59bca824d9ff85ce1)；提交时间：2026-10-20T09:42:02Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/REFERENCE-MODEL.md](snapshot/docs/REFERENCE-MODEL.md)
- [docs/V042-UPDATE.md](snapshot/docs/V042-UPDATE.md)
## 测试结果、截图与实验数据

- [docs/qa/browser-report.json](snapshot/docs/qa/browser-report.json)
- [docs/qa/desktop.png](snapshot/docs/qa/desktop.png)
- [docs/qa/mobile.png](snapshot/docs/qa/mobile.png)
- [docs/qa/settings.png](snapshot/docs/qa/settings.png)
- [docs/qa/state-ui-8k-report.json](snapshot/docs/qa/state-ui-8k-report.json)
- [docs/qa/tail-render-report.json](snapshot/docs/qa/tail-render-report.json)
- [docs/qa/tails-off.png](snapshot/docs/qa/tails-off.png)
- [docs/qa/tails-on.png](snapshot/docs/qa/tails-on.png)
- [docs/qa/v042-background-particles.png](snapshot/docs/qa/v042-background-particles.png)
- [docs/qa/v042-browser.json](snapshot/docs/qa/v042-browser.json)
- [docs/qa/v042-desktop.png](snapshot/docs/qa/v042-desktop.png)
- [docs/qa/v042-foreground.png](snapshot/docs/qa/v042-foreground.png)
- [docs/qa/v042-orbits.json](snapshot/docs/qa/v042-orbits.json)
- [docs/qa/v042-particles-off.png](snapshot/docs/qa/v042-particles-off.png)
- [docs/qa/v042-simulation.txt](snapshot/docs/qa/v042-simulation.txt)
- [docs/qa/v3-overview.png](snapshot/docs/qa/v3-overview.png)
## 测试与实验脚本

- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v041-hotfix.test.js](snapshot/tests/v041-hotfix.test.js)
- [tests/v042.test.js](snapshot/tests/v042.test.js)
- [tools/browser-smoke.mjs](snapshot/tools/browser-smoke.mjs)
- [tools/orbital-audit.mjs](snapshot/tools/orbital-audit.mjs)
- [tools/state-ui-8k-check.mjs](snapshot/tools/state-ui-8k-check.mjs)
- [tools/v041-browser-check.mjs](snapshot/tools/v041-browser-check.mjs)
- [tools/v042-browser-check.mjs](snapshot/tools/v042-browser-check.mjs)
- [tools/v042-orbital-audit.mjs](snapshot/tools/v042-orbital-audit.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [7fe7fed](https://github.com/BillOu0104/2/commit/7fe7fed36881c9eecbac2149a47bb57fb40e00e1) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

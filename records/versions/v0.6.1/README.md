# v0.6.1 — 快捷设置、悬停说明与同行滑条数值

保留220项设置及旧值，将17项常用设置集中到快捷页，其余203项分七类；圆形感叹号替代常驻小字，滑条与无边框数字同行且自适应宽度。152项自动化与8组真实浏览器流程通过，三种视口无横向溢出；物理/文明/Renderer等36个核心文件及场景样式前缀未改。原始失败与修复记录保留；独立分支验收，不自动合并main。

原始提交：[18c450c](https://github.com/BillOu0104/2/commit/18c450cad5bd07c2cce2ca37622552c799c386af)；提交时间：2026-10-27T12:40:09Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SETTINGS-GUIDE-v0.5.md](snapshot/docs/SETTINGS-GUIDE-v0.5.md)
- [docs/releases/v0.6.1/RELEASE.md](snapshot/docs/releases/v0.6.1/RELEASE.md)
- [docs/releases/v0.6.1/TEST_RESULTS.md](snapshot/docs/releases/v0.6.1/TEST_RESULTS.md)
- [docs/settings-guide.html](snapshot/docs/settings-guide.html)
## 测试结果、截图与实验数据

- [docs/releases/v0.6.1/results/browser-final.log](snapshot/docs/releases/v0.6.1/results/browser-final.log)
- [docs/releases/v0.6.1/results/browser-final/browser.json](snapshot/docs/releases/v0.6.1/results/browser-final/browser.json)
- [docs/releases/v0.6.1/results/browser-r1.log](snapshot/docs/releases/v0.6.1/results/browser-r1.log)
- [docs/releases/v0.6.1/results/browser-r1/browser.json](snapshot/docs/releases/v0.6.1/results/browser-r1/browser.json)
- [docs/releases/v0.6.1/results/browser-r1/desktop-quick.png](snapshot/docs/releases/v0.6.1/results/browser-r1/desktop-quick.png)
- [docs/releases/v0.6.1/results/browser-r3.log](snapshot/docs/releases/v0.6.1/results/browser-r3.log)
- [docs/releases/v0.6.1/results/browser-r3/failure.json](snapshot/docs/releases/v0.6.1/results/browser-r3/failure.json)
- [docs/releases/v0.6.1/results/browser-r3/failure.png](snapshot/docs/releases/v0.6.1/results/browser-r3/failure.png)
- [docs/releases/v0.6.1/results/browser-r4.log](snapshot/docs/releases/v0.6.1/results/browser-r4.log)
- [docs/releases/v0.6.1/results/browser-r4/browser.json](snapshot/docs/releases/v0.6.1/results/browser-r4/browser.json)
- [docs/releases/v0.6.1/results/browser-r4/desktop-categories.png](snapshot/docs/releases/v0.6.1/results/browser-r4/desktop-categories.png)
- [docs/releases/v0.6.1/results/browser-r4/desktop-quick.png](snapshot/docs/releases/v0.6.1/results/browser-r4/desktop-quick.png)
- [docs/releases/v0.6.1/results/browser-r4/desktop-tooltip.png](snapshot/docs/releases/v0.6.1/results/browser-r4/desktop-tooltip.png)
- [docs/releases/v0.6.1/results/browser-r4/mobile-quick.png](snapshot/docs/releases/v0.6.1/results/browser-r4/mobile-quick.png)
- [docs/releases/v0.6.1/results/build-final.log](snapshot/docs/releases/v0.6.1/results/build-final.log)
- [docs/releases/v0.6.1/results/build-first.log](snapshot/docs/releases/v0.6.1/results/build-first.log)
- [docs/releases/v0.6.1/results/build-package.log](snapshot/docs/releases/v0.6.1/results/build-package.log)
- [docs/releases/v0.6.1/results/build-r1.log](snapshot/docs/releases/v0.6.1/results/build-r1.log)
- [docs/releases/v0.6.1/results/build-r3.log](snapshot/docs/releases/v0.6.1/results/build-r3.log)
- [docs/releases/v0.6.1/results/build-r4.log](snapshot/docs/releases/v0.6.1/results/build-r4.log)
- [docs/releases/v0.6.1/results/environment.log](snapshot/docs/releases/v0.6.1/results/environment.log)
- [docs/releases/v0.6.1/results/image-inventory.json](snapshot/docs/releases/v0.6.1/results/image-inventory.json)
- [docs/releases/v0.6.1/results/source-parity.json](snapshot/docs/releases/v0.6.1/results/source-parity.json)
- [docs/releases/v0.6.1/results/tests-before-new-catalog-checks.log](snapshot/docs/releases/v0.6.1/results/tests-before-new-catalog-checks.log)
- [docs/releases/v0.6.1/results/tests-final.log](snapshot/docs/releases/v0.6.1/results/tests-final.log)
## 测试与实验脚本

- [tests/v061-settings.test.js](snapshot/tests/v061-settings.test.js)
- [tools/generate-settings-guide.mjs](snapshot/tools/generate-settings-guide.mjs)
- [tools/v061/settings-browser.mjs](snapshot/tools/v061/settings-browser.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [a7e1744](https://github.com/BillOu0104/2/commit/a7e1744172b835eacecd3d3b8201c62f1eb019aa) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

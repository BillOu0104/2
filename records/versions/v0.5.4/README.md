# v0.5.4 — v0.5.4：松手回弹、完全重置与逃逸重建

修复拖动后悬停弹簧反拉及长按松手立即归位；默认银河归位0.006°/秒。新增清空本地宇宙/文明档案与排行榜的完全重置，以及不改变轨道的保守逃逸确认重建。117项回归与11项浏览器检查通过，8个预定Seed各200年与v0.5.3物理及守恒诊断完全一致；保留初次失败证据和有限时间逃逸判断的限制。

原始提交：[de49389](https://github.com/BillOu0104/2/commit/de493891629800b8b70614f11915847a6594da9d)；提交时间：2026-10-21T11:55:51Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SETTINGS-GUIDE-v0.5.md](snapshot/docs/SETTINGS-GUIDE-v0.5.md)
- [docs/settings-guide.html](snapshot/docs/settings-guide.html)
- [docs/v054/RELEASE.md](snapshot/docs/v054/RELEASE.md)
## 测试结果、截图与实验数据

- [docs/v054/results/browser.json](snapshot/docs/v054/results/browser.json)
- [docs/v054/results/browser.log](snapshot/docs/v054/results/browser.log)
- [docs/v054/results/build.log](snapshot/docs/v054/results/build.log)
- [docs/v054/results/environment.json](snapshot/docs/v054/results/environment.json)
- [docs/v054/results/npm-test.log](snapshot/docs/v054/results/npm-test.log)
- [docs/v054/results/old-default-expectations-initial.log](snapshot/docs/v054/results/old-default-expectations-initial.log)
- [docs/v054/results/physical-parity.json](snapshot/docs/v054/results/physical-parity.json)
- [docs/v054/results/physical-parity.log](snapshot/docs/v054/results/physical-parity.log)
- [docs/v054/results/reset-history.png](snapshot/docs/v054/results/reset-history.png)
- [docs/v054/results/unit-tests-initial.log](snapshot/docs/v054/results/unit-tests-initial.log)
- [docs/v054/results/unit-tests.log](snapshot/docs/v054/results/unit-tests.log)
## 测试与实验脚本

- [tests/habitability.test.js](snapshot/tests/habitability.test.js)
- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v041-hotfix.test.js](snapshot/tests/v041-hotfix.test.js)
- [tests/v041.test.js](snapshot/tests/v041.test.js)
- [tests/v053.test.js](snapshot/tests/v053.test.js)
- [tests/v054.test.js](snapshot/tests/v054.test.js)
- [tools/generate-settings-guide.mjs](snapshot/tools/generate-settings-guide.mjs)
- [tools/v054/browser-check.mjs](snapshot/tools/v054/browser-check.mjs)
- [tools/v054/physical-parity.mjs](snapshot/tools/v054/physical-parity.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [23a5d20](https://github.com/BillOu0104/2/commit/23a5d209b1f53e61b2843754eba5ddfbc04b4047) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

# v0.5.3 — 显示居中、慢速银河归位与十二阶段科技

按用户澄清，天体离开画面是显示跟随问题。新增仅渲染的星群居中，保持v0.5.2牛顿物理逐位一致；修复银河归位与惯性竞争，默认0.003°/秒；科技从旧石器起扩展为十二阶段，200至40000安全生产年推进。保存108项测试、7项真实浏览器检查和8个匹配Seed各200年的旧版物理对照。

原始提交：[292d21d](https://github.com/BillOu0104/2/commit/292d21d93e90ae212a41f828ea454337582dbf2b)；提交时间：2026-10-21T11:22:59Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SETTINGS-GUIDE-v0.5.md](snapshot/docs/SETTINGS-GUIDE-v0.5.md)
- [docs/settings-guide.html](snapshot/docs/settings-guide.html)
- [docs/v053/RELEASE.md](snapshot/docs/v053/RELEASE.md)
## 测试结果、截图与实验数据

- [docs/v053/results/browser.json](snapshot/docs/v053/results/browser.json)
- [docs/v053/results/build.txt](snapshot/docs/v053/results/build.txt)
- [docs/v053/results/centered-runaway-planet.png](snapshot/docs/v053/results/centered-runaway-planet.png)
- [docs/v053/results/desktop.png](snapshot/docs/v053/results/desktop.png)
- [docs/v053/results/npm-test.txt](snapshot/docs/v053/results/npm-test.txt)
- [docs/v053/results/physical-parity.json](snapshot/docs/v053/results/physical-parity.json)
- [docs/v053/results/unit-tests.txt](snapshot/docs/v053/results/unit-tests.txt)
## 测试与实验脚本

- [tests/habitability.test.js](snapshot/tests/habitability.test.js)
- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tests/v041-hotfix.test.js](snapshot/tests/v041-hotfix.test.js)
- [tests/v041.test.js](snapshot/tests/v041.test.js)
- [tests/v05.test.js](snapshot/tests/v05.test.js)
- [tests/v053.test.js](snapshot/tests/v053.test.js)
- [tools/generate-settings-guide.mjs](snapshot/tools/generate-settings-guide.mjs)
- [tools/v053/browser-check.mjs](snapshot/tools/v053/browser-check.mjs)
- [tools/v053/physical-parity.mjs](snapshot/tools/v053/physical-parity.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [c86dec1](https://github.com/BillOu0104/2/commit/c86dec104f9ca77f5e175d820f55745478ad41f9) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

# v0.5.5 — v0.5.5：固定观察原点、守恒核查与连续尾迹

移除星群跟随与当前质心逐帧重定位，保留方向操作；补充惯性系能量及质心位置/速度诊断。连续共顶点尾迹、实际接受积分步采样和统一插值减少接头亮珠及高速分段。124项回归、7项浏览器检查通过；4个预定Seed各1000年，修订前后独立守恒指标及最终物理状态相同，未复现整体质心明显漂移。保留全部初次验证日志与模型限制。

原始提交：[e62d7e8](https://github.com/BillOu0104/2/commit/e62d7e8761c1b318de23d600e121bee41907c0e2)；提交时间：2026-10-21T12:45:22Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SETTINGS-GUIDE-v0.5.md](snapshot/docs/SETTINGS-GUIDE-v0.5.md)
- [docs/settings-guide.html](snapshot/docs/settings-guide.html)
- [docs/v055/RELEASE.md](snapshot/docs/v055/RELEASE.md)
## 测试结果、截图与实验数据

- [docs/v055/results/browser-failure-first.json](snapshot/docs/v055/results/browser-failure-first.json)
- [docs/v055/results/browser-failure-fourth.json](snapshot/docs/v055/results/browser-failure-fourth.json)
- [docs/v055/results/browser-failure-third.json](snapshot/docs/v055/results/browser-failure-third.json)
- [docs/v055/results/browser-failure.json](snapshot/docs/v055/results/browser-failure.json)
- [docs/v055/results/browser-first.log](snapshot/docs/v055/results/browser-first.log)
- [docs/v055/results/browser-fourth.log](snapshot/docs/v055/results/browser-fourth.log)
- [docs/v055/results/browser-second.log](snapshot/docs/v055/results/browser-second.log)
- [docs/v055/results/browser-third.log](snapshot/docs/v055/results/browser-third.log)
- [docs/v055/results/browser.json](snapshot/docs/v055/results/browser.json)
- [docs/v055/results/browser.log](snapshot/docs/v055/results/browser.log)
- [docs/v055/results/build-first.log](snapshot/docs/v055/results/build-first.log)
- [docs/v055/results/build.log](snapshot/docs/v055/results/build.log)
- [docs/v055/results/conservation-after.json](snapshot/docs/v055/results/conservation-after.json)
- [docs/v055/results/conservation-after.log](snapshot/docs/v055/results/conservation-after.log)
- [docs/v055/results/conservation-before.json](snapshot/docs/v055/results/conservation-before.json)
- [docs/v055/results/conservation-before.log](snapshot/docs/v055/results/conservation-before.log)
- [docs/v055/results/conservation-comparison.json](snapshot/docs/v055/results/conservation-comparison.json)
- [docs/v055/results/environment.json](snapshot/docs/v055/results/environment.json)
- [docs/v055/results/fast-trail-metrics.json](snapshot/docs/v055/results/fast-trail-metrics.json)
- [docs/v055/results/fast-trails.png](snapshot/docs/v055/results/fast-trails.png)
- [docs/v055/results/fixed-frame-motion.json](snapshot/docs/v055/results/fixed-frame-motion.json)
- [docs/v055/results/joints-after.png](snapshot/docs/v055/results/joints-after.png)
- [docs/v055/results/joints-before.png](snapshot/docs/v055/results/joints-before.png)
- [docs/v055/results/npm-test.log](snapshot/docs/v055/results/npm-test.log)
- [docs/v055/results/unit-first.log](snapshot/docs/v055/results/unit-first.log)
- [docs/v055/results/unit-tests-final.log](snapshot/docs/v055/results/unit-tests-final.log)
- [docs/v055/results/unit-tests.log](snapshot/docs/v055/results/unit-tests.log)
## 测试与实验脚本

- [tests/v053.test.js](snapshot/tests/v053.test.js)
- [tests/v055.test.js](snapshot/tests/v055.test.js)
- [tools/generate-settings-guide.mjs](snapshot/tools/generate-settings-guide.mjs)
- [tools/v055/browser-check.mjs](snapshot/tools/v055/browser-check.mjs)
- [tools/v055/conservation-audit.mjs](snapshot/tools/v055/conservation-audit.mjs)
- [tools/v055/ribbon-fixture.mjs](snapshot/tools/v055/ribbon-fixture.mjs)

其他原始文件位于snapshot，完整清单见record.json。

仅归档相对 [472a7ee](https://github.com/BillOu0104/2/commit/472a7ee5d6af87b6aa19ec8cd23366d8742656b0) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

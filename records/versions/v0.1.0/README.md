# v0.1.0 — 原版解包、源码审计与首版移植

首次将原SceneScript四体、温度、纪元和文明事件接入Three.js与Worker；保留原设置、资源、手动初值及WE回调。归档当时的源码审计、独立轨迹基准、Node测试和浏览器报告。

原始提交：[c7f0db5](https://github.com/BillOu0104/2/commit/c7f0db5e62d141db51fde5fa5e222985bc47354e)；提交时间：2026-10-19T12:41:25Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
- [docs/SOURCE-AUDIT.md](snapshot/docs/SOURCE-AUDIT.md)
## 测试结果、截图与实验数据

- [docs/qa/browser-report.json](snapshot/docs/qa/browser-report.json)
- [docs/qa/desktop.png](snapshot/docs/qa/desktop.png)
- [docs/qa/mobile.png](snapshot/docs/qa/mobile.png)
- [docs/qa/settings.png](snapshot/docs/qa/settings.png)
- [docs/qa/simulation-report.txt](snapshot/docs/qa/simulation-report.txt)
## 测试与实验脚本

- [tests/fixtures/original-reference.json](snapshot/tests/fixtures/original-reference.json)
- [tests/simulation.test.js](snapshot/tests/simulation.test.js)
- [tools/browser-smoke.mjs](snapshot/tools/browser-smoke.mjs)
- [tools/build.mjs](snapshot/tools/build.mjs)
- [tools/extract-textures.py](snapshot/tools/extract-textures.py)
- [tools/serve.mjs](snapshot/tools/serve.mjs)

其他原始文件位于snapshot，完整清单见record.json。

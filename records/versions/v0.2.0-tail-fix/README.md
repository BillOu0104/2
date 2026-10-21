# v0.2.0-tail-fix — 尾迹GPU容量与像素验证

v0.2同版本修订：固定尾迹GPU容量，并以相同暂停画面的开关像素差验证实际绘制。不是新的v0.2.1发布。

原始提交：[46a852c](https://github.com/BillOu0104/2/commit/46a852c2adb3cff5c470b62be49c0b32864205bf)；提交时间：2026-10-19T13:09:43Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [README.md](snapshot/README.md)
## 测试结果、截图与实验数据

- [docs/qa/tail-render-report.json](snapshot/docs/qa/tail-render-report.json)
- [docs/qa/tails-off.png](snapshot/docs/qa/tails-off.png)
- [docs/qa/tails-on.png](snapshot/docs/qa/tails-on.png)
## 测试与实验脚本

- [tools/tail-render-check.mjs](snapshot/tools/tail-render-check.mjs)

仅归档相对 [a08d2a8](https://github.com/BillOu0104/2/commit/a08d2a897682eea5965f7e8b8654ea77d00a90c6) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

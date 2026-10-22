# minimal-chaos-v2-integration-kernel-r0 — V2生产运行器集成初稿与独立原生夹具

独立集成分支，可选转向/反射、h4积分、接受步前控制、P5行星生命周期和独立恒星失效；10类20年原生夹具和旧测试通过。UI、完整功能和性能仍待验证，不宣称100000年JS验证或正式替换。

原始提交：[2b043ca](https://github.com/BillOu0104/2/commit/2b043ca46b081fc987f6cdd6e77a2ad93dd08498)；提交时间：2026-10-22T19:46:40Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 修改、分析和说明

- [docs/integration-v2/STATUS.md](snapshot/docs/integration-v2/STATUS.md)
## 测试结果、截图与实验数据

- [docs/integration-v2/results/deflect-v2-capture.input.json](snapshot/docs/integration-v2/results/deflect-v2-capture.input.json)
- [docs/integration-v2/results/deflect-v2-capture.native.json](snapshot/docs/integration-v2/results/deflect-v2-capture.native.json)
- [docs/integration-v2/results/deflect-v2-deflection.input.json](snapshot/docs/integration-v2/results/deflect-v2-deflection.input.json)
- [docs/integration-v2/results/deflect-v2-deflection.native.json](snapshot/docs/integration-v2/results/deflect-v2-deflection.native.json)
- [docs/integration-v2/results/deflect-v2-natural.input.json](snapshot/docs/integration-v2/results/deflect-v2-natural.input.json)
- [docs/integration-v2/results/deflect-v2-natural.native.json](snapshot/docs/integration-v2/results/deflect-v2-natural.native.json)
- [docs/integration-v2/results/deflect-v2-planet-contact.input.json](snapshot/docs/integration-v2/results/deflect-v2-planet-contact.input.json)
- [docs/integration-v2/results/deflect-v2-planet-contact.native.json](snapshot/docs/integration-v2/results/deflect-v2-planet-contact.native.json)
- [docs/integration-v2/results/deflect-v2-reflection.input.json](snapshot/docs/integration-v2/results/deflect-v2-reflection.input.json)
- [docs/integration-v2/results/deflect-v2-reflection.native.json](snapshot/docs/integration-v2/results/deflect-v2-reflection.native.json)
- [docs/integration-v2/results/native-comparison.json](snapshot/docs/integration-v2/results/native-comparison.json)
- [docs/integration-v2/results/native-comparison.log](snapshot/docs/integration-v2/results/native-comparison.log)
- [docs/integration-v2/results/reflect-v2-capture.input.json](snapshot/docs/integration-v2/results/reflect-v2-capture.input.json)
- [docs/integration-v2/results/reflect-v2-capture.native.json](snapshot/docs/integration-v2/results/reflect-v2-capture.native.json)
- [docs/integration-v2/results/reflect-v2-deflection.input.json](snapshot/docs/integration-v2/results/reflect-v2-deflection.input.json)
- [docs/integration-v2/results/reflect-v2-deflection.native.json](snapshot/docs/integration-v2/results/reflect-v2-deflection.native.json)
- [docs/integration-v2/results/reflect-v2-natural.input.json](snapshot/docs/integration-v2/results/reflect-v2-natural.input.json)
- [docs/integration-v2/results/reflect-v2-natural.native.json](snapshot/docs/integration-v2/results/reflect-v2-natural.native.json)
- [docs/integration-v2/results/reflect-v2-planet-contact.input.json](snapshot/docs/integration-v2/results/reflect-v2-planet-contact.input.json)
- [docs/integration-v2/results/reflect-v2-planet-contact.native.json](snapshot/docs/integration-v2/results/reflect-v2-planet-contact.native.json)
- [docs/integration-v2/results/reflect-v2-reflection.input.json](snapshot/docs/integration-v2/results/reflect-v2-reflection.input.json)
- [docs/integration-v2/results/reflect-v2-reflection.native.json](snapshot/docs/integration-v2/results/reflect-v2-reflection.native.json)
- [docs/research-v2/results/integration-first-tests.log](snapshot/docs/research-v2/results/integration-first-tests.log)
## 测试与实验脚本

- [tools/validate-v2-native.mjs](snapshot/tools/validate-v2-native.mjs)

仅归档相对 [eafe2f5](https://github.com/BillOu0104/2/commit/eafe2f5f532f5d65a24ec1873d8d9724b478c627) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

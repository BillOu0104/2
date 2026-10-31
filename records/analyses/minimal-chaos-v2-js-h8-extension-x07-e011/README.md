# minimal-chaos-v2-js-h8-extension-x07-e011 — JS同初值h8数值诊断 x07-e011

剩余96确认Seed重复精度，不作新独立确认；只收已完成端点和完整原始/主影子状态，保留全部失败UNKNOWN及成本，main未改。

原始提交：[2ea0aff](https://github.com/BillOu0104/2/commit/2ea0aff88f03fc31bbc0b412cc764229ecab1497)；提交时间：2026-10-31T09:13:23Z。

这是历史文件归档，本次未重跑该版本。原始测试的环境、条件与限制以当时报告为准；没有Windows Wallpaper Engine实机证据的版本不声称已完成该宿主验收。

[源码修改差异](changes.patch) · [来源及SHA256清单](record.json) · [总目录](../../README.md)

## 测试结果、截图与实验数据

- [docs/integration-v2/results/js-precision-h8-extension-v1/archives/x07-e011.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/archives/x07-e011.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.raw.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.raw.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.state.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.state.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.raw.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.raw.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.state.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.state.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.raw.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.raw.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.state.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.state.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.raw.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.raw.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.state.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.state.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.raw.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.raw.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.state.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.state.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-88-deflect-v2-100000.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-88-reflect-v2-1000.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-deflect-v2-100000.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-reflect-v2-1000.json)
- [docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.json](snapshot/docs/integration-v2/results/js-precision-h8-extension-v1/x07/endpoints/V2-JS-CONFIRM-20261022-89-reflect-v2-10000.json)

仅归档相对 [9c0809d](https://github.com/BillOu0104/2/commit/9c0809d50e4b68b2c50b7ea1af4aad7c348743a5) 新增或修改的证据；未变的历史文件沿前一版本查阅，不代表每份继承报告均在本次重跑。

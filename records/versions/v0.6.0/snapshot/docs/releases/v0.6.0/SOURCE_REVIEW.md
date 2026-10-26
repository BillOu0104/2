# 实际源码审查与选择性迁移

本文件记录本次阅读范围和集成决策；原研究报告保留在其原分支，通过固定提交链接引用，不复制整个研究目录。

## 已阅读证据

- [JS确认结果](https://github.com/BillOu0104/2/blob/b6a4747487d7b9b11ae0dd223b6cd9cf4fe32262/docs/integration-v2/JS_CONFIRMATION_RESULTS.md)：独立Seed、失败、控制代价、P5及统计局限。
- [集成报告](https://github.com/BillOu0104/2/blob/b6a4747487d7b9b11ae0dd223b6cd9cf4fe32262/docs/integration-v2/INTEGRATION_REPORT.md)、同版 STATUS.md：真实Worker/Simulation移植和历史短窗差异。
- [h8冻结协议](https://github.com/BillOu0104/2/blob/180d9d2a01e1d0a282fa878804303b52dd45eab7/docs/integration-v2/JS_PRECISION_H8_PROTOCOL.md)及最新STATUS/端点路径：纯精度加密，尚未完成。
- 上轮 `research/newtonian-survival` 的 FINAL_REPORT.md、V2研究 SCIENTIFIC_REPORT.md、控制/初始化/积分/逃逸与研究夹具。只引用实际读到的结果，不将原生与JS不同Seed队列混为配对实验。

## 代码路径与审查结论

| 实际阅读的路径 | 核查与决定 |
|---|---|
| `physics/minimal-control.js` | capture / deflect / 极近遇reflect；质量反冲、速度模长、触发顺序、功与P/L事件。保持冻结内核一致，不引入独立反射方案。 |
| `physics/controlled-system.js` | 真实半径、控制先于选步、接受步接触、P5宿主/等待/初速、逃逸确认/吸收失效、外部预算。仅补充预算观察量和明确非法质量错误，不改算法阈值。 |
| `physics/gravity.js` | 对称牛顿作用、Yoshida负子步、自适应尺度、接受步段碰撞、预算与异常恢复。只移植必要beforeStep接口，不重写积分器。 |
| `v2-simulation.js` / `simulation.js` | Seed/手动初值、时间换算、文明和世界更新、死亡档案、事件年份、吸收状态。修复缺席、同帧死亡、模式边界和未初始化快照问题。 |
| `v2-checkpoint.js` / RNG | 完整状态、闭包共享对象、RNG恢复、非有限哨兵；保留复现工具，补充旧预算不完整标识。 |
| `simulation-worker.js` | 现有消息协议、暂停、失败/恢复、完整帧调度、轨迹采样、状态发布。播放速度与物理精度分离。 |
| `settings.js` / `seed-compatibility.js` | 原设置迁移、旧Seed显式重放、手动参数精确保留、固定h4、旧配置备份及恢复。独立反射研究配置不被静默重放为另一算法。 |
| `orbital-initialization.js` / `legacy/008.js` | 原初始化调用及牢笼预处理边界；保留默认随机Q=1、逆向0.12D和自定义逻辑，V2不叠加旧牢笼。 |
| `civilization-state.js` / `habitability.js` / `world-state.js` | 文明出生/脱水/干仓/复苏、科技年、适居/纪元/潮汐与真实死亡。文件保持v0.5.5原样，未通过改阈值获取更好统计。 |
| `orbit-trace.js` / `renderer.js` | 物理采样、行星缺席与P5断轨、恒星连续尾迹、固定镜头和原粒子。加速插值保持完整数据；可选全体COM只改显示。 |
| `main.js` / `settings-catalog.js` / `bridge.js` | 设置控件、档案/排行、通知、恢复失败、缺席和终止HUD、WE属性与暂停。原时钟、布局及交互路径继续存在。 |
| `tools/build.mjs` / package文件 | 保留Chrome90目标/离线资产/WE project；固定精度可正确显示，不新增依赖。 |
| 原研究测试/长队列/影子工具 | 只迁移维护所必需的小型回归和五个摘要夹具。长批次、原生程序和大量原始实验均留原分支。 |

可验证的SHA和基线未变化文件见 `results/source-audit.json`。本次通过运行源码、真实Worker和浏览器验证，不依据报告直接Git整分支合并。未来数值研究可继续原分支；正式产品改动不写回冻结研究内核或覆盖已有实验。

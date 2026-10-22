# V2集成原型恢复入口

状态INTEGRATION_IN_PROGRESS，尚未完成正式验收。当前/workspace/2-integration，分支integration/minimal-chaos-control-v2，基于研究checkpoint eafe2f5。/workspace/2保持独立research/minimal-chaos-control-v2和冻结native7f64a8a；main不改、不合并，不发布私有网页。

先检查双方活跃锁、native/JS验证worker和最近20分钟更新；已有活跃工作即安静跳过。不覆盖未提交源码。恢复先git status/log确认分支/版本，缺失工作区明确报告。

当前已接入：可选stabilityMode=off/deflect-v2/reflect-v2；原newproperty60在V2中开关控制，关闭后保持相同h4求解/P5以作公平对照；原生接受步选择之前的控制；真实接触/独立恒星分离与三星瓦解吸收状态；固定P5行星重生与外部预算；Simulation事件/快照/文明与纪元接入。V2固定参考时钟，不使用原版独立年倍率或时钟提速；牛顿/韧性文明/参考模式之外组合目前拒绝并提示切回现行模式。UI原型入口会自动选择这三个支持设置。主产品默认仍off，不把原型偷偷升级成正式版本。

已实测：原有13个测试文件通过（results在docs/research-v2/results/integration-first-tests.log）；tools/validate-v2-native.mjs的10类20年native夹具全部通过，最大状态差约1.4e-10，接受步数、控制计数、行星损失/重生与纪元计数一致。包含实际转向、反射、捕获和P5。完整原输入/原生输出/报告在docs/integration-v2/results/。不是新的100000年确认。

待继续：V2无控制/无自动整宇宙重置/设置和Seed/失败与恢复/事件功能测试；UI提示与不支持设置处理；浏览器实际操作/行星缺席与重生/尾迹/截图；构建和浏览器性能；必要时JS无渲染更长窗验证。不得仅凭旧测试通过宣称V2兼容。发现失败保存原日志，以新修订记录修复，不覆盖旧records。

node_modules是指向/workspace/2/node_modules的本地符号链接（不提交）；若缺失可重新链接现有依赖，不修改生产依赖。现有/usr/bin/chromium、playwright-core可用。冻结native路径/workspace/2/docs/research-v2/bin/native，SHA256 cf2117ac290bea83d6cfbdb07f98888412d594024e295887bc537bce5132f091。

参考命令（实际先核对源码和已有结果，不盲目覆盖未归档测试）：

```sh
node tools/validate-v2-native.mjs
npm test
npm run build
```

完成有意义阶段先提交实际源码/结果，tools/records.py capture新analysisID、check、提交records并推送integration/minimal-chaos-control-v2。研究分支单独保存科学数据/报告/主STATUS，不在两个工作树混用索引。所有成本/失败/UNKNOWN保留，研究最终报告与可回滚正式替换方案在充分验证后再形成，main替换等用户最终验收。

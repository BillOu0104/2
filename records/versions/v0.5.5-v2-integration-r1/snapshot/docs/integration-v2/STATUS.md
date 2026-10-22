# 当前恢复入口：JS逐级移植诊断

状态INTEGRATION_IN_PROGRESS，研究未结案；main和私有网页未修改。工作区/workspace/2-integration，分支integration/minimal-chaos-control-v2；科研数据工作区/workspace/2保持research/minimal-chaos-control-v2。先读INTEGRATION_REPORT.md、DIAGNOSTICS_PROTOCOL.md、diagnostics-v1.json及results/diagnostics-v1/manifest.json、supervise.state.json（若已生成）。

先核对两工作区supervise/native/JS worker及锁和近20分钟记录。任一活跃或近期更新，安静退出；不得编辑冻结src/驱动/配置/协议，不重复启动。若工作区不可达或分支/版本无法确认，明确阻碍，不假定恢复。

原生128独立新Seed确认100000年和同精度基准已全完成，绝不重启旧积分。JS短窗10类原生对照、15个测试文件、实际Chromium功能、完整状态/RNG恢复及批处理故障审计通过。原始失败全部保留。8条JS1000年全完整、UNKNOWN0，但7/8不满足严格原生长轨迹一致，最大恒纪元差约1.53个百分点；不是JS100000年成功证据。

当前唯一队列为冻结版4诊断Seed×两模式×1000/10000/30000，完整状态每1000年保存，可同版本继续；源码/配置/原始/状态SHA核对，结果键去重，全部事件/行星损失与重生、文明、外部功/冲量/L与UNKNOWN保留。两worker只用已有2CPU。本轮JS FTLE未测，明确GEOMETRY_ONLY，不能宣称混沌联合达成。

无活跃且记录过期后，在集成工作树按原版本恢复：

```sh
python3 tools/v2/supervise.py docs/integration-v2/diagnostics-v1.json
```

先对照manifest的sourceCommit/sourceHash/files/configHash和Git tracked实际源码；驱动会拒绝修改。若state=STOPPED_REVIEW_REQUIRED，先审阅error、worker日志、原始和检查点，再修复/作新版本，不直接改状态绕过UNKNOWN。完成键只审计不重算，DIAGNOSTICS_COMPLETE_REVIEW_REQUIRED仅表示这24个窗口结果结束，整项研究仍未完成。阶段完成驱动提交Git、records/check并尝试push；推送结果以push.log/state为准，失败不假称远端已保存。最后state/push.log可能是归档后的真实更新，下次评审一并保存。

结束后先统计实际30k结果与全部失败/差异，审查性能、部分混沌与数值限制，再决定JS条件影子和独立长期确认；不能把原生结果或短窗推算成已完成JS100000年。正式替换要完整兼容/性能/长期证据、旧版回滚及用户最终验收，当前不得覆盖或合并main。恢复检查继续。

node_modules仅链接现有/workspace/2/node_modules，冻结native参考路径/workspace/2/docs/research-v2/bin/native、SHA cf2117ac290bea83d6cfbdb07f98888412d594024e295887bc537bce5132f091。长批处理不依赖native工具，不安装依赖、不增加收费资源。不保证额度重置自动继续或环境无限持久；依靠已保存Git/状态/原始结果恢复。

---
历史初稿状态（已由上述实际测试更新，保留上下文）：

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

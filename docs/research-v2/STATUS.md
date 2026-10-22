# V2 恢复入口

状态：RESEARCH_IN_PROGRESS / NUMERICAL_REVIEW_REQUIRED。正式128新Seed主确认及32Seed预定h2辅助已全部实测完成（576/576、pending0、UNKNOWN0），最终原始/版本/初值/恢复哈希重审计通过。见CONFIRMATION_RESULTS.md和results/confirmation-v1/cohort.review.json。main未修改、未合并，私有网页未更新。

## 当前唯一恢复队列：确认后精度扩展

先检查全部活跃锁（尤其results/precision-extension.lock）、native worker和最近20分钟研究记录；任一活跃/近期更新即安静退出，不修改计算源、不重编译、不启动重复工作。当前锁/worker优先于可能过期的state字符串。没有活跃任务且记录过期后，读PRECISION_EXTENSION_PROTOCOL.md、precision-extension/study.json、results/precision-extension.manifest.json和results/precision-extension.state.json（若已生成）。

恢复命令（仓库根）：

```sh
python3 docs/research-v2/run-precision-extension.py docs/research-v2/precision-extension/study.json
```

这是确认后数值诊断，不是新独立Seed确认，也不是调参。先补跑确认Seed32..127各两候选h2，补齐全128；再跑Seed0..31各两候选h4。16批×8Seed，共256新模拟，每条真正100000年、成熟期10000年后，两worker。计算源/二进制/控制/P5/纪元及失效规则全部不变，仅提高积分精度。数据在results/precision-extension/，每批audit/verify-provenance/固定注册初值核对、保存原始及完整状态、Git/records/check及push。

预定前32默认→h2成熟恒纪元变化：转向24.25%→34.58%，反射23.69%→14.38%，配对均值差bootstrap95%未含0。能量残差小不足以证明统计收敛，暂不进入生产集成或main替换。PRECISION_COMPLETE_REVIEW_REQUIRED只表示这批数据结束，研究仍未完成。STOPPED_REVIEW_REQUIRED先看error/日志/检查点，不绕过版本、UNKNOWN或数值问题。恢复跳过完成键但重审计；checkpoint只用于相同科学源/配置，不将不同精度状态混合。推送失败单列，不把本地提交说成远端已保存。

完整主确认：转向/反射各128/128三星完整；连续参与混沌联合121/128与125/128；默认成熟恒纪元28.21%与17.60%，分布和置信区间见报告。两方案存在角动量/累计功冲量的权衡，尚无唯一支配方案。所有失败、行星重生及文明结局保留。冻结的两个辅助脚本直接传cohort会空读，原空文件保留，新review-confirmation.py从576条及原事件正确重算；主要终点audit-confirmation不受影响。

旧run-confirmation及run-series队列均已完成，不重启它们。下文“恢复当前独立确认”保留历史命令和证据，仅供复核，不是当前待执行队列。完整精度/统计评审后才考虑独立集成分支、功能/UI兼容测试；覆盖main等待用户最终验收。

## 身份和已完成证据

仓库BillOu0104/2，分支research/minimal-chaos-control-v2；main为c7a53a0，产品基准fix/v0.5.5@8a8eb34。V1根FINAL_REPORT.md及原分支/记录保留。当前阶段物理计算源为7f64a8a；其后纯结果/文档/诊断脚本提交不改变科学哈希。实际源码、配置、二进制哈希在各Shard manifest。

已完成并审计：规范medium-canonical（V2-B32种子×7方案×10000年，224条）；long30（V2-C16新种子×6方案×30000年，96条）；弱负能weak1k、weak10k、weak30k（V2-D16新种子×6方案，各96条）。负对照六例只校准混沌，不作候选样本。所有批次UNKNOWN0，失败全部保留。见INTERIM_REPORT.md、MEDIUM_RESULTS.md、LONG30_RESULTS.md、FAILURE_MECHANISMS.md、WEAK30_RESULTS.md和EXPERIMENT_LOG.md。

先读RESEARCH_PLAN.md、STRICT_PROTOCOL.md、MEDIUM_PROTOCOL.md、LONG30_PROTOCOL.md、WEAK_BINDING_PROTOCOL.md。早期baseline-v1/screen-v3/strict-screen/medium/medium-contact-v2有已披露观测差异，仅保留历史调试价值，不混作规范长窗证据。

## 已完成独立确认的历史恢复入口

先检查所有锁（尤其results/confirmation-v1.lock）、native worker及最近20分钟研究记录；有活跃工作或近期更新即安静跳过，不改计算源码、不重编译、不重复启动。没有活跃工作且记录过期后，先读：

- CONFIRMATION_PROTOCOL.md、confirmation-v1/study.json；
- results/confirmation-v1.manifest.json（冻结源码/二进制/驱动/协议/配置/初值审计哈希）；
- results/confirmation-v1.state.json（若存在）、results/confirmation-v1/cohort.endpoints.json、各批次bXX.batch.json。

RUNNING可能是旧进程退出后的状态，须实际核对锁/worker。STOPPED_REVIEW_REQUIRED先阅读error、批次audit及work/日志，不绕过数值/版本问题。CONFIRMATION_COMPLETE_REVIEW_REQUIRED只是预注册数据完成，研究仍需数值/统计/原型兼容性评审，不能自动覆盖main或直接关闭整个研究。

仓库根恢复命令：

```sh
python3 docs/research-v2/run-confirmation.py docs/research-v2/confirmation-v1/study.json
```

主组V2-CONFIRM-20261021-0..127，128个全新连续Seed，初值已实际检查128个唯一、与既往96个独特初值不重合；没有预模拟寿命、筛种或调参。四主profile：newton、legacy-cage、deflect4-trigger8、reflect-trigger8。预定前32Seed另跑两候选的__h2精度辅助组；它们不增加主组Seed数，不替换默认精度主结果。

16批×8Seed，前四批48条、后十二批32条，共576条计划结局；每条真正100000年，成熟期固定10000年后。全局master和各Shard持锁，每批只用两个CPU worker。每批审计、聚合去重、保存Git检查点和records/check、尝试推送，再进入下一批；push失败记于state和work/confirmation-bXX.push.log，不能冒称已推送。恢复自动跳过完成键、加载相同版本检查点，UNKNOWN与pending均不算物理失败或成功。

队列聚合器会验证各批配置/源码/二进制、原始SHA256、逐项native原始汇总与索引一致、保存状态/输入SHA256，以及初值与预注册128Seed表一致。每行仍保留自己的批次configHash，不混装一个伪造共同哈希。恢复后可独立运行：

```sh
python3 docs/research-v2/audit-confirmation.py docs/research-v2/confirmation-v1/study.json
python3 docs/research-v2/summarize.py docs/research-v2/results/confirmation-v1/cohort
python3 docs/research-v2/chaos-summary.py docs/research-v2/results/confirmation-v1/cohort
```

cohort.endpoints.json同时列planned/observed/pending；只有主组128与辅助32按预注册完整结束且无UNKNOWN后，才可讨论全队列确认结论。不得把未完成项加作死亡，或把局部小批称为完成128Seed。

物理计算源仍7f64a8a，原生二进制未换。脚本拒绝冻结哈希变化；若缺失二进制，确认无活跃任务后从冻结Git/编译器选项恢复且必须匹配binaryHash，不能绕过。ijson3.3.0在/tmp/codex-v2-python，若缺失独立恢复工具依赖，不改生产依赖。

此前results/series-v1.state.json为SERIES_COMPLETE_REVIEW_REQUIRED，所有四阶段均已完成并推送，不再启动旧run-series。其全部阶段证据与源码保留。详见EXPLORATION100K_RESULTS.md。

每个结果索引关联raw/<源码哈希>-<配置哈希>/完整gzip和SHA256；已存状态及对应输入也有SHA256。work/每1000年原子保存完整物理/控制/行星/文明/统计/影子状态，代码/配置隔离，不依赖聊天上下文。结束不足1000年的失败可能没有检查点，已有完整结果仍有效。恢复不重置三星时间，不混用旧medium源1a9de78或旧long30源bf7f9d2。

medium B-13曾因Node256MiB stdout缓冲ENOBUFS中断传输；原完成状态、复算一致性与重建输入均保留且明确标注。现用文件流式输出。数值中断/UNKNOWN与物理失败分开，行星/文明未观察到结局者右删失，不算死亡。

## 下一阶段及结论边界

探索V2-E三控制各16/16三星完整，但旧混沌诊断分别转向14/16、反射8和24各15/16；不能把完整等同持续混沌。成熟恒纪元分别33.77%、18.57%、21.35%，超过15%如实报告。转向绝对功更低但角动量偏移更大；反射并非零代价。正式共同预定候选为转向4触发8和反射触发8，不对确认Seed再调参。

正式既报原诊断（成熟FTLE>0.003、紧双星交换>=20、最长动力学层级<1000年），也报预先更严格的连续参与联合终点（再要求最长几何隔离<=5000年、成熟非层级>=10%）。阈值是可复现诊断，不是数学定理；全部分布、失败/UNKNOWN、行星/文明、控制代价必须保留。各候选A及较严格联合率提供Wilson95%和四比例Bonferroni调整Clopper–Pearson区间；B的三种分母与Seed bootstrap区间分开报告。

减半dt/eta的探索仍有成熟恒纪元均值约6–8个百分点变化，不能仅凭能量残差小宣称统计收敛。正式32Seed精细辅助组继续评估；未通过数值/统计审查时不进入正式替换。主确认完整、数值/性能与现有功能/UI兼容性充分后，才在集成分支整合。main替换必须保存回滚版本并等待用户最终验收。

每阶段提交Git检查点，用tools/records.py capture新增归档、check校验，再提交记录并推送研究分支，保留所有失败/UNKNOWN。现有按小时恢复检查已实际验证可访问工作区；不保证工作区永久保留、额度自动重置或无限后台运行。资源为2CPU、8GiB，当前磁盘余量约28GiB。无新付费资源。

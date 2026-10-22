# V2 恢复入口

状态：RESEARCH_IN_PROGRESS / NUMERICAL_REVIEW_REQUIRED。正式128新Seed主确认及32Seed预定h2辅助已全部实测完成（576/576、pending0、UNKNOWN0），最终原始/版本/初值/恢复哈希重审计通过。见CONFIRMATION_RESULTS.md和results/confirmation-v1/cohort.review.json。main未修改、未合并，私有网页未更新。

## 当前阶段：独立集成原型，尚未通过正式替换验收

h4同精度基准16批256条已全部完成并重审计，原始/index逐字段、源码/配置/注册初值/输入/已存状态SHA通过，UNKNOWN0；总1280不同结果键。基准h4牛顿4/128完整、旧牢笼3/128，混沌联合0/128与1/128；候选各128/128完整、联合122/128与126/128。见MATCHED_BASELINES_RESULTS.md。旧全部批处理均完成，不再启动积分。

研究仍未完成。当前工作在独立工作区/workspace/2-integration、分支integration/minimal-chaos-control-v2；/workspace/2仍必须保持research/minimal-chaos-control-v2，冻结科学计算源7f64a8a与所有历史数据不修改。集成基于完整研究数据checkpoint eafe2f5，main未改、未合并，网页未发布。实际源码修改/测试状态以集成工作区Git和docs/integration-v2/STATUS.md为准，不能把研究原生100000年成绩当作JS移植已验证。

恢复检查先检查两个工作区的活跃supervise锁/native/JS验证worker和最近20分钟记录；活跃或近期更新即安静退出，不启动重复工作、不编辑计算源码。没有活跃且记录过期后，先读取集成STATUS、git branch/status/log，确认工作区可访问且分支正确；若不可访问或版本无法确认，明确报告阻碍，不根据聊天假设可恢复。

当前已接入接受步前控制/P5/独立失效和Simulation快照的初稿，短窗10类独立native夹具通过（含转向、反射、弱束缚捕获、行星吞噬/重生）；这是移植检查，不是新的100000年确认。现行模式原有13个测试文件通过。待完成更完整的关闭控制/无整宇宙自动重置/功能与事件测试、Seed与设置兼容、浏览器UI/性能检查、源码及失败记录归档。遇到失败先保留原始日志，再修复并用新检查点记录，不伪称兼容已完成。

集成工作区恢复入口（先读STATUS，不盲目覆盖未提交源码）：

```sh
git -C /workspace/2-integration status --short --branch
cat /workspace/2-integration/docs/integration-v2/STATUS.md
```

依集成STATUS继续具体测试、修复和原型验证，不更改main。每阶段分别在研究/集成分支保存实际源码/数据提交、tools/records.py capture新ID、check、归档提交并推送对应分支；不能混用两个工作区索引或宣称未成功的push已保存。正式替换仍须完整集成/数值/性能/功能/UI证据、可回滚版本及用户最终验收。当前继续研究，不关闭恢复检查。

## 已完成同精度基准的历史恢复入口

h4剩余192条已全完成并重审计，UNKNOWN0；新增原始native汇总/index逐项一致，科学源/配置/注册初值/输入/状态哈希通过。候选default/h2/h4各128Seed、真正100000年；全部1024结果键唯一。见H4_RESULTS.md及results/precision-h4/h4-review.json。

先检查所有活跃锁（尤其results/precision-baselines.lock）、native worker及研究记录最近20分钟更新时间；任一活跃或近期更新即安静退出，不编辑计算源、不重编译、不重复启动。没有活跃且记录过期后，读MATCHED_BASELINES_PROTOCOL.md、precision-baselines/study.json、results/precision-baselines.manifest.json及state（若存在），恢复：

```sh
python3 docs/research-v2/run-matched-baselines.py docs/research-v2/precision-baselines/study.json
```

固定原确认128个初值，无控制newton__h4与原牢笼legacy-cage__h4，最大步长.0001875、eta.001875，与h4候选完全同精度；16批×8Seed×2=256计划结局。每条运行100000显示年或真实恒星失败；提前失败不算完整长窗。P5/真实半径/独立失效/纪元/文明/条件影子均不改，科学源仍7f64a8a、原二进制。只用已有两个CPU和两worker。不同批次原始/状态使用科学源/配置哈希目录；完成键去重、原版本恢复、每批audit/provenance/注册初值验证、全部失败/UNKNOWN与行星文明/预算保留、Git/records/check/push，推送异常单独记录。

BASELINES_COMPLETE_REVIEW_REQUIRED只代表这一数据队列结束，整个研究未完成。STOPPED_REVIEW_REQUIRED先读error/日志/原始/检查点，不能绕过UNKNOWN、版本或初值问题。旧confirmation、series、precision-extension、precision-h4均已完成，不重复积分。新manifest同时冻结此前确认/h4/精度spec与新驱动/协议/配置及本次h4分析哈希。

h4候选均128/128三星完整，混沌联合转向122/128、反射126/128；成熟恒纪元30.91%和15.26%。转向h4-h2成熟均值差−5.53个百分点、配对bootstrap95%约[−11.54,+0.39]，反射−1.26、约[−4.61,+2.12]；不能把区间含0解释为等价，转向精确恒纪元估计仍未证明收敛。累计功/L漂移权衡与原行星损失详见H4_RESULTS，所有不足Seed保留。

下一步将h4候选与h4两基准公平比较，避免把精度收益当作控制收益。之后才进入独立集成分支实现完整生产原型和数值/功能/UI/性能回归；旧研究JS原型近遇控制位于step内部，而原生在选自适应步长之前，移植必须匹配原生次序并验证触发事件，不冒称旧短窗对照已证明生产一致。main和私有网页未修改，正式替换依然等待用户最终验收。恢复检查保持开启。

## 已完成h4补齐的历史恢复入口

2026-10-22：precision-extension已256/256完成、UNKNOWN0，全部16批重新按恢复命令审计，额外256份原始native汇总/index逐字段一致；确认与扩展合计832个不同Seed/profile结果键。见PRECISION_EXTENSION_RESULTS.md和results/precision-extension/precision-review.json。旧confirmation/series/precision-extension均已完成，不重启积分。

先检查全部活跃锁（尤其results/precision-h4.lock）、native worker及最近20分钟研究记录；任一活跃或近期更新即安静退出，不修改计算源、不重编译、不重复启动。没有活跃任务且记录过期后，读H4_EXTENSION_PROTOCOL.md、precision-h4/study.json、results/precision-h4.manifest.json及results/precision-h4.state.json（若存在），恢复命令：

```sh
python3 docs/research-v2/run-h4-extension.py docs/research-v2/precision-h4/study.json
```

固定确认Seed32..127，两候选完全相同参数的h4（dt=.0001875、eta=.001875），12批×8Seed×2=192条新模拟，每条真正100000年、成熟期10000年后、至少2.4亿名义步。加入先前前32个h4，最终为同一128个初值的default/h2/h4比较。不是新独立Seed确认、不改变原成绩、不调控制参数；计算源/二进制仍7f64a8a及原哈希。两worker只用已有2CPU。新manifest冻结原确认与精度spec、新驱动/配置/协议和本次数值分析哈希，拒绝版本混合。

数据results/precision-h4/按科学源/配置哈希隔离，完整状态检查点每1000年保存于work/并可同版本恢复。每批原始/源码/配置/输入/状态/注册初值审计、UNKNOWN和行星/文明/控制预算保留，完成键跳过且复审；Git checkpoint、records/check和push。push失败独立记录，不把本地说成远端。H4_COMPLETE_REVIEW_REQUIRED只是这一队列完成，整个研究仍未完成。STOPPED_REVIEW_REQUIRED先看error/日志/审计，不能绕过数值或版本错误。

完整h2两候选各128/128三星完整，联合转向121、反射126；成熟均值36.44%和16.52%。default到h2的128配对成熟均值差转向+8.23个百分点、bootstrap95%约[+2.37,+14.08]；反射−1.08、约[−4.98,+2.82]。h4前32成熟25.42%和17.47%、联合31/32和32/32，样本小且恒纪元区间很宽。不能把不显著当等价，不能从低能量残差宣称统计收敛。继续评审后才决定是否可进入独立生产集成分支；main最终替换等待用户验收，私有网页未改。不得把h4复测变成128新Seed主确认。

## 已完成精度扩展的历史恢复入口

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

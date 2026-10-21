# V2 恢复入口

状态：RESEARCH_IN_PROGRESS。弱负能反馈V2-D的30000年批次正在运行，两Shard各持锁。研究未完成；尚无正式100000年结果。main未修改、未合并，私有网页未更新。

## 身份和已完成证据

仓库BillOu0104/2，分支research/minimal-chaos-control-v2；main为c7a53a0，产品基准fix/v0.5.5@8a8eb34。V1根FINAL_REPORT.md及原分支/记录保留。当前阶段物理计算源为7f64a8a；其后纯结果/文档/诊断脚本提交不改变科学哈希。实际源码、配置、二进制哈希在各Shard manifest。

已完成并审计：规范medium-canonical（V2-B32种子×7方案×10000年，224条）；long30（V2-C16新种子×6方案×30000年，96条）；弱负能weak1k、weak10k（V2-D16新种子×6方案，各96条）。负对照六例只校准混沌，不作候选样本。所有批次UNKNOWN0，失败全部保留。见INTERIM_REPORT.md、MEDIUM_RESULTS.md、LONG30_RESULTS.md、FAILURE_MECHANISMS.md和EXPERIMENT_LOG.md。

先读RESEARCH_PLAN.md、STRICT_PROTOCOL.md、MEDIUM_PROTOCOL.md、LONG30_PROTOCOL.md、WEAK_BINDING_PROTOCOL.md。早期baseline-v1/screen-v3/strict-screen/medium/medium-contact-v2有已披露观测差异，仅保留历史调试价值，不混作规范长窗证据。

## 恢复当前批次

先检查锁、native worker和最近20分钟研究记录；有活跃工作即跳过，不重编译、不改计算源码、不重复启动。没有活跃工作且记录过期时，在仓库根运行：

```sh
git status --short --branch
python3 docs/research-v2/run-stream.py docs/research-v2/weak30k.json 0 2
python3 docs/research-v2/run-stream.py docs/research-v2/weak30k.json 1 2
```

两Shard在两个终端并发，最多2个CPU worker。持锁时同Shard自动跳过，已有完整键不重复。manifest拒绝源码/配置/二进制哈希改变。若二进制缺失，先核实无活跃worker，按build-native.sh与冻结Git源码、编译器及选项恢复，必须匹配旧binaryHash；不能强行绕过版本检查。工具依赖ijson3.3.0位于/tmp/codex-v2-python，若丢失独立重装，不修改生产依赖。

全部96条结束后：

```sh
python3 docs/research-v2/audit.py docs/research-v2/weak30k.json
python3 docs/research-v2/verify-provenance.py docs/research-v2/weak30k.json --source-ref 7f64a8a
python3 docs/research-v2/summarize.py docs/research-v2/results/weak30k
python3 docs/research-v2/chaos-summary.py docs/research-v2/results/weak30k
python3 docs/research-v2/intervention-analysis.py docs/research-v2/results/weak30k
```

每个结果索引关联raw/<源码哈希>-<配置哈希>/完整gzip和SHA256；已存状态及对应输入也有SHA256。work/每1000年原子保存完整物理/控制/行星/文明/统计/影子状态，代码/配置隔离，不依赖聊天上下文。结束不足1000年的失败可能没有检查点，已有完整结果仍有效。恢复不重置三星时间，不混用旧medium源1a9de78或旧long30源bf7f9d2。

medium B-13曾因Node256MiB stdout缓冲ENOBUFS中断传输；原完成状态、复算一致性与重建输入均保留且明确标注。现用文件流式输出。数值中断/UNKNOWN与物理失败分开，行星/文明未观察到结局者右删失，不算死亡。

## 下一阶段

根据成熟混沌、远游、恒纪元、干预成本、角动量和行星代价比较V2-D全部分布，不只看完整率。10000年没有成熟窗口，不能替代成熟FTLE。负对照公式确定正式成熟FTLE>0.003/年、成熟紧双星身份交换>=20、最长动力学层级<1000年，同时报告几何隔离与连续参与限制。30k探索交换门槛按等速率为5；额外几何隔离>5000年或成熟非层级<10%只是探索敏感性提醒，不冒称数学证明。

候选冻结前做控制事件数值收敛、影子幅度/窗口敏感性及初始化/行星协议消融。正式V2-CONFIRM-20261021至少128个新Seed仍封存，之后实测100000年，成熟窗口固定10000年后。若失败则保留证据继续迭代，不以短窗外推。充分验证和UI兼容性测试后才进入集成分支；正式main替换须用户验收。

每阶段提交Git检查点，用tools/records.py capture新增归档、check校验，再提交记录并推送研究分支，保留所有失败/UNKNOWN。现有按小时恢复检查已实际验证可访问工作区；不保证工作区永久保留、额度自动重置或无限后台运行。资源为2CPU、8GiB，当前磁盘余量约28GiB。无新付费资源。

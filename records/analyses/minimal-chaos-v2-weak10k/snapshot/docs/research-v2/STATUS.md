# V2 恢复入口

状态：10000年224条、30000年96条及负对照均已完成并审计。弱负能反馈1000年和10000年各96条已完成并审计，正在推进30000年。研究未完成，尚无正式100000年结果。main未改，私有网页未更新。

先读RESEARCH_PLAN.md、STRICT_PROTOCOL.md、MEDIUM_PROTOCOL.md、EXPERIMENT_LOG.md。V1在根FINAL_REPORT.md。

已完成：16匹配种子×9方案×1000年短窗；JS/native逐帧对照、激活夹具、1000年恢复到2000年逐位一致性检查。一个固定1000年样本native约快16倍，步数一致；长混沌轨迹最大状态差2.05e-4，恒纪元及损失统计一致，不声称长窗逐位一致。产品原始测试/构建通过。

当前规范实验medium.json：V2-B-0..31，每Seed7组、10000年，输出medium-canonical.shard{0,1}.jsonl。**配置的output是规范索引**。baseline-v1/screen-v3/strict-screen及medium、medium-contact-v2有已披露观测/接触差异，仅保留调试价值，不作正式长窗证据。

中期结论见MEDIUM_RESULTS.md：无控制1/32、旧牢笼0/32、reflect7/32、四组合32/32。但持续cap明显层级化和强干预；positive-transfer全窗恒纪元37.4%、激活帧.0118%、条件FTLE.0200/年，值得长窗验证，不能外推100000年。

**当前应恢复弱负能反馈探索，long30与medium都已完成，不需再运行**：

```sh
# 先检查锁/native worker和最近20分钟记录；有活跃工作即跳过。
# 无活跃工作时检查当前源码和manifest匹配，不重编译覆盖活跃二进制。
python3 docs/research-v2/run-stream.py docs/research-v2/weak30k.json 0 2
python3 docs/research-v2/run-stream.py docs/research-v2/weak30k.json 1 2
python3 docs/research-v2/audit.py docs/research-v2/weak30k.json
python3 docs/research-v2/summarize.py docs/research-v2/results/weak30k
```

同阶段两Shard并行，最多2个worker。已完成键自动跳过。1000年完成审计后依次用weak30k.json、weak30k.json执行相同步骤，不能把三个窗口累计成单次长窗。协议WEAK_BINDING_PROTOCOL.md，V2-D-0..15六方案。当前未运行正式确认集。

科学源/配置/二进制哈希在各Shard manifest；发生源码差异必须停止，不强行跳过版本检查。有活跃worker时不修改计算源码或重编译。旧long30科学源bf7f9d2，旧medium科学源1a9de78，不能用当前新增参数源覆盖旧manifest。完整原始结果/恢复检查点均已保存。

medium B-13曾超过Node输出缓冲，同二进制流式复算与原完成检查点坐标/成本/步数/事件数一致；保留传输中断。现统一使用run-stream.py，ijson3.3.0位于/tmp/codex-v2-python；若缺失需重装该独立工具依赖，不修改生产依赖。

raw/<源码哈希>-<配置哈希>/保存gzip完整事件，JSONL含路径和SHA256。work/每1000年原子保存完整物理/控制/行星/文明/统计/影子状态，版本隔离。工作区被销毁后，未推送的检查点不保证可恢复。数值中断单列UNKNOWN。

下一步：弱负能反馈1k/10k/30k逐级探索；比较长期混沌、远游、角动量和累计成本再选型。正式V2-CONFIRM-20261021至少128新Seed仍封存。成熟窗口固定10000年后；正式混沌诊断FTLE>0.003、成熟紧双星交换>=20、连续动力学层级<1000年并同时报告分布。100000年独立验证、数值收敛及兼容性充分后才进入集成分支；main替换需用户验收。

资源：2核、8GiB、约30GiB磁盘，Node24.19、g++14.2、Python科学库。GitHub/npm网络已实际验证，研究分支已推送。已创建按小时恢复检查；首次检查成功读取本工作区并发现两Shard均活跃，未重复启动。此验证不保证额度重置后或工作区销毁后仍能自动恢复；环境永久保留及额度自动续期未保证。

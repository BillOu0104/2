# V2 恢复入口

状态：32种子10000年中期224条全部完成并通过原始数据审计，正在运行16个V2-C新探索种子、30000年六组对照及负对照FTLE校准。研究未完成，尚无正式100000年结果。main未改，私有网页未更新。

先读RESEARCH_PLAN.md、STRICT_PROTOCOL.md、MEDIUM_PROTOCOL.md、EXPERIMENT_LOG.md。V1在根FINAL_REPORT.md。

已完成：16匹配种子×9方案×1000年短窗；JS/native逐帧对照、激活夹具、1000年恢复到2000年逐位一致性检查。一个固定1000年样本native约快16倍，步数一致；长混沌轨迹最大状态差2.05e-4，恒纪元及损失统计一致，不声称长窗逐位一致。产品原始测试/构建通过。

当前规范实验medium.json：V2-B-0..31，每Seed7组、10000年，输出medium-canonical.shard{0,1}.jsonl。**配置的output是规范索引**。baseline-v1/screen-v3/strict-screen及medium、medium-contact-v2有已披露观测/接触差异，仅保留调试价值，不作正式长窗证据。

中期结论见MEDIUM_RESULTS.md：无控制1/32、旧牢笼0/32、reflect7/32、四组合32/32。但持续cap明显层级化和强干预；positive-transfer全窗恒纪元37.4%、激活帧.0118%、条件FTLE.0200/年，值得长窗验证，不能外推100000年。

**当前应恢复long30.json，而非已经完成的medium**：

```sh
python3 docs/research-v2/run-stream.py docs/research-v2/long30.json 0 2
python3 docs/research-v2/run-stream.py docs/research-v2/long30.json 1 2
python3 docs/research-v2/audit.py docs/research-v2/long30.json
python3 docs/research-v2/summarize.py docs/research-v2/results/long30
```

两Shard分别持锁。Shard0启动前运行calibrate.mjs负对照；若其负对照raw文件已完成，不重复积分。30000年计算源码为bf7f9d2；其后纯文档/records提交不改变科学哈希。long30的saveCheckpoints=true，完成态/最后1000年安全状态及对应输入也压缩保存到results/checkpoints并记SHA256，便于独立恢复。

恢复命令（仓库根）：

```sh
git status --short --branch
sh docs/research-v2/build-native.sh
python3 docs/research-v2/supervise.py docs/research-v2/medium.json 0 2
python3 docs/research-v2/supervise.py docs/research-v2/medium.json 1 2
python3 docs/research-v2/audit.py docs/research-v2/medium.json
python3 docs/research-v2/summarize.py docs/research-v2/results/medium-canonical
```

两条supervise命令在两个终端并发，只用2个CPU worker。同Shard锁跳过活跃worker，结果跳过完成键，检查点恢复未完成Seed。**有活跃worker时不要重编译或修改计算源码**；新版本用新配置/输出。二进制哈希变化时先核对编译器与选项，不强行跳过版本检查。

medium两Shard均已完成。B-13/reflect-cap曾超过Node输出缓冲；已用同二进制流式复算，最终坐标、成本、步数和事件数与原完成检查点一致，均已归档。之后统一使用run-stream传输；依赖`python3 -m pip install --target /tmp/codex-v2-python ijson==3.3.0`，不修改生产依赖。旧medium的源码为1a9de78，当前新增预测控制后不可直接混用当前源码重跑旧manifest。

raw/<源码哈希>-<配置哈希>/保存gzip完整事件，JSONL含路径和SHA256。work/每1000年原子保存完整物理/控制/行星/文明/统计/影子状态，版本隔离。工作区被销毁后，未推送的检查点不保证可恢复。数值中断单列UNKNOWN。

下一步：完成medium全部224条，比较全部Seed分布、条件FTLE、动力学层级占比、累计控制成本。根据证据选择或迭代，进入30000和100000年。正式确认前缀V2-CONFIRM-20261021至少128种子仍封存，成熟期固定10000年后。确认后做步长/eta减半、影子幅度/窗口校准、初始化和行星协议消融。证据充分才进集成分支；main替换需用户验收。

资源：2核、8GiB、约30GiB磁盘，Node24.19、g++14.2、Python科学库。GitHub/npm网络已实际验证，研究分支已推送。已创建按小时恢复检查；首次检查成功读取本工作区并发现两Shard均活跃，未重复启动。此验证不保证额度重置后或工作区销毁后仍能自动恢复；环境永久保留及额度自动续期未保证。

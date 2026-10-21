# V2 恢复入口

状态：进入32个独立新探索种子的10000年中期对照；研究未完成，尚无正式100000年结果。main未改，私有网页未更新。

先读RESEARCH_PLAN.md、STRICT_PROTOCOL.md、MEDIUM_PROTOCOL.md、EXPERIMENT_LOG.md。V1在根FINAL_REPORT.md。

已完成：16匹配种子×9方案×1000年短窗；JS/native逐帧对照、激活夹具、1000年恢复到2000年逐位一致性检查。一个固定1000年样本native约快16倍，步数一致；长混沌轨迹最大状态差2.05e-4，恒纪元及损失统计一致，不声称长窗逐位一致。产品原始测试/构建通过。

当前规范实验medium.json：V2-B-0..31，每Seed7组、10000年，输出medium-canonical.shard{0,1}.jsonl。**配置的output是规范索引**。baseline-v1/screen-v3/strict-screen及medium、medium-contact-v2有已披露观测/接触差异，仅保留调试价值，不作正式长窗证据。

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

raw/<源码哈希>-<配置哈希>/保存gzip完整事件，JSONL含路径和SHA256。work/每1000年原子保存完整物理/控制/行星/文明/统计/影子状态，版本隔离。工作区被销毁后，未推送的检查点不保证可恢复。数值中断单列UNKNOWN。

下一步：完成medium全部224条，比较全部Seed分布、条件FTLE、动力学层级占比、累计控制成本。根据证据选择或迭代，进入30000和100000年。正式确认前缀V2-CONFIRM-20261021至少128种子仍封存，成熟期固定10000年后。确认后做步长/eta减半、影子幅度/窗口校准、初始化和行星协议消融。证据充分才进集成分支；main替换需用户验收。

资源：2核、8GiB、约30GiB磁盘，Node24.19、g++14.2、Python科学库。GitHub/npm网络已实际验证，研究分支已推送。环境永久保留、额度自动续期、定时任务能自动访问本工作区均未保证。

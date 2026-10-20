# 研究恢复入口

状态：进行中，阶段 1 扫描运行中。开始前读取本文件、docs/research/PLAN.md 和最近结果。

基线：c7a53a01def5f9d60389ee20ec0f8bac5210ed69。
分支：research/newtonian-survival；禁止合并 main。

已验证：完整源文件可读，Node 24.19.0；先前临时副本 npm ci、9 个测试文件、构建通过。
实际默认：chaotic 初始化器、牢笼启用、原分段引力、Yoshida 四阶分裂；研究必须显式关闭牢笼。
当前假设：全局随机行星速度与未束缚宿主参考系、原近距增强力、恒星近遇共同影响逃逸。

驱动器已建立：复用实际初始化器和 WorldState；研究程序位于 docs/research/engine.mjs。
validation.json：500 帧与原求解器比较，位置速度最大差约 1.2e-14；同物理时长步长收敛比约17，符合四阶预期。
阶段 1：32 个事前连续种子 EXPLORE-A-0..31，14 个配置，每配置200显示年。原始结果逐种子 fsync。
尚无完整阶段统计，不能据试运行或单个种子宣称总体改善。

下一步命令：`node docs/research/run.mjs docs/research/phase1.json`；已完成键自动跳过。
随后：`python3 docs/research/summarize.py docs/research/results/phase1.jsonl`，根据完整阶段1结果写阶段2假设和配置。
恢复要求：只重跑缺失键；检查程序哈希，不把不同版本实验混写。

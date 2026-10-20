# 研究恢复入口

状态：进行中，阶段 0。开始前读取本文件、docs/research/PLAN.md 和最近结果。

基线：c7a53a01def5f9d60389ee20ec0f8bac5210ed69。
分支：research/newtonian-survival；禁止合并 main。

已验证：完整源文件可读，Node 24.19.0；先前临时副本 npm ci、9 个测试文件、构建通过。
实际默认：chaotic 初始化器、牢笼启用、原分段引力、Yoshida 四阶分裂；研究必须显式关闭牢笼。
当前假设：全局随机行星速度与未束缚宿主参考系、原近距增强力、恒星近遇共同影响逃逸。

正在建立：复用实际初始化器和 WorldState 的独立研究驱动器，以及原求解器一致性验证。
尚无正式实验统计，不能宣称任何改善。

下一步命令：`node docs/research/validate.mjs`（创建后执行）；随后执行阶段 1 manifest。
恢复要求：只重跑缺失键；检查程序哈希，不把不同版本实验混写。

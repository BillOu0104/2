# 研究恢复入口

状态：进行中；初始方案独立确认、消融、数值控制、完整128种子精细复算及修正10000年扩展已完成。几何族独立确认、长期扩展和敏感性试验运行中。

基线：c7a53a01def5f9d60389ee20ec0f8bac5210ed69。
分支：research/newtonian-survival；禁止合并 main。

已验证：完整源文件可读，Node 24.19.0；先前临时副本 npm ci、9 个测试文件、构建通过。
实际默认：chaotic 初始化器、牢笼启用、原分段引力、Yoshida 四阶分裂；研究必须显式关闭牢笼。
当前假设：全局随机行星速度与未束缚宿主参考系、原近距增强力、恒星近遇共同影响逃逸。

驱动器已建立：复用实际初始化器和 WorldState；研究程序位于 docs/research/engine.mjs。
validation.json：500 帧与原求解器比较，位置速度最大差约 1.2e-14；同物理时长步长收敛比约17，符合四阶预期。
阶段 1：32 个事前连续种子 EXPLORE-A-0..31，14 个配置，每配置200显示年。原始结果逐种子 fsync。
阶段1共448条完成：仅修复行星主星参考系轨道提高恒纪元，但寿命改善有限；Q1.4较有希望。尺度放大与层级对照不能直接宣称成功。细节见 PHASE1.md。
产品9测试文件仍全部通过。研究分支已实际推送成功，main未改。

已完成1288条：阶段1 448、阶段2 576、数值控制264；另有独立DOP853参考和两个弹弓做功诊断。
阶段2主候选冻结为Q=1、行星相对预定宿主2逆行圆轨道、半径为宿主最近星距.12倍，保持质量、半径、G及全部判定。
完整事实见 PHASE2.md / NUMERICS.md。随机初始行星并非普遍未束缚：阶段1全部对至少一星初始负能，但最近宿主偏心率中位数.818。
数值控制中24种子精确牛顿不同步长/算法的主要存活判定相同，不能把真实弹弓归咎于数值误差。

独立确认：原始0/128期末存活，候选6/128；平均受限寿命146->244年，恒纪元2.9%->21.2%。3000年候选1/128。
重要纠正：最初10000年两条触发研究程序5e6步资源上限，不是物理损失；engine-v4(5e7预算)重算已完成，两条都存活到10000年，候选与原Q修复各1/128。最终只引用extended-10000-v2.jsonl。
首16种子精细复算仍0个期末存活判定差异，但寿命最大差195年；需要完整精细队列验证种子级统计。
完整128精细复算现已完成：仍6/128存活、5/128联合存活，均寿244.98 vs原244.37，恒纪元约21.0% vs21.2%。长期逐轨迹不准，但本队列统计改善稳定。

下一步命令（已有键自动跳过）：
`node docs/research/run.mjs docs/research/geometry.json`
`node docs/research/run.mjs docs/research/candidate-convergence-rest.json`
`node docs/research/repair_long.mjs`
完成后合并前16+后112精细结果（不重复实验），写完整精细结果与扩展；视几何族完整数据决定下一轮。读取 PHASE3.md。
几何扫描192条已完成：1%扰动8字族1000年30/32联合存活，5%扰动10/32；这可能来自规则轨道而非目标混沌，不能直接宣布成功。读取 GEOMETRY.md。
正在运行：`node docs/research/cohort_extend.mjs docs/research/geometry-extend.json`；`node docs/research/run.mjs docs/research/geometry-confirm.json`。随后运行 geometry_shadow.mjs（创建后）。
`node docs/research/geometry_shadow.mjs` 已启动；其结果仅在首次星体接触前解释，禁止将接触后点质量敏感性冒充物理证据。
精细旧候选扩展命令：`node docs/research/cohort_extend.mjs docs/research/fine-extend.json`。
独立确认集128个新种子，不因前几条结果修改配置；研究engine-v2仅增加诊断和消融选项，已验证与v1相同配置逐字段一致。
恢复要求：只重跑缺失键；检查程序哈希，不把不同版本实验混写。

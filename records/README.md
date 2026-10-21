# 三体壁纸：版本、分析与测试记录

这里集中保存v0.1起每次发布/修订当时的修改、测试代码、测试输出、截图和研究数据。快照直接取自对应Git提交，不把当前测试冒充历史测试；文件SHA256及原始路径见各目录的record.json。

源码和记录上传GitHub；默认预览入口继续使用原私有网页。具体约定见 [后续维护规范](POLICY.md)；按问题查阅见 [分析索引](analyses/README.md)。

| 版本 / 分析 | 内容 | 原始提交 |
|---|---|---|
| [v0.1.0](versions/v0.1.0/README.md) | 原版解包、源码审计与首版移植 | [c7f0db5](https://github.com/BillOu0104/2/commit/c7f0db5e62d141db51fde5fa5e222985bc47354e) |
| [v0.2.0](versions/v0.2.0/README.md) | 文明韧性、旋转背景与圆形天体 | [a08d2a8](https://github.com/BillOu0104/2/commit/a08d2a897682eea5965f7e8b8654ea77d00a90c6) |
| [v0.2.0-tail-fix](versions/v0.2.0-tail-fix/README.md) | 尾迹GPU容量与像素验证 | [46a852c](https://github.com/BillOu0104/2/commit/46a852c2adb3cff5c470b62be49c0b32864205bf) |
| [v0.3.0](versions/v0.3.0/README.md) | 原著天象分层、文明复苏与原生8K | [f629c50](https://github.com/BillOu0104/2/commit/f629c50f5bfc2ec1f78f1caf4996dfc15f0c11a7) |
| [v0.4.0](versions/v0.4.0/README.md) | 累计运行、双排行与紧凑布局 | [6e0f000](https://github.com/BillOu0104/2/commit/6e0f0000d3028c42a61a7a1d34288aa977b95d3d) |
| [v0.4.1](versions/v0.4.1/README.md) | 文明阶段、自定义窗口和精选日志 | [49047ad](https://github.com/BillOu0104/2/commit/49047ad621da970afe68ada7357252f10ad1e634) |
| [v0.4.1-hotfix](versions/v0.4.1-hotfix/README.md) | 悬停视角、缓慢归位与束缚初值 | [7fe7fed](https://github.com/BillOu0104/2/commit/7fe7fed36881c9eecbac2149a47bb57fb40e00e1) |
| [v0.4.2](versions/v0.4.2/README.md) | 恢复混沌、可调灵敏度与前景粒子 | [5bae340](https://github.com/BillOu0104/2/commit/5bae3406c53b6b45b5811ad59bca824d9ff85ce1) |
| [v0.5.0](versions/v0.5.0/README.md) | 文明人口、干仓质量与科技等级 | [5997ac0](https://github.com/BillOu0104/2/commit/5997ac063040037c1ce6f88f352e740255dbeced) |
| [v0.5.1](versions/v0.5.1/README.md) | 一个模拟月确认恒纪元 | [bba1792](https://github.com/BillOu0104/2/commit/bba179205531a0cd00ec2f7e13373330b2ffab5c) |
| [v0.5.1-pages-fix](versions/v0.5.1-pages-fix/README.md) | 仓库子路径与跨V8末位误差验证 | [c7a53a0](https://github.com/BillOu0104/2/commit/c7a53a01def5f9d60389ee20ec0f8bac5210ed69) |
| [v0.5.2](versions/v0.5.2/README.md) | 牛顿引力修复与研究候选初始化 | [a219cf9](https://github.com/BillOu0104/2/commit/a219cf9bad9b50da639cc1c4f42af65f2bc19721) |
| [v0.5.3](versions/v0.5.3/README.md) | 显示居中、慢速银河归位与十二阶段科技 | [292d21d](https://github.com/BillOu0104/2/commit/292d21d93e90ae212a41f828ea454337582dbf2b) |
| [v0.5.4](versions/v0.5.4/README.md) | v0.5.4：松手回弹、完全重置与逃逸重建 | [de49389](https://github.com/BillOu0104/2/commit/de493891629800b8b70614f11915847a6594da9d) |
| [v0.5.5](versions/v0.5.5/README.md) | v0.5.5：固定观察原点、守恒核查与连续尾迹 | [e62d7e8](https://github.com/BillOu0104/2/commit/e62d7e8761c1b318de23d600e121bee41907c0e2) |
| [minimal-chaos-v2-auto-ablation30k](analyses/minimal-chaos-v2-auto-ablation30k/README.md) | V2自动阶段 ablation30k | [940a71a](https://github.com/BillOu0104/2/commit/940a71acff7b8f49455a9471e5ddc3da04ef0936) |
| [minimal-chaos-v2-auto-explore100k](analyses/minimal-chaos-v2-auto-explore100k/README.md) | V2自动阶段 explore100k | [54802b4](https://github.com/BillOu0104/2/commit/54802b4a4525190bd3e9354e260bf341e1d5dc2a) |
| [minimal-chaos-v2-auto-precision30k](analyses/minimal-chaos-v2-auto-precision30k/README.md) | V2自动阶段 precision30k | [f637f9f](https://github.com/BillOu0104/2/commit/f637f9fd4d8537e76cb62889cd7991a3f278292f) |
| [minimal-chaos-v2-auto-shadow30k](analyses/minimal-chaos-v2-auto-shadow30k/README.md) | V2自动阶段 shadow30k | [723922d](https://github.com/BillOu0104/2/commit/723922d875869f86f7d43f950ea1b003a05ed657) |
| [minimal-chaos-v2-canonical](analyses/minimal-chaos-v2-canonical/README.md) | V2 canonical contact-aware experiment and recoverable batches | [1a9de78](https://github.com/BillOu0104/2/commit/1a9de7889942f57fd0997943d99612096bced012) |
| [minimal-chaos-v2-interim-audit](analyses/minimal-chaos-v2-interim-audit/README.md) | V2阶段证据与恢复审计 | [762eea4](https://github.com/BillOu0104/2/commit/762eea4eb4f3cf084048f00046330603841d2e1f) |
| [minimal-chaos-v2-long30](analyses/minimal-chaos-v2-long30/README.md) | V2完整30000年探索与负对照校准 | [102339c](https://github.com/BillOu0104/2/commit/102339ca9efcfa3b575dab447645133cef18d59b) |
| [minimal-chaos-v2-medium](analyses/minimal-chaos-v2-medium/README.md) | V2 complete10000-year comparison and predictive30000-year prototype | [8173521](https://github.com/BillOu0104/2/commit/8173521a4c1c28a98a29af41ae82871e1f3c0743) |
| [minimal-chaos-v2-prototype](analyses/minimal-chaos-v2-prototype/README.md) | V2 validated driver, strict escape observer and controller experiments | [aba525d](https://github.com/BillOu0104/2/commit/aba525d5dd9ac69c451f58ed43b0f3037fe91b33) |
| [minimal-chaos-v2-series-protocol](analyses/minimal-chaos-v2-series-protocol/README.md) | V2稳健性与100000年探索序列预注册 | [079a215](https://github.com/BillOu0104/2/commit/079a215359e78f12f20f921efbeb488d489037d7) |
| [minimal-chaos-v2-start](analyses/minimal-chaos-v2-start/README.md) | V2 baseline registration and headless research prototype | [f6e89c2](https://github.com/BillOu0104/2/commit/f6e89c22bd6b6f0938ec8991eb2c1809f4894788) |
| [minimal-chaos-v2-weak-trigger](analyses/minimal-chaos-v2-weak-trigger/README.md) | 弱负能触发间隔原型与物理夹具 | [7f64a8a](https://github.com/BillOu0104/2/commit/7f64a8aad9107f0ac94c16ca273ebdbf3742d605) |
| [minimal-chaos-v2-weak10k](analyses/minimal-chaos-v2-weak10k/README.md) | 弱负能反馈10000年完整探索 | [793076e](https://github.com/BillOu0104/2/commit/793076e819205a6f3bdce061d881f6e964066c9e) |
| [minimal-chaos-v2-weak1k](analyses/minimal-chaos-v2-weak1k/README.md) | 弱负能反馈1000年功能阶段 | [8475100](https://github.com/BillOu0104/2/commit/8475100c1f5302be7c39fd01859f681f736fb127) |
| [minimal-chaos-v2-weak30k](analyses/minimal-chaos-v2-weak30k/README.md) | 弱负能反馈30000年完整结果 | [2b7f1a3](https://github.com/BillOu0104/2/commit/2b7f1a397b8f1b430d1cf554cf5da5fa0316b1c1) |
| [newtonian-survival](analyses/newtonian-survival/README.md) | 无牢笼牛顿三星长期存活研究 | [c198020](https://github.com/BillOu0104/2/commit/c1980201d11c7d0968d9039bfca4ad91383b27b0) |
| [v054-centering-conservation-review](analyses/v054-centering-conservation-review/README.md) | 星群跟随不能代替守恒排查 | [7a63ebe](https://github.com/BillOu0104/2/commit/7a63ebefae4f9fa4b2db993697221e720506ca2e) |

## 怎么查看

每个目录的README介绍本次改动；snapshot保留原始目录结构，docs/qa是当时测试输出与截图，tests是测试源码，tools是运行/分析脚本。changes.patch记录源代码差异；record.json提供精确提交、上一个提交、文件清单和哈希。只复制该次新增/修改的文件，继承项沿previous_commit及前一版查阅。原始代码可在提交链接或独立历史分支直接查看。

原私有仓库v0.1–v0.5完整代码历史还保存在 [history/sites-v0.1-v0.5](https://github.com/BillOu0104/2/tree/history/sites-v0.1-v0.5)。历史Markdown内部的相对代码链接以原提交根目录为准；snapshot是证据副本，不是另一个可直接运行的工程。

## 分析阅读顺序

1. v0.1的SOURCE-AUDIT：原版公式、接口、移植缺陷与兼容边界。
2. v0.2的CIVILIZATION-UPDATE：文明频繁灭绝、韧性与视觉修正。
3. v0.3的REFERENCE-MODEL：纪元/天象/行星/文明分层与脱水复苏。
4. v0.4.1-hotfix、v0.4.2、v0.5的轨道抽样：稳定初值、混沌恢复、回拉效果与文明寿命。
5. analyses/newtonian-survival：无牢笼研究全报告、阶段分析、原始数据与数值验证。
6. v0.5.2的ACCEPTANCE：实际引擎修复后的独立新队列及其限制。

未保存成文件的历史对话不被冒称为逐字聊天记录；已保存的分析文件和实验均按来源提交归档。

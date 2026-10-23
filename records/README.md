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
| [v0.5.5-v2-integration-r1](versions/v0.5.5-v2-integration-r1/README.md) | V2完整集成原型功能、数值、UI与恢复检查 | [aaf84bd](https://github.com/BillOu0104/2/commit/aaf84bdb60fa0304662d95dcb72ef1f3a781e0cb) |
| [v0.5.5-v2-kernel-prototype-r0](versions/v0.5.5-v2-kernel-prototype-r0/README.md) | V2可选运行器初稿源码归档 | [2b043ca](https://github.com/BillOu0104/2/commit/2b043ca46b081fc987f6cdd6e77a2ad93dd08498) |
| [v0.5.5-v2-shadow-events-r2](versions/v0.5.5-v2-shadow-events-r2/README.md) | JS条件混沌观察器、逐事件控制账与独立128Seed确认注册 | [48537d5](https://github.com/BillOu0104/2/commit/48537d563ed9c885d749c49c70df24e89a42d577) |
| [minimal-chaos-v2-auto-ablation30k](analyses/minimal-chaos-v2-auto-ablation30k/README.md) | V2自动阶段 ablation30k | [940a71a](https://github.com/BillOu0104/2/commit/940a71acff7b8f49455a9471e5ddc3da04ef0936) |
| [minimal-chaos-v2-auto-explore100k](analyses/minimal-chaos-v2-auto-explore100k/README.md) | V2自动阶段 explore100k | [54802b4](https://github.com/BillOu0104/2/commit/54802b4a4525190bd3e9354e260bf341e1d5dc2a) |
| [minimal-chaos-v2-auto-precision30k](analyses/minimal-chaos-v2-auto-precision30k/README.md) | V2自动阶段 precision30k | [f637f9f](https://github.com/BillOu0104/2/commit/f637f9fd4d8537e76cb62889cd7991a3f278292f) |
| [minimal-chaos-v2-auto-shadow30k](analyses/minimal-chaos-v2-auto-shadow30k/README.md) | V2自动阶段 shadow30k | [723922d](https://github.com/BillOu0104/2/commit/723922d875869f86f7d43f950ea1b003a05ed657) |
| [minimal-chaos-v2-canonical](analyses/minimal-chaos-v2-canonical/README.md) | V2 canonical contact-aware experiment and recoverable batches | [1a9de78](https://github.com/BillOu0104/2/commit/1a9de7889942f57fd0997943d99612096bced012) |
| [minimal-chaos-v2-confirmation-b00](analyses/minimal-chaos-v2-confirmation-b00/README.md) | 独立确认批次 b00 | [7397da6](https://github.com/BillOu0104/2/commit/7397da6b6c303b64f38e0c9395fe56cf503fa802) |
| [minimal-chaos-v2-confirmation-b01](analyses/minimal-chaos-v2-confirmation-b01/README.md) | 独立确认批次 b01 | [90a1172](https://github.com/BillOu0104/2/commit/90a11725c87983fca2f2423a95fc0be1d7946f0c) |
| [minimal-chaos-v2-confirmation-b02](analyses/minimal-chaos-v2-confirmation-b02/README.md) | 独立确认批次 b02 | [a866db3](https://github.com/BillOu0104/2/commit/a866db32bd6b8a24c405965fdd2a9d1c271796ce) |
| [minimal-chaos-v2-confirmation-b03](analyses/minimal-chaos-v2-confirmation-b03/README.md) | 独立确认批次 b03 | [2a9f5be](https://github.com/BillOu0104/2/commit/2a9f5be103f587697e0206ddbc92554c43c6eb77) |
| [minimal-chaos-v2-confirmation-b04](analyses/minimal-chaos-v2-confirmation-b04/README.md) | 独立确认批次 b04 | [01745f5](https://github.com/BillOu0104/2/commit/01745f5c6150926708b34f6a394071b8317b7810) |
| [minimal-chaos-v2-confirmation-b05](analyses/minimal-chaos-v2-confirmation-b05/README.md) | 独立确认批次 b05 | [fe810c1](https://github.com/BillOu0104/2/commit/fe810c12eb4a086c9045ea266e5fb190314214c9) |
| [minimal-chaos-v2-confirmation-b06](analyses/minimal-chaos-v2-confirmation-b06/README.md) | 独立确认批次 b06 | [2626560](https://github.com/BillOu0104/2/commit/2626560c16e669b797f503fe2bdb680dc2686532) |
| [minimal-chaos-v2-confirmation-b07](analyses/minimal-chaos-v2-confirmation-b07/README.md) | 独立确认批次 b07 | [1f7e92f](https://github.com/BillOu0104/2/commit/1f7e92f76688ea6714860cd724d4faed57dea001) |
| [minimal-chaos-v2-confirmation-b08](analyses/minimal-chaos-v2-confirmation-b08/README.md) | 独立确认批次 b08 | [9c060e7](https://github.com/BillOu0104/2/commit/9c060e7bd0a6178804d63f8736c3bb850d152d50) |
| [minimal-chaos-v2-confirmation-b09](analyses/minimal-chaos-v2-confirmation-b09/README.md) | 独立确认批次 b09 | [fd58989](https://github.com/BillOu0104/2/commit/fd58989f360d2b9385225a71e9acbce84ca26aff) |
| [minimal-chaos-v2-confirmation-b10](analyses/minimal-chaos-v2-confirmation-b10/README.md) | 独立确认批次 b10 | [92b853a](https://github.com/BillOu0104/2/commit/92b853add336f79d9c1b1025943bb97948c83e31) |
| [minimal-chaos-v2-confirmation-b11](analyses/minimal-chaos-v2-confirmation-b11/README.md) | 独立确认批次 b11 | [9eb2866](https://github.com/BillOu0104/2/commit/9eb2866385fa4e453c223e650aaa9580adb9f0dd) |
| [minimal-chaos-v2-confirmation-b12](analyses/minimal-chaos-v2-confirmation-b12/README.md) | 独立确认批次 b12 | [7fc09fd](https://github.com/BillOu0104/2/commit/7fc09fdabcdb19c3a2305afe45215d2293443698) |
| [minimal-chaos-v2-confirmation-b13](analyses/minimal-chaos-v2-confirmation-b13/README.md) | 独立确认批次 b13 | [d492700](https://github.com/BillOu0104/2/commit/d4927007b8b5b5421f02af6ae3fab70cbcd5c549) |
| [minimal-chaos-v2-confirmation-b14](analyses/minimal-chaos-v2-confirmation-b14/README.md) | 独立确认批次 b14 | [3a8a663](https://github.com/BillOu0104/2/commit/3a8a66389c0900481b317f322085af0da58ce6b4) |
| [minimal-chaos-v2-confirmation-b15](analyses/minimal-chaos-v2-confirmation-b15/README.md) | 独立确认批次 b15 | [e04dec1](https://github.com/BillOu0104/2/commit/e04dec1e297abe8d02fd1cad593209fef9acc0fa) |
| [minimal-chaos-v2-confirmation-gates](analyses/minimal-chaos-v2-confirmation-gates/README.md) | 独立确认启动门禁实测 | [311fca7](https://github.com/BillOu0104/2/commit/311fca71b571e056934e25672a226f3957209b5c) |
| [minimal-chaos-v2-confirmation-protocol](analyses/minimal-chaos-v2-confirmation-protocol/README.md) | V2独立128Seed确认预注册与探索结论 | [923ea09](https://github.com/BillOu0104/2/commit/923ea09c5571e6e74fbe4ca2acfad902cfe0100e) |
| [minimal-chaos-v2-confirmation-review-20261022](analyses/minimal-chaos-v2-confirmation-review-20261022/README.md) | 完整独立确认评审与精度扩展注册 | [e3694e1](https://github.com/BillOu0104/2/commit/e3694e19f70a8e4687cca0d852a225a22a7dc514) |
| [minimal-chaos-v2-confirmation-start](analyses/minimal-chaos-v2-confirmation-start/README.md) | 独立128Seed确认已实际启动 | [9114932](https://github.com/BillOu0104/2/commit/91149321e89c6bcff1804cd8a5b49000f8c8c062) |
| [minimal-chaos-v2-h4-baselines-p00](analyses/minimal-chaos-v2-h4-baselines-p00/README.md) | 确认后精度诊断 p00 | [4cb10d1](https://github.com/BillOu0104/2/commit/4cb10d1aa74316c88adbdb8e1587654a66fa38b0) |
| [minimal-chaos-v2-h4-baselines-p01](analyses/minimal-chaos-v2-h4-baselines-p01/README.md) | 确认后精度诊断 p01 | [e606d08](https://github.com/BillOu0104/2/commit/e606d082e6c534208d74db0185f8b509e7905f97) |
| [minimal-chaos-v2-h4-baselines-p02](analyses/minimal-chaos-v2-h4-baselines-p02/README.md) | 确认后精度诊断 p02 | [47bd30d](https://github.com/BillOu0104/2/commit/47bd30de3a8a04f0b1f29935c72d70f55c493bd0) |
| [minimal-chaos-v2-h4-baselines-p03](analyses/minimal-chaos-v2-h4-baselines-p03/README.md) | 确认后精度诊断 p03 | [9f04375](https://github.com/BillOu0104/2/commit/9f04375f95717ae88f2414187a8d0af880b26115) |
| [minimal-chaos-v2-h4-baselines-p04](analyses/minimal-chaos-v2-h4-baselines-p04/README.md) | 确认后精度诊断 p04 | [3299d74](https://github.com/BillOu0104/2/commit/3299d7453d1f206dad355c4497c6d276a2871aa4) |
| [minimal-chaos-v2-h4-baselines-p05](analyses/minimal-chaos-v2-h4-baselines-p05/README.md) | 确认后精度诊断 p05 | [02b9065](https://github.com/BillOu0104/2/commit/02b9065def0d0b8f8f1cbf6c0241f493d2610089) |
| [minimal-chaos-v2-h4-baselines-p06](analyses/minimal-chaos-v2-h4-baselines-p06/README.md) | 确认后精度诊断 p06 | [9a8f6f6](https://github.com/BillOu0104/2/commit/9a8f6f68cb7f267ee914fd3d46e8251383bb2437) |
| [minimal-chaos-v2-h4-baselines-p07](analyses/minimal-chaos-v2-h4-baselines-p07/README.md) | 确认后精度诊断 p07 | [fa3e3bb](https://github.com/BillOu0104/2/commit/fa3e3bb795bf377afe35b832819fd84b2ae23e22) |
| [minimal-chaos-v2-h4-baselines-p08](analyses/minimal-chaos-v2-h4-baselines-p08/README.md) | 确认后精度诊断 p08 | [aa06eed](https://github.com/BillOu0104/2/commit/aa06eed630884b6fe19f11ba8e3eb4428ee87005) |
| [minimal-chaos-v2-h4-baselines-p09](analyses/minimal-chaos-v2-h4-baselines-p09/README.md) | 确认后精度诊断 p09 | [b02ef62](https://github.com/BillOu0104/2/commit/b02ef620bb169b05f0c6066684b916208a4a8185) |
| [minimal-chaos-v2-h4-baselines-p10](analyses/minimal-chaos-v2-h4-baselines-p10/README.md) | 确认后精度诊断 p10 | [65922e8](https://github.com/BillOu0104/2/commit/65922e8f5babef658fe5ea226c84ff8800300fe8) |
| [minimal-chaos-v2-h4-baselines-p11](analyses/minimal-chaos-v2-h4-baselines-p11/README.md) | 确认后精度诊断 p11 | [86832d8](https://github.com/BillOu0104/2/commit/86832d86365ae08e36cff07d0d25bb5f41cd6e9f) |
| [minimal-chaos-v2-h4-baselines-p12](analyses/minimal-chaos-v2-h4-baselines-p12/README.md) | 确认后精度诊断 p12 | [e92b8a1](https://github.com/BillOu0104/2/commit/e92b8a1024a2903feb43d27110711d4b9d85ead2) |
| [minimal-chaos-v2-h4-baselines-p13](analyses/minimal-chaos-v2-h4-baselines-p13/README.md) | 确认后精度诊断 p13 | [0d9158d](https://github.com/BillOu0104/2/commit/0d9158da694a62729649af835cfdc0de9d5e8a7a) |
| [minimal-chaos-v2-h4-baselines-p14](analyses/minimal-chaos-v2-h4-baselines-p14/README.md) | 确认后精度诊断 p14 | [7e08dea](https://github.com/BillOu0104/2/commit/7e08deacba30e1a6843512cd6d944e5862472a3a) |
| [minimal-chaos-v2-h4-baselines-p15](analyses/minimal-chaos-v2-h4-baselines-p15/README.md) | 确认后精度诊断 p15 | [7d3e01c](https://github.com/BillOu0104/2/commit/7d3e01c208e83328df5338060a4a44d2a3e82fc2) |
| [minimal-chaos-v2-h4-p00](analyses/minimal-chaos-v2-h4-p00/README.md) | 确认后精度诊断 p00 | [28cab09](https://github.com/BillOu0104/2/commit/28cab09a91f806e00ffec035f1d932dcb0488edd) |
| [minimal-chaos-v2-h4-p01](analyses/minimal-chaos-v2-h4-p01/README.md) | 确认后精度诊断 p01 | [547f556](https://github.com/BillOu0104/2/commit/547f556fe9b0ca2364d52206a8cb4658fb5553fa) |
| [minimal-chaos-v2-h4-p02](analyses/minimal-chaos-v2-h4-p02/README.md) | 确认后精度诊断 p02 | [4f07a50](https://github.com/BillOu0104/2/commit/4f07a500c49096836a6aed227210963cb170c342) |
| [minimal-chaos-v2-h4-p03](analyses/minimal-chaos-v2-h4-p03/README.md) | 确认后精度诊断 p03 | [c03c611](https://github.com/BillOu0104/2/commit/c03c6116a1931dbf01547ac366baf52bf93341a3) |
| [minimal-chaos-v2-h4-p04](analyses/minimal-chaos-v2-h4-p04/README.md) | 确认后精度诊断 p04 | [989f57c](https://github.com/BillOu0104/2/commit/989f57c889a98f0209146a9086c78d268c2326ee) |
| [minimal-chaos-v2-h4-p05](analyses/minimal-chaos-v2-h4-p05/README.md) | 确认后精度诊断 p05 | [a8f763f](https://github.com/BillOu0104/2/commit/a8f763febaf634966faf85ba6d19760db30d760c) |
| [minimal-chaos-v2-h4-p06](analyses/minimal-chaos-v2-h4-p06/README.md) | 确认后精度诊断 p06 | [ba989ef](https://github.com/BillOu0104/2/commit/ba989ef551592e641de16b732e37b8000b71170e) |
| [minimal-chaos-v2-h4-p07](analyses/minimal-chaos-v2-h4-p07/README.md) | 确认后精度诊断 p07 | [2011651](https://github.com/BillOu0104/2/commit/2011651f759536863be990674804683af1afb5e8) |
| [minimal-chaos-v2-h4-p08](analyses/minimal-chaos-v2-h4-p08/README.md) | 确认后精度诊断 p08 | [151ee78](https://github.com/BillOu0104/2/commit/151ee78916d0350e9cd2275fd7ffaed397083c79) |
| [minimal-chaos-v2-h4-p09](analyses/minimal-chaos-v2-h4-p09/README.md) | 确认后精度诊断 p09 | [6de2ece](https://github.com/BillOu0104/2/commit/6de2ececde0e1550901b30b70ab0466dac7141b2) |
| [minimal-chaos-v2-h4-p10](analyses/minimal-chaos-v2-h4-p10/README.md) | 确认后精度诊断 p10 | [f3f783f](https://github.com/BillOu0104/2/commit/f3f783fb819b579c9c44830f3e5a7b5ef4f41cf1) |
| [minimal-chaos-v2-h4-p11](analyses/minimal-chaos-v2-h4-p11/README.md) | 确认后精度诊断 p11 | [708a925](https://github.com/BillOu0104/2/commit/708a9254a7179274ef8555feda4caa0f213a5202) |
| [minimal-chaos-v2-h4-review-20261022](analyses/minimal-chaos-v2-h4-review-20261022/README.md) | 128匹配h4完整评审与同精度基准注册 | [25bee72](https://github.com/BillOu0104/2/commit/25bee7286f1871ea9c9616f88a4bbf5bd0db208a) |
| [minimal-chaos-v2-integration-kernel-r0](analyses/minimal-chaos-v2-integration-kernel-r0/README.md) | V2生产运行器集成初稿与独立原生夹具 | [2b043ca](https://github.com/BillOu0104/2/commit/2b043ca46b081fc987f6cdd6e77a2ad93dd08498) |
| [minimal-chaos-v2-interim-audit](analyses/minimal-chaos-v2-interim-audit/README.md) | V2阶段证据与恢复审计 | [762eea4](https://github.com/BillOu0104/2/commit/762eea4eb4f3cf084048f00046330603841d2e1f) |
| [minimal-chaos-v2-js-confirm-b00-e004](analyses/minimal-chaos-v2-js-confirm-b00-e004/README.md) | 独立JS确认中间检查点 b00-e004 | [983f873](https://github.com/BillOu0104/2/commit/983f873aaea5d3304235ea6321e127cdc4f5365b) |
| [minimal-chaos-v2-js-confirm-b00-e006](analyses/minimal-chaos-v2-js-confirm-b00-e006/README.md) | 独立JS确认中间检查点 b00-e006 | [37a4034](https://github.com/BillOu0104/2/commit/37a4034c21a879963e684dada85a744b6295ffb9) |
| [minimal-chaos-v2-js-confirm-b00-e012](analyses/minimal-chaos-v2-js-confirm-b00-e012/README.md) | 独立JS确认中间检查点 b00-e012 | [6db5a2f](https://github.com/BillOu0104/2/commit/6db5a2f4fc53704e921da3241e4784e4a2304f3c) |
| [minimal-chaos-v2-js-confirm-b00-e014](analyses/minimal-chaos-v2-js-confirm-b00-e014/README.md) | 独立JS确认中间检查点 b00-e014 | [18daaa4](https://github.com/BillOu0104/2/commit/18daaa4e5a4845bac4b3573c8179cac0573b3254) |
| [minimal-chaos-v2-js-confirm-b00-e020](analyses/minimal-chaos-v2-js-confirm-b00-e020/README.md) | 独立JS确认中间检查点 b00-e020 | [fa4dbce](https://github.com/BillOu0104/2/commit/fa4dbce09c66b0c416df08cf67270e7e6d8be2a9) |
| [minimal-chaos-v2-js-confirm-b00-e022](analyses/minimal-chaos-v2-js-confirm-b00-e022/README.md) | 独立JS确认中间检查点 b00-e022 | [1c65bd6](https://github.com/BillOu0104/2/commit/1c65bd6abf8945209ea5a82363e6c917315cd671) |
| [minimal-chaos-v2-js-confirm-b00-e025](analyses/minimal-chaos-v2-js-confirm-b00-e025/README.md) | 独立JS确认中间检查点 b00-e025 | [f2818cf](https://github.com/BillOu0104/2/commit/f2818cf20973d461c0a0d29ffab4b7d08528271d) |
| [minimal-chaos-v2-js-confirm-b00-e030](analyses/minimal-chaos-v2-js-confirm-b00-e030/README.md) | 独立JS确认中间检查点 b00-e030 | [7ca2bf6](https://github.com/BillOu0104/2/commit/7ca2bf697874dc1fc6d0dacc82a55ccb74f1e230) |
| [minimal-chaos-v2-js-confirm-b00-e035](analyses/minimal-chaos-v2-js-confirm-b00-e035/README.md) | 独立JS确认中间检查点 b00-e035 | [450a24c](https://github.com/BillOu0104/2/commit/450a24c4fb5403927a3d0ce310958735509ab019) |
| [minimal-chaos-v2-js-confirm-b00-e036](analyses/minimal-chaos-v2-js-confirm-b00-e036/README.md) | 独立JS确认中间检查点 b00-e036 | [e6545e9](https://github.com/BillOu0104/2/commit/e6545e924c9b8e701176cd418dcfd96b58f99e07) |
| [minimal-chaos-v2-js-confirm-b00-e038](analyses/minimal-chaos-v2-js-confirm-b00-e038/README.md) | 独立JS确认中间检查点 b00-e038 | [82793f8](https://github.com/BillOu0104/2/commit/82793f879b28cef0c8fb66b66d1de096aa58c453) |
| [minimal-chaos-v2-js-confirm-b00-e042](analyses/minimal-chaos-v2-js-confirm-b00-e042/README.md) | 独立JS确认中间检查点 b00-e042 | [37cd2ad](https://github.com/BillOu0104/2/commit/37cd2add9cf76eab7f0edbeb9468b12d321e4052) |
| [minimal-chaos-v2-js-confirm-b00-e046](analyses/minimal-chaos-v2-js-confirm-b00-e046/README.md) | 独立JS确认中间检查点 b00-e046 | [d4c14e7](https://github.com/BillOu0104/2/commit/d4c14e7937dc3fed7081221563b60b7172894417) |
| [minimal-chaos-v2-js-confirm-b00-e050](analyses/minimal-chaos-v2-js-confirm-b00-e050/README.md) | 独立JS确认中间检查点 b00-e050 | [78f1f90](https://github.com/BillOu0104/2/commit/78f1f90176235ab940a20f11d4e0bfd9d1bb5c56) |
| [minimal-chaos-v2-js-confirm-b00-e052](analyses/minimal-chaos-v2-js-confirm-b00-e052/README.md) | 独立JS确认中间检查点 b00-e052 | [fbbf760](https://github.com/BillOu0104/2/commit/fbbf760d0b8a7f465862dd926c74e5b315133236) |
| [minimal-chaos-v2-js-confirm-b00-e054](analyses/minimal-chaos-v2-js-confirm-b00-e054/README.md) | 独立JS确认中间检查点 b00-e054 | [cc060c8](https://github.com/BillOu0104/2/commit/cc060c81b3752a487805ac60090549d9bfa844a6) |
| [minimal-chaos-v2-js-confirm-b00-e059](analyses/minimal-chaos-v2-js-confirm-b00-e059/README.md) | 独立JS确认中间检查点 b00-e059 | [ecd8ab3](https://github.com/BillOu0104/2/commit/ecd8ab36b26fdad4c729ca90ab27f6a609387826) |
| [minimal-chaos-v2-js-confirm-b00-e062](analyses/minimal-chaos-v2-js-confirm-b00-e062/README.md) | 独立JS确认中间检查点 b00-e062 | [2d55ef9](https://github.com/BillOu0104/2/commit/2d55ef92be8633ff7cda9b077f112600202e38a4) |
| [minimal-chaos-v2-js-confirm-b00-e064](analyses/minimal-chaos-v2-js-confirm-b00-e064/README.md) | 独立JS确认中间检查点 b00-e064 | [6924323](https://github.com/BillOu0104/2/commit/6924323dd83367e3dcba2ad3b9770cc9f2722b76) |
| [minimal-chaos-v2-js-confirm-b01-e004](analyses/minimal-chaos-v2-js-confirm-b01-e004/README.md) | 独立JS确认中间检查点 b01-e004 | [d7a35f9](https://github.com/BillOu0104/2/commit/d7a35f99b955b979f5efefe30040fcd791b5e011) |
| [minimal-chaos-v2-js-confirm-b01-e006](analyses/minimal-chaos-v2-js-confirm-b01-e006/README.md) | 独立JS确认中间检查点 b01-e006 | [8fa36e7](https://github.com/BillOu0104/2/commit/8fa36e7d03f058303d047aaebbf0caced4a83a80) |
| [minimal-chaos-v2-js-confirm-b01-e012](analyses/minimal-chaos-v2-js-confirm-b01-e012/README.md) | 独立JS确认中间检查点 b01-e012 | [931c515](https://github.com/BillOu0104/2/commit/931c515a05efb1b5e3e3570307d9c1d87b483e94) |
| [minimal-chaos-v2-js-confirm-b01-e014](analyses/minimal-chaos-v2-js-confirm-b01-e014/README.md) | 独立JS确认中间检查点 b01-e014 | [95baf40](https://github.com/BillOu0104/2/commit/95baf4050c9824591b24f48c7b946906edda639a) |
| [minimal-chaos-v2-js-confirm-b01-e020](analyses/minimal-chaos-v2-js-confirm-b01-e020/README.md) | 独立JS确认中间检查点 b01-e020 | [6f5e487](https://github.com/BillOu0104/2/commit/6f5e4873af70cbf3bdbc0074c0fa9b9634bb0fad) |
| [minimal-chaos-v2-js-confirm-b01-e022](analyses/minimal-chaos-v2-js-confirm-b01-e022/README.md) | 独立JS确认中间检查点 b01-e022 | [cae36b6](https://github.com/BillOu0104/2/commit/cae36b65c137d777ba296b35c8d363cd31a0dcde) |
| [minimal-chaos-v2-js-confirm-b01-e026](analyses/minimal-chaos-v2-js-confirm-b01-e026/README.md) | 独立JS确认中间检查点 b01-e026 | [ab2c852](https://github.com/BillOu0104/2/commit/ab2c85223813a9cf51191ac4b00de6ccf235fc5a) |
| [minimal-chaos-v2-js-confirm-b01-e030](analyses/minimal-chaos-v2-js-confirm-b01-e030/README.md) | 独立JS确认中间检查点 b01-e030 | [d1ae3ad](https://github.com/BillOu0104/2/commit/d1ae3ad96b5495d60a1ef966d8567c53a8f22236) |
| [minimal-chaos-v2-js-confirm-b01-e036](analyses/minimal-chaos-v2-js-confirm-b01-e036/README.md) | 独立JS确认中间检查点 b01-e036 | [a6be733](https://github.com/BillOu0104/2/commit/a6be7338f1c5f44ceead3485224c70e39aa63431) |
| [minimal-chaos-v2-js-confirm-b01-e038](analyses/minimal-chaos-v2-js-confirm-b01-e038/README.md) | 独立JS确认中间检查点 b01-e038 | [a7d37f4](https://github.com/BillOu0104/2/commit/a7d37f417444172c2fb2b9a92ec609656748960a) |
| [minimal-chaos-v2-js-confirm-b01-e046](analyses/minimal-chaos-v2-js-confirm-b01-e046/README.md) | 独立JS确认中间检查点 b01-e046 | [f2ca162](https://github.com/BillOu0104/2/commit/f2ca162f6498eeb4efc59176759e892a433ead80) |
| [minimal-chaos-v2-js-confirm-b01-e052](analyses/minimal-chaos-v2-js-confirm-b01-e052/README.md) | 独立JS确认中间检查点 b01-e052 | [fd17f73](https://github.com/BillOu0104/2/commit/fd17f738f090aca6a3024d67267d0c5c7e7d803d) |
| [minimal-chaos-v2-js-confirm-b01-e054](analyses/minimal-chaos-v2-js-confirm-b01-e054/README.md) | 独立JS确认中间检查点 b01-e054 | [07f38e1](https://github.com/BillOu0104/2/commit/07f38e1f185f91b807bc3a50b380e2a96581e13b) |
| [minimal-chaos-v2-js-confirm-b01-e060](analyses/minimal-chaos-v2-js-confirm-b01-e060/README.md) | 独立JS确认中间检查点 b01-e060 | [8467f5a](https://github.com/BillOu0104/2/commit/8467f5ab99b3ed9f407ee2e14ffaa46163da0adc) |
| [minimal-chaos-v2-js-confirm-b01-e062](analyses/minimal-chaos-v2-js-confirm-b01-e062/README.md) | 独立JS确认中间检查点 b01-e062 | [f323607](https://github.com/BillOu0104/2/commit/f323607ea0018eaf9cc6832e7196d720b86c8756) |
| [minimal-chaos-v2-js-confirm-b01-e064](analyses/minimal-chaos-v2-js-confirm-b01-e064/README.md) | 独立JS确认中间检查点 b01-e064 | [f6ce859](https://github.com/BillOu0104/2/commit/f6ce859b8d1440701d60e1b025988a861ca8a629) |
| [minimal-chaos-v2-js-confirm-b02-e004](analyses/minimal-chaos-v2-js-confirm-b02-e004/README.md) | 独立JS确认中间检查点 b02-e004 | [5e04176](https://github.com/BillOu0104/2/commit/5e0417670d71a91c44c0c225d21f0e23cd1b494e) |
| [minimal-chaos-v2-js-confirm-b02-e006](analyses/minimal-chaos-v2-js-confirm-b02-e006/README.md) | 独立JS确认中间检查点 b02-e006 | [0e7073d](https://github.com/BillOu0104/2/commit/0e7073d1dfb63904bbb30a264feb57b20adc79c1) |
| [minimal-chaos-v2-js-confirm-b02-e010](analyses/minimal-chaos-v2-js-confirm-b02-e010/README.md) | 独立JS确认中间检查点 b02-e010 | [d6d13ed](https://github.com/BillOu0104/2/commit/d6d13ede19df946fbf5bf7b10a608b5829b5a5a6) |
| [minimal-chaos-v2-js-confirm-b02-e014](analyses/minimal-chaos-v2-js-confirm-b02-e014/README.md) | 独立JS确认中间检查点 b02-e014 | [0af9035](https://github.com/BillOu0104/2/commit/0af9035773dd819d1696b88c7c3368a60613d963) |
| [minimal-chaos-v2-js-confirm-b02-e018](analyses/minimal-chaos-v2-js-confirm-b02-e018/README.md) | 独立JS确认中间检查点 b02-e018 | [9315e4f](https://github.com/BillOu0104/2/commit/9315e4f1306ca1cbdb30203ecdf3e2425c5d3882) |
| [minimal-chaos-v2-js-confirm-b02-e020](analyses/minimal-chaos-v2-js-confirm-b02-e020/README.md) | 独立JS确认中间检查点 b02-e020 | [d79c572](https://github.com/BillOu0104/2/commit/d79c572f23810e22cb46ffc450fe6d7ec1430e83) |
| [minimal-chaos-v2-js-confirm-b02-e022](analyses/minimal-chaos-v2-js-confirm-b02-e022/README.md) | 独立JS确认中间检查点 b02-e022 | [a408d4c](https://github.com/BillOu0104/2/commit/a408d4cc344517134bbc36e3af17895460f3abd6) |
| [minimal-chaos-v2-js-confirm-b02-e030](analyses/minimal-chaos-v2-js-confirm-b02-e030/README.md) | 独立JS确认中间检查点 b02-e030 | [1333020](https://github.com/BillOu0104/2/commit/1333020bfbc03a57aec0fe9040d47745f2116df8) |
| [minimal-chaos-v2-js-confirm-b02-e034](analyses/minimal-chaos-v2-js-confirm-b02-e034/README.md) | 独立JS确认中间检查点 b02-e034 | [08ca962](https://github.com/BillOu0104/2/commit/08ca962072d85c0cd304c5796919965dd4714f01) |
| [minimal-chaos-v2-js-confirm-b02-e038](analyses/minimal-chaos-v2-js-confirm-b02-e038/README.md) | 独立JS确认中间检查点 b02-e038 | [ba80d8c](https://github.com/BillOu0104/2/commit/ba80d8c9de92d8fa1d22abb219da8691daac0f96) |
| [minimal-chaos-v2-js-confirm-b02-e040](analyses/minimal-chaos-v2-js-confirm-b02-e040/README.md) | 独立JS确认中间检查点 b02-e040 | [29dfc7c](https://github.com/BillOu0104/2/commit/29dfc7c49e07dcda09256f1e0426b5c08cfd29b2) |
| [minimal-chaos-v2-js-confirm-b02-e046](analyses/minimal-chaos-v2-js-confirm-b02-e046/README.md) | 独立JS确认中间检查点 b02-e046 | [2be9b03](https://github.com/BillOu0104/2/commit/2be9b039808f35489da0c945f0df9bd0fa3e240b) |
| [minimal-chaos-v2-js-confirm-b02-e050](analyses/minimal-chaos-v2-js-confirm-b02-e050/README.md) | 独立JS确认中间检查点 b02-e050 | [035d694](https://github.com/BillOu0104/2/commit/035d69449a9cef74b0faf3a1b0b73c631fcbbc60) |
| [minimal-chaos-v2-js-confirm-b02-e054](analyses/minimal-chaos-v2-js-confirm-b02-e054/README.md) | 独立JS确认中间检查点 b02-e054 | [a7eaeba](https://github.com/BillOu0104/2/commit/a7eaeba19e71063a2303e37a00096d0b13ed70f6) |
| [minimal-chaos-v2-js-confirm-b02-e056](analyses/minimal-chaos-v2-js-confirm-b02-e056/README.md) | 独立JS确认中间检查点 b02-e056 | [5d8623f](https://github.com/BillOu0104/2/commit/5d8623fef45668dba0afd8e1b01f86a1c3e9b1aa) |
| [minimal-chaos-v2-js-confirm-b02-e060](analyses/minimal-chaos-v2-js-confirm-b02-e060/README.md) | 独立JS确认中间检查点 b02-e060 | [41f53cc](https://github.com/BillOu0104/2/commit/41f53cc76cac22a20890390358eb0f95ae33070e) |
| [minimal-chaos-v2-js-confirm-b02-e062](analyses/minimal-chaos-v2-js-confirm-b02-e062/README.md) | 独立JS确认中间检查点 b02-e062 | [c6a3d9e](https://github.com/BillOu0104/2/commit/c6a3d9eadce0cc4e870ec1ac9282df47cd039ea4) |
| [minimal-chaos-v2-js-confirm-b02-e064](analyses/minimal-chaos-v2-js-confirm-b02-e064/README.md) | 独立JS确认中间检查点 b02-e064 | [514eedb](https://github.com/BillOu0104/2/commit/514eedb3d7ec91ac2eed39498c1f52aea235986a) |
| [minimal-chaos-v2-js-confirm-b03-e004](analyses/minimal-chaos-v2-js-confirm-b03-e004/README.md) | 独立JS确认中间检查点 b03-e004 | [50597a7](https://github.com/BillOu0104/2/commit/50597a7c8a3ab8379eeb7555dfeaf4f3c832f23c) |
| [minimal-chaos-v2-js-confirm-b03-e006](analyses/minimal-chaos-v2-js-confirm-b03-e006/README.md) | 独立JS确认中间检查点 b03-e006 | [7672a79](https://github.com/BillOu0104/2/commit/7672a79697f79f51408cea6d5301c7a2a3bfb567) |
| [minimal-chaos-v2-js-confirm-b03-e012](analyses/minimal-chaos-v2-js-confirm-b03-e012/README.md) | 独立JS确认中间检查点 b03-e012 | [060f466](https://github.com/BillOu0104/2/commit/060f466be9dc1e4cf1155942b13eec835fd586c2) |
| [minimal-chaos-v2-js-confirm-b03-e014](analyses/minimal-chaos-v2-js-confirm-b03-e014/README.md) | 独立JS确认中间检查点 b03-e014 | [3143a4d](https://github.com/BillOu0104/2/commit/3143a4d04b95f522570ef40786beab6518b9e426) |
| [minimal-chaos-v2-js-confirm-b03-e018](analyses/minimal-chaos-v2-js-confirm-b03-e018/README.md) | 独立JS确认中间检查点 b03-e018 | [8eabbf8](https://github.com/BillOu0104/2/commit/8eabbf87bb3bb8c9218c6b002aa2407e88459057) |
| [minimal-chaos-v2-js-confirm-b03-e020](analyses/minimal-chaos-v2-js-confirm-b03-e020/README.md) | 独立JS确认中间检查点 b03-e020 | [31c28fb](https://github.com/BillOu0104/2/commit/31c28fbbd97aa6303b4b26ef968c26349e1d008e) |
| [minimal-chaos-v2-js-confirm-b03-e022](analyses/minimal-chaos-v2-js-confirm-b03-e022/README.md) | 独立JS确认中间检查点 b03-e022 | [3a7b349](https://github.com/BillOu0104/2/commit/3a7b3498260b7a5b5ec46b3a0962119ae67a12b2) |
| [minimal-chaos-v2-js-confirm-b03-e028](analyses/minimal-chaos-v2-js-confirm-b03-e028/README.md) | 独立JS确认中间检查点 b03-e028 | [a264752](https://github.com/BillOu0104/2/commit/a264752559fe3075cb3dbe4428d63cd3d0316731) |
| [minimal-chaos-v2-js-confirm-b03-e030](analyses/minimal-chaos-v2-js-confirm-b03-e030/README.md) | 独立JS确认中间检查点 b03-e030 | [4688917](https://github.com/BillOu0104/2/commit/468891779eb8101330abb4342c00fe984a41df84) |
| [minimal-chaos-v2-js-confirm-b03-e033](analyses/minimal-chaos-v2-js-confirm-b03-e033/README.md) | 独立JS确认中间检查点 b03-e033 | [33ebee0](https://github.com/BillOu0104/2/commit/33ebee082fdf40b244d89906b4f0fe99bbe304c8) |
| [minimal-chaos-v2-js-confirm-b03-e037](analyses/minimal-chaos-v2-js-confirm-b03-e037/README.md) | 独立JS确认中间检查点 b03-e037 | [e27fd7b](https://github.com/BillOu0104/2/commit/e27fd7be09d16020046eade2966a8974e7690ed1) |
| [minimal-chaos-v2-js-confirm-b03-e038](analyses/minimal-chaos-v2-js-confirm-b03-e038/README.md) | 独立JS确认中间检查点 b03-e038 | [d8623fd](https://github.com/BillOu0104/2/commit/d8623fd427a7d7dcba0bb0dc6ac89f1576a784e9) |
| [minimal-chaos-v2-js-confirm-b03-e040](analyses/minimal-chaos-v2-js-confirm-b03-e040/README.md) | 独立JS确认中间检查点 b03-e040 | [b82a340](https://github.com/BillOu0104/2/commit/b82a340faecb0133254418d3c998327944eecd3f) |
| [minimal-chaos-v2-js-confirm-b03-e045](analyses/minimal-chaos-v2-js-confirm-b03-e045/README.md) | 独立JS确认中间检查点 b03-e045 | [3b13400](https://github.com/BillOu0104/2/commit/3b1340047f844f0de82c2753da019ac9e40a1918) |
| [minimal-chaos-v2-js-confirm-b03-e046](analyses/minimal-chaos-v2-js-confirm-b03-e046/README.md) | 独立JS确认中间检查点 b03-e046 | [0932a9c](https://github.com/BillOu0104/2/commit/0932a9ced10ef525f802d1793a9e6496b8fa9ba3) |
| [minimal-chaos-v2-js-confirm-b03-e052](analyses/minimal-chaos-v2-js-confirm-b03-e052/README.md) | 独立JS确认中间检查点 b03-e052 | [49714fc](https://github.com/BillOu0104/2/commit/49714fc5a7229c9b417b86f83e22c77b367c2f6a) |
| [minimal-chaos-v2-js-confirm-b03-e054](analyses/minimal-chaos-v2-js-confirm-b03-e054/README.md) | 独立JS确认中间检查点 b03-e054 | [081423a](https://github.com/BillOu0104/2/commit/081423ab554df077230d8b980a62774eb56660a5) |
| [minimal-chaos-v2-js-confirm-b03-e057](analyses/minimal-chaos-v2-js-confirm-b03-e057/README.md) | 独立JS确认中间检查点 b03-e057 | [f299e95](https://github.com/BillOu0104/2/commit/f299e958429bf482c7c7528f864d371e0c4d870c) |
| [minimal-chaos-v2-js-confirm-b03-e061](analyses/minimal-chaos-v2-js-confirm-b03-e061/README.md) | 独立JS确认中间检查点 b03-e061 | [d593ae4](https://github.com/BillOu0104/2/commit/d593ae45ce504a25ec89c012b7c1834a83e17c25) |
| [minimal-chaos-v2-js-confirm-b03-e062](analyses/minimal-chaos-v2-js-confirm-b03-e062/README.md) | 独立JS确认中间检查点 b03-e062 | [4325453](https://github.com/BillOu0104/2/commit/4325453ae12e7eb2bea98341ce9acb7490b610ac) |
| [minimal-chaos-v2-js-confirm-b03-e064](analyses/minimal-chaos-v2-js-confirm-b03-e064/README.md) | 独立JS确认中间检查点 b03-e064 | [23d8fac](https://github.com/BillOu0104/2/commit/23d8fac9d590fe0e15368eaf8e5de9827e6061b2) |
| [minimal-chaos-v2-js-confirm-b04-e005](analyses/minimal-chaos-v2-js-confirm-b04-e005/README.md) | 独立JS确认中间检查点 b04-e005 | [72a6d0b](https://github.com/BillOu0104/2/commit/72a6d0b5c1795e3fc78a9d412874cbe622cf5173) |
| [minimal-chaos-v2-js-confirm-b04-e006](analyses/minimal-chaos-v2-js-confirm-b04-e006/README.md) | 独立JS确认中间检查点 b04-e006 | [6513eda](https://github.com/BillOu0104/2/commit/6513eda697f2fc64d541fad5ef1f5b35175367a1) |
| [minimal-chaos-v2-js-confirm-b04-e012](analyses/minimal-chaos-v2-js-confirm-b04-e012/README.md) | 独立JS确认中间检查点 b04-e012 | [2d6e1cc](https://github.com/BillOu0104/2/commit/2d6e1cc49288c2d4c40da1435879006568cb470d) |
| [minimal-chaos-v2-js-confirm-b04-e014](analyses/minimal-chaos-v2-js-confirm-b04-e014/README.md) | 独立JS确认中间检查点 b04-e014 | [bd04b30](https://github.com/BillOu0104/2/commit/bd04b30bba5bf6c524d9a215ac3dc3abfdbd8c5f) |
| [minimal-chaos-v2-js-confirm-b04-e020](analyses/minimal-chaos-v2-js-confirm-b04-e020/README.md) | 独立JS确认中间检查点 b04-e020 | [0f15a5e](https://github.com/BillOu0104/2/commit/0f15a5ef1d22a1e9a9b79b942c349506d13ffc6e) |
| [minimal-chaos-v2-js-confirm-b04-e021](analyses/minimal-chaos-v2-js-confirm-b04-e021/README.md) | 独立JS确认中间检查点 b04-e021 | [bcf69c6](https://github.com/BillOu0104/2/commit/bcf69c600d7d151bb5b466e05fe1866b5feefe36) |
| [minimal-chaos-v2-js-confirm-b04-e022](analyses/minimal-chaos-v2-js-confirm-b04-e022/README.md) | 独立JS确认中间检查点 b04-e022 | [fd2a57d](https://github.com/BillOu0104/2/commit/fd2a57de7ca7c4f7bf0dd819bd9c36fe39e0ea25) |
| [minimal-chaos-v2-js-confirm-recovery-20261023t1654](analyses/minimal-chaos-v2-js-confirm-recovery-20261023t1654/README.md) | JS长窗中断同版恢复检查 | [4e5cf99](https://github.com/BillOu0104/2/commit/4e5cf99c6293cbd4ed06235a798d01a94c55fb9f) |
| [minimal-chaos-v2-js-confirm-recovery-20261023t1943](analyses/minimal-chaos-v2-js-confirm-recovery-20261023t1943/README.md) | JS独立确认第二次中断恢复审计 | [37a1c54](https://github.com/BillOu0104/2/commit/37a1c54c88fa2c6c6da162ecdfc4b953055cbd3f) |
| [minimal-chaos-v2-js-diagnostic-registration](analyses/minimal-chaos-v2-js-diagnostic-registration/README.md) | JS移植逐级诊断冻结注册 | [6601c7d](https://github.com/BillOu0104/2/commit/6601c7dd1ef54758a7d1f15ba3026a10e259de2a) |
| [minimal-chaos-v2-js-diagnostics-v1](analyses/minimal-chaos-v2-js-diagnostics-v1/README.md) | JS集成逐级窗口验证 | [8551609](https://github.com/BillOu0104/2/commit/8551609026fb86523223d878f5d71ef1521aae2d) |
| [minimal-chaos-v2-js128-registration](analyses/minimal-chaos-v2-js128-registration/README.md) | JS128新Seed100000年独立确认冻结注册 | [537c83c](https://github.com/BillOu0104/2/commit/537c83c5fd52eb8da5401ee06ed77389782b03f1) |
| [minimal-chaos-v2-js128-source-push-provenance](analyses/minimal-chaos-v2-js128-source-push-provenance/README.md) | JS新确认源码远端核对与推送竞态原始记录 | [0afb911](https://github.com/BillOu0104/2/commit/0afb911993e4c900187dc8e691cb83b2ec4df1fa) |
| [minimal-chaos-v2-js30k-review-native-registration](analyses/minimal-chaos-v2-js30k-review-native-registration/README.md) | JS30k低恒纪元诊断与同初值原生对照注册 | [897128d](https://github.com/BillOu0104/2/commit/897128d13cb2a683fdc186067b9c7e8fbdba6bc4) |
| [minimal-chaos-v2-long30](analyses/minimal-chaos-v2-long30/README.md) | V2完整30000年探索与负对照校准 | [102339c](https://github.com/BillOu0104/2/commit/102339ca9efcfa3b575dab447645133cef18d59b) |
| [minimal-chaos-v2-medium](analyses/minimal-chaos-v2-medium/README.md) | V2 complete10000-year comparison and predictive30000-year prototype | [8173521](https://github.com/BillOu0104/2/commit/8173521a4c1c28a98a29af41ae82871e1f3c0743) |
| [minimal-chaos-v2-precision-p00](analyses/minimal-chaos-v2-precision-p00/README.md) | 确认后精度诊断 p00 | [1c6c7ca](https://github.com/BillOu0104/2/commit/1c6c7cabc8996f8a4fc2f8bc3b050dbe6bff63e5) |
| [minimal-chaos-v2-precision-p01](analyses/minimal-chaos-v2-precision-p01/README.md) | 确认后精度诊断 p01 | [9538337](https://github.com/BillOu0104/2/commit/95383373fc6fa2e6fa33125871c62b7d837a9cba) |
| [minimal-chaos-v2-precision-p02](analyses/minimal-chaos-v2-precision-p02/README.md) | 确认后精度诊断 p02 | [c0d8a68](https://github.com/BillOu0104/2/commit/c0d8a68e80b07dd544d1a49197c580f040d0ba0c) |
| [minimal-chaos-v2-precision-p03](analyses/minimal-chaos-v2-precision-p03/README.md) | 确认后精度诊断 p03 | [7f295ee](https://github.com/BillOu0104/2/commit/7f295ee14bedd36ce21b3f151aaf00db01578c97) |
| [minimal-chaos-v2-precision-p04](analyses/minimal-chaos-v2-precision-p04/README.md) | 确认后精度诊断 p04 | [192cbfb](https://github.com/BillOu0104/2/commit/192cbfb7f7d1dc5e7a2319e551b0c2edaa638930) |
| [minimal-chaos-v2-precision-p05](analyses/minimal-chaos-v2-precision-p05/README.md) | 确认后精度诊断 p05 | [43e18a9](https://github.com/BillOu0104/2/commit/43e18a9e46449471636c3064a9a63c2e3f9a6682) |
| [minimal-chaos-v2-precision-p06](analyses/minimal-chaos-v2-precision-p06/README.md) | 确认后精度诊断 p06 | [8dadc61](https://github.com/BillOu0104/2/commit/8dadc61cbdbf42fa1365c34eadfdff320456d4f6) |
| [minimal-chaos-v2-precision-p07](analyses/minimal-chaos-v2-precision-p07/README.md) | 确认后精度诊断 p07 | [0ce48b1](https://github.com/BillOu0104/2/commit/0ce48b17a6209f7861cb8a5ecb96bc324070ed06) |
| [minimal-chaos-v2-precision-p08](analyses/minimal-chaos-v2-precision-p08/README.md) | 确认后精度诊断 p08 | [0b48d53](https://github.com/BillOu0104/2/commit/0b48d53ae21e9e25e7bd61870fa3b9bcfcbba6ca) |
| [minimal-chaos-v2-precision-p09](analyses/minimal-chaos-v2-precision-p09/README.md) | 确认后精度诊断 p09 | [6f14e59](https://github.com/BillOu0104/2/commit/6f14e59c64a2d5095181a9243598d3b587ddbb2d) |
| [minimal-chaos-v2-precision-p10](analyses/minimal-chaos-v2-precision-p10/README.md) | 确认后精度诊断 p10 | [a31e3c7](https://github.com/BillOu0104/2/commit/a31e3c7cf38d79408a61f769fbb336e05e6a6529) |
| [minimal-chaos-v2-precision-p11](analyses/minimal-chaos-v2-precision-p11/README.md) | 确认后精度诊断 p11 | [dd4f965](https://github.com/BillOu0104/2/commit/dd4f965e30bd601e8bea223911f9bcd85ed347cd) |
| [minimal-chaos-v2-precision-p12](analyses/minimal-chaos-v2-precision-p12/README.md) | 确认后精度诊断 p12 | [5c6294c](https://github.com/BillOu0104/2/commit/5c6294c74dd69b51c98cb80184eaa6d852bb8459) |
| [minimal-chaos-v2-precision-p13](analyses/minimal-chaos-v2-precision-p13/README.md) | 确认后精度诊断 p13 | [dd9ff98](https://github.com/BillOu0104/2/commit/dd9ff98691109ebd72cfff86e3794ffb54e60aef) |
| [minimal-chaos-v2-precision-p14](analyses/minimal-chaos-v2-precision-p14/README.md) | 确认后精度诊断 p14 | [bfc339f](https://github.com/BillOu0104/2/commit/bfc339fec730349312abaa94a63254c43ad3e6be) |
| [minimal-chaos-v2-precision-p15](analyses/minimal-chaos-v2-precision-p15/README.md) | 确认后精度诊断 p15 | [e3e7140](https://github.com/BillOu0104/2/commit/e3e71400ae611dcdbd6608ff97a743a315122563) |
| [minimal-chaos-v2-precision-review-20261022](analyses/minimal-chaos-v2-precision-review-20261022/README.md) | 完整精度复测评审与h4补齐注册 | [4612c35](https://github.com/BillOu0104/2/commit/4612c35cd242c09215464f4716b8fcb392dc0c7b) |
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

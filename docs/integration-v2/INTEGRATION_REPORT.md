# V2完整运行原型：兼容与数值检查

独立integration/minimal-chaos-control-v2分支，保留默认off，尚未正式验收或合并main；没有发布私有网页。研究原生100000年结果位于research/minimal-chaos-control-v2，不能当作JS移植验收。

已实现实际Simulation/Worker路径，非单独演示脚本：h4 Yoshida/近遇自适应与接受步前控制，转向/反射+捕获，P5行星生命周期和独立外部预算，恒星完整性吸收失效，数值UNKNOWN，文明/纪元/事件/排行/Seed与手动初值，行星显示/尾迹，完整物理和RNG断点。旧算法关闭模式保留，V2开关newproperty60可做相同精度、相同P5的纯牛顿对照。

## 设置兼容范围

- 首选V2时开启新保护；旧newproperty60此后只开关新控制器，不再调用原牢笼。旧mc/k1/k2/rc/re/expc/newproperty66/newproperty67在V2不生效并禁用，off恢复原语义。P5及失效观测不随保护开关关闭。
- V2固定Newton/reference/balanced、maxdt=.0001875、eta=.001875、timespeed=1、Kt=10；UI禁用不支持组合，导入/API由normalizeSettings固定，避免显示倍率跳过实际计算。引力软化和旧步长参数不能改变V2计算；切回off后可调整旧设置。
- 同Seed+宇宙编号确定初值；完整manualInitialBodies保留真实浮点数，不因滑块范围截断实际物理初值。显示、语言、保护开关不会重建三星；质量/初值/G改变会明确重建积分器，属于用户设置变化，不是研究存活时间可接续的同一试验。
- V2忽略旧autorestart标志，三星碰撞/分离会停止当前物理系统并提供手动新宇宙入口。行星损失独立等待≥5显示年，原文明死亡保留，三星时钟不重置。手动重启/修改物理设置不能累计为同一次实验存活。
- 真实物理半径、WorldState纪元阈值及文明人口/干仓规则不放宽。自定义质量、半径、光度和初始化不属于研究默认128Seed的证据范围；三颗恒星质量须>0。无效/数值极端设置可能触发明确UNKNOWN暂停。
- 旧档案没有stabilityMode时默认off；V2档案记录模式、h4/P5算法ID、完整设置/初值和事件。UI普通统计reload仍结束旧运行；完整物理断点是v2-checkpoint.js/批处理的独立功能，不能把Seed重放或浏览器统计恢复说成物理续算。

## 实测证据

1. 原13文件与新增V2功能/断点两文件，最终15测试文件全部通过：results/regression-r3.log。单独断点明细见checkpoint-r3-direct.log。
2. 10类20年冻结native夹具，真实转向/反射/捕获/行星吞噬与重生；最终results/conformance-r3/与日志。最大末态差约1.6e-10，接受步数、触发/激活计数、行星损失/重生、恒纪元帧、文明出生/死亡/存活和活跃帧一致。控制/行星预算有符号功、绝对功、冲量、角动量归一化差均<1e-7。保存完整原输入、原生输出及JS源SHA。
3. Chromium实际页面、WebGL/Worker、设置控件/指南、行星缺席隐藏与重生恢复、尾迹、事件、禁止自动整宇宙重置、旧模式切换通过：results/browser-r3/browser.json及PNG。原生Wallpaper Engine宿主未验证。
4. 完整状态断点在行星存在和缺席时保存，恢复后600帧的快照、积分器、预算、世界/文明/统计/事件/RNG均逐位一致；二次物理初值重建RNG一致。JSON保持Map/Set/非有限诊断哨兵，不把Infinity变null。
5. 批处理故障测试：已完成键去重并审计；原子状态已保存但结果尚未登记的中断可恢复，未重置；原始数据SHA破坏会拒绝继续。见batch-recovery-r2.json。
6. 4新诊断Seed×两模式×1000年全8三星完整、UNKNOWN0、宇宙编号始终1，7/8严格长末态一致性不满足，最大位置/速度分量差约5.02（无量纲项目单位）；最大单Seed恒纪元差−1.53个百分点。每Seed双实现原始及逐项结果全在results/headless-r1/。这些差异保留，不用低能量残差抹去，也不据短窗断言长期等价。
7. 上述Node1000年含快照/世界/文明/逐帧计时，约1642–5733模拟帧/秒、RSS约85–127MiB，远超过真实60Hz的短窗均速；最坏单帧/更长窗/渲染负担仍须审查。与Chromium共享2CPU，不能当作独占硬件性能，也不能用原生16倍加速描述本JS产品。
8. 构建最终通过results/build-r6.log，离线project.json加入模式属性，指南同步。先前缺说明导致构建失败、HUD缺字段、滑块舍入及断点Map/Set丢失的原始日志与截图完整保留。r2浏览器仍因未覆盖原step=.0005而失败，r3才修复；不覆盖旧测试结果。

## 下一阶段与恢复

DIAGNOSTICS_PROTOCOL.md和diagnostics-v1.json在新积分前冻结，两个现有CPU/两个worker；同4个初值从1000续算至10000/30000，每1000年完整状态检查点，窗口结果独立保存、原始/状态SHA、防混版/去重/锁、Git和records归档。不使用这些4个诊断Seed作为未来新确认集。

本轮JS几何交换/非层级指标仅是部分证据，条件影子FTLE及动态层级联合尚未测，不宣称混沌联合成功。待30k诊断后审阅差异、性能、必要的长期统计/精度与真实宿主兼容；当前不具备直接替换main的验收证据。研究保持未完成，恢复检查继续。

在本分支执行npm test、npm run build；V2_NATIVE=/path/to/frozen/native node tools/validate-v2-native.mjs <新的输出目录>；启动本地tools/serve.mjs --dist后运行tools/v2/browser-check.mjs <新目录>。不要覆盖既有证据。完整批处理恢复命令见STATUS.md。

## 2026-10-26正式JS100000年确认

JS128新Seed×两候选完整256长期结局，来源/配置/注册初值/原始/主影子状态审计PASS、UNKNOWN0；完整结果与限制以JS_CONFIRMATION_RESULTS.md为准，取代上文历史“尚未JS长期验证”的状态，不覆盖原短窗差异。转向/反射完整128/128，混沌联合118/124，成熟恒纪元33.99%/19.08%。新32Seed同初值h8为数值诊断，见当前STATUS，不调控制、不将它冒充新确认。真实Wallpaper Engine宿主和完整P5矢量冲量仍未验证；main替换未授权实施。

## 2026-10-28 h8匹配精度复核

前32 h8完整64条真正100k结局/256窗口审计PASS、UNKNOWN0；混沌联合转向32/32、反射31/32，成熟39.6545%/20.9547%。对匹配h4的固定95%差区间均未完全位于±5百分点内，不能据此验收收敛。JS_H8_RESULTS.md和results/js-h8-review-20261028保存全部逐Seed、控制成本、行星文明与不足Seed16。按独立新协议补齐剩余96匹配初值，当前恢复见STATUS；计算src与原worker不改，不覆盖main，真实Wallpaper Engine宿主与完整P5矢量跳变冲量仍未验证。

# 三体 · 实时演算：完整项目交接

交接日期：2026-11-09。仓库：[BillOu0104/2](https://github.com/BillOu0104/2)。本文面向没有聊天记录的新 Codex Agent。先读本文件，再读 `AGENTS.md` 与对应模块；不要依照历史报告中的命令自动启动研究任务。

## 1. 当前交付与版本事实

本次交付的是 **v0.6.1 设置面板版 Web 壁纸**，运行代码未修改。默认采用 V2 `deflect-v2`、h4 Yoshida 积分与 P5 行星重生；物理和文明规则沿用 v0.6.0。本次新增交接文档、打包工具、离线验证和记录，没有新物理算法、没有升级版本号、没有发布私有站点或 Steam 创意工坊。

必须区分以下版本：

| 对象 | 2026-11-09 实际状态 |
|---|---|
| `main` | `a7e1744172b835eacecd3d3b8201c62f1eb019aa`，v0.6.0，已选择性集成 V2 |
| `release/v0.6.1-settings` | `ea50c8075aeb2275897098baf356eff5312bb6e9`，本交付源码基线 |
| 发布标签 `v0.6.1` | 解引用到 `e9a3b3ee6451e3554517a5bad0e3529a65b428a8`；分支后续提交包含归档/发布记录 |
| PR #5 | v0.6.1 → main，读取时仍为 open draft，**未合并** |
| 本次独立交付分支 | `delivery/we-handoff-20261109`；不覆盖 main 或研究分支 |
| 私有预览 | 沿用 `https://trisolaris-reconstruction-20261019.wittylark8.chatgpt.site/`；本任务未重新部署 |

因此不能把最新 main 与最新已发布设置版本混为一谈。以发布过的 v0.6.1 为本次打包基线，保留它比 main 更新的设置界面。后续请先 `git fetch` 再核实上表，而非假定这些提交永远是 HEAD。

本次文件：

- `three-body-v0.6.1-wallpaper-engine.zip`：可供 Wallpaper Engine 编辑器导入的完整 Web 项目，入口位于根目录 `index.html`，22个文件，35,114,417字节。
- `HANDOFF.md`：本文；同时提交仓库根目录。
- `README-Wallpaper-Engine.md`：面向使用者的导入、离线查看及发布说明。
- `TEST_RESULTS.md`：本次新测试及明确未验证项目。
- `MANIFEST.json`：ZIP 内逐文件 SHA256、大小、来源提交与 ZIP 哈希。
- `SHA256SUMS.txt`：以上交付文件的完整性校验。

源码在 GitHub，二进制交付在 Dropbox 的 `/Trisolaris-Handoff-2026-11-09-v0.6.1`。不要把最终 ZIP、node_modules、研究数据或缓存提交到运行项目。Dropbox 文件和链接的最终回执见 `records/maintenance/2026-11-09-handoff-delivery.json`（上传完成后生成）。

## 2. 背景、目标及授权边界

项目从 Wallpaper Engine 原版《三体实时演算》的 Scene 资源重建为独立 Three.js 网页。原作者 SYKM，原 Workshop ID 为 `3509243656`。原版 Scene 脚本依赖 `engine`、`shared`、`Vec3`、`createScriptProperties`，不能直接在浏览器执行。重建保留可读业务源码与属性键，使用局部适配上下文移植温度、界面等逻辑，没有对整份附件直接求值。

原版还原不是逐像素、逐帧复刻。球体/导航环取代 `.mdl`，后处理部分近似；人口储备、干仓质量、十二级科技、文明排行、可复现 Seed、V2 控制及 P5 是后续新增。小说天象解释是建模参考，不是可直接执行的物理规范。活动温区、潮汐损伤和文明阈值属于项目规则，不声称由原著定量给出。

用户长期偏好由 `AGENTS.md` / `records/POLICY.md` 明文保存：修改、分析、测试均归档并上传 GitHub；预览默认保留原私有网站；源码推送、测试通过、站点部署须分别核实；独立分支交付，未经授权不自动合并 main。不要强推、删除研究成果或复写已冻结实验结果。本次只做最终打包和交接，不修改物理、不继续研究。

原资源带非商用声明，音乐为 **Melodysheep — Ether**。查看 `docs/SOURCE-AUDIT.md`、构建根目录 `LICENSE-NOTICE.txt`、`assets/THREE-LICENSE.txt` 和资产清单。可导入编辑器不等于拥有公开再发布所有资源的权利；正式公开 Workshop 前由使用者核实原图、音乐和衍生作品授权。本包不带原 Workshop ID，不会自动覆盖原作者作品。

## 3. 架构与数据流

这是静态前端和本地 Worker 模拟，没有必须常驻的远程后端、数据库服务、账号、CDN 或在线 API。

```text
属性 Schema / 本地保存 / Wallpaper Engine 回调
                    ↓ normalize + migrate
src/main.js → Worker(init/settings/restart/pause)
                    ↓
src/simulation.js → V2ControlledSystem 或旧物理兼容路径
                    ↓
WorldState → 温度/行星结构/纪元/文明状态与领域事件
                    ↓ 约30Hz快照、轨迹样本、事件
Three.js Renderer + DOM HUD + IndexedDB档案/本地排行
```

| 文件/目录 | 职责与修改入口 |
|---|---|
| `index.html`、`src/main.js`、`src/style.css` | 页面骨架、初始化、HUD、设置控件、Worker 通讯、档案/排行和用户操作 |
| `src/simulation-worker.js` | 无 DOM Worker，接收配置并调度完整模拟帧，发送快照/事件 |
| `src/playback-clock.js` | 播放速度与固定参考时钟；不得通过加大物理步长提速 |
| `src/simulation.js` | 模拟总入口、旧物理路径、原版脚本适配、文明日志与生命周期 |
| `src/v2-simulation.js` | V2 与壁纸状态/事件/P5/终止条件适配 |
| `src/physics/gravity.js` | V2 牛顿引力、势能、Yoshida、近遇步长、碰撞/异常与守恒诊断 |
| `src/physics/minimal-control.js` | 已验证控制律，成对转向、内部保护、capture，以及成本账本 |
| `src/physics/controlled-system.js` | 控制+积分帧、P5 缺席/重生、检查点及诊断状态 |
| `src/orbital-initialization.js` | Q=1 随机非层级三星、宿主相对逆向近圆行星初值 |
| `src/controller-settings.js`、`src/seed-compatibility.js` | 默认控制器、旧设置/Seed 回放兼容，旧配置备份和恢复 |
| `src/world-state.js`、`src/habitability.js`、`src/escape-state.js` | 独立纪元/天象/潮汐/适居与逃逸判断 |
| `src/civilization-state.js`、`src/civilization-levels.js` | 脱水/干仓/复苏、储备与科技发展 |
| `src/v2-checkpoint.js` | 完整 V2/RNG 状态保存与恢复；不等于浏览器自动续跑 |
| `src/renderer.js` | Three.js 场景、天空、天体、光效、粒子、后处理、渲染快照 |
| `src/view-motion.js`、`src/motion-visuals.js` | 悬停/拖拽惯性、银河回归、旋转环淡入淡出 |
| `src/fixed-display-frame.js` | 固定初始显示原点及可选全系统质心显示参考系，不修改物理坐标 |
| `src/orbit-trace.js`、`src/adaptive-trails.js`、`src/trail-ribbon.js` | 接受步采样、复杂度/弧长自适应、连续共享顶点带状尾迹 |
| `src/settings.js`、`src/original-data.js` | 原始属性数据、默认值、范围、校验和迁移 |
| `src/settings-layout.js`、`src/settings-catalog.js` | 220项的唯一分类/快捷项及控件目录 |
| `src/settings-descriptions.js`、`src/setting-help.js` | 圈叹号说明文本、视口浮层、键盘/触摸处理 |
| `src/layout.js` | 左右栏、时钟、年数、日志等的位置编辑与保存 |
| `src/audio.js`、`src/bridge.js` | 本地音乐、Web Audio、WE 属性/音频/FPS/暂停适配 |
| `src/storage.js`、`src/run-statistics.js` | IndexedDB、设置存储、宇宙/文明计时与前五名 |
| `src/legacy/` | 保留的原业务脚本片段；结合 SOURCE-AUDIT 阅读，不单独执行 |
| `assets/original/manifest.json` | 原资源到转换输出的来源、哈希和尺寸，构建完整性依据 |
| `tools/build.mjs`、`tools/serve.mjs` | esbuild 离线打包、静态服务 |
| `tools/generate-settings-guide.mjs` | 从实际控件目录生成设置手册，避免手写清单漂移 |
| `tests/*.test.js` | 单元与集成回归，当前152个断言测试 |
| `docs/`、`records/` | 设计/验收文档和有提交来源、哈希的不可覆盖历史证据 |

依赖锁定：Three.js `0.180.0`，esbuild `0.25.11`，Playwright-core `1.56.1`。CI 使用 Node22，本次 Node24.19.0/npm11.9.0/Python3.12.14。只有打包/开发需要 Node；最终用户无需 Node。Three.js 当前版本要求 WebGL2。

Worker 源码在构建时内嵌到主 bundle，运行时生成 Blob Worker；没有遗失的远程 worker.js。约8ms唤醒调度、累计最多0.25秒一次墙钟增量；按完整1/60参考帧推进，单次工作批预算约12ms，剩余积压留待后续。暂停清空墙钟积压，恢复不会追赶后台整段时间。快照有初始化/设置待确认状态，防止新设置配旧快照。数值异常明确暂停/UNKNOWN，不被记成一次物理死亡。

## 4. 物理引擎、初始化与 V2 控制

### 4.1 单位、求解与随机性

固定4个 body 槽位：索引0–2恒星、3行星。**缺席行星用 mass=0 标记，不缩短数组**。所有消费快照、轨迹和 UI 的代码均需遵守。

默认初值是随机非层级三星，去除质心速度后调到 Q=1，行星选择宿主恒星，以其最近恒星距离 D 的0.12倍为轨道半径，按宿主+行星质量计算近圆速度，采用宿主相对逆向轨道，并加入宿主平移速度、正确的初始动量反冲和全系统质心处理。没有预先运行筛 Seed，没有固定长寿 Seed，没有改成层级三星或周期8字轨道。

Seed 与 generation 共同决定初始化（`${seed}:${generation}`），使用确定性可保存状态的 RNG。相同 Seed 但不同算法、模式、generation、初值或设置不应声称同一轨道。自定义初值是明确的优先路径，`manualInitialBodies` / `settingsFromInitial` 及原始 `newproperty50` 模式不能被自动初值覆盖；四天体六个位置/速度分量和质量键的映射已有回归测试。

V2 正常力是牛顿平方反比，不使用旧分段近距离增强或软化。势能与力一致。使用 Yoshida 四阶组合，含负的中间子步；近遇时按最小双体自由落体/穿越尺度进一步细分。默认 h4 参数为：

- 最大步长 **0.0001875**；η **0.001875**。
- 每参考帧推进 **0.0075** 求解时间；60参考帧对应1显示年，即1显示年=0.45求解时间单位。
- 显示年不是校准到真实太阳质量/AU的公历年。不要修改换算来美化存活率。
- 最小步长约1e-10、单次 advance 最多200000步；非有限值或预算失控返回数值失败，回滚最后有效状态，不任意纠正轨道。
- 接受步的线段检查接触，属于点体+半径模型；不是流体碰撞或恒星真实合并。自适应步长的 Yoshida 不宣称全局严格辛性。

播放速度通过执行更多完整参考帧改变，不放宽 h4。低性能设备可能落后墙钟；不要跳步或降低精度来维持表面帧率。旧物理模式仍有原平方倍速兼容语义，修改时须读 `playback-clock.js` 和测试。

### 4.2 已采用的转向控制

正式默认 `deflect-v2`，`newproperty60=true`。控制与牛顿引力分开计账，是明确的人为速度干预，**不是纯牛顿长期稳定解**。

每次自适应子步选择前执行危险检查/转向与必要内部保护，再计算近遇步长并积分；参考帧末检查远场 capture。成对转向在接近、距离小于约4倍双体接触半径且预测近心距过小时触发：预测 q<1.15倍接触半径，目标约1.3倍。保留相对速率，按质量施加相反动量反冲；单独的方向改变通常会改变角动量。冻结算法中的约1.15半径内部反射保护仍保留，避免移除后与已验证实现不一致；不提供研究用 `reflect-v2` 正式 UI。

远场 capture 检测向外运动、R超过初始尺度与其他恒星对距离的约1.5倍，能量接近逃逸阈值；默认触发可为 E>−μ/(8×尺度)，目标约−μ/(4×尺度)。它把抽取的能量转移给另一对的径向相对运动。不要被 `positiveOnly` 名字误导：配置的负阈值可以更早触发，读实际条件。所有控制功、动量/角动量差和速度跳变需保留。

控制器设置有效性有前置校验，非法组合不应被偷偷改写为其他算法。关掉 V2 可恢复 `legacyPhysics` 备份，包括旧引力/牢笼参数；显式关闭选择会保存。V2 内的保护开关不等于回到完整纯牛顿历史，因为 P5 仍可能发生。做纯牛顿对照需明确旧模式+正确牛顿力+牢笼关闭+独立终止协议。

### 4.3 P5 行星毁灭、缺席与再生

吞噬、潮汐终态或确认逃逸会结束原文明，行星槽质量变0，恒星继续积分。至少等待 **5显示年** 后按 P5 在宿主附近再生；轮换宿主 `(2+respawns)%3`，黄金角相位约2.399963弧度，半径取0.12最近恒星距离和约2.5倍接触半径的较大值，逆向近圆速度。新行星等待新文明，原文明不会无故复活，宇宙编号与恒星时间不重置。

**关键限制：P5 再生与初始初始化不同，没有给宿主施加相同的质量注入反冲。** 这是已实现、明确记外部质量/动量账本的续生机制，因此整套系统可以真实积累质心漂移；不是相机移动就能修复的守恒问题。本任务没有改它。固定视图可见天体远离初始画面；可选全系统质心显示只改渲染参考系，不能用来声称消除了物理漂移。

恒星接触/确认失效是吸收终态，会暂停等待手动新宇宙，V2 不用自动重置整宇宙掩饰恒星失败。旧自动重启开关仍保留在回退路径。行星不存在时，renderer 隐藏对应球体/尾迹，数据面板与温度必须处理 absent，三星轨迹继续；不要在新 UI 中假设第4体永远可见。

### 4.4 守恒诊断读法

应同时看原始 E/P/L、控制成本和 P5 外部预算。能量数值残差约为 `(E−E0−control.work−external.work)/|E0|`，不能把扣功后的残差称为“系统无人工干预且能量守恒”。诊断最大值按显示年采样，不是每个子步的严格误差上界。

`external.impulse` 在早期研究中累计的是动量**模长变化**，会漏掉仅改方向的冲量；生产 v0.6.0 已另加 `vectorImpulse` 真正累计矢量跳变范数，并对旧检查点标记信息不完整。不要重新解释冻结旧数据为已测出完整矢量成本。人工控制一般不保证角动量守恒，纯牛顿对照的 P/L 守恒与受控情形须分开分析。

## 5. 行星、纪元、天象与文明

`WorldState` 把轨道纪元、辐照温度、天象、结构完整性、环境适宜度与文明生存分开。恒纪元不等于适温，乱纪元也不自动清空文明。

**恒纪元判定**：同一主导恒星的引力超过第二名约1.5倍、相对束缚能<0、扰动比<0.35，连续达到 `epochWindow=1/12` 显示年（约一个月）。不合适状态维持约0.5模拟秒或主导星变化后转乱纪元。不要为了提高成绩随意调这些阈值。

温度来自三个恒星的辐射平衡、冰雪反照率、热惯性和保留的温度振荡；恒星有原规则的约±8%半径呼吸。差分潮汐用引力张量最大特征值（Jacobi求解），以 `tideRatio/planetStrength` 得压力比，默认强度1.6；超过1累积损伤，足够低压且过等待后缓慢恢复。吞噬/大撕裂锁定不可逆终态。`safeToWake` 还要求完整性≥0.25、压力<0.5，且轨道稳定或通量变化足够小；不能只看22°C就认为100%适宜。

文明状态机主要位于 `civilization-state.js`：

```text
empty → 安全出生 → active
active → dehydrating（约1秒）→ dormant / 干仓储存
dormant → 安全窗口+等待 → rehydrating（约0.5秒）→ 同编号active
储备耗尽或行星不可逆毁灭 → dead → 后续新文明
```

默认低等级活动温区 **−20～40°C**。韧性在文明出生后才有，表示人口储备和干仓质量，不是环境的预置生命值；只在暴露/潮汐等条件下损失，任一核心储备≤约1%或行星毁灭会死亡。热宽限30是损失速率参数，不是固定30年寿命。安全后复苏原编号；文明寿命包括休眠，科技发展只累计安全实际生产时间。

十二阶段是旧石器、新石器、青铜、铁器、古典、中世纪、蒸汽、电气、原子、信息、航天、星际远航准备，生产年门槛为 `[0,200,800,1800,3500,6000,9000,12000,16000,21000,28000,40000]`，默认 `developmentRate=1`。更高等级扩大活动与储存温区、改善保护/韧性；这是一套游戏抽象，不能拿总年龄当科技生产年龄。原版即时判定兼容选项仍存在。

日志只保留少量最近记录（内部约12、界面约6），罕见三日/连珠等天象有停留和冷却，另有文明出生/死亡与50年延续里程碑；不是每次普通飞星都刷屏。事件是结构化对象 `{id,type,year,detail}`，模拟内事件队列有限约100条。`window.threeBody.subscribe(type, listener)` 返回取消订阅函数，可扩展通知/记忆，不应让 UI 直接修改模拟数组。

宇宙和文明排行各显示前五，包含当前运行条目，文明命名“宇宙N · 文明M”。`run-statistics.js` 负责累计显示年、单宇宙年龄和文明年龄；要测试暂停、刷新、重启、P5 和全清理，防止重复结算。

## 6. 视觉、视角与设置

原纹理来自 `.tex` 首 mip 转换并有原输出哈希；银河/星云背景包含原生8192×4096的 WebP，并非上采样。太阳/行星纹理保留原尺寸。`renderer.js` 使用 Three.js 球体（96×64）、径向柔光贴片和后处理近似；前景尘埃是小而清晰的无光晕粒子。不要无关修改效果、默认背景或颗粒。

默认设备像素比渲染，可选8K超采样，最高7680×4320并受GPU纹理/渲染缓冲限制。原 v0.6.1已有8K相关证据；本次新验证实际解码了8192×4096纹理，不声称重新跑过8K全尺寸帧缓冲性能测试。软件 SwiftShader 的帧率不代表真实显卡表现。多张8K贴图和后处理可占较多显存，建议先降渲染像素比、尘埃/后处理，不改物理步长。

默认相机位置固定；`FixedDisplayFrame` 使用每个宇宙初始质心。可选 `displayReference:'barycentric'` 只在显示上使用全质量质心，无最近恒星对跟踪，不改物理位置和诊断。旧 `centerOnSystem` 已弃用并规范化为 false。

默认鼠标悬停转动，同时左键拖拽；灵敏度0.12、拖拽倍率5，可调；偏航惯性不设最高速度上限、俯仰约±30°。闲置2秒后用最短偏航方向缓慢回银河亮部，默认0.006°/秒。旋转环默认0.3倍尺寸、约12%不透明度、0.65秒淡入/0.18秒淡出。沿用当前防反弹/惯性处理，修改前先读 `view-motion.js` 测试，不要恢复会在松手后反向回弹的旧逻辑。

轨迹来自接受物理步，不靠重复渲染相同点。每体最多4096原始样本、一次最多512排空；按屏幕弧长、转弯/交叠复杂度裁剪，简单轨道保留更长历史，复杂轨道缩短，最多1999GPU线段。连续带状共享顶点避免早期点状接头与高速分段，不要换回叠加透明 line-segment 导致亮点。

**设置结构**：220个唯一控件=183原始可操作属性+27扩展+10布局坐标。17项快捷，其余203按七类放在全部设置。圈叹号悬停/聚焦解释，触摸可点；滑条与无边框数值同一行相互同步；搜索和中英文导航覆盖全部项。

以 `settings-layout.js` / `settings-descriptions.js` 为唯一布局/说明来源，生成 `docs/settings-guide.html`。`SETTINGS-GUIDE-v0.5.md` 名字是历史文件名，内容会由当前构建更新，不意味着运行版本倒退。`newproperty...` 等原始键不宜重命名；原引力指数2等固定键有显式禁用语义。

修改默认值需同时检查 `settings.js` 范围/归一化与迁移；现有 `presentationRevision=6`、`physicsRevision=1`、`galaxyReturnRevision=2` 有一次性迁移含义，不要无差别升迁移号覆盖用户保存值。旧设置缺控制模式时默认升级到V2，显式旧模式保持；旧档案缺模式时按旧物理回放，不能把两种缺省规则混在一起。引擎算法ID中的v055字样是兼容代号，不等于产品UI版本。

## 7. 保存、档案与可扩展接口

| 保存位置 | 内容及边界 |
|---|---|
| localStorage `three-body.settings.v3` | 当前设置；支持旧v2/v1迁移 |
| localStorage `three-body.statistics.v1` | 宇宙计时、文明排行等跨刷新检查点 |
| localStorage `three-body.reset-pending.v1` | 全清理中断保护，防止刷新重新读回旧记录 |
| IndexedDB `three-body-observatory` v1 / `history` | 文明档案，以key索引，包含设置、实际初始化四体、死因、寿命等 |
| 同数据库 `assets` | 自定义背景本地持久化 |

普通刷新会结算上一段并开始下一个宇宙编号，**不是恢复精确的在途物理状态**。档案“复现”是按初值/设置重跑；未完整记录运行中所有改参时间线，温度全局相位等也有边界。`v2-checkpoint.js` 能完整恢复模拟/RNG，主要用于研究/Node，但没有自动成为浏览器跨刷新续跑产品功能。

“新宇宙”保留历史；“恢复设置默认”只改设置；“完全重置历史”清空宇宙/文明记录和排行，保留设置/背景。测试清理流程须覆盖 IndexedDB失败/刷新中断，不要仅清一个 localStorage键。浏览器和 WE 可能是不同 origin/浏览器存储，历史不会自动互通；导出后再迁移。

公开浏览器接口：`window.threeBody.version`、`getState()`（克隆快照）、`applySettings(patch)`、`subscribe(type, callback)`。常见事件：`civilization:birth/death/phase/level`、`planet:damaged/destroyed/respawn`、`physics:deflect/capture`、`system:escape/stellar-contact`、`universe:restart`。新增系统通知、文明记忆、线上Seed排行应挂在领域事件/存储边界，不污染积分器。当前没有系统通知权限申请、云同步、账号或线上榜单，不能把本地排行说成服务器排行。

## 8. Wallpaper Engine 集成与本次包适配

`bridge.js` 安装 `wallpaperPropertyListener.applyUserProperties`（属性对象中的 `.value`，允许仅部分键）、`applyGeneralProperties`（FPS10–144）、`setPaused`；`audio.js` 一次注册 `wallpaperRegisterAudioListener`，处理左64/右64共128频谱值。浏览器音乐需要主动点击，系统频谱不能用随机数冒充。自选背景支持 WE 文件路径 `file:///` 转换。

标准构建的元数据继承大量 Scene 分组/说明，不能直接假定它们都是 Web 原生属性类型。本次 `tools/delivery/package-we.py` **仅适配交付元数据**：

- 保留185个文档支持的 Web 可操作属性，移除50个原生Scene专用分组/说明；网页面板220项保持完整。
- 根 `project.json` 为 `type:web` / `file:index.html`，引用本地 `preview.jpg`；开启 `supportsaudioprocessing`。
- 标题标注v0.6.1、保留来源声明，移除原Workshop标识。
- 去掉 `.openai` 私有站点配置和仅构建用的 `assets/original-project.json`；未删运行纹理、音频、字体。
- `app.js`、`app.css`、实际入口引用的 `style.css`、`index.html` 与实际 `dist/` 逐字节一致；资产输出逐一与原资源 manifest 哈希核对。
- 所有纹理（包括可选背景）、FLAC音乐、字体、Three.js和Worker代码都在包内，无在线加载依赖。

导入步骤见单独 README：解压到专用文件夹，WE“创建壁纸”打开根 `index.html`，或将完整文件夹复制到新建的 `projects/myprojects/` 项目。若编辑器重新生成元数据，检查属性/预览是否保留，在新项目中恢复提供的 `project.json`，不要填回原作者Workshop ID。

官方说明：[Web开始](https://docs.wallpaperengine.io/en/web/first/gettingstarted.html)、[属性](https://docs.wallpaperengine.io/en/web/customization/properties.html)、[音频](https://docs.wallpaperengine.io/en/web/audio/visualizer.html)、[发布界面](https://docs.wallpaperengine.io/en/scene/first/publishing.html)。只导入运行包文件夹，别把整个仓库拖进编辑器。

当前Linux环境没有 Windows/WE/Steam客户端，原生宿主和实际Workshop提交**未验证、未执行**。本机Chromium的 `file://` 被管理策略拦截（`ERR_BLOCKED_BY_ADMINISTRATOR`），没有绕过策略；通过解压后本地HTTP+网络拦截完成离线功能验证和WE回调模拟。这是技术交付与验证边界，不把HTTP回调测试说成CEF实机验收。不同CEF的Blob Worker、WebGL2、结构化克隆、自动播放和文件权限仍需Windows实测。

## 9. 研究成果、位置与可信度

### 9.1 阅读顺序与分支

1. `docs/SOURCE-AUDIT.md`、`docs/scene-bindings.json`：原版公式、183属性、脚本绑定与移植边界。
2. `docs/REFERENCE-MODEL.md`、`docs/CIVILIZATION-UPDATE.md`：纪元/天象/行星/文明拆分和韧性。
3. `docs/v052/RESEARCH_FINAL_REPORT.md`、`docs/v052/ACCEPTANCE.md`：牛顿修复研究引用与产品独立验收，原始输出 `docs/v052/results/`。
4. `docs/releases/v0.6.0/SOURCE_REVIEW.md`、`INTEGRATION.md`、`TEST_RESULTS.md`：V2选择性正式移植、差异、兼容和成本预算。
5. `docs/releases/v0.6.1/RELEASE.md`、`TEST_RESULTS.md`：设置改造和物理/视觉源码一致性。
6. 本次 `docs/delivery/2026-11-09/`：新交付测试；其中 `research-reference/` 保存最新研究结项报告小型副本。

远程研究并非运行包依赖，按需独立 worktree 读取，避免整分支合入产品：

| 分支/提交（本次读取） | 内容 |
|---|---|
| `research/newtonian-survival` / `c1980201d11c7d0968d9039bfca4ad91383b27b0` | 早期纯牛顿/初始化研究，根 `FINAL_REPORT.md` 及实验数据 |
| `research/minimal-chaos-control-v2` / `bf21f3033eb0d09a71e7673898d47a240c8dff16` | 研究算法与原生试验，`docs/research-v2/SCIENTIFIC_REPORT.md` 等 |
| `integration/minimal-chaos-control-v2` / `9e5360baec0191c2b6936aebe51d3d749cede30a` | JS研究集成、确认、h8及最终结项文件 |

在 integration 分支重点文件：`docs/integration-v2/JS_CONFIRMATION_RESULTS.md`、`INTEGRATION_REPORT.md`、`JS_PRECISION_H8_PROTOCOL.md`、`JS_H8_RESULTS.md`、`STATUS.md`。**最新状态以 `FINAL_REPORT_20261102.md` 及 `final-report-20261102/{summary.json,h8-matched104.csv,provenance.json}` 为准**；较早记录“仍在跑/未合并”只说明当时研究阶段。

不可变研究入口：

- https://github.com/BillOu0104/2/tree/9e5360baec0191c2b6936aebe51d3d749cede30a/docs/integration-v2
- https://github.com/BillOu0104/2/blob/bf21f3033eb0d09a71e7673898d47a240c8dff16/docs/research-v2/SCIENTIFIC_REPORT.md
- https://github.com/BillOu0104/2/blob/c1980201d11c7d0968d9039bfca4ad91383b27b0/FINAL_REPORT.md

### 9.2 各实验的结论不能混用

**早期牛顿研究**：在匹配128种子/1000显示年等协议中，Q1+0.12D逆向初始化提高受限平均存活约146.22→244.37年、恒纪元约2.90%→21.20%，但仍只有6/128行星、5/128完整三星期末存活。这支持修正力/初值，不证明无控制长期稳定；产品 v0.5.2独立测试另见 ACCEPTANCE，不能冒称同一次实验。

**JS h4确认**：128个独立新Seed、两模式、每个100000显示年，共256期末结果/1024窗口。两模式三星完整128/128；严格混沌 deflect118/128、reflect124/128；成熟恒纪元均值约33.99% /19.08%，严格混沌子集约31.16% /16.71%。deflect绝对控制功约47.42|E0|，触发帧约0.002228%；不能只报触发稀少而称成本微不足道。原行星存活只有1/128（reflect2/128），原文明0/128，长期连续展示依赖P5，不是同一行星文明从未死亡。

**原生研究h4**：另128种子，牛顿4/128完整三星、牢笼3/128，deflect128/128（严格混沌122/128、成熟30.91%），reflect128/128（126/128、15.26%）。不是JS队列，不能合并样本数或互换均值。

**h8最终状态：`CLOSED_BY_USER_PARTIAL_H8`**。用户在2026-11-02要求停止未完成的剩余研究。已完成Seed0–103，共104/128匹配Seed、208/256期末结果、832/1024窗口；24个Seed/48期末/192窗口缺失，不按失败、成功或UNKNOWN填补。

- 104个已完成Seed：两模式三星完整104/104，严格混沌 deflect103/104、reflect102/104；成熟恒纪元均值37.8828% /18.7060%。
- 相同104个Seed的h4成熟均值32.9293% /19.3905%，差+4.9536pp /−0.6845pp只作描述，不是完整固定128配对等价检验。
- 先前32匹配Seed的h8−h4成熟差：deflect+8.0962pp，95%区间[−7.2779,+22.9494]；reflect+1.6574pp，[−6.3942,+9.1501]。两者均没通过预注册±5pp等价标准；区间含0不等于等价。
- 状态仍为 **NUMERICAL_REVIEW_REQUIRED**，不能宣称统计已经收敛、h8全部完成或高精度风险已清除。

最终报告留有历史进程/恢复线索，但**不是重新启动指令**。不要自动恢复缺失Seed，不要杀未知旧环境worker，不要修改冻结数据。若未来用户另行授权研究，建立新协议、记录代码/队列/窗口/缺失处理和置信区间，再执行。

本次没有新跑长期物理实验。生产新增 `vectorImpulse` 不会回填旧研究漏测成本；新统计必须明确算法、步长、初值、Seed队列、控制/P5状态和口径。

## 10. 开发、测试、构建和打包

### 10.1 从源码运行

```sh
git clone https://github.com/BillOu0104/2.git
cd 2
git fetch origin --tags
git switch --track origin/release/v0.6.1-settings  # 或使用本次delivery分支阅读HANDOFF/工具
npm ci
npm run build
npm start
```

打开 `http://localhost:4173`。`npm run dev` 会构建一次再启动服务，**没有自动HMR监听**；改源码后重新构建并刷新。`dist/` 是构建产物，不直接编辑 `app.js`/CSS。改本文件所述交付脚本须切到 `delivery/we-handoff-20261109` 或未来已接收该文档的分支。

### 10.2 测试命令

```sh
npm test
node --test --test-isolation=none --test-reporter=tap tests/*.test.js
npm run build
python tools/records.py check
PORT=4181 npm start
# 另一终端（需要系统Chromium，可用CHROMIUM_PATH覆盖）：
V061_TEST_URL=http://127.0.0.1:4181 V061_RESULT_DIR=/tmp/v061-check node tools/v061/settings-browser.mjs
```

默认Node24隔离运行器汇总18个文件，展开的单进程TAP是152项；两者不是170个独立测试。Playwright-core不自动下载浏览器。网络受限云环境遵循 cloud runtime skill 的代理/CA/沙箱要求，不改系统网络策略、不过度输出凭据。

现有 `tools/v053/`、`v054/`、`v055/`、`release-v2/`、`v052/` 有版本专用回归/基准。部分脚本硬编码旧版本，例如 `tools/release-v2/browser-check.mjs` 期待0.6.0，不要不加说明地拿它跑0.6.1然后误报产品失败。需要新版本回归时加新包装脚本并记录差异，保留旧输出。

本次新增测试：`tools/delivery/verify-offline.mjs`，读取 `WE_PROJECT`（运行目录）和 `WE_QA_RESULTS`（新结果目录），只服务127.0.0.1:4184，拦截外部HTTP请求，验证真实BlobWorker、全部185原生属性、暂停/FPS/128频谱回调、FLAC真实点击播放、16:9/21:9画面。可选 `WE_PREVIEW=1` 把预览截图写到项目根。它单独记录被策略阻止的file入口，不把它计为通过；Linux HTTP成功也不等于Windows原生验收。

### 10.3 重建干净运行包

交付工具在本分支，使用**全新绝对路径**，拒绝覆盖旧ZIP/阶段目录，防止破坏交付证据：

```sh
npm ci
npm run build
python tools/delivery/package-we.py --prepare /tmp/trisolaris-project-new
WE_PROJECT=/tmp/trisolaris-project-new WE_QA_RESULTS=/tmp/trisolaris-stage-check WE_PREVIEW=1 node tools/delivery/verify-offline.mjs
python tools/delivery/package-we.py --project /tmp/trisolaris-project-new --zip /tmp/three-body-v0.6.1-wallpaper-engine.zip
```

随后解压到另一新目录，校验CRC、每个文件SHA256，再对**解压目录**跑 offline 和 settings-browser；只测原stage不能排除漏打包。脚本目前明确固定v0.6.1元数据、2026-11-09时间戳和来源SHA；未来版本必须显式更新来源/日期/文件名并重新验收，不能把旧provenance套新包。预览是动态现场截图，重新截图后ZIP哈希可不同；给定相同stage内容，排序和时间戳是确定的。

交付目录不要带 node_modules/.git/src/tests/tools/records/research/.openai、大型CSV/JSON或缓存。资产清单、小型设置手册、许可证、运行配置与预览是运行交付必要内容。本次 ZIP CRC 与原资源输出SHA都通过；逐字节匹配应用bundle/CSS/HTML，运行源码指纹与ea50相同。

### 10.4 归档、提交、推送

所有修改先在独立worktree/分支，保护现有脏工作区。先提交实际修改，再归档真实提交：

```sh
git add HANDOFF.md README.md docs tools
git commit -m "docs: package v0.6.1 Wallpaper Engine handoff"
python tools/records.py capture --kind analysis --id UNIQUE-ID --ref HEAD --previous PREVIOUS-SHA --title '本次任务' --summary '代码版本、做了什么、测试和限制'
python tools/records.py check
git add records
git commit -m "docs: archive delivery evidence"
git push -u origin YOUR-BRANCH
```

不要复用旧record ID、覆盖历史结果或把新测试称为旧版本当时的测试。`tools/records.py` 本次增加根HANDOFF的归档选取；运行代码指纹没有变化。归档README的“未重跑该版本”指工具生成的历史快照不是再次执行，实际本次新测试以日期报告和原始输出为准。

CI `.github/workflows/physics-acceptance.yml` 跑Node22单测/构建；records工作流检查档案。push触发有分支过滤，`delivery/**`不自动等于已跑CI；PR/手动触发另核实。Pages工作流是手动，不把推main当私有站点发布。

### 10.5 预览与发布分开处理

GitHub是源码/记录默认上传点。原私有站点仍是默认预览入口；需要明确更新网页时用 Sites 既有项目发布，不能另建公开站点或默认改Pages。部署须核对站点取到的代码版本、权限和实际URL，凭据使用环境/连接器，不写进仓库。历史Sites项目ID见既有站点发布记录，不要凭旧环境目录推断当前可用性。本次只上传交付文件，不刷新该站点。

Workshop 发布必须在用户Windows/Steam里完成原生测试与作品资料/可见性选择。本次不冒充已执行Steam上传。推荐先本地导入/设为壁纸/改属性/暂停/多屏测试，再决定发布；详细操作在交付README。

## 11. 本次验证与现存限制

新结果完整位于 `docs/delivery/2026-11-09/results/`，同目录报告 `TEST_RESULTS.md`，不是重写旧研究。已完成构建、152自动测试，真实浏览器对stage和ZIP解压目录的离线检查，以及设置界面回归；原失败/策略限制输出均保留。ZIP及文档哈希以交付 `MANIFEST.json` / `SHA256SUMS.txt` 为准。

仍未解决或尚未验证：

1. h8长期统计没有通过等价/收敛标准，且按用户要求已停止；控制功可能很大，不能宣传无代价稳定。
2. P5注入外部质量/动量，固定初始中心画面可能漂移；可选显示参考系不修复物理预算。
3. 真实Windows WE/CEF、file入口、系统音频采集、原生多屏/睡眠唤醒、Workshop提交未实测；本机file探测被管理策略阻断。
4. WebGL2/8K纹理与后处理有显存/硬件兼容成本；本次软件浏览器只证明功能，不代表用户GPU帧率。
5. 原版资源授权/音乐再发布权须用户核实；不是仓库代码可构建就自动获权。
6. 浏览器刷新不是完整物理续跑，档案回放不是记录全部运行期改参的时间线；存储可能受浏览器配额/私密模式影响。
7. 通知、文明长期记忆、在线Seed排行榜/云同步仍是扩展方向，没有后台服务实现。
8. v0.6.1 PR仍draft，main仍0.6.0；下个Agent先核对分支/发布状态，别从main打出旧UI后标成0.6.1。

## 12. 历史脉络与后续开发顺序

完整索引 `records/index.json`、`records/README.md`；旧源码 `history/sites-v0.1-v0.5`。每个record含来源提交、前序、SHA256和只读快照，不是可直接运行的第二个工程。阅读时相对路径以原提交根目录为准。

| 阶段 | 关键变化 | 证据入口 |
|---|---|---|
| v0.1 | 解包/Source Audit、原属性/纹理/脚本移植 | `records/versions/v0.1.0/` |
| v0.2–0.3 | 韧性、天象/纪元分层、8K背景与视觉 | `docs/CIVILIZATION-UPDATE.md`、`docs/REFERENCE-MODEL.md`、对应records |
| v0.4–0.4.2 | 时钟/排行、脱水阶段、布局、混沌初值、灵敏度/粒子 | `records/versions/` 对应版本与hotfix |
| v0.5–0.5.1 | 人口/科技、一个月恒纪元、GitHub/预览分离 | 对应records |
| v0.5.2 | 平方反比/积分/初始化修复、独立基准 | `docs/v052/`、`research/newtonian-survival` |
| v0.5.3–0.5.5 | 科技放慢、回归/反弹、全清理、固定显示中心、连续尾迹 | `docs/v053/`、`v054/`、`v055/`、`fix/v0.5.5` |
| v0.6.0 | 选择性正式移植deflect-v2/h4/P5、预算和回退 | `docs/releases/v0.6.0/` |
| v0.6.1 | 17快捷+203分类、圈叹号帮助、同行滑条数值 | `docs/releases/v0.6.1/` |

旧main回滚标签 `rollback/main-before-deflect-v2-20261026` 解引用到 `c7a53a01def5f9d60389ee20ec0f8bac5210ed69`，是当时main的旧v0.5.1，**不是完整v0.5.5**；v0.5.5基线在 `fix/v0.5.5`（本次读取 `8a8eb34224ce1a9cc0576a1615c642d90d76a146`）。任何回滚先核对实际树，禁止凭名称强推覆盖后续工作。

建议下一位Agent：先在Windows完成本包原生WE验收并记录CEF/GPU/多屏/音频，处理确凿兼容问题；再按用户授权审阅v0.6.1 PR和发布流；产品性能优化围绕渲染、快照/缓冲，不降低h4；科学改进另建研究协议，保留冻结对照和真实控制成本。每次工作结束更新本文相关章节、版本记录与测试证据，让后续交接继续摆脱聊天依赖。

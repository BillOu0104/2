# 三体 · 实时演算

基于用户提供的 Wallpaper Engine《三体实时演算》Scene 工程移植。原场景作者 SYKM，音乐 Melodysheep · Ether。此工程保留原资源来源及随附非商用说明。

## 运行

```sh
npm ci
npm run dev
```

打开 `http://localhost:4173`。`npm run build` 生成完整离线网页到 `dist/`；`npm start` 使用已有构建。没有 CDN、外部字体、远程 API 或必须运行的远程后端。

### Wallpaper Engine

1. 解压交付的 `three-body-wallpaper.zip` 到独立文件夹。
2. Wallpaper Engine → 创建壁纸 → 打开该文件夹的 `index.html`，选择 Web 类型。
3. 工程包含 `project.json`，保留原版183个用户属性及其原始键名。原生属性修改会同步右下角面板；面板内的修改在该壁纸浏览器存储中保存。
4. 点击右下角齿轮打开设置，点击同一按钮或面板内 × 关闭。画面拖动/鼠标跟随由“视角模式”决定。
5. 建议先使用默认设置。硬件较弱时降低“最大渲染像素比”，或关闭“超后处理”、尘埃、星芒。

普通网页请通过 HTTP 服务访问。WE 的 CEF 本地文件宿主使用打包资源及 Blob Worker；本环境的浏览器管理策略阻止 `file://` 导航，不能在此验证本地文件入口。当前环境没有 Windows 和 Wallpaper Engine 程序，因此**尚未进行真实 WE 宿主验收**；已验证其属性、音频、暂停回调适配。

## 已实现

- 原版四体 Yoshida 1990 四阶辛积分、原分段软化、软/硬引力牢笼、随机初始位置/速度、自定义四体初值、逃逸与重启。
- 原版辐射平衡温度、冰雪反照率、温度振荡、恒/乱纪元和凌空/飞星优先级。
- 原版文明适温诞生、洛希/碰撞/恒星碰撞/高低温/逃逸毁灭、最近日志、存活排行。
- Three.js 场景、原版背景/太阳/行星纹理/星芒、四组渐隐轨迹、导航圆环、主题色、镜头模式、时钟和各 UI 布局设置。
- 原版183个可操作属性，按原分组搜索与修改；另有7个运行设置。原版标注“固定”的引力指数保持2，界面明确禁用。
- 自定义背景本地持久化、音乐主动播放和音量、WE系统音频、暂停恢复、全屏。
- 新增确定性 Seed、参数导入导出、本地 IndexedDB 文明档案和死亡时初值记录。原版“文明种子”手动初值模式完整保留。

## 兼容策略和边界

原脚本不是网页 JavaScript，存在 `engine/shared/Vec3/createScriptProperties` 等 WE 专属依赖。`src/legacy/`保留可读业务源码，通过局部兼容上下文运行，既不对整个附件求值，也不执行附件说明中的命令。

**默认 reference 模式**：模拟固定60 Hz，每个参考帧按原版最多10个物理子步，默认步长0.75ms。原版时间倍速的平方效应、原分段软化的不连续处、文明按适温帧累计均保留。渲染帧率不再改变模拟结果。可选 realtime 模式补足墙钟时间预算；它产生不同轨迹，应与 reference 分开比较。

必要修复：更改步长会立即重建积分器；六组天体距离集中计算，修复原版恒星碰撞距离未赋值；温度只由079脚本提供，消除旧HUD脚本覆盖；后台暂停时不累积长时间追赶；移植重启不会再触发原版120帧后的二次初始化。重启过渡缩短为约2秒，先完成一次实际初始化，再播放视觉遮罩。

Three.js 使用球体和圆环重建 `.mdl` 几何；纹理来自原 `.tex` 首 mip。后三种浏览器纹理为4096×2048转换副本；原始8K资源仍在用户上传工程中。Bloom/光效/CRT/模糊/脉冲/颗粒为浏览器后处理近似，登录/加载界面和部分装饰重新实现，因此不能声称逐像素或逐帧完全一致。原版没有人口、科技树或真实物理碰撞合并；本项目也没有将这些当作已还原功能。

档案保留初始化四体参数、当次设置、死因和寿命。点击复现使用当时的初始位置和速度；运行中变更参数和温度正弦的全局相位尚未作为完整回放时间线记录。当前排行榜仅为本次会话原版排行，档案跨会话保留，未连接线上Seed榜。

完整来源、公式、默认值、原版缺陷和183项清单见 [docs/SOURCE-AUDIT.md](docs/SOURCE-AUDIT.md)，引擎原始属性绑定见 [docs/scene-bindings.json](docs/scene-bindings.json)。

## 架构与扩展

```text
原版属性 Schema → 设置校验/本地存储 → Worker 消息
                                           ↓
                                Simulation（纯 JS 后端）
                                  原版物理/温度/文明模块
                                           ↓
                       30 Hz 状态快照 + 结构化领域事件
                          ↙                         ↘
                 Three.js + HUD                 IndexedDB 档案
```

模拟内核 `src/simulation.js` 无 DOM 或 WebGL 依赖，可直接在 Node 中运行。默认后台使用 Web Worker，满足独立网页与离线壁纸，也为以后替换 Node 服务或远程计算保留边界。未引入远程常驻服务器，因为当前模拟只有四个天体，离线运行更适合壁纸。

`window.threeBody.getState()` 返回当前快照，`applySettings(patch)` 更新设置；`subscribe(type, listener)` 订阅领域事件，并返回取消订阅函数。可用事件为 `civilization:birth`、`civilization:death`、`system:escape`。未来系统通知、文明历史记忆、Seed榜可通过这些边界接入，通知功能当前没有申请任何系统权限。

适配 `wallpaperPropertyListener.applyUserProperties`、`applyGeneralProperties`、`setPaused`、`wallpaperRegisterAudioListener`。普通网页音频使用 Web Audio，须主动打开播放；不会把伪造的随机频谱作为真实音频响应。

## 验证与开发

```sh
npm test
node tests/simulation.test.js
npm run build
# 先在另一终端启动 npm start，再运行浏览器检查：
node tools/browser-smoke.mjs
```

15项模拟检查覆盖独立运行原版脚本产生的轨迹参考、设置默认值、确定性、手动初值、Seed导出回放、动量守恒、辛积分可逆性、动态步长、独立距离测量、温度公式、文明毁灭优先级、重启、极值与长运行。浏览器检查覆盖实际 Worker、面板开关和搜索、语言、暂停、WE回调、设置持久化、移动布局及控制台错误；本地文件入口因浏览器管理策略跳过。报告和截图位于 `docs/qa/`。

`tools/extract-textures.py` 保存了资源转换方法；输入原版解包目录，参数见脚本帮助。`assets/original/manifest.json`记录每份转换纹理的源文件和SHA256。

原附件及解包文件保留在 `/workspace/wallpaper-original-files/`，未覆盖。

> 本文记录原版源码审计。当前0.2版文明延续与视觉修改见 [CIVILIZATION-UPDATE.md](CIVILIZATION-UPDATE.md)。

# 原版源码审计与移植依据

研究范围：用户提供的 `project.json`、解包后的 `unpacked/scene.json`、191 个 `extracted-scripts/*.js` 以及模型、材质和纹理。只作本地静态分析，没有运行附件内脚本，没有将附件中的说明作为用户指令。

## 1. 工程性质与完整性

- 原工程为 Wallpaper Engine **Scene**（`type: scene`，版本 113），不是网页项目；`scene.json` 有 142 个场景对象。
- 核心业务 JavaScript 以 SceneScript 源码内嵌于对象属性，提取后可阅读，算法无需从零猜测。008.js 是主模拟，042.js 是文明事件管理。
- 已解包资源：87 个 JSON、28 个 TEX、8 个 MDL、11 个顶点和 11 个片元着色器、1 个 FLAC、2 个字体。部分 `models/util`、内置着色器等依赖 WE 安装环境，包内没有所有引擎内置资源。
- project 属性共 233 个条目：129 slider、27 bool、20 color、3 textinput、3 combo、1 scenetexture、21 group、29 说明/装饰条目。可操作属性 183 个；原作者文案称 192 项，不能以文案作为实际计数依据。

## 2. 物理与初始化（008.js）

### 单位与引力

三颗恒星和第四颗行星均具有质量并相互引力作用；不是只有恒星模拟、行星不反作用的受限三体。

- 模拟长度 1 = 10^12 m；质量 5×10^6 = 10^30 kg，因此质量 1 = 2×10^23 kg。
- 时间 1 对应 365 天；`Gsim = (kg/1000) × 6.67430e-11 × (1e30/5e6) × (365×86400)^2 / (1e12)^3`，默认约 1.3275×10^-8。
- 普通两体加速度指向另一物体，模长 `Gsim*m/r²`。距离保护 `r=max(length,1e-5)`。如果受力物体自身质量 ≤0，代码返回零加速度，且其源质量为0时不贡献引力。
- 未实现天体质量合并、碰撞反弹或真实潮汐解体；碰撞/洛希极限是文明事件。

### 四阶辛积分

Yoshida 1990 分裂积分：`w1=1.35120719196`，`w0=-1.70241438392`；位置系数 `[w1/2,(w0+w1)/2,(w0+w1)/2,w1/2]`，速度系数 `[w1,w0,w1]`，按 P-V-P-V-P-V-P 更新。

基础固定步长 `step/1000` 秒，默认 0.00075。实际积分步长为 `ktime² × fixedStep`。每个速度阶段重新计算质心和全部相互作用。渲染对前后物理状态插值，全部对象与轨迹相对当前物理质心展示；镜头旋转只作用于渲染坐标。

### 分段引力软化

令软化距离 `rs=ras`、`k=kSoft`、`β=3/(k−1)`、`α=1−β`：

1. `r≤rs`：`a=G*m*r/rs³`。
2. `rs<r<k*rs`：`a=(α+β*r/rs)*G*m/r²`。
3. `r≥k*rs`：`a=G*m/r²`。

这是原实现中的具体公式，应直接保留算法出处，但不能据注释认定它严格光滑或守能：在 `r=k*rs` 左侧因子为4，边界外立即为1，存在不连续。精确兼容模式可保留，修复模式应单独版本化，避免同一 Seed 隐式改变。

### 引力牢笼

以四体质量质心为中心，方向向量指向质心。

- `r≤re`：模长 `−k1*G*Mc*(1−(r/re)²)²`，负号产生向外斥力。
- 中间中性区：0。
- 软牢笼 `r>rc`：`k2*G*Mc*(r−rc)^n`，向内拉回。
- 硬牢笼 `rc<r<Rc`：`k2*G*Mc*(r−rc)/sqrt(max(Rc²−(r−rc)²,1e−5))`。
- 硬牢笼 `r≥Rc`：`100*k2*G*Mc`。

硬牢笼是强向心加速度，原版不做位置钳制或速度反弹。

### 初始化、重启与轨迹

- 随机初始化每个天体每个坐标独立 `(Math.random()−0.5)*xcxc`，速度独立 `(Math.random()−0.5)*vcvc`。没有球壳采样、质心归零或总动量归零。
- 原版所谓文明种子是可分享的四体初始位置、速度、质量参数；没有数字字符串 Seed 对应的确定性 PRNG。增加可复现 Seed 是扩展，应保留手动参数模式。
- 任一天体距离质心 > `DD` 即逃逸；004.js 控制自动或手动重启。008.js 重启触发后先做约120帧延时，再重新取随机/自定义初值；过渡动画总计约400帧。
- 轨迹是四组最多400点的图层对象池，存储的是**各历史时刻相对质心**的位置，每渲染帧采一点、透明度由旧到新从0至1、尺寸从 start 至 end。400上限来自 WE 的2048图层限制，Three.js 应改用 BufferGeometry 环形缓冲。

## 3. 温度与纪元

### 有效温度（079.js）

从三颗恒星到行星距离 `d14,d24,d34` 算热量：

- `dAU = max(d,0.01) × 1e12 / temperatureDistanceFactor / 1.496e11`。
- `flux = Σ 1361 * luminosity[i] / dAU[i]²`。
- 基础反照率0.3；先计算 `Tbase=(flux*0.7/(4*5.67e−8))^(1/4)−273.15`。
- 若 `Tbase<0`，反照率变为 `0.3+0.3*min(1,−Tbase/20)`，表示冰雪反馈。
- 最终 `T=(flux*(1−albedo)/(4*5.67e−8))^(1/4)−273.15+10*sin(engine.runtime)`，钳位[-270,1500]，两位小数。
- 这是瞬时平衡温度，没有大气温室、热容、季节或温度惯性。默认温度距离倍数7，恒星光度[1.5,0.5,0.1]，因此并非真实距离下的精确适居模拟。
- 077.js 在温度标题更新中还写入旧经验温度公式，079.js之后覆盖。移植只应保留079.js作为权威模型，消除共享状态写入顺序依赖。

### 状态分类（072.js、075.js）

优先级：凌空 > 飞星 > 恒纪元/乱纪元。距离小于0.3的恒星数量决定巨日/双日/三日凌空；温度低于−70且距离大于2的数量决定飞星/双飞星/三飞星；否则温度位于[-55,70]为恒纪元，其余为乱纪元。

脱水/浸泡（075.js）另有固定[-50,70]阈值，不随恒纪元设置同步，是原版不同逻辑。074.js 按温度蓝白红渐变，[-10,10]为白色。

## 4. 文明和事件（042.js）

原版文明演化是“适温累计—文明启动—事件毁灭”的状态机，没有人口、技术等级、资源经济或文明 AI。不要把新增的科技树冒称为已还原算法。

- 默认当前编号1，尚未存活。温度在耐受区间[-100,200]且没有重启事件时，每次 `update` 增加适温计数；计数达到50就诞生。注意是50帧，不是50年、50个日志间隔。
- 毁灭按优先级处理：逃逸重启跳变、洛希极限、行星碰撞、恒星碰撞、温度越界。默认洛希距离0.21、碰撞0.2，因此同一接近事件通常先报“大撕裂”。
- 凌空和飞星本身不直接毁灭；若其同时伴随高/低温毁灭，则用凌空/飞星名作为死因。
- 文明死亡记录 `{number,lifespan,destructionEvent,text}`，编号自增。`text`是真实性检查标记；并不记录完整初始 Seed、配置或历史物理状态。
- 事件名称发生变化时，在达到5年日志间隔或文明状态变化时记日志，屏幕最多保留最近5条。记录死亡文明按寿命降序，仅显示前6名。全部状态仅保留进程内存，没有磁盘持久化或联网排行榜。
- 年份（010.js）：每帧 `counter+=(kt/10)*ktime`，显示年数 `(kt/10)*counter*ktime/60`，因此两个系数均重复作用。默认60帧约1年，受帧率影响。科学计数法在1亿年开始。

## 5. 引擎依赖、视觉与交互

### 不能直接在浏览器运行的接口

`createScriptProperties`、`Vec3`、`shared`、`engine.runtime/frametime/screenResolution/registerAudioBuffers`、`input.cursorScreenPosition/cursorWorldPosition`、`thisScene.createLayer`、SceneScript `init/update/applyUserProperties/cursorDown/cursorUp/cursorClick`、WEColor、内建材质和后处理管线。

建议保留算法函数为纯 JavaScript，使用独立 Worker 模拟；渲染由 Three.js 接收快照；WE Web 壁纸接 `window.wallpaperPropertyListener` 与 `wallpaperRegisterAudioListener`。无需常驻远程服务器即可支持独立网页和离线壁纸，也可使相同纯模拟模块被 Node 后端复用。未来通知、历史、排行榜以事件订阅器接入。

### 视觉布局

- 黑色深空、球形天空盒（默认8K / 6K / 自定义 / 纯色），尘埃两层、可选星云。
- 三颗发光恒星（默认半径0.03/0.023/0.016），第四颗较小行星（0.01），恒星星芒叠片，四种可配置轨迹颜色。
- 主题蓝色 `[0.59216,0.76471,1]`。字体 Rajdhani Medium 负责时钟/数字，方正铁筋黑负责部分星期，Arial负责多数文本。
- 中央上方为时钟、星期、日期；左侧为纪元、脱水状态、温度；右侧为三条行星距离映射和 α/β/γ 标签；上部文明日志及可开关寿命排行；底部运行年份和音频响应装饰线。
- 导航罗盘为倾斜赤道圆环，天体附有OL括号/位置信息与银河系路径标签。圆/方框装饰可选。
- 入场和重启包含黑屏、虚构账号登录、加载信息、打字机文字、延时淡入与镜头8秒过渡。这些是视觉效果，无实际登录或后端账号。
- 原版点击时钟显隐菜单；本次用户明确要求改为右下角统一设置按钮，应该覆盖原版该入口行为。
- 鼠标三种模式：0拖动带惯性，1平滑跟随，2不响应；自转独立可开。X旋转钳位[-30,30]，Y无限旋转。FOV默认50，镜头距离可调。
- HDR bloom 默认强度4、scatter2；后处理串联 godrays、pulse、radial blur、CRT、filmgrain。需要 Three.js postprocessing 对应实现；WE shaders依赖宏/内置变量，不能原样编译。
- 音频106.js使用16频段，低频1–6、中频7–11、高频12–15，log压缩、0.05平滑、0.7门限；普通网页需要用户主动选择音源，WE可用系统音频回调。

## 6. 必须明确的移植风险

1. **帧率依赖**：0.75ms步长每帧最多10步，60FPS最多积7.5ms物理时间，积压永久增加，最终插值恒为1。稳定移植应使用统一模拟时钟、足够子步预算和暂停恢复策略；与原版墙钟轨迹不会逐帧一致。
2. **步长设置失效风险**：`FIXED_TIMESTEP`为模块顶层常量，属性改变虽然重置系统，却不重新赋值固定步长。应修复为运行配置值。
3. **原版恒星碰撞分支很可能不可达**：全体191脚本中只有042.js读取`shared.d12/d13/d23`，未找到赋值；只有084/087/090计算星行距离。移植应集中计算全部六组距离。
4. **UI和模拟耦合**：温度和文明读取UI距离条脚本计算的距离，以及旧温度标题脚本共享状态；可能发生前一帧/未初始化值。应把全部测量移入模拟核心，不依赖组件是否显示。
5. **参数不连续与零值**：软化边界存在跳变；project允许ras=0、全部质量=0等极值。应对NaN/Infinity、无质量、softening=0、牢笼半径逆序做保护。
6. **日志与生存统计是按帧检测**，Seed公平比较需明确固定采样率、算法版本与全部配置。
7. **资源格式**：`.tex`需解码首mip，`.mdl`不能作为Three.js模型直接加载。简单球体/圆环可以程序构造；纹理可复用，WE特效需移植。
8. **来源信息**：project自带作者SYKM、workshop 3509243656和“未经许可，请勿商用”资产说明。该说明作为来源/许可元数据保留；本地研究与用户已授权开发继续进行，外部发布和商业使用范围应另行确认权利。

## 7. 资源复用记录

转换脚本：`tools/extract-textures.py`，支持当前包 TEXV0005/TEXB0004首mip、LZ4、DXT1、DXT5、RGBA以及嵌入PNG。输出至 `/workspace/sites/three-body/assets/original`，每份转换资源由 `manifest.json`记录输入SHA256、原始尺寸、格式、输出SHA256。

优先纹理：B8k、BB8k3、st2（背景候选），sa3（恒星星芒），0sun、0aun（太阳球面候选），0dq（行星球面候选）。字体可直接使用本地原文件。资源语义应以相应 `materials/*.json`和`materials/models/**/*.json`的纹理绑定验证，不能仅凭文件名猜测。

## 8. 属性完整清单

下表由原版 `project.json`实际解析生成。应用必须区分可操作属性与说明/分组，并优先使用此处默认值，再通过scene脚本绑定映射到算法参数。`scene`中的`value`常是旧编辑器回退值，脚本声明默认也可能不是最终默认。

| 属性键 | 名称 | 类型 | 默认 | 范围/选项 |
|---|---|---|---|---|
| `schemecolor` | ui_browse_properties_scheme_color | color | 0 0 0 |  |
| `cnen1` | CN/EN | bool | True |  |
| `customtex1` | T1： | textinput | <Body,3> |  |
| `newproperty58` | T2： | textinput | 哥白尼 |  |
| `newproperty59` | T3： | textinput | * * * * * * * * |  |
| `cnen2` | 语言 Language: EN ☑ / 中文 ☐ | bool | False |  |
| `newproperty61` | 视角模式Rotate Modes | slider | 1 | 0–2 |
| `datacolor` | 主题颜色 Theme Color | color | 0.592156862745098 0.7647058823529411 1 |  |
| `newproperty71` | 视场 | slider | 50 | 40–65 |
| `newproperty17` | 背景选择 BG Settings | combo | 4 | 1=默认 6K; 2=纯色 Pure color; 3=自定义 Custom; 4=默认 8k |
| `custombg` | 自定义贴图 Custom BG | scenetexture |  |  |
| `newproperty50` | 自定义☑ / 随机☐ - 种子Custom☑ /Random☐ - SEED | bool | False |  |
| `autorestart` | 自动重启 Auto Restart | bool | True |  |
| `newproperty60` | 引力牢笼Gravity Cage | bool | True |  |
| `distance` | 镜头距离  Cam Distance | slider | 0 | -4–4 |
| `newproperty13` | D 逃逸重启距离 Escape Dist | slider | 6 | 4–20 |
| `newproperty14` | 轨迹开关 Trail On/Off | bool | False |  |
| `menuinit` | 菜单默认打开 Menu init | bool | False |  |
| `compass` | 导航罗盘 Compass | bool | True |  |
| `newproperty38` | 文明状态 Civ Status | bool | True |  |
| `newproperty39` | 文明排行 Civ Rank | bool | False |  |
| `newproperty2` | 超后处理 Post Process | bool | True |  |
| `newproperty16` | 镜头自转 Auto Rotate | bool | True |  |
| `brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality` | 星云(需后处理品质超高) Nebula (requires post-processing, ultra-high quality) | bool | False |  |
| `dust` | 尘埃粒子 Dust | bool | True |  |
| `clock` | 时钟组件 clock widget | bool | True |  |
| `audioresponse` | 音频响应 Audio Response​​ | bool | True |  |
| `newproperty6` | UI 装饰形状 Decor1 | combo | 1 | 1=圆 Round; 2=方 Square; 3=无 None |
| `newproperty4` | UI 装饰线 Decor2 | combo | 4 | 1=装饰线1; 2=装饰线2; 4=无 |
| `newproperty65` | 天体位置信息 Celestial information | bool | True |  |
| `cheatingcheck` | 物理真实性检查 Cheating check | bool | False |  |
| `timespeed` | 时间倍速 time speed | slider | 1 | 0.1–3 |
| `_110` | M1 恒星质量 Star Mass | slider | 5000000 | 0–100000000 |
| `_26` | M2 恒星质量 Star Mass | slider | 5000000 | 0–100000000 |
| `_34` | M3 恒星质量 Star Mass | slider | 5000000 | 0–100000000 |
| `newproperty8` | m 行星质量 Planet Mass | slider | 5000 | 0–100000 |
| `newproperty66` | 硬牢笼 | bool | False |  |
| `mc` | Mc引力牢笼等效质量 | slider | 15000000 | 100000–100000000 |
| `k1` | k1内区斥力强度 | slider | 0 | 0–1 |
| `re` | re斥力生效半径 | slider | 0.1 | 0.01–0.2 |
| `k2` | k2外区约束强度 | slider | 0.5 | 0–10 |
| `rc` | rc约束生效距离 | slider | 0.2 | 0–6 |
| `newproperty67` | 硬牢笼约束半径(硬牢笼生效) | slider | 2.1 | 2.1–10 |
| `expc` | expc约束指数(软牢笼生效) | slider | 2 | 1–10 |
| `newproperty28` | rs软化距离 Soften Distr | slider | 0.1 | 0–1 |
| `newproperty29` | k软化扩展  Soften Factor | slider | 2.8 | 1.5–5 |
| `newproperty52` | K 引力系数 Gravity Const注意：G_sim=G_real*kg/1000不建议修改 | slider | 1000 | 1–1000000 |
| `newproperty53` | 计算步长 Step Size (ms) | slider | 0.75 | 0.01–10 |
| `newproperty7` | ex 引力指数 Gravity Exp | slider | 2 | 1–3 |
| `newproperty69` | 温度距离倍数(1时拟真) | slider | 7 | 1–10 |
| `_111lum_sun` | 恒星1光度(1=1Lum_sun) | slider | 1.5 | 0.001–10 |
| `_211lum_sun` | 恒星2光度(1=1Lum_sun) | slider | 0.5 | 0.001–10 |
| `_311lum_sun` | 恒星3光度(1=1Lum_sun) | slider | 0.1 | 0.001–10 |
| `brfontcoloraaaaaarandomposrange` | 随机位置范围 Random Pos Range | slider | 2 | 0–4 |
| `newproperty48` | 随机速度范围 Random Speed Range | slider | 0.1 | 0–4 |
| `x11` | x1 恒星位置 Star Pos | slider | 0 | -2–2 |
| `y11` | y1 恒星位置 Star Pos | slider | 1 | -2–2 |
| `z1` | z1 恒星位置 Star Pos | slider | 0 | -2–2 |
| `v1` | vx1 速度 Star Vel | slider | 0.05 | -2–2 |
| `vy1` | vy1 速度 Star Vel | slider | -0.1 | -2–2 |
| `vz1` | vz1 速度 Star Vel | slider | 0 | -2–2 |
| `x21` | x2 位置 Star Pos | slider | -0.866 | -2–2 |
| `y21` | y2 位置 Star Pos | slider | -0.5 | -2–2 |
| `z2` | z2 位置 Star Pos | slider | 0 | -2–2 |
| `vx2` | vx2 速度 Star Vel | slider | 0 | -2–2 |
| `vy2` | vy2 速度 Star Vel | slider | -0.05 | -2–2 |
| `vz2` | vz2 速度 Star Vel | slider | 0.1 | -2–2 |
| `x3` | x3 位置 Star Pos | slider | 0.866 | -2–2 |
| `y3` | y3 位置 Star Pos | slider | -0.5 | -2–2 |
| `z3` | z3 位置 Star Pos | slider | 0 | -2–2 |
| `vx3` | vx3 速度 Star Vel | slider | 0.05 | -2–2 |
| `vy3` | vy3 速度 Star Vel | slider | 0 | -2–2 |
| `vz3` | vz3 速度 Star Vel | slider | -0.05 | -2–2 |
| `x4` | x4 位置 Planet Pos | slider | 0.05 | -2–2 |
| `y4` | y4 位置 Planet Pos | slider | -0.05 | -2–2 |
| `z4` | z4 位置 Planet Pos | slider | 0 | -2–2 |
| `vx4` | vx4 速度 Planet Vel | slider | 0 | -2–2 |
| `vy4` | vy4 速度 Planet Vel | slider | 0 | -2–2 |
| `vz4` | vz4 速度 Planet Vel | slider | 0 | -2–2 |
| `newproperty10` | dt 记录间隔 Log Int | slider | 5 | 1–10 |
| `newproperty26` | Kt 时间倍数 Time Factork=10时：1second=1year | slider | 10 | 1–100 |
| `t` | T诞生时间Birth Time (dt*Kt*n ) | slider | 50 | 1–100 |
| `newproperty44` | 高温耐受Heat Tol ℃ | slider | 200 | 100–500 |
| `newproperty43` | 低温耐受Cold Tol ℃ | slider | -100 | -170–-40 |
| `newproperty46` | 恒纪元高温边界 Stable High ℃ | slider | 70 | 40–100 |
| `newproperty45` | 恒纪元低温边界 Stable Low ℃ | slider | -55 | -70–-10 |
| `newproperty42` | 相撞距离阈值 Collision Dist | slider | 0.2 | 0.001–0.2 |
| `newproperty30` | 凌空距离阈值 Giant Sun Dist | slider | 0.3 | 0.05–0.7 |
| `newproperty31` | 飞星距离阈值 Flying Star Dist | slider | 2 | 1–4 |
| `newproperty41` | 飞星温度阈值 Flying Star Temp ℃ | slider | -70 | -120–-30 |
| `brfontcoloraaaaaarochelimitt` | 洛希极限RocheLimitt | slider | 0.21 | 0.001–1 |
| `backgroundcolor` | BG颜色 Color | color | 1 1 1 |  |
| `newproperty9` | 亮度 Brightness | slider | 1 | 0–2 |
| `newproperty40` | 颜色 Color | color | 0.09803921568627451 0.15294117647058825 0.2 |  |
| `newproperty57` | 亮度 Brightness | slider | 1 | 0–2 |
| `newproperty55` | 颜色 Color | color | 1 1 1 |  |
| `newproperty56` | 亮度 Brightness | slider | 1 | 0–2 |
| `_1dust1size` | 尘埃1大小 Dust1 Size | slider | 0.1 | 0–1 |
| `_2dust1size` | 尘埃2大小 Dust1 Size | slider | 0.07 | 0–1 |
| `_1dust1quantity` | 尘埃1计数 Dust1 Quantity | slider | 0.5 | 0–2 |
| `_2dust2quantity` | 尘埃2计数 Dust2 Quantity | slider | 1 | 0–4 |
| `y5` | y轴灵敏度 Y Sens | slider | 1 | 0–10 |
| `y6` | y轴阻尼 Y Damp | slider | 0.985 | 0.98–1 |
| `x5` | x轴灵敏度 X Sens | slider | 1 | 0–10 |
| `newproperty62` | 鼠标跟随速度 | slider | 0.1 | 0.01–0.2 |
| `x6` | X轴跟随角度范围 | slider | 90 | 0–180 |
| `y7` | Y轴跟随角度范围 | slider | 17 | 0–30 |
| `newproperty51` | Y自旋速度 Spin Speed | slider | 3 | -6–6 |
| `brfontcoloraaaaaaxspinangle` | X自旋角度 Spin Angle | slider | 0 | 0–5 |
| `hdr` | HDR强度 HDR Intensity | slider | 4 | 0–4 |
| `hdr1` | HDR散射 HDR Scatter | slider | 2 | 0–4 |
| `newproperty3` | CRT滤镜 Intensity 1 | slider | 0.03 | 0–1 |
| `newproperty23` | Blur模糊 Intensity 2 | slider | 0 | 0–0.3 |
| `newproperty49` | Light光效 Intensity 3 | slider | 0.3 | 0–2 |
| `newproperty54` | Pulse脉冲 Intensity 5 | slider | 0 | 0–1 |
| `newproperty68` | 胶片颗粒 | slider | 0.15 | 0–1 |
| `newproperty20` | 行星半径 Planet R | slider | 0.01 | 0–0.1 |
| `_13` | 恒星1 半径 Star1 R | slider | 0.03 | 0–0.1 |
| `newproperty18` | 恒星星芒 Stellar Spike | bool | True |  |
| `_14` | 恒星颜色 Primary | color | 1 1 1 |  |
| `_15` | 发射颜色 Emission | color | 1 1 1 |  |
| `_16` | 星芒颜色 Spike | color | 1 0.796078431372549 0.6941176470588235 |  |
| `_21` | 恒星2半径 Star2 R | slider | 0.023 | 0–0.1 |
| `_22` | 恒星颜色 Primary | color | 1 0.6 0.6 |  |
| `_23` | 发射颜色 Emission | color | 1 0.7333333333333333 0.6078431372549019 |  |
| `_24` | 星芒颜色 Spike | color | 1 0.796078431372549 0.6941176470588235 |  |
| `_3` | 恒星3半径 Star3 R | slider | 0.016 | 0–0.1 |
| `_31` | 恒星颜色 Primary | color | 1 0.49411764705882355 0.43137254901960786 |  |
| `_32` | 发射颜色 Emission | color | 1 0.5137254901960784 0.37254901960784315 |  |
| `_33` | 星芒颜色 Spike | color | 1 0.796078431372549 0.6941176470588235 |  |
| `brfontcoloraaaaaatrail1color` | 轨迹 Trail1 Color | color | 1 1 1 |  |
| `brfontcoloraaaaaatrail2color` | 轨迹 Trail2 Color | color | 1 0.8392156862745098 0.5176470588235295 |  |
| `brfontcoloraaaaaatrail3color` | 轨迹 Trail3 Color | color | 1 0.6196078431372549 0.5490196078431373 |  |
| `brfontcoloraaaaaatrail4color` | 轨迹 Trail4 Color | color | 0.28627450980392155 0.6039215686274509 1 |  |
| `y1` | 位置 y | slider | 0.36 | -3–3 |
| `x1` | 位置 x | slider | 0 | -4–4 |
| `size1` | 大小 size | slider | 0.9 | 0–2 |
| `t1` | CIV S 不透明度 Opacity | slider | 0.3 | 0–1 |
| `t2` | Lifetime 不透明度 Opacity | slider | 0.24 | 0–1 |
| `t3` | n1 不透明度 Opacity | slider | 0.16 | 0–1 |
| `t4` | n2 不透明度 Opacity | slider | 0.1 | 0–1 |
| `t5` | n3 不透明度 Opacity | slider | 0.07 | 0–1 |
| `t6` | n4 不透明度 Opacity | slider | 0.04 | 0–1 |
| `t7` | n5 不透明度 Opacity | slider | 0 | 0–1 |
| `x2` | 水平位置 x Pos | slider | 0 | -5–5 |
| `y2` | 水平位置 y Pos | slider | 1.8 | -3–3 |
| `size3` | 大小 Size | slider | 1 | 0–3 |
| `t8` | RANK 不透明度 Opacity | slider | 0.4 | 0–1 |
| `t9` | Rank1 不透明度 Opacity | slider | 0.32 | 0–1 |
| `t10` | Rank2 不透明度 Opacity | slider | 0.24 | 0–1 |
| `tex4opacity` | Rank3 不透明度 Opacity | slider | 0.16 | 0–1 |
| `tex5opacity` | Rank4 不透明度 Opacity | slider | 0.08 | 0–1 |
| `tex6opacity` | Rank5 不透明度 Opacity | slider | 0.04 | 0–1 |
| `tex7opacity` | Rank6 不透明度 Opacity | slider | 0 | 0–1 |
| `clx` | 水平位置 X Pos | slider | 0 | -1.5–1.5 |
| `cly` | 竖直位置 Y Pos | slider | 0.14 | -1.2–0.8 |
| `clocksize` | 组件大小 Size | slider | 0.9 | 0–2 |
| `clock2` | 时钟 Clock | bool | True |  |
| `clockcolor` | 时钟颜色 Color | color | 0.611764705882353 0.611764705882353 0.611764705882353 |  |
| `day` | 星期 Day | bool | True |  |
| `daycolor` | 星期颜色 Color | color | 1 1 1 |  |
| `date` | 日期 Date | bool | True |  |
| `audiobar` | 距离映射Menu R | bool | True |  |
| `mrx` | 水平位置 X Pos | slider | 0.48 | -3–3 |
| `mry` | 竖直位置 Y Pos | slider | -0.22 | -1–1 |
| `size` | 大小Size | slider | 1 | 0.5–2 |
| `newproperty25` | 右侧文字 Opacity | slider | 1 | 0–3 |
| `newproperty24` | 距离条 Opacity | slider | 0.2 | 0–1 |
| `menul` | 状态栏Menu L | bool | True |  |
| `mlx` | 水平位置 X | slider | -0.48 | -3–3 |
| `mly` | 竖直位置 Y | slider | -0.22 | -1–1 |
| `size2` | 大小Size | slider | 1 | 0.5–2 |
| `_19` | 状态1 Opacity | slider | 1 | 0–1 |
| `_25` | 状态2 Opacity | slider | 0.4 | 0–1 |
| `newproperty21` | 温度 Temp Opacity | slider | 0.5 | 0–1 |
| `x` | 水平位置 X Pos | slider | 0 | -5–5 |
| `y` | 竖直位置 Y Pos | slider | -1.3 | -4–4 |
| `sizex` | 大小 Size x | slider | 0.6 | 0.3–1.2 |
| `sizey` | 大小 Size y | slider | 0.4 | 0.1–1 |
| `newproperty22` | 运行时间 Opacity | slider | 0.5 | 0–1 |
| `newproperty63` | 登录界面Login interface | bool | True |  |
| `newproperty64` | 加载界面Load interface | bool | True |  |
| `newproperty15` | 加载/重启黑屏不透明度 Load/restart black screen opacity | slider | 1 | 0–1 |

## 9. 主模拟/文明/温度绑定对照

| 场景对象 | 脚本属性 | project属性 |
|---|---|---|
| MAIN (1326) | `DD` | `newproperty13` |
| MAIN (1326) | `body1_vx` | `v1` |
| MAIN (1326) | `body1_vy` | `vy1` |
| MAIN (1326) | `body1_vz` | `vz1` |
| MAIN (1326) | `body1_x` | `x11` |
| MAIN (1326) | `body1_y` | `y11` |
| MAIN (1326) | `body1_z` | `z1` |
| MAIN (1326) | `body2_vx` | `vx2` |
| MAIN (1326) | `body2_vy` | `vy2` |
| MAIN (1326) | `body2_vz` | `vz2` |
| MAIN (1326) | `body2_x` | `x21` |
| MAIN (1326) | `body2_y` | `y21` |
| MAIN (1326) | `body2_z` | `z2` |
| MAIN (1326) | `body3_vx` | `vx3` |
| MAIN (1326) | `body3_vy` | `vy3` |
| MAIN (1326) | `body3_vz` | `vz3` |
| MAIN (1326) | `body3_x` | `x3` |
| MAIN (1326) | `body3_y` | `y3` |
| MAIN (1326) | `body3_z` | `z3` |
| MAIN (1326) | `body4_vx` | `vx4` |
| MAIN (1326) | `body4_vy` | `vy4` |
| MAIN (1326) | `body4_vz` | `vz4` |
| MAIN (1326) | `body4_x` | `x4` |
| MAIN (1326) | `body4_y` | `y4` |
| MAIN (1326) | `body4_z` | `z4` |
| MAIN (1326) | `color1` | `brfontcoloraaaaaatrail1color` |
| MAIN (1326) | `color2` | `brfontcoloraaaaaatrail2color` |
| MAIN (1326) | `color3` | `brfontcoloraaaaaatrail3color` |
| MAIN (1326) | `color4` | `brfontcoloraaaaaatrail4color` |
| MAIN (1326) | `constraint_En` | `newproperty60` |
| MAIN (1326) | `constraint_M` | `mc` |
| MAIN (1326) | `constraint_Rc` | `newproperty67` |
| MAIN (1326) | `constraint_k1` | `k1` |
| MAIN (1326) | `constraint_k2` | `k2` |
| MAIN (1326) | `constraint_n` | `expc` |
| MAIN (1326) | `constraint_rc` | `rc` |
| MAIN (1326) | `constraint_re` | `re` |
| MAIN (1326) | `cus_en` | `newproperty50` |
| MAIN (1326) | `damp` | `y6` |
| MAIN (1326) | `fourthMass` | `newproperty8` |
| MAIN (1326) | `hardConstraint` | `newproperty66` |
| MAIN (1326) | `kSoft` | `newproperty29` |
| MAIN (1326) | `kg` | `newproperty52` |
| MAIN (1326) | `ktime` | `timespeed` |
| MAIN (1326) | `lenAX` | `x6` |
| MAIN (1326) | `lenAY` | `y7` |
| MAIN (1326) | `lenR_en` | `newproperty16` |
| MAIN (1326) | `lenV` | `newproperty62` |
| MAIN (1326) | `lenc_mode` | `newproperty61` |
| MAIN (1326) | `mass1` | `_110` |
| MAIN (1326) | `mass2` | `_26` |
| MAIN (1326) | `mass3` | `_34` |
| MAIN (1326) | `ras` | `newproperty28` |
| MAIN (1326) | `rxz` | `None` |
| MAIN (1326) | `senx` | `y5` |
| MAIN (1326) | `seny` | `x5` |
| MAIN (1326) | `step` | `newproperty53` |
| MAIN (1326) | `trailEndSize` | `None` |
| MAIN (1326) | `trailLength` | `None` |
| MAIN (1326) | `trailStartSize` | `None` |
| MAIN (1326) | `trailen` | `newproperty14` |
| MAIN (1326) | `vcvc` | `newproperty48` |
| MAIN (1326) | `xcxc` | `brfontcoloraaaaaarandomposrange` |
| MAIN (1326) | `zizhuanX` | `brfontcoloraaaaaaxspinangle` |
| MAIN (1326) | `zizhuanY` | `newproperty51` |
| time (345) | `kt` | `newproperty26` |
| 日志 (1227) | `cTe` | `cnen2` |
| 日志 (1227) | `collisionDistance` | `newproperty42` |
| 日志 (1227) | `feixingDistance` | `newproperty31` |
| 日志 (1227) | `feixingTemp` | `newproperty41` |
| 日志 (1227) | `highTempDestruction` | `newproperty44` |
| 日志 (1227) | `lingkongDistance` | `newproperty30` |
| 日志 (1227) | `logInterval` | `newproperty10` |
| 日志 (1227) | `lowTempDestruction` | `newproperty43` |
| 日志 (1227) | `rocheLimit` | `brfontcoloraaaaaarochelimitt` |
| 日志 (1227) | `survivalThreshold` | `t` |
| State2 (337) | `feixingDistance` | `newproperty31` |
| State2 (337) | `feixingTemp` | `newproperty41` |
| State2 (337) | `lingkongDistance` | `newproperty30` |
| State2 (337) | `mL1EN` | `cnen2` |
| State2 (337) | `stableHighTemp` | `newproperty46` |
| State2 (337) | `stableLowTemp` | `newproperty45` |
| Tem (220) | `k_temp_dist` | `newproperty69` |
| Tem (220) | `sL1` | `_111lum_sun` |
| Tem (220) | `sL2` | `_211lum_sun` |
| Tem (220) | `sL3` | `_311lum_sun` |

## 10. 已验证材质绑定与转换结果

- 默认背景选项4（天空盒00）实际绑定 `st2`；选项1（天空盒01）绑定 `B8k`；`BB8k3`属于保留图像层，默认不显示。
- 天空盒02（选项3）绑定 `_rt_imageLayerComposite_589_a`，即隐藏自定义图像层的合成结果，需要网页等距圆柱图像输入替代。
- 恒星1材质 `materials/models/1/Material__50.json`实际绑定 `0aun`与其遮罩；行星材质 `materials/models/球体04/DefaultMaterial.json`绑定 `0dq`与遮罩。
- 行星材质还有独立温度发射色脚本，低温白色阈值为−100℃，与HUD温度文本−10℃阈值不同；可用纹理加温度色着色模拟。
- 7份优先纹理已转换并通过Pillow读取与视觉接触图核验。默认背景 `st2.webp`为4096×2048（约633KB）；`sa3.webp`保留透明通道，非全白贴片。

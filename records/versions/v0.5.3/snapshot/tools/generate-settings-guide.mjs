import {writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {defaults,extraDefaults,effectivePropertySchema as schema,plainText} from '../src/settings.js';
import {settingsDefinitions,settingsCategories} from '../src/settings-catalog.js';
import {civilizationLevels} from '../src/civilization-levels.js';
const root=new URL('../',import.meta.url),allDefaults={...defaults,...extraDefaults};
const descriptions={
 datacolor:'界面主色与旋转环颜色，影响HUD显示，不改变恒星光度或气候。',
 seed:'随机初值的文字种子；与宇宙编号共同确定随机序列。重建初值，不是文明随机加分。',
 gravityModel:'newtonian（默认）采用无软化平方反比引力。plummer 使用与势能一致的软化；legacy 精确保留旧近距异常，仅作复现。牢笼独立开关，默认关闭。更改模型重置轨道。',
 encounterAccuracy:'η=0.0075；子步不超过 η×最短引力/穿越时间，也不超过高级物理步长。越小计算越多；不会减慢模拟时钟。数值预算或精度下限触发时暂停并报错，不改变轨道。',
 orbitalInitialization:'research（默认）：随机三星 Q=1，第三颗恒星为宿主，0.12D 逆向近圆行星，包含反冲；不筛种子。chaotic：不规则三维四体、局部引力尺度初速；original：原版随机速度；balanced：可选稳定实验。兼容对照。手动初值开启时不使用这些随机准备步骤。',
 physicsMode:'reference 每秒60次检测，每帧推进0.0075求解时间；realtime 每帧推进1/60。新引擎在此预算内自动增加近遇子步，最大步长不会改变时钟。legacy 保留旧的最多10次积分行为。',
 civilizationMode:'balanced 使用人口、干仓、脱水和文明等级；legacy 使用原版适温计数/即时灾变。切换会重置当前文明状态机；不要用两种模式比较同一榜单的物理真实性。',
 centerOnSystem:'仅调整渲染位置，使恒星系保持在画面中央；排除远抛行星的质心偏移，三星明显分离时跟随紧密恒星对。关闭后恢复四体物理质心视图。不会改变天体坐标、速度、引力或能量。',
 civilizationLevels:'启用十二阶段文明发展与保护增益；关闭后科技积累暂停，采用Lv.1基础耐受。重新启用保留同一文明此前积累。原版即时判定模式不使用此系统。',
 developmentRate:'仅放大实际安全生产时的科技积累；不会增加寿命读数或物理速度。默认1表示每个实际发展年积累1科技年。',
 thermalGrace:'文明人口/干仓损耗的时间分母；越大越耐久。30是损耗基准，不是30秒必死倒计时。文明等级会再乘保护系数。',
 birthDelay:'尚无文明时，适温且安全的连续窗口长度；默认0.5秒。出生时才建立100%人口储备和干仓质量。',
 wakeDelay:'原文明从干仓开始浸泡前，必须连续安全多久；默认1秒。之后浸泡0.5秒，失去安全条件会退回干仓。',
 epochWindow:'恒纪元连续确认时长，界面以模拟月显示，默认1个月。参数键epochWindow内部以模拟年存储（默认1/12）；按实际年份增量累计，因此时间倍速不会改变“一个月”的含义。其余主星、束缚及扰动条件保留。',
 climateInertia:'表面温度跟随辐射平衡温度的时间常数；大则变化平缓，小则升降温更快。不会改变引力。',
 stellarBreathing:'恒星半径按模拟运行秒数、120秒尺度正弦变化±8%；会轻微改变近接触判定，也改变显示半径。',
 planetStrength:'提高行星承受差分潮汐的强度，1.6表示有效潮汐应力=原始潮汐比/1.6。只改结构损伤判定，不把行星固定到轨道。',
 viewSensitivity:'鼠标共同倍率；越小，同距离移动引起的转动越小。0关闭悬停与拖动。默认0.12不变。',
 dragSensitivity:'拖动额外倍率；默认5是v0.4.2原拖动响应的5倍，只作用于按住左键拖动，不放大悬停。可调0.1～20。',
 compassOpacity:'旋转环最大不透明度；0隐藏、0.12=12%不透明。实际值再乘淡入淡出系数；环大小固定为原尺寸0.3倍。',
 newproperty61:'0只拖动；1悬停跟随与左键拖动同时可用；2固定视角。模式1拖动结束后将当前位置作为悬停基准，避免回跳。',
 newproperty16:'连续2秒没有鼠标输入后，以设定的极慢速度回归银河最亮区域。不是持续绕圈，也不是自动左右摇摆。',
 newproperty51:'银河归位的总角速度上限，单位度/秒；默认0.003°/s。无输入2秒后回中独立接管并清除残余惯性；手动操作仍保留惯性和原灵敏度。0或负值停止归位。',
 x5:'俯仰轴灵敏度；同时影响悬停和拖动。最终俯仰仍有±30°范围保护。',
 y5:'水平旋转轴灵敏度；同时影响悬停和拖动。水平角可连续旋转。',
 x6:'横向鼠标位置对应的悬停目标角度范围；还要乘水平灵敏度与整体倍率。',
 y7:'纵向鼠标位置对应的悬停目标角度范围；还要乘俯仰灵敏度与整体倍率。',
 y6:'惯性保留因子，运行时转成指数阻尼：-ln(min(0.999,y6))×120；越小阻力越大，越接近1越滑。',
 newproperty62:'悬停追踪目标的响应系数；越大趋近越快，实际角加速度仍受基础0.75约束。拖动仍使用现有惯性规则。',
 renderQuality:'native按屏幕尺寸与像素比渲染；8k尝试最高7680×4320超采样。受显卡最大纹理/渲染缓冲限制；背景原图为8192×4096。',
 pixelRatio:'原生分辨率模式的设备像素比上限；不会把低像素密度显示器自动放大到此倍率。8K模式另按尺寸与GPU能力取值。',
 trailsLength:'自适应尾迹长度基准，默认400；系统复杂时缩短、单调时保留更长历史。缓存最多4096点、单尾绘制最多自适应预算，避免无界增长。',
 bodyLabels:'天体名字/坐标标签；必须同时开启原版“天体位置信息”才显示。默认关闭。',
 dust:'显示两层尘埃；v0.5使用实心小圆点和普通透明混合，没有粒子光晕。与恒星柔光独立。',
 _1dust1quantity:'近景数量倍率，实际点数=round(900×此值)，默认450，最多1800。',
 _2dust2quantity:'远景数量倍率，实际点数=round(900×此值)，默认900，最多3600。',
 _1dust1size:'近景点世界尺寸再乘0.35；默认0.035，比v0.4.2的0.12明显缩小。屏幕大小还随距离、分辨率变化；近景投影尺寸上限为原属性值×35个CSS像素，默认3.5像素，避免贴近镜头变成大圆盘。',
 _2dust1size:'远景点世界尺寸再乘0.6；默认0.042。普通混合，不添加外圈辉光。',
 music:'主动播放随包的Ether音乐；网页首次播放须用户操作授权，WE可接系统音频。',volume:'音乐播放音量0～1；不改变系统音量。',
 schemecolor:'背景底色；当前天空球可见时会遮挡此底色。纯色背景请调“纯色颜色”。',
 cnen1:'只切换原作者长说明的中/英文显示；界面语言使用cnen2。',cnen2:'切换现代界面与文明信息语言；原版长文说明另外由cnen1控制。',
 customtex1:'加载卡片顶部文字；不是账号。',newproperty58:'加载/虚构登录卡片标题；不是账号认证。',newproperty59:'加载卡片密码样式文字；不会发送或验证任何密码。',
 newproperty71:'相机视场角；越大显示范围越广、天体看起来越小。',distance:'相机z=max(1.4,5.2−0.65×此值)，越大越靠近系统；不改变真实天体距离。',
 newproperty17:'1预置背景一、2纯色、3自定义全景图、4原生8K银河。初始化朝向银河亮部；预置图片均使用本地资源。',
 custombg:'选择本机全景图，保存在IndexedDB，自动切换到自定义模式。WE可用文件选择属性；文件不上传。',
 newproperty50:'开启后直接使用24项位置/速度初值；随机种子与随机轨道准备不再决定初值。手动滑块仍按属性范围钳制；导入完整初始四体数组则保留精确值（每分量绝对值≤1e8），避免新轨道导出后被旧滑块范围截断。编辑任一手动坐标/质量后切回滑块数据。',
 autorestart:'现代模式只在行星不可逆被吞噬/撕毁后延时4模拟秒重建宇宙；远抛、寒冷、可恢复损伤不会单独重置。关闭后显示手动重启入口。legacy沿用原版逃逸重启。',
 newproperty60:'开关原版质心引力牢笼；它是额外约束力，并非真实天体。默认仍开。',
 newproperty13:'原版任一天体超出质心距离D的逃逸阈值；现代模式保留逃逸标志但不因其自动重启完整行星。',
 newproperty14:'四条天体尾迹显示开关，不影响物理轨迹。',menuinit:'下次加载默认展开右下角设置面板。',compass:'鼠标转动/惯性明显时显示旋转环；静止后淡出。银河自动慢回归不会单独触发旋转环。',
 newproperty38:'中央文明状态、寿命和精选日志的总开关。不会暂停模拟或删除历史。',newproperty39:'右侧文明/宇宙两榜开关；各5条，按寿命从长到短，包括当前仍在运行的记录。',
 newproperty2:'启用后处理链；关闭后仍保留天体独立柔光贴图和锐利尘埃点。',
 brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality:'额外透明星云球层开关；当前移植中独立有效，不严格依赖原版“超高”宿主品质。',
 audioresponse:'使用音频强度轻微调节恒星柔光；网页自行播放/WE系统频谱均可作为输入。',
 newproperty6:'原版装饰形状兼容项。当前装饰元素默认隐藏，不恢复已删除的虚线。',newproperty4:'原版装饰线兼容项。当前装饰元素默认隐藏，不恢复已删除的虚线。',
 newproperty65:'天体标签总开关；还须开启bodyLabels，默认不显示字母与坐标。',cheatingcheck:'左侧显示引力牢笼、引力倍率及温度距离倍率摘要；只是模拟参数提示。',
 timespeed:'原版物理时间倍率；物理积分实际使用此系数的平方，年份显示也含重复时间因子。大幅提高可能导致数值误差和近距离弹射。',
 mc:'牢笼等效中心质量；越大内外约束都更强。',k1:'质心附近的向外斥力强度，用于避免中心堆积；不是外侧拉回系数。',re:'内侧斥力作用半径；进入范围越深，向外推力越明显。',
 k2:'超出rc后的向内约束系数；v0.5默认0.22→0.30。略增强回拉，不绑定某颗恒星；过高可能使回落和近接更激烈。',
 rc:'外侧回拉开始的质心距离；小于此值有中性区/内侧斥力，不是恒星系统的硬边界。',newproperty66:'开=原版硬牢笼，关=幂函数软牢笼。硬牢笼也施加力，不是反弹墙。',
 newproperty67:'硬牢笼强约束阈值；只在硬牢笼模式使用。应大于rc，过近会产生陡峭加速度。',expc:'软牢笼回拉随超出距离增长的幂指数；大则远处拉回更陡。',
 newproperty28:'newtonian 模式不使用此值；plummer 模式作为 ε，势能为 −Gm₁m₂/√(r²+ε²)；legacy 使用旧分段函数，仅供兼容对照。',newproperty29:'仅 legacy 旧分段引力使用；newtonian/plummer 不使用。不是行星结构强度。',
 newproperty52:'真实G的倍率×1/1000；默认1000。改变它同时改变恒星/行星相互引力及牢笼作用。',newproperty53:'最大积分子步，单位毫秒；新引擎近遇会进一步细分，减小不会改变模拟时钟。仅 legacy 保留最多10子步并随步长减慢的旧行为。',newproperty7:'原版恒定引力指数2；控件禁用，当前不支持任意引力指数。',
 newproperty69:'温度计算使用的距离缩放；越大，等效受照距离越短，温度越高。默认7带有视觉/演化调节性质。',
 _111lum_sun:'恒星1辐射光度，以太阳光度为1；只影响温度，不影响引力质量。',_211lum_sun:'恒星2辐射光度；增大会提高行星受热。',_311lum_sun:'恒星3辐射光度；与质量和球面颜色独立。',
 brfontcoloraaaaaarandomposrange:'随机位置立方体边长，默认3.2，每轴±1.6；混沌模式同时按尺度调整显示。增大尺度必须配合牢笼与温度距离设置，不能保证寿命增加。',
 newproperty48:'原版随机速度幅度；仅original随机初始化直接使用。chaotic按局部引力势生成初速，balanced按实验轨道生成。',
 newproperty10:'原版即时判定的日志间隔。现代精选日志改用固定稀有天象冷却和50年寿命里程碑，不使用此值。',newproperty26:'原版显示年数时间因子；默认10。原公式重复相乘，改变后会影响寿命和科技积累速度，热响应等模拟秒参数仍按60Hz运行。',
 t:'原版适温累计帧数，legacy模式使用；现代模式已由birthDelay替代。不是文明等级升级时间。',
 newproperty43:'Lv.1干仓可安全保存的最低温度；不是活动最低温度。等级会继续向下扩展。',newproperty44:'Lv.1干仓可安全保存的最高温度；越界会逐渐损失干仓质量，等级会向上扩展。',
 newproperty45:'Lv.1安全活动低温边界，默认−20°C；更高级文明可通过技术扩大活动范围。',newproperty46:'Lv.1安全活动高温边界，默认40°C；活动范围与干仓保存范围独立。',
 newproperty42:'legacy模式恒星/行星碰撞距离阈值；现代模式使用实际球体半径之和判断不可逆吞噬。',newproperty30:'近距离巨日/多日凌空的距离阈值；是观测事件，不单独等同文明死亡。',newproperty31:'远距离飞星的距离阈值；现代模式不再要求先满足寒冷条件。',newproperty41:'legacy飞星命名使用的温度阈值；现代模式按距离观测飞星，不使用此项。',
 brfontcoloraaaaaarochelimitt:'legacy静态洛希距离阈值；现代模式使用三恒星差分潮汐张量、行星自引力和planetStrength。',
 backgroundcolor:'预置银河天空球颜色乘数；不修改原始贴图文件。',newproperty9:'预置银河亮度乘数。',newproperty40:'纯色背景的颜色，背景模式2生效。',newproperty57:'纯色背景亮度乘数。',newproperty55:'自定义背景的颜色乘数。',newproperty56:'自定义背景亮度乘数。',
 brfontcoloraaaaaaxspinangle:'原版自动自旋倾角兼容项；现代银河回归逻辑不使用此角度，不主动增加俯仰旋转。',
 hdr:'后处理开启时增加恒星柔光强度；当前用圆形柔光替代原版HDR bloom，不是原样同一着色器。',hdr1:'后处理开启时放大恒星柔光范围；不会使尘埃产生光晕。',newproperty3:'CRT屏幕滤镜强度；默认0关闭。',newproperty23:'径向模糊强度；高值会降低锐度。',newproperty49:'恒星光效强度/柔光半径，不作用于尘埃点。',newproperty54:'画面脉冲滤镜强度，后处理开启时有效。',newproperty68:'胶片噪点强度，后处理开启时有效；默认0以保持清晰。',
 newproperty20:'行星可见半径，同时参与接触和潮汐/自引力判定；增大半径可能更易受潮汐损伤。',newproperty18:'恒星圆形柔光显示开关；和前景尘埃无关。',
 x1:'中央状态/日志原版水平偏移。',y1:'中央状态/日志原版垂直偏移。',size1:'中央状态/日志整体缩放。',t1:'中央文明状态文字不透明度。',t2:'中央文明寿命文字不透明度。',t3:'精选日志整组基础不透明度；每行统一字号，随经过时间淡出。',
 t4:'原第2条独立不透明度兼容项；现代日志统一由t3和时间淡出控制，此项不单独生效。',t5:'原第3条独立不透明度兼容项；现代日志不单独使用。',t6:'原第4条独立不透明度兼容项；现代日志不单独使用。',t7:'原第5条独立不透明度兼容项；现代日志不单独使用。',
 x2:'右侧双榜相对基础信息的水平偏移，当前1单位=12px。',y2:'双榜相对基础信息的垂直偏移。',size3:'双榜独立缩放。',t8:'双榜标题不透明度。',t9:'两榜第1条透明度倍率。',t10:'两榜第2条透明度倍率。',tex4opacity:'两榜第3条透明度倍率。',tex5opacity:'两榜第4条透明度倍率。',tex6opacity:'两榜第5条透明度倍率。',tex7opacity:'原第6条榜单不透明度兼容项；现在每榜5条，此项不生效。',
 clx:'时钟原版水平偏移；设置自定义layout.clock后，由百分比布局优先确定位置。',cly:'时钟原版垂直偏移；自定义百分比布局优先。',clocksize:'时钟与日期整体缩放，0.9为原版基准。',clock2:'时分秒显示开关，关闭不会关闭日期。',clockcolor:'时分秒颜色。',day:'星期文字开关。',daycolor:'星期颜色，日期字体大小与星期一致。',date:'日期显示开关。',clock:'整个时钟与日期窗口总开关。',
 audiobar:'右侧基础信息与双排行窗口总开关，已不显示原版ABC距离条。',mrx:'右侧窗口原版水平偏移，自定义layout.right优先。',mry:'右侧窗口原版垂直偏移，自定义layout.right优先。',size:'右侧基础信息与排行的整体缩放。',newproperty25:'右侧基础信息文字不透明度。',newproperty24:'右侧标题分隔实线透明度；原距离虚线已删除。',menul:'左侧行星状态、文明状态、温度与储备窗口总开关。',mlx:'左侧窗口原版水平偏移，自定义layout.left优先。',mly:'左侧窗口原版垂直偏移，自定义layout.left优先。',size2:'左侧整个行星/文明面板缩放。',_19:'恒/乱纪元大字不透明度。',_25:'行星物理状态文字不透明度。',newproperty21:'温度读数不透明度。',
 x:'底部模拟年数的原版水平偏移，自定义layout.years优先。',y:'底部模拟年数的原版垂直偏移，自定义layout.years优先。',sizex:'原版音频装饰条横向大小兼容项；装饰条已删除，当前不生效。',sizey:'原版音频装饰条纵向大小兼容项；当前不生效。',newproperty22:'底部模拟年数不透明度。',
 newproperty63:'加载时显示虚构登录卡片和“进入宇宙”按钮，不涉及登录服务。',newproperty64:'加载/重启时显示过渡遮罩；可关闭以直接进入壁纸。',newproperty15:'加载/重启遮罩不透明度，0完全透明、1完全不透明。'
};
for(const [key,index]of [['_110',1],['_26',2],['_34',3],['newproperty8',4]])descriptions[key]=`${index===4?'行星':'恒星'+index}质量，参与真实四体相互引力；增大质量改变轨道。不是文明人口。`;
for(const [keys,index]of [[['x11','y11','z1','v1','vy1','vz1'],1],[['x21','y21','z2','vx2','vy2','vz2'],2],[['x3','y3','z3','vx3','vy3','vz3'],3],[['x4','y4','z4','vx4','vy4','vz4'],4]])keys.forEach((key,j)=>descriptions[key]=`${index===4?'行星':'恒星'+index}的${['x位置','y位置','z位置','x速度','y速度','z速度'][j]}初值；仅开启自定义初值(newproperty50)时使用。位置/速度采用模拟单位，不是屏幕像素。`);
for(const [keys,index]of [[['_13','_14','_15','_16'],1],[['_21','_22','_23','_24'],2],[['_3','_31','_32','_33'],3]])keys.forEach((key,j)=>descriptions[key]=`恒星${index}${['基础半径；参与可见尺寸和接触判断。启用呼吸后会±8%变化。','球面主色；不改变温度光度。','自发光色；不改变引力或气候。','圆形柔光颜色；光晕开关由newproperty18控制。'][j]}`);
for(let i=1;i<=4;i++)descriptions[`brfontcoloraaaaaatrail${i}color`]=`${i===4?'行星':'恒星'+i}尾迹颜色；只改变绘制，不改变轨道或历史采样。`;
const layoutNames={left:'左侧行星与文明',right:'右侧基础信息/排行',clock:'时钟日期',logs:'中央文明和日志',years:'底部年数'};
export function guideControls(){
 const controls=[],seen=new Set();let group='原版高级设置 / 通用';
 for(const [id,title,keys]of settingsCategories){
   if(id==='layout'){
     for(const [name,label]of Object.entries(layoutNames))for(const axis of ['x','y'])controls.push({key:`layout.${name}.${axis}`,group:title,def:{text:`${label} · ${axis==='x'?'水平':'垂直'}位置 %`,type:'slider',min:0,max:100},value:'随默认布局/屏幕计算',description:`窗口${axis==='x'?'水平':'垂直'}锚点相对视口百分比；布局编辑器拖动或数值修改即时保存。不是窗口左上角：锚点/防越界由layout.js计算。`});
     for(const key of ['clock','menul','audiobar','newproperty38','newproperty39']){seen.add(key);controls.push({key,group:title,def:schema[key]});}
   }
   for(const key of keys){seen.add(key);controls.push({key,group:title,def:settingsDefinitions[key]||schema[key]});}
 }
 for(const [key,def]of Object.entries(schema).sort((a,b)=>a[1].index-b[1].index)){
   if(def.type==='group')group='原版高级设置 / '+plainText(def.text);
   else if(def.type&&!seen.has(key)){seen.add(key);controls.push({key,group,def});}
 }
 for(const c of controls){c.value??=c.key==='epochWindow'?allDefaults.epochWindow*12:allDefaults[c.key];c.description??=descriptions[c.key];if(!c.description)throw new Error(`Missing setting explanation: ${c.key}`);}
 return controls;
}
const format=value=>typeof value==='boolean'?(value?'开':'关'):String(value===''?'（空）':value);
const cell=v=>String(v).replaceAll('|',' / ').replaceAll('\n',' ');
export async function generateSettingsGuide(){
 const controls=guideControls();let md=`# 三体实时演算 v0.5 完整设置说明\n\n本文更新到v0.5.3：修复显示中心和银河归位，科技从旧石器时代开始扩展为十二阶段并显著放慢。牛顿物理与v0.5.2一致；完整说明见docs/v053/RELEASE.md。本文对应实际界面中的 **${controls.length} 项控件**：183项原版兼容设置、${controls.length-193}项扩展设置和10项窗口坐标。控件目录直接由界面共用的 settings-catalog.js 和原版属性表生成，默认值来自 settings.js。\n\n## 1. 先看这张设置结构\n\n\`\`\`text\n右下角齿轮\n├─ 暂停 / 重启宇宙 / 全屏\n├─ 搜索：可以搜中文名称，也可以搜参数键（例如 k2）\n├─ 全部设置\n│  ├─ 布局与窗口：五个窗口位置、显隐、拖动编辑\n│  ├─ 模拟与文明：种子、轨道模式、韧性、等级和气候\n│  ├─ 视角与银河：悬停、拖拽、阻尼、旋转环、闲置回归\n│  ├─ 画面与轨迹：分辨率、尾迹、两层粒子\n│  ├─ 声音：音乐、音量\n│  └─ 原版高级设置：物理、牢笼、温度、手动初值、外观与旧UI参数\n├─ 文明档案：查看终结记录、等级、发展年数、导出和复现初值\n├─ 项目说明：版本、架构、本说明入口\n└─ 导出种子 / 导入种子 / 恢复默认\n\`\`\`\n\n改动通过本机 localStorage 保存；自定义背景和文明档案放在 IndexedDB。不同浏览器/设备不自动同步，没有在线排行榜。刷新会结算上一次运行并新开一个宇宙，当前人口和轨道不支持断点续跑。右侧累计年数和历史排行会保留。\n\n## 2. 最常用的调整\n\n| 想要什么 | 调哪里 | 建议与区别 |\n|---|---|---|\n| 文明更耐久 | 模拟与文明 → 文明耐受时间基准 | 增大 thermalGrace；延缓损耗，不让文明永生。 |\n| 先看到文明诞生 | 文明诞生安全窗口 | 默认0.5秒；和原文明复苏所需1秒分别设置。 |\n| 等级升级快一点 | 文明发展倍率 | 例如2；只放大发展进度，不把休眠计为生产。 |\n| 行星更常回到系统 | 高级 → 天体运动 → k2 | 默认关闭牢笼，此参数不生效；手动启用后默认0.30。提高会引入非牛顿约束，不能用于纯牛顿基准。 |\n| 鼠标整体更慢 | 视角与银河 → 整体视角灵敏度 | 0.12→0.06；悬停和拖动同时减半。 |\n| 只改拖动幅度 | 拖拽灵敏度倍率 | 默认5；改2会保持悬停原样、降低拖动。 |\n| 惯性更快停下 | y轴阻尼 | 减小 y6，越接近1越难停。 |\n| 环更透明 | 旋转环不透明度 | 0.12即12%不透明。0完全隐藏。 |\n| 银河回归更慢 | 回归银河速度 | 默认0.003度/秒；连续2秒无输入才回归。 |\n| 少一点粒子 | 画面与轨迹 → 尘埃1计数 | 只改近景；点大小另由尘埃1大小控制。 |\n| 让画面更清晰 | 原生分辨率/8K与高级后处理 | 胶片颗粒、CRT默认关闭；径向模糊仍可自行调整。 |\n\n## 3. 文明韧性、等级与死亡是怎样算的\n\n环境适宜度反映当前温度和潮汐，不等于文明还剩多少生命。文明没诞生前，人口、干仓质量、韧性和等级显示为“—”，不会被几百年的严寒提前扣光。短暂但连续安全的窗口满足 birthDelay 后才建立新文明，两个储备从100%开始。\n\n文明具有两种归一化储备，百分比不是虚构的精确人口普查：人口储备表示可延续的人口，干仓质量表示脱水生命和保存体系的完好程度。综合韧性=人口储备×干仓质量。安全且处于活动状态时，两者每模拟秒分别恢复1.5和1个百分点，最高100%。脱水储存范围以内不凭时间强制扣寿命；超出干仓耐受范围才持续损失保存质量，同时以较慢速度损失人口。已恢复的旧结构损伤不会继续作为固定伤害源。\n\n保护分母=thermalGrace×等级韧性倍率。休眠气候损耗率=(0.015+超出干仓温度范围的摄氏度/2000)/保护分母；没有越界时为0。人口承受此损耗的15%。尚未脱水的异常气候人口损耗=(0.05+超出活动温区的度数/300)/保护分母。当前有效潮汐应力超过1时另有结构损耗；不是一有“飞星”就杀死文明。任一储备降至1%或以下，文明终结。恒星吞噬、行星完整度归零则立即结束文明；高级文明也没有免疫这些事件。\n\n阶段流程：安全生产 → 不适宜时脱水（1秒）→ 干仓保存 → 连续安全 wakeDelay 秒 → 浸泡（0.5秒）→ 恢复同一文明。浸泡中环境再次不安全，回干仓；编号与等级保留。文明终结后再遇安全窗口才产生新编号，科技从头开始。\n\n| 等级 | 阶段 | 累计发展年数 | 损耗保护倍率 | 活动温区（默认） | 干仓温区（默认） |\n|---|---|---|---|---|---|\n`;
 for(const s of civilizationLevels)md+=`| Lv.${s.level} | ${s.zh} | ${s.years} | ${s.resilience}× | ${defaults.newproperty45-s.climate}～${defaults.newproperty46+s.climate}°C | ${defaults.newproperty43-s.storage}～${defaults.newproperty44+s.storage}°C |\n`;
 md+=`\n发展年数只在文明确实处于“恢复生产/发展”、温度合适且行星安全时积累，再乘 developmentRate。**文明寿命包含休眠，科技发展年数不包含休眠。** 如果改动基础温区，表中所有等级范围会随之平移/扩展。文明阶段参考原著展示的农业、工业、原子信息及远航发展方向；200/800/1800/3500/6000/9000/12000/16000/21000/28000/40000生产年阈值与保护倍率都是本版本的设计，并非小说给定数值；没有假装已经实现智子制造或真实星际迁移。\n\n恒/乱纪元独立按轨道束缚与扰动判断。乱纪元可有短暂适温窗口，寒冷恒纪元也不一定适合生产。现代模式中，只要行星尚可恢复，就不因“飞得远”“文明死亡”或“气温极端”自动开新宇宙；结构可恢复与文明能否延续是两个不同问题。\n\n日志只保留最近12个事件、屏幕最多6行：文明启动、毁灭、每50年寿命里程碑、等级晋升，以及确认超过0.5秒的三日连珠/三日凌空/飞星不动，同类天象冷却60模拟秒。常规飞星、脱水切换等不逐条刷屏。\n\n## 4. 每个控件的完整参考\n\n“默认”指v0.5.3新安装值。银河归位原默认0.01一次迁移为0.003°/秒，自定义速度保留。v0.5.2 默认 research 初始化、newtonian 引力、牢笼关闭；旧配置升级会切换这些默认项。相同 Seed 的轨迹已改变，要复现 v0.5.1 必须显式选择 chaotic + legacy 并恢复旧牢笼与其余参数。升级时原有自定义值保留；仅识别到旧默认 k2=0.22、thermalGrace=8、wakeDelay=3 时迁移为0.30、30、1。v0.5.1还把旧默认epochWindow=2迁移为1/12模拟年；其他明确自定义值保留数值，按模拟年解释，并记录epochTimebase=years。已保存的灵敏度、窗口位置、背景、音量和档案继续保留。表内“兼容保留/不生效”项如实列出，避免误以为滑块必定改变现代逻辑。\n`;
 let group='';for(const c of controls){if(c.group!==group){group=c.group;md+=`\n### ${group}\n\n| 名称 / 参数键 | 默认 | 范围 / 类型 | 实际作用 |\n|---|---|---|---|\n`;}
 const d=c.def,range=d.type==='slider'?`${d.min}～${d.max}`:d.type==='combo'?d.options.map(o=>`${o.value}=${o.label}`).join('；'):({bool:'开关',color:'RGB，各0～1',textinput:'文字',scenetexture:'本地图片'}[d.type]||d.type);
 md+=`| ${cell(plainText(d.text))}<br>\`${c.key}\` | ${cell(format(c.value))} | ${cell(range)} | ${cell(c.description)} |\n`;}
 md+=`\n## 5. 修改如何生效、如何备份\n\n界面改动会立即保存，传给渲染器与Worker。画面、布局、视角、音量和科技倍率不重建轨道。Seed、初始化模式、物理时钟或积分步长会重建物理模块；原版映射的质量、初值、软化、牢笼和时间倍率也可能触发原版物理初始化。因此建议先导出种子，再调大范围物理参数，最后用“重启”明确开始一次新宇宙；不要在同一段观测中频繁改变物理设置后比较榜单。改变韧性、温区与科技倍率是即时作用，不恢复已经损失的人口，也不复活已经终结的文明。\n\n修改默认值不会覆盖所有用户保存值。默认常量在 src/settings.js 的 defaults / extraDefaults；控件名称、分类、范围在 src/settings-catalog.js（扩展）与 src/original-data.js（原版）；合法范围还需同步 normalizeSettings。升级旧默认须在 migrateSettings 添加一次迁移；presentationRevision 当前为6；银河归位的默认值迁移单独使用galaxyReturnRevision=1。直接随意增加此号可能触发现有迁移，应明确旧值与保留策略。\n\n导出种子包含完整配置、算法标识与四体初始坐标。导入会重新初始化，不是继续之前的位置。物理算法、气候与文明规则版本不同，旧种子的文明结果不能保证完全一致。手动初值范围受原版属性表限制。档案的“复现初始种子”重放初始条件，不提供整段历史回滚。\n\n可通过控制台试调并由正常接口持久保存：\n\n\`\`\`js\nwindow.threeBody.applySettings({\n  thermalGrace: 40,          // 更强的基础耐受\n  developmentRate: 2,        // 两倍科技积累，寿命读数不翻倍\n  viewSensitivity: 0.08,     // 整体鼠标倍率\n  dragSensitivity: 3,        // 只调拖动\n  compassOpacity: 0.08,      // 环8%不透明\n  layout: { left: {x: 8, y: 45}, clock: {x: 50, y: 10} }\n});\n\`\`\`\n\nlayout作为一个对象整体传入会替换旧的自定义坐标；界面单个滑块与拖动编辑器会自动合并其他窗口的坐标。所有位置都可能由layout.js做防越界处理，不必改CSS。想恢复默认布局用“恢复默认布局”；想恢复全部配置用面板底部“恢复默认”，文明档案仍保留。\n\nWallpaper Engine Web壁纸通过 wallpaperPropertyListener 接收原183个属性、暂停与音频；新增扩展项使用网页右下角面板，当前没有为每项扩展重复生成WE宿主侧控件。离线包解压后选择 project.json / index.html。网页版通过HTTP运行；实际WE本地文件宿主需在Windows环境验收。\n\n## 6. 代码结构：以后要改哪里\n\n| 文件 | 职责 | 常见改动 |\n|---|---|---|\n| src/settings.js | 默认、归一化、迁移、算法标识 | 改默认韧性/倍率；新增参数必须加校验 |\n| src/settings-catalog.js | 扩展控件定义和五大类 | 改名称、分类、范围、选项 |\n| src/original-data.js | 原183个属性和原场景绑定 | 原版属性兼容表，一般不手改 |\n| src/civilization-levels.js | 十二阶段阈值和耐受增益 | 改升级科技年数、耐温扩展、保护倍率 |\n| src/habitability.js | 人口、干仓、适宜度与损耗 | 改保存质量、人口恢复、终结阈值 |\n| src/civilization-state.js | 诞生、脱水、浸泡、发展、精选日志 | 改阶段时长、日志筛选与里程碑 |\n| src/world-state.js | 温度惯性、纪元、天象、行星结构 | 改轨道稳定判断和结构损伤恢复 |\n| src/legacy/008.js | 原版四体积分、牢笼、软化 | 改力学要独立版本化与回归测试 |\n| src/orbital-initialization.js | 混沌/原版/稳定实验初值 | 改星系尺度与随机初速 |\n| src/simulation.js | Worker纯模拟内核、事件编排 | 联接新状态与事件，不依赖DOM |\n| src/run-statistics.js / storage.js | 累计年数、双榜、档案持久化 | 以后接文明记忆与榜单后端 |\n| src/renderer.js | 相机、星空、球体、尾迹、尘埃 | 粒子形状/大小、显示风格 |\n| src/view-motion.js | 惯性、拖动、跟随、银河回归 | 修改鼠标运动公式 |\n| src/motion-visuals.js | 环渐变公式 | 当前淡入时间常数0.65秒、淡出0.18秒 |\n| src/layout.js / style.css | 五窗口锚点、编辑器、排版 | 字号、行距、默认位置 |\n| src/main.js | 面板生成、HUD显示、历史/事件 | 新的文明信息展示 |\n| src/bridge.js | WE回调、对外接口与版本号 | 扩展通知/宿主适配 |\n| tools/generate-settings-guide.mjs | 完整设置目录和说明生成器 | 改说明并运行npm run build，保证随包更新 |\n\n环使用指数缓动：alpha += (target−alpha)×(1−exp(−dt/tau))。tau不是完成时间：淡入约1.95秒达到95%，淡出约0.54秒剩5%。环最终不透明度=compassOpacity×alpha，形状缩放0.3没有再次改变。鼠标视角水平不限最高速度，俯仰范围仍±30°；仅改变拖动额外倍率，悬停参数保留。\n\n未来系统通知可订阅 civilization:birth / civilization:death / civilization:phase / civilization:level / universe:restart 等事件。示例：window.threeBody.subscribe('civilization:level', console.log)。当前只提供扩展边界，未连接外部通知或网络榜单服务。\n\n## 7. 已知模型边界\n\n这是以原版算法和用户提供的原著讲解为基础的可调壁纸模拟，科技/人口为新增抽象模型。引力牢笼是额外力；提高k2只是有限时间内增加拉回，不保证永久不抛射。旧分段引力仅在legacy兼容模式保留；默认牛顿力与近遇自适应Yoshida来自v0.5.2。屏幕居中只影响渲染，不能据天体偏离画面判定能量不守恒；真实弹射仍可能发生。温度有原版距离倍率与简化辐射模型，不是完整气候模型。长寿文明可能多数时间在干仓，而不是持续百年恒纪元；左侧实际发展年数用于区分。\n`;
 await writeFile(new URL('docs/SETTINGS-GUIDE-v0.5.md',root),md);
 const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const inline=s=>escape(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replaceAll('&lt;br&gt;','<br>');
 let html='',code=false,table=false;
 for(const line of md.split('\n')){if(line.startsWith('```')){if(table){html+='</tbody></table></div>';table=false;}html+=code?'</code></pre>':'<pre><code>';code=!code;continue;}if(code){html+=escape(line)+'\n';continue;}
 if(line.startsWith('|')){const cells=line.split('|').slice(1,-1).map(s=>s.trim());if(cells.every(s=>/^[-:]+$/.test(s)))continue;const tag=table?'td':'th';if(!table){html+='<div class="table"><table><tbody>';table=true;}html+='<tr>'+cells.map(c=>`<${tag}>${inline(c)}</${tag}>`).join('')+'</tr>';continue;}
 if(table){html+='</tbody></table></div>';table=false;}const heading=/^(#{1,4}) (.+)$/.exec(line);if(heading)html+=`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;else if(line.trim())html+='<p>'+inline(line)+'</p>';}
 const page=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>三体 v0.5 · 完整设置说明</title><style>body{margin:0;background:#090f17;color:#cedbeb;font:16px/1.8 system-ui,sans-serif}main{max-width:1150px;margin:auto;padding:32px 24px 90px}h1,h2,h3{color:#aad3ff;line-height:1.4;margin-top:2em}h1{font-size:28px}h2{font-size:23px}h3{font-size:19px}code{font-size:.9em;color:#bcddf7;overflow-wrap:anywhere}pre{padding:20px;background:#101b28;overflow:auto;line-height:1.6}.table{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #253448;padding:10px;vertical-align:top;text-align:left}th{background:#142338}td:first-child{min-width:170px}a{color:#9fcaff}nav{display:flex;gap:24px;flex-wrap:wrap}</style><main><nav><a href="index.html">← 返回壁纸</a><a href="SETTINGS-GUIDE-v0.5.md" download>下载 Markdown</a><button onclick="window.print()">打印 / 另存为PDF</button></nav>${html}</main></html>`;
 await writeFile(new URL('docs/settings-guide.html',root),page);return {controls:controls.length,bytes:md.length};
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(await generateSettingsGuide());

import {effectivePropertySchema as schema,plainText} from './settings.js';
import {settingsDefinitions} from './settings-catalog.js';
import {settingDescriptions} from './settings-descriptions.js';

export const layoutNames={left:'左侧行星与文明',right:'右侧基础信息与排行',clock:'时钟与日期',logs:'中央文明与日志',years:'底部年份'};
const layoutKeys=Object.keys(layoutNames).flatMap(id=>['x','y'].map(axis=>`layout.${id}.${axis}`));
const section=(title,keys)=>({title,keys});
export const settingsLayout=[
 {id:'quick-simulation',area:'quick',title:'模拟运行',sections:[section('', ['seed','stabilityMode','playbackRate','newproperty60'])]},
 {id:'quick-view',area:'quick',title:'鼠标与银河',sections:[section('', ['newproperty61','viewSensitivity','dragSensitivity','newproperty16','newproperty51'])]},
 {id:'quick-picture',area:'quick',title:'画面与轨迹',sections:[section('', ['renderQuality','newproperty17','newproperty9','newproperty14','trailsLength','dust'])]},
 {id:'quick-audio',area:'quick',title:'音乐',sections:[section('', ['music','volume'])]},
 {id:'civilization',area:'settings',title:'文明、纪元与温度',sections:[
  section('发展与韧性',['civilizationMode','civilizationLevels','developmentRate','thermalGrace','birthDelay','wakeDelay','epochWindow','planetStrength']),
  section('气候与生存',['climateInertia','newproperty69','_111lum_sun','_211lum_sun','_311lum_sun','newproperty45','newproperty46','newproperty43','newproperty44']),
  section('天象与原版判定',['newproperty30','newproperty31','newproperty41','newproperty42','brfontcoloraaaaaarochelimitt','t','newproperty10'])]},
 {id:'initial',area:'settings',title:'随机轨道与自定义初值',sections:[
  section('初始化方式',['orbitalInitialization','newproperty50','brfontcoloraaaaaarandomposrange','newproperty48']),
  section('恒星 1 初值',['x11','y11','z1','v1','vy1','vz1']),
  section('恒星 2 初值',['x21','y21','z2','vx2','vy2','vz2']),
  section('恒星 3 初值',['x3','y3','z3','vx3','vy3','vz3']),
  section('行星初值',['x4','y4','z4','vx4','vy4','vz4'])]},
 {id:'physics',area:'settings',title:'物理与引力',sections:[
  section('引力与积分',['gravityModel','physicsMode','encounterAccuracy','newproperty53','newproperty52','newproperty7','timespeed','newproperty26']),
  section('天体质量',['_110','_26','_34','newproperty8']),
  section('失效与重启',['newproperty13','autorestart','cheatingcheck']),
  section('旧版引力牢笼',['newproperty66','mc','k1','re','k2','rc','newproperty67','expc']),
  section('引力软化',['newproperty28','newproperty29'])]},
 {id:'view',area:'settings',title:'相机与旋转细调',sections:[
  section('观察方式',['displayReference','newproperty71','distance']),
  section('轴向响应与阻尼',['x5','y5','y6','newproperty62','x6','y7']),
  section('旋转环',['compass','compassOpacity','brfontcoloraaaaaaxspinangle'])]},
 {id:'visual',area:'settings',title:'背景、天体与画面细节',sections:[
  section('背景与配色',['datacolor','schemecolor','custombg','backgroundcolor','newproperty40','newproperty57','newproperty55','newproperty56']),
  section('渲染与后处理',['pixelRatio','newproperty2','hdr','hdr1','newproperty3','newproperty23','newproperty49','newproperty54','newproperty68','brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality']),
  section('前景粒子',['_1dust1quantity','_1dust1size','_2dust2quantity','_2dust1size']),
  section('天体尺寸与光色',['stellarBreathing','newproperty20','_13','_14','_15','_16','_21','_22','_23','_24','_3','_31','_32','_33','newproperty18']),
  section('尾迹与标签',['brfontcoloraaaaaatrail1color','brfontcoloraaaaaatrail2color','brfontcoloraaaaaatrail3color','brfontcoloraaaaaatrail4color','bodyLabels','newproperty65'])]},
 {id:'layout',area:'settings',title:'窗口布局与显示',sections:[
  section('窗口位置',layoutKeys),
  section('窗口显隐',['clock','menul','audiobar','newproperty38','newproperty39']),
  section('时钟与日期',['clocksize','clock2','clockcolor','day','daycolor','date']),
  section('左侧行星与文明',['size2','_19','_25','newproperty21']),
  section('右侧信息与排行',['size','newproperty25','newproperty24']),
  section('中央文明与日志',['size1','t1','t2','t3','t4','t5','t6','t7']),
  section('底部年份',['sizex','sizey','newproperty22']),
  section('原版位置与排行兼容',['clx','cly','mlx','mly','mrx','mry','x1','y1','x2','y2','size3','t8','t9','t10','tex4opacity','tex5opacity','tex6opacity','tex7opacity','x','y'])]},
 {id:'interface',area:'settings',title:'语言、加载与兼容',sections:[
  section('语言与菜单',['cnen2','menuinit','cnen1']),
  section('加载与登录展示',['newproperty63','newproperty64','newproperty15','customtex1','newproperty58','newproperty59']),
  section('音频与装饰',['audioresponse','newproperty6','newproperty4'])]}
];

const labels={
 seed:'随机种子',stabilityMode:'物理控制方案',playbackRate:'播放速度',newproperty60:'星系保护',
 newproperty61:'鼠标视角模式',viewSensitivity:'整体旋转灵敏度',dragSensitivity:'拖拽灵敏度倍率',newproperty16:'闲置时回归银河',newproperty51:'银河回归速度',
 renderQuality:'渲染清晰度',newproperty17:'背景',newproperty9:'背景亮度',newproperty14:'显示尾迹',trailsLength:'自适应尾迹长度',dust:'前景粒子',music:'播放音乐',volume:'音乐音量',
 civilizationMode:'文明演化模式',civilizationLevels:'文明科技等级',developmentRate:'科技发展速度',thermalGrace:'文明耐受时间',birthDelay:'文明诞生安全窗口',wakeDelay:'复苏安全窗口',epochWindow:'恒纪元确认时长（月）',planetStrength:'行星结构强度',
 climateInertia:'气候热惯性',newproperty45:'活动低温边界',newproperty46:'活动高温边界',newproperty43:'干仓低温耐受',newproperty44:'干仓高温耐受',
 gravityModel:'引力模型',physicsMode:'物理时钟',encounterAccuracy:'近遇精度 η',newproperty53:'最大积分步长（ms）',newproperty52:'引力系数',newproperty7:'引力指数',newproperty26:'旧版显示年数因子',timespeed:'旧版物理倍速',
 orbitalInitialization:'随机轨道方案',newproperty50:'使用自定义初值',brfontcoloraaaaaarandomposrange:'随机位置范围',newproperty48:'随机速度范围',
 newproperty66:'使用硬牢笼',mc:'牢笼等效质量',k1:'内区斥力强度',re:'斥力生效半径',k2:'外区约束强度',rc:'外区约束生效距离',newproperty67:'硬牢笼约束半径',expc:'软牢笼约束指数',newproperty28:'软化距离',newproperty29:'软化扩展系数',
 displayReference:'观察参考系',newproperty71:'视场角',distance:'镜头距离',x5:'俯仰轴灵敏度',y5:'水平轴灵敏度',y6:'旋转惯性',newproperty62:'悬停响应速度',x6:'水平跟随范围',y7:'俯仰跟随范围',compass:'显示旋转环',compassOpacity:'旋转环不透明度',
 datacolor:'界面主题色',schemecolor:'场景底色',custombg:'自定义全景图',backgroundcolor:'预置背景色调',newproperty40:'纯色背景颜色',newproperty57:'纯色背景亮度',newproperty55:'自定义背景色调',newproperty56:'自定义背景亮度',
 newproperty2:'超后处理',pixelRatio:'最大渲染像素比',stellarBreathing:'恒星半径呼吸',bodyLabels:'显示天体标签',newproperty65:'允许天体位置信息',newproperty18:'恒星光晕',
 clock:'显示时钟窗口',menul:'显示左侧窗口',audiobar:'显示右侧窗口',newproperty38:'显示文明与日志',newproperty39:'显示排行',clock2:'显示时间',day:'显示星期',date:'显示日期',
 cnen2:'英文界面',cnen1:'原版说明语言',menuinit:'启动时展开设置',newproperty63:'显示登录卡片',newproperty64:'显示加载过渡',newproperty15:'过渡遮罩不透明度',customtex1:'登录顶部文字',newproperty58:'登录标题',newproperty59:'密码展示文字',
 newproperty13:'逃逸距离阈值',autorestart:'旧版自动重启',cheatingcheck:'标记人工物理参数',newproperty69:'温度距离倍数',t:'原版诞生计数',newproperty10:'原版日志间隔',
 _1dust1quantity:'近景粒子数量',_1dust1size:'近景粒子大小',_2dust2quantity:'远景粒子数量',_2dust1size:'远景粒子大小',
 brfontcoloraaaaaabrnebularequirespostprocessingultrahighquality:'星云',brfontcoloraaaaaaxspinangle:'原版自旋俯仰角',
 size:'右侧窗口大小',size2:'左侧窗口大小',size1:'文明日志大小',size3:'原版排行大小',clocksize:'时钟大小',
 _19:'纪元文字不透明度',_25:'行星状态不透明度',newproperty21:'温度不透明度',newproperty25:'右侧文字不透明度',newproperty24:'右侧分隔线不透明度',newproperty22:'年份不透明度',
 newproperty30:'巨日距离阈值',newproperty31:'飞星距离阈值',newproperty41:'飞星温度阈值',newproperty42:'原版碰撞距离阈值',brfontcoloraaaaaarochelimitt:'原版洛希距离',
 hdr:'HDR 强度',hdr1:'HDR 散射',newproperty3:'CRT 滤镜',newproperty23:'径向模糊',newproperty49:'恒星光效强度',newproperty54:'亮度脉冲',newproperty68:'胶片颗粒',
 sizex:'年份横向缩放',sizey:'年份纵向缩放',clockcolor:'时间颜色',daycolor:'星期颜色',audioresponse:'系统音频响应',newproperty6:'原版装饰形状',newproperty4:'原版装饰线'
};
for(const [keys,name]of [[['_110','_26','_34','newproperty8'],'质量'],[['_111lum_sun','_211lum_sun','_311lum_sun'],'光度']])keys.forEach((key,i)=>labels[key]=`${i===3?'行星':`恒星 ${i+1}`}${name}`);
for(const [keys,i]of [[['_13','_14','_15','_16'],1],[['_21','_22','_23','_24'],2],[['_3','_31','_32','_33'],3]])keys.forEach((key,j)=>labels[key]=`恒星 ${i} ${['半径','主色','自发光色','光晕颜色'][j]}`);
labels.newproperty20='行星半径';
for(let i=1;i<=4;i++)labels[`brfontcoloraaaaaatrail${i}color`]=`${i===4?'行星':`恒星 ${i}`}尾迹颜色`;
for(let i=1;i<=7;i++)labels[`t${i}`]=['文明状态','文明寿命','日志第 1 行','日志第 2 行','日志第 3 行','日志第 4 行','日志第 5 行'][i-1]+'不透明度';
for(const [key,i]of [['t8',0],['t9',1],['t10',2],['tex4opacity',3],['tex5opacity',4],['tex6opacity',5],['tex7opacity',6]])labels[key]=`原版排行${i?`第 ${i} 行`:'标题'}不透明度`;

export function settingDefinition(key){
 if(key.startsWith('layout.')){const[,id,axis]=key.split('.');return {text:`${layoutNames[id]} · ${axis==='x'?'水平':'垂直'}位置`,type:'slider',min:0,max:100,step:.1};}
 if(key==='newproperty61')return {...schema[key],type:'combo',options:[{value:0,label:'仅按住拖拽'},{value:1,label:'悬停跟随 + 拖拽'},{value:2,label:'固定视角'}]};
 return settingsDefinitions[key]??schema[key];
}
export function settingLabel(key){
 const text=plainText(settingDefinition(key).text).trim();
 return labels[key]??text.replace(/\s*[A-Za-z][A-Za-z\s:]+$/,'').trim();
}
export function settingExplanation(key){
 if(key.startsWith('layout.'))return '窗口锚点相对视口的百分比，0–100%。与拖动布局编辑器同步；不是天体或相机位置。';
 return settingDescriptions[key];
}
export function settingEntries(){return settingsLayout.flatMap(group=>group.sections.flatMap(section=>section.keys.map(key=>({key,area:group.area,category:group.id,group:`${group.area==='quick'?'快捷设置':'全部设置'} / ${group.title}${section.title?' / '+section.title:''}`,def:settingDefinition(key),label:settingLabel(key),description:settingExplanation(key)}))));}

const v2Locked=new Set(['gravityModel','physicsMode','civilizationMode','newproperty53','encounterAccuracy','timespeed','newproperty26','autorestart','mc','k1','k2','rc','re','expc','newproperty66','newproperty67','newproperty28','newproperty29']);
const manualKeys=new Set(['x11','y11','z1','v1','vy1','vz1','x21','y21','z2','vx2','vy2','vz2','x3','y3','z3','vx3','vy3','vz3','x4','y4','z4','vx4','vy4','vz4']);
export function settingUnavailableReason(key,settings){
 if(key==='newproperty7')return '此项固定为 2：牛顿平方反比引力，不支持修改。';
 if(settings.stabilityMode!=='off'&&v2Locked.has(key))return 'V2 使用固定精度和独立失效规则，此旧设置不生效；切回旧版物理后可调整。';
 if(manualKeys.has(key)&&!settings.newproperty50)return '开启“使用自定义初值”后可调整；当前使用随机初始化。';
 if(['orbitalInitialization','brfontcoloraaaaaarandomposrange','newproperty48'].includes(key)&&settings.newproperty50)return '自定义初值已开启，此随机初始化选项暂不生效。';
 return '';
}

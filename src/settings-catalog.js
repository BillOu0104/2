// Shared by the settings panel and its generated complete reference.
export const settingsDefinitions={
    dragSensitivity:{type:'slider',text:'拖拽灵敏度倍率 / Drag multiplier',min:.1,max:20,step:.1},
    civilizationLevels:{type:'bool',text:'文明科技等级 / Civilization levels'},
    developmentRate:{type:'slider',text:'文明发展倍率 / Development rate',min:.1,max:20,step:.1},
    birthDelay:{type:'slider',text:'文明诞生安全窗口 / Birth window (s)',min:.1,max:10,step:.1},
    planetStrength:{type:'slider',text:'行星结构强度 / Structural strength',min:1,max:4,step:.1},
    viewSensitivity:{type:'slider',text:'整体视角灵敏度 / Mouse sensitivity',min:0,max:2,step:.01},
    compassOpacity:{type:'slider',text:'旋转环不透明度 / Ring opacity',min:0,max:.5,step:.01},
    orbitalInitialization:{type:'combo',text:'随机初始轨道 / Initial orbits',options:[{value:'research',label:'随机三星 Q=1 · 逆向行星 0.12D（默认）'},{value:'chaotic',label:'v0.5.1 随机四体 · 对照'},{value:'original',label:'原版完全随机'},{value:'balanced',label:'稳定轨道实验'}]},
    gravityModel:{type:'combo',text:'引力模型 / Gravity',options:[{value:'newtonian',label:'牛顿平方反比 · 无软化（默认）'},{value:'plummer',label:'Plummer 一致软化 · 实验'},{value:'legacy',label:'旧近距引力 · 复现对照'}]},
    encounterAccuracy:{type:'slider',text:'近遇时间尺度系数 η（越小越精确）',min:.001,max:.03,step:.0005},
    seed: { type: 'textinput', text: '随机初始化 Seed' },
    physicsMode: { type: 'combo', text: '物理时钟', options: [{ value: 'reference', label: '原版节奏 · 固定 60 Hz（默认）' }, { value: 'realtime', label: '墙钟同步 · 修复原版每帧步数上限' }] },
    civilizationMode: { type: 'combo', text: '文明延续机制 / Civilization', options: [{ value: 'balanced', label: '韧性与文明等级（默认）' }, { value: 'legacy', label: '原版即时判定' }] },
    thermalGrace: { type: 'slider', text: '文明耐受时间基准 / Resilience time (s)', min: 1, max: 60, step: 1 },
    wakeDelay: { type: 'slider', text: '复苏安全窗口 / Safe window (s)', min: 1, max: 60, step: .5 },
    epochWindow: { type: 'slider', text: '恒纪元确认时长（模拟月） / Stable era (months)', min: .1, max: 240, step: .1 },
    climateInertia: { type: 'slider', text: '气候热惯性 / Thermal inertia (s)', min: .05, max: 30, step: .05 },
    stellarBreathing: { type: 'bool', text: '恒星半径缓慢呼吸 / Stellar breathing' },
    renderQuality: { type: 'combo', text: '渲染清晰度 / Render resolution', options: [{value:'native',label:'原生屏幕分辨率 · 8K 原图（默认）'},{value:'8k',label:'8K 超采样 · 最高 7680×4320'}] },
    trailsLength: { type: 'slider', text: '自适应尾迹长度基准 / Trail length', min: 20, max: 2000, integer: true },
    pixelRatio: { type: 'slider', text: '最大渲染像素比 / Pixel ratio', min: .5, max: 4, step: .1 },
    bodyLabels: { type: 'bool', text: '显示天体标签 / Body labels' },
    music: { type: 'bool', text: '播放原版音乐 · Ether' },
    volume: { type: 'slider', text: '音乐音量 / Volume', min: 0, max: 1, step: .01 }
  };
export const settingsCategories=[['layout','布局与窗口 / Layout',[]],['simulation','模拟与文明 / Simulation',['seed','orbitalInitialization','gravityModel','encounterAccuracy','physicsMode','civilizationMode','civilizationLevels','developmentRate','thermalGrace','birthDelay','wakeDelay','epochWindow','climateInertia','stellarBreathing','planetStrength']],['view','视角与银河 / View',['viewSensitivity','dragSensitivity','newproperty16','newproperty51','newproperty61','x5','y5','x6','y7','newproperty62','y6','compass','compassOpacity']],['visual','画面与轨迹 / Visual',['renderQuality','trailsLength','pixelRatio','bodyLabels','dust','_1dust1quantity','_1dust1size','_2dust2quantity','_2dust1size']],['audio','声音 / Audio',['music','volume']]];

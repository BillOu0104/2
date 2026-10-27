import {replaySettings} from './seed-compatibility.js';
import {controllerPatch} from './controller-settings.js';
import {settingsLayout,settingDefinition,settingLabel,settingExplanation,settingUnavailableReason} from './settings-layout.js';
import {SettingHelp,sliderStep,paintSlider} from './setting-help.js';
import { layoutWidgets,widgetPosition,clearLayoutStyles,applyLayout,installLayoutEditor } from './layout.js';
import { SpaceRenderer } from './renderer.js';
import { effectivePropertySchema as propertySchema, migrateSettings } from './settings.js';
import { normalizeSettings, colorHex, fromHex, colorRGB, plainText, settingsFromInitial, algorithmId,manualInitialKeys } from './settings.js';
import { LocalStore } from './storage.js';
import { AudioController } from './audio.js';
import { installWallpaperBridge } from './bridge.js';
import './style.css';

const $ = selector => document.querySelector(selector);
const settingsKey = 'three-body.settings.v3';
const statisticsKey='three-body.statistics.v1';let lastStatisticsSave=0;
const resetPendingKey='three-body.reset-pending.v1';
let resetting=false,resetInProgress=false,startWorker;
function persistStatistics(force=false){
  if(resetting||!state?.statisticsCheckpoint||(!force&&performance.now()-lastStatisticsSave<1000))return;
  try{localStorage.setItem(statisticsKey,JSON.stringify(state.statisticsCheckpoint));lastStatisticsSave=performance.now();}catch{}
}
function savedStatistics(){try{return JSON.parse(localStorage.getItem(statisticsKey)||'null');}catch{return null;}}
let settings;
try {
  const saved=localStorage.getItem(settingsKey),v2=localStorage.getItem('three-body.settings.v2'),v1=localStorage.getItem('three-body.settings.v1');
  settings=saved?migrateSettings(JSON.parse(saved),3):migrateSettings(JSON.parse(v2||v1||'{}'),2);
} catch { settings=normalizeSettings(); }
const store = new LocalStore();
let state = null, userPaused = false, hostPaused = false, visibilityPaused = false, worker, renderer, lastEvent = 0, currentTab = 'quick';
let sessionId = crypto.randomUUID?.() || String(Date.now());
let customURL = null, history = [], lastTick = 0, fps = 0, fatal = false;
const controlMap = new Map();
function controlValue(key){if(key==='epochWindow')return settings.epochWindow*12;if(key.startsWith('layout.')){const[,id,axis]=key.split('.');return settings.layout[id]?.[axis]??+widgetPosition(id)[axis].toFixed(1);}return settings[key];}
function setControl(key,value){if(key==='epochWindow'){changeSettings({epochWindow:value/12});return;}if(key.startsWith('layout.')){const[,id,axis]=key.split('.');changeSettings({layout:{...settings.layout,[id]:{...(settings.layout[id]||widgetPosition(id)),[axis]:value}}});}else changeSettings({[key]:value});}
const notice = (message, error = false) => {
  $('#notice').textContent = message; $('#notice').hidden = false; $('#notice').classList.toggle('error', error);
  clearTimeout(notice.timer); notice.timer = setTimeout(() => { $('#notice').hidden = true; }, error ? 14000 : 4000);
};

function saveSettings() {
  try { localStorage.setItem(settingsKey, JSON.stringify(settings)); $('#save-status').textContent = settings.cnen2 ? 'Saved locally' : '已保存到本机'; }
  catch { $('#save-status').textContent = '本地存储不可用'; }
}
function changeSettings(patch, options = {}) {
  const previous = settings;patch=controllerPatch(settings,patch);
  if(patch.stabilityMode&&patch.stabilityMode!=='off'&&patch.stabilityMode!==settings.stabilityMode&&!('newproperty60' in patch))patch={...patch,newproperty60:true,gravityModel:'newtonian',physicsMode:'reference',civilizationMode:'balanced'};
  if(manualInitialKeys.some(k=>k in patch)&&!('manualInitialBodies' in patch))patch={...patch,manualInitialBodies:null};
  settings = normalizeSettings({ ...settings, ...patch });
  worker?.postMessage({ type: 'settings', patch: settings });
  renderer?.updateSettings(settings);
  updateControls(); applyAppearance(); saveSettings();
  if ((previous.music !== settings.music || previous.volume !== settings.volume) && audio) {
    audio.play(settings.music, settings.volume).catch(() => { settings.music = false; updateControls(); saveSettings(); notice('请通过音乐开关主动播放；当前浏览器拒绝了自动播放。'); });
  }
  if ('custombg' in patch && options.fromWallpaper && patch.custombg) $('#save-status').textContent = 'Wallpaper Engine';
}

function setPanel(open) {
  const panel = $('#settings-panel');
  panel.classList.toggle('open', open); panel.inert = !open; panel.setAttribute('aria-hidden', String(!open));
  $('#settings-toggle').setAttribute('aria-expanded', String(open)); $('#settings-toggle').setAttribute('aria-label', open ? '关闭设置' : '打开设置');
  if (open) setTimeout(() => $('#settings-search').focus(), 80); else { settingHelp.hide(); $('#settings-toggle').focus(); }
}
$('#settings-toggle').onclick = () => setPanel(!$('#settings-panel').classList.contains('open'));
$('#settings-close').onclick = () => setPanel(false);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { setPanel(false); hideLoading(); }
  if (e.key === 'Tab' && $('#settings-panel').classList.contains('open')) {
    const elements = [...$('#settings-panel').querySelectorAll('button,input,select,summary')].filter(el => el.offsetParent && !el.disabled);
    const first = elements[0], last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

const settingHelp = new SettingHelp();
function makeControl(key,def){
  const container=document.createElement('div');container.className='control';container.dataset.key=key;
  const heading=document.createElement('div');heading.className='control-head';
  const name=document.createElement('div');name.className='control-name';
  const label=document.createElement('label');label.htmlFor=`setting-${key}`;label.textContent=settingLabel(key);
  const help=document.createElement('button');help.type='button';help.className='setting-help';help.textContent='!';help.setAttribute('aria-label',`${label.textContent}的说明`);help.setAttribute('aria-controls','settings-help-tooltip');help.setAttribute('aria-expanded','false');
  const description=document.createElement('span');description.className='sr-only setting-description';description.id=`description-${key}`;description.textContent=settingExplanation(key);
  help.setAttribute('aria-describedby',description.id);name.append(label,help);heading.append(name);container.append(heading,description);
  settingHelp.bind(help,()=>description.textContent);
  let input,number;
  if(def.type==='bool'){
    input=document.createElement('input');input.type='checkbox';heading.append(input);input.onchange=()=>setControl(key,input.checked);
  }else if(def.type==='color'){
    input=document.createElement('input');input.type='color';heading.append(input);input.onchange=()=>setControl(key,fromHex(input.value));
  }else if(def.type==='slider'){
    const row=document.createElement('div');row.className='slider-row';
    input=document.createElement('input');input.type='range';input.min=def.min;input.max=def.max;
    // Preserve exact saved/custom values; only pointer drags quantize to the UI step.
    const step=sliderStep(def);input.step='any';
    number=document.createElement('input');number.type='number';number.className='number-value';number.min=def.min;number.max=def.max;number.step=step;number.inputMode='decimal';number.setAttribute('aria-label',`${label.textContent}数值`);number.setAttribute('aria-describedby',description.id);
    row.append(input,number);container.append(row);
    input.oninput=()=>{input.value=Number((Number(def.min)+Math.round((Number(input.value)-Number(def.min))/step)*step).toPrecision(12));number.value=input.value;paintSlider(input,number);};
    input.onchange=()=>setControl(key,+input.value);
    input.onkeydown=e=>{
      const direction=({ArrowLeft:-1,ArrowDown:-1,ArrowRight:1,ArrowUp:1})[e.key];
      if(!direction&&!['Home','End'].includes(e.key))return;
      e.preventDefault();input.value=e.key==='Home'?def.min:e.key==='End'?def.max:Number(input.value)+direction*step*(e.shiftKey?10:1);
      input.dispatchEvent(new Event('input'));input.dispatchEvent(new Event('change'));
    };
    number.oninput=()=>{if(number.value!==''&&Number.isFinite(+number.value))input.value=number.value;paintSlider(input,number);};
    number.onchange=()=>{if(number.value!==''&&Number.isFinite(+number.value))setControl(key,+number.value);else updateControls();};
    number.onkeydown=e=>{if(e.key==='Enter'){number.dispatchEvent(new Event('change'));number.blur();}if(e.key==='Escape'){updateControls();number.blur();e.stopPropagation();}};
  }else if(def.type==='combo'){
    input=document.createElement('select');
    for(const option of def.options){const o=document.createElement('option');o.value=option.value;o.textContent=option.label;input.append(o);}
    container.append(input);input.onchange=()=>setControl(key,input.value);
  }else if(def.type==='scenetexture'){
    input=document.createElement('input');input.type='file';input.accept='image/*';container.append(input);
    input.onchange=async()=>{
      const file=input.files[0];if(!file)return;
      if(file.size>40*1024*1024){notice('请选择小于 40 MB 的背景图片。',true);return;}
      try{
        const bitmap=await createImageBitmap(file);bitmap.close();
        if(customURL)URL.revokeObjectURL(customURL);customURL=URL.createObjectURL(file);renderer.setCustomBackground(customURL);
        const saved=await store.put('assets',file,'background');changeSettings({custombg:file.name,newproperty17:'3'});
        notice(saved?'背景已保存在本机':'背景已载入；当前环境不支持持久保存');
      }catch{notice('无法读取这张图片，请选择 PNG、JPEG 或 WebP。',true);}
    };
  }else{
    input=document.createElement('input');input.type='text';container.append(input);input.onchange=()=>setControl(key,input.value);
  }
  input.id=`setting-${key}`;input.setAttribute('aria-describedby',description.id);
  container.dataset.search=[key,label.textContent,plainText(def.text),settingExplanation(key)].join(' ').toLowerCase();
  controlMap.set(key,{input,number,type:def.type,container,description,help});return container;
}
function buildSettings(){
  for(const category of settingsLayout){
    const group=document.createElement('details');group.className='setting-group';group.dataset.category=category.id;group.dataset.area=category.area;group.open=category.area==='quick';
    const summary=document.createElement('summary'),title=document.createElement('span'),count=document.createElement('span');title.textContent=category.title;count.className='group-count';count.textContent=category.sections.reduce((n,s)=>n+s.keys.length,0);summary.append(title,count);group.append(summary);
    if(category.id==='layout'){
      const actions=document.createElement('div');actions.className='layout-actions';actions.innerHTML='<button id="layout-edit">拖动调整窗口</button><button id="layout-reset">恢复默认布局</button>';group.append(actions);
    }
    for(const section of category.sections){
      const block=document.createElement('section');block.className='settings-section';
      if(section.title){const h=document.createElement('h3');h.className='section-title';h.textContent=section.title;block.append(h);}
      for(const key of section.keys)block.append(makeControl(key,settingDefinition(key)));
      group.append(block);
    }
    $('#settings-controls').append(group);
  }
  updateControls();filterSettings();
}
function updateControls(){
  for(const [key,{input,number,type,container,description,help}]of controlMap){
    const reason=settingUnavailableReason(key,settings),disabled=!!reason;
    input.disabled=disabled;if(number)number.disabled=disabled;container.classList.toggle('is-disabled',disabled);help.dataset.unavailable=String(disabled);
    description.textContent=[settingExplanation(key),reason].filter(Boolean).join('\n\n');
    if(type==='bool')input.checked=!!controlValue(key);
    else if(type==='color')input.value=colorHex(controlValue(key));
    else if(type!=='scenetexture'){input.value=controlValue(key);if(number){number.value=controlValue(key);paintSlider(input,number);}}
  }
}
let searching=false;
const scrollPositions={quick:0,settings:0};
function filterSettings(){
  const query=$('#settings-search').value.trim().toLowerCase(),wasSearching=searching;searching=!!query;let count=0;
  for(const [,{container}]of controlMap){const match=!query||container.dataset.search.includes(query);container.hidden=!match;if(match)count++;}
  for(const group of document.querySelectorAll('.setting-group')){
    if(searching&&!wasSearching)group.dataset.beforeSearch=String(group.open);
    if(!searching&&wasSearching){group.open=group.dataset.beforeSearch==='true';delete group.dataset.beforeSearch;}
    const match=[...group.querySelectorAll('.control')].some(c=>!c.hidden);
    group.hidden=searching?!match:group.dataset.area!==currentTab;
    if(searching&&match)group.open=true;
    for(const section of group.querySelectorAll('.settings-section'))section.hidden=![...section.querySelectorAll('.control')].some(c=>!c.hidden);
    const actions=group.querySelector('.layout-actions');if(actions)actions.hidden=searching;
  }
  $('#search-empty').hidden=!searching||count>0;
}
$('#settings-search').oninput=()=>{settingHelp.hide();filterSettings();};
for(const button of document.querySelectorAll('[data-tab]'))button.onclick=()=>{
  if(['quick','settings'].includes(currentTab))scrollPositions[currentTab]=$('#settings-content').scrollTop;
  currentTab=button.dataset.tab;settingHelp.hide();$('#settings-search').value='';filterSettings();
  for(const b of document.querySelectorAll('[data-tab]')){const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;}
  const controlsTab=['quick','settings'].includes(currentTab);
  $('#settings-content').hidden=!controlsTab;$('#history-content').hidden=currentTab!=='history';$('#about-content').hidden=currentTab!=='about';
  $('#settings-search').disabled=!controlsTab;if(controlsTab)$('#settings-content').setAttribute('aria-labelledby',`tab-${currentTab}`);if(controlsTab)$('#settings-content').scrollTop=scrollPositions[currentTab]||0;
  if(currentTab==='history')renderHistory();
};
document.querySelector('.panel-tabs').addEventListener('keydown',e=>{
 const tabs=[...document.querySelectorAll('[data-tab]')],index=tabs.indexOf(e.target);
 if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
 e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 tabs[next].click();tabs[next].focus();
});

function applyAppearance() {
  clearLayoutStyles();
  const s = settings, en = s.cnen2;
  document.documentElement.lang = en ? 'en' : 'zh-CN'; document.documentElement.style.setProperty('--accent', colorHex(s.datacolor));
  document.documentElement.style.setProperty('--accent-rgb', colorRGB(s.datacolor).map(v => Math.round(v * 255)).join(','));
  for (const el of document.querySelectorAll('[data-zh]')) el.textContent = en ? el.dataset.en : el.dataset.zh;
  $('#clock-widget').hidden = !s.clock;
  $('#clock-time').hidden = !s.clock2; $('#clock-time').style.color = colorHex(s.clockcolor);
  $('#clock-day').hidden = !s.day; $('#clock-day').style.color = colorHex(s.daycolor); $('#clock-date').hidden = !s.date;
  $('#clock-widget').style.top = `${12 - s.cly * 15}%`; $('#clock-widget').style.left = `${50 + s.clx * 16}%`; $('#clock-widget').style.scale = s.clocksize / .9;
  $('#era-widget').hidden = !s.menul; $('#era-widget').style.left = `${50 + s.mlx * 88}%`; $('#era-widget').style.marginTop = `${-(s.mly + .22) * 100}px`; $('#era-widget').style.scale = s.size2;
  $('#era').style.opacity = s._19; $('#hydration').style.opacity = s._25; $('.temperature').style.opacity = s.newproperty21;
  $('#distance-widget').hidden = !s.audiobar; $('#distance-widget').style.right = `${50 - s.mrx * 88}%`; $('#distance-widget').style.marginTop = `${-(s.mry + .22) * 100}px`; $('#distance-widget').style.scale = s.size;
  $('.runtime-info').style.opacity=s.newproperty25;
  $('#distance-widget .widget-rule').style.opacity=Math.min(1,s.newproperty24*3);
  $('#civilization-widget').hidden = !s.newproperty38; $('#civilization-widget').style.left = `${50 + s.x1 * 12}%`; $('#civilization-widget').style.marginTop = `${-(s.y1 - .36) * 90}px`; $('#civilization-widget').style.scale = s.size1 / .9;
  $('#civilization-status').style.opacity = s.t1; $('#civilization-lifespan').style.opacity = s.t2;
  $('#ranking-widget').hidden = !s.newproperty39; $('#ranking-widget').style.transform=`translate(${s.x2*12}px,${-(s.y2-1.8)*90}px)`; $('#ranking-widget').style.scale=s.size3;
  $('#ranking-widget').querySelectorAll('.eyebrow').forEach(el=>el.style.opacity=s.t8);
  $('.simulation-time').style.left = `${50 + s.x * 12}%`; $('.simulation-time').style.marginBottom = `${(s.y + 1.3) * 70}px`; $('.simulation-time>div').style.opacity = s.newproperty22;
  $('#decor').className = `${s.newproperty6 === '2' ? 'square' : s.newproperty6 === '3' ? 'none' : ''} ${s.newproperty4 !== '4' ? 'lines' : ''}`;
  $('#physics-check').hidden = !s.cheatingcheck;
  $('#login-title').textContent = s.newproperty58; $('#login-password').textContent = s.newproperty59; $('.loading-card>.eyebrow').textContent = s.customtex1;
  $('#pause-button').textContent = userPaused ? (en ? '▷ Resume' : '▷ 继续') : (en ? 'Ⅱ Pause' : 'Ⅱ 暂停');
  $('#restart-button').textContent = en ? '↻ Restart' : '↻ 重启'; $('#fullscreen-button').textContent = en ? '⛶ Fullscreen' : '⛶ 全屏';
  $('#export-settings').textContent = en ? 'Export seed' : '导出种子'; $('#reset-settings').textContent = en ? 'Factory reset' : '恢复默认';
  applyLayout(s.layout);
  const tabNames=en?{quick:'Quick settings',settings:'All settings',history:'Archive',about:'About'}:{quick:'快捷设置',settings:'全部设置',history:'文明档案',about:'项目说明'};document.querySelectorAll('[data-tab]').forEach(b=>b.textContent=tabNames[b.dataset.tab]);
}

function applyPause() { worker?.postMessage({ type: 'pause', value: resetting || userPaused || hostPaused || visibilityPaused }); }
$('#pause-button').onclick = () => { userPaused = !userPaused; applyPause(); applyAppearance(); };
function restart() { worker?.postMessage({ type: 'restart' }); if (settings.newproperty64) showLoading(true); }
$('#restart-button').onclick = restart; $('#restart-prompt').onclick = restart;
$('#fullscreen-button').onclick = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { notice('当前宿主不支持网页全屏。'); } };
document.addEventListener('visibilitychange', () => { persistStatistics(true);visibilityPaused = document.hidden; applyPause(); });

function downloadJSON(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
$('#export-settings').onclick = () => downloadJSON(`three-body-seed-${settings.seed.replace(/[^\w-]/g, '_')}.json`, { format: 'three-body-seed', version: 1, algorithm: algorithmId(settings), settings, initialBodies: state?.initialBodies });
$('#import-settings').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error('配置文件过大');
    const data = JSON.parse(await file.text()); if (data.format !== 'three-body-seed' || data.version !== 1 || !data.settings || typeof data.settings !== 'object') throw new Error('种子格式不匹配');
    changeSettings(data.initialBodies ? settingsFromInitial(replaySettings(data.settings), data.initialBodies) : replaySettings(data.settings)); worker?.postMessage({ type: 'restart' }); notice('种子与设置已导入，宇宙已重新初始化');
  } catch (error) { notice(`导入失败：${error.message}`, true); }
  e.target.value = '';
};
$('#reset-settings').onclick = () => { changeSettings(normalizeSettings()); worker?.postMessage({ type: 'restart' }); notice('已恢复默认设置：文明延续优化、尾迹开启；文明档案保留'); };
// Keep the destructive action distinct from ordinary restart and settings reset.
async function clearRunHistory(){
  resetting=true;applyPause();
  if(!await store.clearHistory())throw new Error('历史数据库暂不可写');
  localStorage.removeItem(statisticsKey);
  localStorage.removeItem(resetPendingKey);
  worker?.terminate();history=[];state=null;window.__threeBodyState=null;lastEvent=lastTick=lastStatisticsSave=0;
  sessionId=crypto.randomUUID?.()||String(Date.now());renderer.clearTrails();renderer.snap=null;
  $('#civilization-log').replaceChildren();renderHistory();fatal=false;resetting=false;
  startWorker({});
}
$('#reset-history').onclick=async()=>{
  if(resetInProgress||!startWorker)return;
  const en=settings.cnen2;
  if(!confirm(en?'Erase all universe/civilization history, rankings and elapsed years? This cannot be undone. Settings and background will be kept.':'确定完全重置？将永久清空宇宙与文明历史、排行榜、累计年数，从第1号宇宙重新开始。设置与自定义背景保留。'))return;
  resetInProgress=true;$('#reset-history').disabled=true;
  try{
    // A reload after an interrupted clear must complete the clear before loading old statistics.
    localStorage.setItem(resetPendingKey,'1');await clearRunHistory();
    notice(en?'History cleared. Starting universe 1.':'全部历史已清空，已从第1号宇宙重新开始');
  }catch(error){notice(`完全重置未完成：${error.message}。${resetting?'模拟保持暂停，请重试完全重置。':'未清除记录，请检查浏览器存储权限后重试。'}`,true);}
  finally{resetInProgress=false;$('#reset-history').disabled=false;}
};
$('#export-history').onclick = () => downloadJSON('three-body-civilization-archive.json', { version: 1, records: history });

function renderHistory() {
  const list = $('#history-list'); list.replaceChildren();
  if (!history.length) { const li = document.createElement('li'); li.textContent = '尚无文明死亡记录。新的记录会自动保存在本机。'; list.append(li); return; }
  for (const entry of history.slice().reverse().slice(0, 200)) {
    const li = document.createElement('li'), title = document.createElement('b'), sub = document.createElement('small'), button = document.createElement('button');
    title.textContent = `宇宙${entry.universe||entry.generation||'?'} · 文明${entry.number} · ${entry.lifespan} 年 · ${entry.destructionEvent}`;
    sub.textContent = `${entry.seed} / 宇宙 ${entry.generation}${entry.development?` / Lv.${entry.development.level} ${entry.development.zh} / 发展 ${entry.development.developmentYears.toFixed(1)}年`:''} / ${new Date(entry.savedAt).toLocaleString()}`;
    button.textContent = '复现初始种子'; button.onclick = () => {
      const replay = entry.initialBodies ? settingsFromInitial(replaySettings(entry.settings), entry.initialBodies) : replaySettings(entry.settings);
      changeSettings(replay); worker?.postMessage({ type: 'restart' }); notice('已载入该文明完整初始条件');
    };
    li.append(title, sub, button); list.append(li);
  }
}
function renderStatistics(s){
  const stats=s.statistics;if(!stats)return;const en=settings.cnen2;const pair=entry=>entry.universe?(en?`U${entry.universe} · C${entry.number}`:`宇宙${entry.universe} · 文明${entry.number}`):(en?`History C${entry.number}`:`历史文明${entry.number}`);
  const years=n=>`${n>=1e7?n.toExponential(1):n.toFixed(1)}${en?' yr':'年'}`;
  $('#total-years').textContent=years(stats.totalYears);$('#current-universe').textContent=`#${stats.universe.number}`;
  $('#universe-years').textContent=years(stats.universe.lifespan);
  $('#current-civilization').textContent=stats.civilization?pair(stats.civilization):(en?'Awaiting birth':'等待诞生');
  $('#civilization-years').textContent=stats.civilization?years(stats.civilization.lifespan):'—';
  for(const [id,records]of[['civilization-ranking',stats.civilizationRanking],['universe-ranking',stats.universeRanking]]){
    const list=$(`#${id}`);if(list.children.length!==5){list.replaceChildren();for(let i=0;i<5;i++){const li=document.createElement('li');li.innerHTML='<span class="rank-number"></span><span class="rank-id"></span><span class="rank-years"></span>';list.append(li);}}
    [...list.children].forEach((li,i)=>{const entry=records[i];li.dataset.active=String(!!entry?.active);li.querySelector('.rank-number').textContent=String(i+1).padStart(2,'0');li.querySelector('.rank-id').textContent=entry?`${id==='civilization-ranking'?pair(entry):'#'+entry.number}${entry.active?' ·':''}`:'—';li.querySelector('.rank-years').textContent=entry?years(entry.lifespan):'—';const opacityKey=['t9','t10','tex4opacity','tex5opacity','tex6opacity'][i];li.style.opacity=Math.min(1,(entry?.active ? .85 : .58)*settings[opacityKey]/propertySchema[opacityKey].value);li.title=[entry?.active?(en?'Still running':'仍在运行'):'',entry?.development?`Lv.${entry.development.level} · ${en?entry.development.en:entry.development.zh} · ${entry.development.developmentYears.toFixed(1)}${en?' development years':'发展年'}`:''].filter(Boolean).join(' / ');});
  }
}
function renderState(s) {
  const en = settings.cnen2;
  const absent=s.world?.planet.present===false,stopped=!!s.physics?.stellarFailure;
  const numerical=!!s.executionError||!!s.physics?.numericalError;
  $('#era').textContent = s.era; $('#temperature').textContent = absent?'—':s.temperature.toFixed(1);
  const condition=s.world?.planet.condition,planetLabels={temperate:['温带行星','Temperate'],hot:['高温行星','Overheated'],frozen:['冰封行星','Frozen'],molten:['熔融行星','Molten'],damaged:['行星受损 · 可恢复','Recoverable damage'],recovering:['行星结构恢复中','Structure recovering'],'tidal-stress':['潮汐应力过高','High tidal stress'],engulfed:['行星已被吞噬','Planet engulfed'],disrupted:['行星已被撕裂','Planet disrupted']};
  $('#hydration').textContent=planetLabels[condition]?.[en?1:0]||'';
  if(absent)$('#hydration').textContent=en?'Planet absent · P5 regeneration':'行星已毁灭 · 等待 P5 重生';
  const phase=settings.civilizationMode==='legacy'?(s.alive?'active':'empty'):(s.civilizationState?.phase||'empty'),phases={empty:['等待文明诞生','Awaiting civilization'],active:['恢复生产 · 文明发展','Production and development'],dehydrating:['脱水保存中','Dehydrating'],dormant:['干仓储存 · 等待复苏','Dry storage'],rehydrating:['浸泡复苏中','Rehydrating'],destroyed:['文明已终结','Civilization ended']};
  $('#civilization-phase').textContent=phases[phase]?.[en?1:0]||'';$('#civilization-phase-detail').textContent=s.alive?(en?`U${s.generation} · C${s.civilization} · ${s.lifespan} years`:`宇宙${s.generation} · 文明${s.civilization} · 已延续${s.lifespan}年`):(en?'Dehydration preserves a civilization; it is not a rebirth.':'脱水保存与浸泡复苏延续同一文明');
  if(absent){$('#civilization-phase').textContent=en?'Awaiting a new planet':'等待新行星';const remaining=s.physics?.planetRespawnInYears;$('#civilization-phase-detail').textContent=remaining===null||remaining===undefined?'—':en?`New planet in ${remaining.toFixed(1)} years`:`新行星将在 ${remaining.toFixed(1)} 年后生成`;}
  if(stopped){$('#civilization-phase').textContent=en?'System stopped':'三星系统已停止';$('#civilization-phase-detail').textContent=en?'Start a new universe manually':'请手动开启新宇宙';}
  if(stopped)$('#era').textContent=en?'STOPPED':'已停止';
  if(numerical){$('#era').textContent=en?'NUMERICAL ERROR':'数值异常';$('#civilization-phase').textContent=en?'Simulation paused':'模拟已暂停';$('#civilization-phase-detail').textContent=en?'Check initial conditions or select legacy physics':'请检查初始条件或切换旧版物理';}
  $('#phenomena').textContent=(s.world?.phenomena||[]).map(p=>en?p.en:p.zh).join(' · ');
  const development=s.civilizationState?.development;
  $('#civilization-level').textContent=development?`Lv.${development.level} · ${en?development.en:development.zh}`:'';
  $('#civilization-development').textContent=development?(en?`Development ${development.developmentYears.toFixed(1)} years${development.nextYears?` / ${development.nextYears}`:''}`:`发展积累 ${development.developmentYears.toFixed(1)}年${development.nextYears?` / 下一级 ${development.nextYears}年`:settings.civilizationLevels?' · 已达最高阶段':' · 等级已关闭'}`):'';
  const habitat = s.habitability;
  $('#habitability-readout').hidden = !habitat?.enabled;$('#civilization-reserves').hidden=!habitat?.enabled;
  if (habitat?.enabled) {
    $('#habitability-score').textContent = `${Math.round(habitat.score * 100)}%`;
    $('#civilization-health').textContent = habitat.health===null?'—':`${Math.round(habitat.health * 100)}%`;
    $('#civilization-reserves').textContent=habitat.population===null?(en?'No civilization yet':'文明尚未诞生'):(en?`Population ${Math.round(habitat.population*100)}% · Dry storage ${Math.round(habitat.storageQuality*100)}%`:`人口储备 ${Math.round(habitat.population*100)}% · 干仓质量 ${Math.round(habitat.storageQuality*100)}%`);
    $('#habitability-fill').style.width = `${habitat.score * 100}%`;
    $('#health-fill').style.width = `${habitat.health * 100}%`;
  }
  $('#temperature-indicator').style.left = `${(s.temperature + 270) / 1770 * 100}%`;
  $('.temperature').style.color = s.temperature > settings.newproperty46 ? '#dcb09c' : s.temperature < settings.newproperty45 ? '#8dbde5' : 'var(--accent)';
  $('#civilization-status').textContent = s.text[0]; $('#civilization-lifespan').textContent = s.text[6];
  if(stopped)$('#civilization-status').textContent=en?'Stellar system failed · simulation stopped':'三星系统失效 · 模拟已停止';
  if(numerical)$('#civilization-status').textContent=en?'Numerical error · simulation paused':'数值异常 · 模拟已暂停';
  const log=$('#civilization-log'),items=s.logItems??s.log.map((text,i)=>({id:text,zh:text,en:text,at:s.runtime-i*5,legacy:true}));
  const retained=new Set();
  items.slice(0,6).forEach((entry,i)=>{
    const id=String(entry.id);retained.add(id);let li=[...log.children].find(el=>el.dataset.id===id);
    if(!li){li=document.createElement('li');li.dataset.id=id;log.append(li);}
    li.textContent=entry.legacy?entry.zh:(en?`Year ${Math.floor(entry.year)} · ${entry.en}`:`第${Math.floor(entry.year)}年，${entry.zh}`);
    li.style.opacity=Math.min(1,settings.t3*1.8)*Math.pow(.94,i)*Math.max(0,1-(s.runtime-entry.at)/120);
    log.append(li);
  });
  [...log.children].forEach(li=>{if(!retained.has(li.dataset.id))li.remove();});
  renderStatistics(s);
  $('#simulation-year').textContent = s.year >= 1e8 ? s.year.toExponential(2) : s.year.toFixed(2);
  $('#restart-prompt').hidden = !(s.world?.planet.restartRequired||s.escapeStatus?.confirmed||(settings.civilizationMode==='legacy'&&s.escaped)) || (settings.autorestart&&settings.stabilityMode==='off');
  $('#restart-prompt span').textContent=s.world?.planet.terminal?(en?s.world.planet.terminal.en:s.world.planet.terminal.zh):s.world?.planet.damaged?(en?'PLANETARY DAMAGE':'行星结构受损'):(en?'CELESTIAL ESCAPE':'天体已逃逸');
  if(stopped){const reason=s.physics.stellarFailure.kind;$('#restart-prompt span').textContent=reason==='stellar-contact'?(en?'STELLAR CONTACT':'恒星发生接触'):reason==='triple-disintegration'?(en?'STELLAR SYSTEM DISINTEGRATED':'三星系统瓦解'):(en?'STELLAR ESCAPE':'恒星逃逸');}
  $('#restart-prompt strong').textContent=en?`Start universe ${s.generation+1} ↻`:`开启第${s.generation+1}号宇宙 ↻`;

  if (settings.cheatingcheck) $('#physics-check').textContent = `${settings.newproperty60 ? (settings.stabilityMode==='off'?'CAGE ON / ':'V2 PROTECTION ON / ') : ''}G × ${settings.newproperty52 / 1000} / T DIST × ${settings.newproperty69}\n${settings.physicsMode === 'reference' ? 'REFERENCE 60 Hz' : 'REAL TIME'}`;
  const physics=s.physics;
  const conservationLabel=physics?.control?'V2：控制与行星外部预算分列':physics?.cageActive?'牢笼外力：不作孤立守恒判定':physics&&!physics.physicalModelValid?'三星完整性已失效':'孤立系统';
  const diagnosticText=physics?.control?` · ${conservationLabel} · 数值能量残差 ${physics.relativeEnergyError.toExponential(2)} · 控制累计绝对功 ${physics.control.absoluteWork.toExponential(2)} · 额外冲量 ${physics.control.impulse.toExponential(2)} · 净ΔL ${Math.hypot(...physics.control.deltaL).toExponential(2)} · P5矢量冲量 ${physics.planetExternal.vectorImpulse?.toExponential(2)??'—'}${physics.planetExternal.vectorImpulseComplete?'':'（部分）'} · 行星损失/重生 ${physics.planetLosses}/${physics.planetRespawns}`:physics?` · ${conservationLabel} · ΔE惯性 ${physics.relativeInertialEnergyError.toExponential(2)} · ΔE内部 ${physics.relativeEnergyError.toExponential(2)} · ΔL ${physics.relativeAngularMomentumError.toExponential(2)} · ΔP ${physics.normalizedMomentumDrift.toExponential(2)} · 固定初始质心 / ΔR ${physics.centerPositionDrift.toExponential(2)} / ΔVcm ${physics.centerVelocityDrift.toExponential(2)}`:'';
  $('#runtime-diagnostics').textContent = `Three.js WebGL · ${fps} FPS · Worker 60 Hz · Tick ${s.tick} · ${s.bodies.length} bodies · 宇宙 ${s.generation} · Seed ${s.seed} · ${renderer.canvas.width}×${renderer.canvas.height}${physics?' · '+physics.model:''}${diagnosticText}`;
}
function handleEvents(events) {
  for (const event of events) {
    if (event.id <= lastEvent) continue; lastEvent = event.id;
    window.dispatchEvent(new CustomEvent(event.type, { detail: event }));
    if (event.type === 'civilization:death') {
      const record = { ...event.detail, key: `${sessionId}:${event.id}`, year: event.year, savedAt: Date.now(), algorithm: event.detail.algorithm || algorithmId(settings) };
      history.push(record); store.put('history', record).then(ok => { if (!ok) $('#save-status').textContent = '档案仅保留在内存'; });
      if (currentTab === 'history') renderHistory();
    }
  }
}

let loadingTimer;
function showLoading(restarting = false) {
  const overlay = $('#loading-overlay'); overlay.hidden = false; overlay.classList.remove('done');
  overlay.style.backgroundColor = `rgba(3,6,9,${settings.newproperty15})`;
  $('#loading-text').textContent = restarting ? '文明档案已存档 / 正在构建新的宇宙' : '引力构建完成 / 宇宙正在载入';
  $('#login-title').hidden = !settings.newproperty63; $('#login-password').hidden = !settings.newproperty63;
  $('#enter-universe').hidden = !settings.newproperty63;
  clearTimeout(loadingTimer); loadingTimer = setTimeout(hideLoading, restarting ? 2200 : 3500);
}
function hideLoading() { clearTimeout(loadingTimer); $('#loading-overlay').classList.add('done'); setTimeout(() => { if ($('#loading-overlay').classList.contains('done')) $('#loading-overlay').hidden = true; }, 1600); }
$('#enter-universe').onclick = hideLoading;

buildSettings(); applyAppearance();
const layoutEditor=installLayoutEditor({getSettings:()=>settings,save:changeSettings,setPanel,updateControls});
addEventListener('resize',()=>{applyAppearance();updateControls();});
document.fonts.ready.then(()=>{applyAppearance();updateControls();});
const audio = new AudioController((values, average) => {
  if (renderer) renderer.audioLevel = settings.audioresponse ? average : 0;

});

try {
  renderer = new SpaceRenderer($('#universe'), $('#body-labels'), settings);
  const blob = new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }); const workerURL = URL.createObjectURL(blob);
  startWorker=statistics=>{
  const activeWorker=new Worker(workerURL);worker=activeWorker;activeWorker.onmessage = ({ data }) => {
    if(resetting||worker!==activeWorker)return;
    if (data.type === 'error') { fatal = true; console.error('Simulation worker:', data); notice(`模拟异常：${data.message}。请恢复默认设置后重试。`, true); return; }
    if (data.type === 'state') { fatal=false;state = data.state; lastTick = state.tick; window.__threeBodyState = state; renderer.ingest(state); renderState(state); handleEvents(state.events);persistStatistics(); }
  };
  worker.onerror = event => { if(resetting||worker!==activeWorker)return;fatal = true; console.error(event); notice('后台模拟无法启动。请通过本地服务器或 Wallpaper Engine 打开此项目。', true); };
  worker.postMessage({type:'init',settings,statistics});applyPause();
  };
  (async()=>{
    let interrupted=false;try{interrupted=!!localStorage.getItem(resetPendingKey);}catch{}
    if(interrupted){resetInProgress=true;try{await clearRunHistory();}finally{resetInProgress=false;}return;}
    const startupSession=sessionId,records=await store.getAll('history');
    // A user may initiate reset while IndexedDB is still opening.
    if(sessionId!==startupSession||resetting||resetInProgress)return;
    history=records.sort((a,b)=>a.savedAt-b.savedAt);startWorker({...(savedStatistics()||{}),legacyRecords:history});
  })().catch(error=>{notice(`历史载入未完成：${error.message}。请重试完全重置。`,true);});
  installWallpaperBridge({ changeSettings, renderer, audio, setHostPaused: value => { hostPaused = value; applyPause(); } });
  store.getAsset('background').then(file => { if (file) { customURL = URL.createObjectURL(file); renderer.setCustomBackground(customURL); } });
  let lastFrame = performance.now(), startTime = lastFrame, fpsStart = lastFrame, frames = 0, lastDraw = 0;
  const animate = now => {
    requestAnimationFrame(animate);
    const cap = window.__wallpaperFPS || 60; if (now - lastDraw < 1000 / cap - 1) return;
    lastDraw = now; const frameDt=(now-lastFrame)/1000,dt=Math.min(.1,frameDt); lastFrame = now;
    if (hostPaused || visibilityPaused) return;
    audio.tick(); renderer.render(userPaused ? 0 : dt, (now - startTime) / 1000,userPaused?0:Math.min(1,frameDt));
    frames++; if (now - fpsStart > 1000) { fps = Math.round(frames * 1000 / (now - fpsStart)); frames = 0; fpsStart = now; }
  };
  requestAnimationFrame(animate);
  setInterval(() => {
    const d = new Date(); const locale = settings.cnen2 ? 'en-GB' : 'zh-CN';
    const parts = d.toLocaleTimeString('en-GB', { hour12: false }).split(':');
    $('#clock-time').replaceChildren(document.createTextNode(`${parts[0]}:${parts[1]}`)); const sec = document.createElement('span'); sec.textContent = `:${parts[2]}`; $('#clock-time').append(sec);
    $('#clock-day').textContent = d.toLocaleDateString(locale, { weekday: 'long' }); $('#clock-date').textContent = d.toLocaleDateString('en-CA').replaceAll('/', '.');
  }, 1000);
  if (settings.newproperty64 || settings.newproperty63) showLoading(); else $('#loading-overlay').hidden = true;
  if (settings.menuinit) setPanel(true);
  addEventListener('pagehide',()=>persistStatistics(true));
  addEventListener('beforeunload', () => { persistStatistics(true);worker?.terminate(); URL.revokeObjectURL(workerURL); if (customURL) URL.revokeObjectURL(customURL); });
} catch (error) {
  fatal = true; console.error(error); hideLoading(); notice(`无法初始化 3D 场景：${error.message}。请启用浏览器硬件加速。`, true);
}
// Diagnostic readout for automated smoke checks and host integrations.
window.__threeBodyDiagnostics = () => ({ ready: !!state && !fatal, tick: lastTick, fps, paused: userPaused || hostPaused || visibilityPaused, controls: controlMap.size, history: history.length, worker: !!worker,
  scene: renderer ? { canvas:[renderer.canvas.width,renderer.canvas.height], drawingBuffer:[renderer.renderer.getContext().drawingBufferWidth,renderer.renderer.getContext().drawingBufferHeight], renderedFrames:renderer.renderer.info.render.frame, viewVelocity:[renderer.rot.vx,renderer.rot.vy], speedLimited:false, compassOpacity:renderer.compass.children.map(n=>n.material.opacity), idleYaw:renderer.autoAngle, returningToGalaxy:renderer.returning, systemOffset:renderer.system.position.toArray(),displayOrigin:{...renderer.fixedFrame.origin},cameraPosition:renderer.camera.position.toArray(),renderTime:renderer.renderTime,trailStyle:"continuous-ribbon",trailHeads:renderer.trails.map(l=>l.segmentCount?Array.from(l.geometry.attributes.position.array.slice(l.segmentCount*6,l.segmentCount*6+3)):null),bodyVisible:renderer.nodes.map(n=>n.group.visible),trailVisible:renderer.trails.map(t=>t.visible),bodyLocalPositions:renderer.nodes.map(n=>n.group.position.toArray()),bodyWorldPositions:renderer.nodes.map(n=>n.group.getWorldPosition(new renderer.camera.position.constructor()).toArray()), compassScale:renderer.compass.scale.x, compassTarget:renderer.compassTarget, compassFade:renderer.compassFade, viewSensitivity:settings.viewSensitivity, dragSensitivity:settings.dragSensitivity, dustLayers:renderer.dustLayers.map(d=>({visible:d.visible,count:d.geometry.drawRange.count,size:d.material.size,opacity:d.material.opacity,blending:d.material.blending,alphaTest:d.material.alphaTest})), pointerMode:+settings.newproperty61, galaxyCoreScreen:renderer.sky.localToWorld(renderer.galaxyDirection.clone().multiplyScalar(90)).project(renderer.camera).toArray(), layoutEditing:layoutEditor.editing, compassVisible:renderer.compass.visible, maxTextureSize:renderer.renderer.capabilities.maxTextureSize, backgroundSizes:Object.fromEntries(Object.entries(renderer.bgTextures).map(([k,t])=>[k,[t.image?.width||0,t.image?.height||0]])), backgroundFollowsView: renderer.sky.parent === renderer.world, viewRotation: renderer.world.rotation.toArray().slice(0,3), skyRotation: renderer.sky.getWorldQuaternion(new renderer.camera.quaternion.constructor()).toArray(), bodyShapes: renderer.nodes.map(n => n.mesh.geometry.type), glowShape: 'radial-circle', bodyLabelsVisible:renderer.nodes.some(n=>!n.label.hidden), trailSamples: renderer.trailBuffers.map(b => b.length), trailComplexity:renderer.trailComplexity||0, trailMetrics:renderer.trailMetrics||[], trailsVisible: renderer.trails.every(t => t.visible) } : null });

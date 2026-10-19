import { SpaceRenderer } from './renderer.js';
import { effectivePropertySchema as propertySchema, migrateSettings } from './settings.js';
import { normalizeSettings, colorHex, fromHex, colorRGB, plainText, settingsFromInitial, algorithmId } from './settings.js';
import { LocalStore } from './storage.js';
import { AudioController } from './audio.js';
import { installWallpaperBridge } from './bridge.js';
import './style.css';

const $ = selector => document.querySelector(selector);
const settingsKey = 'three-body.settings.v3';
const statisticsKey='three-body.statistics.v1';let lastStatisticsSave=0;
function persistStatistics(force=false){
  if(!state?.statisticsCheckpoint||(!force&&performance.now()-lastStatisticsSave<1000))return;
  try{localStorage.setItem(statisticsKey,JSON.stringify(state.statisticsCheckpoint));lastStatisticsSave=performance.now();}catch{}
}
function savedStatistics(){try{return JSON.parse(localStorage.getItem(statisticsKey)||'null');}catch{return null;}}
let settings;
try {
  const saved=localStorage.getItem(settingsKey),v2=localStorage.getItem('three-body.settings.v2'),v1=localStorage.getItem('three-body.settings.v1');
  settings=saved?migrateSettings(JSON.parse(saved),3):migrateSettings(JSON.parse(v2||v1||'{}'),2);
} catch { settings=normalizeSettings(); }
const store = new LocalStore();
let state = null, userPaused = false, hostPaused = false, visibilityPaused = false, worker, renderer, lastEvent = 0, currentTab = 'settings';
let sessionId = crypto.randomUUID?.() || String(Date.now());
let customURL = null, history = [], lastTick = 0, fps = 0, fatal = false;
const controlMap = new Map();
const notice = (message, error = false) => {
  $('#notice').textContent = message; $('#notice').hidden = false; $('#notice').classList.toggle('error', error);
  clearTimeout(notice.timer); notice.timer = setTimeout(() => { $('#notice').hidden = true; }, error ? 14000 : 4000);
};

function saveSettings() {
  try { localStorage.setItem(settingsKey, JSON.stringify(settings)); $('#save-status').textContent = settings.cnen2 ? 'Saved locally' : '已保存到本机'; }
  catch { $('#save-status').textContent = '本地存储不可用'; }
}
function changeSettings(patch, options = {}) {
  const previous = settings;
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
  if (open) setTimeout(() => $('#settings-search').focus(), 80); else $('#settings-toggle').focus();
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

const hintMap = {
  newproperty7: '原版此项为固定值：引力指数恒为 2。保留设置定义，但不改变原算法。',
  cnen1: '切换原版使用说明的语言；界面语言请使用快捷设置中的 Language。',
  menuinit: '下次载入时，默认打开右下角的完整设置面板。',
  newproperty53: '修改后立即重建物理积分器；文明历史保留。',
  t: '原版按适温帧累计；本版本固定 60 Hz 检测，并非按年计数。',
  newproperty26: '保留原版时间因子重复相乘的算法，以匹配原版节奏。',
  cheatingcheck: '标记引力牢笼、温度距离倍数及非默认物理参数。',
  custombg: '选择球面全景图。文件仅保存在本机；WE 中也可使用原生背景属性。',
  newproperty63: '原版虚构账号与密码的视觉展示，不涉及实际账号登录。',
  civilizationMode: '纪元由轨道稳定性判断；文明在 −20～40°C 活动，脱水保存、原编号复苏。行星毁坏后只能重建宇宙。原版模式保留旧判定。',
  thermalGrace: '活动与干仓采用各自温度边界；持续极端温度会毁灭干仓。数值为模拟参数，可自行调整。'
};
function makeControl(key, def, extension = false) {
  const container = document.createElement('div'); container.className = 'control'; container.dataset.key = key;
  const heading = document.createElement('div'); heading.className = 'control-head';
  const label = document.createElement('label'); label.htmlFor = `setting-${key}`; label.textContent = plainText(def.text).trim(); heading.append(label); container.append(heading);
  let input, number;
  if (def.type === 'bool') { input = document.createElement('input'); input.type = 'checkbox'; heading.append(input); input.onchange = () => changeSettings({ [key]: input.checked }); }
  else if (def.type === 'color') { input = document.createElement('input'); input.type = 'color'; heading.append(input); input.onchange = () => changeSettings({ [key]: fromHex(input.value) }); }
  else if (def.type === 'slider') {
    input = document.createElement('input'); input.type = 'range'; input.min = def.min; input.max = def.max;
    input.step = def.fraction === false || def.integer ? 1 : def.step || (def.max - def.min > 1e5 ? 1000 : 0.001);
    number = document.createElement('input'); number.type = 'number'; number.className = 'number-value'; number.min = def.min; number.max = def.max; number.step = input.step; number.setAttribute('aria-label', label.textContent);
    heading.append(number); container.append(input);
    input.oninput = () => { number.value = input.value; };
    input.onchange = () => changeSettings({ [key]: +input.value });
    number.onchange = () => { if (number.value !== '' && Number.isFinite(+number.value)) changeSettings({ [key]: +number.value }); else updateControls(); };
    if (key === 'newproperty7') input.disabled = number.disabled = true;
  } else if (def.type === 'combo') {
    input = document.createElement('select');
    for (const option of def.options) { const o = document.createElement('option'); o.value = option.value; o.textContent = option.label; input.append(o); }
    container.append(input); input.onchange = () => changeSettings({ [key]: input.value });
  } else if (def.type === 'scenetexture') {
    input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; container.append(input);
    input.onchange = async () => {
      const file = input.files[0]; if (!file) return;
      if (file.size > 40 * 1024 * 1024) { notice('请选择小于 40 MB 的背景图片。', true); return; }
      try {
        const bitmap = await createImageBitmap(file); bitmap.close();
        if (customURL) URL.revokeObjectURL(customURL); customURL = URL.createObjectURL(file); renderer.setCustomBackground(customURL);
        const saved = await store.put('assets', file, 'background'); changeSettings({ custombg: file.name, newproperty17: '3' });
        notice(saved ? '背景已保存在本机' : '背景已载入；当前环境不支持持久保存');
      } catch { notice('无法读取这张图片，请选择 PNG、JPEG 或 WebP。', true); }
    };
  } else { input = document.createElement('input'); input.type = 'text'; container.append(input); input.onchange = () => changeSettings({ [key]: input.value }); }
  input.id = `setting-${key}`;
  const hint = hintMap[key]; if (hint) { const p = document.createElement('small'); p.className = 'control-hint'; p.textContent = hint; container.append(p); }
  controlMap.set(key, { input, number, type: def.type, container, extension }); return container;
}
function groupElement(title, open = false) {
  const group = document.createElement('details'); group.className = 'setting-group'; group.open = open;
  const summary = document.createElement('summary'); summary.textContent = title; group.append(summary); return group;
}
function buildSettings() {
  const extras = groupElement('运行与可复现种子 / Runtime', true);
  for (const [key, def] of Object.entries({
    seed: { type: 'textinput', text: '随机初始化 Seed' },
    physicsMode: { type: 'combo', text: '物理时钟', options: [{ value: 'reference', label: '原版节奏 · 固定 60 Hz（默认）' }, { value: 'realtime', label: '墙钟同步 · 修复原版每帧步数上限' }] },
    civilizationMode: { type: 'combo', text: '文明延续机制 / Civilization', options: [{ value: 'balanced', label: '原著规则 · 脱水、休眠与复苏（默认）' }, { value: 'legacy', label: '原版即时判定' }] },
    thermalGrace: { type: 'slider', text: '气候耐受时间 / Climate resilience (s)', min: 1, max: 60, step: 1 },
    wakeDelay: { type: 'slider', text: '复苏安全窗口 / Safe window (s)', min: 1, max: 60, step: .5 },
    epochWindow: { type: 'slider', text: '恒纪元轨道确认 / Orbital stability (s)', min: .25, max: 20, step: .25 },
    climateInertia: { type: 'slider', text: '气候热惯性 / Thermal inertia (s)', min: .05, max: 30, step: .05 },
    stellarBreathing: { type: 'bool', text: '恒星半径缓慢呼吸 / Stellar breathing' },
    renderQuality: { type: 'combo', text: '渲染清晰度 / Render resolution', options: [{value:'native',label:'原生屏幕分辨率 · 8K 原图（默认）'},{value:'8k',label:'8K 超采样 · 最高 7680×4320'}] },
    trailsLength: { type: 'slider', text: '自适应尾迹长度基准 / Trail length', min: 20, max: 2000, integer: true },
    pixelRatio: { type: 'slider', text: '最大渲染像素比 / Pixel ratio', min: .5, max: 4, step: .1 },
    bodyLabels: { type: 'bool', text: '显示天体标签 / Body labels' },
    music: { type: 'bool', text: '播放原版音乐 · Ether' },
    volume: { type: 'slider', text: '音乐音量 / Volume', min: 0, max: 1, step: .01 }
  })) extras.append(makeControl(key, def, true));
  $('#extension-controls').append(extras);
  const root = $('#original-controls'); let group = groupElement('通用 / General'); root.append(group);
  for (const [key, def] of Object.entries(propertySchema).sort((a, b) => a[1].index - b[1].index)) {
    if (def.type === 'group') { group = groupElement(plainText(def.text), key === 'newproperty27'); group.dataset.group = key; root.append(group); }
    else if (def.type) group.append(makeControl(key, def));
    else {
      const text = plainText(def.text).trim(); if (!text) continue;
      const note = document.createElement('p'); note.className = 'setting-note';
      if (text.length > 450) {
        const expanded = document.createElement('details'); expanded.className = 'long-note'; expanded.dataset.note = key;
        const summary = document.createElement('summary'); summary.textContent = settings.cnen1 ? '原版说明 / Guide' : 'Guide / 原版说明'; expanded.append(summary); note.textContent = text; expanded.append(note); group.append(expanded);
      } else { note.textContent = text; group.append(note); }
    }
  }
  for (const g of root.querySelectorAll('.setting-group')) { const n = g.querySelectorAll('.control').length; const tag = document.createElement('span'); tag.textContent = String(n).padStart(2, '0'); g.querySelector(':scope > summary').append(tag); }
  updateControls();
}
function updateControls() {
  for (const [key, { input, number, type }] of controlMap) {
    if (type === 'bool') input.checked = !!settings[key];
    else if (type === 'color') input.value = colorHex(settings[key]);
    else if (type !== 'scenetexture') { input.value = settings[key]; if (number) number.value = settings[key]; }
  }
}
$('#settings-search').oninput = () => {
  const query = $('#settings-search').value.trim().toLowerCase(); let count = 0;
  for (const [key, { container }] of controlMap) { const match = !query || (key + container.textContent).toLowerCase().includes(query); container.hidden = !match; if (match) count++; }
  for (const group of document.querySelectorAll('.setting-group')) {
    const match = !query || [...group.querySelectorAll('.control')].some(c => !c.hidden) || group.querySelector('summary').textContent.toLowerCase().includes(query);
    group.hidden = !match; if (query && match) group.open = true;
    group.querySelectorAll('.setting-note,.long-note').forEach(el => el.hidden = !!query);
  }
  $('#search-empty').hidden = count > 0;
};
for (const button of document.querySelectorAll('[data-tab]')) button.onclick = () => {
  currentTab = button.dataset.tab;
  for (const b of document.querySelectorAll('[data-tab]')) b.classList.toggle('active', b === button);
  for (const name of ['settings', 'history', 'about']) $(`#${name}-content`).hidden = name !== currentTab;
  $('#settings-search').disabled = currentTab !== 'settings'; if (currentTab === 'history') renderHistory();
};

function applyAppearance() {
  const s = settings, en = s.cnen2;
  document.documentElement.lang = en ? 'en' : 'zh-CN'; document.documentElement.style.setProperty('--accent', colorHex(s.datacolor));
  for (const el of document.querySelectorAll('[data-note]')) { if (el.dataset.note === '_2') el.hidden = !s.cnen1; if (el.dataset.note === '_3d') el.hidden = s.cnen1; }
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
  const tabNames = en ? ['Settings', 'Archive', 'About'] : ['全部设置', '文明档案', '项目说明']; document.querySelectorAll('[data-tab]').forEach((b, i) => b.textContent = tabNames[i]);
}

function applyPause() { worker?.postMessage({ type: 'pause', value: userPaused || hostPaused || visibilityPaused }); }
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
    changeSettings(data.initialBodies ? settingsFromInitial(data.settings, data.initialBodies) : data.settings); worker?.postMessage({ type: 'restart' }); notice('种子与设置已导入，宇宙已重新初始化');
  } catch (error) { notice(`导入失败：${error.message}`, true); }
  e.target.value = '';
};
$('#reset-settings').onclick = () => { changeSettings(normalizeSettings()); worker?.postMessage({ type: 'restart' }); notice('已恢复默认设置：文明延续优化、尾迹开启；文明档案保留'); };
$('#export-history').onclick = () => downloadJSON('three-body-civilization-archive.json', { version: 1, records: history });

function renderHistory() {
  const list = $('#history-list'); list.replaceChildren();
  if (!history.length) { const li = document.createElement('li'); li.textContent = '尚无文明死亡记录。新的记录会自动保存在本机。'; list.append(li); return; }
  for (const entry of history.slice().reverse().slice(0, 200)) {
    const li = document.createElement('li'), title = document.createElement('b'), sub = document.createElement('small'), button = document.createElement('button');
    title.textContent = `#${entry.number} · ${entry.lifespan} 年 · ${entry.destructionEvent}`;
    sub.textContent = `${entry.seed} / 宇宙 ${entry.generation} / ${new Date(entry.savedAt).toLocaleString()}`;
    button.textContent = '复现初始种子'; button.onclick = () => {
      const replay = entry.initialBodies ? settingsFromInitial(entry.settings, entry.initialBodies) : entry.settings;
      changeSettings(replay); worker?.postMessage({ type: 'restart' }); notice('已载入该文明完整初始条件');
    };
    li.append(title, sub, button); list.append(li);
  }
}
function renderStatistics(s){
  const stats=s.statistics;if(!stats)return;const en=settings.cnen2;
  const years=n=>`${n>=1e7?n.toExponential(1):n.toFixed(1)}${en?' yr':'年'}`;
  $('#total-years').textContent=years(stats.totalYears);$('#current-universe').textContent=`#${stats.universe.number}`;
  $('#universe-years').textContent=years(stats.universe.lifespan);
  $('#current-civilization').textContent=stats.civilization?`#${stats.civilization.number}`:(en?'Awaiting birth':'等待诞生');
  $('#civilization-years').textContent=stats.civilization?years(stats.civilization.lifespan):'—';
  for(const [id,records]of[['civilization-ranking',stats.civilizationRanking],['universe-ranking',stats.universeRanking]]){
    const list=$(`#${id}`);if(list.children.length!==5){list.replaceChildren();for(let i=0;i<5;i++){const li=document.createElement('li');li.innerHTML='<span class="rank-number"></span><span class="rank-id"></span><span class="rank-years"></span>';list.append(li);}}
    [...list.children].forEach((li,i)=>{const entry=records[i];li.dataset.active=String(!!entry?.active);li.querySelector('.rank-number').textContent=String(i+1).padStart(2,'0');li.querySelector('.rank-id').textContent=entry?`#${entry.number}${entry.active?' ·':''}`:'—';li.querySelector('.rank-years').textContent=entry?years(entry.lifespan):'—';const opacityKey=['t9','t10','tex4opacity','tex5opacity','tex6opacity'][i];li.style.opacity=Math.min(1,(entry?.active ? .85 : .58)*settings[opacityKey]/propertySchema[opacityKey].value);li.title=entry?.active?(en?'Still running':'仍在运行'):'';});
  }
}
function renderState(s) {
  const en = settings.cnen2;
  $('#era').textContent = s.era; $('#temperature').textContent = s.temperature.toFixed(1);
  const condition=s.world?.planet.condition,planetLabels={temperate:['温带行星','Temperate'],hot:['高温行星','Overheated'],frozen:['冰封行星','Frozen'],molten:['熔融行星','Molten'],damaged:['行星结构受损','Planetary damage'],'tidal-stress':['潮汐应力过高','High tidal stress'],engulfed:['行星已被吞噬','Planet engulfed'],disrupted:['行星已被撕裂','Planet disrupted']};
  $('#hydration').textContent=planetLabels[condition]?.[en?1:0]||'';
  $('#phenomena').textContent=(s.world?.phenomena||[]).map(p=>en?p.en:p.zh).join(' · ');
  const habitat = s.habitability;
  $('#habitability-readout').hidden = !habitat?.enabled;
  if (habitat?.enabled) {
    $('#habitability-score').textContent = `${Math.round(habitat.score * 100)}%`;
    $('#civilization-health').textContent = `${Math.round(habitat.health * 100)}%`;
    $('#habitability-fill').style.width = `${habitat.score * 100}%`;
    $('#health-fill').style.width = `${habitat.health * 100}%`;
  }
  $('#temperature-indicator').style.left = `${(s.temperature + 270) / 1770 * 100}%`;
  $('.temperature').style.color = s.temperature > settings.newproperty46 ? '#dcb09c' : s.temperature < settings.newproperty45 ? '#8dbde5' : 'var(--accent)';
  $('#civilization-status').textContent = s.text[0]; $('#civilization-lifespan').textContent = s.text[6];
  const log=$('#civilization-log'),items=s.logItems?.length?s.logItems:s.log.map((text,i)=>({id:text,zh:text,en:text,at:s.runtime-i*5,legacy:true}));
  const retained=new Set();
  items.slice(0,10).forEach((entry,i)=>{
    const id=String(entry.id);retained.add(id);let li=[...log.children].find(el=>el.dataset.id===id);
    if(!li){li=document.createElement('li');li.dataset.id=id;log.append(li);}
    li.textContent=entry.legacy?entry.zh:(en?`Year ${Math.floor(entry.year)} · ${entry.en}`:`第${Math.floor(entry.year)}年，${entry.zh}`);
    li.style.opacity=Math.min(1,settings.t3*1.8)*Math.pow(.94,i)*Math.max(0,1-(s.runtime-entry.at)/120);
    log.append(li);
  });
  [...log.children].forEach(li=>{if(!retained.has(li.dataset.id))li.remove();});
  renderStatistics(s);
  $('#simulation-year').textContent = s.year >= 1e8 ? s.year.toExponential(2) : s.year.toFixed(2);
  $('#restart-prompt').hidden = !(s.escaped||s.world?.planet.restartRequired) || settings.autorestart;
  $('#restart-prompt span').textContent=s.world?.planet.terminal?(en?s.world.planet.terminal.en:s.world.planet.terminal.zh):s.world?.planet.damaged?(en?'PLANETARY DAMAGE':'行星结构受损'):(en?'CELESTIAL ESCAPE':'天体已逃逸');
  $('#restart-prompt strong').textContent=en?`Start universe ${s.generation+1} ↻`:`开启第${s.generation+1}号宇宙 ↻`;

  if (settings.cheatingcheck) $('#physics-check').textContent = `${settings.newproperty60 ? 'CAGE ON / ' : ''}G × ${settings.newproperty52 / 1000} / T DIST × ${settings.newproperty69}\n${settings.physicsMode === 'reference' ? 'REFERENCE 60 Hz' : 'REAL TIME'}`;
  $('#runtime-diagnostics').textContent = `Three.js WebGL · ${fps} FPS · Worker 60 Hz · Tick ${s.tick} · ${s.bodies.length} bodies · 宇宙 ${s.generation} · Seed ${s.seed} · ${renderer.canvas.width}×${renderer.canvas.height}`;
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
const audio = new AudioController((values, average) => {
  if (renderer) renderer.audioLevel = settings.audioresponse ? average : 0;

});

try {
  renderer = new SpaceRenderer($('#universe'), $('#body-labels'), settings);
  const blob = new Blob([__WORKER_SOURCE__], { type: 'text/javascript' }); const workerURL = URL.createObjectURL(blob);
  worker = new Worker(workerURL); worker.onmessage = ({ data }) => {
    if (data.type === 'error') { fatal = true; console.error('Simulation worker:', data); notice(`模拟异常：${data.message}。请恢复默认设置后重试。`, true); return; }
    if (data.type === 'state') { state = data.state; lastTick = state.tick; window.__threeBodyState = state; renderer.ingest(state); renderState(state); handleEvents(state.events);persistStatistics(); }
  };
  worker.onerror = event => { fatal = true; console.error(event); notice('后台模拟无法启动。请通过本地服务器或 Wallpaper Engine 打开此项目。', true); };
  store.getAll('history').then(records=>{history=records.sort((a,b)=>a.savedAt-b.savedAt);worker.postMessage({type:'init',settings,statistics:savedStatistics()||{legacyRecords:history}});});
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
  addEventListener('beforeunload', () => { persistStatistics(true);worker.terminate(); URL.revokeObjectURL(workerURL); if (customURL) URL.revokeObjectURL(customURL); });
} catch (error) {
  fatal = true; console.error(error); hideLoading(); notice(`无法初始化 3D 场景：${error.message}。请启用浏览器硬件加速。`, true);
}
// Diagnostic readout for automated smoke checks and host integrations.
window.__threeBodyDiagnostics = () => ({ ready: !!state && !fatal, tick: lastTick, fps, paused: userPaused || hostPaused || visibilityPaused, controls: controlMap.size, history: history.length, worker: !!worker,
  scene: renderer ? { canvas:[renderer.canvas.width,renderer.canvas.height], drawingBuffer:[renderer.renderer.getContext().drawingBufferWidth,renderer.renderer.getContext().drawingBufferHeight], renderedFrames:renderer.renderer.info.render.frame, viewVelocity:[renderer.rot.vx,renderer.rot.vy], maxAngularSpeed:renderer.rot.maxSpeed, compassVisible:renderer.compass.visible, maxTextureSize:renderer.renderer.capabilities.maxTextureSize, backgroundSizes:Object.fromEntries(Object.entries(renderer.bgTextures).map(([k,t])=>[k,[t.image?.width||0,t.image?.height||0]])), backgroundFollowsView: renderer.sky.parent === renderer.world, viewRotation: renderer.world.rotation.toArray().slice(0,3), skyRotation: renderer.sky.getWorldQuaternion(new renderer.camera.quaternion.constructor()).toArray(), bodyShapes: renderer.nodes.map(n => n.mesh.geometry.type), glowShape: 'radial-circle', bodyLabelsVisible:renderer.nodes.some(n=>!n.label.hidden), trailSamples: renderer.trailBuffers.map(b => b.length), trailComplexity:renderer.trailComplexity||0, trailMetrics:renderer.trailMetrics||[], trailsVisible: renderer.trails.every(t => t.visible) } : null });

import {developmentSnapshot,levelFor} from './civilization-levels.js';
export class CivilizationState{
  constructor(shared){this.shared=shared;this.logs=[];this.serial=0;this.reset();}
  reset(){this.phase=this.shared.civilizationAlive?'active':'empty';this.developmentYears=0;this.lastYear=null;this.progress=0;this.safeTime=0;this.lastPhenomena='';this.lastEpoch=null;this.result=null;this.rareTimers={};this.rareCooldown={};this.milestone=0;}
  log(kind,zh,en,year,runtime){this.logs.unshift({id:++this.serial,kind,zh,en,year,at:runtime});this.logs.length=Math.min(12,this.logs.length);}
  destroy(cause,year,runtime,settings){
    const s=this.shared;if(s.civilizationAlive){const number=s.civilizationCount,life=Math.max(0,Math.floor(year)-s.civilizationStartTime);s.lastCivilizationLifespan=life;s.civilizationAlive=false;
      s.civilizationRecords.push({number,universe:s.universeNumber||1,lifespan:life,destructionEvent:settings.cnen2?cause.en:cause.zh,text:s.text,development:developmentSnapshot(this.developmentYears,settings,true)});
      this.log('death',`宇宙${s.universeNumber||1} · 文明${number}延续${life}年，毁灭于${cause.zh}`,`Universe ${s.universeNumber||1} · Civilization ${number} lasted ${life} years: ${cause.en}`,year,runtime);s.civilizationCount++;}
    this.phase='destroyed';this.progress=0;this.safeTime=0;if(this.result)this.result={...this.result,phase:'destroyed',continuing:false,active:false,development:null};
  }
  update(world,habitat,settings,year,runtime,dt=1/60){
    const s=this.shared,en=settings.cnen2,planet=world.planet;
    const elapsedYears=this.lastYear===null?0:Math.max(0,year-this.lastYear);this.lastYear=year;
    const previousLevel=levelFor(this.developmentYears,settings.civilizationLevels).level;
    if(settings.civilizationLevels&&s.civilizationAlive&&this.phase==='active'&&habitat.canGrow&&habitat.comfortable&&world.safeToWake&&!planet.terminal&&!habitat.thermalFatal)this.developmentYears+=elapsedYears*settings.developmentRate;
    const development=developmentSnapshot(this.developmentYears,settings,s.civilizationAlive);
    if(development&&development.level>previousLevel)this.log('level',`宇宙${s.universeNumber||1} · 文明${s.civilizationCount}发展为${development.zh}`,`Universe ${s.universeNumber||1} · Civilization ${s.civilizationCount}: ${development.en}`,year,runtime);
    const rare=world.phenomena.filter(p=>['stationary','alignment'].includes(p.kind)||(p.kind==='overhead'&&p.count===3));
    const current=new Set(rare.map(p=>p.kind));
    for(const key of Object.keys(this.rareTimers))if(!current.has(key))this.rareTimers[key]=0;
    for(const p of rare){
      const before=this.rareTimers[p.kind]||0;this.rareTimers[p.kind]=before+dt;
      if(before<.5&&this.rareTimers[p.kind]>=.5&&runtime-(this.rareCooldown[p.kind]??-Infinity)>=60){
        this.log('rare',`宇宙${s.universeNumber||1}：${p.zh}`,`Universe ${s.universeNumber||1}: ${p.en}`,year,runtime);this.rareCooldown[p.kind]=runtime;
      }
    }
    const suitable=habitat.canGrow&&world.safeToWake;this.safeTime=suitable?this.safeTime+dt:0;
    if(planet.terminal){if(this.phase!=='destroyed')this.destroy(planet.terminal,year,runtime,settings);}
    else if(s.civilizationAlive&&habitat.thermalFatal)this.destroy(habitat.fatalCause??{zh:planet.temperature<settings.newproperty45?'长期严寒摧毁干仓':'极端烈焰摧毁干仓',en:planet.temperature<settings.newproperty45?'Prolonged cold destroyed dry storage':'Extreme heat destroyed dry storage'},year,runtime,settings);
    else if(!s.civilizationAlive){
      this.phase=this.phase==='destroyed'?'destroyed':'empty';
      if(suitable&&this.safeTime>=settings.birthDelay){s.civilizationAlive=true;s.civilizationStartTime=Math.floor(year);this.phase='active';this.progress=0;this.milestone=0;this.developmentYears=0;this.log('birth',`宇宙${s.universeNumber||1} · 文明${s.civilizationCount}启动`,`Universe ${s.universeNumber||1} · Civilization ${s.civilizationCount} started`,year,runtime);}
    }else if(this.phase==='active'){
      if(!habitat.comfortable||!world.safeToWake){this.phase='dehydrating';this.progress=0;}
    }else if(this.phase==='dehydrating'){this.progress+=dt;if(this.progress>=1){this.phase='dormant';this.progress=0;}}
    else if(this.phase==='dormant'){if(suitable&&this.safeTime>=settings.wakeDelay){this.phase='rehydrating';this.progress=0;}}
    else if(this.phase==='rehydrating'){if(!suitable){this.phase='dormant';this.progress=0;}else{this.progress+=dt;if(this.progress>=.5){this.phase='active';}}}
    const labels={empty:['等待安全生存窗口','Awaiting a safe window'],active:['恢复生产 · 文明发展','Developing'],dehydrating:['脱水保存中','Dehydrating'],dormant:['干仓休眠 · 文明延续','Dormant · civilization preserved'],rehydrating:['浸泡复苏中','Rehydrating'],destroyed:['文明已毁灭','Civilization destroyed']};
    const life=s.civilizationAlive?Math.max(0,Math.floor(year)-s.civilizationStartTime):s.lastCivilizationLifespan;
    if(s.civilizationAlive&&Math.floor(life/50)>this.milestone){this.milestone=Math.floor(life/50);this.log('longevity',`宇宙${s.universeNumber||1} · 文明${s.civilizationCount}已延续${life}年`,`Universe ${s.universeNumber||1} · Civilization ${s.civilizationCount}: ${life} years`,year,runtime);}
    const status=s.civilizationAlive?(en?`Civilization ${s.civilizationCount} · ${labels[this.phase][1]}`:`宇宙${s.universeNumber||1} · 文明${s.civilizationCount}`):labels[this.phase][en?1:0];
    s.logEntries=this.logs.map(entry=>en?`Year ${Math.floor(entry.year)} · ${entry.en}`:`第${Math.floor(entry.year)}年，${entry.zh}`);
    s.txt1=status;s.txt7=en?`${s.civilizationAlive?'Lifetime':'Last lifetime'}: ${life} years`:`${s.civilizationAlive?'文明已延续':'上个文明寿命'}：${life}年`;
    for(let i=0;i<5;i++)s[`txt${i+2}`]=s.logEntries[i]||'';s.txt8=en?'Civilization longevity':'文明延续排行';
    const ranked=[...s.civilizationRecords].sort((a,b)=>b.lifespan-a.lifespan).slice(0,6);
    for(let i=0;i<6;i++)s[`txt${i+9}`]=ranked[i]?(en?`#${ranked[i].number} · ${ranked[i].lifespan} years · ${ranked[i].destructionEvent}`:`第${ranked[i].number}号 · ${ranked[i].lifespan}年 · ${ranked[i].destructionEvent}`):'';
    this.result={phase:this.phase,label:labels[this.phase][en?1:0],continuing:!!s.civilizationAlive,active:this.phase==='active',safeWindow:this.safeTime,requiredWindow:s.civilizationAlive?settings.wakeDelay:settings.birthDelay,development:developmentSnapshot(this.developmentYears,settings,s.civilizationAlive)};return this.result;
  }
}

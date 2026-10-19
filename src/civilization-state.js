export class CivilizationState{
  constructor(shared){this.shared=shared;this.logs=[];this.serial=0;this.reset();}
  reset(){this.phase=this.shared.civilizationAlive?'active':'empty';this.progress=0;this.safeTime=0;this.lastPhenomena='';this.lastEpoch=null;this.result=null;}
  log(kind,zh,en,year,runtime){this.logs.unshift({id:++this.serial,kind,zh,en,year,at:runtime});this.logs.length=Math.min(5,this.logs.length);}
  destroy(cause,year,runtime,settings){
    const s=this.shared;if(s.civilizationAlive){const number=s.civilizationCount,life=Math.max(0,Math.floor(year)-s.civilizationStartTime);s.lastCivilizationLifespan=life;s.civilizationAlive=false;
      s.civilizationRecords.push({number,lifespan:life,destructionEvent:settings.cnen2?cause.en:cause.zh,text:s.text});
      this.log('death',`第${number}号文明毁灭于${cause.zh}`,`Civilization ${number} destroyed: ${cause.en}`,year,runtime);s.civilizationCount++;}
    this.phase='destroyed';this.progress=0;this.safeTime=0;
  }
  update(world,habitat,settings,year,runtime,dt=1/60){
    const s=this.shared,en=settings.cnen2,planet=world.planet;
    if(world.epoch.kind!==this.lastEpoch){if(this.lastEpoch!==null)this.log('epoch',world.epoch.kind==='stable'?'进入恒纪元':'进入乱纪元',world.epoch.kind==='stable'?'Stable era begins':'Chaotic era begins',year,runtime);this.lastEpoch=world.epoch.kind;}
    const signature=world.phenomena.map(p=>p.kind).join('/');if(signature!==this.lastPhenomena&&world.phenomena.length)this.log('sky',world.phenomena.map(p=>p.zh).join(' · '),world.phenomena.map(p=>p.en).join(' · '),year,runtime);this.lastPhenomena=signature;
    const suitable=habitat.canGrow&&world.safeToWake;this.safeTime=suitable?this.safeTime+dt:0;
    if(planet.terminal){if(this.phase!=='destroyed')this.destroy(planet.terminal,year,runtime,settings);}
    else if(s.civilizationAlive&&habitat.thermalFatal)this.destroy({zh:planet.temperature<settings.newproperty45?'长期严寒摧毁干仓':'极端烈焰摧毁干仓',en:planet.temperature<settings.newproperty45?'Prolonged cold destroyed dry storage':'Extreme heat destroyed dry storage'},year,runtime,settings);
    else if(!s.civilizationAlive){
      this.phase=this.phase==='destroyed'?'destroyed':'empty';
      if(suitable&&this.safeTime>=Math.max(settings.wakeDelay,settings.t/60)){s.civilizationAlive=true;s.civilizationStartTime=Math.floor(year);this.phase='active';this.progress=0;this.log('birth',`第${s.civilizationCount}号文明启动`,`Civilization ${s.civilizationCount} started`,year,runtime);}
    }else if(this.phase==='active'){
      if(!habitat.comfortable||!world.safeToWake){this.phase='dehydrating';this.progress=0;this.log('sleep','文明开始脱水，保存知识与人口','Dehydrating; preserving population and knowledge',year,runtime);}
    }else if(this.phase==='dehydrating'){this.progress+=dt;if(this.progress>=1){this.phase='dormant';this.progress=0;}}
    else if(this.phase==='dormant'){if(suitable&&this.safeTime>=settings.wakeDelay){this.phase='rehydrating';this.progress=0;}}
    else if(this.phase==='rehydrating'){if(!suitable){this.phase='dormant';this.progress=0;}else{this.progress+=dt;if(this.progress>=1.5){this.phase='active';this.log('wake','浸泡复苏，原文明继续延续','Rehydration complete; the same civilization continues',year,runtime);}}}
    const labels={empty:['等待安全生存窗口','Awaiting a safe window'],active:['正常活动','Active'],dehydrating:['脱水保存中','Dehydrating'],dormant:['干仓休眠 · 文明延续','Dormant · civilization preserved'],rehydrating:['浸泡复苏中','Rehydrating'],destroyed:['文明已毁灭','Civilization destroyed']};
    const life=s.civilizationAlive?Math.max(0,Math.floor(year)-s.civilizationStartTime):s.lastCivilizationLifespan;
    const status=s.civilizationAlive?(en?`Civilization ${s.civilizationCount} · ${labels[this.phase][1]}`:`第${s.civilizationCount}号文明 · ${labels[this.phase][0]}`):labels[this.phase][en?1:0];
    s.logEntries=this.logs.map(entry=>en?`Year ${Math.floor(entry.year)} · ${entry.en}`:`第${Math.floor(entry.year)}年，${entry.zh}`);
    s.txt1=status;s.txt7=en?`${s.civilizationAlive?'Lifetime':'Last lifetime'}: ${life} years`:`${s.civilizationAlive?'文明已延续':'上个文明寿命'}：${life}年`;
    for(let i=0;i<5;i++)s[`txt${i+2}`]=s.logEntries[i]||'';s.txt8=en?'Civilization longevity':'文明延续排行';
    const ranked=[...s.civilizationRecords].sort((a,b)=>b.lifespan-a.lifespan).slice(0,6);
    for(let i=0;i<6;i++)s[`txt${i+9}`]=ranked[i]?(en?`#${ranked[i].number} · ${ranked[i].lifespan} years · ${ranked[i].destructionEvent}`:`第${ranked[i].number}号 · ${ranked[i].lifespan}年 · ${ranked[i].destructionEvent}`):'';
    this.result={phase:this.phase,continuing:!!s.civilizationAlive,active:this.phase==='active',safeWindow:this.safeTime,requiredWindow:settings.wakeDelay};return this.result;
  }
}

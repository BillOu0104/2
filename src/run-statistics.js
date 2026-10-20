const number=(value,fallback=0)=>Number.isFinite(value)&&value>=0?value:fallback;
const top=records=>[...new Map(records.filter(r=>r&&Number.isSafeInteger(r.number)&&r.number>0&&Number.isFinite(r.lifespan)&&r.lifespan>=0).map(r=>[r.id??r.number,r])).values()].sort((a,b)=>b.lifespan-a.lifespan||a.number-b.number).slice(0,5);

// Counts simulated years, never wall-clock seconds. Checkpoints close the old run on reload.
export class RunStatistics {
  constructor(saved={}){
    const valid=saved?.format==='three-body-statistics'&&saved.version===1;
    this.totalYears=valid?number(saved.totalYears):0;
    this.universeNumber=valid?Math.max(1,Math.floor(number(saved.universeNumber,1))):1;
    this.universeStart=valid?Math.min(this.totalYears,number(saved.universeStart)):0;
    this.universes=valid?top((Array.isArray(saved.universes)?saved.universes:[]).slice(0,10)):[];
    this.civilizations=valid?top((Array.isArray(saved.civilizations)?saved.civilizations:[]).slice(0,10)):[];
    for(const record of this.civilizations)if(!record.universe){const candidates=(Array.isArray(saved.legacyRecords)?saved.legacyRecords:[]).filter(r=>r.number===record.number&&Math.abs(r.lifespan-record.lifespan)<1);if(candidates.length===1)record.universe=candidates[0].generation||candidates[0].universe||null;}
    this.nextCivilization=valid?Math.max(1,Math.floor(number(saved.nextCivilization,1))):1;
    this.activeCivilization=valid&&saved.activeCivilization&&Number.isSafeInteger(saved.activeCivilization.number)&&saved.activeCivilization.number>0?{number:saved.activeCivilization.number,universe:saved.activeCivilization.universe||this.universeNumber,start:Math.min(this.totalYears,number(saved.activeCivilization.start))}:null;
    if(valid){if(this.activeCivilization)this.finishCivilization({number:this.activeCivilization.number,destructionEvent:'结束上次运行'});this.finishUniverse('reload');}
    else if(Array.isArray(saved?.legacyRecords)){
      // Old archives may reuse numbers across sessions; give each retained record its own ID.
      const records=saved.legacyRecords.filter(r=>r&&Number.isFinite(r.lifespan)&&r.lifespan>=0);
      records.forEach((r,i)=>this.civilizations.push({number:Number.isSafeInteger(r.number)&&r.number>0?r.number:i+1,id:r.key||`legacy-${i}`,universe:r.generation||r.universe||null,lifespan:r.lifespan,legacy:true}));
      this.nextCivilization=Math.max(1,...this.civilizations.map(r=>r.number+1));this.civilizations=top(this.civilizations);
    }
  }
  observe(year,shared){
    this.totalYears=Math.max(this.totalYears,number(year));
    this.nextCivilization=Math.max(this.nextCivilization,shared.civilizationCount||1);
    if(shared.civilizationAlive&&!this.activeCivilization)this.activeCivilization={number:shared.civilizationCount,universe:this.universeNumber,start:this.totalYears};
  }
  finishCivilization(record){
    const lifespan=this.activeCivilization?.number===record.number?Math.max(0,this.totalYears-this.activeCivilization.start):number(record.lifespan);
    this.civilizations=top([...this.civilizations,{number:record.number,universe:this.activeCivilization?.universe||record.universe||this.universeNumber,lifespan}]);
    this.nextCivilization=Math.max(this.nextCivilization,record.number+1);
    if(this.activeCivilization?.number===record.number)this.activeCivilization=null;
  }
  finishUniverse(reason){
    this.universes=top([...this.universes,{number:this.universeNumber,lifespan:Math.max(0,this.totalYears-this.universeStart),reason}]);
    this.universeNumber++;this.universeStart=this.totalYears;
  }
  snapshot(){
    const universe={number:this.universeNumber,lifespan:Math.max(0,this.totalYears-this.universeStart),active:true};
    const civilization=this.activeCivilization?{number:this.activeCivilization.number,universe:this.activeCivilization.universe||this.universeNumber,lifespan:Math.max(0,this.totalYears-this.activeCivilization.start),active:true}:null;
    return{totalYears:this.totalYears,universe,civilization,universeRanking:top([...this.universes,universe]),civilizationRanking:top([...this.civilizations,...(civilization?[civilization]:[])])};
  }
  checkpoint(){return{format:'three-body-statistics',version:1,totalYears:this.totalYears,universeNumber:this.universeNumber,universeStart:this.universeStart,nextCivilization:this.nextCivilization,activeCivilization:this.activeCivilization,universes:this.universes,civilizations:this.civilizations};}
}

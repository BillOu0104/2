import {levelFor} from './civilization-levels.js';
const clamp=x=>Math.max(0,Math.min(1,x));
// Population and dry-storage quality belong to a living civilization, never an empty planet.
export class Habitability {
  constructor(){this.reset();}
  reset(){this.health=null;this.population=null;this.storageQuality=null;this.owner=null;this.score=0;this.result=null;}
  begin(number){this.owner=number;this.population=1;this.storageQuality=1;this.health=1;}
  update(shared,settings,dt=1/60,context={}){
    const alive=context.alive===true,stage=levelFor(context.developmentYears??0,alive&&settings.civilizationLevels);
    if(!alive){this.owner=null;this.population=null;this.storageQuality=null;this.health=null;}
    else if(this.owner!==context.number||this.population===null)this.begin(context.number);
    const temperature=Number(shared.tem),low=settings.newproperty45-stage.climate,high=settings.newproperty46+stage.climate;
    const storageLow=settings.newproperty43-stage.storage,storageHigh=settings.newproperty44+stage.storage;
    const comfortable=Number.isFinite(temperature)&&temperature>=low&&temperature<=high;
    const sleeping=['dormant','dehydrating','rehydrating'].includes(context.phase),terminal=!!context.terminal;
    const damaged=!!context.damaged,tideRatio=context.tideRatio??0,integrity=clamp(context.integrity??1);
    const hazard=damaged?'damaged':context.hazard||(tideRatio>=.5?'tidal':null);
    const excess=Number.isFinite(temperature)?Math.max(low-temperature,temperature-high,0):1000;
    const storageExcess=Number.isFinite(temperature)?Math.max(storageLow-temperature,temperature-storageHigh,0):2000;
    this.score=comfortable&&!terminal&&!damaged?integrity*clamp((1-tideRatio)/.5):0;
    const protection=settings.thermalGrace*stage.resilience;
    // A recoverable scar is not ongoing damage: only currently excessive stress hurts reserves.
    const structuralLoss=Math.max(0,tideRatio-1)*.006/stage.resilience;
    const exposure=storageExcess>0?(.015+storageExcess/2000)/protection:0;
    if(alive){
      if(terminal){this.population=0;this.storageQuality=0;}
      else if(comfortable&&!hazard&&!sleeping){this.population=clamp(this.population+dt*.015);this.storageQuality=clamp(this.storageQuality+dt*.01);}
      else if(sleeping){this.storageQuality=clamp(this.storageQuality-dt*(exposure+structuralLoss));this.population=clamp(this.population-dt*(exposure*.15+structuralLoss*.5));}
      else{this.population=clamp(this.population-dt*((comfortable?0:(.05+excess/300)/protection)+structuralLoss));}
      this.health=clamp(this.population*this.storageQuality);
    }
    const fatalCause=structuralLoss>exposure?{zh:'持续潮汐破坏人口与干仓',en:'Persistent tides destroyed population and storage'}:temperature<storageLow?{zh:'长期严寒摧毁干仓',en:'Prolonged cold destroyed dry storage'}:temperature>storageHigh?{zh:'极端烈焰摧毁干仓',en:'Extreme heat destroyed dry storage'}:{zh:'生命储备耗尽',en:'Population and storage reserves exhausted'};
    this.result={enabled:settings.civilizationMode!=='legacy',comfortable,stable:comfortable,score:clamp(this.score),health:this.health,population:this.population,storageQuality:this.storageQuality,
      canGrow:comfortable&&!terminal&&!hazard&&(!alive||this.population>.01&&this.storageQuality>.01),growth:this.score,
      fatalCause,thermalFatal:alive&&(this.population<=.01||this.storageQuality<=.01),hazard,exposure,low,high,storageLow,storageHigh,level:alive?stage.level:null};
    return this.result;
  }
}

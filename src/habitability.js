const clamp=x=>Math.max(0,Math.min(1,x));
// Normal activity and dehydrated storage have separate climate limits.
export class Habitability {
  constructor(){this.reset();}
  reset(){this.health=1;this.score=0;this.result=null;}
  update(shared,settings,dt=1/60,context={}){
    const temperature=Number(shared.tem),low=settings.newproperty45,high=settings.newproperty46;
    const comfortable=Number.isFinite(temperature)&&temperature>=low&&temperature<=high;
    const sleeping=['dormant','dehydrating','rehydrating'].includes(context.phase),terminal=!!context.terminal;
    const excess=Number.isFinite(temperature)?Math.max(low-temperature,temperature-high,0):1000;
    const storageExcess=Number.isFinite(temperature)?Math.max(settings.newproperty43-temperature,temperature-settings.newproperty44,0):1000;
    const raw=comfortable&&!terminal?1:0;
    if(!this.result)this.score=raw;else this.score+=(raw-this.score)*(1-Math.exp(-dt/1.2));
    let exposure=0;
    if(!comfortable)exposure=sleeping?(storageExcess>0?(.3+storageExcess/100)/settings.thermalGrace:.00025):(.15+excess/60)/settings.thermalGrace;
    if(context.hazard==='tidal')exposure+=.05;
    this.health=terminal?0:clamp(this.health+(comfortable?.06:-exposure)*dt);
    this.result={enabled:settings.civilizationMode!=='legacy',comfortable,stable:comfortable,score:clamp(this.score),health:this.health,
      canGrow:comfortable&&!terminal&&!context.hazard&&this.health>=.35,growth:comfortable?1:0,
      thermalFatal:this.health<=1e-9,hazard:context.hazard||null,exposure,low,high,storageLow:settings.newproperty43,storageHigh:settings.newproperty44};
    return this.result;
  }
}

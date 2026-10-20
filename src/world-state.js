const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const length=v=>Math.hypot(...v);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const sub=(a,b)=>[a.x-b.x,a.y-b.y,a.z-b.z];
const velocity=(a,b)=>[a.vx-b.vx,a.vy-b.vy,a.vz-b.vz];
const unit=v=>{const n=Math.max(length(v),1e-12);return v.map(x=>x/n);};

// Differential gravity, normalized by planetary self-gravity. Net pull is not a tide.
export function largestEigenvalue(matrix){
  const a=matrix.map(row=>[...row]);
  for(let k=0;k<12;k++){
    let p=0,q=1;for(const[i,j]of[[0,2],[1,2]])if(Math.abs(a[i][j])>Math.abs(a[p][q])){p=i;q=j;}
    if(Math.abs(a[p][q])<1e-12)break;
    const angle=.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]),c=Math.cos(angle),s=Math.sin(angle);
    const pp=a[p][p],qq=a[q][q],pq=a[p][q];
    a[p][p]=c*c*pp-2*s*c*pq+s*s*qq;a[q][q]=s*s*pp+2*s*c*pq+c*c*qq;a[p][q]=a[q][p]=0;
    for(let i=0;i<3;i++)if(i!==p&&i!==q){const ip=a[i][p],iq=a[i][q];a[i][p]=a[p][i]=c*ip-s*iq;a[i][q]=a[q][i]=s*ip+c*iq;}
  }return Math.max(...a.map((r,i)=>r[i]));
}
export class WorldState{
  constructor(){this.reset();}
  reset(){this.primary=-1;this.candidate=-1;this.stableTime=0;this.unstableTime=0;this.epoch='chaotic';this.integrity=1;this.terminal=null;this.temperature=null;this.lastFlux=null;this.fluxChange=0;this.state=null;this.recoveryTime=0;}
  update(bodies,G,equilibrium,settings,runtime,dt=1/60){
    const planet=bodies[3],radius=Math.max(settings.newproperty20,1e-5);
    const stars=bodies.slice(0,3).map((body,i)=>{
      const relative=sub(body,planet),distance=Math.max(length(relative),1e-6),v=velocity(body,planet),direction=unit(relative);
      const stellarRadius=[settings._13,settings._21,settings._3][i]*(settings.stellarBreathing?1+.08*Math.sin(runtime/120+i*2):1);
      const angularRadius=Math.asin(clamp(stellarRadius/distance)),radial=dot(v,direction),transverse=Math.sqrt(Math.max(0,dot(v,v)-radial*radial));
      return{i,mass:body.mass,distance,direction,radial,angularRate:transverse/distance,radius:stellarRadius,angularRadius,force:G*body.mass/(distance*distance),energy:dot(v,v)/2-G*(body.mass+planet.mass)/distance,visibleFraction:1};
    });
    for(const back of stars)for(const front of stars)if(front.i!==back.i&&front.mass>0&&front.distance<back.distance){
      const angle=Math.acos(clamp(dot(front.direction,back.direction),-1,1));if(front.angularRadius>=angle+back.angularRadius)back.visibleFraction=0;
    }
    const active=stars.filter(s=>s.mass>0),sorted=[...active].sort((a,b)=>b.force-a.force),main=sorted[0];let perturbation=Infinity,bound=false;
    if(main){const otherTides=active.filter(s=>s!==main).reduce((n,s)=>n+2*G*s.mass*main.distance/Math.pow(s.distance,3),0);perturbation=otherTides/Math.max(main.force,1e-12);bound=main.energy<0;}
    const dominance=main?main.force/Math.max(sorted[1]?.force||0,1e-12):0,candidate=!!main&&bound&&dominance>1.5&&perturbation<.35;
    if(candidate&&this.candidate===main.i)this.stableTime+=dt;else{this.candidate=candidate?main.i:-1;this.stableTime=candidate?dt:0;}
    if(candidate){this.unstableTime=0;if(this.stableTime>=settings.epochWindow){this.epoch='stable';this.primary=main.i;}}
    else{this.unstableTime+=dt;if(this.unstableTime>=.5){this.epoch='chaotic';this.primary=-1;}}
    if(this.epoch==='stable'&&main?.i!==this.primary){this.epoch='chaotic';this.primary=-1;}
    const tensor=Array.from({length:3},()=>[0,0,0]);
    for(const star of active){const strength=star.mass/Math.max(planet.mass,1)*Math.pow(radius/star.distance,3);for(let i=0;i<3;i++)for(let j=0;j<3;j++)tensor[i][j]+=strength*(3*star.direction[i]*star.direction[j]-(i===j?1:0));}
    const tideRatio=Math.max(0,largestEigenvalue(tensor)),hardness=settings.planetStrength??1.6,stressRatio=tideRatio/hardness;
    if(!this.terminal){
      if(stressRatio>1){this.integrity=clamp(this.integrity-dt*(stressRatio-1)/6);this.recoveryTime=0;}
      else if(stressRatio<.6){this.recoveryTime+=dt;if(this.recoveryTime>3)this.integrity=clamp(this.integrity+dt*.008*(1-stressRatio));}
      else this.recoveryTime=0;
    }
    const contact=active.find(s=>s.distance<=s.radius+radius);
    if(!this.terminal&&contact)this.terminal={kind:'engulfed',zh:`行星被恒星${contact.i+1}吞噬`,en:`Planet engulfed by star ${contact.i+1}`};
    if(!this.terminal&&this.integrity<=0)this.terminal={kind:'disrupted',zh:'大撕裂：行星结构崩溃',en:'Great Tear: planetary disruption'};
    const flux=active.reduce((sum,s)=>sum+([settings._111lum_sun,settings._211lum_sun,settings._311lum_sun][s.i]||0)/Math.pow(s.distance,2),0);
    if(this.lastFlux!==null){const change=Math.abs(flux-this.lastFlux)/Math.max(this.lastFlux,.01)/Math.max(dt,1e-6);this.fluxChange+=(change-this.fluxChange)*(1-Math.exp(-dt));}this.lastFlux=flux;
    if(this.temperature===null)this.temperature=equilibrium;else this.temperature+=(equilibrium-this.temperature)*(1-Math.exp(-dt/settings.climateInertia));
    const phenomena=[],add=(kind,zh,en,severity='observation')=>phenomena.push({kind,zh,en,severity});
    const flying=active.filter(s=>s.distance>settings.newproperty31);
    if(flying.length)add('flying',`${['','一颗','两颗','三颗'][flying.length]}飞星`,`${flying.length} flying star${flying.length>1?'s':''}`);
    if(flying.some(s=>s.angularRate<.005&&s.radial<-.01))add('stationary','飞星不动 · 正在接近','Stationary flying star · approaching','warning');
    const giant=active.filter(s=>s.visibleFraction>0&&s.distance<settings.newproperty30);
    if(giant.length)add('overhead',giant.length===1?'巨日近掠':giant.length===2?'双日凌空':'三日凌空',giant.length===1?'Giant sun passage':giant.length===2?'Two suns overhead':'Three suns overhead',this.temperature>40?'warning':'observation');
    for(const p of phenomena){if(p.kind==='flying')p.count=flying.length;if(p.kind==='overhead')p.count=giant.length;}
    const aligned=active.length===3&&active.every((s,i)=>active.slice(i+1).every(t=>dot(s.direction,t.direction)>Math.cos(5*Math.PI/180)));
    if(aligned)add('alignment','三日连珠','Three-sun alignment',tideRatio>.5?'warning':'observation');
    if(tideRatio>.5)add('tidal','潮汐应力上升','Rising tidal stress','warning');
    if(this.terminal)add(this.terminal.kind,this.terminal.zh,this.terminal.en,'fatal');
    const damaged=this.integrity<.98,recovering=damaged&&!this.terminal&&stressRatio<.6&&this.recoveryTime>3;
    const condition=this.terminal?.kind||(recovering?'recovering':damaged?'damaged':stressRatio>1?'tidal-stress':this.temperature>1000?'molten':this.temperature>settings.newproperty46?'hot':this.temperature<settings.newproperty45?'frozen':'temperate');
    this.state={epoch:{kind:this.epoch,primary:this.primary,stableFor:this.stableTime,bound,dominance,perturbation},phenomena,
      planet:{condition,damaged,recovering,recoverable:!this.terminal,canSupportLife:!this.terminal&&this.integrity>=.25&&stressRatio<.8,restartRequired:!!this.terminal,intact:!this.terminal,terminal:this.terminal,integrity:this.integrity,tideRatio,stressRatio,hardness,temperature:this.temperature,equilibriumTemperature:equilibrium},
      stars:stars.map(s=>({index:s.i,distance:s.distance,angularRate:s.angularRate,radialSpeed:s.radial,visibleFraction:s.visibleFraction,radius:s.radius,flying:s.distance>settings.newproperty31})),
      fluxChange:this.fluxChange,safeToWake:!this.terminal&&this.integrity>=.25&&stressRatio<.5&&(this.epoch==='stable'||this.fluxChange<.15)};return this.state;
  }
}

import {Simulation} from '../../src/simulation.js';
import {WorldState} from '../../src/world-state.js';

export const G=1.3275440274585598e-8;
export const FIELDS=['x','y','z','vx','vy','vz'];
const pairs=[[0,1],[0,2],[1,2],[0,3],[1,3],[2,3]];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const norm=a=>Math.hypot(...a);
const unit=a=>{const n=norm(a);return n>1e-14?a.map(x=>x/n):[0,0,1];};
const pos=b=>[b.x,b.y,b.z],vel=b=>[b.vx,b.vy,b.vz];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
export function center(bodies){const m=bodies.reduce((n,b)=>n+b.mass,0);return FIELDS.map(k=>bodies.reduce((n,b)=>n+b.mass*b[k],0)/m);}
export function recenter(bodies){const c=center(bodies);for(const b of bodies)FIELDS.forEach((k,i)=>b[k]-=c[i]);return bodies;}
export function angular(bodies){const c=center(bodies),L=[0,0,0];for(const b of bodies){const h=cross(sub(pos(b),c.slice(0,3)),sub(vel(b),c.slice(3)));h.forEach((x,i)=>L[i]+=b.mass*x);}return L;}
export function energy(bodies,force='newton',eps=.1,k=2.8){
 const c=center(bodies);let K=0,U=0;
 for(const b of bodies)K+=.5*b.mass*((b.vx-c[3])**2+(b.vy-c[4])**2+(b.vz-c[5])**2);
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++)U+=G*bodies[i].mass*bodies[j].mass*potential(distance(bodies[i],bodies[j]),force,eps,k);
 return {K,U,E:K+U,Q:2*K/-U};
}
export function potential(r,force,eps,k){
 if(force!=='legacy'||eps<=0)return -1/Math.max(r,1e-15);
 if(r>=k*eps)return -1/r;
 const beta=3/(k-1),alpha=1-beta;
 const middle=s=>-1/(k*eps)+alpha*(1/(k*eps)-1/s)+beta/eps*Math.log(s/(k*eps));
 return r>eps?middle(r):middle(eps)+(r*r-eps*eps)/(2*eps**3);
}
export function planetOrbit(bodies,host=2){
 const a=bodies[3],b=bodies[host],r=sub(pos(a),pos(b)),v=sub(vel(a),vel(b)),R=norm(r),mu=G*(a.mass+b.mass),e=dot(v,v)/2-mu/R,h=norm(cross(r,v));
 const eccentricity=Math.sqrt(Math.max(0,1+2*e*h*h/(mu*mu)));
 return {host,radius:R,energy:e,angularMomentum:h,semimajor:e<0?-mu/(2*e):null,eccentricity,pericenter:h*h/(mu*(1+eccentricity)),radialSpeed:dot(r,v)/R};
}
export function initial(seed,cfg={}){
 const settings={seed,newproperty60:false,autorestart:false,...cfg.settings};
 if(cfg.mode)settings.orbitalInitialization=cfg.mode;
 const s=new Simulation(settings);s.tick();
 const bodies=structuredClone(s.initialBodies),stars=bodies.slice(0,3);
 if(cfg.massRatios){const total=stars.reduce((n,b)=>n+b.mass,0),sum=cfg.massRatios.reduce((a,b)=>a+b,0);stars.forEach((b,i)=>b.mass=total*cfg.massRatios[i]/sum);}
 if(cfg.massScale)stars.forEach(b=>b.mass*=cfg.massScale);
 if(cfg.planetMass)bodies[3].mass=cfg.planetMass;
 if(cfg.scale){const c=center(stars);for(const b of stars)FIELDS.forEach((k,i)=>b[k]=c[i]+(b[k]-c[i])*(i<3?cfg.scale:1/Math.sqrt(cfg.scale)));}
 if(cfg.geometry==='hierarchical'){
  const c=center(stars);Object.assign(stars[0],{x:-.3,y:0,z:0,vx:0,vy:-Math.sqrt(G*stars[1].mass/.6/2),vz:0});Object.assign(stars[1],{x:.3,y:0,z:0,vx:0,vy:Math.sqrt(G*stars[0].mass/.6/2),vz:0});
  Object.assign(stars[2],{x:4,y:0,z:0,vx:0,vy:Math.sqrt(G*stars.reduce((n,b)=>n+b.mass,0)/4),vz:0});recenter(stars);
 }
 if(cfg.spin!==undefined){
  const c=center(stars),n=unit(angular(stars)),K=energy(stars).K;
  const raw=stars.map(b=>cross(n,sub(pos(b),c.slice(0,3))));
  const rawK=stars.reduce((sum,b,i)=>sum+.5*b.mass*dot(raw[i],raw[i]),0),scale=Math.sqrt(K/rawK);
  stars.forEach((b,i)=>['vx','vy','vz'].forEach((k,j)=>b[k]=(1-cfg.spin)*(b[k]-c[j+3])+cfg.spin*raw[i][j]*scale));
  recenter(stars);const multiplier=Math.sqrt(K/energy(stars).K);stars.forEach(b=>['vx','vy','vz'].forEach(k=>b[k]*=multiplier));
 }
 if(cfg.Q){recenter(stars);const vscale=Math.sqrt(cfg.Q/energy(stars).Q);for(const b of stars)for(const k of ['vx','vy','vz'])b[k]*=vscale;}
 if(cfg.planet==='bound'){
  const h=cfg.host??2,host=bodies[h],planet=bodies[3],nearest=Math.min(...stars.filter((_,i)=>i!==h).map(b=>distance(b,host)));
  const r=(cfg.fixedRadius??nearest*(cfg.radiusFraction??.2));
  const normal=unit(angular(stars));let radial=unit(sub(pos(planet),pos(host)));
  if(cfg.inPlane){radial=unit(sub(radial,normal.map(x=>x*dot(radial,normal))));}
  const tangent=unit(cross(normal,radial)),mu=G*(host.mass+planet.mass),speed=Math.sqrt(mu/r),direction=cfg.direction??1;
  const v=radial.map((x,i)=>speed*(direction*(cfg.speed??1)*tangent[i]+(cfg.radial??0)*x));
  const hostShare=host.mass/(host.mass+planet.mass),planetShare=1-hostShare;
  ['x','y','z'].forEach((k,i)=>planet[k]=host[k]+r*radial[i]);
  ['vx','vy','vz'].forEach((k,i)=>{planet[k]=host[k]+hostShare*v[i];host[k]-=planetShare*v[i];});
 }
 recenter(bodies);
 if(cfg.perturb)bodies[0].x+=cfg.perturb;
 return {bodies,settings:s.settings};
}

const w1=1/(2-2**(1/3)),w0=-(2**(1/3))*w1;
export class Integrator{
 constructor(bodies,{force='newton',eps=.1,k=2.8,method='yoshida'}={}){this.bodies=bodies;this.force=force;this.eps=eps;this.k=k;this.method=method;this.steps=0;}
 drift(h){for(const b of this.bodies){b.x+=h*b.vx;b.y+=h*b.vy;b.z+=h*b.vz;}}
 kick(h){
  const b=this.bodies;
  for(const [i,j] of pairs){const a=b[i],c=b[j],x=c.x-a.x,y=c.y-a.y,z=c.z-a.z,r=Math.max(Math.sqrt(x*x+y*y+z*z),1e-5);let factor=1;
   if(this.force==='legacy'&&this.eps>0){if(r<=this.eps)factor=(r/this.eps)**3;else if(r<this.k*this.eps)factor=1-3/(this.k-1)+3/(this.k-1)*r/this.eps;}
   const f=h*G*factor/(r*r*r),am=f*c.mass,bm=f*a.mass;
   a.vx+=am*x;a.vy+=am*y;a.vz+=am*z;c.vx-=bm*x;c.vy-=bm*y;c.vz-=bm*z;
  }
 }
 step(h){if(this.method==='verlet'){this.kick(h/2);this.drift(h);this.kick(h/2);}else{this.drift(w1*h/2);this.kick(w1*h);this.drift((w0+w1)*h/2);this.kick(w0*h);this.drift((w0+w1)*h/2);this.kick(w1*h);this.drift(w1*h/2);}this.steps++;}
 timescale(){let t=Infinity;for(const[i,j]of pairs){const a=this.bodies[i],b=this.bodies[j],r=distance(a,b),v=Math.hypot(a.vx-b.vx,a.vy-b.vy,a.vz-b.vz);t=Math.min(t,Math.sqrt(r*r*r/(G*(a.mass+b.mass))),r/Math.max(v,1e-20));}return t;}
 advance(duration,cfg){
  let remaining=duration;
  if(!cfg.adaptive){const n=Math.ceil(duration/(cfg.dt??.00075));for(let i=0;i<n;i++)this.step(duration/n);return;}
  while(remaining>1e-14){const h=Math.min(remaining,cfg.dt??.00075,(cfg.eta??.03)*this.timescale());if(!(h>1e-10)||this.steps>5e6)throw Error('numerical-resource-limit');this.step(h);remaining-=h;}
 }
}

function diagnostics(b){
 const stars=b.slice(0,3),c=center(stars),planet=b[3],r=sub(pos(planet),c.slice(0,3)),v=sub(vel(planet),c.slice(3));
 const ss=pairs.slice(0,3).map(([i,j])=>distance(b[i],b[j])),sp=stars.map(s=>distance(s,planet));
 const Eplanet=dot(v,v)/2-G*stars.reduce((n,s,i)=>n+s.mass/sp[i],0),outward=dot(r,v)>0;
 return {ss,sp,minSS:Math.min(...ss),minSP:Math.min(...sp),planetRadius:norm(r),Eplanet,outward,shape:Math.max(...ss)/Math.min(...ss),starRadii:stars.map(s=>norm(sub(pos(s),c.slice(0,3)))),hostEnergies:stars.map((_,i)=>planetOrbit(b,i).energy)};
}
export function runTrial(seed,cfg,horizon){
 const start=performance.now(),{bodies,settings}=initial(seed,cfg),world=new WorldState(),integrator=new Integrator(bodies,cfg);
 const initialBodies=structuredClone(bodies),e0=energy(bodies,cfg.force,cfg.eps),en0=energy(bodies),L0=angular(bodies),sE=energy(bodies.slice(0,3)),d0=diagnostics(bodies);
 const Lscale=Math.sqrt(G*bodies.reduce((s,b)=>s+b.mass,0)**3*Math.max(...d0.ss));
 const initialMetrics={stars:sE,L:angular(bodies.slice(0,3)),dimensionlessL:norm(angular(bodies.slice(0,3)))/Lscale,planet:planetOrbit(bodies,cfg.host??2),hostEnergies:d0.hostEnergies,shape:d0.shape,crossingTime:Math.sqrt((d0.ss.reduce((a,b)=>a+b,0)/3)**3/(G*bodies.slice(0,3).reduce((n,b)=>n+b.mass,0)))/.45};
 let lossAt=null,lossReason=null,planetBoundaryAt=null,systemBoundaryAt=null,starBoundaryAt=null,positiveEscapeAt=null,terminalAt=null,starContactAt=null;
 let stableFrames=0,stableAlive=0,aliveFrames=0,temperate=0,compactNonhierFrames=0,jointStableFrames=0,hierFrames=0,boundPlanetAtEnd=false;
 let maxEnergyError=0,maxEnergyErrorBeforeContact=0,maxNewtonEnergyChange=0,maxLError=0,minSS=Infinity,minSP=Infinity,closestEncounter=null,lastEp=d0.Eplanet;
 const events=[],trajectory=[];let frames=0,error=null;
 const totalFrames=Math.round(horizon*60);
 for(let f=0;f<=totalFrames;f++){
  const years=f/60;
  if(f){try{integrator.advance(.0075,cfg);}catch(e){error=e.message;if(lossAt===null){lossAt=years;lossReason=error;}break;}}
  frames=f;
  const d=diagnostics(bodies),c=center(bodies),radii=bodies.map(b=>Math.hypot(b.x-c[0],b.y-c[1],b.z-c[2]));
  if(!Number.isFinite(d.Eplanet)){error='non-finite';if(lossAt===null){lossAt=years;lossReason=error;}break;}
  if(d.minSS<minSS){minSS=d.minSS;closestEncounter={years,starDistances:d.ss,planetEnergy:d.Eplanet};}minSP=Math.min(minSP,d.minSP);
  if(starContactAt===null&&pairs.slice(0,3).some(([i,j],k)=>d.ss[k]<[settings._13,settings._21,settings._3][i]+[settings._13,settings._21,settings._3][j]))starContactAt=years;
  if(planetBoundaryAt===null&&radii[3]>settings.newproperty13)planetBoundaryAt=years;
  if(systemBoundaryAt===null&&radii.some(r=>r>settings.newproperty13))systemBoundaryAt=years;
  if(starBoundaryAt===null&&radii.slice(0,3).some(r=>r>settings.newproperty13))starBoundaryAt=years;
  if(positiveEscapeAt===null&&radii[3]>settings.newproperty13&&d.Eplanet>0&&d.outward)positiveEscapeAt=years;
  const flux=1361*bodies.slice(0,3).reduce((s,b,i)=>s+[settings._111lum_sun,settings._211lum_sun,settings._311lum_sun][i]/(Math.max(d.sp[i],.01)*1e12/settings.newproperty69/1.496e11)**2,0);
  const base=(flux*.7/(4*5.67e-8))**.25-273.15,albedo=base<0?.3+.3*Math.min(1,-base/20):.3;
  const equilibrium=Math.max(-270,Math.min(1500,(flux*(1-albedo)/(4*5.67e-8))**.25-273.15+10*Math.sin(years)));
  const w=world.update(bodies,G,Number(equilibrium.toFixed(2)),settings,years,f?1/60:0,f?1/60:0);
  if(terminalAt===null&&w.planet.terminal)terminalAt=years;
  if(lossAt===null){if(w.planet.terminal){lossAt=years;lossReason=w.planet.terminal.kind;}else if(planetBoundaryAt!==null){lossAt=planetBoundaryAt;lossReason=positiveEscapeAt!==null?'positive-energy-escape':'boundary-crossing';}}
  const compact=d.starRadii.every(r=>r<=settings.newproperty13),nonhier=d.shape<3;
  if(f){
   if(lossAt===null){aliveFrames++;if(w.epoch.kind==='stable')stableAlive++;}
   if(lossAt===null&&w.epoch.kind==='stable')stableFrames++;
   if(lossAt===null&&w.planet.temperature>=settings.newproperty45&&w.planet.temperature<=settings.newproperty46)temperate++;
   if(compact&&nonhier&&starContactAt===null){compactNonhierFrames++;if(lossAt===null&&w.epoch.kind==='stable')jointStableFrames++;}
   if(!nonhier)hierFrames++;
  }
  const E=energy(bodies,cfg.force,cfg.eps),En=energy(bodies),L=angular(bodies);
  maxEnergyError=Math.max(maxEnergyError,Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20));
  if(starContactAt===null)maxEnergyErrorBeforeContact=Math.max(maxEnergyErrorBeforeContact,Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20));
  maxNewtonEnergyChange=Math.max(maxNewtonEnergyChange,Math.abs(En.E-en0.E)/Math.max(Math.abs(en0.E),1e-20));
  maxLError=Math.max(maxLError,norm(sub(L,L0))/Math.max(norm(L0),Lscale*1e-12));
  const jump=d.Eplanet-lastEp;
  if(jump>0&&d.minSP<.6){events.push({years,deltaPlanetSpecificEnergy:jump,planetSpecificEnergyBefore:lastEp,planetSpecificEnergyAfter:d.Eplanet,totalEnergyRelativeError:Math.abs(E.E-e0.E)/Math.max(Math.abs(e0.E),1e-20),minSS:d.minSS,minSP:d.minSP,stellarSpeeds:bodies.slice(0,3).map(b=>norm(sub(vel(b),center(bodies.slice(0,3)).slice(3))))});events.sort((a,b)=>b.deltaPlanetSpecificEnergy-a.deltaPlanetSpecificEnergy);events.length=Math.min(events.length,5);}lastEp=d.Eplanet;
  if(cfg.trace&&f%60===0)trajectory.push({years,positions:bodies.flatMap(b=>pos(b)),E:E.E,shape:d.shape,planetEnergy:d.Eplanet});
  boundPlanetAtEnd=d.hostEnergies.some(e=>e<0);
 }
 const completed=frames===totalFrames;
 return {seed,profile:cfg.id,horizon,initial:initialMetrics,initialBodies,finalBodies:structuredClone(bodies),lossAt,lossReason,survived:lossAt===null&&completed,restrictedLife:lossAt??frames/60,planetBoundaryAt,systemBoundaryAt,starBoundaryAt,positiveEscapeAt,terminalAt,starContactAt,jointSurvived:lossAt===null&&starBoundaryAt===null&&starContactAt===null&&completed,stableFraction:stableFrames/totalFrames,stableConditional:aliveFrames?stableAlive/aliveFrames:0,temperateFraction:temperate/totalFrames,compactNonhierFraction:compactNonhierFrames/totalFrames,jointStableFraction:jointStableFrames/totalFrames,hierFraction:hierFrames/totalFrames,allStarsWithinBoundaryAtEnd:diagnostics(bodies).starRadii.every(r=>r<=settings.newproperty13),boundPlanetAtEnd,minSS,minSP,maxEnergyError,maxEnergyErrorBeforeContact,maxNewtonEnergyChange,maxLError,closestEncounter,energyGainEvents:events,trajectory,steps:integrator.steps,completed,error,wallSeconds:(performance.now()-start)/1000};
}

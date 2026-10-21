import {pairPotential} from './physics/gravity.js';

const center=bodies=>{
  const mass=bodies.reduce((n,b)=>n+b.mass,0);
  const c={mass};
  for(const key of ['x','y','z','vx','vy','vz'])c[key]=bodies.reduce((n,b)=>n+b.mass*b[key],0)/mass;
  c.radius=Math.max(...bodies.map(b=>Math.hypot(b.x-c.x,b.y-c.y,b.z-c.z)));
  return c;
};

// Conservative separated-cluster test, not a proof of four-body future trajectories.
// This observer never changes a coordinate, velocity or force.
export function escapeCandidates(bodies,G,settings){
  if(settings.newproperty60||!['newtonian','plummer'].includes(settings.gravityModel)||!(G>0)||bodies.length!==4||bodies.some(b=>!(b.mass>0)||['x','y','z','vx','vy','vz'].some(k=>!Number.isFinite(b[k]))))return [];
  const all=center(bodies),result=[];
  // All seven distinct bipartitions: includes a departing host with a bound planet.
  for(let mask=1;mask<8;mask++){
    const a=bodies.filter((_,i)=>mask&(1<<i)),b=bodies.filter((_,i)=>!(mask&(1<<i))),ca=center(a),cb=center(b);
    const r=[ca.x-cb.x,ca.y-cb.y,ca.z-cb.z],v=[ca.vx-cb.vx,ca.vy-cb.vy,ca.vz-cb.vz],distance=Math.hypot(...r);
    if(!bodies.some(body=>Math.hypot(body.x-all.x,body.y-all.y,body.z-all.z)>settings.newproperty13)||distance<=4*(ca.radius+cb.radius))continue;
    const radialSpeed=r.reduce((n,x,i)=>n+x*v[i],0)/distance;
    if(!(radialSpeed>0))continue;
    let potential=0;
    for(const x of a)for(const y of b)potential+=x.mass*y.mass*pairPotential(Math.hypot(x.x-y.x,x.y-y.y,x.z-y.z),{model:settings.gravityModel,softening:settings.newproperty28});
    const kinetic=.5*v.reduce((n,x)=>n+x*x,0),specificPotential=G*(ca.mass+cb.mass)/(ca.mass*cb.mass)*potential,energy=kinetic+specificPotential;
    // A 10% energy margin excludes near-parabolic, noise-sensitive candidates.
    if(!(energy>.1*Math.abs(specificPotential)))continue;
    result.push({partition:mask,kind:mask===7?'planet-escape':'stellar-separation',distance,radialSpeed,specificEnergy:energy});
  }
  return result;
}

export class EscapeState{
  constructor(){this.reset();}
  reset(){this.timers=new Map();this.result={confirmed:false,candidate:null,years:0,confirmationYears:3};this.notified=false;}
  update(bodies,G,settings,elapsedYears){
    const candidates=escapeCandidates(bodies,G,settings),active=new Set(candidates.map(c=>c.partition));
    for(const key of this.timers.keys())if(!active.has(key))this.timers.delete(key);
    for(const c of candidates)this.timers.set(c.partition,(this.timers.get(c.partition)||0)+Math.max(0,elapsedYears));
    candidates.sort((a,b)=>this.timers.get(b.partition)-this.timers.get(a.partition)||a.partition-b.partition);
    const candidate=candidates[0]??null,years=candidate?this.timers.get(candidate.partition):0;
    this.result={confirmed:years>=3,candidate,years,confirmationYears:3};return this.result;
  }
}

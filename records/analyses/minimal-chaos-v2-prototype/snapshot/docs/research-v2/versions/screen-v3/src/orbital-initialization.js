// Seeded, initially bound orbits; subsequent motion is entirely the original four-body solver.
// Original random sampling and manual initial conditions remain selectable.
export function prepareBalancedOrbits(bodies,G,p,settings,random){
  if(settings.orbitalInitialization!=='balanced'||!(G>0)||bodies.some(b=>!(b.mass>0))||p.xcxc<.5)return false;
  const tau=2*Math.PI,phase=random()*tau,scale=p.xcxc*.43;
  for(let i=0;i<3;i++){
    const a=phase+i*tau/3+(random()-.5)*.045,r=scale*(.97+random()*.06);
    Object.assign(bodies[i],{x:r*Math.cos(a),y:r*Math.sin(a),z:(random()-.5)*scale*.025,vx:0,vy:0,vz:0});
  }
  const center=()=>{const m=bodies.slice(0,3).reduce((n,b)=>n+b.mass,0);return ['x','y','z'].map(k=>bodies.slice(0,3).reduce((n,b)=>n+b.mass*b[k],0)/m);};
  const com=center(),speedScale=Math.max(0,p.vcvc/.1);
  for(let i=0;i<3;i++){
    const b=bodies[i],dx=b.x-com[0],dy=b.y-com[1],r=Math.hypot(dx,dy);let inward=0;
    for(let j=0;j<3;j++)if(j!==i){const other=bodies[j],x=other.x-b.x,y=other.y-b.y,z=other.z-b.z,d=Math.hypot(x,y,z);inward+=G*other.mass*(-x*dx-y*dy)/(d*d*d*r);}
    if(p.constraint_En&&r>p.constraint_rc){const delta=r-p.constraint_rc;inward+=p.hardConstraint?(r<p.constraint_Rc?p.constraint_k2*G*p.constraint_M*delta/Math.sqrt(Math.max(p.constraint_Rc**2-delta**2,1e-5)):100*p.constraint_k2*G*p.constraint_M):p.constraint_k2*G*p.constraint_M*delta**p.constraint_n;}
    const v=Math.sqrt(Math.max(0,inward*r))*speedScale*(.985+random()*.03);b.vx=-dy/r*v;b.vy=dx/r*v;
  }
  const luminosities=[settings._111lum_sun,settings._211lum_sun,settings._311lum_sun];
  const hostIndex=luminosities.indexOf(Math.min(...luminosities)),host=bodies[hostIndex],planet=bodies[3];
  const nearest=Math.min(...bodies.slice(0,3).filter(b=>b!==host).map(b=>Math.hypot(b.x-host.x,b.y-host.y,b.z-host.z)));
  const others=bodies.slice(0,3).reduce((n,b,i)=>n+(i===hostIndex?0:luminosities[i]/((b.x-host.x)**2+(b.y-host.y)**2+(b.z-host.z)**2)),0);
  const distanceScale=1e12/settings.newproperty69/1.496e11,targetFlux=4*5.67e-8*293.15**4/(1361*.7)*distanceScale**2;
  const minimum=Math.max(p.ras*3.2,(settings[['_13','_21','_3'][hostIndex]]+settings.newproperty20)*3);
  const radius=Math.max(minimum,Math.min(nearest*.29,Math.sqrt(luminosities[hostIndex]/Math.max(.25,targetFlux-others))))*(.98+random()*.04);
  const angle=random()*tau,direction=random()<.5?-1:1,relativeSpeed=Math.sqrt(G*(host.mass+planet.mass)/radius)*speedScale;
  const vx=-Math.sin(angle)*relativeSpeed*direction,vy=Math.cos(angle)*relativeSpeed*direction,hostShare=host.mass/(host.mass+planet.mass),planetShare=1-hostShare;
  Object.assign(planet,{x:host.x+Math.cos(angle)*radius,y:host.y+Math.sin(angle)*radius,z:host.z,vx:host.vx+vx*hostShare,vy:host.vy+vy*hostShare,vz:host.vz});host.vx-=vx*planetShare;host.vy-=vy*planetShare;
  // Random common inclination preserves the initialized distances and binding energies.
  const yaw=random()*tau,pitch=(random()-.5)*.8,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  for(const b of bodies)for(const keys of [['x','y','z'],['vx','vy','vz']]){const[x,y,z]=keys.map(k=>b[k]),a=y*cp-z*sp,c=y*sp+z*cp;b[keys[0]]=x*cy+c*sy;b[keys[1]]=a;b[keys[2]]=-x*sy+c*cy;}
  const mass=bodies.reduce((n,b)=>n+b.mass,0);for(const key of ['x','y','z','vx','vy','vz']){const mean=bodies.reduce((n,b)=>n+b.mass*b[key],0)/mass;for(const b of bodies)b[key]-=mean;}
  return true;
}

// Irregular 3D configurations with random virial velocities, without circular/star-lock constraints.
export function prepareChaoticOrbits(bodies,G,p,settings,random){
  if(settings.orbitalInitialization!=='chaotic'||!(G>0)||bodies.some(b=>!(b.mass>0))||p.xcxc<.5)return false;
  const extent=p.xcxc,stars=bodies.slice(0,3),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  for(let i=0;i<3;i++){
    let trial;
    for(let attempt=0;attempt<80;attempt++){
      trial={x:(random()-.5)*extent,y:(random()-.5)*extent,z:(random()-.5)*extent};
      if(stars.slice(0,i).every(b=>distance(b,trial)>extent*.3))break;
    }
    Object.assign(stars[i],trial,{vx:random()-.5,vy:random()-.5,vz:random()-.5});
  }
  const mass=stars.reduce((n,b)=>n+b.mass,0),com=Object.fromEntries(['x','y','z','vx','vy','vz'].map(k=>[k,stars.reduce((n,b)=>n+b.mass*b[k],0)/mass]));
  for(const b of stars)for(const k of ['vx','vy','vz'])b[k]-=com[k];
  let potential=0;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)potential+=G*stars[i].mass*stars[j].mass/distance(stars[i],stars[j]);
  const kinetic=stars.reduce((n,b)=>n+.5*b.mass*(b.vx*b.vx+b.vy*b.vy+b.vz*b.vz),0);
  const ratio=.65+random()*.3,vscale=Math.sqrt(ratio*potential/Math.max(2*kinetic,1e-20))*p.vcvc/.1;
  for(const b of stars)for(const k of ['vx','vy','vz'])b[k]*=vscale;
  const planet=bodies[3];
  for(let attempt=0;attempt<80;attempt++){
    for(const k of ['x','y','z'])planet[k]=com[k]+(random()-.5)*extent*.65;
    if(stars.every(b=>distance(b,planet)>Math.max(p.ras*3.2,extent*.18))&&[planet.x,planet.y,planet.z].every(v=>Math.abs(v)<=extent/2))break;
  }
  for(const k of ['x','y','z'])planet[k]=Math.max(-extent/2,Math.min(extent/2,planet[k]));
  const escape=Math.sqrt(2*G*stars.reduce((n,b)=>n+b.mass/distance(b,planet),0)),v=[random()-.5,random()-.5,random()-.5],norm=Math.hypot(...v)||1;
  const speed=escape*(.25+random()*.25)*p.vcvc/.1;
  for(const [i,k]of ['vx','vy','vz'].entries())planet[k]=speed*v[i]/norm;
  const total=mass+planet.mass;for(const k of ['vx','vy','vz']){const drift=bodies.reduce((n,b)=>n+b.mass*b[k],0)/total;for(const b of bodies)b[k]-=drift;}
  return true;
}
export function prepareOrbits(...args){return prepareResearchOrbits(...args)||prepareChaoticOrbits(...args)||prepareBalancedOrbits(...args);}

// Frozen research candidate: random nonhierarchical stars, Q=1, host 3, retrograde .12D.
// No trajectory is integrated or scored while generating an initial state.
export function prepareResearchOrbits(bodies,G,p,settings,random){
 if(settings.orbitalInitialization!=='research')return false;
 if(!(G>0)||bodies.some(b=>!(b.mass>0))||p.xcxc<.5)return {metadata:{version:'original-fallback',reason:'Q=1 host initialization requires positive G/masses and extent >= 0.5'}};
 prepareChaoticOrbits(bodies,G,p,{...settings,orbitalInitialization:'chaotic'},random);
 const stars=bodies.slice(0,3),keys=['x','y','z','vx','vy','vz'],velKeys=keys.slice(3),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
 const center=items=>{const m=items.reduce((n,b)=>n+b.mass,0);return keys.map(k=>items.reduce((n,b)=>n+b.mass*b[k],0)/m);};
 const recenter=items=>{const c=center(items);for(const b of items)keys.forEach((k,i)=>b[k]-=c[i]);};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),unit=a=>{const n=Math.hypot(...a);return n>1e-14?a.map(x=>x/n):[0,0,1];};
 const radii=[settings._13,settings._21,settings._3];
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(distance(stars[i],stars[j])<=radii[i]+radii[j])throw new Error('随机位置范围过小或恒星半径过大，初始恒星重叠；请扩大范围或使用自定义初值');
 // Match the validated protocol, including its origin choice before planet placement.
 recenter(stars);let kinetic=0,potential=0;
 for(const b of stars)kinetic+=.5*b.mass*velKeys.reduce((n,k)=>n+b[k]**2,0);
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)potential+=G*stars[i].mass*stars[j].mass/distance(stars[i],stars[j]);
 if(!(kinetic>0&&potential>0))throw new Error('随机恒星初速度退化；请使用非零随机速度范围');
 const multiplier=Math.sqrt(potential/(2*kinetic));for(const b of stars)for(const k of velKeys)b[k]*=multiplier;
 const angular=[0,0,0];for(const b of stars){const h=cross([b.x,b.y,b.z],[b.vx,b.vy,b.vz]);h.forEach((x,i)=>angular[i]+=b.mass*x);}
 const hostIndex=2,host=stars[hostIndex],planet=bodies[3],nearest=Math.min(...stars.filter(b=>b!==host).map(b=>distance(host,b))),radius=.12*nearest;
 if(radius<=radii[hostIndex]+settings.newproperty20)throw new Error('0.12D行星轨道位于恒星表面以内；请增大位置范围或缩小天体半径');
 const normal=unit(angular),offset=[planet.x-host.x,planet.y-host.y,planet.z-host.z],raw=unit(offset),projection=raw.map((x,i)=>x-normal[i]*dot(raw,normal));
 if(Math.hypot(...projection)<1e-12){const least=normal.map(Math.abs).indexOf(Math.min(...normal.map(Math.abs))),basis=[0,0,0];basis[least]=1;for(let i=0;i<3;i++)projection[i]=basis[i]-normal[i]*dot(basis,normal);}
 const radial=unit(projection),tangent=unit(cross(normal,radial)),speed=Math.sqrt(G*(host.mass+planet.mass)/radius),hostShare=host.mass/(host.mass+planet.mass),planetShare=1-hostShare;
 for(let i=0;i<3;i++){planet[keys[i]]=host[keys[i]]+radius*radial[i];const v=-speed*tangent[i];planet[velKeys[i]]=host[velKeys[i]]+hostShare*v;host[velKeys[i]]-=planetShare*v;}
 recenter(bodies);
 for(let i=0;i<3;i++)if(distance(planet,stars[i])<=radii[i]+settings.newproperty20)throw new Error('初始行星与恒星重叠；请调整天体半径或星系尺度');
 return {metadata:{version:'research-q1-retro12-v1',host:hostIndex,nearestStellarDistance:nearest,planetRadius:radius,stellarVirialRatio:1,direction:'retrograde',stellarAngularMomentum:angular}};
}

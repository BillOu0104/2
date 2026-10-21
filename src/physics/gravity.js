// Newtonian/Yoshida kernel ported from research/newtonian-survival, engine-v4.mjs.
// Variable steps follow encounter time scales; global symplecticity is not claimed.
export const axes=['x','y','z','vx','vy','vz'];
const pairs=[[0,1],[0,2],[1,2],[0,3],[1,3],[2,3]];
const w1=1/(2-2**(1/3)),w0=-(2**(1/3))*w1;
const length=v=>Math.hypot(...v);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export class PhysicsError extends Error{constructor(code,message){super(message);this.name='PhysicsError';this.code=code;}}
export function pairPotential(r,{model='newtonian',softening=0,kSoft=2.8}={}){
 if(model==='plummer')return -1/Math.sqrt(r*r+softening*softening);
 if(model!=='legacy'||softening<=0)return -1/r;
 if(r>=kSoft*softening)return -1/r;
 const beta=3/(kSoft-1),alpha=1-beta;
 const middle=s=>-1/(kSoft*softening)+alpha*(1/(kSoft*softening)-1/s)+beta/softening*Math.log(s/(kSoft*softening));
 return r>softening?middle(r):middle(softening)+(r*r-softening*softening)/(2*softening**3);
}
export function invariants(bodies,G,options={}){
 const mass=bodies.reduce((n,b)=>n+b.mass,0),com=[0,0,0,0,0,0];
 if(mass>0)for(const b of bodies)axes.forEach((key,i)=>com[i]+=b.mass*b[key]/mass);
 let kinetic=0,inertialKinetic=0,potential=0;const momentum=[0,0,0],angularMomentum=[0,0,0];
 for(const b of bodies){const r=[b.x-com[0],b.y-com[1],b.z-com[2]],v=[b.vx-com[3],b.vy-com[4],b.vz-com[5]],h=cross(r,v);kinetic+=.5*b.mass*v.reduce((n,x)=>n+x*x,0);for(let i=0;i<3;i++){momentum[i]+=b.mass*b[axes[i+3]];angularMomentum[i]+=b.mass*h[i];}}
 for(const[i,j]of pairs){const a=bodies[i],b=bodies[j];if(a.mass&&b.mass)potential+=G*a.mass*b.mass*pairPotential(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),options);}
 for(const b of bodies)inertialKinetic+=.5*b.mass*(b.vx*b.vx+b.vy*b.vy+b.vz*b.vz);
 return {energy:kinetic+potential,inertialEnergy:inertialKinetic+potential,inertialKinetic,kinetic,potential,momentum,angularMomentum,center:com,virialRatio:potential<0?2*kinetic/-potential:null,mass};
}
export class GravityIntegrator{
 constructor(bodies,G,{model='newtonian',softening=0,kSoft=2.8,cageAcceleration=null,radii=null}={}){
  this.bodies=bodies;this.G=G;this.model=model;this.softening=softening;this.kSoft=kSoft;this.cageAcceleration=cageAcceleration;this.radii=radii;
  this.steps=0;this.time=0;this.contacts=[];this.contactKeys=new Set();this.numericalError=null;this.saved=new Float64Array(24);this.baseline=invariants(bodies,G,this);this.maxEnergyError=0;this.maxAngularError=0;this.maxMomentumError=0;this.maxEnergyErrorBeforeContact=0;
  this.angularScale=Math.max(length(this.baseline.angularMomentum),Math.sqrt(Math.abs(G)*Math.max(this.baseline.mass,1)**3)*1e-12,1e-20);this.momentumScale=Math.max(Math.sqrt(2*this.baseline.mass*this.baseline.kinetic),1);
 }
 drift(h){for(const b of this.bodies){b.x+=h*b.vx;b.y+=h*b.vy;b.z+=h*b.vz;}}
 kick(h){
  const b=this.bodies;
  for(const[i,j]of pairs){const a=b[i],c=b[j];if(a.mass<=0||c.mass<=0)continue;const x=c.x-a.x,y=c.y-a.y,z=c.z-a.z,r2=x*x+y*y+z*z;
   if(!Number.isFinite(r2))throw new PhysicsError('non-finite','天体坐标溢出；已停止数值推进');
   if(r2===0&&!(this.model==='plummer'&&this.softening>0))throw new PhysicsError('singularity','天体中心完全重合；点质量模型不能继续');
   let factor;
   if(this.model==='plummer')factor=this.G*h/(r2+this.softening**2)**1.5;
   else{const r=Math.sqrt(r2);let scale=1;if(this.model==='legacy'&&this.softening>0){if(r<=this.softening)scale=(r/this.softening)**3;else if(r<this.kSoft*this.softening)scale=1-3/(this.kSoft-1)+3*r/((this.kSoft-1)*this.softening);}factor=this.G*h*scale/(r2*r);}
   // Both members use the same pair force: equal and opposite momentum increments.
   if(a.mass>0){a.vx+=factor*c.mass*x;a.vy+=factor*c.mass*y;a.vz+=factor*c.mass*z;}
   if(c.mass>0){c.vx-=factor*a.mass*x;c.vy-=factor*a.mass*y;c.vz-=factor*a.mass*z;}
  }
  if(this.cageAcceleration)for(let i=0;i<b.length;i++){const a=this.cageAcceleration(b[i]);b[i].vx+=h*a.x;b[i].vy+=h*a.y;b[i].vz+=h*a.z;}
 }
 step(h){this.drift(w1*h/2);this.kick(w1*h);this.drift((w0+w1)*h/2);this.kick(w0*h);this.drift((w0+w1)*h/2);this.kick(w1*h);this.drift(w1*h/2);this.steps++;this.time+=h;}
 timescale(){let t=Infinity;for(const[i,j]of pairs){const a=this.bodies[i],b=this.bodies[j];if(a.mass<=0||b.mass<=0)continue;const separation=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z),r=this.model==='plummer'?Math.hypot(separation,this.softening):separation,v=Math.hypot(a.vx-b.vx,a.vy-b.vy,a.vz-b.vz),mu=Math.abs(this.G)*(a.mass+b.mass);if(mu>0)t=Math.min(t,Math.sqrt(r*r*r/mu));if(v>0)t=Math.min(t,r/v);}return t;}
 save(){for(let i=0;i<4;i++)for(let j=0;j<6;j++)this.saved[i*6+j]=this.bodies[i][axes[j]];}
 restore(){for(let i=0;i<4;i++)for(let j=0;j<6;j++)this.bodies[i][axes[j]]=this.saved[i*6+j];}
 detectContacts(h){
  const radii=typeof this.radii==='function'?this.radii():this.radii;if(!radii)return;
  for(const[i,j]of pairs){const key=`${i}:${j}`;if(this.contactKeys.has(key)||this.bodies[i].mass<=0||this.bodies[j].mass<=0)continue;
   const a=this.bodies[i],b=this.bodies[j],old=[0,1,2].map(k=>this.saved[j*6+k]-this.saved[i*6+k]),change=[b.x-a.x-old[0],b.y-a.y-old[1],b.z-a.z-old[2]],den=change.reduce((n,x)=>n+x*x,0),fraction=den>0?Math.max(0,Math.min(1,-old.reduce((n,x,k)=>n+x*change[k],0)/den)):0;
   const d=Math.hypot(...old.map((x,k)=>x+fraction*change[k])),limit=radii[i]+radii[j];
   if(d<=limit){this.contactKeys.add(key);this.contacts.push({pair:[i,j],time:this.time-h+fraction*h,distance:d,radius:limit,method:'accepted-step-segment'});}
  }
 }
 advance(duration,{maxStep=.00075,eta=.0075,adaptive=true,minStep=1e-10,maxSteps=200000,onAcceptedStep=null}={}){
  if(!Number.isFinite(duration)||!Number.isFinite(maxStep)||maxStep<=0||!Number.isFinite(eta)||eta<=0)throw new PhysicsError('invalid-step','物理步长或近遇精度参数无效');
  const sign=Math.sign(duration);let remaining=Math.abs(duration),used=0;
  try{while(remaining>1e-14){const limit=Math.min(maxStep,adaptive?eta*this.timescale():Infinity),magnitude=Math.min(remaining,limit);if(!(limit>minStep))throw new PhysicsError('minimum-step','近遇所需步长低于安全下限；数值中断不计为物理死亡');if(used++>=maxSteps)throw new PhysicsError('step-budget','单帧近遇计算预算耗尽；未跳过物理时间');
    const h=sign*magnitude;this.save();const oldTime=this.time,oldSteps=this.steps;
    try{this.step(h);if(this.bodies.some(b=>axes.some(k=>!Number.isFinite(b[k]))))throw new PhysicsError('non-finite','数值溢出；已恢复到最后有效状态');}
    catch(error){this.restore();this.time=oldTime;this.steps=oldSteps;throw error;}
    this.detectContacts(h);remaining=Math.max(0,remaining-magnitude);onAcceptedStep?.(this.bodies,this.time);
   }}catch(error){this.numericalError={code:error.code||'numerical-error',message:error.message,time:this.time};throw error;}
  return used;
 }
 diagnostics(){
  const now=invariants(this.bodies,this.G,this),energyError=Math.abs(now.energy-this.baseline.energy)/Math.max(Math.abs(this.baseline.energy),1e-20),angularError=length(now.angularMomentum.map((x,i)=>x-this.baseline.angularMomentum[i]))/this.angularScale,momentumError=length(now.momentum.map((x,i)=>x-this.baseline.momentum[i]))/this.momentumScale;
  this.maxEnergyError=Math.max(this.maxEnergyError,energyError);this.maxAngularError=Math.max(this.maxAngularError,angularError);this.maxMomentumError=Math.max(this.maxMomentumError,momentumError);if(!this.contacts.length)this.maxEnergyErrorBeforeContact=Math.max(this.maxEnergyErrorBeforeContact,energyError);
  const expectedCenter=this.baseline.center.slice(0,3).map((x,i)=>x+this.baseline.center[i+3]*this.time);
  const centerPositionDrift=length(expectedCenter.map((x,i)=>now.center[i]-x)),centerVelocityDrift=length(now.center.slice(3).map((x,i)=>x-this.baseline.center[i+3]));
  return {...now,expectedCenter,initialCenter:[...this.baseline.center],centerPositionDrift,centerVelocityDrift,relativeInertialEnergyError:Math.abs(now.inertialEnergy-this.baseline.inertialEnergy)/Math.max(Math.abs(this.baseline.inertialEnergy),1e-20),model:this.model,steps:this.steps,solverTime:this.time,relativeEnergyError:energyError,maxRelativeEnergyError:this.maxEnergyError,maxRelativeEnergyErrorBeforeContact:this.maxEnergyErrorBeforeContact,relativeAngularMomentumError:angularError,maxRelativeAngularMomentumError:this.maxAngularError,normalizedMomentumDrift:momentumError,maxNormalizedMomentumDrift:this.maxMomentumError,cageActive:!!this.cageAcceleration,conservationApplicable:!this.cageAcceleration,physicalModelValid:!this.contacts.length,contacts:this.contacts,numericalError:this.numericalError};
 }
}

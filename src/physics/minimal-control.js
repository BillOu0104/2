// V2 velocity feedback, ported from frozen research native.cpp@7f64a8a.
// Called before adaptive step selection; no coordinates or orbital scripts.
export const norm=v=>Math.hypot(...v),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const pos=b=>[b.x,b.y,b.z],vel=b=>[b.vx,b.vy,b.vz];
export const keys=['x','y','z','vx','vy','vz'];
export function center(b){const m=b.reduce((s,x)=>s+x.mass,0);return keys.map(k=>b.reduce((s,x)=>s+x.mass*x[k],0)*(1/m));}
export function applyVelocity(body,dv,cost){
 const v=vel(body),r=pos(body),dp=dv.map(x=>x*body.mass);
 const w=body.mass*(dot(v,dv)+.5*dot(dv,dv));cost.work+=w;
 cost.peakVelocityJump=Math.max(cost.peakVelocityJump,norm(dv));
 const dl=cross(r,dp);cost.cumulativeBodyAngularImpulse+=norm(dl);for(let k=0;k<3;k++){cost.deltaP[k]+=dp[k];cost.deltaL[k]+=dl[k];body[keys[k+3]]+=dv[k];}
 return w;
}
function projectionStart(b,cost){return {v:b.slice(0,3).map(vel),work:cost.work,absoluteWork:cost.absoluteWork,impulse:cost.impulse,deltaP:[...cost.deltaP],deltaL:[...cost.deltaL]};}
function projectionEnd(kind,b,cost,before,notify){if(!notify)return;const deltaVelocity=b.slice(0,3).map((body,i)=>sub(vel(body),before.v[i]));const peakNetVelocityJump=Math.max(...deltaVelocity.map(norm));cost.peakNetVelocityJump=Math.max(cost.peakNetVelocityJump??0,peakNetVelocityJump);notify({kind,deltaVelocity,peakNetVelocityJump,work:cost.work-before.work,absoluteWork:cost.absoluteWork-before.absoluteWork,impulse:cost.impulse-before.impulse,deltaP:sub(cost.deltaP,before.deltaP),deltaL:sub(cost.deltaL,before.deltaL)});}
export function capture(b,G,cfg,scale,cost,onProjection=null){
 if(!cfg.capture)return 0;let count=0;
 for(let i=0;i<3;i++){
  const others=b.slice(0,3).filter((_,j)=>j!==i),c=center(others),M=others.reduce((s,x)=>s+x.mass,0),r=sub(pos(b[i]),c.slice(0,3)),v=sub(vel(b[i]),c.slice(3)),R=norm(r),vr=dot(r,v)/R,mu=G*(M+b[i].mass),E=.5*dot(v,v)-mu/R;
  const target=-mu/((cfg.apocenterScale??4)*scale),trigger=cfg.captureTriggerScale>0?-mu/(cfg.captureTriggerScale*scale):(cfg.capturePositiveOnly?0:target);
  if(!(vr>0&&R>(cfg.captureRadiusScale??1.5)*scale&&R>(cfg.captureSeparationFactor??0)*norm(sub(pos(others[0]),pos(others[1])))&&E>trigger+1e-14*mu/scale))continue;
  const before=onProjection?projectionStart(b,cost):null;
  const vt2=Math.max(0,dot(v,v)-vr*vr),available=Math.max(0,2*(mu/R+target));let dv;
  if(available>=vt2){const change=Math.sqrt(available-vt2)-vr;dv=r.map(x=>x*(change/R));}
  else{const ratio=Math.sqrt(available/dot(v,v));dv=v.map(x=>x*(ratio-1));}
  const share=M/(M+b[i].mass),reaction=-b[i].mass/(M+b[i].mass),oldWork=cost.work;let absoluteWork=0;
  const velocities=b.slice(0,3).map((body,j)=>({body,dv:dv.map(x=>x*(j===i?share:reaction))}));
  for(const item of velocities){absoluteWork+=Math.abs(applyVelocity(item.body,item.dv,cost));cost.impulse+=item.body.mass*norm(item.dv);}
  cost.absoluteWork+=absoluteWork;const removed=oldWork-cost.work;
  if(cfg.redistribute&&removed>0){const a=b[(i+1)%3],c=b[(i+2)%3],r=sub(pos(a),pos(c)),nr=r.map(x=>x/norm(r)),u=sub(vel(a),vel(c)),ur=dot(nr,u),reduced=a.mass*c.mass/(a.mass+c.mass),newUr=Math.sign(ur||1)*Math.sqrt(ur*ur+2*removed/reduced),change=nr.map(x=>x*(newUr-ur));for(const [body,share]of [[a,c.mass/(a.mass+c.mass)],[c,-a.mass/(a.mass+c.mass)]]){const dv=change.map(x=>x*share);cost.absoluteWork+=Math.abs(applyVelocity(body,dv,cost));cost.impulse+=body.mass*norm(dv);}}
  cost.projectionEvents++;count++;projectionEnd('capture',b,cost,before,onProjection);
 }
 return count;
}
export function reflect(b,G,cfg,settings,cost,onProjection=null){if(!cfg.reflect)return;for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const r=sub(pos(b[j]),pos(b[i])),v=sub(vel(b[j]),vel(b[i])),R=norm(r),vr=dot(r,v)/R,radii=[settings._13,settings._21,settings._3],guard=(cfg.reflectionMargin??1.15)*(radii[i]+radii[j])*(settings.stellarBreathing?1.08:1);if(!(R<guard&&vr<0))continue;const before=onProjection?projectionStart(b,cost):null;const change=r.map(x=>-2*vr*x/R),M=b[i].mass+b[j].mass;for(const [body,f]of [[b[i],-b[j].mass/M],[b[j],b[i].mass/M]]){const dv=change.map(x=>x*f);cost.absoluteWork+=Math.abs(applyVelocity(body,dv,cost));cost.impulse+=body.mass*norm(dv);}cost.projectionEvents++;cost.reflectionEvents=(cost.reflectionEvents??0)+1;projectionEnd('reflect',b,cost,before,onProjection);}}
export function deflect(b,G,cfg,settings,cost,onProjection=null){
 if(!cfg.deflect)return;
 const radii=[settings._13,settings._21,settings._3];
 for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){
  const r=sub(pos(b[j]),pos(b[i])),v=sub(vel(b[j]),vel(b[i])),R=norm(r),vr=dot(r,v)/R,radius=(radii[i]+radii[j])*(settings.stellarBreathing?1.08:1),target=(cfg.deflectionTarget??1.3)*radius;
  if(!(vr<0&&R<(cfg.deflectionFactor??4)*radius&&R>target))continue;
  const mu=G*(b[i].mass+b[j].mass),E=.5*dot(v,v)-mu/R,h=cross(r,v),h2=dot(h,h),ecc=Math.sqrt(Math.max(0,1+2*E*h2/(mu*mu))),q=h2/(mu*(1+ecc));if(!(q<(cfg.reflectionMargin??1.15)*radius))continue;
  const vt2=Math.max(0,(2*target*target*E+2*mu*target)/(R*R));if(!(vt2<dot(v,v)))continue;
  const n=r.map(x=>x/R);let t=sub(v,n.map(x=>x*vr));if(norm(t)<1e-12){const k=n.map(Math.abs).indexOf(Math.min(...n.map(Math.abs))),basis=[0,0,0];basis[k]=1;t=sub(basis,n.map(x=>x*dot(basis,n)));}t=t.map(x=>x/norm(t));
  const before=onProjection?projectionStart(b,cost):null;
  const u=n.map((x,k)=>-x*Math.sqrt(Math.max(0,dot(v,v)-vt2))+t[k]*Math.sqrt(vt2)),change=sub(u,v),M=b[i].mass+b[j].mass;
  for(const [body,f]of [[b[i],-b[j].mass/M],[b[j],b[i].mass/M]]){const dv=change.map(x=>x*f);cost.absoluteWork+=Math.abs(applyVelocity(body,dv,cost));cost.impulse+=body.mass*norm(dv);}
  cost.projectionEvents++;cost.deflectionEvents=(cost.deflectionEvents??0)+1;projectionEnd('deflect',b,cost,before,onProjection);
 }
}

export function emptyCost(){return {work:0,absoluteWork:0,impulse:0,peakNetVelocityJump:0,peakVelocityJump:0,deltaP:[0,0,0],deltaL:[0,0,0],cumulativeBodyAngularImpulse:0,projectionEvents:0,reflectionEvents:0,deflectionEvents:0,activeFrames:0,projectionFrames:0,activeTime:0,peakAcceleration:0,accelerationIntegral:0,accelerationSquaredIntegral:0};}

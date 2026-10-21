// Research controllers; production src is never patched by this module.
export const norm=v=>Math.hypot(...v),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const sub=(a,b)=>a.map((x,i)=>x-b[i]);
export const pos=b=>[b.x,b.y,b.z],vel=b=>[b.vx,b.vy,b.vz];
export const keys=['x','y','z','vx','vy','vz'];
export function center(b){const m=b.reduce((s,x)=>s+x.mass,0);return keys.map(k=>b.reduce((s,x)=>s+x.mass*x[k],0)/m);}
export function forces(b,G,cfg,settings){
 const a=Array.from({length:4},()=>[0,0,0]);
 if(cfg.cage){const c=center(b);for(let i=0;i<4;i++){if(!b[i].mass)continue;const r=sub(pos(b[i]),c.slice(0,3)),R=norm(r);let f=0;
  if(R<=settings.re)f=-settings.k1*G*settings.mc*(1-(R/settings.re)**2)**2;
  else if(cfg.hardCage){if(R>settings.rc&&R<settings.newproperty67)f=settings.k2*G*settings.mc*(R-settings.rc)/Math.sqrt(Math.max(settings.newproperty67**2-(R-settings.rc)**2,1e-5));else if(R>=settings.newproperty67)f=100*settings.k2*G*settings.mc;}
  else if(R>settings.rc)f=settings.k2*G*settings.mc*(R-settings.rc)**settings.expc;
  a[i]=r.map(x=>-f*x/Math.max(R,1e-15));
 }}
 if(cfg.barrier)for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const r=sub(pos(b[j]),pos(b[i])),R=norm(r),x=(cfg.barrierRadius??.25)/R;if(x<=1)continue;const u=x-1,f=G*(cfg.barrierAlpha??.1)*(u**4+4*x*u**3)/(R**3);for(let k=0;k<3;k++){a[i][k]-=f*b[j].mass*r[k];a[j][k]+=f*b[i].mass*r[k];}}
 return a;
}
export function applyVelocity(body,dv,cost){
 const v=vel(body),r=pos(body),dp=dv.map(x=>x*body.mass);
 const w=body.mass*(dot(v,dv)+.5*dot(dv,dv));cost.work+=w;
 const dl=cross(r,dp);for(let k=0;k<3;k++){cost.deltaP[k]+=dp[k];cost.deltaL[k]+=dl[k];body[keys[k+3]]+=dv[k];}
 return w;
}
export function capture(b,G,cfg,scale,cost){
 if(!cfg.capture)return 0;let count=0;
 for(let i=0;i<3;i++){
  const others=b.slice(0,3).filter((_,j)=>j!==i),c=center(others),M=others.reduce((s,x)=>s+x.mass,0),r=sub(pos(b[i]),c.slice(0,3)),v=sub(vel(b[i]),c.slice(3)),R=norm(r),vr=dot(r,v)/R,mu=G*(M+b[i].mass),E=.5*dot(v,v)-mu/R;
  const target=-mu/((cfg.apocenterScale??4)*scale);
  if(!(vr>0&&R>(cfg.captureRadiusScale??1.5)*scale&&E>target))continue;
  const vt2=Math.max(0,dot(v,v)-vr*vr),available=Math.max(0,2*(mu/R+target));let dv;
  if(available>=vt2){const change=Math.sqrt(available-vt2)-vr;dv=r.map(x=>x/R*change);}
  else{const ratio=Math.sqrt(available/dot(v,v));dv=v.map(x=>x*(ratio-1));}
  const share=M/(M+b[i].mass),reaction=-b[i].mass/(M+b[i].mass);let absoluteWork=0;
  const velocities=[{body:b[i],dv:dv.map(x=>x*share)},...others.map(body=>({body,dv:dv.map(x=>x*reaction)}))];
  for(const item of velocities){absoluteWork+=Math.abs(applyVelocity(item.body,item.dv,cost));cost.impulse+=item.body.mass*norm(item.dv);}
  cost.absoluteWork+=absoluteWork;cost.projectionEvents++;count++;
 }
 return count;
}

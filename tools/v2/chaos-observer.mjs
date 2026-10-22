import {GravityIntegrator,PhysicsError} from '../../src/physics/gravity.js';
import {V2_STEP,V2_ETA} from '../../src/physics/controlled-system.js';
import {deflect,reflect,capture,emptyCost,norm,dot,cross,sub,pos,vel,center,keys} from '../../src/physics/minimal-control.js';
const pairs=[[0,1],[0,2],[1,2]],distance=(a,b)=>norm(sub(pos(a),pos(b)));
// Diagnostic observer only: the primary bodies and its control ledger are never
// passed to the shadow integrator. Planet lifecycle follows the primary forcing.
export class ChaosObserver{
 constructor(primary,{epsilon=1e-8,windowYears=10,shadow=true}={}){
  this.scale=primary.scale;this.G=primary.G;this.settings=structuredClone(primary.settings);this.cfg=structuredClone(primary.cfg);this.epsilon=epsilon;this.windowYears=windowYears;this.shadowEnabled=shadow;this.frame=0;this.losses=0;
  this.bodies=structuredClone(primary.bodies);this.bodies[0].x+=epsilon*this.scale/Math.sqrt(2);this.bodies[1].x-=epsilon*this.scale/Math.sqrt(2);
  this.integrator=new GravityIntegrator(this.bodies,this.G);this.cost=emptyCost();this.fullLog=0;this.fullYears=0;this.matureLog=0;this.matureYears=0;this.windows=[];
  this.nonhier=0;this.matureNonhier=0;this.geometricRun=0;this.longestGeometric=0;this.dynamicFrames=0;this.matureDynamic=0;this.dynamicRun=0;this.longestDynamic=0;this.lastPair=-1;this.closestChanges=0;this.lastTight=-1;this.tightChanges=0;
 }
 advanceShadow(duration){if(duration<=1e-14)return;this.integrator.advance(duration,{maxStep:V2_STEP,eta:V2_ETA,beforeStep:()=>{deflect(this.bodies,this.G,this.cfg,this.settings,this.cost);reflect(this.bodies,this.G,this.cfg,this.settings,this.cost);}});}
 observe(primary){
  if(primary.frame!==this.frame+1)throw new Error('Shadow observer skipped or repeated a primary frame');
  if(this.shadowEnabled){
   // Native uses a fresh dummy cost each frame; it can affect subtraction
   // rounding in redistributed capture, so preserve that ordering too.
   this.cost=emptyCost();
   if(primary.planetLosses>this.losses&&this.bodies[3].mass>0){const offset=Math.max(0,Math.min(.0075,(primary.lastPlanetLoss.year*60-this.frame)*.0075));this.advanceShadow(offset);this.bodies[3].mass=0;this.advanceShadow(.0075-offset);}
   else this.advanceShadow(.0075);
   capture(this.bodies,this.G,this.cfg,this.scale,this.cost);
   if((this.bodies[3].mass>0)!==(primary.bodies[3].mass>0))Object.assign(this.bodies[3],primary.bodies[3]);
  }
  this.frame=primary.frame;this.losses=primary.planetLosses;this.observeGeometry(primary.bodies);
  if(this.shadowEnabled&&this.frame%Math.round(this.windowYears*60)===0)this.renormalize(primary.bodies);
 }
 observeGeometry(b){
  const ds=pairs.map(([i,j])=>distance(b[i],b[j])),minimum=Math.min(...ds),pair=ds.indexOf(minimum),shape=Math.max(...ds)/minimum;
  if(pair!==this.lastPair){if(this.lastPair>=0)this.closestChanges++;this.lastPair=pair;}
  if(shape<3){this.nonhier++;if(this.frame>600000)this.matureNonhier++;}if(shape>5){this.geometricRun++;this.longestGeometric=Math.max(this.longestGeometric,this.geometricRun);}else this.geometricRun=0;
  const [i,j]=pairs[pair],k=3-i-j,r=sub(pos(b[i]),pos(b[j])),v=sub(vel(b[i]),vel(b[j])),mu=this.G*(b[i].mass+b[j].mass),energy=.5*dot(v,v)-mu/minimum;let hierarchical=false;
  if(energy<0){
   const a=-mu/(2*energy),h=norm(cross(r,v)),ecc=Math.sqrt(Math.max(0,1+2*energy*h*h/(mu*mu))),apo=a*(1+ecc),next=Math.min(...ds.filter((_,q)=>q!==pair));
   if(minimum<.5*next&&pair!==this.lastTight){if(this.lastTight>=0)this.tightChanges++;this.lastTight=pair;}
   const c=center([b[i],b[j]]),rr=sub(pos(b[k]),c.slice(0,3)),vv=sub(vel(b[k]),c.slice(3)),R=norm(rr),outerMu=this.G*(b[i].mass+b[j].mass+b[k].mass),outerEnergy=.5*dot(vv,vv)-outerMu/R;
   if(outerEnergy<0){const outerH=norm(cross(rr,vv)),outerEcc=Math.sqrt(Math.max(0,1+2*outerEnergy*outerH*outerH/(outerMu*outerMu))),peri=outerH*outerH/(outerMu*(1+outerEcc));hierarchical=peri>3*apo;}
  }
  if(hierarchical){this.dynamicFrames++;if(this.frame>600000)this.matureDynamic++;this.dynamicRun++;this.longestDynamic=Math.max(this.longestDynamic,this.dynamicRun);}else this.dynamicRun=0;
 }
 renormalize(primary){
  const velocityScale=Math.sqrt(this.G*15e6/this.scale),dr=[0,0,0],dv=[0,0,0];
  for(let i=0;i<3;i++)for(let k=0;k<3;k++){dr[k]+=this.bodies[i][keys[k]]-primary[i][keys[k]];dv[k]+=this.bodies[i][keys[k+3]]-primary[i][keys[k+3]];}
  for(let k=0;k<3;k++){dr[k]*=1/3;dv[k]*=1/3;}
  let sum=0;for(let i=0;i<3;i++){const r=sub(sub(pos(this.bodies[i]),pos(primary[i])),dr),v=sub(sub(vel(this.bodies[i]),vel(primary[i])),dv);sum+=dot(r,r)/(this.scale*this.scale)+dot(v,v)/(velocityScale*velocityScale);}
  const D=Math.sqrt(sum);if(!(D>0&&Number.isFinite(D)))throw new PhysicsError('shadow-collapse','Conditional stellar shadow collapsed or became non-finite; primary physical outcome is separate');
  const log=Math.log(D/this.epsilon),ratio=this.epsilon/D;this.fullLog+=log;this.fullYears+=this.windowYears;if(this.frame>600000){this.matureLog+=log;this.matureYears+=this.windowYears;}
  this.windows.push({year:this.frame/60,logGrowth:log});
  for(let i=0;i<3;i++)for(let k=0;k<3;k++){this.bodies[i][keys[k]]=primary[i][keys[k]]+(this.bodies[i][keys[k]]-primary[i][keys[k]]-dr[k])*ratio;this.bodies[i][keys[k+3]]=primary[i][keys[k+3]]+(this.bodies[i][keys[k+3]]-primary[i][keys[k+3]]-dv[k])*ratio;}
  Object.assign(this.bodies[3],primary[3]);
 }
 checkpoint(){return structuredClone({format:'conditional-stellar-shadow-v1',state:Object.fromEntries(Object.entries(this).filter(([k])=>k!=='integrator')),time:this.integrator.time,steps:this.integrator.steps});}
 static restore(data){if(data.format!=='conditional-stellar-shadow-v1')throw new Error('Unsupported shadow checkpoint');const o=Object.create(ChaosObserver.prototype);Object.assign(o,structuredClone(data.state));o.integrator=new GravityIntegrator(o.bodies,o.G);o.integrator.time=data.time;o.integrator.steps=data.steps;return o;}
 result(horizon,stellarIntact){
  const total=horizon*60,mature=(horizon-10000)*60,FTLE=this.matureYears>0?this.matureLog/this.matureYears:null,nonhier=mature>0?this.matureNonhier/mature:null;
  const q={fullConditionalFTLE:this.fullYears>0?this.fullLog/this.fullYears:null,matureConditionalFTLE:FTLE,lyapunovWindows:this.matureYears/this.windowYears,lyapunovScope:'stellar shadow conditioned on primary planet lifecycle; 10-year renormalization, dimensionless eps1e-8; not full-four-body infinite spectrum',nonhierFraction:this.nonhier/total,matureNonhierFraction:nonhier,dynHierFraction:this.dynamicFrames/total,matureDynHierFraction:mature>0?this.matureDynamic/mature:null,longestHierarchyYears:this.longestGeometric/60,longestDynamicalHierarchyYears:this.longestDynamic/60,closestPairChanges:this.closestChanges,tightPairChanges:this.tightChanges};
  q.diagnosticJoint=horizon>=30000&&this.shadowEnabled&&stellarIntact&&FTLE>.003&&q.tightPairChanges>=20&&q.longestDynamicalHierarchyYears<1000&&q.longestHierarchyYears<=5000&&nonhier>=.1;q.joint=horizon===100000&&q.diagnosticJoint;return q;
 }
}

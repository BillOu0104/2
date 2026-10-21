// C++17 translation of the frozen JS research driver. No fast-math/FMA contraction.
// Numerical equivalence is measured, never inferred from the language translation.
#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <csignal>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include <sys/resource.h>
#include "vendor/json.hpp"
using json=nlohmann::json;
using V=std::array<double,3>;
V add(V a,V b){for(int k=0;k<3;k++)a[k]+=b[k];return a;}
V sub(V a,V b){for(int k=0;k<3;k++)a[k]-=b[k];return a;}
V mul(V a,double s){for(double& x:a)x*=s;return a;}
double dot(V a,V b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
double norm(V a){return std::hypot(a[0],a[1],a[2]);}
V cross(V a,V b){return {a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]};}
V unit(V a){double n=norm(a);return n>1e-14?mul(a,1/n):V{0,0,1};}
double clamp(double x,double a=0,double b=1){return std::max(a,std::min(b,x));}
constexpr double G=1.3275440274585598e-8;
constexpr int pi[6]={0,0,1,0,1,2},pj[6]={1,2,2,3,3,3};
struct Body{V r{},v{};double mass=0;};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Body,r,v,mass)
using Bodies=std::array<Body,4>;
struct Cost{double work=0,absoluteWork=0,impulse=0,peakAcceleration=0,accelerationIntegral=0,accelerationSquaredIntegral=0,activeTime=0,peakVelocityJump=0;V deltaP{},deltaL{};long long projectionEvents=0,projectionFrames=0,activeFrames=0,reflectionEvents=0;};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Cost,work,absoluteWork,impulse,peakAcceleration,accelerationIntegral,accelerationSquaredIntegral,activeTime,peakVelocityJump,deltaP,deltaL,projectionEvents,projectionFrames,activeFrames,reflectionEvents)
struct World{int primary=-1,candidate=-1;double stableTime=0,unstableTime=0,integrity=1,recoveryTime=0,temperature=0,lastFlux=0,fluxChange=0;bool stable=false,hasTemperature=false,hasFlux=false;int terminal=0;};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(World,primary,candidate,stableTime,unstableTime,integrity,recoveryTime,temperature,lastFlux,fluxChange,stable,hasTemperature,hasFlux,terminal)
struct Civ{bool alive=false;int phase=0,number=1,level=1;double development=0,safeTime=0,progress=0,population=1,storage=1,startYear=0,maxLife=0;long long births=0,deaths=0,aliveFrames=0,activeFrames=0;};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(Civ,alive,phase,number,level,development,safeTime,progress,population,storage,startYear,maxLife,births,deaths,aliveFrames,activeFrames)
struct Inv{double E=0,K=0,U=0;V P{},L{},R{},vcm{};};
Inv invariant(const Bodies& b){Inv e;double m=0;for(auto x:b){m+=x.mass;e.R=add(e.R,mul(x.r,x.mass));e.P=add(e.P,mul(x.v,x.mass));e.L=add(e.L,mul(cross(x.r,x.v),x.mass));e.K+=.5*x.mass*dot(x.v,x.v);}e.R=mul(e.R,1/m);e.vcm=mul(e.P,1/m);for(int p=0;p<6;p++){auto a=b[pi[p]],c=b[pj[p]];if(a.mass&&c.mass)e.U-=G*a.mass*c.mass/norm(sub(a.r,c.r));}e.E=e.K+e.U;return e;}
struct Config{bool cage=false,hardCage=false,barrier=false,capture=false,noRespawn=false,shadow=false,reflect=false,redistribute=false;double barrierRadius=.25,barrierAlpha=.1,apocenterScale=4,captureRadiusScale=1.5,reflectionMargin=1.15,dt=.00075,eta=.0075;};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE_WITH_DEFAULT(Config,cage,hardCage,barrier,capture,noRespawn,shadow,reflect,redistribute,barrierRadius,barrierAlpha,apocenterScale,captureRadiusScale,reflectionMargin,dt,eta)
struct State{
 Bodies b{},initial{};World world{};Civ civ{};Cost cost{},external{};Config cfg{};
 std::string seed,profile,sourceHash,configHash;double scale=0,initialE=0,time=0,minSS=1e100,maxResidual=0,firstPlanetLoss=-1,wallSeconds=0;
 long long frame=0,steps=0,returnFrame=-1,planetLosses=0,planetRespawns=0,stableFrames=0,matureStableFrames=0,absentFrames=0,nonhierFrames=0,changes=0,hierarchyRun=0,longestHierarchy=0;
 int lastPair=-1;std::array<double,12> timers{};json failure=nullptr,error=nullptr;std::vector<json> events,history,bins;
 Bodies shadow{};double lyapSum=0,lyapYears=0;long long lyapWindows=0;double shadowTime=0;
};
NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(State,b,initial,world,civ,cost,external,cfg,seed,profile,sourceHash,configHash,scale,initialE,time,minSS,maxResidual,firstPlanetLoss,wallSeconds,frame,steps,returnFrame,planetLosses,planetRespawns,stableFrames,matureStableFrames,absentFrames,nonhierFrames,changes,hierarchyRun,longestHierarchy,lastPair,timers,failure,error,events,history,bins,shadow,lyapSum,lyapYears,lyapWindows,shadowTime)
struct Options{double radius[4]={.03,.023,.016,.01},lum[3]={1.5,.5,.1},escapeRadius=6,climateInertia=1.5,epochWindow=1.0/12,hardness=1.6,planetMass=5000,tempDist=7,low=-20,high=40,storageLow=-100,storageHigh=200,thermalGrace=30,birthDelay=.5,wakeDelay=1,developmentRate=1,cageM=15e6,cageK1=0,cageK2=.3,cageRc=1.6,cageRe=.1,cageLimit=4,cageN=2;bool breathing=true,levels=true;};
Options opt;
Body center(const Bodies& b,int mask){Body c;for(int i=0;i<4;i++)if((mask&(1<<i))&&b[i].mass>0){c.mass+=b[i].mass;c.r=add(c.r,mul(b[i].r,b[i].mass));c.v=add(c.v,mul(b[i].v,b[i].mass));}if(c.mass){c.r=mul(c.r,1/c.mass);c.v=mul(c.v,1/c.mass);}return c;}
std::array<V,4> controlForce(const Bodies& b,const Config& cfg){
 std::array<V,4>a{};
 if(cfg.cage){auto c=center(b,15);for(int i=0;i<4;i++){if(!b[i].mass)continue;V r=sub(b[i].r,c.r);double R=norm(r),f=0;if(R<=opt.cageRe)f=-opt.cageK1*G*opt.cageM*std::pow(1-std::pow(R/opt.cageRe,2),2);else if(cfg.hardCage){if(R>opt.cageRc&&R<opt.cageLimit)f=opt.cageK2*G*opt.cageM*(R-opt.cageRc)/std::sqrt(std::max(opt.cageLimit*opt.cageLimit-std::pow(R-opt.cageRc,2),1e-5));else if(R>=opt.cageLimit)f=100*opt.cageK2*G*opt.cageM;}else if(R>opt.cageRc)f=opt.cageK2*G*opt.cageM*std::pow(R-opt.cageRc,opt.cageN);a[i]=mul(r,-f/std::max(R,1e-15));}}
 if(cfg.barrier)for(int p=0;p<3;p++){int i=pi[p],j=pj[p];V r=sub(b[j].r,b[i].r);double R=norm(r),x=cfg.barrierRadius/R;if(x<=1)continue;double u=x-1,f=G*cfg.barrierAlpha*(u*u*u*u+4*x*u*u*u)/(R*R*R);a[i]=sub(a[i],mul(r,f*b[j].mass));a[j]=add(a[j],mul(r,f*b[i].mass));}
 return a;
}
double apply(Body& b,V dv,Cost& cost){V dp=mul(dv,b.mass);double w=b.mass*(dot(b.v,dv)+.5*dot(dv,dv));cost.work+=w;cost.deltaP=add(cost.deltaP,dp);cost.deltaL=add(cost.deltaL,cross(b.r,dp));b.v=add(b.v,dv);return w;}
void drift(Bodies& b,double h){for(auto& x:b)x.r=add(x.r,mul(x.v,h));}
void kick(Bodies& b,double h,const Config& cfg,Cost& cost){
 std::array<V,4>v0{};double oldWork=cost.work;if(cfg.barrier||cfg.cage)for(int i=0;i<4;i++)v0[i]=b[i].v;
 for(int p=0;p<6;p++){auto& a=b[pi[p]];auto& c=b[pj[p]];if(a.mass<=0||c.mass<=0)continue;V r=sub(c.r,a.r);double r2=dot(r,r);if(!(r2>0&&std::isfinite(r2)))throw std::runtime_error("singularity/non-finite");double f=G*h/(r2*std::sqrt(r2)),am=f*c.mass,bm=f*a.mass;a.v=add(a.v,mul(r,am));c.v=sub(c.v,mul(r,bm));}
 if(cfg.barrier||cfg.cage){auto a=controlForce(b,cfg);for(int i=0;i<4;i++)if(b[i].mass)apply(b[i],mul(a[i],h),cost);cost.work=oldWork;for(int i=0;i<4;i++)cost.work+=b[i].mass*dot(mul(add(v0[i],b[i].v),.5),mul(a[i],h));}
}
const double w1=1/(2-std::pow(2,1.0/3)),w0=-std::pow(2,1.0/3)*w1;
void step(Bodies& b,double h,const Config& cfg,Cost& c){drift(b,w1*h/2);kick(b,w1*h,cfg,c);drift(b,(w0+w1)*h/2);kick(b,w0*h,cfg,c);drift(b,(w0+w1)*h/2);kick(b,w1*h,cfg,c);drift(b,w1*h/2);}
double timescale(const Bodies& b){double t=1e100;for(int p=0;p<6;p++){auto a=b[pi[p]],c=b[pj[p]];if(a.mass<=0||c.mass<=0)continue;double r=norm(sub(a.r,c.r)),v=norm(sub(a.v,c.v)),mu=G*(a.mass+c.mass);t=std::min(t,std::sqrt(r*r*r/mu));if(v>0)t=std::min(t,r/v);}return t;}
void reflect(Bodies& b,double time,const Config& cfg,Cost& cost,State* s){
 if(!cfg.reflect)return;
 for(int p=0;p<3;p++){int i=pi[p],j=pj[p];V r=sub(b[j].r,b[i].r),v=sub(b[j].v,b[i].v);double R=norm(r),vr=dot(r,v)/R,guard=cfg.reflectionMargin*(opt.radius[i]+opt.radius[j])*(opt.breathing?1.08:1);if(!(R<guard&&vr<0))continue;
  V dv=mul(r,-2*vr/R);double mass=b[i].mass+b[j].mass;V di=mul(dv,-b[j].mass/mass),dj=mul(dv,b[i].mass/mass);double oldWork=cost.work;cost.absoluteWork+=std::abs(apply(b[i],di,cost));cost.absoluteWork+=std::abs(apply(b[j],dj,cost));cost.impulse+=b[i].mass*norm(di)+b[j].mass*norm(dj);cost.peakVelocityJump=std::max({cost.peakVelocityJump,norm(di),norm(dj)});cost.projectionEvents++;cost.reflectionEvents++;
  if(s)s->events.push_back({{"kind","reflection"},{"year",time/.45},{"pair",{i,j}},{"distance",R},{"guard",guard},{"work",cost.work-oldWork}});
 }
}
void advance(Bodies& b,double& time,long long& steps,Cost& cost,const Config& cfg,State* s){
 double remaining=.0075;int used=0;
 while(remaining>1e-14){reflect(b,time,cfg,cost,s);double limit=std::min(cfg.dt,cfg.eta*timescale(b)),h=std::min(remaining,limit);if(!(limit>1e-10)||used++>=200000)throw std::runtime_error("minimum-step/step-budget");Bodies old=b;step(b,h,cfg,cost);time+=h;steps++;
  for(const auto& x:b)for(int k=0;k<3;k++)if(!std::isfinite(x.r[k])||!std::isfinite(x.v[k]))throw std::runtime_error("non-finite");
  if(s){
   for(int p=0;p<3;p++){int i=pi[p],j=pj[p];V r=sub(old[j].r,old[i].r),d=sub(sub(b[j].r,b[i].r),r);double den=dot(d,d),f=den>0?clamp(-dot(r,d)/den):0,D=norm(add(r,mul(d,f)));s->minSS=std::min(s->minSS,D);double ri=opt.radius[i]*(opt.breathing?1+.08*std::sin(time/.45/120+i*2):1),rj=opt.radius[j]*(opt.breathing?1+.08*std::sin(time/.45/120+j*2):1);if(D<=ri+rj){s->failure={{"kind","stellar-contact"},{"year",(time-h+f*h)/.45},{"pair",{i,j}},{"distance",D},{"radius",ri+rj}};return;}}
   if(cfg.barrier||cfg.cage){auto a=controlForce(b,cfg);double total=0,power=0;for(int i=0;i<4;i++)if(b[i].mass){double x=norm(a[i]);cost.peakAcceleration=std::max(cost.peakAcceleration,x);total+=x;power+=std::abs(b[i].mass*dot(b[i].v,a[i]));cost.accelerationSquaredIntegral+=h*x*x;cost.impulse+=h*b[i].mass*x;}cost.accelerationIntegral+=h*total;cost.absoluteWork+=h*power;if(total>0)cost.activeTime+=h;}
  }
  remaining=std::max(0.0,remaining-h);
 }
}
int capture(Bodies& b,const Config& cfg,double scale,Cost& c){
 if(!cfg.capture)return 0;int n=0;
 for(int i=0;i<3;i++){
  Body other=center(b,7^(1<<i));V r=sub(b[i].r,other.r),v=sub(b[i].v,other.v);double R=norm(r),vr=dot(r,v)/R,mu=G*(other.mass+b[i].mass),E=.5*dot(v,v)-mu/R,target=-mu/(cfg.apocenterScale*scale);
  if(!(vr>0&&R>cfg.captureRadiusScale*scale&&E>target+1e-14*mu/scale))continue;
  double vt2=std::max(0.0,dot(v,v)-vr*vr),available=std::max(0.0,2*(mu/R+target));V dv;
  if(available>=vt2)dv=mul(r,(std::sqrt(available-vt2)-vr)/R);else dv=mul(v,std::sqrt(available/dot(v,v))-1);
  double share=other.mass/(other.mass+b[i].mass),reaction=-b[i].mass/(other.mass+b[i].mass),oldWork=c.work;
  for(int j=0;j<3;j++){V d=mul(dv,j==i?share:reaction);c.absoluteWork+=std::abs(apply(b[j],d,c));c.impulse+=b[j].mass*norm(d);c.peakVelocityJump=std::max(c.peakVelocityJump,norm(d));}
  double removed=oldWork-c.work;
  if(cfg.redistribute&&removed>0){int j=(i+1)%3,k=(i+2)%3;V nr=unit(sub(b[j].r,b[k].r)),u=sub(b[j].v,b[k].v);double ur=dot(nr,u),reduced=b[j].mass*b[k].mass/(b[j].mass+b[k].mass),newUr=std::copysign(std::sqrt(ur*ur+2*removed/reduced),ur==0?1:ur);V change=mul(nr,newUr-ur);for(int q:{j,k}){V d=mul(change,q==j?b[k].mass/(b[j].mass+b[k].mass):-b[j].mass/(b[j].mass+b[k].mass));c.absoluteWork+=std::abs(apply(b[q],d,c));c.impulse+=b[q].mass*norm(d);c.peakVelocityJump=std::max(c.peakVelocityJump,norm(d));}}
  c.projectionEvents++;n++;
 }
 return n;
}
double largestEigen(double a[3][3]){for(int k=0;k<12;k++){int p=0,q=1;for(auto pair:{std::pair<int,int>{0,2},{1,2}})if(std::abs(a[pair.first][pair.second])>std::abs(a[p][q])){p=pair.first;q=pair.second;}if(std::abs(a[p][q])<1e-12)break;double angle=.5*std::atan2(2*a[p][q],a[q][q]-a[p][p]),c=std::cos(angle),s=std::sin(angle),pp=a[p][p],qq=a[q][q],pq=a[p][q];a[p][p]=c*c*pp-2*s*c*pq+s*s*qq;a[q][q]=s*s*pp+2*s*c*pq+c*c*qq;a[p][q]=a[q][p]=0;for(int i=0;i<3;i++)if(i!=p&&i!=q){double ip=a[i][p],iq=a[i][q];a[i][p]=a[p][i]=c*ip-s*iq;a[i][q]=a[q][i]=s*ip+c*iq;}}return std::max({a[0][0],a[1][1],a[2][2]});}
struct WorldResult{double stress=0;bool canSupport=false,safe=false,stable=false,damaged=false;};
WorldResult updateWorld(const Bodies& b,World& w,double year){
 const double dt=1.0/60;std::array<double,3> d{},force{},energy{};std::array<V,3> dir{};double tensor[3][3]={};double flux=0,climateFlux=0;
 for(int i=0;i<3;i++){V r=sub(b[i].r,b[3].r),v=sub(b[i].v,b[3].v);d[i]=std::max(norm(r),1e-6);dir[i]=mul(r,1/std::max(norm(r),1e-12));force[i]=G*b[i].mass/(d[i]*d[i]);energy[i]=dot(v,v)/2-G*(b[i].mass+b[3].mass)/d[i];double strength=b[i].mass/std::max(b[3].mass,1.0)*std::pow(std::max(opt.radius[3],1e-5)/d[i],3);for(int j=0;j<3;j++)for(int k=0;k<3;k++)tensor[j][k]+=strength*(3*dir[i][j]*dir[i][k]-(j==k?1:0));flux+=opt.lum[i]/(d[i]*d[i]);double au=std::max(d[i],.01)*1e12/opt.tempDist/1.496e11;climateFlux+=1361*opt.lum[i]/(au*au);}
 int main=0,second=1;if(force[1]>force[main]){main=1;second=0;}if(force[2]>force[main]){second=main;main=2;}else if(force[2]>force[second])second=2;
 double other=0;for(int i=0;i<3;i++)if(i!=main)other+=2*G*b[i].mass*d[main]/std::pow(d[i],3);double perturb=other/std::max(force[main],1e-12),dominance=force[main]/std::max(force[second],1e-12);bool candidate=energy[main]<0&&dominance>1.5&&perturb<.35;
 if(candidate&&w.candidate==main)w.stableTime+=dt;else{w.candidate=candidate?main:-1;w.stableTime=candidate?dt:0;}if(candidate){w.unstableTime=0;if(w.stableTime+1e-12>=opt.epochWindow){w.stable=true;w.primary=main;}}else{w.unstableTime+=dt;if(w.unstableTime>=.5){w.stable=false;w.primary=-1;}}if(w.stable&&main!=w.primary){w.stable=false;w.primary=-1;}
 double tide=std::max(0.0,largestEigen(tensor)),stress=tide/opt.hardness;if(!w.terminal){if(stress>1){w.integrity=clamp(w.integrity-dt*(stress-1)/6);w.recoveryTime=0;}else if(stress<.6){w.recoveryTime+=dt;if(w.recoveryTime>3)w.integrity=clamp(w.integrity+dt*.008*(1-stress));}else w.recoveryTime=0;}
 for(int i=0;i<3;i++){double ri=opt.radius[i]*(opt.breathing?1+.08*std::sin(year/120+i*2):1);if(!w.terminal&&d[i]<=ri+std::max(opt.radius[3],1e-5))w.terminal=1;}if(!w.terminal&&w.integrity<=0)w.terminal=2;
 if(w.hasFlux){double change=std::abs(flux-w.lastFlux)/std::max(w.lastFlux,.01)/dt;w.fluxChange+=(change-w.fluxChange)*(1-std::exp(-dt));}w.lastFlux=flux;w.hasFlux=true;
 double base=std::pow(climateFlux*.7/(4*5.67e-8),.25)-273.15,albedo=base<0?.3+.3*std::min(1.0,-base/20):.3,equilibrium=clamp(std::pow(climateFlux*(1-albedo)/(4*5.67e-8),.25)-273.15+10*std::sin(year),-270,1500);equilibrium=std::round(equilibrium*100)/100;
 if(!w.hasTemperature)w.temperature=equilibrium;else w.temperature+=(equilibrium-w.temperature)*(1-std::exp(-dt/opt.climateInertia));w.hasTemperature=true;
 return {stress,!w.terminal&&w.integrity>=.25&&stress<.8,!w.terminal&&w.integrity>=.25&&stress<.5&&(w.stable||w.fluxChange<.15),w.stable,w.integrity<.98};
}
const double levelYears[12]={0,200,800,1800,3500,6000,9000,12000,16000,21000,28000,40000},resilience[12]={1,1.08,1.18,1.35,1.55,1.8,2.1,2.5,3,3.6,4.6,6},climate[12]={0,1,2,3,5,8,11,15,20,27,35,45},storage[12]={0,5,10,20,30,45,60,80,105,135,165,200};
int levelFor(double years){int l=0;if(opt.levels)for(int i=0;i<12;i++)if(years>=levelYears[i])l=i;return l;}
void killCiv(State& s,std::string cause){auto& c=s.civ;if(c.alive){double life=std::max(0.0,std::floor(s.frame/60.0)-c.startYear);c.maxLife=std::max(c.maxLife,life);s.events.push_back({{"kind","civilization-death"},{"year",s.frame/60.0},{"cause",cause},{"number",c.number},{"lifespan",life},{"developmentYears",c.development}});c.alive=false;c.number++;c.deaths++;}c.phase=5;c.progress=0;c.safeTime=0;}
void updateCiv(State& s,WorldResult r){
 auto& c=s.civ;auto& w=s.world;double dt=1.0/60,year=s.frame/60.0;int l=levelFor(c.alive?c.development:0);double low=opt.low-climate[l],high=opt.high+climate[l],slo=opt.storageLow-storage[l],shi=opt.storageHigh+storage[l],temp=w.temperature;
 bool comfortable=temp>=low&&temp<=high,sleeping=c.phase==2||c.phase==3||c.phase==4,damaged=!r.canSupport,hazard=damaged||r.stress>=.5;
 double excess=std::max({low-temp,temp-high,0.0}),sexcess=std::max({slo-temp,temp-shi,0.0}),protection=opt.thermalGrace*resilience[l],loss=std::max(0.0,r.stress-1)*.006/resilience[l],exposure=sexcess>0?(.015+sexcess/2000)/protection:0;
 if(c.alive){if(w.terminal){c.population=0;c.storage=0;}else if(comfortable&&!hazard&&!sleeping){c.population=clamp(c.population+dt*.015);c.storage=clamp(c.storage+dt*.01);}else if(sleeping){c.storage=clamp(c.storage-dt*(exposure+loss));c.population=clamp(c.population-dt*(exposure*.15+loss*.5));}else c.population=clamp(c.population-dt*((comfortable?0:(.05+excess/300)/protection)+loss));}
 bool canGrow=comfortable&&!w.terminal&&!hazard&&(!c.alive||(c.population>.01&&c.storage>.01)),fatal=c.alive&&(c.population<=.01||c.storage<=.01);
 if(opt.levels&&c.alive&&c.phase==1&&canGrow&&r.safe)c.development+=dt*opt.developmentRate;
 c.level=levelFor(c.development)+1;bool suitable=canGrow&&r.safe;c.safeTime=suitable?c.safeTime+dt:0;
 if(w.terminal){if(c.phase!=5)killCiv(s,w.terminal==1?"engulfed":"disrupted");}
 else if(fatal)killCiv(s,loss>exposure?"persistent-tides":temp<slo?"cold-storage":temp>shi?"hot-storage":"reserves");
 else if(!c.alive){c.phase=c.phase==5?5:0;if(suitable&&c.safeTime>=opt.birthDelay){c.alive=true;c.startYear=std::floor(year);c.phase=1;c.progress=0;c.development=0;c.population=1;c.storage=1;c.births++;s.events.push_back({{"kind","civilization-birth"},{"year",year},{"number",c.number}});}}
 else if(c.phase==1){if(!comfortable||!r.safe){c.phase=2;c.progress=0;}}
 else if(c.phase==2){c.progress+=dt;if(c.progress>=1){c.phase=3;c.progress=0;}}
 else if(c.phase==3){if(suitable&&c.safeTime>=opt.wakeDelay){c.phase=4;c.progress=0;}}
 else if(c.phase==4){if(!suitable){c.phase=3;c.progress=0;}else{c.progress+=dt;if(c.progress>=.5)c.phase=1;}}
 if(c.alive)c.aliveFrames++;
 if(c.alive&&c.phase==1)c.activeFrames++;
}
void recordExternal(State& s,Inv before){auto after=invariant(s.b);double w=after.E-before.E;s.external.work+=w;s.external.absoluteWork+=std::abs(w);s.external.deltaP=add(s.external.deltaP,sub(after.P,before.P));s.external.deltaL=add(s.external.deltaL,sub(after.L,before.L));}
void removePlanet(State& s,std::string cause){if(!s.b[3].mass)return;auto before=invariant(s.b);s.b[3].mass=0;recordExternal(s,before);s.planetLosses++;if(s.firstPlanetLoss<0)s.firstPlanetLoss=s.frame/60.0;s.returnFrame=s.cfg.noRespawn?-1:s.frame+300;s.events.push_back({{"kind","planet-loss"},{"year",s.frame/60.0},{"cause",cause}});if(s.civ.alive)killCiv(s,cause);}
void regenerate(State& s){auto before=invariant(s.b);int host=(2+s.planetRespawns)%3;auto& h=s.b[host];auto& p=s.b[3];auto c=center(s.b,7);V L{};for(int i=0;i<3;i++)L=add(L,mul(cross(sub(s.b[i].r,c.r),sub(s.b[i].v,c.v)),s.b[i].mass));V normal=unit(L);double phase=s.planetRespawns*2.399963229728653;V raw{std::cos(phase),std::sin(phase),.37},radial=unit(sub(raw,mul(normal,dot(raw,normal)))),tangent=cross(normal,radial);double nearest=1e100;for(int i=0;i<3;i++)if(i!=host)nearest=std::min(nearest,norm(sub(h.r,s.b[i].r)));double r=std::max(.12*nearest,2.5*(opt.radius[host]+opt.radius[3])),speed=std::sqrt(G*(h.mass+opt.planetMass)/r);p.mass=opt.planetMass;p.r=add(h.r,mul(radial,r));p.v=sub(h.v,mul(tangent,speed));recordExternal(s,before);s.planetRespawns++;s.returnFrame=-1;s.world=World{};s.civ.phase=s.civ.alive?1:0;s.civ.development=0;s.civ.safeTime=0;s.civ.progress=0;s.events.push_back({{"kind","planet-respawn"},{"year",s.frame/60.0},{"host",host},{"radius",r}});}
void escapes(State& s){
 auto all=center(s.b,15);bool outside=false;for(auto b:s.b)if(b.mass&&norm(sub(b.r,all.r))>opt.escapeRadius)outside=true;
 for(int mask=7;mask<8;mask++){bool candidate=false;json event;auto a=center(s.b,mask),b=center(s.b,15^mask);if(outside&&a.mass>0&&b.mass>0){V r=sub(a.r,b.r),v=sub(a.v,b.v);double R=norm(r),ra=0,rb=0;for(int i=0;i<4;i++)if(s.b[i].mass){if(mask&(1<<i))ra=std::max(ra,norm(sub(s.b[i].r,a.r)));else rb=std::max(rb,norm(sub(s.b[i].r,b.r)));}double radial=dot(r,v)/R;if(R>4*(ra+rb)&&radial>0){double pot=0;for(int i=0;i<4;i++)if((mask&(1<<i))&&s.b[i].mass)for(int j=0;j<4;j++)if(!(mask&(1<<j))&&s.b[j].mass)pot-=s.b[i].mass*s.b[j].mass/norm(sub(s.b[i].r,s.b[j].r));double U=G*(a.mass+b.mass)/(a.mass*b.mass)*pot,E=.5*dot(v,v)+U;if(E>.1*std::abs(U)){candidate=true;event={{"kind","planet-escape"},{"year",s.frame/60.0},{"partition",mask},{"distance",R},{"radialSpeed",radial},{"specificEnergy",E}};}}}
  if(candidate){s.timers[mask]+=1.0/60;if(s.timers[mask]>=3){if(mask==7)removePlanet(s,"confirmed-escape");else if(s.failure.is_null())s.failure=event;}}else s.timers[mask]=0;
 }
 auto stellar=center(s.b,7);bool starOutside=false;for(int i=0;i<3;i++)if(norm(sub(s.b[i].r,stellar.r))>opt.escapeRadius)starOutside=true;
 for(int i=0;i<3;i++){bool candidate=false;json event;auto other=center(s.b,7^(1<<i));V r=sub(s.b[i].r,other.r),v=sub(s.b[i].v,other.v);double R=norm(r),radial=dot(r,v)/R,size=0;for(int j=0;j<3;j++)if(i!=j)size=std::max(size,norm(sub(s.b[j].r,other.r)));if(starOutside&&R>4*size&&radial>0){double U=0;for(int j=0;j<3;j++)if(i!=j)U-=G*(s.b[i].mass+other.mass)/other.mass*s.b[j].mass/norm(sub(s.b[i].r,s.b[j].r));double E=.5*dot(v,v)+U;if(E>.1*std::abs(U)){candidate=true;event={{"kind","stellar-separation"},{"year",s.frame/60.0},{"star",i},{"distance",R},{"radialSpeed",radial},{"specificEnergy",E}};}}if(candidate){s.timers[8+i]+=1.0/60;if(s.timers[8+i]>=3&&s.failure.is_null())s.failure=event;}else s.timers[8+i]=0;}
 bool triple=starOutside;double EK=0,U=0;for(int i=0;i<3;i++)EK+=.5*s.b[i].mass*dot(sub(s.b[i].v,stellar.v),sub(s.b[i].v,stellar.v));for(int p=0;p<3;p++){auto a=s.b[pi[p]],b=s.b[pj[p]];V r=sub(a.r,b.r),v=sub(a.v,b.v);double R=norm(r),ep=.5*dot(v,v)-G*(a.mass+b.mass)/R;U-=G*a.mass*b.mass/R;if(!(ep>0&&dot(r,v)>0))triple=false;}triple=triple&&EK+U>.1*std::abs(U);if(triple){s.timers[11]+=1.0/60;if(s.timers[11]>=3&&s.failure.is_null())s.failure={{"kind","triple-disintegration"},{"year",s.frame/60.0},{"energy",EK+U}};}else s.timers[11]=0;
}
void shadowUpdate(State& s){
 if(!s.cfg.shadow)return;
 Cost dummy;long long steps=0;advance(s.shadow,s.shadowTime,steps,dummy,s.cfg,nullptr);capture(s.shadow,s.cfg,s.scale,dummy);
 // Shared planet lifecycle is exogenous here: measures stellar sensitivity with
 // the primary trajectory's regeneration forcing. Report this conditional scope.
 if((s.shadow[3].mass>0)!=(s.b[3].mass>0))s.shadow[3]=s.b[3];
 if(s.frame%600==0){double vscale=std::sqrt(G*15e6/s.scale),sum=0;V drcm{},dvcm{};for(int i=0;i<3;i++){drcm=add(drcm,sub(s.shadow[i].r,s.b[i].r));dvcm=add(dvcm,sub(s.shadow[i].v,s.b[i].v));}drcm=mul(drcm,1.0/3);dvcm=mul(dvcm,1.0/3);for(int i=0;i<3;i++){V dr=sub(sub(s.shadow[i].r,s.b[i].r),drcm),dv=sub(sub(s.shadow[i].v,s.b[i].v),dvcm);sum+=dot(dr,dr)/(s.scale*s.scale)+dot(dv,dv)/(vscale*vscale);}double D=std::sqrt(sum),eps=1e-8;if(D>0&&std::isfinite(D)){double lg=std::log(D/eps);if(s.frame>600000){s.lyapSum+=lg;s.lyapYears+=10;s.lyapWindows++;}double ratio=eps/D;for(int i=0;i<3;i++){s.shadow[i].r=add(s.b[i].r,mul(sub(sub(s.shadow[i].r,s.b[i].r),drcm),ratio));s.shadow[i].v=add(s.b[i].v,mul(sub(sub(s.shadow[i].v,s.b[i].v),dvcm),ratio));}}else{throw std::runtime_error("shadow-collapse/non-finite");}s.shadow[3]=s.b[3];}
}
volatile std::sig_atomic_t stopRequested=0;
void stopHandler(int){stopRequested=1;}
void save(const State& s,const std::string& cp){if(cp.empty())return;std::string tmp=cp+".tmp";std::ofstream out(tmp);out<<json(s).dump()<<'\n';out.close();if(std::rename(tmp.c_str(),cp.c_str()))throw std::runtime_error("checkpoint-rename");}
json snapshot(const State& s){return {{"frame",s.frame},{"bodies",s.b},{"world",s.world},{"civilization",s.civ},{"cost",s.cost},{"stellarFailure",s.failure}};}
int main(int argc,char** argv){
 if(argc<2){std::cerr<<"usage: native INPUT.json [CHECKPOINT.json] [TRACE.jsonl]\n";return 2;}
 auto started=std::chrono::steady_clock::now();std::signal(SIGTERM,stopHandler);std::signal(SIGINT,stopHandler);
 try{
  json input;std::ifstream(argv[1])>>input;std::string cp=argc>2?argv[2]:"",tracePath=argc>3?argv[3]:"";State s;long long total=std::llround(input.at("horizon").get<double>()*60);auto settings=input.at("settings");
  const char* rk[4]={"_13","_21","_3","newproperty20"};const char* lk[3]={"_111lum_sun","_211lum_sun","_311lum_sun"};for(int i=0;i<4;i++)opt.radius[i]=settings.at(rk[i]);for(int i=0;i<3;i++)opt.lum[i]=settings.at(lk[i]);
  opt.escapeRadius=settings.at("newproperty13");opt.planetMass=settings.at("newproperty8");opt.tempDist=settings.at("newproperty69");opt.climateInertia=settings.at("climateInertia");opt.epochWindow=settings.at("epochWindow");opt.hardness=settings.at("planetStrength");opt.breathing=settings.at("stellarBreathing");opt.low=settings.at("newproperty45");opt.high=settings.at("newproperty46");opt.storageLow=settings.at("newproperty43");opt.storageHigh=settings.at("newproperty44");opt.thermalGrace=settings.at("thermalGrace");opt.birthDelay=settings.at("birthDelay");opt.wakeDelay=settings.at("wakeDelay");opt.levels=settings.at("civilizationLevels");opt.developmentRate=settings.at("developmentRate");opt.cageM=settings.at("mc");opt.cageK1=settings.at("k1");opt.cageK2=settings.at("k2");opt.cageRc=settings.at("rc");opt.cageRe=settings.at("re");opt.cageLimit=settings.at("newproperty67");opt.cageN=settings.at("expc");
  if(!cp.empty()&&std::ifstream(cp).good()){std::ifstream(cp)>>input["saved"];s=input["saved"].get<State>();if(s.sourceHash!=input.at("sourceHash")||s.configHash!=input.at("configHash"))throw std::runtime_error("checkpoint source/config mismatch");}
  else{s.seed=input.at("seed");s.profile=input.at("profile");s.sourceHash=input.at("sourceHash");s.configHash=input.at("configHash");s.cfg=input.at("controller").get<Config>();s.b=input.at("bodies").get<Bodies>();s.initial=s.b;s.initialE=invariant(s.b).E;for(int p=0;p<3;p++)s.scale+=norm(sub(s.b[pi[p]].r,s.b[pj[p]].r))/3;s.shadow=s.b;if(s.cfg.shadow){double d=1e-8*s.scale/std::sqrt(2.0);s.shadow[0].r[0]+=d;s.shadow[1].r[0]-=d;}}
  std::ofstream trace;if(!tracePath.empty())trace.open(tracePath,std::ios::app);
  while(s.frame<total&&s.failure.is_null()&&s.error.is_null()&&!stopRequested){
   double oldActiveTime=s.cost.activeTime;long long oldProjections=s.cost.projectionEvents;
   try{advance(s.b,s.time,s.steps,s.cost,s.cfg,&s);}catch(const std::exception& e){s.error={{"kind","numerical-error"},{"message",e.what()},{"year",s.time/.45}};break;}if(!s.failure.is_null())break;
   s.frame++;double year=s.frame/60.0;int n=capture(s.b,s.cfg,s.scale,s.cost);if(n)s.events.push_back({{"kind","capture"},{"year",year},{"count",n},{"redistribute",s.cfg.redistribute}});if(s.cost.projectionEvents>oldProjections)s.cost.projectionFrames++;if(s.cost.projectionEvents>oldProjections||s.cost.activeTime>oldActiveTime)s.cost.activeFrames++;
   escapes(s);if(s.returnFrame>=0&&s.frame>=s.returnFrame)regenerate(s);
   if(s.b[3].mass){auto r=updateWorld(s.b,s.world,year);updateCiv(s,r);if(s.world.terminal)removePlanet(s,s.world.terminal==1?"engulfed":"disrupted");if(s.b[3].mass&&r.stable){s.stableFrames++;if(s.frame>600000)s.matureStableFrames++;}}
   else s.absentFrames++;
   double d[3];for(int p=0;p<3;p++)d[p]=norm(sub(s.b[pi[p]].r,s.b[pj[p]].r));int pair=std::min_element(d,d+3)-d;double shape=*std::max_element(d,d+3)/d[pair];if(pair!=s.lastPair){if(s.lastPair>=0)s.changes++;s.lastPair=pair;}if(shape<3)s.nonhierFrames++;if(shape>5){s.hierarchyRun++;s.longestHierarchy=std::max(s.longestHierarchy,s.hierarchyRun);}else s.hierarchyRun=0;
   if(s.frame%60==0){double residual=(invariant(s.b).E-s.initialE-s.cost.work-s.external.work)/std::max(std::abs(s.initialE),1e-20);s.maxResidual=std::max(s.maxResidual,std::abs(residual));}
   try{shadowUpdate(s);}catch(const std::exception& e){s.error={{"kind","shadow-numerical-error"},{"message",e.what()},{"year",year}};break;}
   if(trace.is_open())trace<<snapshot(s).dump()<<'\n';
   if(s.frame%6000==0)s.history.push_back({{"year",year},{"distances",{d[0],d[1],d[2]}},{"energy",invariant(s.b).E},{"costWork",s.cost.work},{"planetLosses",s.planetLosses},{"stableFraction",s.stableFrames/double(s.frame)},{"nonhierFraction",s.nonhierFrames/double(s.frame)}});
   if(s.frame%60000==0){s.bins.push_back({{"year",year},{"stableFrames",s.stableFrames},{"matureStableFrames",s.matureStableFrames},{"nonhierFrames",s.nonhierFrames},{"closestPairChanges",s.changes},{"planetLosses",s.planetLosses},{"absentFrames",s.absentFrames},{"control",s.cost},{"lyapSum",s.lyapSum},{"lyapYears",s.lyapYears}});save(s,cp);}
  }
  s.wallSeconds+=std::chrono::duration<double>(std::chrono::steady_clock::now()-started).count();if(stopRequested){save(s,cp);return 75;}
  bool complete=s.frame==total&&s.failure.is_null()&&s.error.is_null();json result={{"seed",s.seed},{"profile",s.profile},{"sourceHash",s.sourceHash},{"configHash",s.configHash},{"horizon",total/60.0},{"integratedYears",s.time/.45},{"stellarIntact",complete},{"starFailure",s.failure},{"numericallyCensored",!s.error.is_null()},{"error",s.error},{"firstPlanetLoss",s.firstPlanetLoss<0?json(nullptr):json(s.firstPlanetLoss)},{"originalPlanetSurvived",complete&&s.planetLosses==0},{"planetLosses",s.planetLosses},{"planetRespawns",s.planetRespawns},{"absentFraction",s.absentFrames/double(total)},{"stableFraction",s.stableFrames/double(total)},{"matureStableFraction",total>600000?json(s.matureStableFrames/double(total-600000)):json(nullptr)},{"civilizationBirths",s.civ.births},{"civilizationDeaths",s.civ.deaths},{"civilizationAliveFraction",s.civ.aliveFrames/double(total)},{"civilizationActiveFraction",s.civ.activeFrames/double(total)},{"longestCivilizationYears",s.civ.maxLife},{"nonhierFraction",s.nonhierFrames/double(total)},{"longestHierarchyYears",s.longestHierarchy/60.0},{"closestPairChanges",s.changes},{"minSS",s.minSS},{"control",s.cost},{"planetExternal",s.external},{"maxNumericalEnergyResidual",s.maxResidual},{"steps",s.steps},{"initialBodies",s.initial},{"finalBodies",s.b},{"initialScale",s.scale},{"initialCrossingYears",std::sqrt(s.scale*s.scale*s.scale/(G*15e6))/.45},{"bins",s.bins},{"events",s.events},{"history",s.history},{"wallSeconds",s.wallSeconds},{"matureConditionalFTLE",s.lyapYears>0?json(s.lyapSum/s.lyapYears):json(nullptr)},{"lyapunovWindows",s.lyapWindows},{"lyapunovScope","stellar shadow conditioned on primary planet lifecycle; 10-year renormalization, dimensionless eps1e-8"}};
  struct rusage usage{};getrusage(RUSAGE_SELF,&usage);result["maxRSSKiB"]=usage.ru_maxrss;result["initialEnergy"]=s.initialE;result["controlActiveFrameFraction"]=s.cost.activeFrames/double(total);result["controlMeanAcceleration"]=s.time>0?s.cost.accelerationIntegral/(s.time*3):0;result["controlRMSAcceleration"]=s.time>0?std::sqrt(s.cost.accelerationSquaredIntegral/(s.time*3)):0;
  std::cout<<result.dump()<<'\n';return 0;
 }catch(const std::exception& e){std::cerr<<e.what()<<'\n';return 2;}
}

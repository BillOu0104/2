const clamp=(x,low=0,high=1)=>Math.max(low,Math.min(high,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const usable=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z)&&p.z>=-1&&p.z<=1;

// Bounded physical history, independent of frame rate and the visible trail budget.
export class TrailHistory {
  constructor(capacity=4096){this.capacity=capacity;this.buffer=Array.from({length:capacity},()=>({x:0,y:0,z:0,time:0}));this.clear();}
  clear(){this.length=0;this.cursor=0;this.budget=null;}
  get(age=0){return age<this.length?this.buffer[(this.cursor-1-age+this.capacity)%this.capacity]:null;}
  push(position,time){
    if(![position.x,position.y,position.z,time].every(Number.isFinite))return;
    const last=this.get();if(last&&time<=last.time)return;
    Object.assign(this.buffer[this.cursor],{x:position.x,y:position.y,z:position.z,time});
    this.cursor=(this.cursor+1)%this.capacity;this.length=Math.min(this.capacity,this.length+1);
  }
}

// Frequent turns and repeated visits to the same screen cells indicate clutter.
// Ignore subpixel motion; a stationary body must not count as a tangled trajectory.
export function trailComplexity(histories,project,now){
  const cells=new Map();let anchors=0,revisits=0,turning=0;
  for(const history of histories){
    let previous=null,direction=null,turn=0,lastCell=null;
    for(let age=0;age<history.length;age++){
      const p=history.get(age);if(now-p.time>8)break;
      const screen=project(p);if(!usable(screen))continue;
      if(previous&&distance(screen,previous)<4)continue;
      if(previous){
        const dx=screen.x-previous.x,dy=screen.y-previous.y,n=Math.hypot(dx,dy),next=[dx/n,dy/n];
        if(direction)turn+=Math.acos(clamp(next[0]*direction[0]+next[1]*direction[1],-1,1));
        direction=next;
      }
      const cell=`${Math.floor(screen.x/28)},${Math.floor(screen.y/28)}`;
      if(cell!==lastCell){if(cells.has(cell))revisits++;cells.set(cell,true);anchors++;lastCell=cell;}
      previous=screen;
    }
    turning=Math.max(turning,clamp((turn-4)/16));
  }
  const crowding=anchors>16?clamp((revisits/anchors-.15)/.55):0;
  return Math.max(turning,crowding);
}

// Keep a consistent visible arc, looking further into history when motion is slow.
export function selectTrail(history,project,{now,viewport=720,baseLength=400,complexity=0,dt=1/30,maxPoints=2000,maxAge=120}={}){
  const target=viewport*1.1*clamp(baseLength/400,.05,3)/(1+4.5*clamp(complexity));
  history.budget=history.budget===null?target:history.budget+(target-history.budget)*(1-Math.exp(-Math.max(0,dt)/.7));
  const selected=[],head=history.get();let previous=null,previousPoint=null,arc=0;
  if(!head)return{points:[],fractions:[],arcPixels:0,seconds:0,budget:history.budget};
  for(let age=0;age<history.length;age++){
    const point=history.get(age);if(now-point.time>maxAge)break;
    const screen=project(point);if(!usable(screen))break;
    if(!previous){selected.push(point);previous=screen;previousPoint=point;continue;}
    const step=distance(screen,previous);if(step<1.25)continue;
    const remaining=history.budget-arc;
    if(step>remaining){
      const t=remaining/step;
      selected.push({x:previousPoint.x+(point.x-previousPoint.x)*t,y:previousPoint.y+(point.y-previousPoint.y)*t,z:previousPoint.z+(point.z-previousPoint.z)*t,time:previousPoint.time+(point.time-previousPoint.time)*t});
      arc=history.budget;break;
    }
    arc+=step;selected.push(point);previous=screen;previousPoint=point;
  }
  // One fixed GPU capacity, even for long-running, very slow orbits.
  const points=[];
  if(selected.length>maxPoints){for(let i=0;i<maxPoints;i++)points.push(selected[Math.round(i*(selected.length-1)/(maxPoints-1))]);}
  else points.push(...selected);
  points.reverse();
  let total=0;const fractions=[0];
  for(let i=1;i<points.length;i++){total+=distance(project(points[i-1]),project(points[i]));fractions.push(total);}
  if(total)for(let i=0;i<fractions.length;i++)fractions[i]/=total;
  return{points,fractions,arcPixels:total,seconds:points.length?head.time-points[0].time:0,budget:history.budget};
}

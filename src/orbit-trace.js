const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const deviation=(b,a,c)=>{
  const t=c.time>a.time?(b.time-a.time)/(c.time-a.time):0;
  return Math.hypot(b.x-a.x-(c.x-a.x)*t,b.y-a.y-(c.y-a.y)*t,b.z-a.z-(c.z-a.z)*t);
};
// Samples accepted physical steps, not worker delivery frames. Only copies positions.
export class OrbitTrace{
  constructor(){this.reset();}
  reset(){this.paths=Array.from({length:4},()=>({anchor:null,pending:null,raw:[],truncated:false}));}
  resetBody(i){this.paths[i]={anchor:null,pending:null,raw:[],truncated:false};}
  observe(bodies,time){
    bodies.forEach((body,i)=>{
      if(body.mass!==undefined&&body.mass<=0)return;
      const p={x:body.x,y:body.y,z:body.z,time},path=this.paths[i];
      if(![p.x,p.y,p.z,time].every(Number.isFinite))return;
      const last=path.raw.at(-1)||path.anchor;
      if(last&&time<=last.time)return;
      if(!last||distance(p,last)>.00025||time-last.time>.15)path.raw.push(p);
      path.pending=p;
      if(path.raw.length>4096){path.raw.splice(0,2048);path.truncated=true;}
    });
  }
  drain(){return this.paths.map(path=>{
    if(!path.pending)return [];
    const points=path.truncated?[...path.raw]:[...(path.anchor?[path.anchor]:[]),...path.raw];
    if(points.at(-1)?.time!==path.pending.time)points.push(path.pending);
    const keep=new Set([0,points.length-1]),stack=[[0,points.length-1]];
    while(stack.length){const [a,b]=stack.pop();let error=.0005,index=-1;for(let i=a+1;i<b;i++){const e=deviation(points[i],points[a],points[b]);if(e>error){error=e;index=i;}}if(index>=0){keep.add(index);stack.push([a,index],[index,b]);}}
    let reduced=[...keep].sort((a,b)=>a-b).map(i=>points[i]).filter(Boolean);
    if(reduced.length>512){reduced=reduced.slice(-512);path.truncated=true;}
    if(path.truncated&&reduced.length)reduced[0]={...reduced[0],break:true};
    path.anchor=path.pending;path.pending=null;path.raw=[];path.truncated=false;return reduced;
  });}
}

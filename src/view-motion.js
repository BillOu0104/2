const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class ViewMotion {
  constructor(){this.x=0;this.y=0;this.vx=0;this.vy=0;this.maxSpeed=.55;this.acceleration=4;}
  limit(){const speed=Math.hypot(this.vx,this.vy);if(speed>this.maxSpeed){this.vx*=this.maxSpeed/speed;this.vy*=this.maxSpeed/speed;}}
  drag(dx,dy,sensitivityX=1,sensitivityY=1){this.vy+=dx*sensitivityY*40;this.vx+=dy*sensitivityX*20;this.limit();}
  coast(dt,friction=1.8){
    if(dt<=0)return;const decay=Math.exp(-friction*dt),step=friction>1e-6?(1-decay)/friction:dt;
    this.x+=this.vx*step;this.y+=this.vy*step;this.vx*=decay;this.vy*=decay;this.bound();
  }
  follow(x,y,dt,response=1){
    if(dt<=0)return;
    let dx=(x-this.x)*8*response,dy=(y-this.y)*8*response;const speed=Math.hypot(dx,dy);
    if(speed>this.maxSpeed){dx*=this.maxSpeed/speed;dy*=this.maxSpeed/speed;}
    const vx=dx-this.vx,vy=dy-this.vy,change=Math.hypot(vx,vy),step=Math.min(1,this.acceleration*dt/Math.max(change,1e-12));
    this.vx+=vx*step;this.vy+=vy*step;this.limit();this.x+=this.vx*dt;this.y+=this.vy*dt;this.bound();
  }
  bound(){const next=clamp(this.x,-Math.PI/6,Math.PI/6);if(next!==this.x)this.vx=0;this.x=next;}
}

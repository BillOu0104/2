const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export class ViewMotion {
  constructor(){this.x=0;this.y=0;this.vx=0;this.vy=0;this.acceleration=.75;}
  drag(dx,dy,sensitivityX=1,sensitivityY=1){this.vy+=dx*sensitivityY*4;this.vx+=dy*sensitivityX*2.25;}
  coast(dt,friction=1.8){
    if(dt<=0)return;const decay=Math.exp(-friction*dt),step=friction>1e-6?(1-decay)/friction:dt;
    this.x+=this.vx*step;this.y+=this.vy*step;this.vx*=decay;this.vy*=decay;this.bound();
  }
  follow(x,y,dt,response=1){
    if(dt<=0)return;
    const ax=clamp((x-this.x)*12*response-this.vx*7,-this.acceleration,this.acceleration),ay=clamp((y-this.y)*12*response-this.vy*7,-this.acceleration,this.acceleration);
    this.vx+=ax*dt;this.vy+=ay*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.bound();
  }
  returnToOrigin(dt,speed=.006){
    if(dt<=0||speed<=0)return;
    this.vx=0;this.vy=0;
    this.y=Math.atan2(Math.sin(this.y),Math.cos(this.y));
    const distance=Math.hypot(this.x,this.y),step=speed*Math.PI/180*dt;
    if(distance<=step){this.x=0;this.y=0;return;}
    const factor=1-step/distance;this.x*=factor;this.y*=factor;
  }
  bound(){const next=clamp(this.x,-Math.PI/6,Math.PI/6);if(next!==this.x)this.vx=0;this.x=next;}
}

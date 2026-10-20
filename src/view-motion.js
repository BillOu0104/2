const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function idleSway(time,speed=.08,amplitude=6){return amplitude?amplitude*Math.PI/180*Math.sin(time*speed/amplitude):0;}
export class ViewMotion {
  constructor(){this.x=0;this.y=0;this.vx=0;this.vy=0;this.acceleration=3;}
  drag(dx,dy,sensitivityX=1,sensitivityY=1){this.vy+=dx*sensitivityY*32;this.vx+=dy*sensitivityX*18;}
  coast(dt,friction=1.8){
    if(dt<=0)return;const decay=Math.exp(-friction*dt),step=friction>1e-6?(1-decay)/friction:dt;
    this.x+=this.vx*step;this.y+=this.vy*step;this.vx*=decay;this.vy*=decay;this.bound();
  }
  follow(x,y,dt,response=1){
    if(dt<=0)return;
    const ax=clamp((x-this.x)*12*response-this.vx*7,-this.acceleration,this.acceleration),ay=clamp((y-this.y)*12*response-this.vy*7,-this.acceleration,this.acceleration);
    this.vx+=ax*dt;this.vy+=ay*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.bound();
  }
  bound(){const next=clamp(this.x,-Math.PI/6,Math.PI/6);if(next!==this.x)this.vx=0;this.x=next;}
}

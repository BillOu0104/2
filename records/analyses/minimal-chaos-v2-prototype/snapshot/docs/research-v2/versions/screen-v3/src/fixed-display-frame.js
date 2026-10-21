// A fixed inertial observation frame for each initialization. Never follows bodies.
export class FixedDisplayFrame{
  reset(initialBodies=[]){
    const valid=initialBodies.filter(b=>b.mass>0&&['x','y','z'].every(k=>Number.isFinite(b[k]))),mass=valid.reduce((n,b)=>n+b.mass,0);
    this.origin=Object.fromEntries(['x','y','z'].map(k=>[k,mass?valid.reduce((n,b)=>n+b.mass*b[k],0)/mass:0]));
    return this.origin;
  }
  constructor(){this.reset();}
  position(body,scale=1){return Object.fromEntries(['x','y','z'].map(k=>[k,(body[k]-this.origin[k])/scale]));}
}

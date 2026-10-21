// Visual tracking only. Never write back into simulation coordinates or velocities.
export function displayCenter(bodies,fallback={x:0,y:0,z:0}){
 const stars=bodies.slice(0,3).filter(b=>b.mass>0&&['x','y','z'].every(k=>Number.isFinite(b[k])));
 if(!stars.length)return {...fallback};
 let tracked=stars;
 if(stars.length===3){
  const pairs=[[0,1],[0,2],[1,2]].map(pair=>({pair,distance:Math.hypot(...['x','y','z'].map(k=>stars[pair[0]][k]-stars[pair[1]][k]))})).sort((a,b)=>a.distance-b.distance);
  // A distant runaway must not drag a compact surviving stellar pair off screen.
  if(pairs[2].distance>4*Math.max(pairs[0].distance,1e-12))tracked=pairs[0].pair.map(i=>stars[i]);
 }
 const mass=tracked.reduce((n,b)=>n+b.mass,0);
 return Object.fromEntries(['x','y','z'].map(k=>[k,tracked.reduce((n,b)=>n+b.mass*b[k],0)/mass]));
}

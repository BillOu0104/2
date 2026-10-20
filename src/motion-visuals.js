export function fadeMotion(current,active,dt){
  const target=active?1:0,tau=active ? .18 : .55;return current+(target-current)*(1-Math.exp(-Math.max(0,dt)/tau));
}

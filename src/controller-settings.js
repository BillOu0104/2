// Controller selection changes physics; playback only changes accepted ticks per wall second.
export const legacyPhysicsKeys=['gravityModel','physicsMode','civilizationMode','newproperty53','encounterAccuracy','timespeed','newproperty26','newproperty60'];
export const legacyPhysicsDefaults={gravityModel:'newtonian',physicsMode:'reference',civilizationMode:'balanced',newproperty53:.75,encounterAccuracy:.0075,timespeed:1,newproperty26:10,newproperty60:false};
export function legacyPhysics(settings){return Object.fromEntries(legacyPhysicsKeys.map(k=>[k,settings[k]??legacyPhysicsDefaults[k]]));}
export function controllerPatch(current,patch){
  if(!patch.stabilityMode||patch.stabilityMode===current.stabilityMode)return patch;
  if(patch.stabilityMode==='off')return {...(current.legacyPhysics??legacyPhysicsDefaults),...patch};
  return {...patch,legacyPhysics:current.stabilityMode==='off'?legacyPhysics(current):current.legacyPhysics,newproperty60:patch.newproperty60??true};
}

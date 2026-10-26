import {normalizeSettings} from './settings.js';
// Loading an old archive is an explicit replay request, unlike upgrading startup defaults.
export function replaySettings(source={}){
 const legacy=!source.physicsRevision&&!source.gravityModel;
 const replay={...source,stabilityMode:source.stabilityMode??'off'};
 return normalizeSettings(legacy?{...replay,gravityModel:'legacy',orbitalInitialization:source.orbitalInitialization??'original',newproperty60:source.newproperty60??true}:replay);
}

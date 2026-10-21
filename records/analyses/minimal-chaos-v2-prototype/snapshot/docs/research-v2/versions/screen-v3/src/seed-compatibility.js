import {normalizeSettings} from './settings.js';
// Loading an old archive is an explicit replay request, unlike upgrading startup defaults.
export function replaySettings(source={}){
 const legacy=!source.physicsRevision&&!source.gravityModel;
 return normalizeSettings(legacy?{...source,gravityModel:'legacy',orbitalInitialization:source.orbitalInitialization??'original',newproperty60:source.newproperty60??true}:source);
}

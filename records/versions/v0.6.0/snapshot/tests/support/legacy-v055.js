// Existing v0.1–v0.5.5 contracts are exercised through the explicit fallback.
// Production V2 defaults/migration are tested directly in production-v2.test.js.
import {Simulation as ProductionSimulation} from '../../src/simulation.js';
import {normalizeSettings as normalize,migrateSettings as migrate,settingsFromInitial as fromInitial} from '../../src/settings.js';
export * from '../../src/settings.js';
export class Simulation extends ProductionSimulation{constructor(settings={},...args){super({stabilityMode:'off',...settings},...args);}}
export const normalizeSettings=(source={},...args)=>normalize({stabilityMode:'off',...source},...args);
export const migrateSettings=(source={},...args)=>migrate({stabilityMode:'off',...source},...args);
export const settingsFromInitial=(settings,bodies)=>fromInitial({stabilityMode:'off',...settings},bodies);

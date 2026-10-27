import test from 'node:test';
import assert from 'node:assert/strict';
import {propertySchema} from '../src/original-data.js';
import {settingsDefinitions} from '../src/settings-catalog.js';
import {settingEntries,settingUnavailableReason} from '../src/settings-layout.js';
import {normalizeSettings} from '../src/settings.js';

test('the reorganized form preserves every original, extension and layout setting exactly once',()=>{
 const expected=[...Object.entries(propertySchema).filter(([,d])=>d.type&&d.type!=='group').map(([k])=>k),...Object.keys(settingsDefinitions),...['left','right','clock','logs','years'].flatMap(id=>['x','y'].map(a=>`layout.${id}.${a}`))].sort();
 const entries=settingEntries();assert.deepEqual(entries.map(c=>c.key).sort(),expected);assert.equal(new Set(entries.map(c=>c.key)).size,220);
 for(const entry of entries){assert.ok(entry.label?.trim());assert.ok(entry.description?.trim());assert.ok(entry.def?.type);assert.ok(!/[<>]/.test(entry.label));}
});
test('inactive manual inputs and fixed V2 physics explain availability without changing stored values',()=>{
 const settings=normalizeSettings({viewSensitivity:.0875,x11:.12345,newproperty50:false});const original=structuredClone(settings);
 assert.match(settingUnavailableReason('x11',settings),/自定义初值/);assert.match(settingUnavailableReason('newproperty53',settings),/V2/);assert.equal(settingUnavailableReason('viewSensitivity',settings),'');assert.deepEqual(settings,original);
 assert.equal(settingUnavailableReason('x11',{...settings,newproperty50:true}),'');assert.equal(settingUnavailableReason('newproperty53',{...settings,stabilityMode:'off'}),'');
});

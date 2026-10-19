import physicsFactory from './legacy/008.js';
import timeFactory from './legacy/010.js';
import civilizationFactory from './legacy/042.js';
import eraFactory from './legacy/072.js';
import temperatureFactory from './legacy/079.js';
import loadingFactory from './legacy/156.js';
import { moduleBindings } from './original-data.js';
import { normalizeSettings, seededRandom, algorithmId } from './settings.js';
import { Habitability } from './habitability.js';

class Vec3 { constructor(x = 0, y = x, z = x) { this.x = x; this.y = y; this.z = z; } }
const plain = v => v && typeof v === 'object' ? structuredClone(v) : v;

// Backend independent of DOM, WebGL and transport. The Worker and Node use the same class.
export class Simulation {
  constructor(settings = {}) {
    this.settings = normalizeSettings(settings);
    this.shared = { gjz: 0, rst: 0, cfw: 0, c_down: false, text: '' };
    this.engine = { runtime: 0, frametime: 1 / 60, screenResolution: new Vec3(1920, 1080, 0) };
    this.input = { cursorScreenPosition: new Vec3(960, 540, 0) };
    this.generation = 1; this.tickCount = 0; this.revision = 0; this.events = []; this.eventSeq = 0;
    this.habitability = new Habitability();
    this.setRandom();
    this.modules = {};
    for (const [id, factory] of Object.entries({ '008': physicsFactory, '010': timeFactory, '042': civilizationFactory, '072': eraFactory, '079': temperatureFactory, '156': loadingFactory })) this.modules[id] = this.createModule(id, factory);
    this.modules['008'].init();
  }
  setRandom() { this.random = seededRandom(`${this.settings.seed}:${this.generation}`); }
  resolve(binding) {
    const v = binding && typeof binding === 'object' && 'user' in binding ? this.settings[binding.user] ?? binding.value : binding;
    return typeof v === 'string' && /^-?[\d.]+\s+-?[\d.]+\s+-?[\d.]+$/.test(v) ? new Vec3(...v.split(/\s+/).map(Number)) : v;
  }
  createModule(id, factory) {
    const self = this;
    const overrides = Object.fromEntries(Object.entries(moduleBindings[id] || {}).map(([k, v]) => [k, this.resolve(v)]));
    if (id === '008') { overrides.trailLength = this.settings.trailsLength; overrides.trailen = false; overrides.rxz = false; }
    const builder = {};
    for (const method of ['addCheckbox', 'addSlider', 'addColor', 'addCombo', 'addText']) builder[method] = function(d) { this.values[d.name] = d.value; return this; };
    builder.values = {};
    builder.finish = function() { return Object.assign(this.values, overrides); };
    const math = Object.create(Math); math.random = () => self.random();
    return factory({ shared: this.shared, engine: this.engine, input: this.input, thisScene: { createLayer: data => data }, Vec3, Math: math, createScriptProperties: () => builder, getHabitability: () => self.settings.civilizationMode === 'balanced' ? self.habitability.result : null, onInitialize: bodies => { self.initialBodies = plain(bodies); self.habitability.reset(); } });
  }
  configure(patch) {
    const next = normalizeSettings({ ...this.settings, ...patch });
    const changed = Object.keys(next).filter(k => next[k] !== this.settings[k]);
    this.settings = next;
    if (changed.includes('civilizationMode')) { this.habitability.reset(); this.shared.suitablePeriodCount = 0; }
    const resetKeys = new Set(['seed', 'physicsMode', 'newproperty53']);
    const mapped = {};
    for (const [id, module] of Object.entries(this.modules)) {
      const changes = {};
      for (const [key, binding] of Object.entries(moduleBindings[id] || {})) {
        if (binding?.user && changed.includes(binding.user)) { module.scriptProperties[key] = this.resolve(binding); changes[key] = true; }
      }
      if (id === '008') Object.assign(mapped, changes);
    }
    // Render trails are sampled from physical coordinates; no WE layer allocation in the backend.
    this.modules['008'].scriptProperties.trailen = false;
    for (const key of ['trailen', 'trailLength', 'trailStartSize', 'trailEndSize', 'color1', 'color2', 'color3', 'color4']) delete mapped[key];
    if (changed.some(k => resetKeys.has(k))) {
      this.modules['008'] = this.createModule('008', physicsFactory); this.modules['008'].init(); this.revision++;
      if (changed.includes('seed')) this.setRandom();
    } else { this.modules['008'].applyUserProperties(mapped); if (Object.keys(mapped).length) this.revision++; }
    return changed;
  }
  restart() {
    this.shared.rst = 1;
    // Original log's escape edge is observed before physics consumes rst.
    const before = this.shared.civilizationRecords.length;
    this.modules['042'].update('');
    for (const record of this.shared.civilizationRecords.slice(before)) this.recordDeath(record);
    this.generation++; this.setRandom();
    this.modules['008'] = this.createModule('008', physicsFactory); this.modules['008'].init();
    this.shared.rst = 0; this.shared.num = 0; this.revision++;
  }
  tick() {
    this.engine.runtime = ++this.tickCount / 60;
    this.modules['008'].update(true);
    if (this.settings.physicsMode === 'realtime') {
      // Optional corrected wall-clock mode; reference mode preserves the original 60 Hz / 10-step behavior.
      const p = this.modules['008']; const remaining = Math.max(0, 1 / 60 - p.state().step * 10);
      const steps = Math.ceil(remaining / p.state().step);
      for (let i = 0; i < steps; i++) p.directStep(remaining / steps);
    }
    const state = this.modules['008'].state();
    for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) {
      const x = state.bodies[a], y = state.bodies[b];
      this.shared[`d${a + 1}${b + 1}`] = Math.hypot(x.x - y.x, x.y - y.y, x.z - y.z);
    }
    this.modules['010'].update('');
    this.modules['079'].update('');
    this.habitability.update(this.shared, this.settings);
    this.era = this.modules['072'].update('');
    const previousAlive = this.shared.civilizationAlive;
    const before = this.shared.civilizationRecords.length;
    this.shared.text = `/Seed:${this.settings.seed}/Universe:${this.generation}`;
    this.modules['042'].update('');
    if (!previousAlive && this.shared.civilizationAlive) this.emit('civilization:birth', { number: this.shared.civilizationCount });
    for (const record of this.shared.civilizationRecords.slice(before)) this.recordDeath(record);
    if (this.shared.tj === 1 && this.settings.autorestart) { this.emit('system:escape', {}); this.restart(); }
    this.modules['156'].update('');
    // Legacy ranked output reads the full list; a finite bound prevents days-long sessions growing forever.
    if (this.shared.civilizationRecords.length > 1000) this.shared.civilizationRecords.splice(0, this.shared.civilizationRecords.length - 1000);
    return state;
  }
  recordDeath(record) { this.emit('civilization:death', { ...plain(record), seed: this.settings.seed, generation: this.generation, settings: plain(this.settings), initialBodies: plain(this.initialBodies), algorithm: algorithmId(this.settings) }); }
  emit(type, detail) {
    this.events.push({ id: ++this.eventSeq, type, year: this.shared.xntime || 0, detail });
    if (this.events.length > 100) this.events.shift();
  }
  snapshot({ afterEvent = 0, compact = false } = {}) {
    const p = this.modules['008'].state(); const s = this.shared;
    return { tick: this.tickCount, revision: this.revision, runtime: this.engine.runtime, generation: this.generation, algorithm: algorithmId(this.settings),
      seed: this.settings.seed, bodies: p.bodies, com: p.com, G: p.G, temperature: Number(s.tem || 0), year: s.xntime || 0,
      era: this.era || '', escaped: s.tj === 1, alive: !!s.civilizationAlive, civilization: s.civilizationCount,
      habitability: plain(this.habitability.result),
      lifespan: s.civilizationAlive ? Math.floor(s.xntime) - s.civilizationStartTime : s.lastCivilizationLifespan,
      initialBodies: plain(this.initialBodies),
      log: [...(s.logEntries || [])], records: plain(compact ? [...(s.civilizationRecords || [])].sort((a,b) => b.lifespan-a.lifespan).slice(0,6) : s.civilizationRecords || []), events: plain(this.events.filter(e => e.id > afterEvent)),
      distances: [s.d14, s.d24, s.d34], text: Array.from({ length: 14 }, (_, i) => s[`txt${i + 1}`] || ''), loading: s.num || 0 };
  }
}

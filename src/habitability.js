const clamp = x => Math.max(0, Math.min(1, x));

// Climate resilience is integrated in fixed simulation seconds, independently of render FPS.
// Planetary collision / tidal destruction stay immediate. A distant stellar encounter is
// an observation, not evidence that the inhabited planet itself has been destroyed.
export class Habitability {
  constructor() { this.reset(); }
  reset() { this.health = 1; this.score = 1; this.result = null; }
  update(shared, settings, dt = 1 / 60) {
    const temperature = Number(shared.tem);
    const stableLow = Math.min(settings.newproperty45, settings.newproperty46);
    const stableHigh = Math.max(settings.newproperty45, settings.newproperty46);
    // The displayed stable band must always be climatically survivable, including after edits.
    const low = Math.min(settings.newproperty43, stableLow);
    const high = Math.max(settings.newproperty44, stableHigh);
    const stable = temperature >= stableLow && temperature <= stableHigh;
    const finite = Number.isFinite(temperature);
    let rawScore = 0, exposure = 0;
    if (finite && stable) rawScore = 1;
    else if (finite && temperature >= low && temperature <= high) {
      const fraction = temperature < stableLow ? (temperature - low) / Math.max(1, stableLow - low) : (high - temperature) / Math.max(1, high - stableHigh);
      rawScore = .35 + .65 * clamp(fraction);
    } else {
      const excess = finite ? Math.max(low - temperature, temperature - high, 0) : 1000;
      exposure = Math.min(4, .35 + excess / 100);
    }
    const tidal = [shared.d14, shared.d24, shared.d34].some(d => Number.isFinite(d) && d < settings.brfontcoloraaaaaarochelimitt);
    const collision = [shared.d14, shared.d24, shared.d34].some(d => Number.isFinite(d) && d < settings.newproperty42);
    const hazard = tidal ? 'tidal' : collision ? 'collision' : null;
    if (!this.result) this.score = hazard ? 0 : rawScore;
    else this.score += ((hazard ? 0 : rawScore) - this.score) * (1 - Math.exp(-dt / 1.5));
    this.health = clamp(this.health + (exposure ? -exposure / settings.thermalGrace : stable ? .08 : .02) * dt);
    this.result = {
      enabled: settings.civilizationMode === 'balanced', stable, score: clamp(this.score), health: this.health,
      canGrow: !hazard && finite && temperature >= low && temperature <= high && this.health >= .35,
      growth: stable ? 1 : rawScore,
      thermalFatal: this.health <= 1e-9,
      hazard, exposure, stableLow, stableHigh, low, high
    };
    return this.result;
  }
}

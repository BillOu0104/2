export class AudioController {
  constructor(onBands) {
    this.onBands = onBands; this.bands = new Float32Array(16); this.average = 0; this.fromWallpaper = false;
    this.element = new Audio('assets/ether.flac'); this.element.loop = true; this.element.preload = 'none';
    if (typeof window.wallpaperRegisterAudioListener === 'function') {
      this.fromWallpaper = true;
      window.wallpaperRegisterAudioListener(data => {
        const bands = new Float32Array(16);
        for (let i = 0; i < 16; i++) { let v = 0; for (let j = 0; j < 4; j++) v += ((data[i * 4 + j] || 0) + (data[i * 4 + j + 64] || 0)) * .125; bands[i] = v; }
        this.update(bands);
      });
    }
  }
  async play(enabled, volume) {
    this.element.volume = volume;
    if (!enabled) { this.element.pause(); return; }
    if (!this.context && !this.fromWallpaper) {
      this.context = new AudioContext(); this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 256;
      this.context.createMediaElementSource(this.element).connect(this.analyser); this.analyser.connect(this.context.destination); this.data = new Uint8Array(this.analyser.frequencyBinCount);
    }
    await this.context?.resume(); await this.element.play();
  }
  update(data) {
    let sum = 0;
    for (let i = 0; i < 16; i++) { const target = Math.min(1, Math.log(1 + data[i] * 10) / Math.log(11)); this.bands[i] += (target - this.bands[i]) * .05; sum += this.bands[i]; }
    // Original 106.js response: log-compressed band energy, 0.05 smoothing and 0.7 gate.
    if (!this.legacyEnergy) this.legacyEnergy = [0, 0, 0];
    const ranges = [[1, 6], [7, 11], [12, 15]];
    const response = ranges.map(([lo, hi], index) => {
      let energy = 0; for (let i = lo; i <= hi; i++) energy += Math.log(1 + Math.max(data[i], .01) * 20);
      energy = Math.min(energy / (hi - lo + 1) * .5, 1);
      const smoothed = this.legacyEnergy[index] = this.legacyEnergy[index] * .95 + energy * .05;
      return smoothed <= .7 ? 0 : smoothed <= .9 ? 1.5 * (smoothed - .7) : .3;
    });
    this.average = response.reduce((a, b) => a + b, 0) / .9;
    this.onBands(this.bands, this.average);
  }
  tick() {
    if (this.fromWallpaper) return;
    const bands = new Float32Array(16);
    if (this.analyser && !this.element.paused) { this.analyser.getByteFrequencyData(this.data); for (let i = 0; i < 16; i++) { let total = 0; for (let j = 0; j < 8; j++) total += this.data[i * 8 + j] || 0; bands[i] = total / (8 * 255); } }
    this.update(bands);
  }
}

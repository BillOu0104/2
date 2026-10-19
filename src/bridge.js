export function installWallpaperBridge({ changeSettings, setHostPaused, audio, renderer }) {
  const prior = window.wallpaperPropertyListener;
  window.wallpaperPropertyListener = {
    applyUserProperties(properties) {
      const patch = {};
      for (const [key, entry] of Object.entries(properties || {})) if (entry && 'value' in entry) patch[key] = entry.value;
      changeSettings(patch, { fromWallpaper: true });
      if (typeof patch.custombg === 'string' && patch.custombg) {
        const path = patch.custombg.replaceAll('\\', '/'); renderer.setCustomBackground(path.startsWith('file:') ? path : 'file:///' + path);
      }
    },
    applyGeneralProperties(properties) { if (properties?.fps) window.__wallpaperFPS = Math.max(10, Math.min(144, Number(properties.fps))); },
    setPaused(paused) { setHostPaused(!!paused); }
  };
  // Stable public extension boundary: notifications and remote rankings can subscribe later.
  window.threeBody = { version: '0.1.0', algorithm: 'sykm-scene-v3-reference60', getState: () => window.__threeBodyState ? structuredClone(window.__threeBodyState) : null, applySettings: patch => changeSettings(patch), subscribe(type, listener) { const fn = e => listener(e.detail); window.addEventListener(type, fn); return () => window.removeEventListener(type, fn); }, wallpaper: !!window.wallpaperRegisterAudioListener };
  return () => { window.wallpaperPropertyListener = prior; };
}

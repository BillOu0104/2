import { Simulation } from './simulation.js';
let simulation, paused = false, lastTime = performance.now(), remainder = 0, lastPost = 0, sentEvent = 0;
function sendState() {
  const state = simulation.snapshot({ afterEvent: sentEvent, compact: true });
  if (state.events.length) sentEvent = state.events.at(-1).id;
  // The UI receives a compact rank; durable archive payloads are sent only once as events.
  self.postMessage({ type: 'state', state });
}
self.onmessage = ({ data }) => {
  try {
    if (data.type === 'init') { simulation = new Simulation(data.settings); simulation.tick(); sendState(); }
    if (data.type === 'settings') simulation?.configure(data.patch);
    if (data.type === 'restart') simulation?.restart();
    if (data.type === 'pause') { paused = data.value; remainder = 0; lastTime = performance.now(); }
  } catch (e) { self.postMessage({ type: 'error', message: e.message, stack: e.stack }); }
};
setInterval(() => {
  const now = performance.now();
  if (!simulation || paused) { lastTime = now; return; }
  remainder += Math.min(0.25, (now - lastTime) / 1000); lastTime = now;
  try {
    while (remainder >= 1 / 60) { simulation.tick(); remainder -= 1 / 60; }
    if (now - lastPost > 30) { sendState(); lastPost = now; }
  } catch (e) { paused = true; self.postMessage({ type: 'error', message: e.message, stack: e.stack }); }
}, 8);

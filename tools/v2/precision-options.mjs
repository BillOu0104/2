import assert from 'node:assert/strict';

// Research-only refinement of the existing Yoshida/adaptive solver. Neither
// display time, force evaluation, controls, lifecycle nor product defaults change.
const installed = new WeakSet();
export function applyPrecision(primary, observer, precision) {
  assert(precision && precision.maxStep > 0 && precision.eta > 0);
  assert(precision.maxStep <= .0001875 && precision.eta <= .001875);
  for (const integrator of [primary.integrator, observer.integrator]) {
    assert(!installed.has(integrator), 'Precision must be installed once after create/restore');
    const advance = integrator.advance.bind(integrator);
    integrator.advance = (duration, options) => advance(duration, {
      ...options, maxStep: precision.maxStep, eta: precision.eta,
    });
    installed.add(integrator);
  }
}

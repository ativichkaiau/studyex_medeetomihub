import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { MOTION_KEY, motionEnabled, motionScript, setMotion } from '../lib/motion';

// Check the actual pre-paint script with every stored state and system override.
for (const saved of [null, 'enabled', 'paused', 'invalid', 'blocked']) {
  for (const reduced of [false, true]) {
    const classes = new Set<string>();
    const attrs = new Set<string>();
    runInNewContext(motionScript, {
      localStorage: { getItem(key: string) {
        assert.equal(key, MOTION_KEY);
        if (saved === 'blocked') throw new Error('Storage unavailable');
        return saved;
      } },
      window: { matchMedia: () => ({ matches: reduced }) },
      document: { documentElement: {
        classList: { toggle(name: string, on: boolean) { if (on) classes.add(name); else classes.delete(name); } },
        toggleAttribute(name: string, on: boolean) { if (on) attrs.add(name); else attrs.delete(name); },
      } },
    });
    const enabled = saved !== 'paused' && !reduced;
    assert.equal(classes.has('motion'), enabled, `${saved}, reduced=${reduced}`);
    assert.equal(attrs.has('data-motion-paused'), !enabled);
  }
}

// A failed storage write must still leave all controls and the runtime in step.
let saved: string | null = null;
let blocked = false;
let reduced = false;
let applied = false;
const keys = ['window', 'document', 'localStorage'] as const;
const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
try {
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: { matchMedia: () => ({ matches: reduced }), dispatchEvent() {} } },
    document: { configurable: true, value: { documentElement: {
      classList: { toggle(_name: string, on: boolean) { applied = on; } },
      toggleAttribute() {},
    } } },
    localStorage: { configurable: true, value: {
      getItem() { if (blocked) throw new Error('blocked'); return saved; },
      setItem(_key: string, value: string) { if (blocked) throw new Error('blocked'); saved = value; },
    } },
  });
  assert.equal(motionEnabled(), true);
  setMotion(false);
  assert.equal(motionEnabled(), false);
  assert.equal(applied, false);
  saved = 'enabled'; // another tab updated the stored choice
  assert.equal(motionEnabled(), true);
  blocked = true;
  setMotion(false);
  assert.equal(motionEnabled(), false, 'Off survives blocked storage');
  setMotion(true);
  assert.equal(motionEnabled(), true);
  reduced = true;
  assert.equal(motionEnabled(), false, 'The system setting wins');
  setMotion(true);
  assert.equal(applied, false);
} finally {
  keys.forEach((key, i) => {
    const descriptor = descriptors[i];
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  });
}
console.log('motion:verify — first paint, manual choices, changed storage, blocked storage and reduced motion passed.');

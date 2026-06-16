// Single shared audio engine, synthesized with the Web Audio API (no assets).
// Holds the ambient drone (toggled from the SoundToggle button) plus two soft
// UI cues: a warm "bloom" when a particle form locks, and an airy "hover" tap.
// One AudioContext, created lazily on the first user gesture (autoplay policy).
// Everything is silent unless the user has switched sound on.

type Drone = { gain: GainNode; oscs: OscillatorNode[] };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let drone: Drone | null = null;
let enabled = true; // on by default; the drone actually starts on first gesture
let armed = false;

function ensureCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  void ctx.resume();
  return ctx;
}

function startDrone() {
  const c = ensureCtx();
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.connect(master as GainNode);

  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  lp.Q.value = 0.6;
  lp.connect(gain);

  const make = (type: OscillatorType, freq: number) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.connect(lp);
    o.start();
    return o;
  };
  const oscs = [make("sine", 110), make("sine", 110.4), make("triangle", 55)];
  gain.gain.setTargetAtTime(0.045, c.currentTime, 0.6);
  drone = { gain, oscs };
}

function stopDrone() {
  if (!ctx || !drone) return;
  const t = ctx.currentTime;
  drone.gain.gain.cancelScheduledValues(t);
  drone.gain.gain.setTargetAtTime(0, t, 0.3);
  drone.oscs.forEach((o) => o.stop(t + 1.2));
  drone = null;
}

export const audio = {
  get enabled() {
    return enabled;
  },
  // Browsers block audio until a user gesture. Call once on mount: when sound is
  // on (the default), the drone fades in on the first click / scroll / key.
  arm() {
    if (armed || typeof window === "undefined") return;
    armed = true;
    const start = () => {
      if (enabled && !drone) startDrone();
    };
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", start, opts);
    window.addEventListener("keydown", start, opts);
    window.addEventListener("wheel", start, opts);
    window.addEventListener("touchstart", start, opts);
  },
  // Returns the new on/off state so the button can reflect it.
  toggle(): boolean {
    if (enabled) {
      stopDrone();
      enabled = false;
    } else {
      startDrone();
      enabled = true;
    }
    return enabled;
  },

  // Warm bloom when a form locks: two sine partials (root + a fifth) through a
  // lowpass that opens then closes, with a soft attack and long tail. Reads as a
  // breath of resonance, not a beep.
  lock(freq = 196) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;

    const g = c.createGain();
    g.connect(master);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.4;
    lp.frequency.setValueAtTime(500, t);
    lp.frequency.linearRampToValueAtTime(1500, t + 0.18);
    lp.frequency.linearRampToValueAtTime(700, t + 1.0);
    lp.connect(g);

    const o1 = c.createOscillator();
    o1.type = "sine";
    o1.frequency.value = freq;
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.value = freq * 1.5; // a perfect fifth above
    o1.connect(lp);
    o2.connect(lp);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o1.start(t);
    o2.start(t);
    o1.stop(t + 1.15);
    o2.stop(t + 1.15);
  },

  // Airy hover tap: a tiny burst of bandpassed noise. Soft, dry, no pitch — a
  // tactile "tick" rather than a tone.
  hover() {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;
    const dur = 0.05;

    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    // Vary the centre so repeated taps shimmer instead of machine-gunning.
    bp.frequency.value = 1900 + Math.random() * 1400;
    bp.Q.value = 1.1;
    const g = c.createGain();
    src.connect(bp);
    bp.connect(g);
    g.connect(master);

    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.022, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.start(t);
    src.stop(t + dur);
  },
};

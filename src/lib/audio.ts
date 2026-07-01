// Single shared audio engine. Mixes AI-generated samples (ElevenLabs, served
// from /public/sound) for the rich cues — the ambient drone, the intro flight
// whoosh, the arrival, and the particle hover — with cheap synthesized ticks for
// the high-frequency UI cues (button taps, scroll form-locks). One AudioContext,
// created lazily on the first user gesture (autoplay policy); everything is
// silent unless sound is on (the default).

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true; // on by default; samples load + drone starts on first gesture
let armed = false;

let droneSrc: AudioBufferSourceNode | null = null;
let droneGain: GainNode | null = null;

const raw: Record<string, ArrayBuffer> = {};
const buffers: Record<string, AudioBuffer> = {};
const SAMPLES = ["drone", "arrival", "whoosh", "transition"] as const;
let prefetching: Promise<void> | null = null;
let decoding: Promise<void> | null = null;

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

// Fetch the raw bytes (no AudioContext needed) — safe to call during the enter
// gate, before any user gesture, so decoding on click is instant.
function prefetch(): Promise<void> {
  if (prefetching) return prefetching;
  prefetching = Promise.all(
    SAMPLES.map(async (name) => {
      const res = await fetch(`/sound/${name}.mp3`);
      raw[name] = await res.arrayBuffer();
    }),
  ).then(() => {});
  return prefetching;
}

// Decode the prefetched bytes into the context (needs a gesture-created ctx).
function decodeAll(): Promise<void> {
  if (decoding) return decoding;
  const c = ensureCtx();
  decoding = prefetch()
    .then(() =>
      Promise.all(
        SAMPLES.map(async (name) => {
          // decodeAudioData detaches the buffer, so decode a copy.
          buffers[name] = await c.decodeAudioData(raw[name].slice(0));
        }),
      ),
    )
    .then(() => {});
  return decoding;
}

function playSample(
  name: string,
  { gain = 1, rate = 1, loop = false }: { gain?: number; rate?: number; loop?: boolean },
): { src: AudioBufferSourceNode; gain: GainNode } | null {
  if (!ctx || !master || !buffers[name]) return null;
  const src = ctx.createBufferSource();
  src.buffer = buffers[name];
  src.loop = loop;
  src.playbackRate.value = rate;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(master);
  src.start();
  return { src, gain: g };
}

function startDrone() {
  if (!ctx || droneSrc) return;
  const node = playSample("drone", { gain: 0, loop: true });
  if (!node) return;
  droneSrc = node.src;
  droneGain = node.gain;
  droneGain.gain.setTargetAtTime(0.5, ctx.currentTime, 0.9);
}

function stopDrone() {
  if (!ctx || !droneSrc || !droneGain) return;
  const t = ctx.currentTime;
  droneGain.gain.cancelScheduledValues(t);
  droneGain.gain.setTargetAtTime(0, t, 0.4);
  droneSrc.stop(t + 1.6);
  droneSrc = null;
  droneGain = null;
}

function primeAndStart() {
  if (!enabled) return;
  void decodeAll().then(() => {
    if (enabled && !droneSrc) startDrone();
  });
}

// On/off subscribers, so UI (the sound toggle) stays in sync when something
// else flips the state (e.g. the "ohne Ton" enter path).
const changeSubs = new Set<(on: boolean) => void>();
function emitChange() {
  changeSubs.forEach((f) => f(enabled));
}

export const audio = {
  get enabled() {
    return enabled;
  },
  // Warm the cache during the enter gate (fetch only, no gesture needed).
  prefetch() {
    if (typeof window !== "undefined") void prefetch();
  },
  // Unlock + start from a user gesture (the enter-gate click). Decodes the
  // prefetched samples into the freshly created context, then fades in the
  // drone. Resolves once samples are ready so cues fire in time.
  async start() {
    armed = true;
    await decodeAll();
    if (enabled && !droneSrc) startDrone();
  },
  // Fallback unlock on the first gesture if the gate was somehow bypassed.
  arm() {
    if (armed || typeof window === "undefined") return;
    armed = true;
    const opts = { once: true, passive: true } as const;
    window.addEventListener("pointerdown", primeAndStart, opts);
    window.addEventListener("keydown", primeAndStart, opts);
    window.addEventListener("wheel", primeAndStart, opts);
    window.addEventListener("touchstart", primeAndStart, opts);
  },
  // Returns the new on/off state so the button can reflect it.
  toggle(): boolean {
    if (enabled) {
      stopDrone();
      enabled = false;
    } else {
      enabled = true;
      primeAndStart();
    }
    emitChange();
    return enabled;
  },
  // The quiet enter path: switch sound off without ever creating a context.
  // arm()'s first-gesture fallback stays harmless because primeAndStart()
  // checks `enabled`.
  mute() {
    if (!enabled) return;
    stopDrone();
    enabled = false;
    emitChange();
  },
  onChange(cb: (on: boolean) => void): () => void {
    changeSubs.add(cb);
    return () => changeSubs.delete(cb);
  },

  // --- Sample cues (rich, AI-generated) ---

  // Intro: the forward-flight riser as the drone tears through the pixel field.
  flight() {
    if (!enabled) return;
    playSample("whoosh", { gain: 0.5 });
  },
  // Intro: a soft, quick swoosh at each scene change — its own short sample
  // (not the sped-up riser), with a touch of rate variation so the three
  // beats don't sound like a copy-paste.
  transition() {
    if (!enabled) return;
    playSample("transition", { gain: 0.42, rate: 0.94 + Math.random() * 0.14 });
  },
  // Intro: the deep bloom as the TZ lands and the world arrives.
  arrival() {
    if (!enabled) return;
    playSample("arrival", { gain: 0.7 });
  },
  // Particle-cloud hover: a vibrating tone whose pitch tracks how high in the
  // cloud the cursor is. `freq` is supplied by the canvas from the cursor height;
  // a pitch LFO (vibrato) + amplitude LFO (tremolo) make it shimmer/vibrate.
  hoverParticle(freq = 220) {
    if (!enabled || !ctx || !master) return;
    const c = ctx;
    const t = c.currentTime;

    const env = c.createGain();
    env.connect(master);
    // tremolo: an LFO swinging a VCA's gain so the tone pulses
    const vca = c.createGain();
    vca.gain.value = 0.65;
    vca.connect(env);
    const trem = c.createOscillator();
    trem.type = "sine";
    trem.frequency.value = 11;
    const tremDepth = c.createGain();
    tremDepth.gain.value = 0.35;
    trem.connect(tremDepth);
    tremDepth.connect(vca.gain);

    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = freq;
    o.connect(vca);
    // vibrato: pitch wobble
    const vib = c.createOscillator();
    vib.type = "sine";
    vib.frequency.value = 6.5;
    const vibDepth = c.createGain();
    vibDepth.gain.value = freq * 0.03;
    vib.connect(vibDepth);
    vibDepth.connect(o.frequency);

    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.06, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.start(t); trem.start(t); vib.start(t);
    o.stop(t + 0.46); trem.stop(t + 0.46); vib.stop(t + 0.46);
  },

  // --- Synth cues (cheap, instant, high-frequency) ---

  // Button / link hover: a dry bandpassed-noise tap.
  hoverButton() {
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

  // Scroll form-lock: a short warm sine bloom on a low note (one per form snap).
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
    o2.frequency.value = freq * 1.5;
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
};

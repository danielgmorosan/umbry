/**
 * Notification sounds (T3) - synthesized via WebAudio: no assets, no network,
 * nothing to load. One shared AudioContext, lazily created and resumed on
 * first use (autoplay policy: until the user has interacted once, the context
 * may stay suspended - we fail silent, never throw).
 */

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One soft sine note with a fast decay. */
function note(c: AudioContext, freq: number, at: number, dur: number, peak = 0.07) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

/** Message chime: quick ascending two-tone (Slack/Discord-adjacent, quiet). */
export function playChime() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  note(c, 740, t, 0.16); // F#5
  note(c, 988, t + 0.09, 0.22); // B5
}

/** Call-event chime: brighter three-tone rise, still short. */
export function playCallChime() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  note(c, 659, t, 0.14); // E5
  note(c, 831, t + 0.1, 0.14); // G#5
  note(c, 988, t + 0.2, 0.26); // B5
}

/** Someone joined the call: short ascending blip (Discord-style). */
export function playJoinBlip() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  note(c, 523, t, 0.1, 0.06); // C5
  note(c, 784, t + 0.07, 0.16, 0.06); // G5
}

/** Someone left the call: the same blip descending. */
export function playLeaveBlip() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  note(c, 784, t, 0.1, 0.06);
  note(c, 523, t + 0.07, 0.16, 0.06);
}

/** The call ended (you hung up or were disconnected): low resolving two-tone. */
export function playCallEnd() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  note(c, 494, t, 0.16, 0.06); // B4
  note(c, 330, t + 0.12, 0.3, 0.06); // E4
}

/**
 * One synthesized duck quack. A real quack is a short nasal "waak": a buzzy
 * source whose pitch dips, shaped by a resonant band that sweeps down (the
 * vocal-tract formant) — that downward formant sweep is what reads as "duck"
 * rather than "kazoo".
 */
function quack(c: AudioContext, at: number, base: number, peak = 0.16) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  const bp = c.createBiquadFilter();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(base * 1.05, at);
  osc.frequency.exponentialRampToValueAtTime(base * 0.7, at + 0.14);
  bp.type = "bandpass";
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(1700, at);
  bp.frequency.exponentialRampToValueAtTime(700, at + 0.14);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  gain.gain.setValueAtTime(peak * 0.9, at + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.19);
  osc.connect(bp).connect(gain).connect(c.destination);
  osc.start(at);
  osc.stop(at + 0.22);
}

/** Poke / 🦆 reaction: a cheeky double quack. */
export function playQuack() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  quack(c, t, 520);
  quack(c, t + 0.24, 470);
}

// ── Soundboard (T4) ─────────────────────────────────────────────────
// A shared 2s noise buffer, reused for percussive/breath sounds.
let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext): AudioBuffer {
  if (noiseBuf) return noiseBuf;
  const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const data = buf.getChannelData(0);
  // Deterministic pseudo-noise (Math.random is unavailable in some sandboxes,
  // and this is plenty random-sounding for a texture).
  let s = 0.123;
  for (let i = 0; i < data.length; i++) {
    s = (s * 16807) % 2147483647;
    data[i] = (s / 1073741823.5) - 1;
  }
  noiseBuf = buf;
  return buf;
}

/** 🦗 Crickets: a run of high chirps — the classic "awkward silence". */
export function playCrickets() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  for (let n = 0; n < 6; n++) {
    const at = t + n * 0.22;
    // Each chirp = a few fast pulses of a high tone.
    for (let k = 0; k < 3; k++) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      o.frequency.value = 4300 + (k % 2) * 260;
      const s = at + k * 0.018;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.05, s + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.014);
      o.connect(g).connect(c.destination);
      o.start(s);
      o.stop(s + 0.02);
    }
  }
}

/** 👏 Applause: overlapping filtered noise bursts (claps). */
export function playApplause() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 1200;
  hp.connect(c.destination);
  for (let n = 0; n < 26; n++) {
    const src = c.createBufferSource();
    src.buffer = noise(c);
    const g = c.createGain();
    const at = t + n * 0.035 + (n % 3) * 0.006;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.09, at + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    src.connect(g).connect(hp);
    src.start(at, (n * 0.017) % 1.5, 0.06);
  }
}

/** 📣 Airhorn: three stacked detuned saws, a stab then a longer blast. */
export function playAirhorn() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  const blast = (at: number, dur: number) => {
    const g = c.createGain();
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.12, at + 0.02);
    g.gain.setValueAtTime(0.12, at + dur - 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    for (const detune of [-8, 0, 7]) {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = 233;
      o.detune.value = detune;
      o.connect(g);
      o.start(at);
      o.stop(at + dur + 0.02);
    }
    g.connect(lp).connect(c.destination);
  };
  blast(t, 0.16);
  blast(t + 0.22, 0.5);
}

/** 🥁 Drumroll into a rimshot hit. */
export function playDrumroll() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  const hit = (at: number, freq: number, peak: number, dur: number) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, at);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, at + dur);
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(c.destination);
    o.start(at);
    o.stop(at + dur + 0.02);
  };
  // Accelerating roll of soft tom hits...
  let at = t;
  let gap = 0.09;
  for (let n = 0; n < 12; n++) {
    hit(at, 180, 0.06, 0.07);
    gap *= 0.88;
    at += gap;
  }
  // ...then the punchline hit.
  hit(at + 0.05, 260, 0.16, 0.25);
}

/** 🔔 Bell: a bright struck tone with a long ring. */
export function playBell() {
  const c = audioCtx();
  if (!c) return;
  const t = c.currentTime;
  for (const [mult, peak] of [[1, 0.12], [2.76, 0.05], [5.4, 0.03]] as const) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 660 * mult;
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 1.7);
  }
}

export type SoundName = "quack" | "crickets" | "applause" | "airhorn" | "drumroll" | "bell";

/** Play a named soundboard sound. */
export function playSound(name: SoundName) {
  switch (name) {
    case "quack":
      return playQuack();
    case "crickets":
      return playCrickets();
    case "applause":
      return playApplause();
    case "airhorn":
      return playAirhorn();
    case "drumroll":
      return playDrumroll();
    case "bell":
      return playBell();
  }
}

let ringTimer: ReturnType<typeof setInterval> | null = null;

/** One "brrring" burst: two close tones beating against each other. */
function ringBurst(c: AudioContext) {
  const t = c.currentTime;
  for (const f of [440, 480]) {
    note(c, f, t, 0.9, 0.05);
    note(c, f, t + 1.1, 0.9, 0.05);
  }
}

/**
 * Looping incoming-call ring (classic double-burst every ~3s) + vibration on
 * devices that support it. Call stopRing() to end; starting twice is a no-op.
 */
export function startRing() {
  if (ringTimer) return;
  const c = audioCtx();
  const burst = () => {
    if (c) ringBurst(c);
    try {
      navigator.vibrate?.([400, 200, 400]);
    } catch {
      /* unsupported */
    }
  };
  burst();
  ringTimer = setInterval(burst, 3200);
}

export function stopRing() {
  if (ringTimer) clearInterval(ringTimer);
  ringTimer = null;
  try {
    navigator.vibrate?.(0);
  } catch {
    /* unsupported */
  }
}

/* Tiny WebAudio foley — wooden thocks, no assets needed. */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function thock(freq: number, dur: number, gainV: number, when = 0) {
  const a = ac();
  if (!a || muted) return;
  const t = a.currentTime + when;

  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.5), t + dur);
  g.gain.setValueAtTime(gainV, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);

  const noise = a.createBufferSource();
  const buf = a.createBuffer(1, a.sampleRate * 0.03, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  noise.buffer = buf;
  const bp = a.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2200;
  const ng = a.createGain();
  ng.gain.setValueAtTime(gainV * 0.6, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  noise.connect(bp).connect(ng).connect(a.destination);
  noise.start(t);
}

export const sMove = () => thock(220, 0.1, 0.22);
export const sCapture = () => {
  thock(120, 0.16, 0.3);
  thock(200, 0.08, 0.12, 0.05);
};
export const sCheck = () => {
  thock(520, 0.09, 0.14);
  thock(660, 0.1, 0.14, 0.09);
};
export const sStart = () => {
  thock(300, 0.12, 0.16);
  thock(400, 0.12, 0.14, 0.12);
};
export const sEnd = () => {
  thock(160, 0.2, 0.26);
  thock(90, 0.3, 0.26, 0.18);
};
export const sMsg = () => thock(880, 0.05, 0.05);

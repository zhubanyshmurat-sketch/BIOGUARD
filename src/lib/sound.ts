// Жеңіл дыбыстар WebAudio арқылы — сыртқы файлдар қажет емес.
let ctx: AudioContext | null = null;
let muted = false;
try { muted = localStorage.getItem('bioguard_muted') === '1'; } catch { /* */ }

export const isMuted = () => muted;
export function setMuted(m: boolean) {
  muted = m;
  try { localStorage.setItem('bioguard_muted', m ? '1' : '0'); } catch { /* */ }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (muted) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  } catch { /* */ }
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.08),
  correct: () => { tone(660, 0, 0.12, 'triangle'); tone(990, 0.1, 0.18, 'triangle'); },
  wrong: () => { tone(220, 0, 0.18, 'sawtooth', 0.07); tone(180, 0.12, 0.2, 'sawtooth', 0.07); },
  pop: () => tone(880, 0, 0.1, 'square', 0.06),
  plant: () => { tone(523, 0, 0.1, 'sine'); tone(784, 0.08, 0.14, 'sine'); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle')),
};

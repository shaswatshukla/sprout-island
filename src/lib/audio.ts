let enabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (!on) {
    try {
      speechSynthesis.cancel();
    } catch {
      /* no speech support */
    }
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const t = ctx.currentTime + start;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch {
    /* no Web Audio support */
  }
}

export const sfx = {
  pop: () => {
    tone(660, 0, 0.12, 'triangle');
    tone(990, 0.05, 0.1, 'sine', 0.08);
  },
  correct: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle')),
  soft: () => tone(392, 0, 0.2, 'sine', 0.05), // gentle "try again", never a buzzer
  flip: () => tone(880, 0, 0.06, 'triangle', 0.05),
  cheer: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle')),
};

export function speak(text: string) {
  if (!enabled || !text || typeof speechSynthesis === 'undefined') return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const local = speechSynthesis.getVoices().filter((v) => v.localService);
    const voice = local.find((v) => v.lang.toLowerCase().startsWith('en')) ?? local[0];
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.15;
    speechSynthesis.speak(u);
  } catch {
    /* no speech support */
  }
}

const SOUND_ENABLED = true;

type AudioContextConstructor = typeof AudioContext;

let audioContext: AudioContext | null = null;
let lastTypingSoundAt = 0;

function getAudioContext() {
  if (!SOUND_ENABLED || typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequency: number, duration: number, volume: number, type: OscillatorType = "sine", delay = 0) {
  const context = getAudioContext();
  if (!context) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 260;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.012, duration * 0.28));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(filter).connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playJoinSound() {
  tone(1180, 0.11, 0.075, "sine");
  tone(1840, 0.075, 0.035, "triangle", 0.008);
}

export function playTypingSound() {
  const now = performance.now();
  if (now - lastTypingSoundAt < 32) return;
  lastTypingSoundAt = now;
  const frequency = 1540 + Math.random() * 180;
  tone(frequency, 0.035, 0.022, "sine");
}

export function playSuccessSound() {
  tone(540, 0.58, 0.065, "sine");
  tone(1040, 0.5, 0.052, "triangle", 0.085);
  tone(1560, 0.24, 0.018, "sine", 0.22);
}

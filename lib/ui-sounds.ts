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

function createNoise(context: AudioContext, duration: number) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  return buffer;
}

function playNoise(context: AudioContext, start: number, duration: number, volume: number, frequency: number) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = createNoise(context, duration);
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(frequency, start);
  filter.Q.value = 1.4;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(context.destination);
  source.start(start);
  source.stop(start + duration + 0.01);
}

function playTone(context: AudioContext, start: number, frequency: number, duration: number, volume: number, type: OscillatorType, destination: AudioNode) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.985, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.028, duration * 0.16));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.025);
}

function createReverb(context: AudioContext, duration = 0.72) {
  const length = Math.ceil(context.sampleRate * duration);
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / length, 2.4);
  }
  const convolver = context.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

export function playJoinSound() {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime;
  const output = context.createGain();
  output.gain.value = 0.72;
  output.connect(context.destination);
  playNoise(context, start, 0.075, 0.026, 2350);
  playTone(context, start, 1320, 0.12, 0.045, "sine", output);
  playTone(context, start + 0.012, 1980, 0.085, 0.02, "triangle", output);
}

export function playTypingSound() {
  const now = performance.now();
  if (now - lastTypingSoundAt < 38) return;
  lastTypingSoundAt = now;
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime;
  const output = context.createGain();
  output.gain.value = 0.62;
  output.connect(context.destination);
  playNoise(context, start, 0.014, 0.012, 2500 + Math.random() * 300);
  playTone(context, start, 1780 + Math.random() * 140, 0.032, 0.014, "sine", output);
}

export function playSuccessSound() {
  const context = getAudioContext();
  if (!context) return;
  const start = context.currentTime;
  const output = context.createGain();
  const reverb = createReverb(context);
  const wet = context.createGain();
  output.gain.value = 0.82;
  wet.gain.value = 0.16;
  output.connect(context.destination);
  output.connect(reverb).connect(wet).connect(context.destination);
  playTone(context, start, 440, 0.62, 0.055, "sine", output);
  playTone(context, start + 0.085, 880, 0.56, 0.046, "triangle", output);
  playTone(context, start + 0.19, 1320, 0.34, 0.018, "sine", output);
}

/**
 * Audio and Haptic Synthesis Utility for Palabritas
 * Uses Web Speech API for authentic Spanish pronunciation and
 * Web Audio API for responsive tactile sounds.
 */

// Procedural audio context singleton
let audioCtx: AudioContext | null = null;
let soundEffectsEnabled = true;
let hapticsEnabled = typeof navigator !== 'undefined' && 'vibrate' in navigator;
let voiceAccent: 'latino' | 'castellano' = 'latino';
let speechSpeed: 'lenta' | 'normal' = 'normal';

export function getAudioContext(): AudioContext | null {
  if (!soundEffectsEnabled) return null;
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function triggerHaptic(pattern: number | number[] = 20) {
  if (!hapticsEnabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Ignore unsupported
  }
}

export function setSoundEffects(enabled: boolean) {
  soundEffectsEnabled = enabled;
}

export function isSoundEffectsEnabled(): boolean {
  return soundEffectsEnabled;
}

export function setHaptics(enabled: boolean) {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function setVoicePreferences(accent: 'latino' | 'castellano', speed: 'lenta' | 'normal') {
  voiceAccent = accent;
  speechSpeed = speed;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Pronounce Spanish text using SpeechSynthesis
 */
export function speakSpanish(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore cancel failure
  }

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance; // Keep active reference to prevent GC drops

  utterance.lang = voiceAccent === 'castellano' ? 'es-ES' : 'es-MX';
  utterance.rate = speechSpeed === 'lenta' ? 0.75 : 0.9;
  utterance.pitch = 1.05; // Slightly warmer child-friendly pitch

  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onend = finish;
  utterance.onerror = (e) => {
    console.warn('SpeechSynthesis event:', e.error);
    finish();
  };

  // Pick best available Spanish voice if possible
  const voices = window.speechSynthesis.getVoices();
  const preferredLang = voiceAccent === 'castellano' ? 'es-ES' : 'es-';
  const matchingVoice = voices.find(v => v.lang.startsWith(preferredLang) || v.lang.startsWith('es'));
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Play a bouncy pop sound for chunky button taps
 */
export function playPop(basePitch = 340) {
  if (!soundEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(basePitch, now);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 2.2, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(basePitch * 0.8, now + 0.14);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // Ignore error
  }
}

/**
 * Play an arpeggiated star chime
 */
export function playSparkleChime() {
  if (!soundEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
  const startTime = ctx.currentTime;

  notes.forEach((freq, idx) => {
    try {
      const noteTime = startTime + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    } catch {
      // Ignore
    }
  });
}

/**
 * Play full celebratory fanfare
 */
export function playFanfare() {
  if (!soundEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  [320, 420, 560].forEach((freq, i) => {
    setTimeout(() => playPop(freq), i * 80);
  });

  setTimeout(() => playSparkleChime(), 260);

  const now = ctx.currentTime + 0.4;
  const chordNotes = [523.25, 659.25, 783.99, 1046.5];
  chordNotes.forEach(freq => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    } catch {
      // Ignore
    }
  });
}

/**
 * Play a scratch foil sound effect for the scratch card
 */
let lastScratchTime = 0;
export function playScratchSound() {
  if (!soundEffectsEnabled) return;
  const nowMs = Date.now();
  if (nowMs - lastScratchTime < 70) return;
  lastScratchTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1700 + Math.random() * 500;
    filter.Q.value = 2.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(now);
  } catch {
    // Ignore
  }
}

/**
 * Play friendly try-again sound
 */
export function playWiggleError() {
  if (!soundEffectsEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore
  }
}

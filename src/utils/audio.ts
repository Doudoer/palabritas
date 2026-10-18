/**
 * Audio and Haptic Synthesis Utility for Palabritas
 * Multi-tiered hybrid engine:
 * 1. Native High-Definition Audio Stream (HTMLAudioElement) for guaranteed cross-platform Spanish voice.
 * 2. Web Speech API (SpeechSynthesis) offline fallback with queue recovery.
 * 3. Web Audio API (AudioContext) for responsive tactile pops, chimes, and fanfares.
 */

// Procedural audio context singleton
let audioCtx: AudioContext | null = null;
let soundEffectsEnabled = true;
let hapticsEnabled = typeof navigator !== 'undefined' && 'vibrate' in navigator;
let voiceAccent: 'latino' | 'castellano' = 'latino';
let speechSpeed: 'lenta' | 'normal' = 'normal';

// Cached voices and unlock status
let cachedVoices: SpeechSynthesisVoice[] = [];
let audioUnlocked = false;
let pendingSpeechTimeout: ReturnType<typeof setTimeout> | null = null;
let speechWatchdogInterval: ReturnType<typeof setInterval> | null = null;

// Reusable audio element singleton for voice streams
let voiceAudioElement: HTMLAudioElement | null = null;
let activeVoiceAudioTimeout: ReturnType<typeof setTimeout> | null = null;

// Keep global reference to active utterance to prevent V8 GC premature collection (Chromium bug 289725)
interface WindowWithUtterance extends Window {
  __palabritasUtterance?: SpeechSynthesisUtterance | null;
}

/**
 * Loads available voices from SpeechSynthesis API
 */
function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  } catch {
    // Ignore error
  }
}

/**
 * Chooses the best Spanish voice based on locale
 */
function getBestSpanishVoice(accent: 'latino' | 'castellano'): SpeechSynthesisVoice | null {
  if (cachedVoices.length === 0) {
    loadVoices();
  }
  const voices = cachedVoices;
  if (!voices || voices.length === 0) return null;

  if (accent === 'castellano') {
    const es = voices.find(v => v.lang.toLowerCase() === 'es-es' || v.lang.toLowerCase().startsWith('es-es'));
    if (es) return es;
  } else {
    // Prefer Latin American Spanish voices
    const latinoCodes = ['es-mx', 'es-419', 'es-us', 'es-co', 'es-ar', 'es-cl', 'es-pe', 'es-ve'];
    for (const code of latinoCodes) {
      const v = voices.find(voice => voice.lang.toLowerCase() === code || voice.lang.toLowerCase().startsWith(code));
      if (v) return v;
    }
  }

  // Fallback to any Spanish voice available
  const anySpanish = voices.find(v => v.lang.toLowerCase().startsWith('es'));
  if (anySpanish) return anySpanish;

  return null;
}

/**
 * Initializes and unlocks AudioContext, HTML5 Audio, and SpeechSynthesis on user interaction
 */
export function unlockAudio() {
  if (typeof window === 'undefined') return;

  // 1. Unlock Web Audio API (required by Chrome, Safari & iOS autoplay policies)
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    // Play a silent 1-sample buffer to satisfy iOS WebKit audio unlock requirement
    if (audioCtx && !audioUnlocked) {
      const buffer = audioCtx.createBuffer(1, 1, 22050);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start(0);
    }
  } catch {
    // Ignore failure
  }

  // 2. Unlock HTMLAudioElement for mobile media policy
  try {
    if (!voiceAudioElement) {
      voiceAudioElement = new Audio();
      voiceAudioElement.preload = 'auto';
    }
  } catch {
    // Ignore failure
  }

  // 3. Unlock & resume SpeechSynthesis if stuck or paused
  try {
    if ('speechSynthesis' in window) {
      loadVoices();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  } catch {
    // Ignore failure
  }

  audioUnlocked = true;
}

// Auto-register unlock listeners on first user gesture (pointer, touch, click, key)
if (typeof window !== 'undefined') {
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices();
    };
  }

  const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown', 'click'];
  const handleFirstInteraction = () => {
    unlockAudio();
    unlockEvents.forEach(evt => window.removeEventListener(evt, handleFirstInteraction));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, handleFirstInteraction, { passive: true }));
}

export function getAudioContext(): AudioContext | null {
  if (!soundEffectsEnabled) return null;
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
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

/**
 * Fallback synthesizer using Web Speech API with Chromium queue recovery
 */
function speakWithSpeechSynthesis(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    // Unstick engine if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    (window as WindowWithUtterance).__palabritasUtterance = utterance;

    utterance.lang = voiceAccent === 'castellano' ? 'es-ES' : 'es-MX';
    utterance.rate = speechSpeed === 'lenta' ? 0.75 : 0.9;
    utterance.pitch = 1.05; // Slightly warmer child-friendly pitch

    const bestVoice = getBestSpanishVoice(voiceAccent);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    let finished = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const finish = () => {
      if (finished) return;
      finished = true;

      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }

      if (speechWatchdogInterval) {
        clearInterval(speechWatchdogInterval);
        speechWatchdogInterval = null;
      }

      if ((window as WindowWithUtterance).__palabritasUtterance === utterance) {
        (window as WindowWithUtterance).__palabritasUtterance = null;
      }

      if (onEnd) {
        onEnd();
      }
    };

    utterance.onend = finish;
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis event:', e.error);
      }
      finish();
    };

    // Watchdog for Chromium: Chrome pauses speech if utterance takes > 14 seconds
    speechWatchdogInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        if (speechWatchdogInterval) clearInterval(speechWatchdogInterval);
        return;
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 5000);

    // Safety timeout: If browser drops onend, don't block user flow
    const safeDurationMs = Math.max(2200, text.length * 130);
    fallbackTimer = setTimeout(() => {
      finish();
    }, safeDurationMs);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis fallback error:', err);
    if (onEnd) onEnd();
  }
}

/**
 * Pronounce Spanish text using High-Definition Audio Stream with automatic SpeechSynthesis fallback
 */
export function speakSpanish(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  // Ensure audio is unlocked
  unlockAudio();

  const cleanText = text.trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Clear any existing pending timeouts
  if (pendingSpeechTimeout) {
    clearTimeout(pendingSpeechTimeout);
    pendingSpeechTimeout = null;
  }
  if (activeVoiceAudioTimeout) {
    clearTimeout(activeVoiceAudioTimeout);
    activeVoiceAudioTimeout = null;
  }

  let finished = false;
  const safeFinish = () => {
    if (finished) return;
    finished = true;
    if (activeVoiceAudioTimeout) {
      clearTimeout(activeVoiceAudioTimeout);
      activeVoiceAudioTimeout = null;
    }
    if (onEnd) onEnd();
  };

  // Build audio stream URLs (Primary: Nginx proxy, Secondary: Direct Google TTS)
  const lang = voiceAccent === 'castellano' ? 'es-ES' : 'es';
  const encoded = encodeURIComponent(cleanText);
  const primaryUrl = `/api/tts?q=${encoded}&tl=${lang}`;
  const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encoded}`;

  // If text is manageable for audio streaming (<= 150 characters), use real audio stream
  if (cleanText.length <= 150) {
    try {
      if (!voiceAudioElement) {
        voiceAudioElement = new Audio();
      }

      // Stop any existing audio or speech synthesis
      try {
        voiceAudioElement.pause();
        voiceAudioElement.currentTime = 0;
      } catch {
        // Ignore
      }

      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Ignore
        }
      }

      voiceAudioElement.playbackRate = speechSpeed === 'lenta' ? 0.85 : 1.0;

      let directTried = false;

      voiceAudioElement.onended = () => {
        safeFinish();
      };

      voiceAudioElement.onerror = () => {
        if (!directTried) {
          directTried = true;
          if (voiceAudioElement) {
            voiceAudioElement.src = directUrl;
            voiceAudioElement.play().catch(() => {
              speakWithSpeechSynthesis(cleanText, safeFinish);
            });
          }
        } else {
          speakWithSpeechSynthesis(cleanText, safeFinish);
        }
      };

      voiceAudioElement.src = primaryUrl;
      const playPromise = voiceAudioElement.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy or connection failed, attempt direct URL then speech synthesis
          if (!directTried) {
            directTried = true;
            if (voiceAudioElement) {
              voiceAudioElement.src = directUrl;
              voiceAudioElement.play().catch(() => {
                speakWithSpeechSynthesis(cleanText, safeFinish);
              });
            }
          } else {
            speakWithSpeechSynthesis(cleanText, safeFinish);
          }
        });
      }

      // Safety timeout: bounded duration ensures UI flow never hangs
      const maxAudioMs = Math.max(2500, cleanText.length * 120);
      activeVoiceAudioTimeout = setTimeout(() => {
        safeFinish();
      }, maxAudioMs);

      return;
    } catch {
      // Fall through to speech synthesis fallback
    }
  }

  // Fallback to SpeechSynthesis for longer sentences
  speakWithSpeechSynthesis(cleanText, safeFinish);
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

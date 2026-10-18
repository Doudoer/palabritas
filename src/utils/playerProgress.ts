/**
 * Player Progress & Reward System Manager for Palabritas
 * Persists child's learning journey in localStorage:
 * - Stars count
 * - Unlocked and completed worlds (sequential progression)
 * - Current active world
 * - Unlocked stickers for the album
 * - Mastered letters from calligraphy
 * - Learned written words
 * - Daily practice streaks
 */

import { WORLDS_DATA } from '../data/worldsData';

const PROGRESS_STORAGE_KEY = 'palabritas_player_progress_v3';

export interface PlayerProgress {
  starsCount: number;
  completedWorlds: number[];       // IDs of worlds completed (e.g. [1])
  currentWorldId: number;        // ID of active world (e.g. 2)
  unlockedStickers: string[];    // IDs of unlocked stickers
  masteredLetters: string[];     // Letters whose traces have been validated
  learnedWords: string[];        // Words assembled or typed successfully
  streakDays: number;
  lastPlayedDate: string;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DEFAULT_PROGRESS: PlayerProgress = {
  starsCount: 125,
  completedWorlds: [1], // Mundo 1 (Vocales) completed by default for nice onboarding
  currentWorldId: 2,  // Mundo 2 (M de Manzana) is active
  unlockedStickers: ['stk-1', 'stk-2', 'stk-3'],
  masteredLetters: ['A', 'E', 'I', 'O', 'U'],
  learnedWords: ['ALA', 'MAMA', 'OSO'],
  streakDays: 3,
  lastPlayedDate: getTodayDateString(),
};

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      savePlayerProgress(DEFAULT_PROGRESS);
      return { ...DEFAULT_PROGRESS };
    }

    const parsed: Partial<PlayerProgress> = JSON.parse(raw);
    const today = getTodayDateString();

    const completedWorlds = Array.isArray(parsed.completedWorlds) && parsed.completedWorlds.length > 0
      ? parsed.completedWorlds
      : [1];

    const maxCompleted = Math.max(0, ...completedWorlds);
    const maxPossible = WORLDS_DATA.length;
    const currentWorldId = parsed.currentWorldId || Math.min(maxPossible, maxCompleted + 1);

    const progress: PlayerProgress = {
      starsCount: typeof parsed.starsCount === 'number' ? parsed.starsCount : 125,
      completedWorlds,
      currentWorldId,
      unlockedStickers: Array.isArray(parsed.unlockedStickers) && parsed.unlockedStickers.length > 0
        ? parsed.unlockedStickers
        : ['stk-1', 'stk-2', 'stk-3'],
      masteredLetters: Array.isArray(parsed.masteredLetters) ? parsed.masteredLetters : ['A', 'E', 'I', 'O', 'U'],
      learnedWords: Array.isArray(parsed.learnedWords) ? parsed.learnedWords : ['ALA', 'MAMA', 'OSO'],
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 3,
      lastPlayedDate: today,
    };

    return progress;
  } catch (err) {
    console.error('Error loading player progress:', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('Could not save player progress to localStorage', err);
  }
}

export function addPlayerStars(amount: number): { newTotal: number; added: number } {
  const current = loadPlayerProgress();
  const newTotal = Math.max(0, current.starsCount + amount);
  current.starsCount = newTotal;
  current.lastPlayedDate = getTodayDateString();
  savePlayerProgress(current);
  return { newTotal, added: amount };
}

export function completePlayerWorld(worldId: number): {
  isNewCompletion: boolean;
  nextWorldId: number;
  newStickerId?: string;
  updatedProgress: PlayerProgress;
} {
  const current = loadPlayerProgress();
  const isNewCompletion = !current.completedWorlds.includes(worldId);

  if (isNewCompletion) {
    current.completedWorlds.push(worldId);
    current.completedWorlds.sort((a, b) => a - b);
  }

  const totalWorlds = WORLDS_DATA.length;
  const nextWorldId = Math.min(totalWorlds, worldId + 1);
  if (current.currentWorldId <= worldId) {
    current.currentWorldId = nextWorldId;
  }

  // Bonus sticker for completing a world!
  const stickerId = `stk-world-${worldId}`;
  let newStickerId: string | undefined = undefined;
  if (!current.unlockedStickers.includes(stickerId)) {
    current.unlockedStickers.push(stickerId);
    newStickerId = stickerId;
  }

  // Reward stars on world completion (20 stars for new completion, 5 for review)
  current.starsCount += isNewCompletion ? 20 : 5;
  current.lastPlayedDate = getTodayDateString();

  savePlayerProgress(current);

  return {
    isNewCompletion,
    nextWorldId,
    newStickerId,
    updatedProgress: current,
  };
}

export function claimPlayerSticker(stickerId: string): boolean {
  const current = loadPlayerProgress();
  if (current.unlockedStickers.includes(stickerId)) {
    return false;
  }
  current.unlockedStickers.push(stickerId);
  savePlayerProgress(current);
  return true;
}

export function markLetterMastered(letter: string): { isNew: boolean; totalMastered: number } {
  const upper = letter.toUpperCase();
  const current = loadPlayerProgress();
  const isNew = !current.masteredLetters.includes(upper);

  if (isNew) {
    current.masteredLetters.push(upper);
    current.starsCount += 5; // Reward 5 stars for learning a new letter stroke
    savePlayerProgress(current);
  }

  return { isNew, totalMastered: current.masteredLetters.length };
}

export function markWordLearned(word: string): { isNew: boolean; totalLearned: number } {
  const upper = word.toUpperCase();
  const current = loadPlayerProgress();
  const isNew = !current.learnedWords.includes(upper);

  if (isNew) {
    current.learnedWords.push(upper);
    current.starsCount += 5; // Reward 5 stars for spelling a new word
    savePlayerProgress(current);
  }

  return { isNew, totalLearned: current.learnedWords.length };
}

export function isWorldUnlocked(worldId: number, completedWorlds: number[]): boolean {
  if (worldId === 1) return true; // World 1 is always unlocked
  return completedWorlds.includes(worldId - 1) || completedWorlds.includes(worldId);
}

export function resetPlayerProgressForTesting(): PlayerProgress {
  savePlayerProgress(DEFAULT_PROGRESS);
  return { ...DEFAULT_PROGRESS };
}

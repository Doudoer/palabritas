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
  equippedCostume?: string;      // ID of equipped costume for Chispita (e.g. 'corona_oro')
  unlockedCostumes?: string[];   // IDs of unlocked Chispita accessories
  playerName?: string;           // Optional child's name
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
  unlockedStickers: ['stk-world-1'],
  masteredLetters: ['A', 'E', 'I', 'O', 'U'],
  learnedWords: ['ALA', 'MAMA', 'OSO'],
  streakDays: 3,
  lastPlayedDate: getTodayDateString(),
  equippedCostume: '',
  unlockedCostumes: [],
  playerName: 'Pequeño Campeón',
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
        : ['stk-world-1'],
      masteredLetters: Array.isArray(parsed.masteredLetters) ? parsed.masteredLetters : ['A', 'E', 'I', 'O', 'U'],
      learnedWords: Array.isArray(parsed.learnedWords) ? parsed.learnedWords : ['ALA', 'MAMA', 'OSO'],
      streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 3,
      lastPlayedDate: today,
      equippedCostume: typeof parsed.equippedCostume === 'string' ? parsed.equippedCostume : '',
      unlockedCostumes: Array.isArray(parsed.unlockedCostumes) ? parsed.unlockedCostumes : [],
      playerName: typeof parsed.playerName === 'string' && parsed.playerName ? parsed.playerName : 'Pequeño Campeón',
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

export function buyPlayerCostume(costumeId: string, cost: number): { success: boolean; newTotalStars: number; message: string } {
  const current = loadPlayerProgress();
  if (current.unlockedCostumes?.includes(costumeId)) {
    return { success: true, newTotalStars: current.starsCount, message: '¡Ya tienes este accesorio!' };
  }
  if (current.starsCount < cost) {
    return { success: false, newTotalStars: current.starsCount, message: `Necesitas ${cost} estrellas para desbloquearlo.` };
  }

  current.starsCount -= cost;
  current.unlockedCostumes = [...(current.unlockedCostumes || []), costumeId];
  current.equippedCostume = costumeId;
  savePlayerProgress(current);

  return { success: true, newTotalStars: current.starsCount, message: '¡Accesorio desbloqueado y equipado!' };
}

export function equipPlayerCostume(costumeId: string): void {
  const current = loadPlayerProgress();
  current.equippedCostume = current.equippedCostume === costumeId ? '' : costumeId;
  savePlayerProgress(current);
}

export function setPlayerName(name: string): void {
  const current = loadPlayerProgress();
  current.playerName = name.trim() || 'Pequeño Campeón';
  savePlayerProgress(current);
}

export function calculatePlayerLevel(stars: number, completedWorldsCount: number): {
  level: number;
  title: string;
  progressPercent: number;
  nextLevelThreshold: number;
} {
  // Levels based on both stars and completed worlds
  if (completedWorldsCount >= 15 || stars >= 350) {
    return { level: 5, title: 'Gran Sabio de las Palabras', progressPercent: 100, nextLevelThreshold: 400 };
  }
  if (completedWorldsCount >= 8 || stars >= 220) {
    const pct = Math.min(99, Math.round(((stars - 220) / (350 - 220)) * 100));
    return { level: 4, title: 'Maestro de la Lectura', progressPercent: Math.max(15, pct), nextLevelThreshold: 350 };
  }
  if (completedWorldsCount >= 4 || stars >= 130) {
    const pct = Math.min(99, Math.round(((stars - 130) / (220 - 130)) * 100));
    return { level: 3, title: 'Lector Aventurero', progressPercent: Math.max(15, pct), nextLevelThreshold: 220 };
  }
  if (completedWorldsCount >= 2 || stars >= 60) {
    const pct = Math.min(99, Math.round(((stars - 60) / (130 - 60)) * 100));
    return { level: 2, title: 'Detective de Letras', progressPercent: Math.max(15, pct), nextLevelThreshold: 130 };
  }
  const pct = Math.min(99, Math.round((stars / 60) * 100));
  return { level: 1, title: 'Explorador Novato', progressPercent: Math.max(10, pct), nextLevelThreshold: 60 };
}

export function resetPlayerProgressForTesting(): PlayerProgress {
  savePlayerProgress(DEFAULT_PROGRESS);
  return { ...DEFAULT_PROGRESS };
}


/**
 * Daily Progress & Reset System for Palabritas
 * Recurrente para niñas de 6 años:
 * - Registra la fecha de hoy.
 * - Si es un nuevo día, reinicia las misiones diarias automáticamente.
 * - Registra qué mundos y qué ejercicios se han completado hoy (1 vez por día).
 * - Permite modo práctica libre o reinicio manual para los padres.
 */

export interface DailyProgressState {
  dateKey: string; // "YYYY-MM-DD"
  completedWorldsToday: number[]; // World IDs completed today
  completedExercisesToday: string[]; // e.g. "world-2-construye", "world-2-caza"
  streakDays: number;
  lastCompletedDate?: string;
}

const STORAGE_KEY = 'palabritas_daily_progress_v2';

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSpanishFormattedDate(): string {
  const d = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  const str = d.toLocaleDateString('es-ES', options);
  // Capitalize first letter
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function loadDailyProgress(): DailyProgressState {
  const todayKey = getTodayDateKey();
  const defaultState: DailyProgressState = {
    dateKey: todayKey,
    completedWorldsToday: [],
    completedExercisesToday: [],
    streakDays: 3, // Default playful start for demo
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }

    const parsed: DailyProgressState = JSON.parse(raw);
    if (parsed.dateKey !== todayKey) {
      // It's a new day! Automatic daily reset of daily exercises
      const isConsecutiveDay = checkConsecutiveDay(parsed.dateKey, todayKey);
      const newStreak = isConsecutiveDay ? parsed.streakDays + 1 : Math.max(1, parsed.streakDays);

      const resetState: DailyProgressState = {
        dateKey: todayKey,
        completedWorldsToday: [],
        completedExercisesToday: [],
        streakDays: newStreak,
        lastCompletedDate: parsed.dateKey,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
      return resetState;
    }

    return parsed;
  } catch {
    return defaultState;
  }
}

export function saveDailyProgress(state: DailyProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving daily progress:', e);
  }
}

export function markWorldCompletedToday(worldId: number): DailyProgressState {
  const current = loadDailyProgress();
  if (!current.completedWorldsToday.includes(worldId)) {
    current.completedWorldsToday.push(worldId);
  }
  saveDailyProgress(current);
  return current;
}

export function markExerciseCompletedToday(exerciseId: string): DailyProgressState {
  const current = loadDailyProgress();
  if (!current.completedExercisesToday.includes(exerciseId)) {
    current.completedExercisesToday.push(exerciseId);
  }
  saveDailyProgress(current);
  return current;
}

export function resetTodayProgressManually(): DailyProgressState {
  const todayKey = getTodayDateKey();
  const resetState: DailyProgressState = {
    dateKey: todayKey,
    completedWorldsToday: [],
    completedExercisesToday: [],
    streakDays: 3,
  };
  saveDailyProgress(resetState);
  return resetState;
}

function checkConsecutiveDay(prevDateStr: string, todayStr: string): boolean {
  try {
    const prev = new Date(prevDateStr);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
}

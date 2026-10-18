/**
 * Daily Progress & Recurrence Manager for Palabritas
 * Enforces once-per-day practice per world, daily midnight resets,
 * daily streak counter, and weekday-based exercise rotation (5 types).
 */

export type ExerciseType = 'auditivo' | 'silabas' | 'trazos' | 'rimas' | 'cuento';

export interface DailyExerciseMode {
  id: ExerciseType;
  dayName: string;
  weekdayNumber: number; // 1 = Lunes, 2 = Martes, etc.
  title: string;
  tagline: string;
  icon: string;
  emoji: string;
  badgeColor: string;
}

export const EXERCISE_MODES: DailyExerciseMode[] = [
  {
    id: 'auditivo',
    dayName: 'Lunes',
    weekdayNumber: 1,
    title: 'Discriminación Auditiva y Fonema',
    tagline: '¡Entrena el oído! Escucha atentamente y descubre los sonidos escondidos.',
    icon: 'hearing',
    emoji: '👂',
    badgeColor: 'bg-[#c9e6ff] text-[#001e2f] border-[#89ceff]',
  },
  {
    id: 'silabas',
    dayName: 'Martes',
    weekdayNumber: 2,
    title: 'Sílabas y Construcción de Palabras',
    tagline: '¡Junta las piezas! Combina sílabas mágicas para formar palabras.',
    icon: 'extension',
    emoji: '🧩',
    badgeColor: 'bg-[#ffddb8] text-[#613b00] border-[#f59e0b]',
  },
  {
    id: 'trazos',
    dayName: 'Miércoles',
    weekdayNumber: 3,
    title: 'Trazo Guiado y Caligrafía Táctil',
    tagline: '¡Dibuja con soltura! Sigue las flechas y traza la letra en la pizarra.',
    icon: 'draw',
    emoji: '✍️',
    badgeColor: 'bg-[#dcfce7] text-[#00714d] border-[#4edea3]',
  },
  {
    id: 'rimas',
    dayName: 'Jueves',
    weekdayNumber: 4,
    title: 'Conciencia Fonológica y Rimas',
    tagline: '¡Juego de rimas! ¿Qué palabra termina con el mismo soniquete?',
    icon: 'music_note',
    emoji: '🎵',
    badgeColor: 'bg-[#f3e8ff] text-[#581c87] border-[#c084fc]',
  },
  {
    id: 'cuento',
    dayName: 'Viernes',
    weekdayNumber: 5,
    title: 'Lectura Comprensiva y Mini-Cuento',
    tagline: '¡Hora de leer! Lee la historia ilustrada de Chispita y responde al reto.',
    icon: 'menu_book',
    emoji: '📖',
    badgeColor: 'bg-[#fee2e2] text-[#991b1b] border-[#f87171]',
  },
];

const STORAGE_KEY = 'palabritas_daily_progress_v1';

export interface StoredDailyProgress {
  lastDateStr: string; // YYYY-MM-DD
  completedWorldsToday: number[]; // world IDs completed on this date
  completedExercisesToday: string[]; // e.g. "world-2-silabas"
  streakDays: number;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayWeekdayInfo(): DailyExerciseMode {
  const now = new Date();
  let dayIdx = now.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  if (dayIdx === 0) dayIdx = 7; // Sunday

  if (dayIdx >= 1 && dayIdx <= 5) {
    return EXERCISE_MODES[dayIdx - 1];
  }
  // Weekend: default to playful review
  return {
    id: 'silabas',
    dayName: dayIdx === 6 ? 'Sábado' : 'Domingo',
    weekdayNumber: dayIdx,
    title: 'Desafío Estrella de Fin de Semana',
    tagline: '¡Repaso divertido con Chispita! Puedes practicar el reto que más te guste.',
    icon: 'stars',
    emoji: '🌟',
    badgeColor: 'bg-[#fef3c7] text-[#855300] border-[#f59e0b]',
  };
}

export function loadDailyProgress(): StoredDailyProgress {
  const today = getTodayDateString();
  const defaultState: StoredDailyProgress = {
    lastDateStr: today,
    completedWorldsToday: [],
    completedExercisesToday: [],
    streakDays: 3,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      return defaultState;
    }

    const parsed: StoredDailyProgress = JSON.parse(raw);
    if (parsed.lastDateStr !== today) {
      // Date changed! Midnight reset: wipe daily completed worlds, advance streak
      const newStreak = parsed.completedWorldsToday.length > 0 ? parsed.streakDays + 1 : parsed.streakDays;
      const resetState: StoredDailyProgress = {
        lastDateStr: today,
        completedWorldsToday: [],
        completedExercisesToday: [],
        streakDays: newStreak,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
      return resetState;
    }

    return parsed;
  } catch {
    return defaultState;
  }
}

export function saveDailyProgress(state: StoredDailyProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in sandbox
  }
}

export function markWorldCompletedToday(worldId: number, exerciseType: ExerciseType = 'silabas'): StoredDailyProgress {
  const current = loadDailyProgress();
  const worldKey = `world-${worldId}-${exerciseType}`;

  const updatedWorlds = current.completedWorldsToday.includes(worldId)
    ? current.completedWorldsToday
    : [...current.completedWorldsToday, worldId];

  const updatedExercises = current.completedExercisesToday.includes(worldKey)
    ? current.completedExercisesToday
    : [...current.completedExercisesToday, worldKey];

  const updated: StoredDailyProgress = {
    ...current,
    completedWorldsToday: updatedWorlds,
    completedExercisesToday: updatedExercises,
  };

  saveDailyProgress(updated);
  return updated;
}

export function isWorldCompletedToday(worldId: number): boolean {
  const current = loadDailyProgress();
  return current.completedWorldsToday.includes(worldId);
}

export function resetTodayPracticeForTesting(): StoredDailyProgress {
  const today = getTodayDateString();
  const reset: StoredDailyProgress = {
    lastDateStr: today,
    completedWorldsToday: [],
    completedExercisesToday: [],
    streakDays: 3,
  };
  saveDailyProgress(reset);
  return reset;
}

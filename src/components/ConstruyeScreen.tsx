import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ALPHABET_DATA, LetterExercise } from '../data/alphabetData';
import { ASSETS } from '../data/appData';
import { WORLDS_DATA, WorldLevel } from '../data/worldsData';
import {
  TWENTY_WORLD_EXERCISES,
  WorldDayExercises,
  getCurrentDayTheme,
  WEEKLY_DAY_THEMES,
  ExerciseTypeKey,
} from '../data/exercisesData';
import {
  loadDailyProgress,
  markWorldCompletedToday,
  markExerciseCompletedToday,
  getSpanishFormattedDate,
} from '../utils/dailyTracker';
import { playPop, playFanfare, playWiggleError, speakSpanish, triggerHaptic, playSparkleChime } from '../utils/audio';
import { validateLetterDrawing, CalligraphyValidationResult } from '../utils/calligraphyValidator';
import { markWordLearned } from '../utils/playerProgress';

interface ConstruyeScreenProps {
  onBackToMap: () => void;
  onOpenCelebration: () => void;
  onAddStars: (amount: number) => void;
  initialLetterIndex?: number;
  initialFilter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas';
  currentWorldId?: number;
  onCompleteWorld?: (worldId: number) => void;
}

const COMMON_SYLLABLES_POOL = [
  'MA', 'ME', 'MI', 'MO', 'MU',
  'PA', 'PE', 'PI', 'PO', 'PU',
  'SA', 'SE', 'SI', 'SO', 'SU',
  'LA', 'LE', 'LI', 'LO', 'LU',
  'TA', 'TE', 'TI', 'TO', 'TU',
  'DA', 'DE', 'DI', 'DO', 'DU',
  'NA', 'NE', 'NI', 'NO', 'NU',
  'RA', 'RE', 'RI', 'RO', 'RU',
  'CA', 'CO', 'CU', 'CE', 'CI',
  'BA', 'BE', 'BI', 'BO', 'BU',
  'VA', 'VE', 'VI', 'VO', 'VU',
  'GA', 'GO', 'GU', 'GE', 'GI',
  'FA', 'FE', 'FI', 'FO', 'FU',
  'JA', 'JE', 'JI', 'JO', 'JU',
  'ZA', 'ZO', 'ZU',
  'ÑAN', 'BAR', 'ES', 'IS', 'SOL',
];

const COMMON_LETTERS_POOL = [
  'A', 'E', 'I', 'O', 'U',
  'M', 'P', 'S', 'L', 'T',
  'D', 'N', 'R', 'C', 'B',
  'V', 'G', 'F', 'J', 'Z', 'Q',
];

function generateShuffledSixOptions(correctAnswer: string, existingDistractors: string[] = []): string[] {
  const isSingleLetter = correctAnswer.length === 1;
  const pool = isSingleLetter ? COMMON_LETTERS_POOL : COMMON_SYLLABLES_POOL;

  const chosenDistractors = new Set<string>();

  for (const d of existingDistractors) {
    if (d && d.toUpperCase() !== correctAnswer.toUpperCase()) {
      chosenDistractors.add(d.toUpperCase());
    }
    if (chosenDistractors.size >= 5) break;
  }

  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  for (const item of shuffledPool) {
    if (item.toUpperCase() !== correctAnswer.toUpperCase()) {
      chosenDistractors.add(item.toUpperCase());
    }
    if (chosenDistractors.size >= 5) break;
  }

  const sixOptions = [correctAnswer.toUpperCase(), ...Array.from(chosenDistractors).slice(0, 5)];

  // Randomize placement with Fisher-Yates
  for (let i = sixOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sixOptions[i], sixOptions[j]] = [sixOptions[j], sixOptions[i]];
  }

  return sixOptions;
}

export const ConstruyeScreen: React.FC<ConstruyeScreenProps> = ({
  onBackToMap,
  onOpenCelebration,
  onAddStars,
  initialLetterIndex = 0,
  initialFilter = 'vocales',
  currentWorldId = 1,
  onCompleteWorld,
}) => {
  const [activeFilter, setActiveFilter] = useState<'vocales' | 'primeras' | 'avanzadas' | 'todas'>(initialFilter);
  const [exerciseIndex, setExerciseIndex] = useState(initialLetterIndex);
  const [activeMode, setActiveMode] = useState<ExerciseTypeKey>(() => getCurrentDayTheme().key);
  const [targetFilled, setTargetFilled] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [shakingCard, setShakingCard] = useState<string | null>(null);
  const [unlockedNextWorldTitle, setUnlockedNextWorldTitle] = useState<string | null>(null);

  // Daily tracker state
  const [dailyProgress, setDailyProgress] = useState(() => loadDailyProgress());

  // 6 options randomized for Construye
  const [currentSixOptions, setCurrentSixOptions] = useState<string[]>(() => {
    const ex = ALPHABET_DATA[initialLetterIndex] || ALPHABET_DATA[0];
    return generateShuffledSixOptions(ex.missingSyllable, ex.distractors);
  });

  // Sound Hunt state (Martes)
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);

  // Word Match state (Miércoles)
  const [matchedWordSelected, setMatchedWordSelected] = useState<string | null>(null);

  // Syllable Order state (Viernes)
  const [orderedPieces, setOrderedPieces] = useState<string[]>([]);

  // Magic Trace Canvas Ref (Jueves)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [traceStrokesCount, setTraceStrokesCount] = useState(0);
  const [trazoFeedback, setTrazoFeedback] = useState<CalligraphyValidationResult | null>(null);

  // Determine active world
  const currentWorld: WorldLevel =
    WORLDS_DATA.find(w => w.id === currentWorldId) ||
    WORLDS_DATA.find(w => w.letterIndex === exerciseIndex) ||
    WORLDS_DATA[0];

  const worldExerciseData: WorldDayExercises =
    TWENTY_WORLD_EXERCISES[currentWorld.id] || TWENTY_WORLD_EXERCISES[1];

  const currentExercise: LetterExercise = ALPHABET_DATA[exerciseIndex] || ALPHABET_DATA[0];

  const isCompletedToday = dailyProgress.completedWorldsToday.includes(currentWorld.id);

  // Sync prop changes
  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
      if (initialFilter === 'vocales') {
        const vowelIdx = ALPHABET_DATA.findIndex(l => l.group === 'vocal');
        setExerciseIndex(vowelIdx !== -1 ? vowelIdx : 0);
      }
    }
  }, [initialFilter]);

  useEffect(() => {
    if (typeof initialLetterIndex === 'number') {
      setExerciseIndex(initialLetterIndex);
    }
  }, [initialLetterIndex]);

  // When exercise or mode changes, refresh randomized options
  useEffect(() => {
    const ex = ALPHABET_DATA[exerciseIndex] || ALPHABET_DATA[0];
    setCurrentSixOptions(generateShuffledSixOptions(ex.missingSyllable, ex.distractors));
    setTargetFilled(false);
    setShowVictoryModal(false);
    setPoppedBubbles([]);
    setMatchedWordSelected(null);
    setOrderedPieces([]);
    setTraceStrokesCount(0);
    clearCanvas();
  }, [exerciseIndex, activeMode, currentWorldId]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setTrazoFeedback(null);
    setTraceStrokesCount(0);
  };

  const filteredExercises = ALPHABET_DATA.map((item, idx) => ({ ...item, originalIndex: idx })).filter(item => {
    if (activeFilter === 'vocales') return item.group === 'vocal';
    if (activeFilter === 'primeras') return item.group === 'consonante-inicial';
    if (activeFilter === 'avanzadas') return item.group === 'consonante-media' || item.group === 'consonante-avanzada';
    return true;
  });

  const currentPosInFiltered = Math.max(0, filteredExercises.findIndex(ex => ex.originalIndex === exerciseIndex));

  // Handle successful completion of any exercise
  const triggerVictory = (praiseMsg: string) => {
    playFanfare();
    triggerHaptic([40, 50, 80]);
    speakSpanish(praiseMsg);

    // Save in daily tracker
    const updatedDaily = markWorldCompletedToday(currentWorld.id);
    markExerciseCompletedToday(`world-${currentWorld.id}-${activeMode}`);
    setDailyProgress(updatedDaily);

    if (onCompleteWorld) {
      onCompleteWorld(currentWorld.id);
    }
    markWordLearned(currentExercise.exampleWord);

    const nextWorld = WORLDS_DATA.find(w => w.id === currentWorld.id + 1);
    if (nextWorld) {
      setUnlockedNextWorldTitle(`${nextWorld.numberLabel}: ${nextWorld.title}`);
    }

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#ffd0bb'],
    });

    onAddStars(10);
    setTimeout(() => {
      setShowVictoryModal(true);
    }, 600);
  };

  // MODE 1: Construye la palabra
  const handleSelectSyllable = (syllable: string) => {
    if (syllable.toUpperCase() === currentExercise.missingSyllable.toUpperCase()) {
      setTargetFilled(true);
      playPop(580);
      triggerVictory(`¡Excelente! ¡${currentExercise.exampleWord}!`);
    } else {
      playWiggleError();
      triggerHaptic([50, 40, 50]);
      setShakingCard(syllable);
      speakSpanish('¡Casi! Escucha bien e intenta otra vez');
      setTimeout(() => setShakingCard(null), 500);
    }
  };

  // MODE 2: Caza de sonidos
  const handlePopBubble = (bubbleIdx: number, isCorrect: boolean, bubbleText: string) => {
    if (poppedBubbles.includes(bubbleIdx)) return;

    if (isCorrect) {
      playPop(520 + bubbleIdx * 30);
      triggerHaptic(20);
      const nextPopped = [...poppedBubbles, bubbleIdx];
      setPoppedBubbles(nextPopped);
      speakSpanish(bubbleText);

      // Check if all correct bubbles popped
      const correctCount = worldExerciseData.soundBubbles.filter(b => b.isCorrect).length;
      if (nextPopped.length >= correctCount) {
        triggerVictory(`¡Atrapaste todos los sonidos ${worldExerciseData.soundTarget}! ¡Qué oído tan genial!`);
      }
    } else {
      playWiggleError();
      triggerHaptic([40, 40]);
      speakSpanish(`Esa es ${bubbleText}. Busca el sonido ${worldExerciseData.soundTarget}.`);
    }
  };

  // MODE 3: Une palabra con imagen
  const handleSelectWordMatch = (wordOption: string) => {
    setMatchedWordSelected(wordOption);
    if (wordOption.toUpperCase() === worldExerciseData.targetWord.toUpperCase()) {
      playPop(600);
      triggerVictory(`¡Correcto! ¡Es ${worldExerciseData.targetWord}!`);
    } else {
      playWiggleError();
      speakSpanish(`Leíste ${wordOption}. ¿Dónde dice ${worldExerciseData.targetWord}?`);
    }
  };

  // MODE 4: Trazo Mágico (canvas drawing con validación de caligrafía)
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setTrazoFeedback(prev => (prev && !prev.isValid ? null : prev));
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      setTraceStrokesCount(prev => prev + 1);
    }
  };

  const handleVerifyTrazoMagico = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const result = validateLetterDrawing(canvas, {
      svgPath: currentExercise.upperPath,
      letterChar: currentExercise.letter,
      toleranceRadius: 28,
      minCoverageThreshold: 0.48,
      maxScribbleRatio: 0.44,
    });

    setTrazoFeedback(result);

    if (!result.isValid) {
      playWiggleError();
      triggerHaptic([35, 45]);
      speakSpanish(result.message + (result.hint ? ' ' + result.hint : ''));
      return;
    }

    // Trazo correcto verificado
    triggerVictory(result.message);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#f59e0b';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // MODE 5: Ordena las sílabas
  const handlePieceClick = (piece: string) => {
    playPop(480);
    triggerHaptic(15);
    const updated = [...orderedPieces, piece];
    setOrderedPieces(updated);

    const fullFormed = updated.join('');
    const targetFull = worldExerciseData.syllables.join('');

    if (fullFormed.toUpperCase() === targetFull.toUpperCase()) {
      triggerVictory(`¡Palabra armada con éxito: ${worldExerciseData.targetWord}!`);
    } else if (updated.length >= worldExerciseData.syllables.length) {
      playWiggleError();
      speakSpanish('El orden no es el correcto. ¡Inténtalo de nuevo!');
      setTimeout(() => setOrderedPieces([]), 800);
    }
  };

  const handleNextWord = () => {
    playPop(480);
    triggerHaptic(20);
    setShowVictoryModal(false);
    setTargetFilled(false);

    if (currentPosInFiltered < filteredExercises.length - 1) {
      const nextItem = filteredExercises[currentPosInFiltered + 1];
      setExerciseIndex(nextItem.originalIndex);
      speakSpanish(`Siguiente: ${nextItem.exampleWord}`);
    } else {
      onOpenCelebration();
    }
  };

  const handleChooseLetter = (idx: number) => {
    playPop(440);
    triggerHaptic(15);
    setExerciseIndex(idx);
    setTargetFilled(false);
    setShowVictoryModal(false);
    speakSpanish(`Palabra con ${ALPHABET_DATA[idx].letter}: ${ALPHABET_DATA[idx].exampleWord}`);
  };

  const handleFilterChange = (filter: 'vocales' | 'primeras' | 'avanzadas' | 'todas') => {
    playPop(420);
    triggerHaptic(15);
    setActiveFilter(filter);
    const matching = ALPHABET_DATA.map((item, idx) => ({ ...item, originalIndex: idx })).filter(item => {
      if (filter === 'vocales') return item.group === 'vocal';
      if (filter === 'primeras') return item.group === 'consonante-inicial';
      if (filter === 'avanzadas') return item.group === 'consonante-media' || item.group === 'consonante-avanzada';
      return true;
    });

    if (matching.length > 0) {
      setExerciseIndex(matching[0].originalIndex);
      setTargetFilled(false);
      setShowVictoryModal(false);
    }
  };

  const getImageForExercise = (ex: LetterExercise) => {
    if (ex.letter === 'M') return ASSETS.tableCharacter;
    if (ex.letter === 'S') return ASSETS.soupCard;
    if (ex.letter === 'R') return ASSETS.frogCard;
    if (ex.letter === 'O') return ASSETS.storybookBear;
    return null;
  };

  const customImg = getImageForExercise(currentExercise);
  const currentDayTheme = getCurrentDayTheme();

  return (
    <div className="flex flex-col w-full relative select-none pb-8">
      {/* Top Bar Navigation & Progress */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          onClick={() => {
            playPop(380);
            triggerHaptic(15);
            onBackToMap();
          }}
          aria-label="Volver al mapa"
          className="w-12 h-12 rounded-2xl bg-[#ffe2d6] text-[#534434] flex items-center justify-center shadow-[0_4px_0_0_#ffdbcc] active:translate-y-1 active:shadow-[0_1px_0_0_#ffdbcc] transition-all cursor-pointer border border-[#ffd0bb]"
          type="button"
        >
          <span className="material-symbols-outlined text-[26px] text-[#855300]">arrow_back</span>
        </button>

        <div className="flex-1 flex flex-col px-1.5">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-[#351000] font-black flex items-center gap-1">
              <span className="material-symbols-outlined text-[#f59e0b] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
              {currentWorld.numberLabel}: {currentWorld.targetWord}
            </span>

            {/* Daily completion badge */}
            {isCompletedToday ? (
              <span className="text-[10px] font-black bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                HOY SUPERADO
              </span>
            ) : (
              <span className="text-[10px] font-black bg-[#fef3c7] text-[#855300] px-2 py-0.5 rounded-full border border-[#fde68a] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                RETO DE HOY
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-[#ffeae1] rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#f59e0b] to-[#6cf8bb] rounded-full shadow-[0_2px_0_0_#d97706] transition-all duration-500"
              style={{ width: `${Math.min(100, ((currentPosInFiltered + 1) / filteredExercises.length) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Helper Quick Toggle */}
        <button
          onClick={() => {
            playPop(400);
            speakSpanish(`Hoy es ${getSpanishFormattedDate()}. Reto: ${worldExerciseData.targetWord}.`);
          }}
          aria-label="Repetir indicación"
          className="w-12 h-12 rounded-2xl bg-[#ffe2d6] flex items-center justify-center text-[#855300] shadow-[0_4px_0_0_#ffdbcc] active:translate-y-1 active:shadow-[0_1px_0_0_#ffdbcc] transition-all cursor-pointer border border-[#ffd0bb]"
          type="button"
        >
          <span className="material-symbols-outlined text-[24px]">hearing</span>
        </button>
      </div>

      {/* 5 DIFFERENT EXERCISE TYPES - WEEKLY ROTATION TABS */}
      <div className="flex flex-col gap-1.5 mb-3 bg-[#fff1eb] p-2.5 rounded-2xl border-2 border-[#ffd0bb] shadow-sm">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#855300]">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>5 Retos Semanales (Varían por Día):</span>
          </div>
          <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full border border-[#ffd0bb] text-[#855300]">
            {getSpanishFormattedDate()}
          </span>
        </div>

        {/* 5 Exercise Mode Pills */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {[
            { key: 'construye' as ExerciseTypeKey, label: 'Lunes', title: 'Construye', icon: 'extension', isToday: currentDayTheme.key === 'construye' },
            { key: 'caza' as ExerciseTypeKey, label: 'Martes', title: 'Caza', icon: 'bubble_chart', isToday: currentDayTheme.key === 'caza' },
            { key: 'asocia' as ExerciseTypeKey, label: 'Miércoles', title: 'Une', icon: 'style', isToday: currentDayTheme.key === 'asocia' },
            { key: 'trazo' as ExerciseTypeKey, label: 'Jueves', title: 'Trazo', icon: 'draw', isToday: currentDayTheme.key === 'trazo' },
            { key: 'ordena' as ExerciseTypeKey, label: 'Viernes', title: 'Ordena', icon: 'sort', isToday: currentDayTheme.key === 'ordena' },
          ].map(tab => {
            const isSelected = activeMode === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  playPop(450);
                  triggerHaptic(15);
                  setActiveMode(tab.key);
                }}
                type="button"
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-center cursor-pointer transition-all border relative ${
                  isSelected
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706] scale-102 border-[#d97706] font-black'
                    : 'bg-white text-[#534434] hover:bg-[#ffeae1] border-[#ffd0bb] font-bold'
                }`}
              >
                {tab.isToday && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                    ●
                  </span>
                )}
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span className="text-[10px] leading-tight mt-0.5">{tab.label}</span>
                <span className="text-[8px] opacity-80 leading-none">{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selector de Categoría + Letras Filtradas (para navegar palabras) */}
      <div className="flex flex-col gap-1.5 mb-3 bg-white p-2.5 rounded-2xl border border-[#ffd0bb] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[11px] font-bold text-[#855300]">Explorar letras:</span>
          <div className="flex flex-wrap gap-1 text-[11px] font-bold">
            {[
              { id: 'vocales', label: '✨ Vocales' },
              { id: 'primeras', label: '🏖️ M, P, S, L' },
              { id: 'avanzadas', label: '🚀 Avanzadas' },
              { id: 'todas', label: '📚 Todas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id as typeof activeFilter)}
                className={`px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                  activeFilter === f.id
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_2px_0_0_#d97706]'
                    : 'bg-white text-[#534434] hover:bg-[#ffe2d6] border border-[#ffd0bb]'
                }`}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fila horizontal de letras filtradas */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {filteredExercises.map(item => {
            const isSelected = item.originalIndex === exerciseIndex;
            return (
              <button
                key={item.letter}
                onClick={() => handleChooseLetter(item.originalIndex)}
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-bold text-sm shrink-0 cursor-pointer transition-transform border-2 ${
                  isSelected
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706] scale-105 border-[#d97706]'
                    : 'bg-white text-[#351000] border-[#ffd0bb] hover:bg-[#ffeae1]'
                }`}
                type="button"
              >
                <span>{item.letter}</span>
                <span className="text-[10px] leading-none opacity-80">{item.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ARENA CENTRAL DEL EJERCICIO SEGÚN EL MODO SELECCIONADO */}
      {/* ============================================================== */}

      {/* --- MODO 1 (LUNES): CONSTRUYE LA PALABRA CON 6 FICHAS ALEATORIAS --- */}
      {activeMode === 'construye' && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full bg-white rounded-3xl p-4 shadow-[0_8px_0_0_#ffdbcc] flex flex-col items-center relative overflow-hidden mb-3 border-2 border-[#ffdbcc]/70">
            {/* Mascot Banner */}
            <div className="w-full bg-[#fff1eb] rounded-2xl p-2.5 mb-2.5 flex items-center gap-2.5 border border-[#ffd0bb]">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center text-[#f59e0b]">
                <span className="material-symbols-outlined text-[22px]">extension</span>
              </div>
              <p className="text-xs text-[#534434] font-bold leading-tight">
                Elige la ficha correcta entre las 6 opciones para formar <strong className="text-[#855300] text-sm">{currentExercise.exampleWord}</strong>.
              </p>
            </div>

            {/* Target Illustration */}
            <div className="relative w-36 h-32 flex items-center justify-center mb-2">
              {customImg ? (
                <img
                  alt={currentExercise.exampleWord}
                  className="w-full h-full object-contain drop-shadow-[0_6px_10px_rgba(133,83,0,0.12)]"
                  src={customImg}
                />
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-100 to-orange-50 flex flex-col items-center justify-center border-2 border-[#ffd0bb]">
                  <span className="text-5xl filter drop-shadow-md">{currentExercise.emoji}</span>
                  <span className="text-xs font-bold text-[#855300] mt-1 bg-white/80 px-2 py-0.5 rounded-full">
                    {currentExercise.exampleWord}
                  </span>
                </div>
              )}
            </div>

            {/* Sound Audio Bar */}
            <button
              onClick={() => {
                playPop(480);
                speakSpanish(`${currentExercise.missingSyllable}... ${currentExercise.givenSyllable}... ${currentExercise.exampleWord}`);
              }}
              type="button"
              className="w-full max-w-[280px] h-12 bg-[#42bbff] hover:bg-[#89ceff] rounded-full flex items-center justify-center gap-2 px-4 shadow-[0_4px_0_0_#006591] active:translate-y-1 active:shadow-none transition-all mb-3 cursor-pointer text-white font-bold"
            >
              <span className="material-symbols-outlined text-[24px]">volume_up</span>
              <span>Escuchar: /{currentExercise.syllablesWord}/</span>
            </button>

            {/* Phonic Slots */}
            <div className="w-full flex items-center justify-center gap-3 mb-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-24 h-22 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    targetFilled
                      ? 'bg-[#6cf8bb] shadow-[0_6px_0_0_#4edea3] border-[#4edea3]'
                      : 'bg-[#ffeae1] shadow-inner border-dashed border-[#d8c3ad]'
                  }`}
                >
                  {!targetFilled ? (
                    <span className="text-3xl text-[#867461] font-extrabold animate-pulse">?</span>
                  ) : (
                    <span className="text-2xl text-[#00714d] font-black">{currentExercise.missingSyllable}</span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-[#855300]">
                  {targetFilled ? '¡Listo!' : '¡Coloca aquí!'}
                </span>
              </div>

              <div className="text-[#d8c3ad] font-bold text-xl pb-4">
                <span className="material-symbols-outlined text-[28px]">add</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-24 h-22 rounded-2xl bg-[#ffe2d6] shadow-[0_6px_0_0_#ffd0bb] flex items-center justify-center border-2 border-[#ffd0bb]">
                  <span className="text-2xl font-black text-[#613b00]">{currentExercise.givenSyllable}</span>
                </div>
                <span className="text-[11px] text-[#534434] font-bold">Base</span>
              </div>
            </div>
          </div>

          {/* 6 Randomized Option Chips */}
          <div className="w-full bg-[#ffeae1] rounded-3xl p-3.5 shadow-[0_8px_0_0_#ffdbcc] flex flex-col items-center border-2 border-[#ffdbcc]">
            <span className="text-xs text-[#351000] font-black mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#855300]">touch_app</span>
              Toca la opción correcta entre las 6 fichas:
            </span>

            <div className="w-full grid grid-cols-3 gap-2.5">
              {currentSixOptions.map((syl, optIdx) => {
                const isTarget = syl.toUpperCase() === currentExercise.missingSyllable.toUpperCase();
                const isShaking = shakingCard === syl;
                return (
                  <button
                    key={`${syl}-${optIdx}`}
                    onClick={() => handleSelectSyllable(syl)}
                    disabled={targetFilled && isTarget}
                    type="button"
                    className={`h-20 bg-white rounded-2xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer border-2 ${
                      isShaking ? 'translate-x-2 border-red-400 bg-red-50' : 'border-[#ffdbcc]'
                    } ${
                      targetFilled && isTarget
                        ? 'opacity-40 pointer-events-none'
                        : 'shadow-[0_5px_0_0_#ffb95f] active:translate-y-1 active:shadow-[0_1px_0_0_#ffb95f]'
                    }`}
                  >
                    <span className="text-2xl font-black text-[#613b00]">{syl}</span>
                    <span className="text-[10px] text-[#f59e0b] font-bold mt-0.5">/{syl.toLowerCase()}/</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODO 2 (MARTES): CAZA DE SONIDOS Y LETRAS (BURBUJAS TÁCTILES) --- */}
      {activeMode === 'caza' && (
        <div className="w-full bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd]/50 rounded-3xl p-4 shadow-[0_8px_0_0_#7dd3fc] border-2 border-[#7dd3fc] flex flex-col items-center">
          <div className="w-full bg-white/90 rounded-2xl p-3 mb-3 border border-[#bae6fd] flex items-center gap-2.5 shadow-xs">
            <span className="text-3xl">🫧</span>
            <div>
              <span className="text-[10px] font-black text-[#0369a1] uppercase block">Reto del Martes: Caza de Sonidos</span>
              <p className="text-xs text-[#0c4a6e] font-bold">
                {worldExerciseData.soundPrompt}
              </p>
            </div>
          </div>

          {/* Sound Prompt Play Button */}
          <button
            onClick={() => speakSpanish(worldExerciseData.soundPrompt)}
            type="button"
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-full font-bold text-xs shadow-sm flex items-center gap-1.5 mb-4 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
            <span>Escuchar sonido objetivo /{worldExerciseData.soundTarget.toLowerCase()}/</span>
          </button>

          {/* 6 Bubbles Floating Grid */}
          <div className="w-full grid grid-cols-3 gap-3.5 py-2">
            {worldExerciseData.soundBubbles.map((bubble, bIdx) => {
              const isPopped = poppedBubbles.includes(bIdx);
              return (
                <button
                  key={bIdx}
                  onClick={() => handlePopBubble(bIdx, bubble.isCorrect, bubble.text)}
                  disabled={isPopped}
                  type="button"
                  className={`h-24 rounded-3xl flex flex-col items-center justify-center p-2 transition-all cursor-pointer border-3 relative ${
                    isPopped
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800 scale-95 shadow-inner'
                      : 'bg-white border-[#38bdf8] text-[#0369a1] shadow-[0_6px_0_0_#0284c7] hover:scale-105 active:translate-y-1'
                  }`}
                >
                  {isPopped ? (
                    <>
                      <span className="text-3xl font-black">{bubble.text}</span>
                      <span className="text-[10px] font-black text-emerald-700">¡ATRAPADA! ⭐</span>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-black">{bubble.text}</span>
                      <span className="text-[10px] font-bold text-[#0284c7] mt-1">🫧 Tocar</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs font-bold text-[#0369a1] flex items-center gap-1 bg-white/70 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-[16px]">stars</span>
            Atrapadas: {poppedBubbles.length} de {worldExerciseData.soundBubbles.filter(b => b.isCorrect).length} correctas
          </div>
        </div>
      )}

      {/* --- MODO 3 (MIÉRCOLES): UNE PALABRA CON IMAGEN --- */}
      {activeMode === 'asocia' && (
        <div className="w-full bg-[#f0fdf4] rounded-3xl p-4 shadow-[0_8px_0_0_#86efac] border-2 border-[#86efac] flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl p-3 mb-3 border border-[#bbf7d0] flex items-center gap-2.5 shadow-xs">
            <span className="text-3xl">🖼️</span>
            <div>
              <span className="text-[10px] font-black text-[#15803d] uppercase block">Reto del Miércoles: Une Palabra e Imagen</span>
              <p className="text-xs text-[#14532d] font-bold">
                {worldExerciseData.wordMatchPrompt}
              </p>
            </div>
          </div>

          {/* Central Target Image */}
          <div className="w-40 h-40 bg-white rounded-3xl shadow-sm border-2 border-[#bbf7d0] flex flex-col items-center justify-center mb-4 relative overflow-hidden">
            <span className="text-7xl filter drop-shadow-md animate-bounce">{worldExerciseData.targetEmoji}</span>
            <div className="absolute top-2 right-2 bg-[#22c55e] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
              ¿Cuál es su nombre?
            </div>
          </div>

          {/* 6 Word Cards Shuffled */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {worldExerciseData.wordMatchOptions.map((wordOpt, wIdx) => {
              const isSelected = matchedWordSelected === wordOpt;
              const isCorrect = wordOpt.toUpperCase() === worldExerciseData.targetWord.toUpperCase();
              return (
                <button
                  key={wIdx}
                  onClick={() => handleSelectWordMatch(wordOpt)}
                  type="button"
                  className={`h-16 rounded-2xl font-black text-lg transition-all cursor-pointer border-2 flex items-center justify-center p-2 ${
                    isSelected && isCorrect
                      ? 'bg-[#22c55e] text-white border-[#15803d] shadow-[0_4px_0_0_#15803d]'
                      : 'bg-white text-[#166534] border-[#bbf7d0] shadow-[0_4px_0_0_#86efac] hover:bg-[#dcfce7] active:translate-y-1'
                  }`}
                >
                  <span>{wordOpt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* --- MODO 4 (JUEVES): TRAZO MÁGICO Y GRAFOMOTRICIDAD --- */}
      {activeMode === 'trazo' && (
        <div className="w-full bg-[#faf5ff] rounded-3xl p-4 shadow-[0_8px_0_0_#d8b4fe] border-2 border-[#d8b4fe] flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl p-3 mb-3 border border-[#e9d5ff] flex items-center gap-2.5 shadow-xs">
            <span className="text-3xl">✏️</span>
            <div>
              <span className="text-[10px] font-black text-[#7e22ce] uppercase block">Reto del Jueves: Trazo Mágico</span>
              <p className="text-xs text-[#581c87] font-bold">
                {worldExerciseData.strokeGuidePrompt}
              </p>
            </div>
          </div>

          {/* Guide Steps */}
          <div className="w-full flex items-center justify-around gap-1 mb-2 bg-white/70 p-2 rounded-xl text-xs font-bold text-[#7e22ce]">
            {worldExerciseData.strokeSteps.map((step, sIdx) => (
              <span key={sIdx} className="bg-purple-100 px-2 py-0.5 rounded-full">{step}</span>
            ))}
          </div>

          {/* Interactive Drawing Blackboard Canvas */}
          <div className="relative w-full max-w-[320px] h-64 bg-white rounded-3xl border-4 border-dashed border-[#c084fc] shadow-inner overflow-hidden flex items-center justify-center touch-none">
            {/* Guide faint letter in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <span className="text-[160px] font-black text-[#f3e8ff] leading-none">
                {currentExercise.letter}
              </span>
            </div>

            <canvas
              ref={canvasRef}
              width={320}
              height={256}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            />
          </div>

          {/* Feedback de validación si no fue aprobado */}
          {trazoFeedback && !trazoFeedback.isValid && (
            <div className="w-full max-w-[320px] bg-[#fff5f5] border-2 border-[#fca5a5] rounded-2xl p-3 my-2 shadow-xs animate-wiggle">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl">
                  {trazoFeedback.status === 'scribble' ? '🧽' : trazoFeedback.status === 'incomplete' ? '✏️' : '🎨'}
                </span>
                <div className="flex-1 text-left">
                  <h5 className="text-xs font-black text-[#991b1b]">
                    {trazoFeedback.status === 'scribble'
                      ? 'Muchos garabatos fuera de la letra'
                      : trazoFeedback.status === 'incomplete'
                      ? '¡Trazo incompleto!'
                      : '¡Lienzo vacío!'}
                  </h5>
                  <p className="text-[11px] text-[#7f1d1d] font-medium leading-tight mt-0.5">
                    {trazoFeedback.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold">
                    <span className="text-[#855300]">Recorrido: {trazoFeedback.coverage}%</span>
                    <span className="text-[#855300]">• En el camino: {trazoFeedback.precision}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={clearCanvas}
              type="button"
              className="px-3.5 py-2 bg-[#f3e8ff] hover:bg-[#e9d5ff] text-[#7e22ce] font-bold text-xs rounded-xl border border-[#d8b4fe] cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Borrar y repetir
            </button>
            <button
              onClick={handleVerifyTrazoMagico}
              type="button"
              className="px-4 py-2 bg-[#9333ea] hover:bg-[#7e22ce] text-white font-black text-xs rounded-xl shadow-[0_3px_0_0_#6b21a8] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">fact_check</span>
              ¡Validar mi trazo!
            </button>
          </div>
        </div>
      )}

      {/* --- MODO 5 (VIERNES/FINDE): ORDENA LAS SÍLABAS --- */}
      {activeMode === 'ordena' && (
        <div className="w-full bg-[#fdf2f8] rounded-3xl p-4 shadow-[0_8px_0_0_#f472b6] border-2 border-[#f472b6] flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl p-3 mb-3 border border-[#fbcfe8] flex items-center gap-2.5 shadow-xs">
            <span className="text-3xl">🧩</span>
            <div>
              <span className="text-[10px] font-black text-[#be185d] uppercase block">Reto del Viernes: Ordena las Sílabas</span>
              <p className="text-xs text-[#831843] font-bold">
                Toca las piezas en el orden correcto para escribir <strong className="text-[#be185d]">{worldExerciseData.targetWord}</strong>.
              </p>
            </div>
          </div>

          {/* Destination Assembly Tray */}
          <div className="w-full bg-white rounded-2xl p-3.5 mb-4 border-2 border-dashed border-[#f472b6] flex flex-col items-center shadow-inner">
            <span className="text-xs font-bold text-[#be185d] mb-1.5">Palabra que estás formando:</span>
            <div className="flex items-center gap-2 min-h-[50px] p-1">
              {orderedPieces.length === 0 ? (
                <span className="text-sm text-[#9ca3af] font-bold">Toca las fichas de abajo en orden ➔</span>
              ) : (
                orderedPieces.map((piece, pIdx) => (
                  <span
                    key={pIdx}
                    className="px-4 py-2 bg-[#ec4899] text-white font-black text-2xl rounded-2xl shadow-[0_3px_0_0_#be185d] animate-pop-bounce"
                  >
                    {piece}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Shuffled Pieces Pool */}
          <div className="w-full flex flex-wrap items-center justify-center gap-3">
            {worldExerciseData.shuffledPieces.map((piece, pieceIdx) => (
              <button
                key={pieceIdx}
                onClick={() => handlePieceClick(piece)}
                type="button"
                className="px-5 py-3 bg-white text-[#be185d] font-black text-2xl rounded-2xl border-2 border-[#f472b6] shadow-[0_5px_0_0_#db2777] active:translate-y-1 active:shadow-none cursor-pointer hover:bg-[#fdf2f8]"
              >
                {piece}
              </button>
            ))}
          </div>

          {orderedPieces.length > 0 && (
            <button
              onClick={() => setOrderedPieces([])}
              type="button"
              className="mt-3 text-xs font-bold text-[#be185d] underline cursor-pointer"
            >
              Reiniciar piezas
            </button>
          )}
        </div>
      )}

      {/* VICTORY MODAL WITH CHISPITA */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#351000]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden border-4 border-[#ffddb8]">
            <div className="relative w-28 h-28 mb-2 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#ffddb8] rounded-full blur-md opacity-70 animate-pulse"></div>
              <img
                alt="Chispita celebrando"
                className="w-24 h-24 object-contain rounded-full relative z-10"
                src={ASSETS.chispitaCelebration || ASSETS.chispitaAvatar}
              />
              <div className="absolute -top-1 right-1 bg-[#f59e0b] text-white rounded-full p-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#855300] px-3 py-1 rounded-full text-xs font-extrabold mb-1">
              <span>🌟 ¡MISIÓN DEL DÍA COMPLETADA!</span>
            </div>

            <h3 className="text-2xl font-black text-[#351000] mb-1">
              ¡Maravilloso, Pequeña Lectora!
            </h3>

            <p className="text-xs text-[#534434] font-bold mb-3 px-2 leading-relaxed">
              Completaste el reto de hoy en <strong className="text-[#855300]">{currentWorld.numberLabel}</strong>. ¡Has ganado 10 estrellitas doradas!
            </p>

            {unlockedNextWorldTitle && (
              <div className="w-full bg-[#dcfce7] p-2.5 rounded-2xl mb-3 border border-[#86efac] flex items-center gap-2 text-left">
                <span className="text-2xl">🔓</span>
                <div>
                  <span className="text-[10px] font-black text-[#15803d] uppercase block">¡Nuevo Mundo Desbloqueado!</span>
                  <span className="text-xs font-bold text-[#14532d]">{unlockedNextWorldTitle}</span>
                </div>
              </div>
            )}

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={handleNextWord}
                type="button"
                className="w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#613b00] font-black text-sm rounded-2xl shadow-[0_4px_0_0_#b45309] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Siguiente Palabra</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                onClick={() => {
                  setShowVictoryModal(false);
                  onBackToMap();
                }}
                type="button"
                className="w-full py-2.5 bg-[#ffeae1] hover:bg-[#ffd0bb] text-[#534434] font-bold text-xs rounded-2xl cursor-pointer"
              >
                Volver al Mapa de Mundos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

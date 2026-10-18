import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WORLDS_DATA, WorldLevel, getWorldTracingLetters } from '../data/worldsData';
import { ALPHABET_DATA, LetterExercise } from '../data/alphabetData';
import { ALL_STORIES, DecodableStory } from '../data/cuentosData';
import { ASSETS } from '../data/appData';
import {
  playPop,
  playSparkleChime,
  playFanfare,
  playWiggleError,
  speakSpanish,
  triggerHaptic,
} from '../utils/audio';
import { validateLetterDrawing, validateWordCalligraphy, CalligraphyValidationResult } from '../utils/calligraphyValidator';

interface MundoAdventureScreenProps {
  worldId: number;
  initialStep?: 1 | 2 | 3 | 4;
  onBackToMap: () => void;
  onAddStars: (amount: number) => void;
  onCompleteWorld: (worldId: number) => void;
  onNextWorld?: (nextWorldId: number) => void;
}

const CRAYON_COLORS = [
  { id: 'amber', name: 'Amarillo Sol', color: '#f59e0b', shadow: '#d97706' },
  { id: 'blue', name: 'Azul Cielo', color: '#38bdf8', shadow: '#0284c7' },
  { id: 'red', name: 'Rojo Fresa', color: '#f87171', shadow: '#dc2626' },
  { id: 'mint', name: 'Verde Menta', color: '#10b981', shadow: '#00714d' },
];

export const MundoAdventureScreen: React.FC<MundoAdventureScreenProps> = ({
  worldId,
  initialStep = 1,
  onBackToMap,
  onAddStars,
  onCompleteWorld,
  onNextWorld,
}) => {
  // Current World Data
  const world: WorldLevel = WORLDS_DATA.find(w => w.id === worldId) || WORLDS_DATA[0];

  // Steps Progress: 1 = Trazos, 2 = Escribe Palabra, 3 = Completa Sílabas, 4 = Lectura
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(`palabritas_world_${worldId}_steps`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showWorldVictoryModal, setShowWorldVictoryModal] = useState(false);

  const saveStepCompleted = (stepNum: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepNum)) return prev;
      const updated = [...prev, stepNum];
      try {
        localStorage.setItem(`palabritas_world_${worldId}_steps`, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // =========================================================================
  // PASO 1: TRAZOS (4 MAYÚSCULAS Y 4 MINÚSCULAS POR MUNDO)
  // =========================================================================
  const tracingLetters = getWorldTracingLetters(world.id); // Exactly 4 letters
  const [tracingLetterIdx, setTracingLetterIdx] = useState<number>(0); // 0 to 3
  const [isUppercase, setIsUppercase] = useState<boolean>(true); // true = Mayúscula, false = Minúscula
  const [selectedColor, setSelectedColor] = useState(CRAYON_COLORS[0]);
  const [trazoValidation, setTrazoValidation] = useState<CalligraphyValidationResult | null>(null);
  const [step1Completed, setStep1Completed] = useState<boolean>(() => completedSteps.includes(1));

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const currentLetterChar = tracingLetters[tracingLetterIdx] || tracingLetters[0];
  const currentLetterExercise: LetterExercise =
    ALPHABET_DATA.find(a => a.letter.toUpperCase() === currentLetterChar.toUpperCase()) ||
    ALPHABET_DATA[0];

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setTrazoValidation(null);
  };

  useEffect(() => {
    clearCanvas();
  }, [tracingLetterIdx, isUppercase, currentStep]);

  // Canvas drawing effect for Step 1
  useEffect(() => {
    if (currentStep !== 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      triggerHaptic(10);
      setTrazoValidation(prev => (prev && !prev.isValid ? null : prev));

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = selectedColor.color;
      ctx.lineWidth = 22;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.cancelable) e.preventDefault();
      if (!isDrawingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawingRef.current = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      window.removeEventListener('touchend', stopDrawing);
    };
  }, [currentStep, selectedColor, tracingLetterIdx, isUppercase]);

  // Validar trazo de letra con parámetros pedagógicos amables
  const handleVerifyLetterTrace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pathString = isUppercase ? currentLetterExercise.upperPath : currentLetterExercise.lowerPath;
    const letterChar = isUppercase ? currentLetterExercise.letter : currentLetterExercise.letter.toLowerCase();

    const result = validateLetterDrawing(canvas, {
      svgPath: pathString,
      letterChar,
      toleranceRadius: 40,
      minCoverageThreshold: 0.16,
      maxScribbleRatio: 0.70,
    });

    setTrazoValidation(result);

    if (!result.isValid) {
      playWiggleError();
      triggerHaptic([35, 45]);
      speakSpanish(result.message + (result.hint ? ' ' + result.hint : ''));
      return;
    }

    // Trazo correcto
    playSparkleChime();
    triggerHaptic([40, 50, 80]);
    onAddStars(5);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171'],
    });

    if (isUppercase) {
      if (tracingLetterIdx < 3) {
        speakSpanish(`¡Excelente! Letra ${currentLetterChar} mayúscula completada. ¡Siguiente mayúscula!`);
        setTimeout(() => {
          setTracingLetterIdx(prev => prev + 1);
        }, 1200);
      } else {
        // Completó las 4 Mayúsculas
        playFanfare();
        speakSpanish('¡Completaste las 4 mayúsculas! ¡Ahora vamos a trazar las 4 minúsculas!');
        setTimeout(() => {
          setIsUppercase(false);
          setTracingLetterIdx(0);
        }, 1500);
      }
    } else {
      // Minúsculas
      if (tracingLetterIdx < 3) {
        speakSpanish(`¡Muy bien! Letra ${currentLetterChar.toLowerCase()} minúscula completada.`);
        setTimeout(() => {
          setTracingLetterIdx(prev => prev + 1);
        }, 1200);
      } else {
        // Completó las 4 Minúsculas: PASO 1 SUPERADO
        playFanfare();
        onAddStars(15);
        saveStepCompleted(1);
        setStep1Completed(true);
        speakSpanish('¡Reto de Trazos Superado! Has completado las 4 mayúsculas y las 4 minúsculas de este Mundo.');
        setTimeout(() => {
          setCurrentStep(2);
        }, 1800);
      }
    }
  };

  // =========================================================================
  // PASO 2: ESCRITURA A MANO DE PALABRAS (HANDWRITING MONTESSORI)
  // =========================================================================
  const targetWord = world.targetWord.toUpperCase();
  const [wordCanvasColor, setWordCanvasColor] = useState(CRAYON_COLORS[1]);
  const [wordValidation, setWordValidation] = useState<CalligraphyValidationResult | null>(null);
  const [step2Completed, setStep2Completed] = useState<boolean>(() => completedSteps.includes(2));
  const wordCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isWordDrawingRef = useRef(false);

  const clearWordCanvas = () => {
    const canvas = wordCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setWordValidation(null);
  };

  useEffect(() => {
    if (currentStep === 2) {
      clearWordCanvas();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== 2) return;
    const canvas = wordCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startWordDrawing = (e: MouseEvent | TouchEvent) => {
      isWordDrawingRef.current = true;
      triggerHaptic(10);
      setWordValidation(prev => (prev && !prev.isValid ? null : prev));

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = wordCanvasColor.color;
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const drawWord = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.cancelable) e.preventDefault();
      if (!isWordDrawingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopWordDrawing = () => {
      isWordDrawingRef.current = false;
    };

    canvas.addEventListener('mousedown', startWordDrawing);
    canvas.addEventListener('mousemove', drawWord);
    window.addEventListener('mouseup', stopWordDrawing);

    canvas.addEventListener('touchstart', startWordDrawing, { passive: false });
    canvas.addEventListener('touchmove', drawWord, { passive: false });
    window.addEventListener('touchend', stopWordDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startWordDrawing);
      canvas.removeEventListener('mousemove', drawWord);
      window.removeEventListener('mouseup', stopWordDrawing);

      canvas.removeEventListener('touchstart', startWordDrawing);
      canvas.removeEventListener('touchmove', drawWord);
      window.removeEventListener('touchend', stopWordDrawing);
    };
  }, [currentStep, wordCanvasColor]);

  const handleVerifyWordWriting = () => {
    const canvas = wordCanvasRef.current;
    if (!canvas) return;

    const result = validateWordCalligraphy(canvas, targetWord, {
      toleranceRadius: 44,
      minCoverageThreshold: 0.15,
      maxScribbleRatio: 0.72,
    });

    setWordValidation(result);

    if (!result.isValid) {
      playWiggleError();
      triggerHaptic([35, 45]);
      speakSpanish(result.message + (result.hint ? ' ' + result.hint : ''));
      return;
    }

    // Palabra escrita correctamente
    playFanfare();
    playSparkleChime();
    triggerHaptic([40, 50, 80]);
    onAddStars(15);
    saveStepCompleted(2);
    setStep2Completed(true);

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6cf8bb', '#f59e0b', '#42bbff', '#f87171'],
    });

    speakSpanish(`¡Hermosa caligrafía! Has escrito la palabra ${targetWord} con tus manos.`);
    setTimeout(() => {
      setCurrentStep(3);
    }, 1800);
  };

  // =========================================================================
  // PASO 3: COMPLETACIÓN (ARMA LA PALABRA CON SÍLABAS)
  // =========================================================================
  // Prepare words for this world: focus word + 2 related words
  const worldExercises: LetterExercise[] = ALPHABET_DATA.filter(
    ex => ex.letter.toUpperCase() === world.focusLetter.toUpperCase() ||
          world.subtitle.toUpperCase().includes(ex.exampleWord.toUpperCase())
  ).slice(0, 3);

  const activeCompletaList = worldExercises.length > 0
    ? worldExercises
    : [ALPHABET_DATA[world.letterIndex] || ALPHABET_DATA[0]];

  const [completaWordIdx, setCompletaWordIdx] = useState<number>(0);
  const currentCompletaExercise = activeCompletaList[completaWordIdx] || activeCompletaList[0];

  const generateSixOptions = (correct: string, distractors: string[]) => {
    const pool = [correct, ...distractors];
    const alphabetFillers = ['MA', 'PA', 'SO', 'LA', 'TE', 'MI', 'DO', 'LU', 'CA', 'SI', 'NO', 'RE', 'TA', 'BA', 'ES'];
    let idx = 0;
    while (pool.length < 6 && idx < alphabetFillers.length) {
      const f = alphabetFillers[idx];
      if (!pool.includes(f)) pool.push(f);
      idx++;
    }
    return pool.slice(0, 6).sort(() => Math.random() - 0.5);
  };

  const [sixOptions, setSixOptions] = useState<string[]>(() =>
    generateSixOptions(currentCompletaExercise.missingSyllable, currentCompletaExercise.distractors)
  );

  const [targetFilled, setTargetFilled] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [shakingChip, setShakingChip] = useState<string | null>(null);
  const [step3Completed, setStep3Completed] = useState<boolean>(() => completedSteps.includes(3));
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSixOptions(generateSixOptions(currentCompletaExercise.missingSyllable, currentCompletaExercise.distractors));
    setTargetFilled(false);
    setIsAdvancing(false);
  }, [completaWordIdx, currentStep]);

  const handleSelectCompletaSyllable = (syl: string) => {
    if (targetFilled || isAdvancing) return;

    if (syl.toUpperCase() === currentCompletaExercise.missingSyllable.toUpperCase()) {
      // 1. Poner en el espacio en blanco de inmediato
      setTargetFilled(true);
      setIsAdvancing(true);
      playPop(580);
      triggerHaptic([30, 40]);
      onAddStars(10);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#ffd0bb'],
      });

      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);

      // 2. Reproducir el sonido de la palabra que se está formando
      speakSpanish(currentCompletaExercise.exampleWord, () => {
        // 3. Decir luego que está correcto con fanfarria y sonido
        playSparkleChime();
        triggerHaptic([40, 50, 80]);

        speakSpanish('¡Correcto! ¡Muy bien!', () => {
          // 4. Pasar al siguiente ejercicio
          autoAdvanceTimerRef.current = setTimeout(() => {
            setIsAdvancing(false);
            if (completaWordIdx < activeCompletaList.length - 1) {
              setCompletaWordIdx(prev => prev + 1);
            } else {
              // Completó todas las palabras del mundo
              playFanfare();
              onAddStars(15);
              saveStepCompleted(3);
              setStep3Completed(true);
              speakSpanish('¡Excelente! Has armado todas las palabras de este Mundo.');
              setTimeout(() => {
                setCurrentStep(4);
              }, 1200);
            }
          }, 600);
        });
      });

      // Temporizador de respaldo por si el navegador no dispara onend
      autoAdvanceTimerRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (completaWordIdx < activeCompletaList.length - 1) {
          setCompletaWordIdx(prev => prev + 1);
        } else {
          saveStepCompleted(3);
          setStep3Completed(true);
          setCurrentStep(4);
        }
      }, 4000);
    } else {
      // Incorrecto
      playWiggleError();
      triggerHaptic([50, 40, 50]);
      setShakingChip(syl);
      speakSpanish(`Esa es ${syl}. Escucha bien e intenta otra vez.`);
      setTimeout(() => setShakingChip(null), 500);
    }
  };

  const handleNextCompletaWordDirect = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    setIsAdvancing(false);
    if (completaWordIdx < activeCompletaList.length - 1) {
      setCompletaWordIdx(prev => prev + 1);
    } else {
      saveStepCompleted(3);
      setStep3Completed(true);
      setCurrentStep(4);
    }
  };

  // =========================================================================
  // PASO 4: LECCIÓN DE LECTURA (CUENTO FONÉTICO DEL MUNDO)
  // =========================================================================
  const worldStory: DecodableStory =
    ALL_STORIES.find(s => s.worldId === world.id) ||
    ALL_STORIES.find(s => s.id === world.id) ||
    ALL_STORIES[0];

  const [storyPageIndex, setStoryPageIndex] = useState<number>(0);
  const storyPage = worldStory.pages[storyPageIndex] || worldStory.pages[0];

  const handleFinishWorldReading = () => {
    playFanfare();
    playSparkleChime();
    triggerHaptic([50, 60, 100]);
    onAddStars(30);
    saveStepCompleted(4);

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#6cf8bb', '#f59e0b', '#42bbff', '#f87171'],
    });

    onCompleteWorld(world.id);
    speakSpanish(`¡Felicidades! ¡Has completado al cien por ciento el ${world.numberLabel}: ${world.title}!`);
    setShowWorldVictoryModal(true);
  };

  return (
    <div className="flex flex-col w-full pb-10 select-none">
      {/* Top Header of the World Adventure */}
      <header className="w-full bg-white rounded-3xl p-3.5 shadow-sm border border-[#ffd0bb] mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            onClick={() => {
              playPop(380);
              triggerHaptic(15);
              onBackToMap();
            }}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ffeae1] text-[#855300] font-black text-xs hover:bg-[#ffd0bb] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Volver al Mapa</span>
          </button>

          {/* World Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <span className="text-sm">{world.targetEmoji}</span>
            <span className="text-xs font-black text-[#855300]">{world.numberLabel}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 bg-[#fef3c7] px-2.5 py-1 rounded-full text-amber-800 text-xs font-black">
            <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span>+Estrellas</span>
          </div>
        </div>

        {/* 4 Interactive Stage Steps Tracker */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { step: 1, label: 'Trazos', icon: 'draw', completed: completedSteps.includes(1) || step1Completed },
            { step: 2, label: 'Escribe', icon: 'edit_note', completed: completedSteps.includes(2) || step2Completed },
            { step: 3, label: 'Completa', icon: 'extension', completed: completedSteps.includes(3) || step3Completed },
            { step: 4, label: 'Lectura', icon: 'auto_stories', completed: completedSteps.includes(4) },
          ].map(s => {
            const isActive = currentStep === s.step;
            const isUnlocked = s.step === 1 || completedSteps.includes(s.step - 1) || s.completed;

            return (
              <button
                key={s.step}
                onClick={() => {
                  if (isUnlocked) {
                    playPop(440);
                    triggerHaptic(15);
                    setCurrentStep(s.step as 1 | 2 | 3 | 4);
                  } else {
                    playWiggleError();
                    triggerHaptic([30, 30]);
                    speakSpanish(`Completa primero el paso ${s.step - 1} para abrir este ejercicio.`);
                  }
                }}
                type="button"
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer border-2 relative ${
                  isActive
                    ? 'bg-amber-100 border-[#f59e0b] shadow-[0_3px_0_0_#d97706] scale-102'
                    : s.completed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isUnlocked
                    ? 'bg-white border-[#ffd0bb] text-[#534434]'
                    : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                {s.completed && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black shadow-xs">
                    ✓
                  </span>
                )}
                <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                <span className="text-[10px] font-black mt-0.5 leading-none">{s.label}</span>
                <span className="text-[8px] font-bold opacity-75 mt-0.5">{s.step}/4</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* =================================================================== */}
      {/* ARENA: PASO 1 - TRAZOS (4 MAYÚSCULAS Y 4 MINÚSCULAS)                */}
      {/* =================================================================== */}
      {currentStep === 1 && (
        <div className="w-full flex flex-col items-center gap-3">
          {/* Header Banner */}
          <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase block">
                  Paso 1: Trazos del Mundo ({isUppercase ? 'Mayúsculas' : 'Minúsculas'})
                </span>
                <span className="text-xs font-extrabold text-[#351000]">
                  Letra {tracingLetterIdx + 1} de 4: <strong className="text-amber-700 text-sm">{isUppercase ? currentLetterChar : currentLetterChar.toLowerCase()}</strong>
                </span>
              </div>
            </div>

            {/* Toggle uppercase/lowercase preview badge */}
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-amber-200 text-xs font-black text-amber-800 shadow-xs">
              <span>{isUppercase ? 'MAYÚSCULA' : 'minúscula'}</span>
              <span className="text-amber-600 font-bold">({tracingLetterIdx + 1}/4)</span>
            </div>
          </div>

          {/* Letter Sound Button */}
          <button
            onClick={() => {
              playPop(480);
              const hintText = isUppercase
                ? currentLetterExercise.hint
                : (currentLetterExercise.lowerHint || currentLetterExercise.hint);
              speakSpanish(`${currentLetterExercise.name} ${isUppercase ? 'mayúscula' : 'minúscula'}... ${currentLetterExercise.phoneme}... ${hintText}`);
            }}
            type="button"
            className="w-full max-w-[280px] h-11 bg-[#42bbff] hover:bg-[#89ceff] text-white rounded-full flex items-center justify-center gap-2 font-bold text-xs shadow-[0_3px_0_0_#006591] active:translate-y-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">volume_up</span>
            <span>Escuchar: /{currentLetterExercise.phoneme}/ ({currentLetterExercise.exampleWord})</span>
          </button>

          {/* Pedagogical Hint Pill */}
          <div className="w-full max-w-[280px] px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-center shadow-2xs">
            <p className="text-[11px] font-bold text-amber-900 leading-tight">
              💡 {isUppercase ? currentLetterExercise.hint : (currentLetterExercise.lowerHint || currentLetterExercise.hint)}
            </p>
          </div>

          {/* Tracing Canvas Card */}
          <div className="w-full bg-white rounded-3xl p-3 shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffdbcc] flex flex-col items-center relative">
            <div className="relative w-full aspect-square max-w-[280px] bg-[#fffcf9] rounded-2xl border-2 border-[#ffd0bb] flex items-center justify-center overflow-hidden touch-none shadow-inner">
              {/* Montessori guide lines background */}
              <div className="absolute inset-0 flex flex-col justify-between py-6 px-3 pointer-events-none opacity-40">
                <div className="w-full border-b-2 border-rose-400"></div>
                <div className="w-full border-b-2 border-dashed border-sky-400"></div>
                <div className="w-full border-b-2 border-emerald-400"></div>
              </div>

              {/* SVG Reference Path Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none select-none"
                viewBox="0 0 280 280"
              >
                <path
                  d={isUppercase ? currentLetterExercise.upperPath : currentLetterExercise.lowerPath}
                  fill="none"
                  stroke="#ffd0bb"
                  strokeWidth="26"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={isUppercase ? currentLetterExercise.upperPath : currentLetterExercise.lowerPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Numbered Guided Step Dots for uppercase and lowercase */}
                {(isUppercase ? currentLetterExercise.upperSteps : (currentLetterExercise.lowerSteps || []))?.map((step, idx) => (
                  <g key={idx}>
                    <circle cx={step.x} cy={step.y} r="14" fill="#f59e0b" />
                    <circle cx={step.x} cy={step.y} r="12" fill="#ffffff" />
                    <text
                      x={step.x}
                      y={step.y + 4}
                      textAnchor="middle"
                      fill="#b45309"
                      fontSize="12"
                      fontWeight="900"
                    >
                      {step.label}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Drawing Canvas */}
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
              />
            </div>

            {/* Validation Feedback Message */}
            {trazoValidation && (
              <div
                className={`w-full max-w-sm mt-2 p-2 rounded-xl text-xs font-black text-center border ${
                  trazoValidation.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {trazoValidation.message}
              </div>
            )}

            {/* Action Bar: Color Pickers + Clear + Verify */}
            <div className="w-full flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#ffd0bb]">
              {/* Colors */}
              <div className="flex items-center gap-1.5">
                {CRAYON_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      playPop(400);
                      setSelectedColor(c);
                    }}
                    type="button"
                    style={{ backgroundColor: c.color }}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                      selectedColor.id === c.id ? 'scale-115 ring-3 ring-amber-400' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>

              {/* Clear */}
              <button
                onClick={() => {
                  playPop(350);
                  clearCanvas();
                }}
                type="button"
                className="px-3 py-1.5 bg-[#ffeae1] hover:bg-[#ffd0bb] text-[#855300] text-xs font-bold rounded-xl cursor-pointer"
              >
                Borrar
              </button>

              {/* Verify Button */}
              <button
                onClick={handleVerifyLetterTrace}
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-[0_3px_0_0_#059669] active:translate-y-0.5 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>¡Verificar!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ARENA: PASO 2 - ESCRITURA A MANO DE PALABRAS                        */}
      {/* =================================================================== */}
      {currentStep === 2 && (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <div>
                <span className="text-[10px] font-black text-emerald-800 uppercase block">
                  Paso 2: Escribe a Mano la Palabra
                </span>
                <span className="text-xs font-extrabold text-[#351000]">
                  Traza con tu crayón: <strong className="text-emerald-700 text-sm">{targetWord}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playPop(440);
                speakSpanish(targetWord);
              }}
              type="button"
              className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>Oír</span>
            </button>
          </div>

          {/* Handwriting Notebook Canvas */}
          <div className="w-full bg-white rounded-3xl p-3 shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffdbcc] flex flex-col items-center relative">
            <div className="relative w-full h-56 max-w-sm bg-[#fffcf9] rounded-2xl border-2 border-[#ffd0bb] flex items-center justify-center overflow-hidden touch-none shadow-inner">
              {/* Montessori lined paper */}
              <div className="absolute inset-0 flex flex-col justify-center gap-8 px-4 pointer-events-none opacity-40">
                <div className="w-full border-b-2 border-rose-400"></div>
                <div className="w-full border-b-2 border-dashed border-sky-400"></div>
                <div className="w-full border-b-2 border-emerald-400"></div>
              </div>

              {/* Guide Dotted Word in Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-5xl font-black tracking-widest text-amber-200/90 font-['Quicksand'] select-none">
                  {targetWord}
                </span>
              </div>

              {/* Drawing Canvas */}
              <canvas
                ref={wordCanvasRef}
                width={360}
                height={220}
                className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
              />
            </div>

            {/* Validation Feedback */}
            {wordValidation && (
              <div
                className={`w-full max-w-sm mt-2 p-2 rounded-xl text-xs font-black text-center border ${
                  wordValidation.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {wordValidation.message}
              </div>
            )}

            {/* Action Bar */}
            <div className="w-full flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#ffd0bb]">
              <div className="flex items-center gap-1.5">
                {CRAYON_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      playPop(400);
                      setWordCanvasColor(c);
                    }}
                    type="button"
                    style={{ backgroundColor: c.color }}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-transform ${
                      wordCanvasColor.id === c.id ? 'scale-115 ring-3 ring-emerald-400' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  playPop(350);
                  clearWordCanvas();
                }}
                type="button"
                className="px-3 py-1.5 bg-[#ffeae1] hover:bg-[#ffd0bb] text-[#855300] text-xs font-bold rounded-xl cursor-pointer"
              >
                Borrar
              </button>

              <button
                onClick={handleVerifyWordWriting}
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-[0_3px_0_0_#059669] active:translate-y-0.5 cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>¡Verificar Palabra!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ARENA: PASO 3 - COMPLETACIÓN (ARMA CON SÍLABAS)                     */}
      {/* =================================================================== */}
      {currentStep === 3 && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full bg-white rounded-3xl p-4 shadow-[0_8px_0_0_#ffdbcc] flex flex-col items-center relative overflow-hidden mb-3 border-2 border-[#ffdbcc]/70">
            {/* Mascot Banner */}
            <div className="w-full bg-[#fff1eb] rounded-2xl p-2.5 mb-2.5 flex items-center justify-between gap-2 border border-[#ffd0bb]">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                <p className="text-xs text-[#534434] font-bold leading-tight">
                  Palabra {completaWordIdx + 1} de {activeCompletaList.length}: Formemos <strong className="text-[#855300] text-sm">{currentCompletaExercise.exampleWord}</strong>.
                </p>
              </div>
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                {completaWordIdx + 1}/{activeCompletaList.length}
              </span>
            </div>

            {/* Target Illustration */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-2 bg-gradient-to-tr from-amber-100 to-orange-50 rounded-3xl border-2 border-[#ffd0bb]">
              <span className="text-5xl filter drop-shadow-md">{currentCompletaExercise.emoji}</span>
              <span className="text-xs font-bold text-[#855300] mt-1 bg-white/80 px-2 py-0.5 rounded-full absolute bottom-1">
                {currentCompletaExercise.exampleWord}
              </span>
            </div>

            {/* Phonic Audio Bar */}
            <button
              onClick={() => {
                playPop(480);
                speakSpanish(`${currentCompletaExercise.missingSyllable}... ${currentCompletaExercise.givenSyllable}... ${currentCompletaExercise.exampleWord}`);
              }}
              type="button"
              className="w-full max-w-[280px] h-11 bg-[#42bbff] hover:bg-[#89ceff] rounded-full flex items-center justify-center gap-2 px-4 shadow-[0_3px_0_0_#006591] active:translate-y-0.5 transition-all mb-3 cursor-pointer text-white font-bold text-xs"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
              <span>Escuchar: /{currentCompletaExercise.syllablesWord}/</span>
            </button>

            {/* Phonic Slots */}
            <div className="w-full flex items-center justify-center gap-3 mb-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-24 h-22 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                    targetFilled
                      ? 'bg-[#6cf8bb] shadow-[0_6px_0_0_#4edea3] border-[#4edea3] scale-105'
                      : 'bg-[#ffeae1] shadow-inner border-dashed border-[#d8c3ad]'
                  }`}
                >
                  {!targetFilled ? (
                    <span className="text-3xl text-[#867461] font-extrabold animate-pulse">?</span>
                  ) : (
                    <span className="text-2xl text-[#00714d] font-black">{currentCompletaExercise.missingSyllable}</span>
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
                  <span className="text-2xl font-black text-[#613b00]">{currentCompletaExercise.givenSyllable}</span>
                </div>
                <span className="text-[11px] text-[#534434] font-bold">Base</span>
              </div>
            </div>

            {/* Success Banner */}
            {targetFilled && (
              <div className="w-full max-w-[320px] bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 border-2 border-emerald-400 text-emerald-900 rounded-2xl p-2.5 mt-2.5 flex items-center justify-between shadow-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">⭐</span>
                  <div>
                    <span className="text-xs font-black block text-emerald-800">
                      ¡{currentCompletaExercise.exampleWord}! ¡Correcto!
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">
                      +10 estrellas ganadas
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleNextCompletaWordDirect}
                  type="button"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Siguiente</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            )}
          </div>

          {/* 6 Randomized Option Chips */}
          <div className="w-full bg-[#ffeae1] rounded-3xl p-3.5 shadow-[0_8px_0_0_#ffdbcc] flex flex-col items-center border-2 border-[#ffdbcc]">
            <span className="text-xs text-[#351000] font-black mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#855300]">touch_app</span>
              Toca la opción correcta entre las 6 fichas:
            </span>

            <div className="w-full grid grid-cols-3 gap-2.5">
              {sixOptions.map((syl, optIdx) => {
                const isTarget = syl.toUpperCase() === currentCompletaExercise.missingSyllable.toUpperCase();
                const isShaking = shakingChip === syl;
                const isSelectedCorrect = targetFilled && isTarget;

                return (
                  <button
                    key={`${syl}-${optIdx}`}
                    onClick={() => handleSelectCompletaSyllable(syl)}
                    disabled={targetFilled || isAdvancing}
                    type="button"
                    className={`h-20 rounded-2xl flex flex-col items-center justify-center p-1 transition-all cursor-pointer border-2 relative ${
                      isShaking
                        ? 'translate-x-2 border-red-400 bg-red-50'
                        : isSelectedCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-[0_4px_0_0_#10b981] scale-95 font-black ring-2 ring-emerald-300'
                        : targetFilled || isAdvancing
                        ? 'bg-white/70 border-[#ffd0bb] opacity-50 pointer-events-none'
                        : 'bg-white border-[#ffdbcc] shadow-[0_5px_0_0_#ffb95f] active:translate-y-1 active:shadow-[0_1px_0_0_#ffb95f]'
                    }`}
                  >
                    {isSelectedCorrect && (
                      <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-black shadow-xs">
                        ✓
                      </span>
                    )}
                    <span className={`text-2xl font-black ${isSelectedCorrect ? 'text-emerald-800' : 'text-[#613b00]'}`}>
                      {syl}
                    </span>
                    <span className={`text-[10px] font-bold mt-0.5 ${isSelectedCorrect ? 'text-emerald-600' : 'text-[#f59e0b]'}`}>
                      /{syl.toLowerCase()}/
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ARENA: PASO 4 - LECCIÓN DE LECTURA (CUENTO DEL MUNDO)               */}
      {/* =================================================================== */}
      {currentStep === 4 && (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <div>
                <span className="text-[10px] font-black text-purple-800 uppercase block">
                  Paso 4: Lección de Lectura del Mundo
                </span>
                <span className="text-xs font-extrabold text-[#351000]">
                  {worldStory.title}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                playPop(480);
                const fullText = storyPage.lines
                  .map(l => l.words.map(w => w.display).join(' '))
                  .join('. ');
                speakSpanish(fullText);
              }}
              type="button"
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-full flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>Leer en Voz Alta</span>
            </button>
          </div>

          {/* Story Card */}
          <div className="w-full bg-white rounded-3xl p-5 shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffdbcc] flex flex-col items-center text-center">
            <div className="text-4xl mb-2">{worldStory.emoji}</div>
            <h3 className="text-lg font-black text-[#351000] mb-3">
              {worldStory.title}
            </h3>

            {/* Illustrated Sentences with Touchable Words */}
            <div className="w-full bg-[#fff8f6] rounded-2xl p-4 border border-[#ffd0bb] flex flex-col gap-3 mb-4">
              {storyPage.lines.map((line, lIdx) => (
                <div key={lIdx} className="flex flex-wrap items-center justify-center gap-1.5">
                  {line.words.map((w, wIdx) => (
                    <button
                      key={wIdx}
                      onClick={() => {
                        playPop(480);
                        triggerHaptic(15);
                        speakSpanish(`${w.clean}... ${w.syllables.replace(/-/g, ' ')}... ${w.clean}`);
                      }}
                      type="button"
                      className="px-2 py-1 bg-white hover:bg-amber-100 rounded-xl border border-amber-200 text-sm font-bold text-[#351000] shadow-2xs hover:scale-105 active:scale-95 cursor-pointer transition-transform"
                    >
                      {w.display}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-amber-800 font-bold mb-4 italic">
              💡 Toca cualquier palabra para escuchar cómo se divide en sílabas.
            </p>

            {/* Big Finish Button */}
            <button
              onClick={handleFinishWorldReading}
              type="button"
              className="w-full max-w-xs py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-105 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_0_#059669] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">celebration</span>
              <span>¡HE LEÍDO LA HISTORIA! ⭐</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: MUNDO COMPLETADO AL 100%                                     */}
      {/* =================================================================== */}
      {showWorldVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#351000]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden border-4 border-amber-300">
            <div className="relative w-28 h-28 mb-2 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-200 rounded-full blur-md opacity-70 animate-pulse"></div>
              <img
                alt="Chispita celebrando"
                className="w-24 h-24 object-contain rounded-full relative z-10"
                src={ASSETS.chispitaCelebration || ASSETS.chispitaAvatar}
              />
              <div className="absolute -top-1 right-1 bg-amber-500 text-white rounded-full p-1.5 shadow-sm">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-black mb-1">
              <span>🏆 ¡MUNDO CONQUISTADO AL 100%!</span>
            </div>

            <h3 className="text-2xl font-black text-[#351000] mb-1">
              ¡Genial, Pequeña Lectora!
            </h3>

            <p className="text-xs text-[#534434] font-bold mb-3 px-2 leading-relaxed">
              Completaste los 4 retos de <strong className="text-amber-800">{world.numberLabel}: {world.title}</strong>: Trazos, Escritura a Mano, Completación y Lectura.
            </p>

            <div className="w-full bg-emerald-50 p-2.5 rounded-2xl mb-4 border border-emerald-300 flex items-center justify-center gap-2">
              <span className="text-2xl">🌟</span>
              <span className="text-xs font-black text-emerald-800">+30 Estrellas Doradas Añadidas</span>
            </div>

            <div className="w-full flex flex-col gap-2">
              {world.id < WORLDS_DATA.length && onNextWorld && (
                <button
                  onClick={() => {
                    setShowWorldVictoryModal(false);
                    onNextWorld(world.id + 1);
                  }}
                  type="button"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-105 text-[#451a03] font-black text-sm rounded-2xl shadow-[0_4px_0_0_#b45309] active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>¡Ir al Siguiente Mundo!</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowWorldVictoryModal(false);
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

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ALPHABET_DATA, LetterExercise } from '../data/alphabetData';
import { playPop, playSparkleChime, playFanfare, playWiggleError, speakSpanish, triggerHaptic } from '../utils/audio';
import { ASSETS } from '../data/appData';
import { validateLetterDrawing, CalligraphyValidationResult } from '../utils/calligraphyValidator';
import { markLetterMastered } from '../utils/playerProgress';

interface TrazosScreenProps {
  onBackToMap: () => void;
  onAddStars: (amount: number) => void;
  initialLetter?: string;
  initialFilter?: 'todas' | 'vocales' | 'primeras' | 'avanzadas';
}

const CRAYON_COLORS = [
  { id: 'amber', name: 'Amarillo Sol', color: '#f59e0b', shadow: '#d97706' },
  { id: 'blue', name: 'Azul Cielo', color: '#38bdf8', shadow: '#0284c7' },
  { id: 'red', name: 'Rojo Fresa', color: '#f87171', shadow: '#dc2626' },
  { id: 'mint', name: 'Verde Menta', color: '#4edea3', shadow: '#00714d' },
];

export const TrazosScreen: React.FC<TrazosScreenProps> = ({
  onBackToMap,
  onAddStars,
  initialLetter = 'A',
  initialFilter = 'vocales',
}) => {
  const [activeFilter, setActiveFilter] = useState<'todas' | 'vocales' | 'primeras' | 'avanzadas'>(initialFilter);

  const [selectedLetterIndex, setSelectedLetterIndex] = useState(() => {
    if (initialFilter === 'vocales') {
      const vowelIdx = ALPHABET_DATA.findIndex(l => l.letter.toUpperCase() === initialLetter.toUpperCase() && l.group === 'vocal');
      return vowelIdx !== -1 ? vowelIdx : 0;
    }
    const idx = ALPHABET_DATA.findIndex(l => l.letter.toUpperCase() === initialLetter.toUpperCase());
    return idx !== -1 ? idx : 0;
  });

  const [isUppercase, setIsUppercase] = useState(true);
  const [selectedColor, setSelectedColor] = useState(CRAYON_COLORS[0]);
  const [isErasingAnimation, setIsErasingAnimation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationResult, setValidationResult] = useState<CalligraphyValidationResult | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
      if (initialFilter === 'vocales') {
        const vowelIdx = ALPHABET_DATA.findIndex(l => l.letter.toUpperCase() === initialLetter.toUpperCase() && l.group === 'vocal');
        setSelectedLetterIndex(vowelIdx !== -1 ? vowelIdx : 0);
      } else {
        const idx = ALPHABET_DATA.findIndex(l => l.letter.toUpperCase() === initialLetter.toUpperCase());
        if (idx !== -1) setSelectedLetterIndex(idx);
      }
    }
  }, [initialLetter, initialFilter]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const currentExercise: LetterExercise = ALPHABET_DATA[selectedLetterIndex] || ALPHABET_DATA[0];

  const handlePlayPhonics = () => {
    playPop(440);
    triggerHaptic(20);
    speakSpanish(`${currentExercise.name}... ${currentExercise.phoneme}... ${currentExercise.exampleWord}`);
  };

  const handleClearCanvas = () => {
    setAutoAdvanceCountdown(null);
    setIsErasingAnimation(true);
    playPop(350);
    triggerHaptic(15);
    setTimeout(() => setIsErasingAnimation(false), 300);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setValidationResult(null);
    setIsCompleted(false);
  };

  // Clear canvas whenever letter changes
  useEffect(() => {
    handleClearCanvas();
  }, [selectedLetterIndex, isUppercase]);

  // Canvas drawing handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      triggerHaptic(10);
      // Clear previous error message when drawing again
      setValidationResult(prev => (prev && !prev.isValid ? null : prev));

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
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = selectedColor.color;
      ctx.shadowBlur = 4;
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
  }, [selectedColor]);

  // Validar trazo con el motor de caligrafía
  const handleCheckTrace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pathString = isUppercase ? currentExercise.upperPath : currentExercise.lowerPath;
    const letterChar = isUppercase ? currentExercise.letter : currentExercise.letter.toLowerCase();

    const result = validateLetterDrawing(canvas, {
      svgPath: pathString,
      letterChar,
      toleranceRadius: 40,
      minCoverageThreshold: 0.16,
      maxScribbleRatio: 0.70,
    });

    setValidationResult(result);

    if (!result.isValid) {
      playWiggleError();
      triggerHaptic([35, 45]);
      setIsCompleted(false);
      speakSpanish(result.message + (result.hint ? ' ' + result.hint : ''));
      return;
    }

    // Trazo Correcto
    playFanfare();
    playSparkleChime();
    triggerHaptic([40, 50, 80]);
    setIsCompleted(true);

    const starsEarned = result.stars === 3 ? 15 : result.stars === 2 ? 10 : 5;
    onAddStars(starsEarned);
    markLetterMastered(currentExercise.letter);
    speakSpanish(result.message);

    confetti({
      particleCount: 75,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171'],
    });

    // Iniciar cuenta regresiva para pasar automáticamente a la siguiente letra
    setAutoAdvanceCountdown(3);
  };

  // Filter letters based on active tab
  const filteredAlphabet = ALPHABET_DATA.map((item, idx) => ({ ...item, originalIndex: idx })).filter(item => {
    if (activeFilter === 'vocales') return item.group === 'vocal';
    if (activeFilter === 'primeras') return item.group === 'consonante-inicial';
    if (activeFilter === 'avanzadas') return item.group === 'consonante-media' || item.group === 'consonante-avanzada';
    return true;
  });

  const handleFilterClick = (filter: 'todas' | 'vocales' | 'primeras' | 'avanzadas') => {
    setAutoAdvanceCountdown(null);
    playPop(420);
    triggerHaptic(15);
    setActiveFilter(filter);

    const matching = ALPHABET_DATA.map((item, idx) => ({ ...item, originalIndex: idx })).filter(item => {
      if (filter === 'vocales') return item.group === 'vocal';
      if (filter === 'primeras') return item.group === 'consonante-inicial';
      if (filter === 'avanzadas') return item.group === 'consonante-media' || item.group === 'consonante-avanzada';
      return true;
    });

    const isCurrentInFilter = matching.some(m => m.originalIndex === selectedLetterIndex);
    if (!isCurrentInFilter && matching.length > 0) {
      setSelectedLetterIndex(matching[0].originalIndex);
      if (filter === 'vocales') {
        speakSpanish('Las Vocales: A, E, I, O, U.');
      } else {
        speakSpanish(`Letra ${matching[0].letter}.`);
      }
    } else if (filter === 'vocales') {
      speakSpanish('Las Vocales: A, E, I, O, U.');
    }
  };

  const handleSelectLetter = (index: number) => {
    setAutoAdvanceCountdown(null);
    playPop(480);
    triggerHaptic(15);
    setSelectedLetterIndex(index);
    const item = ALPHABET_DATA[index];
    speakSpanish(`Letra ${item.letter}. ${item.exampleWord}`);
  };

  const handleNextLetter = () => {
    setAutoAdvanceCountdown(null);
    playPop(480);
    triggerHaptic(15);
    const currentPosInFiltered = filteredAlphabet.findIndex(m => m.originalIndex === selectedLetterIndex);
    if (currentPosInFiltered !== -1) {
      if (currentPosInFiltered < filteredAlphabet.length - 1) {
        // Siguiente letra en el mismo caso (mayúscula o minúscula)
        const nextPos = currentPosInFiltered + 1;
        handleSelectLetter(filteredAlphabet[nextPos].originalIndex);
      } else {
        // Llegó al final del grupo de letras
        if (isUppercase) {
          // Pasamos a las minúsculas
          playFanfare();
          setIsUppercase(false);
          handleSelectLetter(filteredAlphabet[0].originalIndex);
          speakSpanish('¡Completaste las mayúsculas! ¡Ahora vamos a trazar las minúsculas!');
        } else {
          // Completó todas las mayúsculas y minúsculas!
          playFanfare();
          playSparkleChime();
          onAddStars(20);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6cf8bb', '#f59e0b', '#42bbff', '#f87171'],
          });
          speakSpanish('¡Felicidades! ¡Completaste todos los trazos en mayúscula y minúscula con éxito!');
          setIsUppercase(true);
          handleSelectLetter(filteredAlphabet[0].originalIndex);
        }
      }
    } else if (filteredAlphabet.length > 0) {
      handleSelectLetter(filteredAlphabet[0].originalIndex);
    }
  };

  const handlePrevLetter = () => {
    setAutoAdvanceCountdown(null);
    playPop(480);
    triggerHaptic(15);
    const currentPosInFiltered = filteredAlphabet.findIndex(m => m.originalIndex === selectedLetterIndex);
    if (currentPosInFiltered !== -1) {
      const prevPos = (currentPosInFiltered - 1 + filteredAlphabet.length) % filteredAlphabet.length;
      handleSelectLetter(filteredAlphabet[prevPos].originalIndex);
    } else if (filteredAlphabet.length > 0) {
      handleSelectLetter(filteredAlphabet[0].originalIndex);
    }
  };

  // Temporizador de avance automático al siguiente reto
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      setAutoAdvanceCountdown(null);
      handleNextLetter();
      return;
    }
    const timer = setTimeout(() => {
      setAutoAdvanceCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoAdvanceCountdown, selectedLetterIndex]);

  return (
    <div className="flex flex-col w-full pb-6 space-y-3.5 select-none">
      {/* Top Bar Navigation */}
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Back Button */}
          <button
            onClick={() => {
              playPop(380);
              triggerHaptic(15);
              onBackToMap();
            }}
            aria-label="Volver al mapa"
            className="w-12 h-12 rounded-2xl bg-[#ffe2d6] text-[#534434] flex items-center justify-center shadow-[0_5px_0_0_#ffd0bb] active:translate-y-1 active:shadow-[0_2px_0_0_#ffd0bb] transition-all cursor-pointer border border-[#ffd0bb]"
            type="button"
          >
            <span className="material-symbols-outlined text-[26px] text-[#855300]">arrow_back</span>
          </button>

          {/* Letter Case Toggle (M / m) */}
          <div className="flex items-center bg-[#ffeae1] p-1.5 rounded-full shadow-[0_4px_0_0_#ffd0bb] border border-[#ffd0bb]">
            <button
              onClick={() => {
                setIsUppercase(true);
                playPop(440);
                triggerHaptic(15);
              }}
              className={`px-4 py-1 rounded-full text-lg font-bold transition-all cursor-pointer ${
                isUppercase
                  ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706]'
                  : 'bg-transparent text-[#534434] hover:text-[#351000]'
              }`}
              type="button"
            >
              {currentExercise.letter}
            </button>
            <button
              onClick={() => {
                setIsUppercase(false);
                playPop(440);
                triggerHaptic(15);
              }}
              className={`px-4 py-1 rounded-full text-lg font-bold transition-all cursor-pointer ${
                !isUppercase
                  ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706]'
                  : 'bg-transparent text-[#534434] hover:text-[#351000]'
              }`}
              type="button"
            >
              {currentExercise.letter.toLowerCase()}
            </button>
          </div>

          {/* Progress Medal */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6cf8bb] text-[#00714d] rounded-full shadow-[0_4px_0_0_#4edea3]">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            <span className="text-xs font-bold">
              {activeFilter === 'vocales'
                ? `Vocal ${Math.max(1, filteredAlphabet.findIndex(m => m.originalIndex === selectedLetterIndex) + 1)} de 5`
                : `${Math.max(1, filteredAlphabet.findIndex(m => m.originalIndex === selectedLetterIndex) + 1)} de ${filteredAlphabet.length}`}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARROUSEL / SELECTOR CON FILTRO CLARO (VOCALES / FAMILIAS) */}
        {/* ======================================================== */}
        <div className="flex flex-col gap-2 bg-[#fff1eb] p-3 rounded-2xl border border-[#ffd0bb] shadow-sm">
          {/* Categorías de Filtro */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 px-0.5">
            <span className="text-xs font-bold text-[#855300] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Grupo:
            </span>
            <div className="flex flex-wrap gap-1 text-[11px] font-bold">
              {[
                { id: 'vocales', label: '✨ Vocales (A, E, I, O, U)' },
                { id: 'primeras', label: '🏖️ M, P, S, L' },
                { id: 'avanzadas', label: '🚀 Avanzadas' },
                { id: 'todas', label: '📚 Todas (A-Z)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFilterClick(f.id as typeof activeFilter)}
                  className={`px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                    activeFilter === f.id
                      ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_2px_0_0_#d97706] scale-102'
                      : 'bg-white text-[#534434] hover:bg-[#ffe2d6] border border-[#ffd0bb]'
                  }`}
                  type="button"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Banner descriptivo según filtro actual */}
          <div className="flex items-center justify-between text-xs px-1 py-1 bg-white/70 rounded-xl border border-[#ffd0bb]/60">
            <span className="font-bold text-[#855300] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f59e0b] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {activeFilter === 'vocales' ? 'auto_awesome' : 'abc'}
              </span>
              {activeFilter === 'vocales' && 'Mostrando únicamente las 5 vocales mágicas (A, E, I, O, U)'}
              {activeFilter === 'primeras' && 'Mostrando consonantes iniciales: M, P, S, L'}
              {activeFilter === 'avanzadas' && 'Mostrando consonantes intermedias y avanzadas'}
              {activeFilter === 'todas' && 'Mostrando las 27 letras del abecedario'}
            </span>
            <span className="text-[11px] font-bold text-[#006c49] bg-[#6cf8bb]/40 px-2 py-0.5 rounded-full">
              {filteredAlphabet.length} {filteredAlphabet.length === 1 ? 'letra' : 'letras'}
            </span>
          </div>

          {/* Carrusel de letras filtradas */}
          <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none">
            {filteredAlphabet.map(item => {
              const isSelected = item.originalIndex === selectedLetterIndex;
              return (
                <button
                  key={item.letter}
                  onClick={() => handleSelectLetter(item.originalIndex)}
                  type="button"
                  className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-base shrink-0 transition-transform cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_4px_0_0_#d97706] scale-105 border-[#d97706]'
                      : 'bg-white text-[#351000] shadow-xs border-[#ffd0bb] hover:bg-[#ffeae1]'
                  }`}
                >
                  <span>{item.letter}</span>
                  <span className="text-[10px] leading-none opacity-80">{item.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Phonics Sound Button */}
        <button
          onClick={handlePlayPhonics}
          className="w-full flex items-center justify-between p-3.5 bg-[#c9e6ff] text-[#001e2f] rounded-2xl shadow-[0_5px_0_0_#89ceff] active:translate-y-1 active:shadow-[0_2px_0_0_#89ceff] transition-all cursor-pointer border-2 border-[#89ceff]/50"
          type="button"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#006591] text-white flex items-center justify-center shadow-[0_3px_0_0_#004869] animate-pulse">
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-[#004c6e] uppercase tracking-wider block font-bold">
                Sonido fonético • {currentExercise.exampleWord} {currentExercise.emoji}
              </span>
              <span className="text-xl font-bold text-[#001e2f]">
                Escucha: <span className="text-[#006591]">{currentExercise.phoneme}</span>
              </span>
            </div>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white text-[#006591] text-xs font-bold shadow-sm flex items-center gap-1">
            Repetir 🔊
          </div>
        </button>
      </header>

      {/* Main Tracing Canvas Container */}
      <section className="relative w-full rounded-3xl bg-white overflow-hidden shadow-[0_8px_0_0_#ffdbcc] p-4 flex flex-col items-center justify-center min-h-[350px] touch-none border-2 border-[#ffdbcc]/70">
        {/* School Grid Paper Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundSize: '24px 24px',
            backgroundImage: 'linear-gradient(to right, #855300 1px, transparent 1px), linear-gradient(to bottom, #855300 1px, transparent 1px)',
          }}
        ></div>

        {/* School Notebook Guide Lines */}
        <div className="absolute inset-x-4 top-[18%] h-0.5 bg-[#ffd0bb] pointer-events-none"></div>
        <div className="absolute inset-x-4 top-[50%] h-0.5 border-b-2 border-dashed border-[#d8c3ad] pointer-events-none"></div>
        <div className="absolute inset-x-4 top-[82%] h-1 bg-[#ffdbcc] pointer-events-none"></div>

        {/* Top Indicators: Previous / Next Letter Shortcuts */}
        <div className="absolute top-3 inset-x-4 flex items-center justify-between z-30">
          <button
            onClick={handlePrevLetter}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffeae1] text-[#855300] border border-[#ffd0bb] text-xs font-bold cursor-pointer hover:bg-[#ffe2d6] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffeae1] text-[#534434] border border-[#ffd0bb]">
            <span className="text-base">{currentExercise.emoji}</span>
            <span className="text-xs font-bold">{currentExercise.exampleWord}</span>
          </div>

          <button
            onClick={handleNextLetter}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffeae1] text-[#855300] border border-[#ffd0bb] text-xs font-bold cursor-pointer hover:bg-[#ffe2d6] active:scale-95"
            type="button"
          >
            <span>Siguiente</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* Dynamic Letter Template SVG Guide & Canvas */}
        <div className="relative w-[280px] h-[280px] flex items-center justify-center z-10 mt-6">
          <svg className="w-full h-full drop-shadow-sm select-none" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chalkGlow" x1="0%" x2="100%" y1="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ffb95f" />
              </linearGradient>
            </defs>

            {/* Background Thick Template Guide Path */}
            <path
              d={isUppercase ? currentExercise.upperPath : currentExercise.lowerPath}
              fill="none"
              stroke="#c9e6ff"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="26"
            />

            {/* Glowing Accent Path on Top */}
            <path
              d={isUppercase ? currentExercise.upperPath : currentExercise.lowerPath}
              fill="none"
              stroke="url(#chalkGlow)"
              strokeDasharray={isCompleted ? 'none' : '12 12'}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isCompleted ? '22' : '6'}
              className="opacity-75"
            />

            {/* Numbered Milestone Dots */}
            {isUppercase &&
              currentExercise.upperSteps.map((step, idx) => (
                <g key={idx} transform={`translate(${step.x}, ${step.y})`} className="cursor-pointer">
                  <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="0"
                    y="5"
                    fill="#ffffff"
                    fontFamily="Quicksand"
                    fontSize="13"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {step.label}
                  </text>
                </g>
              ))}
          </svg>

          {/* Interactive HTML5 Drawing Canvas Overlaid */}
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="absolute inset-0 z-20 cursor-crosshair touch-none"
          />
        </div>

        {/* Chispita Encouraging Tip */}
        <aside className="absolute bottom-3 right-3 flex items-end gap-2 max-w-[220px] z-30 pointer-events-none">
          <div className="bg-[#fff1eb] text-[#351000] p-2.5 rounded-2xl rounded-br-none shadow-[0_3px_0_0_#ffdbcc] text-left border border-[#ffd0bb]">
            <span className="text-xs font-bold block text-[#855300]">¡Tip de Chispita! ✨</span>
            <span className="text-[11px] leading-tight block text-[#534434] font-medium">
              {currentExercise.hint}
            </span>
          </div>
          <div className="relative w-13 h-13 shrink-0 rounded-full bg-[#f59e0b] p-0.5 shadow-[0_3px_0_0_#d97706] overflow-hidden">
            <img
              alt="Mascota Chispita"
              className="w-full h-full object-cover"
              src={ASSETS.chispitaAvatar}
            />
          </div>
        </aside>
      </section>

      {/* DETAILED VALIDATION FEEDBACK BANNER (SI HAY ERROR O ÉXITO) */}
      {validationResult && !validationResult.isValid && (
        <section className="w-full bg-[#fff5f5] border-2 border-[#fca5a5] rounded-3xl p-4 shadow-[0_6px_0_0_#fecaca] animate-wiggle">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fee2e2] flex items-center justify-center text-2xl shrink-0 border border-[#fca5a5]">
              {validationResult.status === 'scribble' ? '🧽' : validationResult.status === 'incomplete' ? '✏️' : '🎨'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-[#991b1b]">
                  {validationResult.status === 'scribble'
                    ? '¡Atención: Muchos garabatos fuera!'
                    : validationResult.status === 'incomplete'
                    ? '¡Falta completar el trazo!'
                    : '¡Lienzo vacío!'}
                </h4>
                <span className="text-xs font-bold px-2 py-0.5 bg-[#fee2e2] text-[#991b1b] rounded-full">
                  No validado
                </span>
              </div>
              <p className="text-xs text-[#7f1d1d] font-medium mt-1 leading-relaxed">
                {validationResult.message}
              </p>
              {validationResult.hint && (
                <p className="text-[11px] text-[#b91c1c] font-bold mt-1 bg-white/70 p-1.5 rounded-xl border border-[#fecaca]">
                  💡 Consejo: {validationResult.hint}
                </p>
              )}

              {/* Métricas pedagógicas reales */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#fecaca]/70 text-[11px] font-bold">
                <div className="bg-white p-2 rounded-xl border border-[#fecaca]">
                  <div className="flex justify-between text-[#7f1d1d] mb-1">
                    <span>Recorrido de letra:</span>
                    <span>{validationResult.coverage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#fee2e2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        validationResult.coverage >= 50 ? 'bg-[#10b981]' : 'bg-[#f59e0b]'
                      }`}
                      style={{ width: `${validationResult.coverage}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#9ca3af] block mt-0.5">Necesario: 50% mínimo</span>
                </div>

                <div className="bg-white p-2 rounded-xl border border-[#fecaca]">
                  <div className="flex justify-between text-[#7f1d1d] mb-1">
                    <span>Dentro del camino:</span>
                    <span>{validationResult.precision}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#fee2e2] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        validationResult.precision >= 60 ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                      }`}
                      style={{ width: `${validationResult.precision}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-[#9ca3af] block mt-0.5">Sin garabatos fuera</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VALIDACIÓN EXITOSA CON ESTRELLAS Y PRECISIÓN */}
      {validationResult && validationResult.isValid && isCompleted && (
        <section className="w-full bg-[#f0fdf4] border-2 border-[#86efac] rounded-3xl p-4 shadow-[0_6px_0_0_#bbf7d0]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#dcfce7] flex items-center justify-center text-3xl shrink-0 border border-[#86efac]">
                🌟
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-black text-[#166534]">
                    ¡Trazo Excelente ({validationResult.score}%)!
                  </h4>
                  <div className="flex text-amber-500 text-sm">
                    {Array.from({ length: validationResult.stars }).map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#15803d] font-bold mt-0.5">
                  {validationResult.hint || '¡Tienes una caligrafía maravillosa!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAutoAdvanceCountdown(null);
                handleNextLetter();
              }}
              className="px-4 py-2.5 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl font-black text-xs shadow-[0_3px_0_0_#14532d] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 animate-pulse"
              type="button"
            >
              <span>{autoAdvanceCountdown !== null ? `Siguiente (${autoAdvanceCountdown}s)` : 'Siguiente'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>
      )}

      {/* Tool Palette & Actions */}
      <section className="flex flex-col gap-3 pt-1">
        {/* Crayons Row & Eraser */}
        <div className="flex items-center justify-between gap-2 bg-[#ffeae1] p-3 rounded-2xl shadow-[0_4px_0_0_#ffd0bb] border border-[#ffd0bb]">
          <div aria-label="Selecciona un color de pintura" className="flex items-center gap-2.5" role="radiogroup">
            {CRAYON_COLORS.map(crayon => {
              const isSelected = selectedColor.id === crayon.id;
              return (
                <button
                  key={crayon.id}
                  onClick={() => {
                    setSelectedColor(crayon);
                    playPop(520);
                    triggerHaptic(15);
                  }}
                  aria-label={crayon.name}
                  aria-checked={isSelected}
                  type="button"
                  style={{
                    backgroundColor: crayon.color,
                    boxShadow: isSelected ? `0 5px 0 0 ${crayon.shadow}` : `0 3px 0 0 ${crayon.shadow}`,
                  }}
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all cursor-pointer ${
                    isSelected ? '-translate-y-1 scale-105 ring-2 ring-white' : 'hover:scale-95'
                  }`}
                >
                  {isSelected && <span className="material-symbols-outlined text-[22px]">check</span>}
                </button>
              );
            })}
          </div>

          {/* Eraser Button 🧽 */}
          <button
            onClick={handleClearCanvas}
            aria-label="Limpiar trazo y empezar de nuevo"
            className={`h-11 px-3.5 rounded-2xl bg-white text-[#351000] flex items-center gap-1.5 shadow-[0_4px_0_0_#ffd0bb] active:translate-y-1 active:shadow-[0_1px_0_0_#ffd0bb] transition-all cursor-pointer border border-[#ffd0bb] ${
              isErasingAnimation ? 'rotate-12 scale-105' : ''
            }`}
            type="button"
          >
            <span className="text-lg">🧽</span>
            <span className="text-xs font-bold text-[#534434]">Borrar</span>
          </button>
        </div>

        {/* Big Giant Check CTA Button with Calibration / Real Validation */}
        <button
          onClick={() => {
            if (isCompleted) {
              setAutoAdvanceCountdown(null);
              handleNextLetter();
            } else {
              handleCheckTrace();
            }
          }}
          className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all cursor-pointer border-2 ${
            isCompleted
              ? 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-[0_6px_0_0_#14532d] border-[#14532d] animate-bounce'
              : 'bg-[#006c49] hover:bg-[#00714d] text-white shadow-[0_6px_0_0_#005236] border-[#005236] active:translate-y-1.5 active:shadow-[0_2px_0_0_#005236]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[32px] font-bold">
            {isCompleted ? 'arrow_circle_right' : 'fact_check'}
          </span>
          <span className="text-xl font-bold tracking-wide">
            {isCompleted
              ? `¡Siguiente Letra! (${autoAdvanceCountdown !== null ? `${autoAdvanceCountdown}s` : 'Ya'}) ➔`
              : `Validar Caligrafía de la Letra ${currentExercise.letter}`}
          </span>
        </button>
      </section>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  WRITING_ALPHABET_DATA,
  ALPHABET_KEYS,
  WritingWord,
  getWordsForLetter,
} from '../data/writingWordsData';
import { ASSETS } from '../data/appData';
import {
  playPop,
  playSparkleChime,
  playFanfare,
  playWiggleError,
  speakSpanish,
  triggerHaptic,
} from '../utils/audio';
import { validateWordCalligraphy, CalligraphyValidationResult } from '../utils/calligraphyValidator';
import { markWordLearned } from '../utils/playerProgress';

interface EscribeScreenProps {
  onBackToMap: () => void;
  onAddStars: (amount: number) => void;
  initialLetter?: string;
}

type WritingMode = 'teclado' | 'caligrafia' | 'dictado';

const CRAYONS = [
  { id: 'fresa', name: 'Rosa Fresa', color: '#ec4899', border: '#db2777' },
  { id: 'cielo', name: 'Azul Cielo', color: '#0284c7', border: '#0369a1' },
  { id: 'menta', name: 'Verde Menta', color: '#10b981', border: '#059669' },
  { id: 'sol', name: 'Amarillo Sol', color: '#f59e0b', border: '#d97706' },
  { id: 'magia', name: 'Morado Magia', color: '#8b5cf6', border: '#7c3aed' },
];

export const EscribeScreen: React.FC<EscribeScreenProps> = ({
  onBackToMap,
  onAddStars,
  initialLetter = 'A',
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>(() => {
    const upper = initialLetter.toUpperCase();
    return WRITING_ALPHABET_DATA[upper] ? upper : 'A';
  });

  const [activeMode, setActiveMode] = useState<WritingMode>('teclado');

  // Words for current letter
  const currentLetterData = WRITING_ALPHABET_DATA[selectedLetter] || WRITING_ALPHABET_DATA['A'];
  const words = currentLetterData.words;
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const currentWord: WritingWord = words[selectedWordIndex] || words[0];

  // Mode 1: Teclado Mágico state
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [wrongShakeIndex, setWrongShakeIndex] = useState<number | null>(null);
  const [isWordCompleted, setIsWordCompleted] = useState<boolean>(false);
  const [hintActive, setHintActive] = useState<boolean>(false);

  // Mode 2: Caligrafía Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [selectedCrayon, setSelectedCrayon] = useState(CRAYONS[0]);
  const [isEraser, setIsEraser] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(7);
  const [canvasDrawnPixels, setCanvasDrawnPixels] = useState<number>(0);
  const [canvasCompleted, setCanvasCompleted] = useState(false);
  const [caligrafiaFeedback, setCaligrafiaFeedback] = useState<CalligraphyValidationResult | null>(null);

  // Mode 3: Dictado state
  const [dictadoTyped, setDictadoTyped] = useState<string[]>([]);
  const [dictadoRevealed, setDictadoRevealed] = useState<boolean>(false);
  const [dictadoSuccess, setDictadoSuccess] = useState<boolean>(false);

  // Saved learned words in localStorage
  const [learnedWords, setLearnedWords] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('palabritas_learned_written_words');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track completed words count
  const saveLearnedWord = (wordId: string) => {
    setLearnedWords(prev => {
      markWordLearned(wordId);
      if (prev.includes(wordId)) return prev;
      const updated = [...prev, wordId];
      try {
        localStorage.setItem('palabritas_learned_written_words', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Reset inputs when letter or word changes
  useEffect(() => {
    setTypedLetters([]);
    setDictadoTyped([]);
    setIsWordCompleted(false);
    setDictadoSuccess(false);
    setDictadoRevealed(false);
    setHintActive(false);
    clearCaligrafiaCanvas();
    setCanvasCompleted(false);
    setCaligrafiaFeedback(null);
  }, [selectedLetter, selectedWordIndex]);

  // Pronounce word on load
  const handlePlayWordAudio = () => {
    playPop(440);
    triggerHaptic(15);
    speakSpanish(`${currentWord.displayWord}. ${currentWord.meaning}`);
  };

  const handlePlayPhonetics = () => {
    playPop(480);
    triggerHaptic(20);
    speakSpanish(`Deletreamos: ${currentWord.phoneticHint}`);
  };

  // Clear canvas
  const clearCaligrafiaCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasDrawnPixels(0);
    setCanvasCompleted(false);
    setCaligrafiaFeedback(null);
  };

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pointsDrawn = 0;

    const startDraw = (e: MouseEvent | TouchEvent) => {
      isDrawingRef.current = true;
      triggerHaptic(10);
      setCaligrafiaFeedback(prev => (prev && !prev.isValid ? null : prev));

      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = isEraser ? '#ffffff' : selectedCrayon.color;
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;

      ctx.lineTo(x, y);
      ctx.stroke();
      pointsDrawn++;
      if (pointsDrawn % 15 === 0) {
        setCanvasDrawnPixels(p => p + 1);
      }
    };

    const stopDraw = () => {
      if (isDrawingRef.current) {
        ctx.closePath();
        isDrawingRef.current = false;
      }
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      canvas.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', stopDraw);

      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      window.removeEventListener('touchend', stopDraw);
    };
  }, [brushSize, isEraser, selectedCrayon]);

  // Mode 1: Handle letter input from keyboard
  const handleKeyClick = (letterPressed: string) => {
    if (isWordCompleted) return;
    const targetWordStr = currentWord.word;
    const nextExpectedIndex = typedLetters.length;
    const nextExpectedLetter = targetWordStr[nextExpectedIndex];

    if (letterPressed === nextExpectedLetter) {
      playPop(520 + nextExpectedIndex * 40);
      triggerHaptic(20);
      const updated = [...typedLetters, letterPressed];
      setTypedLetters(updated);
      speakSpanish(letterPressed.toLowerCase());

      if (updated.length === targetWordStr.length) {
        // Complete!
        setIsWordCompleted(true);
        saveLearnedWord(currentWord.id);
        onAddStars(3);
        playFanfare();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#ec4899'],
        });
        setTimeout(() => {
          speakSpanish(`¡Excelente! ¡Escribiste ${currentWord.displayWord}! ¡Eres una gran escritora!`);
        }, 300);
      }
    } else {
      // Wrong letter
      playWiggleError();
      triggerHaptic([30, 30]);
      setWrongShakeIndex(nextExpectedIndex);
      setTimeout(() => setWrongShakeIndex(null), 500);
      speakSpanish(`¡Casi! Escucha el siguiente sonido: ${nextExpectedLetter}`);
    }
  };

  const handleBackspace = () => {
    if (typedLetters.length > 0 && !isWordCompleted) {
      playPop(340);
      triggerHaptic(15);
      setTypedLetters(prev => prev.slice(0, prev.length - 1));
    }
  };

  // Mode 2: Validate Caligrafia Trazo con motor de caligrafía
  const handleVerifyCaligrafia = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const result = validateWordCalligraphy(canvas, currentWord.word);
    setCaligrafiaFeedback(result);

    if (!result.isValid) {
      playWiggleError();
      triggerHaptic([35, 45]);
      setCanvasCompleted(false);
      speakSpanish(result.message + (result.hint ? ' ' + result.hint : ''));
      return;
    }

    // ¡Válido!
    playSparkleChime();
    playFanfare();
    triggerHaptic([40, 50, 80]);
    setCanvasCompleted(true);
    saveLearnedWord(currentWord.id);
    const starsEarned = result.stars === 3 ? 5 : 3;
    onAddStars(starsEarned);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6cf8bb', '#38bdf8', '#f59e0b'],
    });
    speakSpanish(result.message);
  };

  // Mode 3: Dictado input
  const handleDictadoKeyClick = (letterPressed: string) => {
    if (dictadoSuccess) return;
    const targetWordStr = currentWord.word;
    const nextExpectedIndex = dictadoTyped.length;
    const nextExpectedLetter = targetWordStr[nextExpectedIndex];

    if (letterPressed === nextExpectedLetter) {
      playPop(500 + nextExpectedIndex * 40);
      triggerHaptic(20);
      const updated = [...dictadoTyped, letterPressed];
      setDictadoTyped(updated);

      if (updated.length === targetWordStr.length) {
        setDictadoSuccess(true);
        setDictadoRevealed(true);
        saveLearnedWord(currentWord.id);
        onAddStars(4);
        playFanfare();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#38bdf8', '#10b981'],
        });
        setTimeout(() => {
          speakSpanish(`¡Genial! ¡Superaste el dictado de la palabra ${currentWord.displayWord}!`);
        }, 300);
      }
    } else {
      playWiggleError();
      triggerHaptic([30, 30]);
      speakSpanish('¡Intenta otra letra!');
    }
  };

  const handleDictadoBackspace = () => {
    if (dictadoTyped.length > 0 && !dictadoSuccess) {
      playPop(340);
      triggerHaptic(15);
      setDictadoTyped(prev => prev.slice(0, prev.length - 1));
    }
  };

  const handleDictadoHearAgain = () => {
    playPop(480);
    triggerHaptic(20);
    speakSpanish(`Escucha con atención: Escribe la palabra ${currentWord.displayWord}. ${currentWord.meaning}`);
  };

  // Kid-friendly keyboard rows
  const KEYBOARD_ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const KEYBOARD_ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'];
  const KEYBOARD_ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  // Current next expected letter for hints
  const nextExpectedLetter = isWordCompleted
    ? ''
    : currentWord.word[typedLetters.length] || '';

  return (
    <div className="flex flex-col gap-4 pb-12 animate-fade-in">
      {/* Top Navigation & Header */}
      <div className="bg-white rounded-3xl p-4 shadow-[0_6px_0_0_#ffd0bb] border-2 border-[#ffd0bb] flex items-center justify-between">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#fff1eb] text-[#351000] font-bold text-sm shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform cursor-pointer border border-[#ffd0bb]"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Mundos</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#fef3c7] text-[#855300] px-3 py-1.5 rounded-2xl border border-[#fde68a] text-xs font-black">
            <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">auto_awesome</span>
            <span>Escribir Palabras</span>
          </div>
          <div className="flex items-center gap-1 bg-[#dcfce7] text-[#166534] px-2.5 py-1.5 rounded-2xl border border-[#bbf7d0] text-xs font-black">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>{learnedWords.length} escritas</span>
          </div>
        </div>
      </div>

      {/* A to Z Horizontal Letter Carousel */}
      <div className="bg-white rounded-3xl p-3.5 shadow-[0_6px_0_0_#ffd0bb] border-2 border-[#ffd0bb]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-[#534434] uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">spellcheck</span>
            Elige una letra del abecedario (A - Z):
          </span>
          <span className="text-xs font-bold text-[#f59e0b]">
            Familia de la {selectedLetter}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {ALPHABET_KEYS.map(letterKey => {
            const isSelected = selectedLetter === letterKey;
            const letterObj = WRITING_ALPHABET_DATA[letterKey];
            const wordsForThisLetter = letterObj.words;
            const completedCount = wordsForThisLetter.filter(w => learnedWords.includes(w.id)).length;

            return (
              <button
                key={letterKey}
                onClick={() => {
                  playPop(520);
                  triggerHaptic(15);
                  setSelectedLetter(letterKey);
                  setSelectedWordIndex(0);
                  speakSpanish(`Letra ${letterKey}... ¡Palabras con la ${letterKey}!`);
                }}
                className={`flex-shrink-0 w-11 h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#f59e0b] text-white shadow-[0_4px_0_0_#d97706] scale-105 -translate-y-0.5'
                    : 'bg-[#fff8f6] text-[#351000] border-2 border-[#ffd0bb] shadow-[0_3px_0_0_#ffe2d6] hover:bg-[#ffe2d6]'
                }`}
              >
                <span className="text-lg leading-none">{letterKey}</span>
                {completedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10b981] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Selector Chips for the Active Letter */}
      <div className="bg-white rounded-3xl p-3.5 shadow-[0_6px_0_0_#ffd0bb] border-2 border-[#ffd0bb]">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-black text-[#534434] uppercase tracking-wider">
            Palabras con la letra {selectedLetter}:
          </span>
          <button
            onClick={handlePlayPhonetics}
            className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            Deletrear
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {words.map((w, idx) => {
            const isWordSelected = idx === selectedWordIndex;
            const isLearned = learnedWords.includes(w.id);

            return (
              <button
                key={w.id}
                onClick={() => {
                  playPop(480);
                  triggerHaptic(15);
                  setSelectedWordIndex(idx);
                  speakSpanish(w.displayWord);
                }}
                className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 transition-all cursor-pointer text-left ${
                  isWordSelected
                    ? 'bg-[#ffe2d6] border-[#f59e0b] shadow-[0_4px_0_0_#d97706] scale-[1.02]'
                    : 'bg-[#fff8f6] border-[#ffd0bb] shadow-[0_2px_0_0_#ffe2d6] hover:bg-[#fff1eb]'
                }`}
              >
                <span className="text-2xl">{w.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-[#351000] truncate flex items-center gap-1">
                    {w.displayWord}
                    {isLearned && <span className="text-[#10b981] text-[12px]">★</span>}
                  </div>
                  <div className="text-[10px] text-[#855300] font-bold">
                    {w.syllables.join(' - ')}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Learning Modes Switcher */}
      <div className="flex bg-[#ffe2d6] p-1.5 rounded-2xl border border-[#ffd0bb] shadow-[0_3px_0_0_#ffd0bb]">
        <button
          onClick={() => {
            playPop(420);
            setActiveMode('teclado');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'teclado'
              ? 'bg-[#f59e0b] text-white shadow-[0_3px_0_0_#d97706]'
              : 'text-[#613b00] hover:bg-[#ffdbcc]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">keyboard</span>
          <span>Letra por Letra</span>
        </button>

        <button
          onClick={() => {
            playPop(420);
            setActiveMode('caligrafia');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'caligrafia'
              ? 'bg-[#f59e0b] text-white shadow-[0_3px_0_0_#d97706]'
              : 'text-[#613b00] hover:bg-[#ffdbcc]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span>Caligrafía</span>
        </button>

        <button
          onClick={() => {
            playPop(420);
            setActiveMode('dictado');
            handleDictadoHearAgain();
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeMode === 'dictado'
              ? 'bg-[#f59e0b] text-white shadow-[0_3px_0_0_#d97706]'
              : 'text-[#613b00] hover:bg-[#ffdbcc]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">hearing</span>
          <span>Dictado</span>
        </button>
      </div>

      {/* Target Word Hero Display */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_8px_0_0_#ffd0bb] border-2 border-[#ffd0bb] flex flex-col items-center text-center relative overflow-hidden">
        {/* Confetti or badge on complete */}
        {isWordCompleted && activeMode === 'teclado' && (
          <div className="absolute top-2 right-2 bg-[#6cf8bb] text-[#00714d] text-xs font-black px-3 py-1 rounded-full shadow-xs animate-bounce">
            ¡COMPLETADA! ⭐⭐⭐
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">{currentWord.emoji}</span>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[#351000]">{currentWord.displayWord}</span>
              <button
                onClick={handlePlayWordAudio}
                className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#855300] flex items-center justify-center hover:bg-[#fde68a] active:scale-90 transition-transform cursor-pointer border border-[#fde68a]"
                title="Escuchar palabra"
              >
                <span className="material-symbols-outlined text-[18px]">volume_up</span>
              </button>
            </div>
            <p className="text-xs text-[#855300] font-bold mt-0.5">{currentWord.meaning}</p>
          </div>
        </div>

        {/* MODE 1: LETRA POR LETRA (TECLADO MÁGICO) */}
        {activeMode === 'teclado' && (
          <div className="w-full flex flex-col items-center mt-3">
            {/* Word Letter Slots */}
            <div className="flex gap-2 justify-center my-3 flex-wrap">
              {currentWord.word.split('').map((letterChar, idx) => {
                const isFilled = idx < typedLetters.length;
                const isNext = idx === typedLetters.length;
                const isShaking = wrongShakeIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                      isShaking ? 'animate-shake bg-red-100 border-2 border-red-500' : ''
                    } ${
                      isFilled
                        ? 'bg-[#6cf8bb] text-[#00714d] shadow-[0_4px_0_0_#4edea3] scale-105'
                        : isNext
                        ? 'bg-[#fff8f6] border-2 border-dashed border-[#f59e0b] shadow-[0_3px_0_0_#fde68a] text-[#855300]'
                        : 'bg-[#fff8f6] border-2 border-dashed border-[#ffd0bb] text-[#ffd0bb]'
                    }`}
                  >
                    {isFilled ? (
                      typedLetters[idx]
                    ) : isNext && hintActive ? (
                      <span className="text-[#f59e0b] opacity-60 animate-pulse">{letterChar}</span>
                    ) : (
                      <span className="text-sm opacity-40">_</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Hint & Control Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  playSparkleChime();
                  triggerHaptic(15);
                  setHintActive(true);
                  speakSpanish(`Pista: la siguiente letra es la ${nextExpectedLetter}`);
                }}
                disabled={isWordCompleted || !nextExpectedLetter}
                className="px-3 py-1.5 rounded-full bg-[#fef3c7] text-[#855300] text-xs font-bold border border-[#fde68a] hover:bg-[#fde68a] active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">lightbulb</span>
                <span>Pista</span>
              </button>

              <button
                onClick={handleBackspace}
                disabled={typedLetters.length === 0 || isWordCompleted}
                className="px-3 py-1.5 rounded-full bg-[#fee2e2] text-[#991b1b] text-xs font-bold border border-[#fca5a5] hover:bg-[#fca5a5] active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">backspace</span>
                <span>Borrar</span>
              </button>

              <button
                onClick={() => {
                  setTypedLetters([]);
                  setIsWordCompleted(false);
                  setHintActive(false);
                  playPop(350);
                }}
                className="px-3 py-1.5 rounded-full bg-[#e0f2fe] text-[#0369a1] text-xs font-bold border border-[#bae6fd] hover:bg-[#bae6fd] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Reiniciar</span>
              </button>
            </div>

            {/* Child-Friendly On-Screen Alphabet Keyboard */}
            <div className="w-full max-w-md bg-[#fff1eb] p-2.5 rounded-2xl border-2 border-[#ffd0bb] flex flex-col gap-1.5">
              {/* Row 1 */}
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_1.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Row 2 */}
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_2.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Row 3 */}
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_3.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: PIZARRA DE CALIGRAFÍA */}
        {activeMode === 'caligrafia' && (
          <div className="w-full flex flex-col items-center mt-3">
            {/* Montessori Calligraphy Canvas Card */}
            <div className="relative w-full max-w-md h-56 bg-[#fffdfa] rounded-2xl border-2 border-[#ffd0bb] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Ruled Montessori Lines (Cielo, Tierra, Raíz) */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-around px-4 opacity-50">
                <div className="border-b-2 border-[#38bdf8] w-full flex items-center justify-end">
                  <span className="text-[10px] text-[#0284c7] font-bold">Cielo 🌤️</span>
                </div>
                <div className="border-b-2 border-dashed border-[#10b981] w-full flex items-center justify-end">
                  <span className="text-[10px] text-[#059669] font-bold">Tierra 🌱</span>
                </div>
                <div className="border-b-2 border-[#b45309] w-full flex items-center justify-end">
                  <span className="text-[10px] text-[#78350f] font-bold">Base 🌾</span>
                </div>
              </div>

              {/* Faint Stencil of the Word to trace over */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span className="text-6xl font-black text-[#534434]/15 tracking-widest select-none font-['Quicksand']">
                  {currentWord.word}
                </span>
              </div>

              {/* The Drawing Canvas */}
              <canvas
                ref={canvasRef}
                width={380}
                height={220}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              />
            </div>

            {/* Crayons & Eraser Toolbar */}
            <div className="flex items-center justify-between w-full max-w-md mt-3 px-2 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                {CRAYONS.map(crayon => (
                  <button
                    key={crayon.id}
                    onClick={() => {
                      playPop(480);
                      setSelectedCrayon(crayon);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: crayon.color }}
                    className={`w-8 h-8 rounded-full shadow-md transition-transform cursor-pointer ${
                      !isEraser && selectedCrayon.id === crayon.id
                        ? 'scale-125 ring-3 ring-offset-2 ring-[#f59e0b]'
                        : 'hover:scale-110'
                    }`}
                    title={crayon.name}
                  />
                ))}

                {/* Eraser */}
                <button
                  onClick={() => {
                    playPop(350);
                    setIsEraser(true);
                  }}
                  className={`w-8 h-8 rounded-full bg-white border-2 border-[#ffd0bb] flex items-center justify-center text-[#534434] shadow-md transition-transform cursor-pointer ${
                    isEraser ? 'scale-125 ring-3 ring-offset-2 ring-[#f59e0b]' : 'hover:scale-110'
                  }`}
                  title="Goma de borrar"
                >
                  <span className="material-symbols-outlined text-[18px]">ink_eraser</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearCaligrafiaCanvas}
                  className="px-3 py-1.5 rounded-xl bg-[#fee2e2] text-[#991b1b] text-xs font-bold border border-[#fca5a5] hover:bg-[#fca5a5] transition-colors cursor-pointer"
                >
                  Limpiar
                </button>

                <button
                  onClick={handleVerifyCaligrafia}
                  className="px-4 py-1.5 rounded-xl bg-[#10b981] text-white text-xs font-black shadow-[0_3px_0_0_#059669] hover:bg-[#059669] active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>¡Listo!</span>
                </button>
              </div>
            </div>

            {/* Banner de Validación de Caligrafía */}
            {caligrafiaFeedback && !caligrafiaFeedback.isValid && (
              <div className="w-full max-w-md bg-[#fff5f5] border-2 border-[#fca5a5] rounded-2xl p-3 mt-3 shadow-xs animate-wiggle">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl">
                    {caligrafiaFeedback.status === 'scribble' ? '🧽' : caligrafiaFeedback.status === 'incomplete' ? '✏️' : '🎨'}
                  </span>
                  <div className="flex-1 text-left">
                    <h5 className="text-xs font-black text-[#991b1b]">
                      {caligrafiaFeedback.status === 'scribble'
                        ? 'Muchos garabatos fuera de las líneas'
                        : caligrafiaFeedback.status === 'incomplete'
                        ? '¡Palabra incompleta!'
                        : '¡Lienzo vacío!'}
                    </h5>
                    <p className="text-[11px] text-[#7f1d1d] font-medium leading-tight mt-0.5">
                      {caligrafiaFeedback.message}
                    </p>
                    {caligrafiaFeedback.hint && (
                      <p className="text-[10px] text-[#b91c1c] font-bold mt-1 bg-white/70 p-1.5 rounded-xl border border-[#fecaca]">
                        💡 {caligrafiaFeedback.hint}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold">
                      <span className="text-[#855300]">Cobertura: {caligrafiaFeedback.coverage}%</span>
                      <span className="text-[#855300]">• Precisión: {caligrafiaFeedback.precision}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {caligrafiaFeedback && caligrafiaFeedback.isValid && canvasCompleted && (
              <div className="w-full max-w-md bg-[#f0fdf4] border-2 border-[#86efac] rounded-2xl p-3 mt-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌟</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-black text-[#166534]">
                        ¡Caligrafía Aprobada! ({caligrafiaFeedback.score}%)
                      </h5>
                      <span className="text-xs">{'⭐'.repeat(caligrafiaFeedback.stars)}</span>
                    </div>
                    <p className="text-[11px] text-[#15803d] font-bold mt-0.5">
                      {caligrafiaFeedback.hint || '¡Qué letra tan bonita y bien cuidada!'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 3: DICTADO (ESCUCHA Y ESCRIBE) */}
        {activeMode === 'dictado' && (
          <div className="w-full flex flex-col items-center mt-3">
            <div className="bg-[#fef3c7] p-3 rounded-2xl border border-[#fde68a] text-center mb-3 max-w-sm">
              <span className="text-xs font-bold text-[#855300] block mb-1">
                👂 Escucha la palabra mágica y escríbela:
              </span>
              <button
                onClick={handleDictadoHearAgain}
                className="px-4 py-2 rounded-2xl bg-[#f59e0b] text-white font-black text-sm shadow-[0_3px_0_0_#d97706] hover:bg-[#d97706] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">volume_up</span>
                <span>Escuchar de nuevo</span>
              </button>
            </div>

            {/* Dictado Slots */}
            <div className="flex gap-2 justify-center my-3 flex-wrap">
              {currentWord.word.split('').map((letterChar, idx) => {
                const isFilled = idx < dictadoTyped.length;

                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                      isFilled
                        ? 'bg-[#42bbff] text-[#00344d] shadow-[0_4px_0_0_#0284c7] scale-105'
                        : 'bg-[#fff8f6] border-2 border-dashed border-[#ffd0bb] text-[#ffd0bb]'
                    }`}
                  >
                    {isFilled ? dictadoTyped[idx] : <span className="text-sm opacity-40">?</span>}
                  </div>
                );
              })}
            </div>

            {/* Dictado Controls */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleDictadoBackspace}
                disabled={dictadoTyped.length === 0 || dictadoSuccess}
                className="px-3 py-1.5 rounded-full bg-[#fee2e2] text-[#991b1b] text-xs font-bold border border-[#fca5a5] hover:bg-[#fca5a5] active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">backspace</span>
                <span>Borrar</span>
              </button>

              <button
                onClick={() => {
                  setDictadoRevealed(true);
                  speakSpanish(`La palabra es: ${currentWord.displayWord}`);
                }}
                className="px-3 py-1.5 rounded-full bg-[#e0f2fe] text-[#0369a1] text-xs font-bold border border-[#bae6fd] hover:bg-[#bae6fd] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Ver palabra</span>
              </button>
            </div>

            {/* Keyboard for dictado */}
            <div className="w-full max-w-md bg-[#fff1eb] p-2.5 rounded-2xl border-2 border-[#ffd0bb] flex flex-col gap-1.5">
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_1.map(key => (
                  <button
                    key={key}
                    onClick={() => handleDictadoKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_2.map(key => (
                  <button
                    key={key}
                    onClick={() => handleDictadoKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {KEYBOARD_ROW_3.map(key => (
                  <button
                    key={key}
                    onClick={() => handleDictadoKeyClick(key)}
                    className="flex-1 min-w-[28px] max-w-[38px] h-10 rounded-xl bg-white text-[#351000] font-black text-sm shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] hover:bg-[#ffe2d6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chispita Motivational Feedback */}
      <div className="bg-[#fff8f6] rounded-3xl p-4 border-2 border-[#ffd0bb] shadow-[0_4px_0_0_#ffe2d6] flex items-center gap-3">
        <img
          src={ASSETS.chispitaAvatar}
          alt="Chispita"
          className="w-12 h-12 rounded-full border-2 border-[#f59e0b] shadow-sm flex-shrink-0"
        />
        <div className="flex-1">
          <span className="text-xs font-black text-[#f59e0b] uppercase tracking-wider block">
            Consejo de Chispita:
          </span>
          <p className="text-xs text-[#534434] font-medium leading-relaxed">
            «¡Escribir es dibujar los sonidos que salen de tu corazón! Practica con cada letra del abecedario y colecciona todas tus palabras doradas.»
          </p>
        </div>
      </div>
    </div>
  );
};

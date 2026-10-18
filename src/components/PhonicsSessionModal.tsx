import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS } from '../data/appData';
import { playPop, playSparkleChime, playFanfare, playWiggleError, speakSpanish, triggerHaptic } from '../utils/audio';

interface PhonicsSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete: () => void;
  onAddStars: (amount: number) => void;
}

export const PhonicsSessionModal: React.FC<PhonicsSessionModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
  onAddStars,
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>(['sol', 'sopa']);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  if (!isOpen) return null;

  const handleToggleWord = (wordId: string) => {
    playPop(480);
    triggerHaptic(20);

    if (wordId === 'sol') {
      speakSpanish('Sol... Empieza con sss.');
    } else if (wordId === 'sopa') {
      speakSpanish('Sopa... Empieza con sss.');
    } else if (wordId === 'mesa') {
      playWiggleError();
      speakSpanish('Mesa empieza con mmm. El sonido s está al medio.');
      return;
    } else if (wordId === 'rana') {
      playWiggleError();
      speakSpanish('Rana empieza con rrr. Ese es el próximo reto.');
      return;
    }

    if (selectedWords.includes(wordId)) {
      setSelectedWords(prev => prev.filter(w => w !== wordId));
    } else {
      setSelectedWords(prev => [...prev, wordId]);
    }
  };

  const handleListenModel = () => {
    playPop(520);
    triggerHaptic(25);
    speakSpanish('ssssssss... sss... serpiente... sol... sopa');
  };

  const handleTestBreathing = () => {
    playPop(440);
    triggerHaptic(30);
    setIsBreathingActive(true);
    speakSpanish('Inhala hondo... y vibra los labios: brrrrrrrrrr');
    setTimeout(() => {
      setIsBreathingActive(false);
      playSparkleChime();
    }, 2500);
  };

  const handleCompleteAndContinue = () => {
    playFanfare();
    triggerHaptic([40, 50, 40, 80]);
    onAddStars(15);
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171'],
    });

    speakSpanish('¡Excelente trabajo! Has completado el circuito fonético de la serpiente.');
    setTimeout(() => {
      onSessionComplete();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#351000]/60 backdrop-blur-sm flex justify-center p-3 select-none">
      <div className="w-full max-w-lg bg-[#fff8f6] rounded-3xl p-5 shadow-2xl relative my-auto flex flex-col border-4 border-[#ffddb8] max-h-[96vh] overflow-y-auto">
        {/* 1. BARRA SUPERIOR DEL EJERCICIO & PROGRESO */}
        <section className="flex flex-col gap-2.5 mb-4">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                playPop(380);
                triggerHaptic(15);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#ffe2d6] text-[#351000] shadow-[0_4px_0_0_#ffd0bb] active:translate-y-0.5 transition-all cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="text-xs font-bold">Volver</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffeae1] text-[#855300] font-bold shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb]">
              <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">rocket_launch</span>
              <span className="text-xs">Sesión: /S/ y /R/</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#6cf8bb] text-[#00714d] font-bold shadow-[0_3px_0_0_#4edea3]">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="text-xs">+5</span>
            </div>
          </div>

          {/* Barra de progreso del circuito */}
          <div className="bg-[#fff1eb] p-3 rounded-2xl flex flex-col gap-2 shadow-sm border border-[#ffd0bb]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f59e0b] text-[#613b00] font-bold text-xs">
                  2
                </span>
                <span className="text-xs text-[#351000] font-bold">El sonido de la serpiente (/s/)</span>
              </div>
              <span className="text-xs text-[#534434] font-bold">Paso 2 de 4</span>
            </div>

            {/* Track de 4 pasos */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="h-3 rounded-full bg-[#006c49] shadow-inner flex items-center justify-end pr-0.5">
                <span className="material-symbols-outlined text-[10px] text-white">check</span>
              </div>
              <div className="h-3 rounded-full bg-[#f59e0b] relative shadow-[0_2px_0_0_#d97706] animate-pulse">
                <div className="absolute -top-1.5 right-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                </div>
              </div>
              <div className="h-3 rounded-full bg-[#ffdbcc]"></div>
              <div className="h-3 rounded-full bg-[#ffdbcc]"></div>
            </div>
          </div>
        </section>

        {/* 2. MODELO OROFACIAL & CHISPITA */}
        <section className="bg-white rounded-3xl p-4 shadow-[0_6px_0_0_#ffe2d6] mb-4 flex flex-col gap-3 border border-[#ffd0bb]">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center shadow-[0_4px_0_0_#ffdbcc] p-1 border border-[#ffd0bb]">
                <img
                  className="w-full h-full rounded-full object-cover"
                  alt="Chispita con gafas de piloto"
                  src={ASSETS.chispitaGoggles}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6cf8bb] flex items-center justify-center text-[#00714d] shadow-sm">
                <span className="material-symbols-outlined text-[14px]">volume_up</span>
              </div>
            </div>

            <div className="flex-1 bg-[#fff1eb] rounded-2xl p-3 relative shadow-xs border border-[#ffd0bb]">
              <p className="text-sm text-[#351000] font-bold leading-tight">
                ¡Vamos a imitar a la serpiente! 🐍
              </p>
              <p className="text-xs text-[#534434] mt-1 leading-snug">
                Junta tus dientecitos sonriendo y sopla despacito: <strong className="text-[#855300]">/ssssssss/</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#ffeae1] px-3.5 py-2 rounded-full text-[#534434] border border-[#ffd0bb]">
            <span className="material-symbols-outlined text-[#855300] text-[18px]">lightbulb</span>
            <span className="text-xs">
              <strong>Tip secreto:</strong> Dientes juntos + aire suave saliendo 🌬️
            </span>
          </div>

          <div className="flex gap-2 pt-0.5">
            <button
              onClick={handleListenModel}
              className="flex-1 h-14 rounded-2xl bg-[#42bbff] hover:bg-[#89ceff] text-white flex items-center justify-center gap-2 shadow-[0_5px_0_0_#006591] active:translate-y-1 transition-all cursor-pointer border border-[#006591]/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">record_voice_over</span>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold leading-none">Escuchar modelo /s/</span>
                <span className="text-[11px] opacity-90 font-medium">Sonido natural guiado</span>
              </div>
            </button>
            <button
              onClick={() => {
                playPop(420);
                speakSpanish('s... s... s...');
              }}
              className="w-14 h-14 rounded-2xl bg-[#ffe2d6] text-[#351000] flex flex-col items-center justify-center shadow-[0_5px_0_0_#ffd0bb] active:translate-y-1 transition-all cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">speed</span>
              <span className="text-[10px] font-bold">Lento</span>
            </button>
          </div>
        </section>

        {/* 3. EJERCICIO ACTIVO: ATRAPA LAS PALABRAS CON /S/ */}
        <section className="flex flex-col gap-2.5 mb-4">
          <div className="bg-[#fff1eb] px-4 py-3 rounded-2xl shadow-xs border border-[#ffd0bb]">
            <p className="text-[11px] text-[#855300] uppercase tracking-wider font-bold">Desafío auditivo</p>
            <h2 className="text-lg text-[#351000] font-bold leading-tight">
              ¿Cuáles empiezan con el sonido /S/?
            </h2>
            <p className="text-xs text-[#534434]">
              Toca las imágenes correctas para atraparlas.
            </p>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Sol (Correcta) */}
            <button
              onClick={() => handleToggleWord('sol')}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer border-2 ${
                selectedWords.includes('sol')
                  ? 'bg-white shadow-[0_6px_0_0_#00714d] border-[#00714d]'
                  : 'bg-[#fff1eb] shadow-[0_4px_0_0_#ffd0bb] border-[#ffd0bb]'
              }`}
              type="button"
            >
              {selectedWords.includes('sol') && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#6cf8bb] text-[#00714d] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                </div>
              )}
              <div className="w-full h-24 rounded-xl bg-[#fff1eb] overflow-hidden mb-2 p-1 flex items-center justify-center">
                <img className="w-full h-full object-contain" alt="Sol" src={ASSETS.sunCard} />
              </div>
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-xl font-bold text-[#006c49]">Sol</span>
                  <span className="text-xs text-[#534434]">/sol/</span>
                </div>
                <span className="material-symbols-outlined text-[#855300] text-[22px]">volume_up</span>
              </div>
            </button>

            {/* Sopa (Correcta) */}
            <button
              onClick={() => handleToggleWord('sopa')}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all cursor-pointer border-2 ${
                selectedWords.includes('sopa')
                  ? 'bg-white shadow-[0_6px_0_0_#00714d] border-[#00714d]'
                  : 'bg-[#fff1eb] shadow-[0_4px_0_0_#ffd0bb] border-[#ffd0bb]'
              }`}
              type="button"
            >
              {selectedWords.includes('sopa') && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#6cf8bb] text-[#00714d] flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                </div>
              )}
              <div className="w-full h-24 rounded-xl bg-[#fff1eb] overflow-hidden mb-2 p-1 flex items-center justify-center">
                <img className="w-full h-full object-contain" alt="Sopa" src={ASSETS.soupCard} />
              </div>
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-xl font-bold text-[#006c49]">Sopa</span>
                  <span className="text-xs text-[#534434]">/so - pa/</span>
                </div>
                <span className="material-symbols-outlined text-[#855300] text-[22px]">volume_up</span>
              </div>
            </button>

            {/* Mesa (Distractor) */}
            <button
              onClick={() => handleToggleWord('mesa')}
              className="relative flex flex-col items-center p-3 rounded-2xl bg-white shadow-[0_4px_0_0_#ffd0bb] active:translate-y-0.5 transition-all cursor-pointer border border-[#ffd0bb] opacity-90"
              type="button"
            >
              <div className="w-full h-24 rounded-xl bg-[#fff1eb] overflow-hidden mb-2 p-1 flex items-center justify-center">
                <img className="w-full h-full object-contain" alt="Mesa" src={ASSETS.tableFlat} />
              </div>
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-lg font-bold text-[#351000]">Mesa</span>
                  <span className="text-[11px] text-[#867461]">Empieza con /m/</span>
                </div>
                <span className="material-symbols-outlined text-[#534434] text-[20px]">volume_up</span>
              </div>
              <span className="mt-1 w-full text-center text-[10px] font-bold text-[#855300] bg-[#ffeae1] py-0.5 rounded-full">
                /s/ está al medio
              </span>
            </button>

            {/* Rana (Distractor) */}
            <button
              onClick={() => handleToggleWord('rana')}
              className="relative flex flex-col items-center p-3 rounded-2xl bg-white shadow-[0_4px_0_0_#ffd0bb] active:translate-y-0.5 transition-all cursor-pointer border border-[#ffd0bb] opacity-90"
              type="button"
            >
              <div className="w-full h-24 rounded-xl bg-[#fff1eb] overflow-hidden mb-2 p-1 flex items-center justify-center">
                <img className="w-full h-full object-contain" alt="Rana" src={ASSETS.frogCard} />
              </div>
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-lg font-bold text-[#351000]">Rana</span>
                  <span className="text-[11px] text-[#867461]">¡Empieza con /r/!</span>
                </div>
                <span className="material-symbols-outlined text-[#534434] text-[20px]">volume_up</span>
              </div>
              <span className="mt-1 w-full text-center text-[10px] font-bold text-[#006591] bg-[#c9e6ff] py-0.5 rounded-full">
                Próximo reto 🚀
              </span>
            </button>
          </div>
        </section>

        {/* 4. MÓDULO DE TRANSICIÓN FONEMA /R/ */}
        <section className="bg-[#ffe2d6] rounded-3xl p-4 shadow-[0_5px_0_0_#ffd0bb] mb-4 flex flex-col gap-2.5 border border-[#ffd0bb]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#f59e0b] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
            </div>
            <div>
              <h3 className="text-sm text-[#351000] font-bold leading-none">
                Preparando la Moto: Fonema /R/
              </h3>
              <p className="text-[11px] text-[#534434] mt-0.5">
                Paso siguiente en este circuito
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs border border-[#ffd0bb]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌬️</span>
              <div>
                <p className="text-xs font-bold text-[#351000] leading-tight">Reto de respiración</p>
                <p className="text-[11px] text-[#534434]">Inhala y vibra tus labios: <span className="text-[#855300] font-bold">"brrrr"</span></p>
              </div>
            </div>
            <button
              onClick={handleTestBreathing}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isBreathingActive
                  ? 'bg-[#006c49] text-white shadow-none animate-pulse'
                  : 'bg-[#006591] text-white shadow-[0_3px_0_0_#004869] active:translate-y-0.5'
              }`}
              type="button"
            >
              {isBreathingActive ? '¡Vibrando!' : 'Probar'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#fff1eb] p-2.5 rounded-xl flex items-center gap-2 border border-[#ffd0bb]">
              <span className="text-xl">🍐</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#351000]">Pera</span>
                <span className="text-[10px] text-[#534434]">/r/ suave</span>
              </div>
            </div>
            <div className="bg-[#fff1eb] p-2.5 rounded-xl flex items-center gap-2 border border-[#ffd0bb]">
              <span className="text-xl">🐕</span>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#351000]">Perro</span>
                <span className="text-[10px] text-[#855300] font-bold">/rr/ fuerte</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEEDBACK Y ACCIÓN INFERIOR */}
        <section className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center justify-center gap-2 bg-[#6cf8bb] text-[#00714d] py-2 px-4 rounded-full shadow-[0_2px_0_0_#4edea3]">
            <span className="material-symbols-outlined text-[18px]">stars</span>
            <span className="text-xs font-bold">2 de 2 palabras encontradas ¡Genial!</span>
          </div>

          <button
            onClick={handleCompleteAndContinue}
            className="w-full h-16 py-3 px-6 rounded-2xl bg-[#006c49] hover:bg-[#00714d] text-white flex items-center justify-center gap-2.5 shadow-[0_6px_0_0_#004869] active:translate-y-1.5 active:shadow-[0_2px_0_0_#004869] transition-all cursor-pointer border-2 border-[#005236]"
            type="button"
          >
            <span className="text-lg font-bold tracking-wide">¡Comprobar y Continuar!</span>
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        </section>
      </div>
    </div>
  );
};

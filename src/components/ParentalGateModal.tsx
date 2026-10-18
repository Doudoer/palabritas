import React, { useState } from 'react';
import { ASSETS } from '../data/appData';
import {
  playPop,
  playSparkleChime,
  speakSpanish,
  triggerHaptic,
  setVoicePreferences,
  setSoundEffects,
} from '../utils/audio';

interface ParentalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPedagogicalReport: () => void;
  onOpenInstallModal?: () => void;
}

const MATH_CHALLENGES = [
  { q: '24 + 15 =', a: '39' },
  { q: '7 × 8 =', a: '56' },
  { q: '45 - 12 =', a: '33' },
  { q: '6 × 7 =', a: '42' },
  { q: '19 + 23 =', a: '42' },
];

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onClose,
  onOpenPedagogicalReport,
  onOpenInstallModal,
}) => {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Settings State
  const [screenTime, setScreenTime] = useState(20);
  const [accent, setAccent] = useState<'latino' | 'castellano'>('latino');
  const [speechSpeed, setSpeechSpeed] = useState<'lenta' | 'normal'>('normal');
  const [fontFamily, setFontFamily] = useState('Imprenta (Quicksand)');
  const [soundEffectsOn, setSoundEffectsOn] = useState(true);
  const [backgroundMusicOn, setBackgroundMusicOn] = useState(true);

  if (!isOpen) return null;

  const currentChallenge = MATH_CHALLENGES[challengeIndex];

  const handleKeyClick = (val: string) => {
    playPop(440);
    triggerHaptic(15);
    if (userInput.length < 3) {
      setUserInput(prev => prev + val);
      setHasError(false);
    }
  };

  const handleBackspace = () => {
    playPop(380);
    triggerHaptic(15);
    setUserInput(prev => prev.slice(0, -1));
  };

  const handleRefreshChallenge = () => {
    playPop(420);
    triggerHaptic(15);
    setChallengeIndex((challengeIndex + 1) % MATH_CHALLENGES.length);
    setUserInput('');
    setHasError(false);
  };

  const handleCheckAnswer = () => {
    if (userInput === currentChallenge.a) {
      playSparkleChime();
      triggerHaptic([30, 40]);
      setIsUnlocked(true);
      setHasError(false);
    } else {
      triggerHaptic([40, 40, 40]);
      setHasError(true);
      setUserInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#351000]/60 backdrop-blur-sm flex justify-center p-3 select-none">
      <div className="w-full max-w-lg bg-[#fff8f6] rounded-3xl p-5 shadow-2xl relative my-auto flex flex-col border-4 border-[#ffd0bb] max-h-[96vh] overflow-y-auto">
        {/* Encabezado / Botón Volver Rápido a la App */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              playPop(380);
              triggerHaptic(15);
              onClose();
            }}
            className="flex items-center gap-2 bg-[#ffe2d6] text-[#351000] px-4 py-2 rounded-full shadow-[0_4px_0_0_#ffd0bb] active:translate-y-0.5 transition-all cursor-pointer border border-[#ffd0bb]"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-xs font-bold">Volver a Mundos</span>
          </button>
          <div className="flex items-center gap-1.5 bg-[#6cf8bb] text-[#00714d] px-3.5 py-1.5 rounded-full shadow-[0_3px_0_0_#4edea3]">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-xs font-bold">Protección COPPA</span>
          </div>
        </div>

        {/* GATE DE SEGURIDAD / RETO MATEMÁTICO */}
        {!isUnlocked ? (
          <section className="bg-white rounded-3xl p-6 shadow-[0_8px_24px_rgba(133,83,0,0.08)] flex flex-col items-center text-center relative overflow-hidden mb-5 border-2 border-[#ffd0bb]">
            <div className="w-16 h-16 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-[0_5px_0_0_#d97706] mb-3">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[#006591] text-xs font-bold uppercase tracking-wider mb-1">
              <span className="material-symbols-outlined text-[16px]">family_restroom</span>
              Área exclusiva para adultos
            </span>
            <h2 className="text-2xl text-[#351000] font-bold mb-1">
              Control Parental y Ajustes
            </h2>
            <p className="text-xs text-[#534434] max-w-xs mb-4">
              Por favor, resuelve la siguiente operación para verificar que eres mayor de edad:
            </p>

            {/* Caja del Desafío */}
            <div className="w-full bg-[#fff1eb] rounded-2xl p-4 shadow-[0_4px_0_0_#ffd0bb] mb-4 flex flex-col items-center border border-[#ffd0bb]">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs text-[#534434] font-medium">Pregunta de seguridad:</span>
                <button
                  onClick={handleRefreshChallenge}
                  className="text-[#006591] flex items-center gap-1 text-xs font-bold hover:underline cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Cambiar reto
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 my-2">
                <span className="text-3xl text-[#855300] font-black tracking-wide">
                  {currentChallenge.q}
                </span>
                <div className="min-w-[80px] h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner text-[#855300] text-3xl font-black border border-[#ffd0bb]">
                  <span className={userInput ? 'text-[#855300]' : 'text-[#d8c3ad]'}>
                    {userInput || '?'}
                  </span>
                </div>
              </div>

              {hasError && (
                <p className="text-xs text-[#ba1a1a] font-bold mt-1">
                  Respuesta incorrecta. Inténtalo de nuevo.
                </p>
              )}
            </div>

            {/* Teclado Numérico */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px] mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyClick(num)}
                  className="h-12 rounded-2xl bg-[#ffeae1] text-[#351000] text-xl font-bold shadow-[0_3px_0_0_#ffdbcc] active:translate-y-1 active:shadow-none cursor-pointer border border-[#ffd0bb]"
                  type="button"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-[#ffdbcc] text-[#534434] text-xl font-bold shadow-[0_3px_0_0_#d8c3ad] active:translate-y-1 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">backspace</span>
              </button>
              <button
                onClick={() => handleKeyClick('0')}
                className="h-12 rounded-2xl bg-[#ffeae1] text-[#351000] text-xl font-bold shadow-[0_3px_0_0_#ffdbcc] active:translate-y-1 cursor-pointer border border-[#ffd0bb]"
                type="button"
              >
                0
              </button>
              <button
                onClick={handleCheckAnswer}
                className="h-12 rounded-2xl bg-[#006c49] text-white text-xl font-bold shadow-[0_3px_0_0_#005236] active:translate-y-1 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[24px]">check</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[#534434] text-xs bg-[#ffe2d6] px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c49] animate-pulse"></span>
              <span>Seguro infantil activo para compras y cambios</span>
            </div>
          </section>
        ) : (
          /* Unlocked Notification Bar */
          <div className="bg-[#6cf8bb]/30 border border-[#6cf8bb] rounded-2xl p-4 flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#6cf8bb] text-[#00714d] flex items-center justify-center shadow">
                <span className="material-symbols-outlined text-[24px]">lock_open</span>
              </div>
              <div>
                <h3 className="text-base text-[#351000] font-bold">Ajustes Desbloqueados</h3>
                <p className="text-xs text-[#534434]">Sesión de adulto activa</p>
              </div>
            </div>
            <button
              onClick={() => setIsUnlocked(false)}
              className="bg-white text-[#351000] text-xs font-bold px-3 py-1.5 rounded-full shadow hover:bg-[#ffeae1] transition-colors cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              Bloquear
            </button>
          </div>
        )}

        {/* SETTINGS CONTENT (Unlocked or Blurred Overlay) */}
        <div className="relative space-y-5">
          {!isUnlocked && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-20 rounded-3xl flex flex-col items-center justify-center p-6 text-center pointer-events-none">
              <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-[#ffd0bb] max-w-xs">
                <span className="material-symbols-outlined text-[#f59e0b] text-[28px]">lock_clock</span>
                <span className="text-sm text-[#351000] font-bold">
                  Completa el reto matemático arriba para editar
                </span>
              </div>
            </div>
          )}

          {/* 1. Perfil del Estudiante */}
          <section className="bg-white rounded-3xl p-5 shadow-[0_6px_0_0_#ffdbcc] border border-[#ffd0bb]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#855300] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">badge</span>
                Perfil del Niño
              </span>
              <button
                onClick={() => {
                  playPop(440);
                  speakSpanish('Cambiando perfil infantil.');
                }}
                className="text-[#006591] text-xs font-bold hover:underline cursor-pointer"
                type="button"
              >
                Cambiar de perfil
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  className="w-16 h-16 rounded-full object-cover shadow-[0_4px_0_0_#f59e0b] border-2 border-[#f59e0b]"
                  alt="Mateo Benítez"
                  src={ASSETS.mateoAvatar}
                />
                <button
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg text-[#351000] font-bold truncate">Mateo Benítez</h3>
                  <span className="bg-[#ffeae1] px-2.5 py-0.5 rounded-full text-xs text-[#534434] font-bold">
                    6 años
                  </span>
                </div>
                <p className="text-xs text-[#534434] truncate mt-0.5">
                  Nivel actual: <strong className="text-[#855300]">Mundo 2: M, P, S, L</strong>
                </p>
                <div className="mt-2 w-full bg-[#ffe2d6] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Límite Diario de Pantalla */}
          <section className="bg-white rounded-3xl p-5 shadow-[0_6px_0_0_#ffdbcc] border border-[#ffd0bb]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#c9e6ff] text-[#001e2f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">timer</span>
                </div>
                <div>
                  <h3 className="text-base text-[#351000] font-bold">Límite Diario de Pantalla</h3>
                  <p className="text-xs text-[#534434]">Evita fatiga visual y sobreestimulación</p>
                </div>
              </div>
              <span className="text-base text-[#855300] font-bold">{screenTime} min</span>
            </div>

            <div className="space-y-2 pt-2">
              <input
                className="w-full h-3 bg-[#ffe2d6] rounded-lg appearance-none cursor-pointer accent-[#f59e0b]"
                max="60"
                min="10"
                step="5"
                type="range"
                value={screenTime}
                onChange={e => setScreenTime(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-[#534434] px-1 font-medium">
                <span>10 min (Corto)</span>
                <span>20 min (Recomendado)</span>
                <span>45+ min</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#fff1eb] rounded-2xl flex items-center gap-3 border border-[#ffd0bb]">
              <span className="material-symbols-outlined text-[#006c49] text-[22px]">pause_circle</span>
              <p className="text-xs text-[#534434]">
                Al terminar el tiempo, Chispita invitará a descansar con ejercicios de respiración.
              </p>
            </div>
          </section>

          {/* 3. Lectura, Fonética y Voz */}
          <section className="bg-white rounded-3xl p-5 shadow-[0_6px_0_0_#ffdbcc] space-y-4 border border-[#ffd0bb]">
            <h3 className="text-base text-[#351000] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[#855300] text-[22px]">record_voice_over</span>
              Lectura, Fonética y Voz
            </h3>

            {/* Acento */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#351000]">Acento de Narración</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setAccent('latino');
                    setVoicePreferences('latino', speechSpeed);
                    playPop(480);
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
                    accent === 'latino'
                      ? 'bg-[#ffeae1] text-[#855300] border-[#f59e0b] shadow-[0_3px_0_0_#ffd0bb]'
                      : 'bg-[#fff1eb] text-[#534434] border-transparent'
                  }`}
                  type="button"
                >
                  {accent === 'latino' && <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">check_circle</span>}
                  <span>Latino Neutro</span>
                </button>
                <button
                  onClick={() => {
                    setAccent('castellano');
                    setVoicePreferences('castellano', speechSpeed);
                    playPop(480);
                  }}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
                    accent === 'castellano'
                      ? 'bg-[#ffeae1] text-[#855300] border-[#f59e0b] shadow-[0_3px_0_0_#ffd0bb]'
                      : 'bg-[#fff1eb] text-[#534434] border-transparent'
                  }`}
                  type="button"
                >
                  {accent === 'castellano' && <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">check_circle</span>}
                  <span>Castellano</span>
                </button>
              </div>
            </div>

            {/* Velocidad */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-bold text-[#351000]">Velocidad de pronunciación</div>
                <div className="text-[11px] text-[#534434]">Ritmo al desglosar sílabas (ej: M-A = MA)</div>
              </div>
              <div className="flex bg-[#ffeae1] rounded-full p-1 border border-[#ffd0bb]">
                <button
                  onClick={() => {
                    setSpeechSpeed('lenta');
                    setVoicePreferences(accent, 'lenta');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                    speechSpeed === 'lenta' ? 'bg-[#f59e0b] text-[#613b00] shadow-sm' : 'text-[#534434]'
                  }`}
                  type="button"
                >
                  Lenta
                </button>
                <button
                  onClick={() => {
                    setSpeechSpeed('normal');
                    setVoicePreferences(accent, 'normal');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${
                    speechSpeed === 'normal' ? 'bg-[#f59e0b] text-[#613b00] shadow-sm' : 'text-[#534434]'
                  }`}
                  type="button"
                >
                  Normal
                </button>
              </div>
            </div>

            {/* Tipografía Escolar */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs font-bold text-[#351000]">Tipografía Escolar</div>
                <div className="text-[11px] text-[#534434]">Formato de letras en ejercicios</div>
              </div>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="bg-[#ffe2d6] text-[#351000] text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer border border-[#ffd0bb]"
              >
                <option>Imprenta (Quicksand)</option>
                <option>Mayúsculas Solamente</option>
                <option>Ligada Escolar</option>
              </select>
            </div>

            {/* Toggles de Sonido */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#351000]">Efectos de sonido alegres ("¡Pop!", campana)</span>
                <button
                  onClick={() => {
                    const next = !soundEffectsOn;
                    setSoundEffectsOn(next);
                    setSoundEffects(next);
                  }}
                  className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                    soundEffectsOn ? 'bg-[#6cf8bb] justify-end' : 'bg-[#d8c3ad] justify-start'
                  }`}
                  type="button"
                >
                  <span className={`w-5 h-5 rounded-full shadow-md ${soundEffectsOn ? 'bg-[#006c49]' : 'bg-white'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#351000]">Música de fondo suave</span>
                <button
                  onClick={() => setBackgroundMusicOn(!backgroundMusicOn)}
                  className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                    backgroundMusicOn ? 'bg-[#6cf8bb] justify-end' : 'bg-[#d8c3ad] justify-start'
                  }`}
                  type="button"
                >
                  <span className={`w-5 h-5 rounded-full shadow-md ${backgroundMusicOn ? 'bg-[#006c49]' : 'bg-white'}`}></span>
                </button>
              </div>
            </div>

            {/* Daily Session & Reset Section */}
            <div className="bg-[#fff1eb] rounded-2xl p-3 border border-[#ffd0bb] flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-black text-[#351000] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#f59e0b]">calendar_today</span>
                  Sesión Diaria (1 vez por día)
                </div>
                <div className="text-[11px] text-[#534434]">
                  Los ejercicios se reinician a diario. Pulsa aquí si deseas reiniciar hoy manualmente para repasar.
                </div>
              </div>
              <button
                onClick={() => {
                  playPop(480);
                  triggerHaptic(20);
                  speakSpanish('Progreso diario reiniciado.');
                }}
                type="button"
                className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#613b00] font-black text-xs rounded-xl shadow-[0_2px_0_0_#b45309] cursor-pointer shrink-0"
              >
                Reiniciar Hoy
              </button>
            </div>
          </section>

          {/* 4. Resumen y Reporte Pedagógico */}
          <section className="bg-white rounded-3xl p-5 shadow-[0_6px_0_0_#ffdbcc] border border-[#ffd0bb]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base text-[#351000] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006c49] text-[22px]">analytics</span>
                Reporte de Lectura
              </h3>
              <span className="text-[10px] bg-[#ffe2d6] px-2 py-0.5 rounded-full text-[#534434] font-bold">
                Esta semana
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#fff1eb] p-3 rounded-2xl text-center shadow-xs border border-[#ffd0bb]">
                <span className="material-symbols-outlined text-[#f59e0b] text-[22px]">spellcheck</span>
                <div className="text-2xl text-[#351000] font-bold mt-0.5">14</div>
                <div className="text-[11px] text-[#534434] font-semibold">Fonemas aprendidos</div>
              </div>
              <div className="bg-[#fff1eb] p-3 rounded-2xl text-center shadow-xs border border-[#ffd0bb]">
                <span className="material-symbols-outlined text-[#006c49] text-[22px]">gesture</span>
                <div className="text-2xl text-[#351000] font-bold mt-0.5">92%</div>
                <div className="text-[11px] text-[#534434] font-semibold">Precisión en trazos</div>
              </div>
            </div>

            <button
              onClick={() => {
                playPop(480);
                triggerHaptic(20);
                onOpenPedagogicalReport();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#006591] hover:bg-[#004869] text-white text-xs font-bold shadow-[0_4px_0_0_#004869] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#004869]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">description</span>
              <span>Ver Reporte Pedagógico Detallado</span>
            </button>
          </section>

          {/* 5. Gestión y Soporte */}
          <section className="bg-white rounded-3xl p-5 shadow-[0_6px_0_0_#ffdbcc] space-y-2.5 border border-[#ffd0bb]">
            <h3 className="text-base text-[#351000] font-bold flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[#867461] text-[22px]">settings</span>
              Gestión y Soporte
            </h3>

            {/* Opción de Probar en Celular / Generar APK */}
            <div
              onClick={() => {
                playPop(480);
                triggerHaptic(20);
                if (onOpenInstallModal) {
                  onClose();
                  onOpenInstallModal();
                }
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] border-2 border-[#6ee7b7] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#059669] text-[22px]">smartphone</span>
                <div>
                  <div className="text-xs font-black text-[#065f46]">Probar en Teléfono / Generar APK</div>
                  <div className="text-[11px] text-[#047857]">Código QR, WebAPK nativo y guía Capacitor</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#059669]">chevron_right</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#fff1eb] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#855300]">cloud_download</span>
                <div>
                  <div className="text-xs font-bold text-[#351000]">Modo Sin Conexión (Offline)</div>
                  <div className="text-[11px] text-[#534434]">Todos los audios descargados (120 MB)</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#006c49]">check_circle</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#fff1eb] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006591]">support_agent</span>
                <div>
                  <div className="text-xs font-bold text-[#351000]">Preguntas Frecuentes y Soporte</div>
                  <div className="text-[11px] text-[#534434]">Contacto directo con pedagogos</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#867461]">chevron_right</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#fff1eb] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006c49]">policy</span>
                <div>
                  <div className="text-xs font-bold text-[#351000]">Política de Privacidad para Menores</div>
                  <div className="text-[11px] text-[#534434]">Sin anuncios, sin recopilación de datos</div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#867461]">open_in_new</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  playPop(350);
                  triggerHaptic(20);
                  speakSpanish('Progreso reiniciado correctamente.');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold shadow-[0_3px_0_0_#d8c3ad] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Reiniciar progreso de Mateo</span>
              </button>
            </div>
          </section>

          {/* Pie amigable */}
          <div className="text-center pt-1 pb-2 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[#534434] text-xs font-medium">
              <span className="material-symbols-outlined text-[16px] text-[#006c49]">verified</span>
              Cumple con estándares COPPA y GDPR-K para niños
            </div>
            <p className="text-[11px] text-[#867461]">Palabritas v2.4.0 • Hecho con cariño para mentes curiosas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

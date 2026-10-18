import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS } from '../data/appData';
import { WORLDS_DATA, WorldLevel } from '../data/worldsData';
import { getCurrentDayTheme } from '../data/exercisesData';
import {
  loadDailyProgress,
  resetTodayProgressManually,
  getSpanishFormattedDate,
  DailyProgressState,
} from '../utils/dailyTracker';
import { playPop, playWiggleError, playFanfare, speakSpanish, triggerHaptic, playSparkleChime } from '../utils/audio';

interface MundosScreenProps {
  onStartWordGame: (letterIndex?: number, filter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas', worldId?: number) => void;
  onOpenStory: () => void;
  onOpenTracing: (letter?: string, filter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas', worldId?: number) => void;
  onOpenWriting?: (letter?: string) => void;
  onOpenRewards: () => void;
  onOpenPhonicsSession: () => void;
  completedWorlds?: number[];
  onCompleteWorld?: (worldId: number) => void;
}

export const MundosScreen: React.FC<MundosScreenProps> = ({
  onStartWordGame,
  onOpenStory,
  onOpenTracing,
  onOpenWriting,
  onOpenRewards,
  onOpenPhonicsSession,
  completedWorlds = [1],
}) => {
  const [selectedWorldFilter, setSelectedWorldFilter] = useState<'todos' | 'A-F' | 'G-M' | 'N-S' | 'T-Z' | 'especiales'>('todos');
  const [dailyProgress, setDailyProgress] = useState<DailyProgressState>(() => loadDailyProgress());
  const [selectedModalWorld, setSelectedModalWorld] = useState<WorldLevel | null>(null);
  const worldRefs = useRef<Record<number, HTMLElement | null>>({});

  // Reload daily state on mount
  useEffect(() => {
    setDailyProgress(loadDailyProgress());
  }, []);

  const totalWorldsCount = WORLDS_DATA.length;
  // Determine highest unlocked world (always highest completed world + 1)
  const maxUnlockedWorldId = Math.min(totalWorldsCount, Math.max(1, ...completedWorlds) + 1);
  const activeWorldObj = WORLDS_DATA.find(w => w.id === maxUnlockedWorldId) || WORLDS_DATA[0];

  const todayTheme = getCurrentDayTheme();

  const handleWorldJump = (id: number) => {
    playPop(480);
    triggerHaptic(15);
    const targetElement = worldRefs.current[id];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleLockedWorldClick = (world: WorldLevel) => {
    playWiggleError();
    triggerHaptic([40, 40, 40]);
    speakSpanish(`¡El ${world.numberLabel} (${world.title}) está bloqueado! Completa primero el Mundo ${world.id - 1} para abrirlo.`);
  };

  const handleOpenWorldModal = (world: WorldLevel) => {
    if (world.id > maxUnlockedWorldId) {
      handleLockedWorldClick(world);
      return;
    }
    playPop(520);
    triggerHaptic(20);
    setSelectedModalWorld(world);
    speakSpanish(`¡${world.numberLabel}: ${world.title}! Elige tu actividad.`);
  };

  const handleChispitaClick = () => {
    playPop(520);
    triggerHaptic(20);
    speakSpanish(`¡Hola pequeña lectora! Hoy es ${getSpanishFormattedDate()}. Reto de hoy: ${todayTheme.title}. ¡Has conquistado ${completedWorlds.length} de ${totalWorldsCount} mundos!`);
  };

  const handleResetDaily = () => {
    playSparkleChime();
    triggerHaptic(25);
    const reset = resetTodayProgressManually();
    setDailyProgress(reset);
    speakSpanish('¡Misiones del día reiniciadas! Puedes jugar todos los mundos nuevamente hoy.');
  };

  const handlePlayFinalCelebration = () => {
    playFanfare();
    speakSpanish('¡El Gran Palacio del Lector Campeón! ¡Has conquistado todas las familias de letras de la A a la Z!');
    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171'],
    });
  };

  // Filter worlds if user uses section tabs
  const displayedWorlds = WORLDS_DATA.filter(world => {
    if (selectedWorldFilter === 'A-F') return world.id >= 1 && world.id <= 6;
    if (selectedWorldFilter === 'G-M') return world.id >= 7 && world.id <= 13;
    if (selectedWorldFilter === 'N-S') return world.id >= 14 && world.id <= 20;
    if (selectedWorldFilter === 'T-Z') return world.id >= 21 && world.id <= 27;
    if (selectedWorldFilter === 'especiales') return world.id >= 28;
    return true;
  });

  const totalStarsEarned = WORLDS_DATA.reduce((acc, curr) => {
    if (completedWorlds.includes(curr.id)) return acc + curr.maxStars;
    if (curr.id === maxUnlockedWorldId) return acc + curr.stars;
    return acc;
  }, 0);
  const totalMaxStars = WORLDS_DATA.reduce((acc, curr) => acc + curr.maxStars, 0);

  return (
    <div className="flex flex-col w-full relative pb-10 select-none">
      {/* Ambient Floating Deco Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-4 left-6 text-primary-container opacity-60 animate-bounce text-xl">✦</div>
        <div className="absolute top-28 right-8 text-secondary-container opacity-80 animate-pulse text-2xl">✨</div>
        <div className="absolute top-96 left-3 text-tertiary-container opacity-50 text-3xl">☁️</div>
        <div className="absolute top-[1800px] right-6 text-primary-container opacity-70 animate-bounce text-2xl">⭐</div>
        <div className="absolute bottom-40 right-4 text-primary-container opacity-70 animate-bounce text-xl">🌟</div>
      </div>

      {/* Hero Header Greeting & Daily Status Banner */}
      <div className="relative z-10 w-full mb-3">
        <div className="bg-[#fff1eb] rounded-3xl p-4 shadow-[0_6px_0_0_#ffd0bb] flex flex-col gap-3 border-2 border-[#ffdbcc]/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                onClick={handleChispitaClick}
                className="w-14 h-14 rounded-2xl bg-[#6cf8bb] text-[#00714d] flex items-center justify-center shadow-[0_4px_0_0_#4edea3] cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <img
                  src={ASSETS.chispitaAvatar}
                  alt="Chispita"
                  className="w-11 h-11 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-[#534434] font-bold uppercase tracking-wider">Aventura Diaria</span>
                  <span className="text-[10px] font-bold bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full">
                    Mundo a Mundo 🔒➔🔓
                  </span>
                </div>
                <h1 className="text-xl text-[#351000] font-black leading-tight">Familias de la A a la Z</h1>
                <p className="text-xs text-[#855300] font-bold">
                  Siguiente por superar: <strong className="text-[#00714d]">{activeWorldObj.numberLabel}: {activeWorldObj.title}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="bg-[#ffe2d6] px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_3px_0_0_#ffdbcc]">
                <span className="material-symbols-outlined text-[#f59e0b] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="text-xs text-[#613b00] font-black">{dailyProgress.streakDays} DÍAS</span>
              </div>
              <div className="bg-[#fef3c7] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#fde68a]">
                <span className="material-symbols-outlined text-[#f59e0b] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="text-xs text-[#855300] font-black">{totalStarsEarned}/{totalMaxStars}</span>
              </div>
            </div>
          </div>

          {/* HERO CARD: "¡Continuar Mi Aventura!" (Immediate 1-tap jump) */}
          <div className="bg-gradient-to-r from-[#f59e0b] via-[#fbbf24] to-[#f59e0b] p-3.5 sm:p-4 rounded-2xl shadow-[0_5px_0_0_#b45309] text-[#451a03] flex flex-col sm:flex-row items-center justify-between gap-3 border border-amber-300">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner shrink-0 animate-bounce">
                {activeWorldObj.targetEmoji}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950/80 block">
                  🚀 Tu Próxima Misión Mágica
                </span>
                <span className="text-base sm:text-lg font-black leading-tight block truncate text-[#351000]">
                  {activeWorldObj.numberLabel}: {activeWorldObj.title}
                </span>
                <span className="text-xs font-bold text-amber-950/90 block">
                  Letra <strong className="text-white underline">{activeWorldObj.focusLetter}</strong> • Palabra: <strong>{activeWorldObj.targetWord}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenWorldModal(activeWorldObj)}
              type="button"
              className="w-full sm:w-auto bg-[#351000] hover:bg-[#561f00] text-amber-300 font-black text-sm px-5 py-3 rounded-2xl shadow-[0_4px_0_0_#000] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              <span>¡CONTINUAR MUNDO {activeWorldObj.id}!</span>
            </button>
          </div>

          {/* Daily Date & Weekly Theme Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 p-3 rounded-2xl border border-[#ffd0bb] flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center font-bold text-lg shadow-xs">
                📅
              </div>
              <div>
                <span className="text-[10px] font-black text-[#855300] uppercase block">
                  {getSpanishFormattedDate()} • Reto de hoy (1 vez por día)
                </span>
                <span className="text-xs font-black text-[#351000]">
                  {todayTheme.dayLabel}: {todayTheme.title} ({todayTheme.description})
                </span>
              </div>
            </div>

            <button
              onClick={handleResetDaily}
              type="button"
              className="text-[11px] font-bold text-[#855300] hover:text-[#351000] bg-white px-2.5 py-1 rounded-xl border border-[#ffd0bb] shadow-2xs hover:bg-[#ffeae1] cursor-pointer shrink-0 transition-colors"
              title="Permite volver a realizar los retos de hoy para practicar"
            >
              🔄 Reiniciar reto de hoy
            </button>
          </div>

          {/* Progress Bar through All Mundos */}
          <div className="flex flex-col gap-1 bg-white/80 p-2.5 rounded-2xl border border-[#ffd0bb]/60">
            <div className="flex items-center justify-between text-xs font-bold text-[#855300]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[#00714d] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                Desbloqueados: {completedWorlds.length} de {totalWorldsCount} mundos
              </span>
              <span className="text-[#00714d] font-black">{Math.round((completedWorlds.length / totalWorldsCount) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-[#ffeae1] rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#6cf8bb] via-[#f59e0b] to-[#42bbff] rounded-full shadow-[0_2px_0_0_#d97706] transition-all duration-700"
                style={{ width: `${(completedWorlds.length / totalWorldsCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Jump Ribbon across all Mundos */}
      <div className="relative z-10 w-full mb-4 bg-[#fff8f6] p-2.5 rounded-2xl border border-[#ffd0bb] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5 px-1">
          <span className="text-xs font-bold text-[#855300] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">map</span>
            Familias de Letras (A - Z):
          </span>
          <div className="flex gap-1 text-[11px] font-bold flex-wrap">
            {[
              { id: 'todos', label: `Todos (${totalWorldsCount})` },
              { id: 'A-F', label: 'A - F' },
              { id: 'G-M', label: 'G - M' },
              { id: 'N-S', label: 'N - S' },
              { id: 'T-Z', label: 'T - Z' },
              { id: 'especiales', label: 'Especiales' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedWorldFilter(f.id as typeof selectedWorldFilter)}
                type="button"
                className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  selectedWorldFilter === f.id
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_2px_0_0_#d97706]'
                    : 'bg-white text-[#534434] hover:bg-[#ffeae1] border border-[#ffd0bb]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Milestone Bubbles with Lock Status */}
        <div className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none">
          {WORLDS_DATA.map(w => {
            const isCompleted = completedWorlds.includes(w.id);
            const isUnlocked = w.id <= maxUnlockedWorldId;
            const isLocked = !isUnlocked;
            const isActive = w.id === maxUnlockedWorldId;
            const completedToday = dailyProgress.completedWorldsToday.includes(w.id);

            return (
              <button
                key={w.id}
                onClick={() => {
                  if (isLocked) {
                    handleLockedWorldClick(w);
                  } else {
                    handleWorldJump(w.id);
                  }
                }}
                type="button"
                className={`flex flex-col items-center justify-center min-w-[56px] h-[58px] rounded-2xl font-bold text-xs shrink-0 cursor-pointer transition-all border-2 relative ${
                  isActive
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_4px_0_0_#d97706] scale-105 border-[#d97706] ring-2 ring-[#f59e0b]/40'
                    : isCompleted
                    ? 'bg-[#6cf8bb] text-[#00714d] shadow-[0_3px_0_0_#4edea3] border-[#4edea3]'
                    : 'bg-[#f3ede8] text-[#9ca3af] shadow-xs border-[#d8c3ad] opacity-75'
                }`}
                title={isLocked ? `🔒 ${w.numberLabel}: ${w.title} Bloqueado` : `${w.numberLabel}: ${w.title}`}
              >
                {completedToday && isUnlocked && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
                {isLocked ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-[#867461]">lock</span>
                    <span className="text-[10px] text-[#867461]">M{w.id}</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <span className="text-[12px] font-black">{w.focusLetter}</span>
                    <span className="text-[10px] leading-tight font-bold">M{w.id} ✓</span>
                  </>
                ) : (
                  <>
                    <span className="text-[12px] font-black">{w.focusLetter}</span>
                    <span className="text-[10px] leading-tight">{w.targetEmoji}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Winding Map Track / Recorrido Progresivo de los Mundos */}
      <div className="relative z-10 flex flex-col items-center gap-7 w-full">
        {displayedWorlds.map((world, idx) => {
          const isCompleted = completedWorlds.includes(world.id);
          const isUnlocked = world.id <= maxUnlockedWorldId;
          const isLocked = !isUnlocked;
          const isCurrentActive = world.id === maxUnlockedWorldId;
          const completedToday = dailyProgress.completedWorldsToday.includes(world.id);

          return (
            <React.Fragment key={world.id}>
              <section
                ref={el => {
                  worldRefs.current[world.id] = el;
                }}
                className={`w-full max-w-lg transition-all duration-300 ${
                  isLocked ? 'opacity-85' : 'hover:scale-[1.01]'
                }`}
              >
                <div
                  className={`${world.colorTheme.cardBg} rounded-3xl p-5 border-3 ${world.colorTheme.border} ${
                    isLocked ? 'shadow-[0_4px_0_0_#d8c3ad] bg-[#faf6f3]' : world.colorTheme.shadow
                  } relative overflow-hidden flex flex-col gap-4`}
                >
                  {/* Lock Watermark Badge if locked */}
                  {isLocked && (
                    <div className="absolute top-3 right-3 bg-[#e8ddd7] text-[#867461] px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-[#d8c3ad]">
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      <span>BLOQUEADO</span>
                    </div>
                  )}

                  {/* Header Row: Environment + World Number */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase text-[#855300] bg-[#fff1eb] px-3 py-1 rounded-full border border-[#ffd0bb]">
                      {world.environmentName}
                    </span>
                    {!isLocked && (
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          isCompleted
                            ? 'bg-[#6cf8bb] text-[#00714d]'
                            : isCurrentActive
                            ? 'bg-[#f59e0b] text-[#613b00] animate-pulse'
                            : world.colorTheme.badgeBg + ' ' + world.colorTheme.badgeText
                        }`}
                      >
                        {isCompleted ? '¡SUPERADO!' : isCurrentActive ? '¡JUGANDO AHORA!' : world.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Title & Target Word Info */}
                  <div className="flex items-start gap-4">
                    <div
                      onClick={() => handleOpenWorldModal(world)}
                      className={`w-16 h-16 rounded-2xl ${world.colorTheme.iconBg} flex items-center justify-center text-3xl shadow-inner shrink-0 border border-black/5 relative cursor-pointer active:scale-95 transition-transform`}
                    >
                      {world.targetEmoji}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/25 rounded-2xl flex items-center justify-center backdrop-blur-2xs">
                          <span className="material-symbols-outlined text-white text-2xl">lock</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#855300]">{world.numberLabel}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                        <span className="text-xs font-bold text-[#00714d]">{world.focusLetter}</span>
                      </div>
                      <h2
                        onClick={() => handleOpenWorldModal(world)}
                        className="text-xl text-[#351000] font-black leading-tight truncate cursor-pointer hover:underline"
                      >
                        {world.title}
                      </h2>
                      <p className="text-xs text-[#534434] font-bold mt-0.5">
                        {world.subtitle}
                      </p>
                      <p className="text-xs text-[#855300]/80 font-medium mt-1 leading-snug">
                        {world.description}
                      </p>
                    </div>
                  </div>

                  {/* Letters chips for this world */}
                  {world.letters && world.letters.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-bold text-[#855300]">Letras:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {world.letters.map((l, lIdx) => (
                          <button
                            key={lIdx}
                            onClick={() => {
                              if (isLocked) {
                                handleLockedWorldClick(world);
                              } else {
                                playPop(500);
                                speakSpanish(`Letra ${l}. Palabra mágica: ${world.targetWord}.`);
                              }
                            }}
                            className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shadow-2xs border transition-transform cursor-pointer ${
                              isLocked
                                ? 'bg-[#e8ddd7] text-[#867461] border-[#d8c3ad]'
                                : 'bg-white text-[#351000] border-[#ffd0bb] hover:scale-110 active:scale-95'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar */}
                  {isLocked ? (
                    /* Locked Action Button */
                    <button
                      onClick={() => handleLockedWorldClick(world)}
                      type="button"
                      className="w-full py-3 px-4 bg-[#f0e6e1] hover:bg-[#e8ddd7] text-[#867461] rounded-2xl border-2 border-dashed border-[#d8c3ad] flex items-center justify-center gap-2 text-xs font-black cursor-pointer shadow-sm active:translate-y-0.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#867461]">lock</span>
                      <span>Mundo {world.id} Bloqueado • Supera Mundo {world.id - 1} para abrir</span>
                    </button>
                  ) : (
                    /* Unlocked Interactive Bar */
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-[#fff8f6] rounded-2xl p-2.5 border border-[#ffd0bb]">
                      {/* Stars Earned & Daily status */}
                      <div className="flex items-center gap-1.5 self-start sm:self-center">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map(starNum => {
                            const hasStar = isCompleted || (isCurrentActive && starNum <= world.stars);
                            return (
                              <span
                                key={starNum}
                                className="material-symbols-outlined text-[22px]"
                                style={{
                                  color: hasStar ? '#f59e0b' : '#d8c3ad',
                                  fontVariationSettings: hasStar ? "'FILL' 1" : "'FILL' 0",
                                }}
                              >
                                star
                              </span>
                            );
                          })}
                        </div>
                        {completedToday && (
                          <span className="text-[10px] font-black bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full">
                            Hoy ✓
                          </span>
                        )}
                      </div>

                      {/* Interactive Step Explorer & Fast Play Buttons */}
                      <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
                        <button
                          onClick={() => handleOpenWorldModal(world)}
                          type="button"
                          className="flex-1 sm:flex-initial bg-[#ffe2d6] hover:bg-[#ffd0bb] text-[#855300] text-xs font-bold px-3 py-2 rounded-full border border-[#ffd0bb] shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">list_alt</span>
                          <span>Pasos</span>
                        </button>

                        <button
                          onClick={() => {
                            playPop(480);
                            triggerHaptic(20);
                            speakSpanish(`Trazando letras de ${world.numberLabel}: ${world.focusLetter}.`);
                            onOpenTracing(world.focusLetter, world.categoryFilter, world.id);
                          }}
                          className="flex-1 sm:flex-initial bg-[#6cf8bb] hover:bg-[#4edea3] text-[#00714d] text-xs font-bold px-3 py-2 rounded-full shadow-[0_2px_0_0_#4edea3] active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">draw</span>
                          <span>Trazar</span>
                        </button>

                        <button
                          onClick={() => {
                            playPop(520);
                            triggerHaptic(20);
                            speakSpanish(`¡Jugando en ${world.numberLabel}! Palabra: ${world.targetWord}.`);
                            if (world.id === totalWorldsCount) {
                              handlePlayFinalCelebration();
                            }
                            onStartWordGame(world.letterIndex, world.categoryFilter, world.id);
                          }}
                          className={`flex-1 sm:flex-initial text-xs font-black px-3.5 py-2 rounded-full shadow-[0_3px_0_0_#d97706] active:translate-y-0.5 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                            isCurrentActive
                              ? 'bg-[#f59e0b] hover:bg-amber-500 text-[#451a03]'
                              : 'bg-[#fff1eb] hover:bg-[#ffe2d6] text-[#855300] shadow-[0_2px_0_0_#ffd0bb]'
                          }`}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            play_arrow
                          </span>
                          <span>
                            {isCompleted ? 'Repasar' : '¡JUGAR!'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Connecting Stepping Stone Road Segment Between Worlds */}
              {idx < displayedWorlds.length - 1 && (
                <div className="flex flex-col items-center my-0.5 select-none pointer-events-none">
                  <div className="flex items-center gap-2 my-1">
                    <span className={`w-3.5 h-3.5 rounded-full shadow-sm ${
                      displayedWorlds[idx + 1].id <= maxUnlockedWorldId ? 'bg-[#4edea3]' : 'bg-[#d8c3ad]'
                    }`}></span>
                    <span className={`w-4 h-4 rounded-full shadow-sm ${
                      displayedWorlds[idx + 1].id <= maxUnlockedWorldId ? 'bg-[#f59e0b] animate-pulse' : 'bg-[#d8c3ad]'
                    }`}></span>
                    <span className={`w-3.5 h-3.5 rounded-full shadow-sm ${
                      displayedWorlds[idx + 1].id <= maxUnlockedWorldId ? 'bg-[#42bbff]' : 'bg-[#d8c3ad]'
                    }`}></span>
                  </div>
                  <span className={`text-[11px] font-bold ${
                    displayedWorlds[idx + 1].id <= maxUnlockedWorldId ? 'text-[#855300]' : 'text-[#a8998d]'
                  }`}>
                    {displayedWorlds[idx + 1].id <= maxUnlockedWorldId ? 'Camino abierto ✨' : '🔒 Siguiente Familia'}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* WORLD STEP DETAIL MODAL (The 4 Pedagogical Steps for Kids) */}
      {selectedModalWorld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fff8f6] w-full max-w-md rounded-3xl p-5 shadow-2xl border-4 border-[#ffd0bb] flex flex-col gap-4 relative animate-pop-bounce">
            {/* Close Button */}
            <button
              onClick={() => setSelectedModalWorld(null)}
              type="button"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#ffe2d6] text-[#855300] font-black flex items-center justify-center hover:bg-[#ffd0bb] cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-300">
                {selectedModalWorld.targetEmoji}
              </div>
              <div className="min-w-0 flex-1 pr-6">
                <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                  {selectedModalWorld.numberLabel} • Familia de Letras
                </span>
                <h3 className="text-xl font-black text-[#351000] leading-tight">
                  {selectedModalWorld.title}
                </h3>
                <p className="text-xs font-bold text-emerald-700">
                  Palabra Mágica: <strong>{selectedModalWorld.targetWord}</strong>
                </p>
              </div>
            </div>

            {/* The 4 Learning Steps for this world */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-xs font-black text-[#855300] uppercase tracking-wide">
                Elige qué paso aprender hoy:
              </span>

              {/* Paso 1: Fonema y Sonido */}
              <button
                onClick={() => {
                  playPop(500);
                  triggerHaptic(20);
                  speakSpanish(`Paso 1. Fonema de la letra ${selectedModalWorld.focusLetter}. Sonido: ${selectedModalWorld.focusLetter}... Ejemplo: ${selectedModalWorld.targetWord}.`);
                }}
                type="button"
                className="p-3 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-98 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-lg">
                    👂
                  </span>
                  <div>
                    <span className="text-xs font-black text-[#351000] block">
                      1. Fonema y Sonido
                    </span>
                    <span className="text-[11px] text-[#78350f] font-bold">
                      Escucha cómo suena la letra {selectedModalWorld.focusLetter}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-amber-600">volume_up</span>
              </button>

              {/* Paso 2: Trazo Guiado en Pizarra */}
              <button
                onClick={() => {
                  const w = selectedModalWorld;
                  if (!w) return;
                  setSelectedModalWorld(null);
                  onOpenTracing(w.focusLetter, w.categoryFilter, w.id);
                }}
                type="button"
                className="p-3 bg-white hover:bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-98 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-lg">
                    ✍️
                  </span>
                  <div>
                    <span className="text-xs font-black text-[#351000] block">
                      2. Trazo en la Pizarra
                    </span>
                    <span className="text-[11px] text-emerald-800 font-bold">
                      Dibuja la letra con tiza mágica
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-600">arrow_forward</span>
              </button>

              {/* Paso 3: Construye y Arma Sílabas */}
              <button
                onClick={() => {
                  const w = selectedModalWorld;
                  if (!w) return;
                  setSelectedModalWorld(null);
                  onStartWordGame(w.letterIndex, w.categoryFilter, w.id);
                }}
                type="button"
                className="p-3 bg-white hover:bg-sky-50 rounded-2xl border-2 border-sky-200 flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-98 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center text-lg">
                    🧩
                  </span>
                  <div>
                    <span className="text-xs font-black text-[#351000] block">
                      3. Arma con Sílabas
                    </span>
                    <span className="text-[11px] text-sky-800 font-bold">
                      Forma la palabra {selectedModalWorld.targetWord}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sky-600">arrow_forward</span>
              </button>

              {/* Paso 4: Escribe con Teclado */}
              {onOpenWriting && (
                <button
                  onClick={() => {
                    const w = selectedModalWorld;
                    if (!w) return;
                    setSelectedModalWorld(null);
                    onOpenWriting(w.focusLetter);
                  }}
                  type="button"
                  className="p-3 bg-white hover:bg-purple-50 rounded-2xl border-2 border-purple-200 flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-98 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-lg">
                      ⌨️
                    </span>
                    <div>
                      <span className="text-xs font-black text-[#351000] block">
                        4. Escribe con Teclado
                      </span>
                      <span className="text-[11px] text-purple-800 font-bold">
                        Teclado fonético y dictado
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-purple-600">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Quick Play All Button */}
            <button
              onClick={() => {
                const w = selectedModalWorld;
                if (!w) return;
                setSelectedModalWorld(null);
                onStartWordGame(w.letterIndex, w.categoryFilter, w.id);
              }}
              type="button"
              className="w-full py-3 bg-[#f59e0b] hover:bg-amber-500 text-[#451a03] font-black rounded-2xl shadow-[0_4px_0_0_#b45309] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              <span>¡JUGAR AVENTURA DE {selectedModalWorld.targetWord.toUpperCase()}!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

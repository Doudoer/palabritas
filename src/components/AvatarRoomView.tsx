import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AVATAR_ROOM_CATALOG,
  RoomCatalogItem,
  SKIN_TONE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EXPRESSION_OPTIONS,
  HAIR_STYLE_OPTIONS,
  RoomSlotType,
  AvatarSlotType,
  checkItemUnlockStatus,
} from '../data/avatarRoomData';
import {
  PlayerProgress,
  updateAvatarConfig,
  updateRoomConfig,
  buyRoomItem,
  loadPlayerProgress,
} from '../utils/playerProgress';
import {
  playPop,
  playSparkleChime,
  playFanfare,
  playWiggleError,
  speakSpanish,
  triggerHaptic,
} from '../utils/audio';

interface AvatarRoomViewProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onAddStars: (amount: number) => void;
  onGoToMundos?: () => void;
  onGoToCuentos?: () => void;
}

export const AvatarRoomView: React.FC<AvatarRoomViewProps> = ({
  progress,
  onUpdateProgress,
  onAddStars,
  onGoToMundos,
  onGoToCuentos,
}) => {
  // Drawer visibility & tab state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mainDrawerTab, setMainDrawerTab] = useState<'avatar' | 'habitacion'>('habitacion');
  const [roomSubTab, setRoomSubTab] = useState<RoomSlotType>('bed');
  const [avatarSubTab, setAvatarSubTab] = useState<AvatarSlotType>('outfit');

  // Interactive feedback state
  const [avatarCheering, setAvatarCheering] = useState(false);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<string | null>(
    '¡Hola! ¡Bienvenido a mi cuarto mágico!'
  );
  const [bouncingSlot, setBouncingSlot] = useState<string | null>(null);

  // Unlocked items Set for instant lookup
  const unlockedSet = useMemo(() => {
    return new Set(progress.unlockedRoomItems || []);
  }, [progress.unlockedRoomItems]);

  const { avatarConfig, roomConfig } = progress;

  // Speech bubble helper
  const sayAvatar = (text: string, voiceText?: string) => {
    setActiveSpeechBubble(text);
    speakSpanish(voiceText || text);
    setTimeout(() => {
      setActiveSpeechBubble(null);
    }, 4500);
  };

  // Avatar tap celebration
  const handleTapAvatar = () => {
    playFanfare();
    playSparkleChime();
    triggerHaptic([30, 40, 50]);
    setAvatarCheering(true);
    setTimeout(() => setAvatarCheering(false), 900);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f59e0b', '#ec4899', '#38bdf8', '#86efac'],
    });

    const quotes = [
      '¡Me encanta cómo estamos decorando mi cuarto!',
      '¡Cada vez que completas una tarea ganamos ropa y muebles!',
      '¡Mira qué bien me queda este estilo!',
      '¡Eres el mejor compañero de lectura del mundo!',
      '¡Toca la ventana para cambiar entre el día y la noche!',
    ];
    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    sayAvatar(pick);
  };

  // Pet tap interaction
  const handleTapPet = (petItem?: RoomCatalogItem) => {
    playSparkleChime();
    triggerHaptic(25);
    setBouncingSlot('pet');
    setTimeout(() => setBouncingSlot(null), 700);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#fef08a'],
    });

    if (petItem?.id === 'pet-kitty') {
      sayAvatar('🐱 ¡Miau! Ronron... ¡Qué cuarto tan calientito!');
    } else if (petItem?.id === 'pet-puppy') {
      sayAvatar('🐶 ¡Guau guau! ¡Muevo mi colita de felicidad!');
    } else if (petItem?.id === 'pet-chispita') {
      sayAvatar('🐉 ¡Chispitas mágicas! ¡Vuelo por todo el cuarto!');
    } else if (petItem?.id === 'pet-dino') {
      sayAvatar('🦖 ¡Roar tierno! ¡Leamos otro cuento juntos!');
    } else if (petItem?.id === 'pet-robot') {
      sayAvatar('🤖 ¡BEEP BOOP! ¡Amigo detector de letras al 100%!');
    } else if (petItem?.id === 'pet-unicorn') {
      sayAvatar('🦄 ¡Magia pura de arcoíris en tu cuarto!');
    } else {
      sayAvatar('🐾 ¡Tu mascota te quiere mucho!');
    }
  };

  // Window Day/Night toggle
  const handleToggleTimeOfDay = () => {
    playPop(520);
    triggerHaptic(20);
    const nextTime = roomConfig.timeOfDay === 'dia' ? 'noche' : 'dia';
    const updated = updateRoomConfig({ timeOfDay: nextTime });
    onUpdateProgress({ ...progress, roomConfig: updated });

    if (nextTime === 'noche') {
      sayAvatar('🌙 ¡Buenas noches! Las estrellas están brillando.', 'Buenas noches. Las estrellas están brillando en tu ventana.');
    } else {
      sayAvatar('☀️ ¡Buenos días! El sol ilumina tu hermosa habitación.', 'Buenos días. El sol ilumina tu habitación.');
    }
  };

  // Equip an item from drawer
  const handleEquipItem = (item: RoomCatalogItem) => {
    playPop(480);
    triggerHaptic(15);

    if (item.category === 'wallpaper') {
      const updated = updateRoomConfig({ wallpaper: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'floor') {
      const updated = updateRoomConfig({ floor: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'bed') {
      const updated = updateRoomConfig({ bed: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'desk') {
      const updated = updateRoomConfig({ desk: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'rug') {
      const updated = updateRoomConfig({ rug: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'decor') {
      const updated = updateRoomConfig({ wallDecor: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'pet') {
      const updated = updateRoomConfig({ pet: item.id });
      onUpdateProgress({ ...progress, roomConfig: updated });
    } else if (item.category === 'outfit') {
      const updated = updateAvatarConfig({ equippedOutfit: item.id });
      onUpdateProgress({ ...progress, avatarConfig: updated });
    } else if (item.category === 'head') {
      const updated = updateAvatarConfig({ equippedHead: item.id });
      onUpdateProgress({ ...progress, avatarConfig: updated });
    } else if (item.category === 'hand') {
      const updated = updateAvatarConfig({ equippedHand: item.id });
      onUpdateProgress({ ...progress, avatarConfig: updated });
    }

    if (item.quote) {
      sayAvatar(item.quote);
    }
  };

  // Buy or unlock locked item with stars
  const handleBuyWithStars = (item: RoomCatalogItem) => {
    if (progress.starsCount < item.starCost) {
      playWiggleError();
      triggerHaptic([20, 30]);
      speakSpanish(`Necesitas ${item.starCost} estrellitas para desbloquear este objeto.`);
      sayAvatar(`⭐ Te faltan ${item.starCost - progress.starsCount} estrellas para este objeto.`);
      return;
    }

    playFanfare();
    playSparkleChime();
    triggerHaptic([40, 60, 90]);

    const res = buyRoomItem(item.id, item.starCost);
    if (res.success) {
      const fresh = loadPlayerProgress();
      onUpdateProgress(fresh);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#6cf8bb'],
      });

      // Automatically equip it
      handleEquipItem(item);
      sayAvatar(`✨ ¡Desbloqueaste: ${item.name}! ¡Mira qué bien queda!`);
    }
  };

  // When clicking a locked item card to learn how to unlock it
  const handleExplainUnlockTask = (item: RoomCatalogItem) => {
    playPop(340);
    triggerHaptic(15);
    speakSpanish(`Para desbloquear este objeto: ${item.taskDescription}. O puedes canjearlo con ${item.starCost} estrellas.`);
    sayAvatar(`🎯 ${item.taskDescription}`);
  };

  // Quick slot click to open drawer directly to that category
  const handleSlotClick = (category: RoomSlotType) => {
    playPop(420);
    triggerHaptic(15);
    setMainDrawerTab('habitacion');
    setRoomSubTab(category);
    setIsDrawerOpen(true);
  };

  // Current equipped items lookup
  const currentBed = AVATAR_ROOM_CATALOG.find(i => i.id === roomConfig.bed);
  const currentDesk = AVATAR_ROOM_CATALOG.find(i => i.id === roomConfig.desk);
  const currentRug = AVATAR_ROOM_CATALOG.find(i => i.id === roomConfig.rug);
  const currentDecor = AVATAR_ROOM_CATALOG.find(i => i.id === roomConfig.wallDecor);
  const currentPet = AVATAR_ROOM_CATALOG.find(i => i.id === roomConfig.pet);
  const currentOutfit = AVATAR_ROOM_CATALOG.find(i => i.id === avatarConfig.equippedOutfit);
  const currentHead = AVATAR_ROOM_CATALOG.find(i => i.id === avatarConfig.equippedHead);
  const currentHand = AVATAR_ROOM_CATALOG.find(i => i.id === avatarConfig.equippedHand);

  // Catalog items filtered by active drawer tabs
  const displayedCatalogItems = useMemo(() => {
    if (mainDrawerTab === 'habitacion') {
      return AVATAR_ROOM_CATALOG.filter(item => item.category === roomSubTab);
    } else {
      if (avatarSubTab === 'hairColor' || avatarSubTab === 'skinTone' || avatarSubTab === 'expression' || avatarSubTab === 'hairStyle') {
        return [];
      }
      return AVATAR_ROOM_CATALOG.filter(item => item.category === avatarSubTab);
    }
  }, [mainDrawerTab, roomSubTab, avatarSubTab]);

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto select-none relative">
      <style>{`
        @keyframes avatarBreathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.015, 0.985) translateY(-2px); }
        }
        @keyframes avatarBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes petFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .anim-breathe {
          animation: avatarBreathe 3.5s ease-in-out infinite;
        }
        .anim-blink {
          animation: avatarBlink 4s infinite;
          transform-origin: center;
        }
        .anim-pet {
          animation: petFloat 2.8s ease-in-out infinite;
        }
        .anim-twinkle {
          animation: starTwinkle 2s ease-in-out infinite;
        }
      `}</style>

      {/* Top Header Bar inside Room */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-[#ffd0bb] shadow-sm mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-300 to-amber-100 flex items-center justify-center text-lg shadow-sm border border-amber-300">
            🏠
          </div>
          <div>
            <h2 className="text-sm font-black text-[#351000] leading-tight flex items-center gap-1.5">
              <span>Cuarto de {progress.playerName || 'Pequeño Campeón'}</span>
              <span className="text-xs">✨</span>
            </h2>
            <p className="text-[11px] text-[#855300] font-bold">
              ¡Gana muebles y ropa completando tareas!
            </p>
          </div>
        </div>

        {/* Action Buttons: Time of day toggle + Stars */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleTimeOfDay}
            title={roomConfig.timeOfDay === 'dia' ? 'Cambiar a Noche' : 'Cambiar a Día'}
            className="flex items-center gap-1 bg-[#ffeae1] hover:bg-[#ffd7c6] text-[#351000] px-2.5 py-1 rounded-full text-xs font-black border border-[#ffd0bb] active:scale-95 transition-all cursor-pointer shadow-sm"
            type="button"
          >
            <span>{roomConfig.timeOfDay === 'dia' ? '☀️ Día' : '🌙 Noche'}</span>
          </button>

          <div className="flex items-center gap-1 bg-amber-100 text-[#855300] px-2.5 py-1 rounded-full text-xs font-black border border-amber-300 shadow-sm">
            <span>⭐</span>
            <span>{progress.starsCount}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          THE 2.5D INTERACTIVE ROOM STAGE
         ======================================================== */}
      <div
        className={`relative w-full aspect-[4/3.3] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#ffddb8] transition-colors duration-700 ${
          roomConfig.wallpaper === 'wall-pink'
            ? 'bg-gradient-to-b from-[#fce7f3] to-[#fed7aa]'
            : roomConfig.wallpaper === 'wall-stars'
            ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81]'
            : roomConfig.wallpaper === 'wall-sky'
            ? 'bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#fef08a]'
            : roomConfig.wallpaper === 'wall-forest'
            ? 'bg-gradient-to-b from-[#bbf7d0] via-[#86efac] to-[#fef08a]'
            : roomConfig.wallpaper === 'wall-castle'
            ? 'bg-gradient-to-b from-[#e9d5ff] via-[#d8b4fe] to-[#fed7aa]'
            : roomConfig.wallpaper === 'wall-rainbow'
            ? 'bg-gradient-to-b from-[#fed7aa] via-[#fbcfe8] to-[#bae6fd]'
            : 'bg-gradient-to-b from-[#fff7ed] to-[#fed7aa]'
        }`}
      >
        {/* Night Time Stars Overlay (when Noche is active) */}
        {roomConfig.timeOfDay === 'noche' && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-4 left-6 text-yellow-200 text-xs anim-twinkle">✦</div>
            <div className="absolute top-12 left-28 text-yellow-100 text-sm anim-twinkle" style={{ animationDelay: '0.7s' }}>★</div>
            <div className="absolute top-7 right-20 text-yellow-200 text-xs anim-twinkle" style={{ animationDelay: '1.2s' }}>✦</div>
            <div className="absolute top-16 right-8 text-yellow-100 text-sm anim-twinkle" style={{ animationDelay: '0.4s' }}>★</div>
            <div className="absolute top-2 left-1/2 text-yellow-200 text-xs anim-twinkle" style={{ animationDelay: '1.5s' }}>✦</div>
          </div>
        )}

        {/* 2.5D Room Perspective Walls (Shadow Gradients) */}
        <div className="absolute top-0 left-0 bottom-[35%] w-10 bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10" />
        <div className="absolute top-0 right-0 bottom-[35%] w-10 bg-gradient-to-l from-black/15 to-transparent pointer-events-none z-10" />

        {/* ==================== BACK WALL & WINDOW ==================== */}
        <div className="absolute top-0 inset-x-0 h-[65%] flex items-center justify-center p-4">
          {/* Arched Window (Clickable to toggle time of day) */}
          <div
            onClick={handleToggleTimeOfDay}
            title="Toca la ventana para cambiar día / noche"
            className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-t-full bg-gradient-to-b from-sky-300 to-sky-100 border-4 border-white shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all group z-10"
          >
            {/* Window Interior Scene */}
            {roomConfig.timeOfDay === 'dia' ? (
              <div className="relative w-full h-full bg-gradient-to-b from-[#60a5fa] to-[#bae6fd] flex flex-col items-center justify-between p-2">
                <div className="w-10 h-10 rounded-full bg-amber-300 shadow-[0_0_20px_#f59e0b] animate-pulse self-end mr-1 mt-1 flex items-center justify-center text-xs">
                  ☀️
                </div>
                <div className="text-xl animate-bounce">☁️</div>
                <div className="w-full h-4 bg-emerald-400 rounded-t-full opacity-70"></div>
              </div>
            ) : (
              <div className="relative w-full h-full bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] flex flex-col items-center justify-between p-2">
                <div className="w-9 h-9 rounded-full bg-yellow-100 shadow-[0_0_18px_#fef08a] self-start ml-2 mt-2 flex items-center justify-center text-xs">
                  🌙
                </div>
                <div className="text-xs text-yellow-200 anim-twinkle">✨ ★ ✨</div>
                <div className="w-full h-4 bg-indigo-950 rounded-t-full opacity-70"></div>
              </div>
            )}
            {/* Window Glass Crossbars */}
            <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white/80 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-white/80 pointer-events-none"></div>
            {/* Window Sill */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-100 border-t border-amber-300 shadow"></div>
          </div>

          {/* Wall Decor Item (Top Right of Back Wall) */}
          <div
            onClick={() => handleSlotClick('decor')}
            className="absolute top-4 right-4 sm:right-8 z-10 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            {currentDecor && currentDecor.id !== 'decor-none' ? (
              <div className="flex flex-col items-center bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-md border-2 border-amber-300">
                <span className="text-3xl filter drop-shadow animate-pulse">{currentDecor.emoji}</span>
                <span className="text-[9px] font-black text-[#534434] max-w-[70px] truncate text-center">
                  {currentDecor.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-amber-400/60 bg-white/40 hover:bg-white/70 px-2 py-1.5 rounded-2xl text-[10px] font-bold text-amber-800 transition-all">
                <span>🖼️</span>
                <span>+ Cuadro</span>
              </div>
            )}
          </div>

          {/* Wall Banner Garland (if decor-garland) */}
          {roomConfig.wallDecor === 'decor-garland' && (
            <div className="absolute top-1 inset-x-2 flex justify-between pointer-events-none z-10 text-xl opacity-90 animate-pulse">
              <span>🎏</span>
              <span>🎏</span>
              <span>🎏</span>
              <span>🎏</span>
            </div>
          )}
        </div>

        {/* ==================== 2.5D FLOOR STAGE ==================== */}
        <div
          className={`absolute bottom-0 inset-x-0 h-[38%] border-t-4 border-[#e2a875] z-10 ${
            roomConfig.floor === 'floor-tiles'
              ? 'bg-[radial-gradient(#bae6fd_1px,transparent_1px)] [background-size:16px_16px] bg-sky-100'
              : roomConfig.floor === 'floor-cloud'
              ? 'bg-gradient-to-t from-sky-100 via-white to-sky-50'
              : roomConfig.floor === 'floor-grass'
              ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400'
              : roomConfig.floor === 'floor-candy'
              ? 'bg-[radial-gradient(#f472b6_1.5px,transparent_1.5px)] [background-size:18px_18px] bg-pink-100'
              : 'bg-gradient-to-t from-[#b45309] via-[#d97706] to-[#f59e0b]'
          }`}
        >
          {/* Wooden Planks Pattern Overlay if wood floor */}
          {(!roomConfig.floor || roomConfig.floor === 'floor-wood') && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:40px_100%] opacity-40"></div>
          )}

          {/* ==================== BED SLOT (Left Area) ==================== */}
          <div
            onClick={() => handleSlotClick('bed')}
            className={`absolute bottom-6 left-3 sm:left-6 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              bouncingSlot === 'bed' ? 'scale-110' : ''
            }`}
          >
            {currentBed && currentBed.id !== 'bed-none' ? (
              <div className="flex flex-col items-center bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-300 shadow-[0_6px_0_0_#d97706]">
                <div className="text-4xl sm:text-5xl filter drop-shadow">
                  {currentBed.emoji}
                </div>
                <span className="text-[10px] font-black text-[#351000] mt-1 max-w-[80px] truncate text-center">
                  {currentBed.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-amber-600/60 bg-amber-100/60 hover:bg-amber-100/90 rounded-2xl p-2 text-center text-amber-900 transition-all">
                <span className="text-2xl opacity-60">🛏️</span>
                <span className="text-[10px] font-black mt-1 leading-tight">+ Cama</span>
                <span className="text-[8px] opacity-75 font-bold">(Vacío)</span>
              </div>
            )}
          </div>

          {/* ==================== DESK / STUDY SLOT (Right Area) ==================== */}
          <div
            onClick={() => handleSlotClick('desk')}
            className={`absolute bottom-6 right-3 sm:right-6 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              bouncingSlot === 'desk' ? 'scale-110' : ''
            }`}
          >
            {currentDesk && currentDesk.id !== 'desk-none' ? (
              <div className="flex flex-col items-center bg-white/90 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-300 shadow-[0_6px_0_0_#d97706]">
                <div className="text-4xl sm:text-5xl filter drop-shadow">
                  {currentDesk.emoji}
                </div>
                <span className="text-[10px] font-black text-[#351000] mt-1 max-w-[80px] truncate text-center">
                  {currentDesk.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-amber-600/60 bg-amber-100/60 hover:bg-amber-100/90 rounded-2xl p-2 text-center text-amber-900 transition-all">
                <span className="text-2xl opacity-60">🎨</span>
                <span className="text-[10px] font-black mt-1 leading-tight">+ Mesa</span>
                <span className="text-[8px] opacity-75 font-bold">(Vacío)</span>
              </div>
            )}
          </div>

          {/* ==================== RUG SLOT (Center Area) ==================== */}
          <div
            onClick={() => handleSlotClick('rug')}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-15 cursor-pointer transition-transform hover:scale-105"
          >
            {currentRug && currentRug.id !== 'rug-none' ? (
              <div className="flex flex-col items-center justify-center w-36 h-20 sm:w-44 sm:h-24 rounded-[40%] bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-2 border-amber-300 shadow-md">
                <span className="text-3xl filter drop-shadow">{currentRug.emoji}</span>
                <span className="text-[9px] font-black text-[#855300] mt-0.5">{currentRug.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-32 h-16 rounded-[40%] border-2 border-dashed border-amber-600/50 bg-amber-200/30 hover:bg-amber-200/60 text-amber-900 text-xs font-bold transition-all">
                <span>✨ + Alfombra</span>
              </div>
            )}
          </div>

          {/* ==================== ANIMATED AVATAR (Center Stage) ==================== */}
          <div
            onClick={handleTapAvatar}
            title="¡Toca a tu avatar para saludar!"
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center transition-all ${
              avatarCheering ? 'scale-115 -translate-y-4' : 'hover:scale-105'
            }`}
          >
            {/* Dynamic Speech Bubble */}
            {activeSpeechBubble && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-white text-[#351000] text-[11px] font-black p-2.5 rounded-2xl shadow-xl border-2 border-amber-300 text-center animate-bounce z-40">
                {activeSpeechBubble}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-amber-300 rotate-45"></div>
              </div>
            )}

            {/* SVG Chibi Avatar Character */}
            <div className="relative w-28 h-36 sm:w-32 sm:h-40 anim-breathe">
              <svg viewBox="0 0 120 150" className="w-full h-full filter drop-shadow-lg">
                {/* Body Shadow */}
                <ellipse cx="60" cy="144" rx="30" ry="6" fill="rgba(0,0,0,0.25)" />

                {/* Back Hair (if coletas or flequillo) */}
                {avatarConfig.hairStyle === 'coletas' && (
                  <g fill={avatarConfig.hairColor}>
                    <circle cx="24" cy="50" r="14" />
                    <circle cx="96" cy="50" r="14" />
                  </g>
                )}
                {avatarConfig.hairStyle === 'flequillo' && (
                  <path
                    d="M 30 50 Q 20 85 28 100 Q 60 105 92 100 Q 100 85 90 50 Z"
                    fill={avatarConfig.hairColor}
                  />
                )}

                {/* Legs & Shoes */}
                <rect x="44" y="112" width="12" height="24" rx="6" fill="#1e293b" />
                <rect x="64" y="112" width="12" height="24" rx="6" fill="#1e293b" />
                <ellipse cx="50" cy="136" rx="8" ry="5" fill="#ef4444" />
                <ellipse cx="70" cy="136" rx="8" ry="5" fill="#ef4444" />

                {/* Torso / Outfit */}
                {avatarConfig.equippedOutfit === 'outfit-overalls' ? (
                  <g>
                    {/* Blue Overalls */}
                    <rect x="38" y="80" width="44" height="36" rx="8" fill="#3b82f6" />
                    <path d="M 44 80 L 44 68 L 52 68 L 52 80 Z" fill="#2563eb" />
                    <path d="M 68 80 L 68 68 L 76 68 L 76 80 Z" fill="#2563eb" />
                    <circle cx="48" cy="84" r="2.5" fill="#facc15" />
                    <circle cx="72" cy="84" r="2.5" fill="#facc15" />
                    <rect x="52" y="90" width="16" height="12" rx="3" fill="#1d4ed8" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-superhero' ? (
                  <g>
                    {/* Cape */}
                    <path d="M 32 80 L 22 125 L 98 125 L 88 80 Z" fill="#e11d48" />
                    {/* Hero Suit */}
                    <rect x="38" y="76" width="44" height="40" rx="8" fill="#2563eb" />
                    <polygon points="60,82 66,94 54,94" fill="#facc15" />
                    <rect x="42" y="110" width="36" height="6" fill="#facc15" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-artist' ? (
                  <g>
                    <rect x="38" y="76" width="44" height="40" rx="8" fill="#f8fafc" />
                    <circle cx="48" cy="88" r="3" fill="#ef4444" />
                    <circle cx="70" cy="94" r="3.5" fill="#3b82f6" />
                    <circle cx="56" cy="102" r="3" fill="#22c55e" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-wizard' ? (
                  <g>
                    <path d="M 38 76 L 30 120 L 90 120 L 82 76 Z" fill="#7c3aed" />
                    <circle cx="60" cy="92" r="3" fill="#facc15" />
                    <circle cx="52" cy="106" r="2" fill="#facc15" />
                    <circle cx="68" cy="106" r="2" fill="#facc15" />
                  </g>
                ) : (
                  /* Basic Star T-Shirt */
                  <g>
                    <rect x="38" y="78" width="44" height="38" rx="8" fill="#38bdf8" />
                    <polygon points="60,86 63,94 71,94 65,99 67,107 60,102 53,107 55,99 49,94 57,94" fill="#facc15" />
                  </g>
                )}

                {/* Arms */}
                <ellipse cx="34" cy="94" rx="6" ry="14" fill={avatarConfig.skinTone} />
                <ellipse cx="86" cy="94" rx="6" ry="14" fill={avatarConfig.skinTone} />

                {/* Neck */}
                <rect x="54" y="66" width="12" height="14" rx="4" fill={avatarConfig.skinTone} />

                {/* Round Chibi Head */}
                <circle cx="60" cy="50" r="28" fill={avatarConfig.skinTone} />

                {/* Cheeks */}
                <ellipse cx="43" cy="56" rx="4.5" ry="3" fill="#fda4af" opacity="0.75" />
                <ellipse cx="77" cy="56" rx="4.5" ry="3" fill="#fda4af" opacity="0.75" />

                {/* Eyes with Blinking Animation */}
                <g className="anim-blink">
                  {avatarConfig.expression === 'guiño' ? (
                    <g>
                      {/* Left eye open */}
                      <circle cx="48" cy="50" r="5" fill="#1e293b" />
                      <circle cx="46.5" cy="48" r="1.8" fill="#ffffff" />
                      {/* Right eye winking */}
                      <path d="M 68 50 Q 73 45 78 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </g>
                  ) : avatarConfig.expression === 'sorpresa' ? (
                    <g>
                      <circle cx="48" cy="49" r="6" fill="#1e293b" />
                      <circle cx="46" cy="47" r="2" fill="#ffffff" />
                      <circle cx="72" cy="49" r="6" fill="#1e293b" />
                      <circle cx="70" cy="47" r="2" fill="#ffffff" />
                    </g>
                  ) : (
                    <g>
                      <circle cx="48" cy="50" r="5.5" fill="#1e293b" />
                      <circle cx="46.5" cy="48" r="2" fill="#ffffff" />
                      <circle cx="72" cy="50" r="5.5" fill="#1e293b" />
                      <circle cx="70.5" cy="48" r="2" fill="#ffffff" />
                    </g>
                  )}
                </g>

                {/* Eyebrows */}
                <path d="M 44 42 Q 48 39 52 42" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 68 42 Q 72 39 76 42" stroke="#451a03" strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Mouth */}
                {avatarConfig.expression === 'sorpresa' ? (
                  <ellipse cx="60" cy="62" rx="4" ry="5" fill="#e11d48" />
                ) : (
                  <path d="M 53 60 Q 60 67 67 60" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="#fda4af" />
                )}

                {/* Glasses if 'genio' expression */}
                {avatarConfig.expression === 'genio' && (
                  <g stroke="#1e293b" strokeWidth="2" fill="none">
                    <circle cx="48" cy="50" r="8" />
                    <circle cx="72" cy="50" r="8" />
                    <line x1="56" y1="50" x2="64" y2="50" />
                  </g>
                )}

                {/* Front Hair */}
                <g fill={avatarConfig.hairColor}>
                  {avatarConfig.hairStyle === 'corto' && (
                    <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                  )}
                  {avatarConfig.hairStyle === 'coletas' && (
                    <g>
                      <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                      {/* Bows */}
                      <circle cx="24" cy="50" r="4" fill="#ec4899" />
                      <circle cx="96" cy="50" r="4" fill="#ec4899" />
                    </g>
                  )}
                  {avatarConfig.hairStyle === 'rizado' && (
                    <g>
                      <circle cx="38" cy="30" r="10" />
                      <circle cx="52" cy="22" r="11" />
                      <circle cx="68" cy="22" r="11" />
                      <circle cx="82" cy="30" r="10" />
                      <circle cx="34" cy="42" r="8" />
                      <circle cx="86" cy="42" r="8" />
                    </g>
                  )}
                  {avatarConfig.hairStyle === 'cresta' && (
                    <path d="M 34 44 Q 38 24 54 20 Q 60 10 66 20 Q 82 24 86 44 Q 74 34 60 35 Q 46 34 34 44 Z" />
                  )}
                  {avatarConfig.hairStyle === 'flequillo' && (
                    <path d="M 32 48 Q 32 20 60 20 Q 88 20 88 48 Q 80 32 68 36 Q 52 38 40 32 Z" />
                  )}
                  {avatarConfig.hairStyle === 'gorrito' && (
                    <path d="M 32 44 Q 34 16 60 16 Q 86 16 88 44 Z" fill="#0284c7" />
                  )}
                </g>

                {/* Head Accessories */}
                {avatarConfig.equippedHead === 'head-crown' && (
                  <g>
                    <polygon points="42,24 46,12 53,20 60,8 67,20 74,12 78,24" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="60" cy="18" r="2" fill="#ef4444" />
                    <circle cx="48" cy="20" r="1.5" fill="#3b82f6" />
                    <circle cx="72" cy="20" r="1.5" fill="#22c55e" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-bow' && (
                  <g fill="#ec4899">
                    <polygon points="60,20 46,12 48,28" />
                    <polygon points="60,20 74,12 72,28" />
                    <circle cx="60" cy="20" r="4" fill="#f43f5e" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-cap' && (
                  <g>
                    <ellipse cx="60" cy="26" rx="26" ry="10" fill="#3b82f6" />
                    <path d="M 80 26 Q 96 30 100 36 L 82 32 Z" fill="#2563eb" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-cat-ears' && (
                  <g fill="#f472b6" stroke="#db2777" strokeWidth="1.5">
                    <polygon points="38,28 32,10 48,22" />
                    <polygon points="82,28 88,10 72,22" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-headphones' && (
                  <g stroke="#a855f7" strokeWidth="4" fill="none">
                    <path d="M 32 50 A 28 28 0 0 1 88 50" />
                    <circle cx="32" cy="50" r="7" fill="#c084fc" stroke="#7e22ce" strokeWidth="2" />
                    <circle cx="88" cy="50" r="7" fill="#c084fc" stroke="#7e22ce" strokeWidth="2" />
                  </g>
                )}

                {/* Hand Accessories */}
                {avatarConfig.equippedHand === 'hand-pencil' && (
                  <g transform="translate(85, 88) rotate(25)">
                    <rect x="0" y="0" width="6" height="24" fill="#f59e0b" />
                    <polygon points="0,0 3,-8 6,0" fill="#fed7aa" />
                    <polygon points="2,-5 3,-8 4,-5" fill="#1e293b" />
                  </g>
                )}
                {avatarConfig.equippedHand === 'hand-wand' && (
                  <g transform="translate(85, 80) rotate(15)">
                    <rect x="0" y="5" width="4" height="28" rx="2" fill="#d97706" />
                    <polygon points="2,0 5,6 10,7 6,11 7,16 2,13 -3,16 -2,11 -6,7 -1,6" fill="#facc15" />
                  </g>
                )}
                {avatarConfig.equippedHand === 'hand-book' && (
                  <g transform="translate(80, 90)">
                    <rect x="0" y="0" width="18" height="14" rx="2" fill="#3b82f6" />
                    <line x1="9" y1="0" x2="9" y2="14" stroke="#ffffff" strokeWidth="1.5" />
                  </g>
                )}
                {avatarConfig.equippedHand === 'hand-teddy' && (
                  <g transform="translate(20, 90)">
                    <circle cx="6" cy="8" r="7" fill="#b45309" />
                    <circle cx="2" cy="3" r="2.5" fill="#92400e" />
                    <circle cx="10" cy="3" r="2.5" fill="#92400e" />
                  </g>
                )}
                {avatarConfig.equippedHand === 'hand-balloon' && (
                  <g transform="translate(85, 45)">
                    <path d="M 10 18 Q 4 4 14 0 Q 24 4 18 18 Q 14 24 14 26 L 14 50" stroke="#ef4444" strokeWidth="1" fill="none" />
                    <path d="M 14 26 C 2 12 12 -4 20 8 C 28 -4 38 12 26 26 Z" fill="#ef4444" transform="translate(-6, -10)" />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* ==================== PET SLOT (Beside Avatar) ==================== */}
          <div
            onClick={() => {
              if (currentPet && currentPet.id !== 'pet-none') {
                handleTapPet(currentPet);
              } else {
                handleSlotClick('pet');
              }
            }}
            className={`absolute bottom-6 left-[62%] sm:left-[60%] z-25 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
              bouncingSlot === 'pet' ? 'scale-125 -translate-y-2' : ''
            }`}
          >
            {currentPet && currentPet.id !== 'pet-none' ? (
              <div className="flex flex-col items-center anim-pet">
                <span className="text-3xl sm:text-4xl filter drop-shadow">
                  {currentPet.emoji}
                </span>
                <span className="text-[9px] font-black bg-white/90 px-1.5 py-0.5 rounded-full text-[#351000] border border-amber-300 shadow-sm mt-0.5">
                  {currentPet.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed border-amber-500/50 bg-white/30 hover:bg-white/60 text-amber-900 text-[10px] font-bold">
                <span>🐾</span>
                <span>+ Mascota</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA: Big Shiny "Armario & Decoración" Button */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          onClick={() => {
            playPop(480);
            triggerHaptic(15);
            setIsDrawerOpen(true);
          }}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-[#f59e0b] via-amber-400 to-[#f59e0b] hover:from-amber-400 hover:to-amber-500 text-white rounded-2xl font-black text-sm shadow-[0_5px_0_0_#d97706] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300"
          type="button"
        >
          <span className="text-xl">👗🎨</span>
          <span>Armario & Decorar Habitación</span>
        </button>

        {/* Quick button to clear all furniture (Reset to Empty Room) */}
        <button
          onClick={() => {
            playPop(350);
            triggerHaptic(15);
            const resetRoom = updateRoomConfig({
              bed: 'bed-none',
              desk: 'desk-none',
              rug: 'rug-none',
              wallDecor: 'decor-none',
              pet: 'pet-none',
            });
            onUpdateProgress({ ...progress, roomConfig: resetRoom });
            sayAvatar('🧹 ¡Habitación limpia y vacía! ¡Lista para decorar desde cero!');
          }}
          title="Dejar habitación vacía"
          className="py-3 px-3 bg-white hover:bg-orange-50 text-[#855300] rounded-2xl font-bold text-xs shadow-[0_3px_0_0_#ffd0bb] border border-[#ffd0bb] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
          type="button"
        >
          <span>🧹</span>
          <span className="hidden xs:inline">Vaciar</span>
        </button>
      </div>

      {/* ========================================================
          THE CUSTOMIZATION DRAWER (ARMARIO MÁGICO)
         ======================================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
          <div className="w-full max-w-xl max-h-[85vh] sm:max-h-[88vh] bg-[#fff8f6] rounded-t-3xl sm:rounded-3xl border-4 border-[#ffddb8] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Drawer Header */}
            <div className="p-3.5 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-[#ffd0bb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-base font-black text-[#351000] leading-tight">
                    Tienda & Armario de Recompensas
                  </h3>
                  <p className="text-[11px] text-[#855300] font-bold">
                    Completa tareas escolares para ganar cada objeto
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playPop(380);
                  setIsDrawerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white text-[#534434] hover:text-[#351000] border border-[#ffd0bb] shadow-sm flex items-center justify-center text-sm font-black cursor-pointer active:scale-95"
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Main Tabs: Mi Habitación vs Mi Avatar */}
            <div className="grid grid-cols-2 gap-2 p-2 bg-[#ffeae1] border-b border-[#ffd0bb]">
              <button
                onClick={() => {
                  playPop(420);
                  setMainDrawerTab('habitacion');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mainDrawerTab === 'habitacion'
                    ? 'bg-white text-[#d97706] shadow-[0_3px_0_0_#ffd0bb] scale-102 border border-amber-300'
                    : 'text-[#613b00] hover:text-[#351000]'
                }`}
                type="button"
              >
                <span className="text-base">🏠</span>
                <span>Mi Habitación</span>
              </button>

              <button
                onClick={() => {
                  playPop(420);
                  setMainDrawerTab('avatar');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mainDrawerTab === 'avatar'
                    ? 'bg-white text-[#d97706] shadow-[0_3px_0_0_#ffd0bb] scale-102 border border-amber-300'
                    : 'text-[#613b00] hover:text-[#351000]'
                }`}
                type="button"
              >
                <span className="text-base">👤</span>
                <span>Mi Avatar</span>
              </button>
            </div>

            {/* Sub-Category Pills */}
            <div className="flex items-center gap-1.5 p-2 overflow-x-auto scrollbar-none bg-[#fff1eb] border-b border-[#ffd0bb]">
              {mainDrawerTab === 'habitacion' ? (
                <>
                  {[
                    { id: 'bed', name: 'Camas', emoji: '🛏️' },
                    { id: 'wallpaper', name: 'Paredes', emoji: '🎨' },
                    { id: 'floor', name: 'Suelos', emoji: '🪵' },
                    { id: 'desk', name: 'Estudio', emoji: '📚' },
                    { id: 'rug', name: 'Alfombras', emoji: '🌟' },
                    { id: 'decor', name: 'Cuadros', emoji: '🖼️' },
                    { id: 'pet', name: 'Mascotas', emoji: '🐾' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        playPop(420);
                        setRoomSubTab(tab.id as RoomSlotType);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                        roomSubTab === tab.id
                          ? 'bg-[#d97706] text-white shadow-sm'
                          : 'bg-white text-[#613b00] border border-[#ffd0bb] hover:bg-orange-50'
                      }`}
                      type="button"
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: 'outfit', name: 'Ropita', emoji: '👕' },
                    { id: 'hairStyle', name: 'Peinado', emoji: '💇' },
                    { id: 'hairColor', name: 'Color Pelo', emoji: '🎨' },
                    { id: 'skinTone', name: 'Piel', emoji: '👶' },
                    { id: 'expression', name: 'Caritas', emoji: '😊' },
                    { id: 'head', name: 'Gorros', emoji: '🧢' },
                    { id: 'hand', name: 'Mano', emoji: '🪄' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        playPop(420);
                        setAvatarSubTab(tab.id as AvatarSlotType);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-black shrink-0 flex items-center gap-1 transition-all cursor-pointer ${
                        avatarSubTab === tab.id
                          ? 'bg-[#d97706] text-white shadow-sm'
                          : 'bg-white text-[#613b00] border border-[#ffd0bb] hover:bg-orange-50'
                      }`}
                      type="button"
                    >
                      <span>{tab.emoji}</span>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Drawer Body Items Grid */}
            <div className="flex-1 p-3 overflow-y-auto max-h-[55vh]">
              {/* Special Palette Pickers for Skin Tone, Hair Color, Expression, Hair Style */}
              {mainDrawerTab === 'avatar' && avatarSubTab === 'skinTone' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#855300]">
                    Elige el tono de piel para tu avatar:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {SKIN_TONE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          playPop(460);
                          const updated = updateAvatarConfig({ skinTone: opt.color });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Tono de piel ${opt.name} seleccionado!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                          avatarConfig.skinTone === opt.color
                            ? 'border-[#00714d] bg-emerald-50 shadow-md scale-102'
                            : 'border-[#ffd0bb] bg-white hover:bg-orange-50'
                        }`}
                        type="button"
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="text-left">
                          <span className="text-xs font-black text-[#351000] block">{opt.name}</span>
                          {avatarConfig.skinTone === opt.color && (
                            <span className="text-[10px] font-bold text-emerald-600">✅ En uso</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mainDrawerTab === 'avatar' && avatarSubTab === 'hairColor' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#855300]">
                    Elige el color de cabello:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HAIR_COLOR_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          playPop(460);
                          const updated = updateAvatarConfig({ hairColor: opt.color });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Color de pelo ${opt.name} seleccionado!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                          avatarConfig.hairColor === opt.color
                            ? 'border-[#00714d] bg-emerald-50 shadow-md scale-102'
                            : 'border-[#ffd0bb] bg-white hover:bg-orange-50'
                        }`}
                        type="button"
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: opt.color }}
                        />
                        <div className="text-left">
                          <span className="text-xs font-black text-[#351000] block">{opt.name}</span>
                          {avatarConfig.hairColor === opt.color && (
                            <span className="text-[10px] font-bold text-emerald-600">✅ En uso</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mainDrawerTab === 'avatar' && avatarSubTab === 'hairStyle' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#855300]">
                    Elige el peinado de tu avatar:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HAIR_STYLE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          playPop(460);
                          const updated = updateAvatarConfig({ hairStyle: opt.id });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Peinado ${opt.name} equipado!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                          avatarConfig.hairStyle === opt.id
                            ? 'border-[#00714d] bg-emerald-50 shadow-md scale-102'
                            : 'border-[#ffd0bb] bg-white hover:bg-orange-50'
                        }`}
                        type="button"
                      >
                        <span className="text-3xl">{opt.emoji}</span>
                        <div className="text-left">
                          <span className="text-xs font-black text-[#351000] block">{opt.name}</span>
                          <span className="text-[10px] text-[#855300]">{opt.desc}</span>
                          {avatarConfig.hairStyle === opt.id && (
                            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">✅ En uso</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mainDrawerTab === 'avatar' && avatarSubTab === 'expression' && (
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#855300]">
                    Elige la carita de tu avatar:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {EXPRESSION_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          playPop(460);
                          const updated = updateAvatarConfig({ expression: opt.id });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Carita ${opt.name}!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                          avatarConfig.expression === opt.id
                            ? 'border-[#00714d] bg-emerald-50 shadow-md scale-102'
                            : 'border-[#ffd0bb] bg-white hover:bg-orange-50'
                        }`}
                        type="button"
                      >
                        <span className="text-3xl">{opt.emoji}</span>
                        <div className="text-left">
                          <span className="text-xs font-black text-[#351000] block">{opt.name}</span>
                          <span className="text-[10px] text-[#855300]">{opt.desc}</span>
                          {avatarConfig.expression === opt.id && (
                            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">✅ En uso</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Catalog Items Grid (Furniture, Wallpapers, Outfits, etc.) */}
              {displayedCatalogItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {displayedCatalogItems.map(item => {
                    const status = checkItemUnlockStatus(
                      item,
                      Array.from(unlockedSet),
                      progress.completedWorlds,
                      progress.masteredLetters.length,
                      progress.learnedWords.length,
                      progress.readStoriesCount || 1
                    );

                    const isEquipped =
                      roomConfig.bed === item.id ||
                      roomConfig.desk === item.id ||
                      roomConfig.rug === item.id ||
                      roomConfig.wallpaper === item.id ||
                      roomConfig.floor === item.id ||
                      roomConfig.wallDecor === item.id ||
                      roomConfig.pet === item.id ||
                      avatarConfig.equippedOutfit === item.id ||
                      avatarConfig.equippedHead === item.id ||
                      avatarConfig.equippedHand === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border-2 flex flex-col justify-between gap-2 transition-all ${
                          isEquipped
                            ? 'border-[#00714d] bg-emerald-50/80 shadow-md ring-2 ring-emerald-300'
                            : status.isUnlocked
                            ? 'border-[#ffd0bb] bg-white shadow-sm hover:border-amber-400'
                            : 'border-slate-200 bg-slate-50/90 opacity-90'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shrink-0 border border-amber-200 shadow-inner">
                            {item.emoji}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-black text-[#351000] truncate">
                                {item.name}
                              </h4>
                              {isEquipped ? (
                                <span className="bg-[#6cf8bb] text-[#00714d] text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                                  En uso
                                </span>
                              ) : status.isUnlocked ? (
                                <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                                  Obtenido
                                </span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
                                  🔒 Bloqueado
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-[#534434] line-clamp-2 mt-0.5 leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Task requirement or Action button */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between gap-2">
                          {status.isUnlocked ? (
                            <button
                              onClick={() => handleEquipItem(item)}
                              disabled={isEquipped}
                              className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                isEquipped
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default opacity-80'
                                  : 'bg-[#f59e0b] hover:bg-amber-500 text-white shadow-[0_2px_0_0_#d97706] active:translate-y-0.5'
                              }`}
                              type="button"
                            >
                              {isEquipped ? '✅ Puesto en tu cuarto' : '✨ Colocar / Vestir'}
                            </button>
                          ) : (
                            <div className="w-full flex flex-col gap-1.5">
                              {/* Task Mission Banner */}
                              <div
                                onClick={() => handleExplainUnlockTask(item)}
                                className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-1.5 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-100"
                              >
                                <span className="text-xs">🎯</span>
                                <span className="flex-1 truncate leading-tight">
                                  <strong>Misión:</strong> {item.taskDescription}
                                </span>
                              </div>

                              {/* Star Purchase Button */}
                              {item.starCost > 0 && (
                                <button
                                  onClick={() => handleBuyWithStars(item)}
                                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    progress.starsCount >= item.starCost
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_2px_0_0_#065f46] active:translate-y-0.5'
                                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                  }`}
                                  type="button"
                                >
                                  <span>⭐</span>
                                  <span>Canjear por {item.starCost} Estrellas</span>
                                  {progress.starsCount < item.starCost && (
                                    <span className="text-[10px] opacity-75 font-normal">
                                      (Tienes {progress.starsCount})
                                    </span>
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Bottom Bar with Pedagogical Links */}
            <div className="p-3 bg-white border-t border-[#ffd0bb] flex items-center justify-between gap-2">
              <span className="text-xs text-[#534434] font-bold hidden sm:inline">
                ¿Quieres más cosas? Completa lecciones:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onGoToMundos && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onGoToMundos();
                    }}
                    className="flex-1 sm:flex-initial py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-[#855300] rounded-xl text-xs font-black border border-amber-300 flex items-center justify-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span>🧭</span>
                    <span>Ir a los Mundos</span>
                  </button>
                )}
                {onGoToCuentos && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onGoToCuentos();
                    }}
                    className="flex-1 sm:flex-initial py-1.5 px-3 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-black border border-purple-300 flex items-center justify-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span>📖</span>
                    <span>Leer Cuentos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

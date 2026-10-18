import React, { useState, useMemo, useRef } from 'react';
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
  onAddStars: _onAddStars,
  onGoToMundos,
  onGoToCuentos,
}) => {
  // Drawer visibility & tab state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mainDrawerTab, setMainDrawerTab] = useState<'avatar' | 'habitacion'>('habitacion');
  const [roomSubTab, setRoomSubTab] = useState<RoomSlotType>('bed');
  const [avatarSubTab, setAvatarSubTab] = useState<AvatarSlotType>('outfit');

  // Interactive avatar action & movement state
  const [avatarAction, setAvatarAction] = useState<
    'idle' | 'sleeping' | 'studying' | 'dancing' | 'petting' | 'cheering'
  >('idle');
  const [avatarPositionX, setAvatarPositionX] = useState<number>(50); // percentage 18%..82%
  const [avatarFacing, setAvatarFacing] = useState<'left' | 'right'>('right');
  const [floorTapRipple, setFloorTapRipple] = useState<{ x: number; y: number } | null>(null);

  // Room interactive furniture states
  const [isDeskLampOn, setIsDeskLampOn] = useState<boolean>(false);
  const [isMagicBookOpen, setIsMagicBookOpen] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [bouncingSlot, setBouncingSlot] = useState<string | null>(null);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<string | null>(
    '¡Hola! ¡Soy tu compañera y este es mi cuarto mágico!'
  );

  const floorRef = useRef<HTMLDivElement>(null);

  // Unlocked items Set for instant lookup
  const unlockedSet = useMemo(() => {
    return new Set(progress.unlockedRoomItems || []);
  }, [progress.unlockedRoomItems]);

  const { avatarConfig, roomConfig } = progress;

  // Speech bubble helper with Spanish TTS
  const sayAvatar = (text: string, voiceText?: string) => {
    setActiveSpeechBubble(text);
    speakSpanish(voiceText || text);
    setTimeout(() => {
      setActiveSpeechBubble(null);
    }, 4500);
  };

  // Avatar direct tap celebration
  const handleTapAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    playFanfare();
    playSparkleChime();
    triggerHaptic([30, 40, 50]);
    setAvatarAction('cheering');
    setTimeout(() => setAvatarAction('idle'), 1400);

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#f472b6', '#ec4899', '#fbcfe8', '#fef08a', '#38bdf8'],
    });

    const girlQuotes = [
      '¡Hola! ¡Me encanta cómo estamos decorando mi habitación!',
      '¡Mira mis coletas y mi vestido rosa! ¡Es mi favorito!',
      '¡Cada vez que completas tareas ganamos más ropa y muebles lindos!',
      '¡Toca mi camita si quieres que me eche una siesta!',
      '¡Toca mi escritorio para encender la lámpara y estudiar juntas!',
      '¡Toca la alfombra para verme bailar!',
      '¡Toca el armario para abrir mi ropero y cambiarme de ropa!',
      '¡Toca la ventana para ver el sol o la luna!',
      '¡Toca mi mascotita para darle cariño!',
    ];
    const pick = girlQuotes[Math.floor(Math.random() * girlQuotes.length)];
    sayAvatar(pick);
  };

  // Bed interaction: Sleep or Wake Up
  const handleBedInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarAction === 'sleeping') {
      // Wake up
      playFanfare();
      triggerHaptic(30);
      setAvatarAction('cheering');
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#fef08a', '#f59e0b', '#fbcfe8'],
      });
      sayAvatar('¡Buenos días! ¡Qué bien descansé! ¡A jugar y aprender!');
      setTimeout(() => setAvatarAction('idle'), 1500);
    } else {
      // Go to bed
      playSparkleChime();
      triggerHaptic(20);
      setAvatarPositionX(24);
      setAvatarFacing('right');
      setAvatarAction('sleeping');
      sayAvatar('¡Buenas noches! Estoy soñando con castillos de letras... 💤');
    }
  };

  // Desk interaction: Toggle Lamp, Open Magic Book, Study
  const handleDeskInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop(620);
    playSparkleChime();
    triggerHaptic(20);
    setIsDeskLampOn(prev => !prev);
    setIsMagicBookOpen(prev => !prev);
    setAvatarPositionX(76);
    setAvatarFacing('left');
    setAvatarAction('studying');
    setBouncingSlot('desk');
    setTimeout(() => setBouncingSlot(null), 800);

    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.65 },
      colors: ['#38bdf8', '#fef08a'],
    });

    sayAvatar('¡Estoy sentadita en mi mesa escribiendo cuentos con mis palabras mágicas!');
  };

  // Rug interaction: Happy dance
  const handleRugInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSparkleChime();
    triggerHaptic(25);
    setAvatarPositionX(50);
    setAvatarAction('dancing');
    setBouncingSlot('rug');
    setTimeout(() => setBouncingSlot(null), 1000);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#38bdf8', '#fef08a', '#a78bfa'],
    });

    sayAvatar('¡Wiiiii! ¡Mira cómo bailo en mi alfombra de colores!');
    setTimeout(() => {
      setAvatarAction('idle');
    }, 3500);
  };

  // Pet interaction: Pet backflip + cuddle
  const handleTapPet = (petItem?: RoomCatalogItem) => {
    playSparkleChime();
    triggerHaptic(25);
    setBouncingSlot('pet');
    setTimeout(() => setBouncingSlot(null), 800);
    setAvatarPositionX(66);
    setAvatarFacing('right');
    setAvatarAction('petting');

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#fef08a'],
    });

    if (petItem?.id === 'pet-kitty') {
      sayAvatar('🐱 ¡Miau! Ronron... ¡Qué cuarto tan calientito y lindo!');
    } else if (petItem?.id === 'pet-puppy') {
      sayAvatar('🐶 ¡Guau guau! ¡Muevo mi colita de felicidad por verte!');
    } else if (petItem?.id === 'pet-chispita') {
      sayAvatar('🐉 ¡Chispitas mágicas! ¡Vuelo por todo el cuarto feliz!');
    } else if (petItem?.id === 'pet-dino') {
      sayAvatar('🦖 ¡Roar tierno! ¡Leamos otro cuento juntas!');
    } else if (petItem?.id === 'pet-robot') {
      sayAvatar('🤖 ¡BEEP BOOP! ¡Amiga detectora de letras al 100%!');
    } else if (petItem?.id === 'pet-unicorn') {
      sayAvatar('🦄 ¡Magia pura de arcoíris y estrellas en tu cuarto!');
    } else {
      sayAvatar('🐾 ¡Tu mascota te quiere muchísimo!');
    }

    setTimeout(() => setAvatarAction('idle'), 2500);
  };

  // Wardrobe interaction: opens dressing room drawer
  const handleOpenWardrobe = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop(520);
    playSparkleChime();
    triggerHaptic(20);
    setMainDrawerTab('avatar');
    setAvatarSubTab('outfit');
    setIsDrawerOpen(true);
    sayAvatar('👗 ¡Abriendo mi armario mágico! ¡Elige qué ropita ponerme!');
  };

  // Radio interaction: Toggle music
  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPop(680);
    playSparkleChime();
    triggerHaptic(20);
    const nextMusic = !isMusicPlaying;
    setIsMusicPlaying(nextMusic);

    if (nextMusic) {
      setAvatarAction('dancing');
      sayAvatar('🎶 ¡Puse música alegre! ¡A bailar al ritmo de las vocales!');
      setTimeout(() => setAvatarAction('idle'), 3500);
    } else {
      sayAvatar('📻 Música en pausa.');
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

  // Floor Tap-to-walk interaction
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!floorRef.current) return;
    const rect = floorRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(18, Math.min(82, clickX));

    // Show sparkling ripple at tap coordinates
    setFloorTapRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setFloorTapRipple(null), 700);

    playPop(490);
    triggerHaptic(12);

    // Turn facing direction
    if (clampedX < avatarPositionX) {
      setAvatarFacing('left');
    } else {
      setAvatarFacing('right');
    }

    setAvatarPositionX(clampedX);

    // If was sleeping or studying, wake up
    if (avatarAction === 'sleeping') {
      setAvatarAction('cheering');
      sayAvatar('¡Me levanté a jugar!');
      setTimeout(() => setAvatarAction('idle'), 1200);
    } else if (avatarAction === 'studying') {
      setAvatarAction('idle');
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
        colors: ['#f59e0b', '#fbbf24', '#f472b6'],
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
    speakSpanish(
      `Para desbloquear este objeto: ${item.taskDescription}. O puedes canjearlo con ${item.starCost} estrellas.`
    );
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
  const currentHead = AVATAR_ROOM_CATALOG.find(i => i.id === avatarConfig.equippedHead);
  const currentHand = AVATAR_ROOM_CATALOG.find(i => i.id === avatarConfig.equippedHand);

  // Catalog items filtered by active drawer tabs
  const displayedCatalogItems = useMemo(() => {
    if (mainDrawerTab === 'habitacion') {
      return AVATAR_ROOM_CATALOG.filter(item => item.category === roomSubTab);
    } else {
      if (
        avatarSubTab === 'hairColor' ||
        avatarSubTab === 'skinTone' ||
        avatarSubTab === 'expression' ||
        avatarSubTab === 'hairStyle'
      ) {
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
        @keyframes avatarDance {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-8px); }
          75% { transform: rotate(8deg) translateY(-8px); }
        }
        @keyframes floatZzz {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          50% { opacity: 0.9; transform: translateY(-16px) scale(1); }
          100% { opacity: 0; transform: translateY(-32px) scale(1.2); }
        }
        @keyframes petFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes modalPop {
          0% { opacity: 0; transform: scale(0.92) translateY(14px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.8)); }
        }
        .anim-breathe {
          animation: avatarBreathe 3.5s ease-in-out infinite;
        }
        .anim-blink {
          animation: avatarBlink 4s infinite;
          transform-origin: center;
        }
        .anim-dance {
          animation: avatarDance 0.5s ease-in-out infinite;
        }
        .anim-pet {
          animation: petFloat 2.8s ease-in-out infinite;
        }
        .anim-twinkle {
          animation: starTwinkle 2s ease-in-out infinite;
        }
        .anim-lamp-glow {
          animation: pulseGlow 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Top Header Bar inside Room */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-[#ffd0bb] shadow-sm mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-300 via-amber-200 to-pink-200 flex items-center justify-center text-lg shadow-sm border border-pink-300">
            👧✨
          </div>
          <div>
            <h2 className="text-sm font-black text-[#351000] leading-tight flex items-center gap-1.5">
              <span>Cuarto de {progress.playerName || 'Pequeña Campeona'}</span>
              <span className="text-xs">🎀</span>
            </h2>
            <p className="text-[11px] text-[#855300] font-bold">
              ¡Habitación interactiva! Toca muebles y objetos para jugar
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
        className={`relative w-full min-h-[460px] h-[460px] sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#ffddb8] transition-colors duration-700 ${
          roomConfig.wallpaper === 'wall-pink'
            ? 'bg-gradient-to-b from-[#fce7f3] via-[#fed7aa] to-[#fbcfe8]'
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
        {/* Night Time Stars Overlay */}
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

        {/* ==================== BACK WALL & INTERACTIVE ACCESSORIES ==================== */}
        <div className="absolute top-0 inset-x-0 h-[65%] flex items-center justify-center p-4">
          {/* Interactive Arched Window (Toggles Día / Noche) */}
          <div
            onClick={handleToggleTimeOfDay}
            title="¡Toca la ventana mágica para cambiar entre el día y la noche!"
            className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-t-full bg-gradient-to-b from-sky-300 to-sky-100 border-4 border-white shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 active:scale-95 transition-all group z-10"
          >
            {roomConfig.timeOfDay === 'dia' ? (
              <div className="relative w-full h-full bg-gradient-to-b from-[#60a5fa] to-[#bae6fd] flex flex-col items-center justify-between p-2">
                <div className="w-10 h-10 rounded-full bg-amber-300 shadow-[0_0_20px_#f59e0b] animate-pulse self-end mr-1 mt-1 flex items-center justify-center text-xs">
                  ☀️
                </div>
                <div className="flex items-center gap-1 animate-bounce">
                  <span className="text-xl">☁️</span>
                  <span className="text-xs">🕊️</span>
                </div>
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
            <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white/80 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-white/80 pointer-events-none"></div>
            <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-100 border-t border-amber-300 shadow"></div>
          </div>

          {/* Interactive Wardrobe / Armario Mágico (Left of Window) */}
          <div
            onClick={handleOpenWardrobe}
            title="¡Toca mi armario para cambiarme de ropa, peinado o lazos!"
            className="absolute top-10 left-3 sm:left-6 z-15 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
          >
            <div className="flex flex-col items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border-2 border-pink-300 group-hover:border-pink-500">
              <span className="text-3xl filter drop-shadow group-hover:rotate-6 transition-transform">
                🚪👗
              </span>
              <span className="text-[9px] font-black text-pink-700 mt-0.5">Mi Armario</span>
            </div>
          </div>

          {/* Interactive Radio / Music Player (Right of Window) */}
          <div
            onClick={handleToggleMusic}
            title="¡Toca la radio para poner música y bailar!"
            className="absolute top-10 right-20 sm:right-28 z-15 cursor-pointer transition-transform hover:scale-110 active:scale-95 group"
          >
            <div
              className={`flex flex-col items-center p-1.5 rounded-2xl border-2 transition-all ${
                isMusicPlaying
                  ? 'bg-amber-100 border-amber-400 scale-105 shadow-[0_0_14px_#f59e0b]'
                  : 'bg-white/90 border-amber-200 shadow-sm'
              }`}
            >
              <span
                className={`text-2xl filter drop-shadow ${isMusicPlaying ? 'animate-bounce' : ''}`}
              >
                📻
              </span>
              <span className="text-[8px] font-black text-amber-800">
                {isMusicPlaying ? '¡Música!' : 'Radio'}
              </span>
            </div>
            {/* Floating musical notes */}
            {isMusicPlaying && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none flex gap-1 text-sm font-black animate-pulse">
                <span className="text-pink-500 animate-bounce">🎵</span>
                <span className="text-purple-500 animate-bounce" style={{ animationDelay: '0.3s' }}>
                  🎶
                </span>
              </div>
            )}
          </div>

          {/* Wall Decor Item (Far Right of Back Wall) */}
          <div
            onClick={() => handleSlotClick('decor')}
            className="absolute top-10 right-3 sm:right-6 z-15 cursor-pointer transition-transform hover:scale-110 active:scale-95"
          >
            {currentDecor && currentDecor.id !== 'decor-none' ? (
              <div className="flex flex-col items-center bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl shadow-md border-2 border-amber-300">
                <span className="text-3xl filter drop-shadow animate-pulse">{currentDecor.emoji}</span>
                <span className="text-[9px] font-black text-[#534434] max-w-[65px] truncate text-center">
                  {currentDecor.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-amber-400/60 bg-white/50 hover:bg-white/80 p-1.5 rounded-2xl text-[10px] font-bold text-amber-800 transition-all">
                <span>🖼️</span>
                <span>+ Cuadro</span>
              </div>
            )}
          </div>

          {/* Wall Banner Garland (if decor-garland equipped) */}
          {roomConfig.wallDecor === 'decor-garland' && (
            <div className="absolute top-1 inset-x-2 flex justify-between pointer-events-none z-10 text-xl opacity-90 animate-pulse">
              <span>🎏</span>
              <span>🎏</span>
              <span>🎏</span>
              <span>🎏</span>
            </div>
          )}
        </div>

        {/* ==================== 2.5D INTERACTIVE FLOOR STAGE ==================== */}
        <div
          ref={floorRef}
          onClick={handleFloorClick}
          title="¡Toca cualquier lugar del suelo para mover a tu niña por el cuarto!"
          className={`absolute bottom-0 inset-x-0 h-[46%] border-t-4 border-[#e2a875] z-10 cursor-pointer overflow-hidden ${
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
          {/* Wooden Planks Pattern Overlay */}
          {(!roomConfig.floor || roomConfig.floor === 'floor-wood') && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:40px_100%] opacity-40 pointer-events-none"></div>
          )}

          {/* Ripple Effect when Child Taps Floor */}
          {floorTapRipple && (
            <div
              style={{ left: floorTapRipple.x - 20, top: floorTapRipple.y - 20 }}
              className="absolute pointer-events-none w-10 h-10 rounded-full border-2 border-amber-300 bg-amber-200/40 animate-ping z-30"
            />
          )}
        </div>

          {/* ==================== BED SLOT (Left Area) ==================== */}
          <div
            onClick={currentBed && currentBed.id !== 'bed-none' ? handleBedInteraction : () => handleSlotClick('bed')}
            title={
              currentBed && currentBed.id !== 'bed-none'
                ? avatarAction === 'sleeping'
                  ? '¡Toca para despertar a la niña!'
                  : '¡Toca la cama para acostar a la niña a dormir!'
                : 'Toca para elegir una cama'
            }
            className={`absolute bottom-6 left-3 sm:left-6 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              bouncingSlot === 'bed' ? 'scale-110' : ''
            }`}
          >
            {currentBed && currentBed.id !== 'bed-none' ? (
              <div className="relative flex flex-col items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-300 shadow-[0_6px_0_0_#d97706]">
                <div className="text-4xl sm:text-5xl filter drop-shadow">{currentBed.emoji}</div>
                <span className="text-[10px] font-black text-[#351000] mt-1 max-w-[80px] truncate text-center">
                  {currentBed.name.split(' ')[0]}
                </span>

                {/* Sleep Indicator Zzz */}
                {avatarAction === 'sleeping' && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none text-base font-black text-indigo-700 animate-pulse">
                    💤 Zzz...
                  </div>
                )}

                {/* Small Wand icon to open drawer and swap bed */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSlotClick('bed');
                  }}
                  title="Cambiar modelo de cama"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-300 hover:bg-amber-400 border border-white text-xs flex items-center justify-center shadow-md active:scale-90"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-22 h-22 sm:w-24 sm:h-24 border-2 border-dashed border-amber-600/60 bg-amber-100/60 hover:bg-amber-100/90 rounded-2xl p-2 text-center text-amber-900 transition-all">
                <span className="text-2xl opacity-60">🛏️</span>
                <span className="text-[10px] font-black mt-1 leading-tight">+ Cama</span>
                <span className="text-[8px] opacity-75 font-bold">(Vacío)</span>
              </div>
            )}
          </div>

          {/* ==================== DESK / STUDY SLOT (Right Area) ==================== */}
          <div
            onClick={currentDesk && currentDesk.id !== 'desk-none' ? handleDeskInteraction : () => handleSlotClick('desk')}
            title={
              currentDesk && currentDesk.id !== 'desk-none'
                ? '¡Toca la mesa para encender la lámpara y estudiar!'
                : 'Toca para elegir un escritorio'
            }
            className={`absolute bottom-6 right-3 sm:right-6 z-20 cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
              bouncingSlot === 'desk' ? 'scale-110' : ''
            }`}
          >
            {currentDesk && currentDesk.id !== 'desk-none' ? (
              <div className="relative flex flex-col items-center bg-white/95 backdrop-blur-md p-2 rounded-2xl border-2 border-amber-300 shadow-[0_6px_0_0_#d97706]">
                {/* Glowing Lamp Light Cone over Desk */}
                {isDeskLampOn && (
                  <div className="absolute -top-12 inset-x-0 h-16 bg-gradient-to-b from-amber-300/40 via-yellow-200/20 to-transparent rounded-t-full pointer-events-none anim-lamp-glow" />
                )}

                <div className="text-4xl sm:text-5xl filter drop-shadow">{currentDesk.emoji}</div>
                <span className="text-[10px] font-black text-[#351000] mt-1 max-w-[80px] truncate text-center">
                  {currentDesk.name.split(' ')[0]}
                </span>

                {/* Floating Letters when Magic Book is Open */}
                {isMagicBookOpen && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none flex gap-1 text-xs font-black animate-bounce text-amber-600">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                  </div>
                )}

                {/* Small Wand icon to swap desk */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSlotClick('desk');
                  }}
                  title="Cambiar modelo de escritorio"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-300 hover:bg-amber-400 border border-white text-xs flex items-center justify-center shadow-md active:scale-90"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-22 h-22 sm:w-24 sm:h-24 border-2 border-dashed border-amber-600/60 bg-amber-100/60 hover:bg-amber-100/90 rounded-2xl p-2 text-center text-amber-900 transition-all">
                <span className="text-2xl opacity-60">🎨</span>
                <span className="text-[10px] font-black mt-1 leading-tight">+ Mesa</span>
                <span className="text-[8px] opacity-75 font-bold">(Vacío)</span>
              </div>
            )}
          </div>

          {/* ==================== RUG SLOT (Center Area) ==================== */}
          <div
            onClick={currentRug && currentRug.id !== 'rug-none' ? handleRugInteraction : () => handleSlotClick('rug')}
            title={
              currentRug && currentRug.id !== 'rug-none'
                ? '¡Toca la alfombra para ver bailar a la niña!'
                : 'Toca para elegir una alfombra'
            }
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-15 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          >
            {currentRug && currentRug.id !== 'rug-none' ? (
              <div className="relative flex flex-col items-center justify-center w-36 h-20 sm:w-44 sm:h-24 rounded-[40%] bg-gradient-to-r from-pink-200 via-amber-100 to-pink-200 border-2 border-pink-300 shadow-md">
                <span className="text-3xl filter drop-shadow">{currentRug.emoji}</span>
                <span className="text-[9px] font-black text-pink-800 mt-0.5">{currentRug.name}</span>

                {/* Edit wand icon */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSlotClick('rug');
                  }}
                  title="Cambiar alfombra"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-200 hover:bg-amber-300 border border-white text-[10px] flex items-center justify-center shadow-sm"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-32 h-16 rounded-[40%] border-2 border-dashed border-amber-600/50 bg-amber-200/30 hover:bg-amber-200/60 text-amber-900 text-xs font-bold transition-all">
                <span>✨ + Alfombra</span>
              </div>
            )}
          </div>

          {/* ==================== ANIMATED GIRL AVATAR (Interactive & Mobile) ==================== */}
          <div
            onClick={handleTapAvatar}
            title="¡Toca a la niña para saludar y verla celebrar!"
            style={{
              left: `${avatarPositionX}%`,
              transition: 'left 0.55s cubic-bezier(0.34, 1.4, 0.64, 1), transform 0.25s ease',
            }}
            className={`absolute bottom-5 -translate-x-1/2 z-30 cursor-pointer flex flex-col items-center select-none ${
              avatarAction === 'cheering'
                ? 'scale-115 -translate-y-4'
                : avatarAction === 'dancing'
                ? 'anim-dance'
                : 'hover:scale-105'
            }`}
          >
            {/* Dynamic Speech Bubble */}
            {activeSpeechBubble && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 sm:w-52 bg-white text-[#351000] text-[11px] font-black p-2.5 rounded-2xl shadow-xl border-2 border-pink-300 text-center animate-bounce z-40">
                {activeSpeechBubble}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-pink-300 rotate-45"></div>
              </div>
            )}

            {/* Wake Up Prompt if Sleeping */}
            {avatarAction === 'sleeping' && (
              <button
                type="button"
                onClick={handleBedInteraction}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-300 hover:bg-amber-400 text-[#351000] text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-white animate-pulse z-40 whitespace-nowrap cursor-pointer"
              >
                ☀️ ¡Despertar!
              </button>
            )}

            {/* SVG Sweet Little Girl Character */}
            <div
              style={{
                transform: avatarFacing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                transition: 'transform 0.25s ease',
              }}
              className="relative w-28 h-36 sm:w-32 sm:h-40 anim-breathe"
            >
              <svg viewBox="0 0 120 155" className="w-full h-full filter drop-shadow-xl overflow-visible">
                {/* Body Shadow */}
                <ellipse cx="60" cy="148" rx="28" ry="6" fill="rgba(0,0,0,0.22)" />

                {/* ==================== BACK HAIR (GIRL HAIRSTYLES) ==================== */}
                {avatarConfig.hairStyle === 'coletas' && (
                  <g fill={avatarConfig.hairColor}>
                    {/* Left Bouncy Pigtail Puff */}
                    <ellipse cx="20" cy="48" rx="14" ry="18" transform="rotate(-15, 20, 48)" />
                    {/* Right Bouncy Pigtail Puff */}
                    <ellipse cx="100" cy="48" rx="14" ry="18" transform="rotate(15, 100, 48)" />
                  </g>
                )}
                {avatarConfig.hairStyle === 'trencitas' && (
                  <g fill={avatarConfig.hairColor}>
                    {/* Left Braided Pigtail */}
                    <path
                      d="M 24 50 Q 18 80 22 105"
                      stroke={avatarConfig.hairColor}
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="22" cy="105" r="4" fill="#f43f5e" />
                    {/* Right Braided Pigtail */}
                    <path
                      d="M 96 50 Q 102 80 98 105"
                      stroke={avatarConfig.hairColor}
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="98" cy="105" r="4" fill="#f43f5e" />
                  </g>
                )}
                {avatarConfig.hairStyle === 'moñitos' && (
                  <g fill={avatarConfig.hairColor}>
                    {/* Twin Space Buns */}
                    <circle cx="28" cy="24" r="14" />
                    <circle cx="92" cy="24" r="14" />
                    <circle cx="28" cy="24" r="5" fill="#fbcfe8" />
                    <circle cx="92" cy="24" r="5" fill="#fbcfe8" />
                  </g>
                )}
                {avatarConfig.hairStyle === 'largo' && (
                  <path
                    d="M 28 45 Q 16 85 22 125 Q 60 135 98 125 Q 104 85 92 45 Z"
                    fill={avatarConfig.hairColor}
                  />
                )}
                {avatarConfig.hairStyle === 'melena' && (
                  <path
                    d="M 30 45 Q 20 80 28 95 Q 60 100 92 95 Q 100 80 90 45 Z"
                    fill={avatarConfig.hairColor}
                  />
                )}

                {/* Fairy Wings (if outfit-hadas) */}
                {avatarConfig.equippedOutfit === 'outfit-hadas' && (
                  <g opacity="0.85" className="animate-pulse">
                    <path d="M 40 75 C 10 40, -5 65, 20 90 C 10 105, 30 115, 42 98 Z" fill="#c084fc" />
                    <path d="M 80 75 C 110 40, 125 65, 100 90 C 110 105, 90 115, 78 98 Z" fill="#c084fc" />
                  </g>
                )}

                {/* Superhero Cape (if outfit-superhero) */}
                {avatarConfig.equippedOutfit === 'outfit-superhero' && (
                  <path d="M 32 80 L 18 135 L 102 135 L 88 80 Z" fill="#e11d48" />
                )}

                {/* Legs with cute white socks */}
                <rect x="44" y="114" width="12" height="24" rx="5" fill="#ffffff" />
                <rect x="64" y="114" width="12" height="24" rx="5" fill="#ffffff" />
                {/* Lace frill on socks */}
                <ellipse cx="50" cy="118" rx="7" ry="2" fill="#ffd0bb" opacity="0.6" />
                <ellipse cx="70" cy="118" rx="7" ry="2" fill="#ffd0bb" opacity="0.6" />

                {/* Shoes: Pretty Mary Jane or Bunny Slippers */}
                {avatarConfig.equippedOutfit === 'outfit-pijama' ? (
                  /* Bunny Slippers */
                  <g>
                    <ellipse cx="49" cy="138" rx="10" ry="7" fill="#ffffff" />
                    <ellipse cx="71" cy="138" rx="10" ry="7" fill="#ffffff" />
                    <ellipse cx="46" cy="130" rx="2.5" ry="5" fill="#fbcfe8" />
                    <ellipse cx="52" cy="130" rx="2.5" ry="5" fill="#fbcfe8" />
                    <ellipse cx="68" cy="130" rx="2.5" ry="5" fill="#fbcfe8" />
                    <ellipse cx="74" cy="130" rx="2.5" ry="5" fill="#fbcfe8" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-bailarina' ? (
                  /* Ballet slippers */
                  <g fill="#f472b6">
                    <ellipse cx="50" cy="138" rx="8" ry="5" />
                    <ellipse cx="70" cy="138" rx="8" ry="5" />
                    <line x1="45" y1="126" x2="55" y2="134" stroke="#f472b6" strokeWidth="1.5" />
                    <line x1="55" y1="126" x2="45" y2="134" stroke="#f472b6" strokeWidth="1.5" />
                    <line x1="65" y1="126" x2="75" y2="134" stroke="#f472b6" strokeWidth="1.5" />
                    <line x1="75" y1="126" x2="65" y2="134" stroke="#f472b6" strokeWidth="1.5" />
                  </g>
                ) : (
                  /* Classic Mary Jane red/pink shoes with strap and gold buckle */
                  <g fill="#e11d48">
                    <ellipse cx="49" cy="138" rx="8.5" ry="5.5" />
                    <ellipse cx="71" cy="138" rx="8.5" ry="5.5" />
                    <rect x="43" y="133" width="12" height="2" fill="#be123c" />
                    <circle cx="53" cy="134" r="1.5" fill="#fbbf24" />
                    <rect x="65" y="133" width="12" height="2" fill="#be123c" />
                    <circle cx="67" cy="134" r="1.5" fill="#fbbf24" />
                  </g>
                )}

                {/* ==================== GIRL OUTFITS ==================== */}
                {avatarConfig.equippedOutfit === 'outfit-vestido' ? (
                  /* Sweet Pink Princess Dress */
                  <g>
                    <path d="M 40 76 L 44 104 L 76 104 L 80 76 Z" fill="#ec4899" />
                    {/* Peter-pan white lace collar */}
                    <ellipse cx="52" cy="74" rx="7" ry="4" fill="#ffffff" />
                    <ellipse cx="68" cy="74" rx="7" ry="4" fill="#ffffff" />
                    <circle cx="60" cy="75" r="2.5" fill="#f43f5e" />
                    {/* Flared flared skirt */}
                    <path
                      d="M 42 102 C 30 114, 28 126, 32 128 C 50 132, 70 132, 88 128 C 92 126, 90 114, 78 102 Z"
                      fill="#f472b6"
                    />
                    {/* Ruffle hem */}
                    <path
                      d="M 32 127 Q 41 131 50 128 Q 60 132 70 128 Q 79 131 88 127"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <polygon points="60,84 62,88 66,88 63,91 64,95 60,93 56,95 57,91 54,88 58,88" fill="#fef08a" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-jardinera' ? (
                  /* Denim Pinafore with Yellow Striped Tee */
                  <g>
                    <rect x="38" y="74" width="44" height="28" rx="6" fill="#fef08a" />
                    <line x1="38" y1="78" x2="82" y2="78" stroke="#f59e0b" strokeWidth="2" />
                    <line x1="38" y1="84" x2="82" y2="84" stroke="#f59e0b" strokeWidth="2" />
                    <path d="M 44 80 L 44 68 L 52 68 L 52 80 Z" fill="#2563eb" />
                    <path d="M 68 80 L 68 68 L 76 68 L 76 80 Z" fill="#2563eb" />
                    <circle cx="48" cy="82" r="2" fill="#fbbf24" />
                    <circle cx="72" cy="82" r="2" fill="#fbbf24" />
                    <path d="M 42 86 L 36 122 L 84 122 L 78 86 Z" fill="#3b82f6" />
                    {/* Heart pocket */}
                    <path
                      d="M 60 94 C 58 90, 52 90, 52 95 C 52 100, 60 104, 60 106 C 60 104, 68 100, 68 95 C 68 90, 62 90, 60 94 Z"
                      fill="#ef4444"
                    />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-hadas' ? (
                  /* Fairy Dress */
                  <g>
                    <path d="M 42 76 L 46 104 L 74 104 L 78 76 Z" fill="#c084fc" />
                    <path d="M 46 102 L 32 126 L 48 120 L 60 128 L 72 120 L 88 126 L 74 102 Z" fill="#d8b4fe" />
                    <circle cx="60" cy="86" r="3" fill="#67e8f9" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-bailarina' ? (
                  /* Ballerina Tutu */
                  <g>
                    <path d="M 42 76 L 46 100 L 74 100 L 78 76 Z" fill="#f472b6" />
                    <ellipse cx="60" cy="106" rx="28" ry="10" fill="#fbcfe8" opacity="0.9" />
                    <ellipse cx="60" cy="104" rx="24" ry="8" fill="#fce7f3" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-pijama' ? (
                  /* Star Pajamas */
                  <g>
                    <rect x="36" y="74" width="48" height="46" rx="10" fill="#93c5fd" />
                    <circle cx="48" cy="86" r="2" fill="#fef08a" />
                    <circle cx="70" cy="94" r="2.5" fill="#fef08a" />
                    <circle cx="56" cy="106" r="2" fill="#fef08a" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-superhero' ? (
                  /* Superhero Suit */
                  <g>
                    <rect x="38" y="76" width="44" height="40" rx="8" fill="#2563eb" />
                    <polygon points="60,82 66,94 54,94" fill="#facc15" />
                    <rect x="42" y="110" width="36" height="6" fill="#facc15" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-artist' ? (
                  /* Artist Smock */
                  <g>
                    <rect x="38" y="76" width="44" height="40" rx="8" fill="#f8fafc" />
                    <circle cx="48" cy="88" r="3" fill="#ef4444" />
                    <circle cx="70" cy="94" r="3.5" fill="#3b82f6" />
                    <circle cx="56" cy="102" r="3" fill="#22c55e" />
                  </g>
                ) : avatarConfig.equippedOutfit === 'outfit-wizard' ? (
                  /* Magic Robe */
                  <g>
                    <path d="M 38 76 L 30 120 L 90 120 L 82 76 Z" fill="#7c3aed" />
                    <circle cx="60" cy="92" r="3" fill="#facc15" />
                    <circle cx="52" cy="106" r="2" fill="#facc15" />
                    <circle cx="68" cy="106" r="2" fill="#facc15" />
                  </g>
                ) : (
                  /* Casual T-Shirt & Skirt */
                  <g>
                    <rect x="38" y="78" width="44" height="28" rx="6" fill="#38bdf8" />
                    <polygon points="60,84 63,91 69,91 64,95 66,101 60,97 54,101 56,95 51,91 57,91" fill="#facc15" />
                    <path d="M 40 104 L 34 124 L 86 124 L 80 104 Z" fill="#2563eb" />
                  </g>
                )}

                {/* Arms */}
                <ellipse cx="34" cy="94" rx="6" ry="14" fill={avatarConfig.skinTone} />
                <ellipse cx="86" cy="94" rx="6" ry="14" fill={avatarConfig.skinTone} />

                {/* Neck */}
                <rect x="54" y="66" width="12" height="14" rx="4" fill={avatarConfig.skinTone} />

                {/* Round Chibi Head */}
                <circle cx="60" cy="50" r="28" fill={avatarConfig.skinTone} />

                {/* Rosy Cheeks with highlights */}
                <ellipse cx="42" cy="56" rx="5" ry="3.5" fill="#fda4af" opacity="0.85" />
                <ellipse cx="78" cy="56" rx="5" ry="3.5" fill="#fda4af" opacity="0.85" />
                <circle cx="41" cy="55" r="1" fill="#ffffff" opacity="0.8" />
                <circle cx="79" cy="55" r="1" fill="#ffffff" opacity="0.8" />

                {/* EYES WITH SWEET GIRL EYELASHES (PESTAÑITAS) */}
                <g className="anim-blink">
                  {avatarAction === 'sleeping' ? (
                    /* Sleeping Eyes */
                    <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
                      <path d="M 44 51 Q 48 55 52 51" />
                      <path d="M 68 51 Q 72 55 76 51" />
                    </g>
                  ) : avatarConfig.expression === 'guiño' ? (
                    <g>
                      {/* Left Eye Open with Eyelashes */}
                      <circle cx="48" cy="50" r="5.5" fill="#1e293b" />
                      <circle cx="46.5" cy="48" r="2.2" fill="#ffffff" />
                      <circle cx="50" cy="52" r="1.1" fill="#ffffff" />
                      <path d="M 43 46 Q 41 43 39 44" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 46 45 Q 46 41 45 39" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      {/* Right Eye Winking */}
                      <path d="M 68 50 Q 73 45 78 50" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </g>
                  ) : avatarConfig.expression === 'sorpresa' ? (
                    <g>
                      <circle cx="48" cy="49" r="6" fill="#1e293b" />
                      <circle cx="46" cy="47" r="2.2" fill="#ffffff" />
                      <path d="M 43 45 Q 41 42 39 43" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 46 44 Q 46 40 45 38" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <circle cx="72" cy="49" r="6" fill="#1e293b" />
                      <circle cx="70" cy="47" r="2.2" fill="#ffffff" />
                      <path d="M 77 45 Q 79 42 81 43" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 74 44 Q 74 40 75 38" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    </g>
                  ) : (
                    /* Sweet / Dulce Big Sparkly Eyes */
                    <g>
                      {/* Left Eye */}
                      <circle cx="48" cy="50" r="5.5" fill="#1e293b" />
                      <circle cx="46.5" cy="48" r="2.2" fill="#ffffff" />
                      <circle cx="50" cy="52" r="1.1" fill="#ffffff" />
                      <path d="M 43 46 Q 41 43 39 44" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 46 45 Q 46 41 45 39" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 50 45 Q 52 42 54 43" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      {/* Right Eye */}
                      <circle cx="72" cy="50" r="5.5" fill="#1e293b" />
                      <circle cx="70.5" cy="48" r="2.2" fill="#ffffff" />
                      <circle cx="74" cy="52" r="1.1" fill="#ffffff" />
                      <path d="M 77 46 Q 79 43 81 44" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 74 45 Q 74 41 75 39" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                      <path d="M 70 45 Q 68 42 66 43" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
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
                  <g stroke="#ec4899" strokeWidth="2" fill="none">
                    <circle cx="48" cy="50" r="8" />
                    <circle cx="72" cy="50" r="8" />
                    <line x1="56" y1="50" x2="64" y2="50" />
                  </g>
                )}

                {/* ==================== FRONT HAIR ==================== */}
                <g fill={avatarConfig.hairColor}>
                  {avatarConfig.hairStyle === 'coletas' && (
                    <g>
                      {/* Sweet curved bangs */}
                      <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                      {/* Hair shine arc */}
                      <path d="M 44 26 Q 60 23 76 26" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" fill="none" />
                      {/* Ribbon Bows on pigtails */}
                      <g fill="#ec4899">
                        <polygon points="20,40 12,32 14,48" />
                        <polygon points="20,40 28,32 26,48" />
                        <circle cx="20" cy="40" r="3.5" fill="#f43f5e" />
                        <polygon points="100,40 92,32 94,48" />
                        <polygon points="100,40 108,32 106,48" />
                        <circle cx="100" cy="40" r="3.5" fill="#f43f5e" />
                      </g>
                    </g>
                  )}
                  {avatarConfig.hairStyle === 'trencitas' && (
                    <g>
                      <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                      <circle cx="24" cy="44" r="3.5" fill="#38bdf8" />
                      <circle cx="96" cy="44" r="3.5" fill="#38bdf8" />
                    </g>
                  )}
                  {avatarConfig.hairStyle === 'moñitos' && (
                    <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                  )}
                  {avatarConfig.hairStyle === 'melena' && (
                    <g>
                      <path d="M 32 48 Q 32 20 60 20 Q 88 20 88 48 Q 80 32 68 36 Q 52 38 40 32 Z" />
                      <path d="M 32 38 A 28 28 0 0 1 88 38" stroke="#f472b6" strokeWidth="3" fill="none" />
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
                  {avatarConfig.hairStyle === 'largo' && (
                    <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                  )}
                  {avatarConfig.hairStyle === 'corto' && (
                    <path d="M 32 46 Q 32 20 60 20 Q 88 20 88 46 Q 80 34 60 36 Q 40 34 32 46 Z" />
                  )}
                </g>

                {/* ==================== HEAD ACCESSORIES ==================== */}
                {(avatarConfig.equippedHead === 'head-bow' || (!avatarConfig.equippedHead && avatarConfig.hairStyle === 'coletas')) && (
                  <g fill="#ec4899">
                    <polygon points="60,18 46,10 48,26" />
                    <polygon points="60,18 74,10 72,26" />
                    <circle cx="60" cy="18" r="4.5" fill="#f43f5e" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-flower' && (
                  <g transform="translate(76, 26)">
                    <circle cx="0" cy="0" r="4" fill="#fbbf24" />
                    <circle cx="-5" cy="0" r="3" fill="#fbcfe8" />
                    <circle cx="5" cy="0" r="3" fill="#fbcfe8" />
                    <circle cx="0" cy="-5" r="3" fill="#fbcfe8" />
                    <circle cx="0" cy="5" r="3" fill="#fbcfe8" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-crown' && (
                  <g>
                    <polygon points="42,22 46,10 53,18 60,6 67,18 74,10 78,22" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                    <circle cx="60" cy="16" r="2" fill="#ef4444" />
                    <circle cx="48" cy="18" r="1.5" fill="#3b82f6" />
                    <circle cx="72" cy="18" r="1.5" fill="#22c55e" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-cat-ears' && (
                  <g fill="#f472b6" stroke="#db2777" strokeWidth="1.5">
                    <polygon points="38,26 32,8 48,20" />
                    <polygon points="82,26 88,8 72,20" />
                  </g>
                )}
                {avatarConfig.equippedHead === 'head-headphones' && (
                  <g stroke="#f472b6" strokeWidth="4" fill="none">
                    <path d="M 32 50 A 28 28 0 0 1 88 50" />
                    <circle cx="32" cy="50" r="7" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
                    <circle cx="88" cy="50" r="7" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
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
                    <rect x="0" y="0" width="18" height="14" rx="2" fill="#ec4899" />
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
                    <path d="M 10 18 Q 4 4 14 0 Q 24 4 18 18 Q 14 24 14 26 L 14 50" stroke="#f43f5e" strokeWidth="1" fill="none" />
                    <path d="M 14 26 C 2 12 12 -4 20 8 C 28 -4 38 12 26 26 Z" fill="#f43f5e" transform="translate(-6, -10)" />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* ==================== PET SLOT (Beside Avatar) ==================== */}
          <div
            onClick={e => {
              e.stopPropagation();
              if (currentPet && currentPet.id !== 'pet-none') {
                handleTapPet(currentPet);
              } else {
                handleSlotClick('pet');
              }
            }}
            title={
              currentPet && currentPet.id !== 'pet-none'
                ? '¡Toca tu mascota para jugar con ella!'
                : 'Toca para elegir una mascota'
            }
            className={`absolute bottom-6 left-[62%] sm:left-[60%] z-25 cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
              bouncingSlot === 'pet' ? 'scale-125 -translate-y-2' : ''
            }`}
          >
            {currentPet && currentPet.id !== 'pet-none' ? (
              <div className="relative flex flex-col items-center anim-pet">
                <span className="text-3xl sm:text-4xl filter drop-shadow">{currentPet.emoji}</span>
                <span className="text-[9px] font-black bg-white/90 px-1.5 py-0.5 rounded-full text-[#351000] border border-amber-300 shadow-sm mt-0.5">
                  {currentPet.name.split(' ')[0]}
                </span>

                {/* Edit wand icon */}
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSlotClick('pet');
                  }}
                  title="Cambiar mascota"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-200 hover:bg-amber-300 border border-white text-[10px] flex items-center justify-center shadow-sm"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-1.5 rounded-xl border-2 border-dashed border-amber-500/50 bg-white/40 hover:bg-white/70 text-amber-900 text-[10px] font-bold">
                <span>🐾</span>
                <span>+ Mascota</span>
              </div>
            )}
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
          className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 via-amber-400 to-pink-500 hover:from-pink-400 hover:to-amber-500 text-white rounded-2xl font-black text-sm shadow-[0_5px_0_0_#be185d] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-pink-300"
          type="button"
        >
          <span className="text-xl">👗🎨</span>
          <span>Armario Mágico & Decorar Habitación</span>
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              playPop(350);
              setIsDrawerOpen(false);
            }
          }}
          className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none"
        >
          <div
            style={{ animation: 'modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            className="w-full max-w-lg max-h-[88vh] bg-[#fff8f6] rounded-3xl border-4 border-[#ffddb8] shadow-2xl flex flex-col overflow-hidden relative"
          >
            {/* Drawer Header */}
            <div className="p-3.5 bg-gradient-to-r from-pink-100 via-amber-100 to-pink-100 border-b border-[#ffd0bb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-base font-black text-[#351000] leading-tight">
                    Tienda & Armario de Recompensas
                  </h3>
                  <p className="text-[11px] text-[#855300] font-bold">
                    ¡Completa lecciones para ganar ropa y muebles para tu niña!
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  playPop(350);
                  setIsDrawerOpen(false);
                }}
                className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 text-[#351000] border-2 border-pink-300 flex items-center justify-center font-black text-base shadow-sm active:scale-90 cursor-pointer"
                type="button"
                aria-label="Cerrar armario"
              >
                ✕
              </button>
            </div>

            {/* Main Category Tabs: "Mi Niña" vs "Mi Habitación" */}
            <div className="flex p-2 bg-[#ffeae1] border-b border-[#ffd0bb] gap-2">
              <button
                onClick={() => {
                  playPop(440);
                  setMainDrawerTab('avatar');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainDrawerTab === 'avatar'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md scale-[1.02]'
                    : 'bg-white/80 text-[#855300] hover:bg-white'
                }`}
                type="button"
              >
                <span>👗</span>
                <span>Mi Niña ({AVATAR_ROOM_CATALOG.filter(i => i.category === 'outfit' || i.category === 'head' || i.category === 'hand').length + HAIR_STYLE_OPTIONS.length})</span>
              </button>

              <button
                onClick={() => {
                  playPop(440);
                  setMainDrawerTab('habitacion');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mainDrawerTab === 'habitacion'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md scale-[1.02]'
                    : 'bg-white/80 text-[#855300] hover:bg-white'
                }`}
                type="button"
              >
                <span>🏠</span>
                <span>Mi Habitación ({AVATAR_ROOM_CATALOG.filter(i => i.category === 'bed' || i.category === 'desk' || i.category === 'rug' || i.category === 'wallpaper' || i.category === 'floor' || i.category === 'decor' || i.category === 'pet').length})</span>
              </button>
            </div>

            {/* Sub-Category Chips */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white/60 overflow-x-auto border-b border-[#ffd0bb]/60 no-scrollbar">
              {mainDrawerTab === 'habitacion' ? (
                <>
                  <button
                    onClick={() => setRoomSubTab('bed')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'bed'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🛏️ Camas
                  </button>
                  <button
                    onClick={() => setRoomSubTab('desk')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'desk'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🎨 Mesas
                  </button>
                  <button
                    onClick={() => setRoomSubTab('rug')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'rug'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    ✨ Alfombras
                  </button>
                  <button
                    onClick={() => setRoomSubTab('wallpaper')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'wallpaper'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🖼️ Paredes
                  </button>
                  <button
                    onClick={() => setRoomSubTab('floor')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'floor'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🪵 Suelos
                  </button>
                  <button
                    onClick={() => setRoomSubTab('decor')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'decor'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🧸 Cuadros
                  </button>
                  <button
                    onClick={() => setRoomSubTab('pet')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      roomSubTab === 'pet'
                        ? 'bg-amber-400 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🐾 Mascotas
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAvatarSubTab('outfit')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'outfit'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    👗 Vestidos y Ropita
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('hairStyle')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'hairStyle'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    👧 Peinados
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('hairColor')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'hairColor'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🎨 Color de Pelo
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('expression')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'expression'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🥰 Caritas
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('head')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'head'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🎀 Lazos y Coronas
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('hand')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'hand'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    🪄 Accesorios en Mano
                  </button>
                  <button
                    onClick={() => setAvatarSubTab('skinTone')}
                    className={`px-3 py-1 rounded-full text-xs font-black whitespace-nowrap cursor-pointer transition-all ${
                      avatarSubTab === 'skinTone'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-white text-[#855300] border border-[#ffd0bb]'
                    }`}
                    type="button"
                  >
                    ✨ Piel
                  </button>
                </>
              )}
            </div>

            {/* Drawer Body: Grid of Items or Palette Selectors */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Special Palette Sub-Tabs: Hair Style Selector */}
              {mainDrawerTab === 'avatar' && avatarSubTab === 'hairStyle' && (
                <div className="grid grid-cols-2 gap-2.5">
                  {HAIR_STYLE_OPTIONS.map(style => {
                    const isSelected = avatarConfig.hairStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => {
                          playPop(480);
                          const updated = updateAvatarConfig({ hairStyle: style.id });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Me encanta este peinado: ${style.name}!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-2.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pink-100 border-pink-400 shadow-md scale-102 ring-2 ring-pink-300'
                            : 'bg-white border-[#ffd0bb] hover:bg-orange-50'
                        }`}
                      >
                        <span className="text-3xl">{style.emoji}</span>
                        <div>
                          <h4 className="text-xs font-black text-[#351000]">{style.name}</h4>
                          <p className="text-[10px] text-[#855300]">{style.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Palette Sub-Tabs: Hair Color Selector */}
              {mainDrawerTab === 'avatar' && avatarSubTab === 'hairColor' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {HAIR_COLOR_OPTIONS.map(c => {
                    const isSelected = avatarConfig.hairColor === c.color;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          playPop(480);
                          const updated = updateAvatarConfig({ hairColor: c.color });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Pelo ${c.name.toLowerCase()}! ¡Qué lindo!`);
                        }}
                        className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pink-100 border-pink-400 shadow-md scale-102 ring-2 ring-pink-300'
                            : 'bg-white border-[#ffd0bb] hover:bg-orange-50'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-inner border border-white shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-xs font-black text-[#351000] truncate">{c.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Palette Sub-Tabs: Skin Tone Selector */}
              {mainDrawerTab === 'avatar' && avatarSubTab === 'skinTone' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SKIN_TONE_OPTIONS.map(s => {
                    const isSelected = avatarConfig.skinTone === s.color;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          playPop(480);
                          const updated = updateAvatarConfig({ skinTone: s.color });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                        }}
                        className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pink-100 border-pink-400 shadow-md scale-102 ring-2 ring-pink-300'
                            : 'bg-white border-[#ffd0bb] hover:bg-orange-50'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-inner border border-white shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-xs font-black text-[#351000] truncate">{s.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Palette Sub-Tabs: Expression Selector */}
              {mainDrawerTab === 'avatar' && avatarSubTab === 'expression' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {EXPRESSION_OPTIONS.map(expr => {
                    const isSelected = avatarConfig.expression === expr.id;
                    return (
                      <div
                        key={expr.id}
                        onClick={() => {
                          playPop(480);
                          const updated = updateAvatarConfig({ expression: expr.id });
                          onUpdateProgress({ ...progress, avatarConfig: updated });
                          sayAvatar(`¡Mira mi carita: ${expr.name}!`);
                        }}
                        className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-pink-100 border-pink-400 shadow-md scale-102 ring-2 ring-pink-300'
                            : 'bg-white border-[#ffd0bb] hover:bg-orange-50'
                        }`}
                      >
                        <span className="text-3xl">{expr.emoji}</span>
                        <div>
                          <h4 className="text-xs font-black text-[#351000]">{expr.name}</h4>
                          <p className="text-[10px] text-[#855300]">{expr.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Regular Catalog Grid (Items from AVATAR_ROOM_CATALOG) */}
              {displayedCatalogItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayedCatalogItems.map(item => {
                    const status = checkItemUnlockStatus(
                      item,
                      progress.unlockedRoomItems || [],
                      progress.completedWorlds,
                      progress.masteredLetters.length,
                      progress.learnedWords.length,
                      progress.readStoriesCount || 0
                    );
                    const isUnlocked = unlockedSet.has(item.id) || status.isUnlocked;

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

                    const canAfford = progress.starsCount >= item.starCost;

                    return (
                      <div
                        key={item.id}
                        className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                          isEquipped
                            ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-300'
                            : isUnlocked
                            ? 'bg-white border-[#ffd0bb] hover:border-amber-400 shadow-xs'
                            : 'bg-[#fff5f0] border-gray-200 opacity-90'
                        }`}
                      >
                        {/* Item Card Content */}
                        <div className="flex items-start gap-2.5">
                          {/* Emoji / Preview Avatar */}
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner border border-white"
                            style={{ backgroundColor: item.previewColor || '#fef08a' }}
                          >
                            {item.emoji}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-black text-[#351000] leading-tight">
                                {item.name}
                              </h4>
                              {isEquipped && (
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                  PUESTO
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#855300] mt-0.5 leading-snug line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Status / Unlock Requirements / Actions */}
                        <div className="mt-2.5 pt-2 border-t border-[#ffd0bb]/40 flex items-center justify-between gap-2">
                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => handleEquipItem(item)}
                              className={`w-full py-1.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                isEquipped
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-xs active:scale-95'
                              }`}
                            >
                              <span>{isEquipped ? '✓ Equipado' : '👉 Poner en Cuarto'}</span>
                            </button>
                          ) : (
                            <div className="w-full flex flex-col gap-1.5">
                              {/* Task Unlock Badge */}
                              <button
                                type="button"
                                onClick={() => handleExplainUnlockTask(item)}
                                className="w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg p-1.5 text-[10px] font-bold text-amber-900 flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="text-xs">🎯</span>
                                <span className="flex-1 truncate">{item.taskDescription}</span>
                                <span className="text-[9px] text-amber-600 font-extrabold">ℹ️ Ver</span>
                              </button>

                              {/* Star Redemption Alternative */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleBuyWithStars(item)}
                                  className={`flex-1 py-1 px-2 rounded-lg font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                    canAfford
                                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-xs active:scale-95'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                  }`}
                                >
                                  <span>⭐ Canjear ({item.starCost})</span>
                                </button>

                                {item.requiredWorldId && onGoToMundos && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsDrawerOpen(false);
                                      onGoToMundos();
                                    }}
                                    title="Ir al mapa de mundos a completar la tarea"
                                    className="py-1 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-black text-[10px] shadow-xs cursor-pointer"
                                  >
                                    🚀 Jugar
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Drawer Footer Tip */}
            <div className="p-3 bg-amber-50/90 border-t border-[#ffd0bb] flex items-center justify-between text-xs text-[#855300] font-bold">
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
                <span>💡</span>
                <span className="truncate max-w-[200px] sm:max-w-none">Completa lecciones en los mundos para ganar premios</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  playPop(350);
                  setIsDrawerOpen(false);
                }}
                className="bg-white hover:bg-rose-50 border-2 border-pink-300 px-4 py-1.5 rounded-xl text-xs font-black text-[#351000] active:scale-95 shadow-xs cursor-pointer flex items-center gap-1"
              >
                <span>✕</span>
                <span>Cerrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

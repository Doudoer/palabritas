import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ASSETS,
  CHISPITA_COSTUMES,
  SPECIAL_MYSTERY_STICKERS,
  StickerItem,
  ChispitaCostume,
} from '../data/appData';
import { WORLDS_DATA } from '../data/worldsData';
import {
  playPop,
  playSparkleChime,
  playFanfare,
  playScratchSound,
  playWiggleError,
  speakSpanish,
  triggerHaptic,
  isSoundEffectsEnabled,
  setSoundEffects,
  isHapticsEnabled,
  setHaptics,
} from '../utils/audio';
import {
  loadPlayerProgress,
  claimPlayerSticker,
  buyPlayerCostume,
  equipPlayerCostume,
  calculatePlayerLevel,
  setPlayerName,
  PlayerProgress,
} from '../utils/playerProgress';

interface PremiosScreenProps {
  starsCount: number;
  onAddStars: (amount: number) => void;
  onOpenCelebrationModal: () => void;
}

export const PremiosScreen: React.FC<PremiosScreenProps> = ({
  starsCount,
  onAddStars,
  onOpenCelebrationModal,
}) => {
  // Navigation tabs within Premios: Album, Rasca & Cofre, Medallas & Tienda
  const [activeTab, setActiveTab] = useState<'album' | 'rasca' | 'tienda'>('album');

  // Player progress local state
  const [progress, setProgress] = useState<PlayerProgress>(() => loadPlayerProgress());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio and Haptics toggles
  const [soundOn, setSoundOn] = useState(isSoundEffectsEnabled());
  const [hapticOn, setHapticOn] = useState(isHapticsEnabled());

  // Album filters
  const [albumFilter, setAlbumFilter] = useState<'todos' | 'mundos' | 'especiales' | 'desbloqueados'>('todos');

  // Scratch Card state
  const [scratchProgress, setScratchProgress] = useState(0);
  const [scratchClaimed, setScratchClaimed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Chest unboxing state
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [chestReward, setChestReward] = useState<StickerItem | null>(null);

  // Sync progress on load and when external stars change
  useEffect(() => {
    setProgress(loadPlayerProgress());
  }, [starsCount]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const levelInfo = useMemo(() => {
    return calculatePlayerLevel(progress.starsCount, progress.completedWorlds.length);
  }, [progress.starsCount, progress.completedWorlds.length]);

  // Current equipped costume
  const equippedCostume = useMemo(() => {
    if (!progress.equippedCostume) return null;
    return CHISPITA_COSTUMES.find(c => c.id === progress.equippedCostume) || null;
  }, [progress.equippedCostume]);

  // Generate the complete Sticker Album list from WORLDS_DATA + SPECIAL_MYSTERY_STICKERS
  const allStickersList: (StickerItem & { isUnlocked: boolean; worldName?: string })[] = useMemo(() => {
    const worldStickers = WORLDS_DATA.map(world => {
      const isUnlocked =
        progress.unlockedStickers.includes(`stk-world-${world.id}`) ||
        progress.unlockedStickers.includes(`stk-${world.id}`) ||
        progress.completedWorlds.includes(world.id);

      return {
        id: `stk-world-${world.id}`,
        name: world.targetWord,
        emoji: world.targetEmoji,
        phoneme: `/${world.focusLetter}/ (${world.targetWord})`,
        tag: world.numberLabel,
        colorBg: world.colorTheme.badgeBg || '#ffddb8',
        colorBorder: world.colorTheme.border || '#ffb95f',
        stuck: isUnlocked,
        isUnlocked,
        category: 'mundo' as const,
        rarity: (world.id <= 5 ? 'Común' : world.id <= 15 ? 'Mágico' : 'Épico') as 'Común' | 'Mágico' | 'Épico',
        description: `Sticker del ${world.numberLabel}: ${world.title}`,
        worldId: world.id,
        worldName: world.title,
      };
    });

    const specialStickers = SPECIAL_MYSTERY_STICKERS.map(spec => {
      const isUnlocked = progress.unlockedStickers.includes(spec.id);
      return {
        ...spec,
        isUnlocked,
        worldName: 'Cofre Sorpresa',
      };
    });

    return [...worldStickers, ...specialStickers];
  }, [progress.unlockedStickers, progress.completedWorlds]);

  // Filtered stickers for the album view
  const filteredStickers = useMemo(() => {
    switch (albumFilter) {
      case 'mundos':
        return allStickersList.filter(s => s.category === 'mundo');
      case 'especiales':
        return allStickersList.filter(s => s.category !== 'mundo');
      case 'desbloqueados':
        return allStickersList.filter(s => s.isUnlocked);
      default:
        return allStickersList;
    }
  }, [allStickersList, albumFilter]);

  const unlockedCount = useMemo(() => {
    return allStickersList.filter(s => s.isUnlocked).length;
  }, [allStickersList]);

  // Current Mystery Sticker for Scratch Card
  const currentMystery = useMemo(() => {
    return SPECIAL_MYSTERY_STICKERS[mysteryIndex % SPECIAL_MYSTERY_STICKERS.length];
  }, [mysteryIndex]);

  // Scratch card canvas draw setup
  useEffect(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';

    // Base holographic foil gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e2e8f0');
    grad.addColorStop(0.2, '#fde68a');
    grad.addColorStop(0.4, '#cbd5e1');
    grad.addColorStop(0.6, '#fef08a');
    grad.addColorStop(0.8, '#bae6fd');
    grad.addColorStop(1, '#fed7aa');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Holographic stars & sparkles pattern
    for (let i = 0; i < 90; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255,255,255,0.9)' : 'rgba(245,158,11,0.55)';
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centered foil title and invitation
    ctx.fillStyle = '#613b00';
    ctx.font = 'bold 20px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ RASCA AQUÍ CON TU DEDO ★', w / 2, h / 2 - 15);

    ctx.fillStyle = '#855300';
    ctx.font = 'bold 13px Quicksand, sans-serif';
    ctx.fillText('✨ Descubre un Sticker Legendario y +50 ⭐ ✨', w / 2, h / 2 + 15);

    setScratchProgress(0);
    setScratchClaimed(false);
  }, [mysteryIndex]);

  // Scratch movement interaction
  const handleScratchMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (scratchClaimed || !isScratching) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Erase the foil
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();
    triggerHaptic(12);

    // Increase scratch percentage smoothly
    if (scratchProgress < 100) {
      setScratchProgress(prev => Math.min(100, prev + 3));
    }
  };

  const handleClaimScratch = () => {
    if (scratchClaimed) return;
    playFanfare();
    playSparkleChime();
    triggerHaptic([40, 50, 80]);

    onAddStars(50);
    claimPlayerSticker(currentMystery.id);

    // Update local state
    setProgress(loadPlayerProgress());
    setScratchClaimed(true);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#ec4899', '#a855f7'],
    });

    speakSpanish(`¡Increíble! ¡Descubriste el sticker ${currentMystery.name}! ¡Has ganado cincuenta estrellas doradas!`);
    showToast(`¡${currentMystery.name} pegado en tu álbum! ⭐ +50 Estrellas`);
  };

  const handleResetScratch = () => {
    playPop(420);
    triggerHaptic(20);
    setMysteryIndex(prev => prev + 1);
    showToast('🔄 ¡Nueva tarjeta mágica preparada! ¡A raspar!');
  };

  // Open Mystery Star Chest
  const handleOpenMysteryChest = () => {
    const CHEST_COST = 30;
    if (progress.starsCount < CHEST_COST) {
      playWiggleError();
      triggerHaptic([30, 40, 50]);
      speakSpanish('¡Te faltan estrellitas! Completa retos en los mundos para abrir este cofre mágico.');
      showToast('⭐ Necesitas 30 estrellitas para abrir este cofre.');
      return;
    }

    setIsOpeningChest(true);
    playPop(420);
    triggerHaptic([30, 50, 80]);

    // Deduct 30 stars, but give back 10 bonus stars + a surprise sticker!
    onAddStars(-CHEST_COST + 10);

    // Pick an uncollected sticker or a random special one
    const uncollected = allStickersList.filter(s => !s.isUnlocked);
    const chosenSticker: StickerItem =
      uncollected.length > 0
        ? uncollected[Math.floor(Math.random() * uncollected.length)]
        : SPECIAL_MYSTERY_STICKERS[Math.floor(Math.random() * SPECIAL_MYSTERY_STICKERS.length)];

    setTimeout(() => {
      playFanfare();
      playSparkleChime();
      triggerHaptic([50, 70, 100]);

      claimPlayerSticker(chosenSticker.id);
      setProgress(loadPlayerProgress());
      setChestReward(chosenSticker);
      setIsOpeningChest(false);

      confetti({
        particleCount: 110,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#f59e0b', '#ffd700', '#6cf8bb', '#38bdf8', '#f43f5e'],
      });

      speakSpanish(`¡Cofre abierto! ¡Has conseguido el sticker ${chosenSticker.name} y diez estrellas doradas de regalo!`);
      showToast(`🎁 ¡${chosenSticker.name} desbloqueado! ⭐ +10 Estrellas`);
    }, 1200);
  };

  // Tap an album sticker for audio, speech, and celebration
  const handleTapSticker = (sticker: StickerItem & { isUnlocked: boolean; worldName?: string }) => {
    if (sticker.isUnlocked) {
      playPop(520);
      playSparkleChime();
      triggerHaptic(25);
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#6cf8bb', '#42bbff'],
      });
      speakSpanish(`¡Sticker ${sticker.name}! ${sticker.phoneme.replace(/[/]/g, '')}`);
      showToast(`🎶 ${sticker.name}: ${sticker.phoneme}`);
    } else {
      playWiggleError();
      triggerHaptic(15);
      const hint = sticker.worldName ? `el ${sticker.worldName}` : 'más misiones';
      speakSpanish(`Este sticker está bloqueado. ¡Supera ${hint} para desbloquearlo!`);
      showToast(`🔒 Bloqueado: Supera ${sticker.worldName || 'este mundo'} para ganarlo`);
    }
  };

  // Buy or Equip Costume for Chispita
  const handleCostumeAction = (costume: ChispitaCostume) => {
    const isUnlocked = progress.unlockedCostumes?.includes(costume.id);
    const isEquipped = progress.equippedCostume === costume.id;

    if (isEquipped) {
      // Unequip
      playPop(380);
      equipPlayerCostume(costume.id);
      setProgress(loadPlayerProgress());
      showToast(`👕 Chispita se quitó: ${costume.name}`);
      speakSpanish(`Me he quitado mi ${costume.name}.`);
      return;
    }

    if (isUnlocked) {
      // Equip
      playSparkleChime();
      equipPlayerCostume(costume.id);
      setProgress(loadPlayerProgress());
      showToast(`✨ ¡Chispita luce: ${costume.name}!`);
      speakSpanish(`¡Me encanta mi ${costume.name}! ¡Mira qué bien me queda!`);
      return;
    }

    // Buy
    if (progress.starsCount < costume.cost) {
      playWiggleError();
      triggerHaptic([20, 30]);
      speakSpanish(`Necesitas ${costume.cost} estrellitas para comprar este accesorio.`);
      showToast(`⭐ Necesitas ${costume.cost} estrellas.`);
      return;
    }

    playFanfare();
    playSparkleChime();
    triggerHaptic([40, 60, 90]);

    const result = buyPlayerCostume(costume.id, costume.cost);
    if (result.success) {
      setProgress(loadPlayerProgress());
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#6cf8bb', '#a855f7'],
      });
      speakSpanish(`¡Genial! ¡Has desbloqueado el accesorio ${costume.name}! ¡Chispita está radiante!`);
      showToast(`👑 ¡${costume.name} desbloqueado y equipado!`);
    }
  };

  // Decorate Album with golden glitter
  const handleDecorateGlitter = () => {
    playFanfare();
    playSparkleChime();
    triggerHaptic([25, 40, 30, 50]);
    confetti({
      particleCount: 75,
      spread: 85,
      origin: { y: 0.75 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#6cf8bb'],
    });
    speakSpanish('¡Tu álbum brilla con polvo de estrellas mágicas!');
    showToast('✨ ¡Polvo mágico de estrellas activado en tu álbum!');
  };

  // Dynamic Trophies List calculated from live progress
  const dynamicTrophies = useMemo(() => {
    return [
      {
        id: 'first-steps',
        title: 'Primeros Pasos de Gigante',
        badge: '🌟 Mundo 1',
        subtitle: 'Completaste tu primer mundo alfabético.',
        description: '¡El comienzo del viaje lector más emocionante!',
        reward: '+20 Estrellas Doradas',
        isUnlocked: progress.completedWorlds.length >= 1,
        currentCount: progress.completedWorlds.length,
        targetCount: 1,
        unit: 'Mundo',
      },
      {
        id: 'calligraphy-star',
        title: 'Trazador de Caligrafía Estrella',
        badge: '✍️ Caligrafía',
        subtitle: 'Dominaste 5 letras en pauta Montessori.',
        description: 'Tus trazos en mayúscula y minúscula son impecables.',
        reward: '+30 Estrellas Doradas',
        isUnlocked: progress.masteredLetters.length >= 5,
        currentCount: progress.masteredLetters.length,
        targetCount: 5,
        unit: 'Letras',
      },
      {
        id: 'young-reader',
        title: 'Pequeño Gran Lector',
        badge: '📖 Lector',
        subtitle: 'Superaste 3 mundos alfabéticos.',
        description: 'Lees sílabas y oraciones completas con confianza.',
        reward: 'Medalla de Plata Reluciente',
        isUnlocked: progress.completedWorlds.length >= 3,
        currentCount: progress.completedWorlds.length,
        targetCount: 3,
        unit: 'Mundos',
      },
      {
        id: 'word-builder',
        title: 'Arquitecto de Palabras',
        badge: '🔤 Palabras',
        subtitle: 'Escribiste 3 palabras completas a mano.',
        description: '¡Tus deditos escriben palabras mágicas!',
        reward: '+35 Estrellas Doradas',
        isUnlocked: progress.learnedWords.length >= 3,
        currentCount: progress.learnedWords.length,
        targetCount: 3,
        unit: 'Palabras',
      },
      {
        id: 'magic-streak',
        title: 'Fuego del Saber',
        badge: '🔥 Racha',
        subtitle: 'Practicaste 3 días consecutivos con alegría.',
        description: '¡La constancia es el superpoder de los sabios!',
        reward: 'Trofeo de Fuego Mágico',
        isUnlocked: progress.streakDays >= 3,
        currentCount: progress.streakDays,
        targetCount: 3,
        unit: 'Días',
      },
      {
        id: 'star-collector',
        title: 'Cofre del Tesoro Estelar',
        badge: '👑 150 ⭐',
        subtitle: 'Acumulaste más de 150 estrellas doradas.',
        description: '¡El reino celebra tu brillante tesoro de estrellas!',
        reward: 'Corona de Oro Legendaria',
        isUnlocked: progress.starsCount >= 150,
        currentCount: progress.starsCount,
        targetCount: 150,
        unit: 'Estrellas',
      },
      {
        id: 'galaxy-explorer',
        title: 'Viajero de los 8 Mundos',
        badge: '🚀 8 Mundos',
        subtitle: 'Exploraste 8 familias alfabéticas completas.',
        description: '¡Casi dominas todo el mapa alfabético!',
        reward: 'Cáliz de Diamante Galáctico',
        isUnlocked: progress.completedWorlds.length >= 8,
        currentCount: progress.completedWorlds.length,
        targetCount: 8,
        unit: 'Mundos',
      },
      {
        id: 'sticker-master',
        title: 'Álbum Legendario Brillante',
        badge: '🃏 Colección',
        subtitle: 'Coleccionaste al menos 8 stickers en tu álbum.',
        description: '¡Tu álbum brilla con tesoros de todas partes!',
        reward: 'Medalla del Gran Coleccionista',
        isUnlocked: unlockedCount >= 8,
        currentCount: unlockedCount,
        targetCount: 8,
        unit: 'Stickers',
      },
    ];
  }, [progress, unlockedCount]);

  const unlockedTrophiesCount = useMemo(() => {
    return dynamicTrophies.filter(t => t.isUnlocked).length;
  }, [dynamicTrophies]);

  return (
    <div className="flex flex-col w-full gap-4 pb-8 select-none">
      {/* Dynamic Header: Child's Magic Collection & Live Level */}
      <header className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                alt="Chispita Avatar"
                className="w-12 h-12 rounded-full object-cover bg-[#6cf8bb] shadow-[0_3px_0_0_#4edea3] border-2 border-white"
                src={ASSETS.chispitaAvatar}
              />
              {equippedCostume && (
                <span className="absolute -top-1.5 -right-1 text-lg filter drop-shadow animate-bounce">
                  {equippedCostume.emoji}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl text-[#351000] font-black tracking-tight leading-tight flex items-center gap-1.5">
                <span>Mi Álbum y Premios</span>
                <span className="text-xl">✨</span>
              </h1>
              <p className="text-xs text-[#534434] font-bold">
                ¡Colección de {progress.playerName || 'Pequeño Campeón'}!
              </p>
            </div>
          </div>

          {/* Level Badge */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#f59e0b] to-amber-400 text-white px-3 py-1 rounded-full shadow-[0_2px_0_0_#d97706] border border-amber-300">
              <span className="material-symbols-outlined text-[16px]">military_tech</span>
              <span className="text-xs font-black">Nivel {levelInfo.level}</span>
            </div>
            <span className="text-[10px] text-[#855300] font-bold mt-0.5">
              {levelInfo.title}
            </span>
          </div>
        </div>

        {/* Dynamic Progress Card */}
        <div className="bg-white p-3.5 rounded-2xl shadow-[0_6px_0_0_#ffdbcc] flex flex-col gap-2 border border-[#ffd0bb]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#351000] font-bold flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#006c49] animate-pulse"></span>
              <strong>{unlockedCount}</strong> de <strong>{allStickersList.length}</strong> Stickers Coleccionados
            </span>
            <span className="text-xs text-[#855300] font-bold bg-[#ffe2d6] px-2.5 py-0.5 rounded-full border border-[#ffd0bb] flex items-center gap-1">
              <span>⭐</span>
              <span>{progress.starsCount} Estrellitas</span>
            </span>
          </div>

          {/* Rainbow Progress Bar */}
          <div className="w-full h-3.5 bg-[#ffeae1] rounded-full overflow-hidden p-0.5 flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#f59e0b] via-[#6cf8bb] to-[#42bbff] rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${Math.min(100, Math.round((unlockedCount / allStickersList.length) * 100))}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* 3 Chunky Kid-Friendly Sub-Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#ffe2d6] rounded-2xl border border-[#ffd0bb]">
        <button
          onClick={() => {
            playPop(420);
            triggerHaptic(15);
            setActiveTab('album');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'album'
              ? 'bg-white text-[#855300] shadow-[0_3px_0_0_#ffdbcc] scale-102'
              : 'text-[#534434] hover:text-[#351000]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Álbum ({unlockedCount})</span>
        </button>

        <button
          onClick={() => {
            playPop(420);
            triggerHaptic(15);
            setActiveTab('rasca');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'rasca'
              ? 'bg-white text-[#006c49] shadow-[0_3px_0_0_#ffdbcc] scale-102'
              : 'text-[#534434] hover:text-[#351000]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">featured_seasonal_and_gifts</span>
          <span>Rasca y Cofre</span>
        </button>

        <button
          onClick={() => {
            playPop(420);
            triggerHaptic(15);
            setActiveTab('tienda');
          }}
          className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
            activeTab === 'tienda'
              ? 'bg-white text-[#7c2d12] shadow-[0_3px_0_0_#ffdbcc] scale-102'
              : 'text-[#534434] hover:text-[#351000]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">checkroom</span>
          <span>Disfraces ({CHISPITA_COSTUMES.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: MI ÁLBUM MÁGICO                              */}
      {/* ======================================================== */}
      {activeTab === 'album' && (
        <div className="flex flex-col gap-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: 'todos', label: '🌟 Todos', count: allStickersList.length },
                { id: 'mundos', label: '🗺️ Mundos', count: 29 },
                { id: 'especiales', label: '✨ Especiales', count: SPECIAL_MYSTERY_STICKERS.length },
                { id: 'desbloqueados', label: '✅ Pegados', count: unlockedCount },
              ] as const
            ).map(chip => (
              <button
                key={chip.id}
                onClick={() => {
                  playPop(400);
                  triggerHaptic(10);
                  setAlbumFilter(chip.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  albumFilter === chip.id
                    ? 'bg-[#f59e0b] text-[#351000] border-[#d97706] shadow-[0_2px_0_0_#d97706] scale-105'
                    : 'bg-white text-[#534434] border-[#ffd0bb] hover:bg-orange-50'
                }`}
                type="button"
              >
                {chip.label} ({chip.count})
              </button>
            ))}
          </div>

          {/* Quick Action Bar: Decorate with Glitter + Celebration Chest */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecorateGlitter}
              className="flex-1 h-11 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-amber-400 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-[0_3px_0_0_#d97706] active:translate-y-0.5 transition-transform cursor-pointer border border-amber-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>¡Decorar con Brillo Dorado!</span>
            </button>

            <button
              onClick={() => {
                playPop(440);
                triggerHaptic(15);
                onOpenCelebrationModal();
              }}
              className="px-3.5 h-11 rounded-2xl bg-white text-[#855300] text-xs font-bold flex items-center justify-center gap-1 shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              <span>Ver Gran Cofre</span>
            </button>
          </div>

          {/* Stickers Grid */}
          <div className="bg-[#fff1eb] p-3.5 rounded-3xl shadow-[0_6px_0_0_#ffdbcc] flex flex-col gap-2 border border-[#ffd0bb]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#351000]">
                Toca cualquier sticker para escuchar su fonema y palabra:
              </span>
              <span className="text-[11px] font-bold text-[#855300] bg-white px-2 py-0.5 rounded-full border border-[#ffd0bb]">
                {filteredStickers.length} en pantalla
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {filteredStickers.map(stk => (
                <div
                  key={stk.id}
                  onClick={() => handleTapSticker(stk)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 relative overflow-hidden transition-all cursor-pointer border ${
                    stk.isUnlocked
                      ? 'bg-white shadow-[0_5px_0_0_#ffdbcc] border-[#ffd0bb] active:scale-95 hover:shadow-md'
                      : 'bg-[#ffeae1]/60 opacity-60 border-dashed border-[#d8c3ad] hover:opacity-80'
                  }`}
                >
                  {/* Badge */}
                  {stk.isUnlocked ? (
                    <span className="absolute top-1.5 right-1.5 bg-[#006c49] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
                      {stk.category === 'mundo' ? stk.tag : '⭐ ÉPICO'}
                    </span>
                  ) : (
                    <span className="absolute top-1.5 right-1.5 bg-[#ba1a1a] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[10px]">lock</span>
                      <span>BLOQUEADO</span>
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    style={{ backgroundColor: stk.isUnlocked ? stk.colorBg : '#e2e8f0' }}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner transition-transform ${
                      stk.isUnlocked ? 'hover:scale-110 drop-shadow-sm' : 'grayscale opacity-50'
                    }`}
                  >
                    {stk.isUnlocked ? stk.emoji : '❓'}
                  </div>

                  {/* Name */}
                  <span className="text-sm text-[#351000] font-black text-center line-clamp-1 mt-0.5">
                    {stk.isUnlocked ? stk.name : (stk.worldName || '¿Quién será?')}
                  </span>

                  {/* Phonetic Sound */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center ${
                      stk.isUnlocked
                        ? 'bg-[#ffddb8]/60 text-[#855300]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {stk.isUnlocked ? stk.phoneme : 'Completa el mundo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: RASCA Y COFRE MÁGICO                          */}
      {/* ======================================================== */}
      {activeTab === 'rasca' && (
        <div className="flex flex-col gap-4">
          {/* 1. Minijuego: Rasca y Descubre */}
          <section className="bg-white rounded-3xl p-4 shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffd0bb] flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f59e0b] to-amber-300 text-[#613b00] flex items-center justify-center shadow-md animate-bounce">
                  <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-base text-[#351000] font-black leading-tight flex items-center gap-1.5">
                    <span>¡Rasca y Descubre!</span>
                    <span className="text-[10px] bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full font-bold">
                      Sorpresa ✨
                    </span>
                  </h2>
                  <p className="text-xs text-[#534434] font-semibold">
                    Usa tu dedo o ratón para raspar la lámina mágica
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[#6cf8bb]/80 border border-[#00714d]/30 px-3 py-1 rounded-full text-xs font-black text-[#00714d] shadow-sm">
                <span>¡{scratchProgress}% Rascado!</span>
              </div>
            </div>

            {/* Interactive Scratch Canvas Area */}
            <div
              onMouseDown={() => setIsScratching(true)}
              onMouseUp={() => setIsScratching(false)}
              onTouchStart={() => setIsScratching(true)}
              onTouchEnd={() => setIsScratching(false)}
              className="relative w-full h-64 rounded-2xl overflow-hidden shadow-inner border-2 border-[#f59e0b]/60 bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 flex items-center justify-center select-none touch-none"
            >
              {/* Sticker Revealed Underneath */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10 select-none">
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-200 via-emerald-100 to-sky-200 p-1.5 shadow-[0_12px_24px_rgba(245,158,11,0.35)] ring-4 ring-white animate-float-gentle flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-white/80 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs">
                    <span className="text-6xl filter drop-shadow-[0_6px_8px_rgba(133,83,0,0.3)]">
                      {currentMystery.emoji}
                    </span>
                    <span className="absolute -bottom-0.5 bg-gradient-to-r from-[#006c49] to-emerald-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                      ¡3D HINCHADO!
                    </span>
                  </div>
                </div>

                <h3 className="text-lg leading-tight text-[#351000] font-black mt-2.5 mb-0 flex items-center gap-1.5">
                  <span>{currentMystery.name}</span>
                  <span className="text-sm">🌟</span>
                </h3>
                <p className="text-xs font-bold text-[#00714d] bg-[#6cf8bb]/70 border border-[#4edea3] px-3 py-1 rounded-full mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">volume_up</span>
                  <span>{currentMystery.phoneme}</span>
                </p>
              </div>

              {/* HTML5 Scratch Canvas (Overlaid) */}
              <canvas
                ref={scratchCanvasRef}
                width={360}
                height={256}
                onMouseMove={handleScratchMove}
                onTouchMove={handleScratchMove}
                className="absolute inset-0 z-20 w-full h-full cursor-pointer touch-none"
              />

              {/* Hand Hint on 0% progress */}
              {scratchProgress < 10 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-white/95 shadow-lg border-2 border-[#f59e0b] flex items-center justify-center text-[#f59e0b]">
                    <span className="material-symbols-outlined text-[26px]">touch_app</span>
                  </div>
                  <div className="mt-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-xs font-black text-[#351000]">
                    ¡Rasca con tu dedo! 👆✨
                  </div>
                </div>
              )}

              {/* Bottom Action Strip on Scratch Card */}
              <div className="absolute bottom-2.5 left-3 right-3 z-35 flex items-center gap-2">
                <button
                  onClick={handleClaimScratch}
                  disabled={scratchClaimed}
                  className={`flex-1 h-12 rounded-full text-white text-xs font-black flex items-center justify-center gap-2 shadow-[0_4px_0_0_#005236] active:translate-y-0.5 transition-all cursor-pointer ${
                    scratchClaimed
                      ? 'bg-[#00714d] opacity-90'
                      : 'bg-gradient-to-r from-[#006c49] to-emerald-600 hover:brightness-105'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {scratchClaimed ? 'check_circle' : 'auto_awesome'}
                  </span>
                  <span>
                    {scratchClaimed ? '¡Pegado en tu Álbum! (+50 ⭐)' : '✨ ¡Reclamar Sticker y Ganar +50 ⭐!'}
                  </span>
                </button>

                <button
                  onClick={handleResetScratch}
                  className="w-12 h-12 rounded-full bg-white text-[#855300] flex items-center justify-center shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform border border-[#ffd0bb] shrink-0 cursor-pointer"
                  title="Rascar otra lámina"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">casino</span>
                </button>
              </div>
            </div>
          </section>

          {/* 2. Minijuego: Cofre Sorpresa de Estrellas */}
          <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4 rounded-3xl shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffd0bb] flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b] text-[#613b00] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                </div>
                <div>
                  <h2 className="text-base text-[#351000] font-black leading-tight flex items-center gap-1.5">
                    <span>Cofre Sorpresa de Estrellas</span>
                    <span className="text-[10px] bg-[#f59e0b] text-white px-2 py-0.5 rounded-full font-black">
                      30 ⭐
                    </span>
                  </h2>
                  <p className="text-xs text-[#534434] font-semibold">
                    ¡Ábrelo para ganar stickers sorpresa y accesorios mágicos!
                  </p>
                </div>
              </div>
            </div>

            {/* 3D Chest visual preview */}
            <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200 border border-[#ffdbcc] flex items-center justify-center shadow-inner">
              <img
                alt="Cofre Mágico"
                className={`w-36 h-36 object-contain filter drop-shadow-lg transition-transform duration-500 ${
                  isOpeningChest ? 'animate-bounce scale-110' : 'hover:scale-105'
                }`}
                src={ASSETS.treasureChest}
              />

              <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-sm text-xs font-black text-[#855300] border border-[#ffd0bb] flex items-center gap-1">
                <span>⭐</span>
                <span>Tienes: {progress.starsCount}</span>
              </div>
            </div>

            {/* Open Chest Button */}
            <button
              onClick={handleOpenMysteryChest}
              disabled={isOpeningChest}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#f59e0b] via-amber-400 to-[#f59e0b] hover:brightness-105 text-[#451a03] text-base font-black flex items-center justify-center gap-2 shadow-[0_5px_0_0_#d97706] active:translate-y-1 transition-all cursor-pointer border border-amber-300"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px] animate-spin">auto_mode</span>
              <span>
                {isOpeningChest ? '¡Abriendo Cofre Mágico...!' : '🎁 ¡Abrir Cofre por 30 Estrellitas!'}
              </span>
            </button>

            {/* Reward Reveal Card */}
            {chestReward && (
              <div className="bg-white p-3.5 rounded-2xl shadow-md border-2 border-[#6cf8bb] flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div
                  style={{ backgroundColor: chestReward.colorBg }}
                  className="w-14 h-14 rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0"
                >
                  {chestReward.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#006c49] bg-[#6cf8bb]/50 px-2 py-0.5 rounded-full">
                      ¡NUEVO EN TU ÁLBUM!
                    </span>
                    <span className="text-xs font-black text-[#855300]">+10 ⭐ Regalo</span>
                  </div>
                  <h3 className="text-sm font-black text-[#351000] mt-0.5">
                    {chestReward.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#534434]">
                    {chestReward.phoneme}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: MEDALLAS Y TIENDA DE CHISPITA                 */}
      {/* ======================================================== */}
      {activeTab === 'tienda' && (
        <div className="flex flex-col gap-4">
          {/* 1. Tienda de Disfraces de Chispita */}
          <section className="bg-white p-4 rounded-3xl shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffd0bb] flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-2xl border border-[#ffd0bb]">
              <div className="relative shrink-0">
                <img
                  alt="Chispita"
                  className="w-14 h-14 rounded-full object-cover bg-[#6cf8bb] shadow-[0_3px_0_0_#4edea3] border-2 border-white"
                  src={ASSETS.chispitaAvatar}
                />
                {equippedCostume && (
                  <span className="absolute -top-2 -right-1 text-2xl filter drop-shadow animate-bounce">
                    {equippedCostume.emoji}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#351000]">Chispita dice:</span>
                  <span className="bg-[#6cf8bb] text-[#00714d] text-[10px] font-black px-2 py-0.5 rounded-full">
                    ¡Armario Mágico!
                  </span>
                </div>
                <p className="text-xs text-[#534434] font-semibold mt-0.5 leading-snug">
                  "¡Usa tus estrellitas para vestirme! Cada accesorio me hace lucir increíble."
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {CHISPITA_COSTUMES.map(costume => {
                const isUnlocked = progress.unlockedCostumes?.includes(costume.id);
                const isEquipped = progress.equippedCostume === costume.id;

                return (
                  <div
                    key={costume.id}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-between gap-2 border transition-all ${
                      isEquipped
                        ? 'bg-emerald-50 border-[#006c49] shadow-[0_4px_0_0_#4edea3]'
                        : isUnlocked
                        ? 'bg-white border-[#ffd0bb] shadow-[0_4px_0_0_#ffdbcc]'
                        : 'bg-[#fff8f6] border-[#ffd0bb]/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-[#855300]">
                        {costume.rarity}
                      </span>
                      {isEquipped && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#006c49] text-white">
                          Puesto ✨
                        </span>
                      )}
                    </div>

                    <div
                      style={{ backgroundColor: costume.iconBg }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner transform hover:scale-105 transition-transform"
                    >
                      {costume.emoji}
                    </div>

                    <div className="text-center">
                      <h4 className="text-xs font-black text-[#351000]">{costume.name}</h4>
                      <p className="text-[10px] text-[#534434] line-clamp-1">{costume.description}</p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleCostumeAction(costume)}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isEquipped
                          ? 'bg-white text-[#ba1a1a] border border-[#ba1a1a] hover:bg-red-50'
                          : isUnlocked
                          ? 'bg-[#006c49] text-white shadow-[0_3px_0_0_#005236] hover:bg-[#00714d]'
                          : 'bg-[#f59e0b] text-[#351000] shadow-[0_3px_0_0_#d97706] hover:bg-amber-400'
                      }`}
                      type="button"
                    >
                      {isEquipped ? (
                        <span>Quitar</span>
                      ) : isUnlocked ? (
                        <span>Equipar 👔</span>
                      ) : (
                        <span>Desbloquear ({costume.cost} ⭐)</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 2. Medallas de Honor Fonético */}
          <section className="bg-white p-4 rounded-3xl shadow-[0_8px_0_0_#ffdbcc] border-2 border-[#ffd0bb] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#f59e0b] text-[#613b00] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[24px]">military_tech</span>
                </div>
                <div>
                  <h2 className="text-base text-[#351000] font-black leading-tight">
                    Medallas de Honor Fonético
                  </h2>
                  <p className="text-xs font-semibold text-[#534434]">
                    Logros alcanzados durante tus aventuras de lectura
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#855300] font-black bg-[#ffddb8]/60 px-3 py-1 rounded-full border border-[#ffb95f]">
                {unlockedTrophiesCount} / {dynamicTrophies.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {dynamicTrophies.map(trophy => {
                const percent = Math.min(100, Math.round((trophy.currentCount / trophy.targetCount) * 100));

                return (
                  <div
                    key={trophy.id}
                    onClick={() => {
                      if (trophy.isUnlocked) {
                        playFanfare();
                        speakSpanish(`¡Medalla completada! ${trophy.title}. ${trophy.description}`);
                        showToast(`🏆 ${trophy.title}`);
                      } else {
                        playPop(420);
                        speakSpanish(`Esta medalla está en progreso. Llevas ${trophy.currentCount} de ${trophy.targetCount} ${trophy.unit}.`);
                        showToast(`🎯 Llevas ${trophy.currentCount}/${trophy.targetCount} ${trophy.unit}`);
                      }
                      triggerHaptic(20);
                    }}
                    className={`p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer transition-transform active:scale-[0.99] border ${
                      trophy.isUnlocked
                        ? 'bg-gradient-to-r from-amber-50/70 to-white shadow-[0_5px_0_0_#ffdbcc] border-[#ffd0bb]'
                        : 'bg-[#ffeae1]/40 opacity-75 border-dashed border-[#d8c3ad]'
                    }`}
                  >
                    <div
                      className={`relative w-13 h-13 rounded-full flex items-center justify-center text-3xl shadow-md shrink-0 ${
                        trophy.isUnlocked
                          ? 'bg-gradient-to-tr from-[#6cf8bb] to-emerald-200'
                          : 'bg-gray-100 grayscale opacity-60'
                      }`}
                    >
                      {trophy.badge.split(' ')[0]}
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm text-[#351000] font-black truncate">
                          {trophy.title}
                        </h3>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            trophy.isUnlocked
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {trophy.isUnlocked ? '¡CONSEGUIDO!' : `${trophy.currentCount}/${trophy.targetCount} ${trophy.unit}`}
                        </span>
                      </div>

                      <p className="text-xs text-[#534434] line-clamp-1 mt-0.5 font-medium">
                        {trophy.description}
                      </p>

                      {/* Progress bar inside trophy */}
                      {!trophy.isUnlocked && (
                        <div className="w-full h-2 bg-[#ffeae1] rounded-full overflow-hidden mt-1.5 shadow-inner">
                          <div
                            className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-[#855300] font-black mt-1">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        <span>{trophy.reward}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-[#351000] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#6cf8bb]">
            <span className="text-xl">🎉</span>
            <span className="text-xs font-black">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

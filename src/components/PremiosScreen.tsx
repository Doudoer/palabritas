import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS, INITIAL_STICKERS, PENDING_STICKERS, TROPHIES, StickerItem } from '../data/appData';
import {
  playPop,
  playSparkleChime,
  playFanfare,
  playScratchSound,
  speakSpanish,
  triggerHaptic,
  isSoundEffectsEnabled,
  setSoundEffects,
  isHapticsEnabled,
  setHaptics,
} from '../utils/audio';

interface PremiosScreenProps {
  starsCount: number;
  onAddStars: (amount: number) => void;
  onOpenCelebrationModal: () => void;
}

const MYSTERY_STICKERS = [
  { emoji: '🐉', title: '¡Super Dragón Lector!', phoneme: 'Fonema Especial: /DRA-GÓN/ 🌟 ¡Gafas de aventurero y chispas doradas!', stars: 50 },
  { emoji: '🦄', title: '¡Unicornio Arcoíris!', phoneme: 'Fonema Especial: /U-NI-COR-NIO/ 🦄 ¡Cuerno de diamantes mágicos!', stars: 50 },
  { emoji: '🚀', title: '¡Cohete Galáctico!', phoneme: 'Fonema Especial: /CO-HE-TE/ 🪐 ¡Estela de chispas supersónicas!', stars: 50 },
  { emoji: '🦁', title: '¡León Sabio Coronador!', phoneme: 'Fonema Especial: /LE-ÓN/ 👑 ¡Corona de oro resplandeciente!', stars: 50 },
];

export const PremiosScreen: React.FC<PremiosScreenProps> = ({
  starsCount,
  onAddStars,
  onOpenCelebrationModal,
}) => {
  const [activeTab, setActiveTab] = useState<'stickers' | 'trophies'>('stickers');
  const [pendingStickers, setPendingStickers] = useState<StickerItem[]>(PENDING_STICKERS);
  const [albumStickers, setAlbumStickers] = useState<StickerItem[]>(INITIAL_STICKERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sound and Haptics settings state
  const [soundOn, setSoundOn] = useState(isSoundEffectsEnabled());
  const [hapticOn, setHapticOn] = useState(isHapticsEnabled());

  // Scratch Card state
  const [scratchProgress, setScratchProgress] = useState(68); // start with nice active 68% look
  const [mysteryIndex, setMysteryIndex] = useState(0);
  const [scratchClaimed, setScratchClaimed] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentMystery = MYSTERY_STICKERS[mysteryIndex];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Scratch card canvas setup
  useEffect(() => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Base foil background
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e2e8f0');
    grad.addColorStop(0.25, '#fde68a');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(0.75, '#fef08a');
    grad.addColorStop(1, '#fed7aa');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Holographic stars & dots
    for (let i = 0; i < 75; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(245,158,11,0.45)';
      ctx.beginPath();
      ctx.arc(px, py, 1.5 + Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 18px Quicksand, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ RASCA AQUÍ ★', w / 2, 28);

    // Pre-scratched 68% clearings
    ctx.globalCompositeOperation = 'destination-out';
    const centerX = w * 0.5;
    const centerY = h * 0.46;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, w * 0.36, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    const organicHoles = [
      [centerX - 60, centerY - 35, 30],
      [centerX + 55, centerY - 25, 34],
      [centerX - 40, centerY + 25, 36],
      [centerX + 40, centerY + 30, 32],
      [centerX - 20, centerY - 55, 28],
      [centerX + 25, centerY - 50, 26],
      [centerX, centerY + 50, 32],
    ];

    organicHoles.forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Golden border flakes
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 35; i++) {
      const angle = (Math.PI * 2 * i) / 35 + (Math.random() * 0.2);
      const gx = centerX + Math.cos(angle) * (w * 0.36 + Math.random() * 8);
      const gy = centerY + Math.sin(angle) * (h * 0.38 + Math.random() * 8);
      ctx.fillStyle = Math.random() > 0.4 ? '#fbbf24' : '#6cf8bb';
      ctx.beginPath();
      ctx.arc(gx, gy, 2 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [mysteryIndex]);

  // Scratch move handler
  const handleScratchMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (scratchClaimed || !isScratching) return;
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    playScratchSound();
    triggerHaptic(12);

    if (scratchProgress < 95) {
      setScratchProgress(prev => Math.min(100, prev + 2));
    }
  };

  const handleClaimScratch = () => {
    playFanfare();
    triggerHaptic([40, 50, 80]);
    onAddStars(currentMystery.stars);
    setScratchClaimed(true);

    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#a855f7'],
    });

    speakSpanish(`¡Descubriste el ${currentMystery.title}! ¡Más 50 estrellas!`);
    showToast(`¡${currentMystery.title} pegado con éxito! ⭐ +50 Estrellas`);

    // Add to album page
    setAlbumStickers(prev => [
      ...prev,
      {
        id: `scratch-${Date.now()}`,
        name: currentMystery.title.replace(/¡|!/g, ''),
        emoji: currentMystery.emoji,
        phoneme: '/dra-gón/',
        tag: 'Épico',
        colorBg: '#6ffbbe',
        colorBorder: '#4edea3',
        stuck: true,
        isNew: true,
      },
    ]);
  };

  const handleResetScratch = () => {
    playPop(420);
    triggerHaptic(20);
    setScratchClaimed(false);
    setScratchProgress(68);
    setMysteryIndex((mysteryIndex + 1) % MYSTERY_STICKERS.length);
    showToast('🔄 ¡Lámina mágica preparada! ¡Rasca con tu dedo!');
  };

  // Sticker sticking
  const handleStickOne = (stickerId: string) => {
    playPop(520);
    playSparkleChime();
    triggerHaptic(30);
    onAddStars(5);

    setPendingStickers(prev =>
      prev.map(s => (s.id === stickerId ? { ...s, stuck: true } : s))
    );

    const stuckSticker = pendingStickers.find(s => s.id === stickerId);
    if (stuckSticker) {
      speakSpanish(`¡Sticker ${stuckSticker.name} pegado en tu álbum!`);
      showToast(`¡Sticker ${stuckSticker.name} pegado en tu álbum! ⭐ +5 Estrellas`);
    }
  };

  const handleStickAll = () => {
    playFanfare();
    triggerHaptic([40, 60, 40, 60, 100]);
    onAddStars(15);

    setPendingStickers(prev => prev.map(s => ({ ...s, stuck: true })));

    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.45 },
      colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171', '#a855f7'],
    });

    speakSpanish('¡Increíble! ¡Todos los stickers nuevos han sido pegados en tu álbum!');
    showToast('¡3 Nuevos stickers pegados en tu álbum! 🎉⭐');
  };

  const handleTapAlbumSticker = (sticker: StickerItem) => {
    playPop(480);
    triggerHaptic(20);
    speakSpanish(`${sticker.name}... ${sticker.phoneme.replace(/[/]/g, '')}`);
    showToast(`🎶 Fonema: ${sticker.name} (${sticker.phoneme})`);
  };

  const handleDecorateGlitter = () => {
    playFanfare();
    triggerHaptic([25, 40, 30, 50]);
    confetti({
      particleCount: 45,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a'],
    });
    speakSpanish('¡Tu álbum brilla con magia!');
    showToast('✨ ¡Efecto de brillo mágico activado en tus stickers!');
  };

  return (
    <div className="flex flex-col w-full gap-4 pb-8 select-none">
      {/* Dynamic Header: Mateo's Magic Album */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-label="Libro abierto" className="text-3xl select-none animate-bounce" role="img">📖</span>
            <h1 className="text-2xl text-[#351000] font-bold tracking-tight">Mi Álbum Mágico</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#ffddb8]/80 px-3 py-1 rounded-full shadow-sm border border-[#ffb95f]">
            <span className="material-symbols-outlined text-[#855300] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <span className="text-xs text-[#2a1700] font-bold">¡Nivel 5!</span>
          </div>
        </div>
        <p className="text-sm text-[#534434] font-medium">
          ¡Colección de Mateo! Pega tus stickers hinchados y admira tus medallas de fonemas.
        </p>

        {/* Progress Card */}
        <div className="bg-white p-3.5 rounded-2xl shadow-[0_6px_0_0_#ffdbcc] flex flex-col gap-2 border border-[#ffd0bb]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#351000] font-bold flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#006c49]"></span>
              24 de 48 Coleccionados
            </span>
            <span className="text-xs text-[#855300] font-bold bg-[#ffe2d6] px-2.5 py-0.5 rounded-full border border-[#ffd0bb]">
              ⭐ Coleccionista Estrella
            </span>
          </div>
          {/* Chunky Rainbow Progress Bar */}
          <div className="w-full h-3.5 bg-[#ffeae1] rounded-full overflow-hidden p-0.5 flex shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#f59e0b] via-[#6cf8bb] to-[#42bbff] rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: '50%' }}
            ></div>
          </div>
        </div>
      </header>

      {/* Segmented Chunky Switch (Stickers vs Trofeos) */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#ffe2d6] rounded-full border border-[#ffd0bb]">
        <button
          onClick={() => {
            playPop(420);
            triggerHaptic(15);
            setActiveTab('stickers');
          }}
          className={`h-12 rounded-full text-base font-bold flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeTab === 'stickers'
              ? 'bg-white text-[#855300] shadow-[0_4px_0_0_#ffdbcc]'
              : 'text-[#534434] hover:text-[#351000]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
          <span>Stickers (18)</span>
        </button>
        <button
          onClick={() => {
            playPop(420);
            triggerHaptic(15);
            setActiveTab('trophies');
          }}
          className={`h-12 rounded-full text-base font-bold flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer ${
            activeTab === 'trophies'
              ? 'bg-white text-[#855300] shadow-[0_4px_0_0_#ffdbcc]'
              : 'text-[#534434] hover:text-[#351000]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <span>Trofeos (6)</span>
        </button>
      </div>

      {activeTab === 'stickers' ? (
        <div className="flex flex-col gap-4">
          {/* ======================================================== */}
          {/* MINIJUEGO: RASCA Y DESCUBRE TU STICKER SORPRESA */}
          {/* ======================================================== */}
          <section className="p-[3px] rounded-3xl scratch-shimmer-border shadow-[0_8px_24px_rgba(245,158,11,0.25)] relative overflow-hidden">
            <div className="bg-white rounded-[22px] p-3.5 flex flex-col gap-3 relative overflow-hidden">
              {/* Header of the Mini-game */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f59e0b] to-amber-300 text-[#613b00] flex items-center justify-center shadow-md animate-bounce">
                    <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
                  </div>
                  <div>
                    <h2 className="text-lg leading-tight text-[#351000] font-bold flex items-center gap-1.5">
                      <span>¡Rasca y Descubre!</span>
                      <span className="text-xs bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full font-bold shadow-xs">
                        Sorpresa ✨
                      </span>
                    </h2>
                    <p className="text-xs font-semibold text-[#534434]">Usa tu dedo para raspar la lámina mágica</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#6cf8bb]/80 border border-[#00714d]/30 px-3 py-1 rounded-full text-xs font-bold text-[#00714d] shadow-sm">
                  <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                  <span>¡{scratchProgress}% Rascado!</span>
                </div>
              </div>

              {/* Interactive Scratch Play Area Card */}
              <div
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                className="relative w-full h-64 rounded-2xl overflow-hidden shadow-inner border-2 border-[#f59e0b]/60 bg-gradient-to-b from-amber-50 via-orange-50 to-emerald-50 flex items-center justify-center select-none touch-none"
              >
                {/* Hidden Sticker Revealed Underneath (3D Hinchado Holográfico) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-10 select-none">
                  <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-200 via-emerald-100 to-sky-200 p-1.5 shadow-[0_12px_24px_rgba(245,158,11,0.35)] ring-4 ring-white animate-float-gentle flex items-center justify-center">
                    <div className="w-full h-full rounded-2xl bg-white/80 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs">
                      <span className="text-6xl filter drop-shadow-[0_6px_8px_rgba(133,83,0,0.3)]">
                        {currentMystery.emoji}
                      </span>
                      <span className="absolute -bottom-0.5 bg-gradient-to-r from-[#006c49] to-emerald-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                        ¡3D HINCHADO!
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg leading-tight text-[#351000] font-bold mt-2.5 mb-0 flex items-center gap-1.5">
                    <span>{currentMystery.title}</span>
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
                  width={340}
                  height={256}
                  onMouseMove={handleScratchMove}
                  onTouchMove={handleScratchMove}
                  className="absolute inset-0 z-20 w-full h-full cursor-pointer touch-none"
                />

                {/* Animated Finger Drag Guide */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/95 shadow-lg border-2 border-[#f59e0b] flex items-center justify-center text-[#f59e0b]">
                    <span className="material-symbols-outlined text-[24px]">touch_app</span>
                  </div>
                  <div className="mt-1 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm text-[11px] font-bold text-[#351000]">
                    ¡Rasca con tu dedo! 👆✨
                  </div>
                </div>

                {/* Bottom Action Strip on Scratch Card */}
                <div className="absolute bottom-2.5 left-3 right-3 z-35 flex items-center gap-2">
                  <button
                    onClick={handleClaimScratch}
                    disabled={scratchClaimed}
                    className={`flex-1 h-11 rounded-full text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_4px_0_0_#005236] active:translate-y-0.5 transition-all cursor-pointer ${
                      scratchClaimed
                        ? 'bg-[#00714d] opacity-80'
                        : 'bg-gradient-to-r from-[#006c49] to-emerald-600 hover:brightness-105'
                    }`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {scratchClaimed ? 'check_circle' : 'auto_awesome'}
                    </span>
                    <span>
                      {scratchClaimed ? '¡Pegado en Álbum! (+50 ⭐)' : '✨ ¡Reclamar y Pegar! (+50 ⭐)'}
                    </span>
                  </button>

                  <button
                    onClick={handleResetScratch}
                    className="w-11 h-11 rounded-full bg-white text-[#855300] flex items-center justify-center shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform border border-[#ffd0bb] shrink-0 cursor-pointer"
                    title="Otro misterio"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">casino</span>
                  </button>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="flex items-center justify-between pt-1 text-xs font-bold text-[#534434]">
                <button
                  onClick={handleResetScratch}
                  className="text-[#00714d] hover:underline flex items-center gap-1 bg-[#6cf8bb]/40 px-2.5 py-1 rounded-full cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">refresh</span>
                  <span>Rascar otra vez</span>
                </button>
                <button
                  onClick={() => onOpenCelebrationModal()}
                  className="text-[#855300] hover:underline flex items-center gap-1 bg-[#ffddb8]/50 px-2.5 py-1 rounded-full cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">military_tech</span>
                  <span>Ver Gran Cofre</span>
                </button>
              </div>
            </div>
          </section>

          {/* Tray of 3 New Stickers to Peel & Stick */}
          <section className="bg-gradient-to-b from-[#c9e6ff]/60 to-[#fff1eb] p-4 rounded-3xl shadow-[0_6px_0_0_#c9e6ff] flex flex-col gap-2 relative overflow-hidden border-2 border-[#c9e6ff]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#42bbff] flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">pan_tool_alt</span>
                </span>
                <span className="text-lg text-[#001e2f] font-bold">¡3 Stickers Nuevos!</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Audio and Haptics toggles */}
                <button
                  onClick={() => {
                    const next = !soundOn;
                    setSoundOn(next);
                    setSoundEffects(next);
                    showToast(next ? '🔊 Sonido activado' : '🔇 Sonido apagado');
                  }}
                  className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full text-xs font-bold text-[#00714d] shadow-sm cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {soundOn ? 'volume_up' : 'volume_off'}
                  </span>
                  <span>{soundOn ? 'Sonido' : 'Mudo'}</span>
                </button>
                <button
                  onClick={() => {
                    const next = !hapticOn;
                    setHapticOn(next);
                    setHaptics(next);
                    if (next) triggerHaptic([30]);
                    showToast(next ? '📳 Háptica activa' : '📴 Háptica apagada');
                  }}
                  className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full text-xs font-bold text-[#00714d] shadow-sm cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {hapticOn ? 'vibration' : 'mobile_off'}
                  </span>
                  <span>{hapticOn ? 'Háptica' : 'Off'}</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-[#534434]">
              ¡Ganados en tu aventura de <span className="font-bold text-[#855300]">/S/</span> y <span className="font-bold text-[#006c49]">/R/</span>! Toca cada uno o pégalos todos:
            </p>

            {/* 3 New Sticker Cards */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {pendingStickers.map(stk => (
                <button
                  key={stk.id}
                  onClick={() => handleStickOne(stk.id)}
                  type="button"
                  className={`relative bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 shadow-[0_5px_0_0_#ffd0bb] active:translate-y-1 active:shadow-[0_2px_0_0_#ffd0bb] transition-all cursor-pointer border ${
                    stk.stuck ? 'border-[#6cf8bb] bg-emerald-50/50' : 'border-[#ffd0bb]'
                  }`}
                >
                  <span
                    className={`absolute -top-1.5 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${
                      stk.stuck
                        ? 'bg-[#006c49] text-white'
                        : 'bg-[#ba1a1a] text-white'
                    }`}
                  >
                    {stk.stuck ? '¡PEGADO!' : '¡NUEVO!'}
                  </span>
                  <div
                    style={{ backgroundColor: stk.colorBg }}
                    className="w-13 h-13 rounded-full flex items-center justify-center text-3xl shadow-inner transform hover:scale-110 transition-transform"
                  >
                    {stk.emoji}
                  </div>
                  <span className="text-xs text-[#351000] font-bold text-center line-clamp-1 mt-0.5">
                    {stk.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Action: Pegar Todos */}
            <button
              onClick={handleStickAll}
              className="mt-2 w-full h-14 rounded-full bg-[#6cf8bb] hover:bg-[#6ffbbe] text-[#00714d] text-base font-extrabold flex items-center justify-center gap-2 shadow-[0_5px_0_0_#4edea3] active:translate-y-1 active:shadow-[0_2px_0_0_#4edea3] transition-all cursor-pointer border border-[#4edea3]"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">magic_button</span>
              <span>✨ ¡Pegar todos en mi álbum!</span>
            </button>
          </section>

          {/* Interactive Open Album Preview Hero */}
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-[#351000] font-bold flex items-center gap-2">
                <span>Álbum 3D Táctil</span>
                <span className="text-xs bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full font-bold">En Vivo</span>
              </h2>
              <span className="text-xs text-[#855300] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">volume_up</span> Sonidos /S/
              </span>
            </div>

            {/* 3D Open Book Hero */}
            <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_8px_0_0_#ffdbcc] bg-[#ffe2d6] p-2 border-2 border-[#ffdbcc]">
              <img
                alt="Álbum de stickers 3D abierto"
                className="w-full h-52 object-cover rounded-2xl shadow-sm"
                src={ASSETS.stickerAlbum3D}
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full flex items-center justify-between shadow-md">
                <span className="text-xs text-[#351000] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>touch_app</span>
                  Toca los stickers para escucharlos
                </span>
                <button
                  onClick={() => {
                    playSparkleChime();
                    triggerHaptic(20);
                    speakSpanish('¡Escucha los sonidos de tu álbum!');
                  }}
                  className="w-8 h-8 rounded-full bg-[#f59e0b] text-[#613b00] flex items-center justify-center shadow-sm active:scale-95 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </button>
              </div>
            </div>
          </section>

          {/* The Sticker Album Page Grid (2x4 interactive layout) */}
          <div className="bg-[#fff1eb] p-4 rounded-3xl shadow-[0_6px_0_0_#ffdbcc] flex flex-col gap-2 border border-[#ffd0bb]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#351000] font-bold">Página 1: Los Sonidos /S/ y /R/</span>
              <span className="text-xs font-bold text-[#534434] bg-[#ffeae1] px-2.5 py-0.5 rounded-full">
                {albumStickers.length} pegados ✨
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {albumStickers.map(stk => (
                <div
                  key={stk.id}
                  onClick={() => handleTapAlbumSticker(stk)}
                  className="bg-white p-3 rounded-2xl shadow-[0_5px_0_0_#ffdbcc] flex flex-col items-center justify-center gap-1 relative overflow-hidden group active:scale-95 transition-transform cursor-pointer border border-[#ffd0bb]"
                >
                  <div
                    style={{ backgroundColor: stk.colorBg }}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform"
                  >
                    {stk.emoji}
                  </div>
                  <span className="text-base text-[#351000] font-bold">{stk.name}</span>
                  <span className="text-[11px] font-bold text-[#855300] bg-[#ffddb8]/50 px-2 py-0.5 rounded-full">
                    {stk.phoneme}
                  </span>
                  {stk.isNew && (
                    <span className="absolute top-1.5 right-1.5 bg-[#006c49] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      ¡NUEVO!
                    </span>
                  )}
                </div>
              ))}

              {/* Mystery locked slots */}
              <div className="bg-[#ffeae1]/60 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center border border-dashed border-[#d8c3ad]">
                <div className="w-14 h-14 rounded-full bg-[#ffd0bb]/50 flex items-center justify-center text-[#867461] text-2xl">
                  <span className="material-symbols-outlined text-[32px]">help_center</span>
                </div>
                <span className="text-xs text-[#534434] font-bold">¿Quién será?</span>
                <span className="text-[10px] text-[#534434] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#ba1a1a]">lock</span> Fonema /T/
                </span>
              </div>

              <div className="bg-[#ffeae1]/60 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center border border-dashed border-[#d8c3ad]">
                <div className="w-14 h-14 rounded-full bg-[#ffd0bb]/50 flex items-center justify-center text-[#867461] text-2xl">
                  <span className="material-symbols-outlined text-[32px]">help_center</span>
                </div>
                <span className="text-xs text-[#534434] font-bold">¿Quién será?</span>
                <span className="text-[10px] text-[#534434] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] text-[#ba1a1a]">lock</span> Mundo /R/ Fuerte
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TROPHIES VIEW */
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#f59e0b] text-[#613b00] flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">military_tech</span>
              </div>
              <div>
                <h2 className="text-lg text-[#351000] font-bold">Medallas de Honor Fonético</h2>
                <p className="text-xs font-semibold text-[#534434]">Los mayores logros de lectura de Mateo</p>
              </div>
            </div>
            <span className="text-xs text-[#855300] font-bold bg-[#ffddb8]/60 px-2.5 py-1 rounded-full border border-[#ffb95f]">
              3 / 6
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {TROPHIES.map(trophy => (
              <div
                key={trophy.id}
                onClick={() => {
                  playPop(520);
                  triggerHaptic(20);
                  speakSpanish(`${trophy.title}. ${trophy.description}`);
                  showToast(`🏆 ${trophy.title}`);
                }}
                className={`p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-transform active:scale-[0.99] border ${
                  trophy.unlocked
                    ? 'bg-white shadow-[0_5px_0_0_#ffdbcc] border-[#ffd0bb]'
                    : 'bg-[#ffeae1]/50 opacity-75 border-dashed border-[#d8c3ad]'
                }`}
              >
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#6cf8bb] to-emerald-200 flex items-center justify-center text-3xl shadow-md shrink-0">
                  {trophy.badge.split(' ')[0]}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm text-[#351000] font-bold truncate">{trophy.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trophy.tagColor}`}>
                      {trophy.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#534434] line-clamp-1 mt-0.5">
                    {trophy.description}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-[#855300] font-bold mt-1">
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    {trophy.reward}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mascot Proud Message & Actions */}
      <section className="bg-white p-4 rounded-3xl shadow-[0_6px_0_0_#ffdbcc] flex flex-col gap-2 mt-1 border border-[#ffd0bb]">
        <div className="flex items-center gap-3">
          <img
            alt="Chispita"
            className="w-14 h-14 rounded-full object-cover bg-[#6cf8bb] shadow-[0_3px_0_0_#4edea3] shrink-0"
            src={ASSETS.chispitaAvatar}
          />
          <div className="flex flex-col">
            <span className="text-sm text-[#351000] font-bold">¡Chispita está muy orgullosa!</span>
            <p className="text-xs text-[#534434]">
              "¡Mamá y Papá pueden ver tu progreso en tiempo real desde su teléfono!"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => {
              playPop(440);
              triggerHaptic(15);
              showToast('📸 ¡Foto de tu álbum guardada!');
            }}
            className="h-12 rounded-full bg-[#ffe2d6] text-[#351000] text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform cursor-pointer border border-[#ffd0bb]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#855300]">photo_camera</span>
            <span>Guardar Foto</span>
          </button>
          <button
            onClick={handleDecorateGlitter}
            className="h-12 rounded-full bg-[#f59e0b] hover:bg-amber-500 text-[#613b00] text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#d97706] active:translate-y-0.5 transition-transform cursor-pointer border border-[#d97706]"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Decorar con Brillo</span>
          </button>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-[#351000] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#6cf8bb]">
            <span className="text-xl">🎉</span>
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS } from '../data/appData';
import { playPop, playSparkleChime, playFanfare, speakSpanish, triggerHaptic } from '../utils/audio';
import { loadPlayerProgress } from '../utils/playerProgress';

import { RoomCatalogItem } from '../data/avatarRoomData';

interface CelebrationChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToAlbum: () => void;
  onAddStars: (amount: number) => void;
  worldTitle?: string;
  worldEmoji?: string;
  focusLetter?: string;
  starsCount?: number;
  unlockedStickerName?: string;
  unlockedStickerEmoji?: string;
  learnedWordsList?: string[];
  newRoomItems?: RoomCatalogItem[];
  onGoToRoom?: () => void;
}

export const CelebrationChestModal: React.FC<CelebrationChestModalProps> = ({
  isOpen,
  onClose,
  onGoToAlbum,
  onAddStars,
  worldTitle = 'Mundo de Letras Mágicas',
  worldEmoji = '⭐',
  focusLetter,
  starsCount,
  unlockedStickerName,
  unlockedStickerEmoji,
  learnedWordsList,
  newRoomItems,
  onGoToRoom,
}) => {
  const progress = loadPlayerProgress();
  const currentTotalStars = starsCount !== undefined ? starsCount : progress.starsCount;
  const childName = progress.playerName || 'Pequeño Campeón';

  const defaultStickerName = unlockedStickerName || (focusLetter ? `Sticker Letra ${focusLetter}` : 'Sticker Mágico');
  const defaultStickerEmoji = unlockedStickerEmoji || worldEmoji || '✨';
  const displayWords = learnedWordsList && learnedWordsList.length > 0 ? learnedWordsList : progress.learnedWords.slice(-4);

  useEffect(() => {
    if (isOpen) {
      playFanfare();
      triggerHaptic([40, 50, 40, 60, 120]);
      onAddStars(25);
      
      const speechMsg = `¡Misión cumplida! ¡${worldTitle} superado! ¡Has ganado veinticinco estrellas doradas!`;
      speakSpanish(speechMsg);

      // Big celebratory fireworks confetti
      confetti({
        particleCount: 90,
        spread: 90,
        origin: { y: 0.35 },
        colors: ['#f59e0b', '#6cf8bb', '#42bbff', '#f87171', '#ffb95f'],
      });
    }
  }, [isOpen, worldTitle]);

  if (!isOpen) return null;

  const handleSparkleTap = () => {
    playSparkleChime();
    triggerHaptic([30, 40]);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#42bbff'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#351000]/60 backdrop-blur-md flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-md bg-[#fff8f6] rounded-3xl p-5 shadow-2xl relative my-6 flex flex-col border-4 border-[#ffddb8] max-h-[94vh] overflow-y-auto">
        {/* Banner Festivo Superior */}
        <div className="relative w-full flex flex-col items-center text-center mt-1 mb-3 px-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#f59e0b] via-amber-400 to-[#f59e0b] text-white text-sm font-extrabold px-6 py-2 rounded-full shadow-[0_4px_0_0_#d97706] transform -rotate-1">
            <span className="material-symbols-outlined text-yellow-100 animate-spin" style={{ animationDuration: '4s' }}>hotel_class</span>
            <span>¡MISIÓN CUMPLIDA! 🎉</span>
            <span className="material-symbols-outlined text-yellow-100 animate-pulse">hotel_class</span>
          </div>

          <h1 className="text-2xl text-[#351000] font-black mt-3 leading-tight tracking-tight flex items-center justify-center gap-2 flex-wrap">
            <span>{worldTitle}</span>
            <span className="text-2xl">{worldEmoji}</span>
          </h1>
          <p className="text-xs text-[#534434] font-semibold max-w-xs mt-1">
            ¡Superaste todos los ejercicios con una sonrisa brillante!
          </p>

          {/* Bocadillo de Chispita */}
          <div className="w-full mt-3 bg-[#fff1eb] p-3.5 rounded-2xl shadow-sm relative flex items-start gap-3 border border-[#ffd0bb]">
            <div className="relative shrink-0">
              <div className="w-13 h-13 rounded-full bg-[#6cf8bb] flex items-center justify-center shadow-[0_3px_0_0_#4edea3]">
                <img
                  className="w-11 h-11 rounded-full object-cover"
                  alt="Chispita"
                  src={ASSETS.chispitaCelebration}
                />
              </div>
              <span className="material-symbols-outlined absolute -bottom-1 -right-1 text-[#f59e0b] bg-white rounded-full text-sm p-0.5 shadow-sm">favorite</span>
            </div>
            <div className="flex-1 text-left">
              <div className="inline-block bg-[#ffddb8] text-[#2a1700] text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5">
                Chispita dice:
              </div>
              <p className="text-xs text-[#351000] font-medium leading-snug">
                "¡Increíble trabajo, <strong className="text-[#855300] font-bold">{childName}</strong>! ¡Eres un explorador de letras legendario!"
              </p>
            </div>
          </div>
        </div>

        {/* Gran Cofre Mágico de Recompensas */}
        <div className="relative w-full my-2 flex flex-col items-center">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(245,158,11,0.22)] bg-[#ffe2d6] p-2 flex flex-col items-center border border-[#ffd0bb]">
            <div className="relative w-full aspect-square max-h-56 rounded-xl overflow-hidden bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center">
              <img
                alt="Cofre mágico repleto de tesoros"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                src={ASSETS.treasureChest}
              />
              <div className="absolute top-3 right-3 bg-[#6cf8bb] text-[#00714d] px-3 py-1 rounded-full shadow-[0_3px_0_0_#4edea3] flex items-center gap-1.5 text-xs font-bold animate-bounce">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>¡ABIERTO! ✨</span>
              </div>
              <button
                onClick={handleSparkleTap}
                className="absolute bottom-3 inset-x-4 bg-white/95 backdrop-blur-md text-[#613b00] px-4 py-2 rounded-full shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer border border-[#ffd0bb]"
                type="button"
              >
                <span className="material-symbols-outlined text-[#f59e0b] text-[18px] animate-pulse">celebration</span>
                <span>¡Toca para más magia!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de Premios Obtenidos */}
        <div className="w-full flex flex-col gap-3 mt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base text-[#351000] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f59e0b]">stars</span>
              <span>Tus Nuevos Premios</span>
            </h2>
            <span className="text-xs font-bold text-[#006c49] bg-[#6cf8bb]/40 px-2.5 py-1 rounded-full">
              ¡Recompensas Listas!
            </span>
          </div>

          {/* Recompensa 1: Estrellitas */}
          <div className="bg-[#fff1eb] rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3 border border-[#ffd0bb]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#ffddb8] flex items-center justify-center shadow-[0_4px_0_0_#ffb95f] shrink-0 p-2 text-[#855300]">
                <span className="material-symbols-outlined text-2xl animate-bounce">star</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-[#351000] font-bold">+25 Estrellitas</span>
                  <span className="bg-amber-100 text-[#613b00] text-[10px] px-2 py-0.5 rounded-full font-bold">¡NUEVO!</span>
                </div>
                <p className="text-xs text-[#534434]">
                  Total acumulado: <strong className="text-[#351000] font-bold">{currentTotalStars + 25} ⭐</strong>
                </p>
              </div>
            </div>
            <div className="bg-[#f59e0b] text-white text-sm font-bold px-3 py-1 rounded-full shadow-[0_3px_0_0_#d97706]">
              +25
            </div>
          </div>

          {/* Recompensa 2: Sticker de Colección para el Álbum */}
          <div className="bg-[#fff1eb] rounded-2xl p-3 shadow-sm flex items-start gap-3 border border-[#ffd0bb]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-200 to-emerald-200 flex items-center justify-center text-3xl shadow-[0_4px_0_0_#4edea3] shrink-0">
              {defaultStickerEmoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#006c49] font-bold uppercase tracking-wider">Sticker Desbloqueado</span>
                <span className="bg-[#6cf8bb] text-[#00714d] text-[10px] font-bold px-2 py-0.5 rounded-full">¡AL ÁLBUM!</span>
              </div>
              <h3 className="text-sm text-[#351000] font-bold mt-0.5">
                {defaultStickerName}
              </h3>
              <p className="text-xs text-[#534434] font-medium">
                ¡Se ha añadido automáticamente a tu Álbum de Stickers 3D!
              </p>
            </div>
          </div>

          {/* Recompensa 3: Palabras Dominadas */}
          {displayWords.length > 0 && (
            <div className="bg-[#fff1eb] rounded-2xl p-3 shadow-sm flex flex-col gap-1.5 border border-[#ffd0bb]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#351000] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006c49] text-[16px]">spellcheck</span>
                  Palabras de Esta Aventura
                </span>
                <span className="text-[10px] font-bold text-[#006c49] bg-[#6cf8bb] px-2 py-0.5 rounded-full">¡Completadas!</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {displayWords.map(w => (
                  <div key={w} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-xs text-xs font-bold text-[#855300] border border-[#ffd0bb]">
                    <span className="material-symbols-outlined text-[#006c49] text-[14px]">check_circle</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recompensa 4: ¡Nuevos Objetos para la Habitación y el Avatar! */}
          {newRoomItems && newRoomItems.length > 0 && (
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 rounded-2xl p-3 shadow-sm flex flex-col gap-2 border-2 border-amber-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#351000] font-black flex items-center gap-1.5">
                  <span className="text-lg">🏠🎁</span>
                  <span>¡Premios para tu Habitación!</span>
                </span>
                <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                  ¡Avatar World!
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {newRoomItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white/95 p-2 rounded-xl border border-amber-200 shadow-xs"
                  >
                    <span className="text-2xl shrink-0">{item.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-[11px] font-black text-[#351000] truncate block">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold block">
                        ¡Desbloqueado! ✨
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acciones Finales */}
        <div className="w-full flex flex-col gap-2.5 mt-5">
          {onGoToRoom && (
            <button
              onClick={() => {
                playPop(480);
                triggerHaptic(20);
                onClose();
                onGoToRoom();
              }}
              className="w-full h-14 bg-gradient-to-r from-[#f59e0b] via-amber-400 to-[#f59e0b] hover:from-amber-400 hover:to-amber-500 text-white rounded-2xl text-base font-black shadow-[0_5px_0_0_#d97706] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300 animate-bounce"
              type="button"
            >
              <span className="text-2xl">🏠</span>
              <span>¡Ir a Decorar mi Habitación! 🎨</span>
            </button>
          )}

          <button
            onClick={() => {
              playPop(480);
              triggerHaptic(20);
              onClose();
            }}
            className="w-full h-12 bg-[#006c49] hover:bg-[#00714d] text-white rounded-2xl text-xs font-bold shadow-[0_4px_0_0_#005236] active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#005236]"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">map</span>
            <span>Continuar Aventuras en el Mapa 🗺️</span>
          </button>

          <button
            onClick={() => {
              playPop(440);
              triggerHaptic(15);
              onClose();
              onGoToAlbum();
            }}
            className="w-full h-11 bg-[#ffe2d6] hover:bg-[#ffdbcc] text-[#351000] rounded-2xl text-xs font-bold shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#ffd0bb]"
            type="button"
          >
            <span className="material-symbols-outlined text-[#006591] text-[18px]">menu_book</span>
            <span>Ver mi Álbum de Stickers 📖</span>
          </button>
        </div>
      </div>
    </div>
  );
};


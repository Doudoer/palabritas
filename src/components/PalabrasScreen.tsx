import React, { useState } from 'react';
import { ConstruyeScreen } from './ConstruyeScreen';
import { EscribeScreen } from './EscribeScreen';
import { playPop, triggerHaptic, speakSpanish } from '../utils/audio';

interface PalabrasScreenProps {
  onBackToMap: () => void;
  onOpenCelebration: () => void;
  onAddStars: (amount: number) => void;
  initialSubTab?: 'construye' | 'escribe';
  initialLetterIndex?: number;
  initialWritingLetter?: string;
  initialFilter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas';
  currentWorldId?: number;
  onCompleteWorld?: (worldId: number) => void;
}

export const PalabrasScreen: React.FC<PalabrasScreenProps> = ({
  onBackToMap,
  onOpenCelebration,
  onAddStars,
  initialSubTab = 'construye',
  initialLetterIndex = 0,
  initialWritingLetter = 'A',
  initialFilter = 'vocales',
  currentWorldId = 1,
  onCompleteWorld,
}) => {
  const [subTab, setSubTab] = useState<'construye' | 'escribe'>(initialSubTab);

  const handleSubTabChange = (newTab: 'construye' | 'escribe') => {
    playPop(520);
    triggerHaptic(15);
    setSubTab(newTab);
    if (newTab === 'construye') {
      speakSpanish('¡Modo Sílabas! Escucha y arma las piezas mágicas.');
    } else {
      speakSpanish('¡Modo Escritura! Escribe palabras con el teclado y tu pizarra.');
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      {/* Top Switcher Pill: Arma Sílabas vs. Escribe Palabras */}
      <div className="w-full max-w-md mx-auto mb-3 px-1">
        <div className="bg-[#fff1eb] p-1.5 rounded-3xl border-2 border-[#ffd0bb] shadow-[0_4px_0_0_#ffdbcc] flex items-center justify-between gap-1.5">
          {/* Tab 1: Construye con Sílabas */}
          <button
            onClick={() => handleSubTabChange('construye')}
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'construye'
                ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#451a03] shadow-[0_4px_0_0_#d97706] scale-[1.02]'
                : 'text-[#613b00] hover:bg-white/60 active:scale-95'
            }`}
          >
            <span className="text-base sm:text-lg">🧩</span>
            <span>Arma Sílabas</span>
          </button>

          {/* Tab 2: Escribe con Teclado & Pizarra */}
          <button
            onClick={() => handleSubTabChange('escribe')}
            type="button"
            className={`flex-1 py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              subTab === 'escribe'
                ? 'bg-gradient-to-r from-[#6cf8bb] to-[#34d399] text-[#064e3b] shadow-[0_4px_0_0_#059669] scale-[1.02]'
                : 'text-[#613b00] hover:bg-white/60 active:scale-95'
            }`}
          >
            <span className="text-base sm:text-lg">✍️</span>
            <span>Escribe Palabras</span>
          </button>
        </div>
      </div>

      {/* Active Mode Render */}
      {subTab === 'construye' ? (
        <ConstruyeScreen
          onBackToMap={onBackToMap}
          onOpenCelebration={onOpenCelebration}
          onAddStars={onAddStars}
          initialLetterIndex={initialLetterIndex}
          initialFilter={initialFilter}
          currentWorldId={currentWorldId}
          onCompleteWorld={onCompleteWorld}
        />
      ) : (
        <EscribeScreen
          onBackToMap={onBackToMap}
          onAddStars={onAddStars}
          initialLetter={initialWritingLetter}
        />
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ASSETS } from './data/appData';
import { MundosScreen } from './components/MundosScreen';
import { PalabrasScreen } from './components/PalabrasScreen';
import { TrazosScreen } from './components/TrazosScreen';
import { PremiosScreen } from './components/PremiosScreen';
import { CuentosScreen } from './components/CuentosScreen';
import { ParentalGateModal } from './components/ParentalGateModal';
import { PedagogicalReportModal } from './components/PedagogicalReportModal';
import { PhonicsSessionModal } from './components/PhonicsSessionModal';
import { CelebrationChestModal } from './components/CelebrationChestModal';
import { InstallAppModal } from './components/InstallAppModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WORLDS_DATA } from './data/worldsData';
import confetti from 'canvas-confetti';
import { playPop, playSparkleChime, playFanfare, speakSpanish, triggerHaptic } from './utils/audio';
import {
  loadPlayerProgress,
  addPlayerStars,
  completePlayerWorld,
  PlayerProgress,
} from './utils/playerProgress';

export type NavigationTab = 'mundos' | 'trazos' | 'palabras' | 'cuentos' | 'premios';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('mundos');
  const [palabrasSubTab, setPalabrasSubTab] = useState<'construye' | 'escribe'>('construye');

  // Persistent Player Progress State
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(() => loadPlayerProgress());

  // Current learning selections
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedLetterIndex, setSelectedLetterIndex] = useState<number>(0);
  const [selectedWritingLetter, setSelectedWritingLetter] = useState<string>('A');
  const [letterFilter, setLetterFilter] = useState<'vocales' | 'primeras' | 'avanzadas' | 'todas'>('vocales');

  // Modals state
  const [isParentalGateOpen, setIsParentalGateOpen] = useState(false);
  const [isPedagogicalReportOpen, setIsPedagogicalReportOpen] = useState(false);
  const [isPhonicsSessionOpen, setIsPhonicsSessionOpen] = useState(false);
  const [isCelebrationModalOpen, setIsCelebrationModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleAddStars = (amount: number) => {
    const { newTotal } = addPlayerStars(amount);
    setPlayerProgress(prev => ({ ...prev, starsCount: newTotal }));
    playSparkleChime();
  };

  const handleCompleteWorld = (worldId: number) => {
    const result = completePlayerWorld(worldId);
    setPlayerProgress(result.updatedProgress);

    const nextWorld = WORLDS_DATA.find(w => w.id === worldId + 1);
    playFanfare();
    confetti({
      particleCount: 85,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#6cf8bb', '#f59e0b', '#42bbff', '#ffd0bb'],
    });

    if (nextWorld) {
      speakSpanish(`¡Excelente! Has completado el ${nextWorld.numberLabel ? `Mundo ${worldId}` : 'nivel'}. ¡Se ha desbloqueado el ${nextWorld.numberLabel}: ${nextWorld.title}!`);
    } else {
      speakSpanish('¡Increíble! ¡Has completado todas las familias de letras del abecedario de Palabritas!');
    }
  };

  const handleTabChange = (tab: NavigationTab) => {
    playPop(440);
    triggerHaptic(15);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartWordGame = (letterIdx?: number, filter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas', worldId?: number) => {
    if (filter) {
      setLetterFilter(filter);
    }
    if (typeof worldId === 'number') {
      setPlayerProgress(prev => ({ ...prev, currentWorldId: worldId }));
    }
    if (typeof letterIdx === 'number') {
      setSelectedLetterIndex(letterIdx);
    } else if (filter === 'vocales') {
      setSelectedLetterIndex(0);
    }
    setPalabrasSubTab('construye');
    handleTabChange('palabras');
  };

  const handleOpenTracing = (letter?: string, filter?: 'vocales' | 'primeras' | 'avanzadas' | 'todas', worldId?: number) => {
    if (filter) {
      setLetterFilter(filter);
    } else if (letter && ['A', 'E', 'I', 'O', 'U'].includes(letter.toUpperCase())) {
      setLetterFilter('vocales');
    }
    if (typeof worldId === 'number') {
      setPlayerProgress(prev => ({ ...prev, currentWorldId: worldId }));
    }
    if (letter) {
      setSelectedLetter(letter);
    } else if (filter === 'vocales') {
      setSelectedLetter('A');
    }
    handleTabChange('trazos');
  };

  const handleOpenWriting = (letter?: string) => {
    if (letter) {
      setSelectedWritingLetter(letter.toUpperCase());
    }
    setPalabrasSubTab('escribe');
    handleTabChange('palabras');
  };

  const handleChispitaHeaderClick = () => {
    playPop(520);
    triggerHaptic(20);
    speakSpanish('¡Hola! Soy Chispita, tu compañera mágica de lectura y escritura.');
  };

  return (
    <div className="bg-[#fff8f6] font-['Quicksand'] text-[#351000] flex flex-col min-h-screen selection:bg-[#6cf8bb]">
      {/* Fixed Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#fff8f6]/95 backdrop-blur-xl shadow-[0_4px_16px_rgba(133,83,0,0.06)] border-b border-[#ffd0bb]/40">
        <div className="h-20 max-w-xl mx-auto px-4 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div
            onClick={() => handleTabChange('mundos')}
            className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
          >
            <img
              alt="Palabritas Logo"
              className="h-8 w-auto object-contain"
              src={ASSETS.logo}
            />
            <span className="text-xl text-[#351000] font-bold tracking-tight hidden xs:inline">
              Palabritas
            </span>
            <span className="sr-only">Palabritas</span>
          </div>

          {/* Top Actions: Mobile/APK + Stars Counter + Parent Lock + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botón Probar en Celular / Instalar APK */}
            <button
              onClick={() => {
                playPop(480);
                triggerHaptic(15);
                setIsInstallModalOpen(true);
              }}
              title="Probar en el teléfono o instalar como APK"
              aria-label="Probar en Celular o APK"
              className="flex items-center gap-1 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#065f46] border border-[#6ee7b7] px-2.5 py-1.5 rounded-full shadow-[0_2px_0_0_#a7f3d0] active:translate-y-0.5 cursor-pointer transition-all font-black text-xs"
              type="button"
            >
              <span className="material-symbols-outlined text-[#059669] text-[18px]">smartphone</span>
              <span className="hidden xs:inline">Celular / APK</span>
            </button>

            {/* Stars Counter with bounce animation on reward */}
            <div
              onClick={() => {
                playSparkleChime();
                speakSpanish(`Tienes ${playerProgress.starsCount} estrellitas doradas.`);
              }}
              className="flex items-center gap-1.5 bg-[#ffe2d6] px-3 py-1.5 rounded-full shadow-[0_3px_0_0_#ffdbcc] active:translate-y-0.5 cursor-pointer border border-[#ffd0bb]"
            >
              <span className="material-symbols-outlined text-[#f59e0b] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-sm text-[#613b00] font-black">
                {playerProgress.starsCount}
              </span>
            </div>

            {/* Parental Control Gate Lock */}
            <button
              onClick={() => {
                playPop(420);
                triggerHaptic(15);
                setIsParentalGateOpen(true);
              }}
              aria-label="Control Parental"
              className="w-11 h-11 rounded-full bg-[#ffe2d6] flex items-center justify-center text-[#534434] hover:text-[#351000] shadow-[0_3px_0_0_#ffdbcc] active:translate-y-0.5 transition-transform cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </button>

            {/* Profile Avatar Chispita */}
            <div
              onClick={handleChispitaHeaderClick}
              className="p-0.5 rounded-full bg-[#6cf8bb] shadow-[0_3px_0_0_#4edea3] cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
                src={ASSETS.chispitaAvatar}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-22 pb-24 px-4 max-w-xl mx-auto">
        <ErrorBoundary onReset={() => handleTabChange('mundos')}>
          {activeTab === 'mundos' && (
            <MundosScreen
              onStartWordGame={handleStartWordGame}
              onOpenStory={() => handleTabChange('cuentos')}
              onOpenTracing={handleOpenTracing}
              onOpenWriting={handleOpenWriting}
              onOpenRewards={() => handleTabChange('premios')}
              onOpenPhonicsSession={() => setIsPhonicsSessionOpen(true)}
              completedWorlds={playerProgress.completedWorlds}
            />
          )}

          {activeTab === 'trazos' && (
            <TrazosScreen
              onBackToMap={() => handleTabChange('mundos')}
              onAddStars={handleAddStars}
              initialLetter={selectedLetter}
              initialFilter={letterFilter}
            />
          )}

          {activeTab === 'palabras' && (
            <PalabrasScreen
              onBackToMap={() => handleTabChange('mundos')}
              onOpenCelebration={() => setIsCelebrationModalOpen(true)}
              onAddStars={handleAddStars}
              initialSubTab={palabrasSubTab}
              initialLetterIndex={selectedLetterIndex}
              initialWritingLetter={selectedWritingLetter}
              initialFilter={letterFilter}
              currentWorldId={playerProgress.currentWorldId}
              onCompleteWorld={handleCompleteWorld}
            />
          )}

          {activeTab === 'cuentos' && (
            <CuentosScreen
              onBackToMap={() => handleTabChange('mundos')}
              onAddStars={handleAddStars}
            />
          )}

          {activeTab === 'premios' && (
            <PremiosScreen
              starsCount={playerProgress.starsCount}
              onAddStars={handleAddStars}
              onOpenCelebrationModal={() => setIsCelebrationModalOpen(true)}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Fixed Bottom Navigation Dock (5 Kid-Friendly Tactile Tabs) */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#fff1eb]/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(133,83,0,0.08)] border-t border-[#ffd0bb]/60">
        <div className="h-20 max-w-xl mx-auto px-2 flex items-center justify-around">
          {/* 1. Mundos */}
          <button
            onClick={() => handleTabChange('mundos')}
            aria-current={activeTab === 'mundos' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-[54px] min-h-[54px] transition-all cursor-pointer rounded-2xl ${
              activeTab === 'mundos'
                ? 'text-[#451a03] font-black scale-105 bg-amber-100/70 border border-amber-300 shadow-[0_3px_0_0_#d97706]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{
                color: activeTab === 'mundos' ? '#d97706' : undefined,
                fontVariationSettings: activeTab === 'mundos' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              explore
            </span>
            <span className="text-[11px] font-black">Mundos</span>
          </button>

          {/* 2. Trazos */}
          <button
            onClick={() => handleTabChange('trazos')}
            aria-current={activeTab === 'trazos' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-[54px] min-h-[54px] transition-all cursor-pointer rounded-2xl ${
              activeTab === 'trazos'
                ? 'text-[#064e3b] font-black scale-105 bg-emerald-100/70 border border-emerald-300 shadow-[0_3px_0_0_#059669]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{
                color: activeTab === 'trazos' ? '#059669' : undefined,
                fontVariationSettings: activeTab === 'trazos' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              draw
            </span>
            <span className="text-[11px] font-black">Trazos</span>
          </button>

          {/* 3. Palabras (Construye & Escribe) */}
          <button
            onClick={() => handleTabChange('palabras')}
            aria-current={activeTab === 'palabras' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-[54px] min-h-[54px] transition-all cursor-pointer rounded-2xl ${
              activeTab === 'palabras'
                ? 'text-[#0369a1] font-black scale-105 bg-sky-100/70 border border-sky-300 shadow-[0_3px_0_0_#0284c7]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{
                color: activeTab === 'palabras' ? '#0284c7' : undefined,
                fontVariationSettings: activeTab === 'palabras' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              extension
            </span>
            <span className="text-[11px] font-black">Palabras</span>
          </button>

          {/* 4. Cuentos */}
          <button
            onClick={() => handleTabChange('cuentos')}
            aria-current={activeTab === 'cuentos' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-[54px] min-h-[54px] transition-all cursor-pointer rounded-2xl ${
              activeTab === 'cuentos'
                ? 'text-[#7e22ce] font-black scale-105 bg-purple-100/70 border border-purple-300 shadow-[0_3px_0_0_#7c3aed]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{
                color: activeTab === 'cuentos' ? '#7c3aed' : undefined,
                fontVariationSettings: activeTab === 'cuentos' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              auto_stories
            </span>
            <span className="text-[11px] font-black">Cuentos</span>
          </button>

          {/* 5. Premios */}
          <button
            onClick={() => handleTabChange('premios')}
            aria-current={activeTab === 'premios' ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 min-w-[54px] min-h-[54px] transition-all cursor-pointer rounded-2xl ${
              activeTab === 'premios'
                ? 'text-[#c2410c] font-black scale-105 bg-orange-100/70 border border-orange-300 shadow-[0_3px_0_0_#ea580c]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
            type="button"
          >
            <span
              className="material-symbols-outlined text-[26px]"
              style={{
                color: activeTab === 'premios' ? '#ea580c' : undefined,
                fontVariationSettings: activeTab === 'premios' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              featured_seasonal_and_gifts
            </span>
            <span className="text-[11px] font-black">Premios</span>
          </button>
        </div>
      </nav>

      {/* Parental Gate Modal */}
      <ParentalGateModal
        isOpen={isParentalGateOpen}
        onClose={() => setIsParentalGateOpen(false)}
        onOpenPedagogicalReport={() => {
          setIsParentalGateOpen(false);
          setIsPedagogicalReportOpen(true);
        }}
        onOpenInstallModal={() => {
          setIsParentalGateOpen(false);
          setIsInstallModalOpen(true);
        }}
      />

      {/* Pedagogical Diagnosis Report Modal */}
      <PedagogicalReportModal
        isOpen={isPedagogicalReportOpen}
        onClose={() => setIsPedagogicalReportOpen(false)}
        onStartPhonicsSession={() => {
          setIsPedagogicalReportOpen(false);
          setIsPhonicsSessionOpen(true);
        }}
      />

      {/* Phonics Practice Session Capsule Modal */}
      <PhonicsSessionModal
        isOpen={isPhonicsSessionOpen}
        onClose={() => setIsPhonicsSessionOpen(false)}
        onSessionComplete={() => {
          setIsPhonicsSessionOpen(false);
          setIsCelebrationModalOpen(true);
        }}
        onAddStars={handleAddStars}
      />

      {/* Grand Celebration Chest Modal */}
      <CelebrationChestModal
        isOpen={isCelebrationModalOpen}
        onClose={() => setIsCelebrationModalOpen(false)}
        onGoToAlbum={() => {
          setIsCelebrationModalOpen(false);
          handleTabChange('premios');
        }}
        onAddStars={handleAddStars}
      />

      {/* Install on Mobile / APK Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}

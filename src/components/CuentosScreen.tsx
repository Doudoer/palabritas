import React, { useState } from 'react';
import { ALL_STORIES, DecodableStory } from '../data/cuentosData';
import { ASSETS } from '../data/appData';
import { playPop, playSparkleChime, speakSpanish, triggerHaptic } from '../utils/audio';

interface CuentosScreenProps {
  onBackToMap: () => void;
  onAddStars: (amount: number) => void;
  initialStoryId?: number;
}

export const CuentosScreen: React.FC<CuentosScreenProps> = ({
  onBackToMap,
  onAddStars,
  initialStoryId = 1,
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<number>(initialStoryId);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeWordClean, setActiveWordClean] = useState<string>('avión');
  const [activeSyllables, setActiveSyllables] = useState<string>('a - vión');
  const [isSelfPacedMode, setIsSelfPacedMode] = useState<boolean>(false);
  const [storyCategoryFilter, setStoryCategoryFilter] = useState<'todos' | 'mundos' | 'nuevos'>('todos');

  // Daily featured story (rotates daily between 1 and 40)
  const todayDayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dailyStoryId = (todayDayOfYear % ALL_STORIES.length) + 1;

  const currentStory: DecodableStory =
    ALL_STORIES.find(s => s.id === selectedStoryId) || ALL_STORIES[0];
  const currentPage = currentStory.pages[currentPageIndex] || currentStory.pages[0];

  const filteredStories = ALL_STORIES.filter(s => {
    if (storyCategoryFilter === 'mundos') return s.id <= 20;
    if (storyCategoryFilter === 'nuevos') return s.id > 20;
    return true;
  });

  const handleSelectStory = (storyId: number) => {
    playPop(480);
    triggerHaptic(15);
    setSelectedStoryId(storyId);
    setCurrentPageIndex(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    const chosen = ALL_STORIES.find(s => s.id === storyId) || ALL_STORIES[0];
    speakSpanish(`Cuento número ${chosen.id}: ${chosen.title}.`);
  };

  const handleWordClick = (display: string, syllables: string, clean: string) => {
    playPop(480);
    triggerHaptic(20);
    setActiveWordClean(clean);
    setActiveSyllables(syllables);
    speakSpanish(`${clean}... ${syllables.replace(/-/g, ' ')}... ${clean}`);
  };

  const handleRepeatSyllables = () => {
    playPop(520);
    triggerHaptic(15);
    speakSpanish(activeSyllables.replace(/-/g, ' '));
  };

  const handleToggleGlobalAudio = () => {
    playPop(440);
    triggerHaptic(20);

    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      // Read page aloud
      const fullText = currentPage.lines
        .map(l => l.words.map(w => w.display).join(' '))
        .join('. ');

      speakSpanish(fullText, () => {
        setIsPlayingAudio(false);
        playSparkleChime();
        onAddStars(5);
      });
    }
  };

  const handleNextPage = () => {
    playPop(480);
    triggerHaptic(20);
    if (currentPageIndex < currentStory.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      onAddStars(5);
      playSparkleChime();
    } else if (selectedStoryId < ALL_STORIES.length) {
      // Go to next story
      handleSelectStory(selectedStoryId + 1);
      onAddStars(10);
      playSparkleChime();
    }
  };

  const handlePrevPage = () => {
    playPop(380);
    triggerHaptic(15);
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const syllableChunks = activeSyllables.split(' - ');

  return (
    <div className="flex flex-col w-full pb-8 gap-y-3.5 select-none">
      {/* Top Header with Back Button */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          onClick={() => {
            playPop(380);
            triggerHaptic(15);
            onBackToMap();
          }}
          aria-label="Volver al mapa"
          className="w-12 h-12 rounded-2xl bg-[#ffe2d6] text-[#534434] flex items-center justify-center shadow-[0_4px_0_0_#ffdbcc] active:translate-y-1 active:shadow-[0_1px_0_0_#ffdbcc] transition-all cursor-pointer border border-[#ffd0bb]"
          type="button"
        >
          <span className="material-symbols-outlined text-[26px] text-[#855300]">arrow_back</span>
        </button>

        <div className="flex-1 bg-[#fff1eb] px-4 py-2 rounded-2xl border border-[#ffd0bb] flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#855300] uppercase tracking-wider">
                Biblioteca de 40 Cuentos
              </span>
              {currentStory.id === dailyStoryId && (
                <span className="text-[9px] font-black bg-[#f59e0b] text-[#613b00] px-1.5 py-0.5 rounded-full">
                  🌟 CUENTO DE HOY
                </span>
              )}
            </div>
            <span className="text-base text-[#351000] font-black leading-tight block">
              {currentStory.title}
            </span>
          </div>
          <span className="text-3xl">{currentStory.emoji}</span>
        </div>
      </div>

      {/* Featured Daily Story Banner */}
      <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-pink-100 p-3 rounded-2xl border-2 border-[#ffd0bb] flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center shadow-xs text-xl">
            📖
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-[#855300] uppercase">Lectura Diaria Recomendada</span>
            <p className="text-xs text-[#351000] font-bold">
              Cuento #{dailyStoryId}: <strong>{ALL_STORIES[dailyStoryId - 1]?.title}</strong>
            </p>
          </div>
        </div>
        {selectedStoryId !== dailyStoryId && (
          <button
            onClick={() => handleSelectStory(dailyStoryId)}
            type="button"
            className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#613b00] font-black text-xs rounded-xl shadow-[0_2px_0_0_#b45309] cursor-pointer"
          >
            Leer hoy
          </button>
        )}
      </div>

      {/* 40 Stories Selector with Categories */}
      <div className="bg-[#fff8f6] p-2.5 rounded-2xl border border-[#ffd0bb] shadow-sm flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <span className="text-xs font-bold text-[#855300] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Elige tu cuento (40 disponibles):
          </span>
          <div className="flex gap-1 text-[11px] font-bold">
            {[
              { id: 'todos', label: 'Todos (40)' },
              { id: 'mundos', label: '1 - 20' },
              { id: 'nuevos', label: '21 - 40 ✨' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStoryCategoryFilter(tab.id as typeof storyCategoryFilter)}
                type="button"
                className={`px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                  storyCategoryFilter === tab.id
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_2px_0_0_#d97706]'
                    : 'bg-white text-[#534434] hover:bg-[#ffeae1] border border-[#ffd0bb]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Carousel of Stories */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {filteredStories.map(story => {
            const isSelected = story.id === selectedStoryId;
            const isToday = story.id === dailyStoryId;
            return (
              <button
                key={story.id}
                onClick={() => handleSelectStory(story.id)}
                type="button"
                className={`flex flex-col items-center justify-center min-w-[62px] h-[66px] rounded-2xl font-bold text-xs shrink-0 cursor-pointer transition-all border-2 relative ${
                  isSelected
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_4px_0_0_#d97706] scale-105 border-[#d97706]'
                    : 'bg-white text-[#351000] shadow-xs border-[#ffd0bb] hover:bg-[#ffeae1]'
                }`}
                title={story.title}
              >
                {isToday && (
                  <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black shadow-xs">
                    ★
                  </span>
                )}
                <span className="text-base">{story.emoji}</span>
                <span className="text-[11px] font-black mt-0.5">C{story.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="flex items-center justify-between gap-2 bg-[#fff1eb] p-2.5 rounded-2xl border border-[#ffd0bb]">
        <button
          onClick={handleToggleGlobalAudio}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_2px_0_0_#d97706] animate-pulse'
              : 'bg-[#c9e6ff] text-[#001e2f] hover:bg-[#89ceff]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPlayingAudio ? 'stop_circle' : 'volume_up'}
          </span>
          <span>{isPlayingAudio ? 'Pausar audio' : 'Cuento con audio'}</span>
        </button>

        <button
          onClick={() => {
            playPop(380);
            setIsSelfPacedMode(!isSelfPacedMode);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs cursor-pointer border transition-colors ${
            isSelfPacedMode
              ? 'bg-[#6cf8bb] text-[#00714d] border-[#4edea3]'
              : 'bg-white text-[#534434] border-[#ffd0bb] hover:bg-[#ffe2d6]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">speed</span>
          <span>A mi ritmo</span>
        </button>
      </div>

      {/* Central Open Book Card */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-[0_8px_0_0_#ffd0bb] relative border-2 border-[#ffd0bb] flex flex-col gap-4">
        {/* Story Illustration Scene */}
        <div className="relative w-full h-44 rounded-2xl bg-gradient-to-tr from-amber-50 via-orange-50 to-emerald-50 flex flex-col items-center justify-center p-3 border border-[#ffd0bb] overflow-hidden">
          <span className="text-7xl filter drop-shadow-md animate-bounce">{currentStory.emoji}</span>
          <p className="text-xs text-[#855300] font-bold mt-2 text-center bg-white/80 px-3 py-1 rounded-full shadow-xs">
            {currentPage.illustrationDescription}
          </p>
          <div className="absolute top-2 right-2 bg-[#6cf8bb] text-[#00714d] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            {currentStory.worldName}
          </div>
        </div>

        {/* Text Lines with Interactive Tap-to-Read Words */}
        <div className="flex flex-col gap-3 py-1">
          {currentPage.lines.map((line, lIdx) => (
            <div key={lIdx} className="flex flex-wrap items-center gap-2 justify-center">
              {line.words.map((w, wIdx) => {
                const isSelected = activeWordClean.toLowerCase() === w.clean.toLowerCase();
                return (
                  <button
                    key={`${wIdx}-${w.clean}`}
                    onClick={() => handleWordClick(w.display, w.syllables, w.clean)}
                    type="button"
                    className={`text-2xl font-black px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706] scale-105'
                        : 'bg-[#fff8f6] text-[#351000] hover:bg-[#ffeae1] border border-[#ffd0bb]'
                    }`}
                  >
                    {w.display}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Syllable Karaoke Breakdown Pill Bar */}
        <div className="bg-[#fff1eb] rounded-2xl p-3 border border-[#ffd0bb] flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-[#855300] flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">hearing</span>
            Separación silábica de la palabra tocada:
          </span>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {syllableChunks.map((chunk, cIdx) => (
              <button
                key={cIdx}
                onClick={handleRepeatSyllables}
                type="button"
                className="px-4 py-2 rounded-2xl bg-white text-[#613b00] font-black text-lg border-2 border-[#ffd0bb] shadow-[0_3px_0_0_#ffd0bb] hover:bg-[#ffeae1] cursor-pointer active:scale-95 transition-transform"
              >
                {chunk}
              </button>
            ))}
          </div>

          <button
            onClick={handleRepeatSyllables}
            type="button"
            className="text-xs font-bold text-[#006591] hover:underline mt-0.5 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">volume_up</span>
            Escuchar /{activeSyllables}/
          </button>
        </div>

        {/* Chispita's Story Moral Message */}
        <div className="flex items-center gap-3 bg-[#e0f2fe] p-3 rounded-2xl border border-[#bae6fd]">
          <div className="w-10 h-10 rounded-full bg-[#38bdf8] flex items-center justify-center text-white shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
          </div>
          <p className="text-xs text-[#0369a1] font-bold leading-tight">
            Mensaje de Chispita: {currentStory.moral}
          </p>
        </div>

        {/* Bottom Pagination Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            type="button"
            className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all ${
              currentPageIndex === 0
                ? 'opacity-40 pointer-events-none bg-[#f3f4f6] text-[#9ca3af]'
                : 'bg-[#ffe2d6] text-[#534434] shadow-[0_3px_0_0_#ffd0bb] hover:bg-[#ffd0bb] cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Página anterior</span>
          </button>

          <span className="text-xs font-bold text-[#855300]">
            Pág. {currentPage.pageNumber} de {currentStory.pages.length}
          </span>

          <button
            onClick={handleNextPage}
            type="button"
            className="px-4 py-2 rounded-2xl bg-[#6cf8bb] hover:bg-[#4edea3] text-[#00714d] font-bold text-xs shadow-[0_3px_0_0_#4edea3] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
          >
            <span>{currentPageIndex < currentStory.pages.length - 1 ? 'Siguiente página' : '¡Siguiente cuento!'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

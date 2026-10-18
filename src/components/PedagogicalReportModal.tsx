import React, { useState } from 'react';
import { ASSETS } from '../data/appData';
import { playPop, speakSpanish, triggerHaptic } from '../utils/audio';

interface PedagogicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPhonicsSession: () => void;
}

export const PedagogicalReportModal: React.FC<PedagogicalReportModalProps> = ({
  isOpen,
  onClose,
  onStartPhonicsSession,
}) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'dominados' | 'refuerzo' | 'pendientes'>('todos');

  if (!isOpen) return null;

  const handlePlayPhoneme = (name: string, sound: string) => {
    playPop(520);
    triggerHaptic(20);
    speakSpanish(`Fonema ${name}. ${sound}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#351000]/60 backdrop-blur-sm flex justify-center p-3 select-none">
      <div className="w-full max-w-lg bg-[#fff8f6] rounded-3xl p-5 shadow-2xl relative my-auto flex flex-col border-4 border-[#ffd0bb] max-h-[96vh] overflow-y-auto">
        {/* Header and Back Link */}
        <section className="flex flex-col gap-2.5 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                playPop(380);
                triggerHaptic(15);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffe2d6] text-[#351000] text-xs font-bold shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 transition-transform cursor-pointer border border-[#ffd0bb]"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Volver a Ajustes</span>
            </button>
            <span className="px-3 py-1 rounded-full bg-[#6cf8bb] text-[#00714d] text-xs font-bold flex items-center gap-1 shadow-[0_2px_0_0_#4edea3]">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span>COPPA Seguro</span>
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl text-[#351000] font-black tracking-tight">Diagnóstico por Fonema</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#ffeae1] px-3 py-1 rounded-full text-[#351000] text-xs border border-[#ffd0bb]">
                <span className="material-symbols-outlined text-[#855300] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>face</span>
                <span className="font-bold">Mateo Benítez</span>
                <span className="text-[#534434]">• 6 años</span>
              </div>
              <span className="bg-[#c9e6ff] text-[#001e2f] text-xs px-2.5 py-1 rounded-full font-bold">
                Evaluación Continua
              </span>
            </div>
          </div>

          {/* Filtros de estado */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'todos', label: 'Todos (22)' },
              { id: 'dominados', label: 'Dominados (14)' },
              { id: 'refuerzo', label: 'En refuerzo (5)' },
              { id: 'pendientes', label: 'Pendientes (3)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  playPop(420);
                  setActiveFilter(tab.id as typeof activeFilter);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#f59e0b] text-[#613b00] shadow-[0_3px_0_0_#d97706]'
                    : 'bg-[#ffeae1] text-[#534434] shadow-[0_2px_0_0_#ffd0bb]'
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Observación Pedagógica de Chispita Fonoaudióloga */}
        <section className="bg-white rounded-3xl p-4 shadow-[0_4px_16px_rgba(133,83,0,0.06)] mb-4 border border-[#ffd0bb]">
          <div className="flex items-start gap-3 mb-2.5">
            <div className="w-14 h-14 rounded-2xl bg-[#ffe2d6] shrink-0 flex items-center justify-center shadow-[0_3px_0_0_#ffdbcc] overflow-hidden p-1 border border-[#ffd0bb]">
              <img
                className="w-full h-full object-contain"
                alt="Chispita Profesora"
                src={ASSETS.chispitaTeacher}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-[#855300]">
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                <span className="text-sm font-bold text-[#351000]">Observación Pedagógica</span>
              </div>
              <span className="text-xs text-[#534434]">Análisis asistido fonoaudiológico</span>
            </div>
          </div>

          <div className="bg-[#fff1eb] rounded-2xl p-3 text-xs text-[#351000] leading-relaxed border border-[#ffd0bb] mb-3">
            <p>
              Mateo muestra <span className="font-bold text-[#006c49]">excelente discriminación auditiva y síntesis silábica</span> en fonemas oclusivos y bilabiales (<span className="font-bold">/m/</span>, <span className="font-bold">/p/</span>). Se sugiere refuerzo en el punto de articulación lingual y trazo guiado de fonemas alveolares (<span className="font-bold text-[#855300]">/r/</span>, <span className="font-bold text-[#855300]">/s/</span>).
            </p>
          </div>

          <button
            onClick={() => {
              playPop(480);
              speakSpanish('Generando informe pedagógico para descargar.');
            }}
            className="w-full py-2.5 px-4 rounded-full bg-[#ffe2d6] text-[#351000] text-xs font-bold shadow-[0_3px_0_0_#ffd0bb] active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer border border-[#ffd0bb]"
            type="button"
          >
            <span className="material-symbols-outlined text-[#855300] text-[18px]">picture_as_pdf</span>
            <span>Descargar informe PDF para la escuela</span>
          </button>
        </section>

        {/* 3. Fonema Destacado en Análisis Profundo (/M/) */}
        <section className="bg-[#fff1eb] rounded-3xl p-4 shadow-[0_4px_14px_rgba(133,83,0,0.06)] mb-4 flex flex-col gap-3 border border-[#ffd0bb]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#6cf8bb] text-[#00714d] text-xs font-bold">
                Fonema Seleccionado
              </span>
              <span className="text-xs text-[#006c49] font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Dominado (94%)
              </span>
            </div>
            <span className="text-xs text-[#534434] font-medium">Grupo Bilabial</span>
          </div>

          {/* Bloque interactivo del fonema M con audio */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-xs border border-[#ffd0bb]">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#351000] tracking-wide">M m</span>
              <span className="text-base text-[#534434] font-bold">/mmm/</span>
            </div>
            <button
              onClick={() => handlePlayPhoneme('M', '/mmm/')}
              aria-label="Escuchar fonema M"
              className="w-12 h-12 rounded-full bg-[#42bbff] text-white flex items-center justify-center shadow-[0_4px_0_0_#006591] active:translate-y-0.5 transition-transform cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
            </button>
          </div>

          {/* 3 Dimensiones Clave */}
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold text-[#351000] uppercase tracking-wider">Dimensiones del Dominio</h2>

            <div className="bg-white p-2.5 rounded-xl flex flex-col gap-1 border border-[#ffd0bb]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#351000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006c49] text-[16px]">hearing</span>
                  Discriminación Auditiva
                </span>
                <span className="font-bold text-[#006c49]">96%</span>
              </div>
              <div className="w-full bg-[#ffe2d6] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#006c49] h-full rounded-full" style={{ width: '96%' }}></div>
              </div>
              <span className="text-[10px] text-[#534434]">Excelente asociación gráfica-sonido y reconocimiento inicial.</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl flex flex-col gap-1 border border-[#ffd0bb]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#351000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#f59e0b] text-[16px]">edit</span>
                  Precisión de Trazo Motor
                </span>
                <span className="font-bold text-[#855300]">92%</span>
              </div>
              <div className="w-full bg-[#ffe2d6] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#f59e0b] h-full rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-[10px] text-[#534434]">Trazos rectos firmes y secuencia direccional (1 al 4) respetada.</span>
            </div>

            <div className="bg-white p-2.5 rounded-xl flex flex-col gap-1 border border-[#ffd0bb]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#351000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#006591] text-[16px]">menu_book</span>
                  Síntesis Silábica / Lectura
                </span>
                <span className="font-bold text-[#006591]">88%</span>
              </div>
              <div className="w-full bg-[#ffe2d6] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#42bbff] h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
              <span className="text-[10px] text-[#534434]">Fusión rápida con vocales: ma, me, mi, mo, mu.</span>
            </div>
          </div>

          {/* Palabras integradas */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-xs font-bold text-[#351000]">Palabras integradas exitosamente:</span>
            <div className="flex flex-wrap gap-2">
              {['Mesa', 'Masa', 'Mamá', 'Mimo'].map(w => (
                <div key={w} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#6cf8bb] text-[#00714d] text-xs font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Matriz Integral de Fonemas */}
        <section className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base text-[#351000] font-bold">Matriz Integral de Fonemas</h2>
            <span className="text-xs text-[#534434]">Currículo Preescolar/1º</span>
          </div>

          {/* Vocales */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#351000]">Vocales Fundacionales (5/5)</span>
              <span className="text-xs text-[#006c49] font-bold">100% Dominadas</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'A a', letter: 'A', sound: '/a/' },
                { label: 'E e', letter: 'E', sound: '/e/' },
                { label: 'I i', letter: 'I', sound: '/i/' },
                { label: 'O o', letter: 'O', sound: '/o/' },
                { label: 'U u', letter: 'U', sound: '/u/' },
              ].map(v => (
                <button
                  key={v.label}
                  onClick={() => handlePlayPhoneme(v.letter, v.sound)}
                  type="button"
                  className="bg-white p-2 rounded-2xl shadow-xs text-center border border-[#ffd0bb] hover:bg-[#ffeae1] active:scale-95 transition-all cursor-pointer"
                  title={`Escuchar fonema ${v.label}`}
                >
                  <span className="text-sm font-bold text-[#351000] block">{v.label}</span>
                  <span className="material-symbols-outlined text-[#f59e0b] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-[10px] font-bold text-[#006c49] block">100%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Consonantes */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#ffb95f] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-bold text-[#351000]">M m</span>
                  <p className="text-xs text-[#534434]">/m/</p>
                </div>
                <span className="text-[10px] font-bold bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full">Dominado</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-[#006c49]">94%</span>
                <button
                  onClick={() => handlePlayPhoneme('M', '/mmm/')}
                  className="w-7 h-7 rounded-full bg-[#ffe2d6] text-[#351000] flex items-center justify-center cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#ffd0bb] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-bold text-[#351000]">P p</span>
                  <p className="text-xs text-[#534434]">/p/</p>
                </div>
                <span className="text-[10px] font-bold bg-[#6cf8bb] text-[#00714d] px-2 py-0.5 rounded-full">Dominado</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-[#006c49]">90%</span>
                <button
                  onClick={() => handlePlayPhoneme('P', '/p/')}
                  className="w-7 h-7 rounded-full bg-[#ffe2d6] text-[#351000] flex items-center justify-center cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#ffd0bb] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-bold text-[#351000]">S s</span>
                  <p className="text-xs text-[#534434]">/sss/</p>
                </div>
                <span className="text-[10px] font-bold bg-[#ffddb8] text-[#855300] px-2 py-0.5 rounded-full">En práctica</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-[#855300]">78%</span>
                <button
                  onClick={() => handlePlayPhoneme('S', '/sss/')}
                  className="w-7 h-7 rounded-full bg-[#ffe2d6] text-[#351000] flex items-center justify-center cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#ffdad6] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-lg font-bold text-[#ba1a1a]">R r</span>
                  <p className="text-xs text-[#534434]">/r/ simple</p>
                </div>
                <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full">Atención</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm font-bold text-[#ba1a1a]">32%</span>
                <button
                  onClick={() => handlePlayPhoneme('R', '/rrr/')}
                  className="w-7 h-7 rounded-full bg-[#ffe2d6] text-[#351000] flex items-center justify-center cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">volume_up</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Giant CTA Button to Launch Practice Capsule */}
        <section className="flex flex-col gap-3">
          <button
            onClick={() => {
              playPop(480);
              triggerHaptic([30, 40]);
              onStartPhonicsSession();
            }}
            className="w-full py-4 px-5 rounded-2xl bg-[#f59e0b] hover:bg-amber-500 text-[#613b00] text-lg font-black shadow-[0_6px_0_0_#d97706] active:translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer border-2 border-[#d97706]"
            type="button"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <span>Crear sesión de práctica: /S/ y /R/</span>
          </button>

          {/* Guía de apoyo para el hogar (Sin pantallas) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col gap-2.5 border border-[#ffd0bb]">
            <div className="flex items-center gap-2 text-[#855300]">
              <span className="material-symbols-outlined text-[20px]">home</span>
              <h3 className="text-sm font-bold text-[#351000]">Apoyo en Casa (Sin Pantallas)</h3>
            </div>
            <p className="text-xs text-[#534434]">
              Actividades de 5 minutos recomendadas para favorecer la motricidad oral y conciencia fonológica:
            </p>

            <div className="bg-[#fff1eb] p-3 rounded-2xl flex items-start gap-2.5 border border-[#ffd0bb]">
              <div className="w-7 h-7 rounded-full bg-[#6cf8bb] text-[#00714d] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="flex flex-col text-xs text-[#534434]">
                <span className="font-bold text-[#351000]">El juego de la serpiente (/S/)</span>
                <span>Jueguen a susurrar como serpientes mientras caminan sigilosamente. Practicar juntar los dientes superiores e inferiores dejando escapar el aire suavemente.</span>
              </div>
            </div>

            <div className="bg-[#fff1eb] p-3 rounded-2xl flex items-start gap-2.5 border border-[#ffd0bb]">
              <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-[#613b00] flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="flex flex-col text-xs text-[#534434]">
                <span className="font-bold text-[#351000]">Vibración de labios y motos (/R/)</span>
                <span>Imiten el sonido de un motor de coche o avión ("brrr - rrr"). Ayuda a tonificar el ápice de la lengua y los músculos orofaciales antes de la hora de dormir.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

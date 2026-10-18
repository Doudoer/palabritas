import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { playPop, playSparkleChime, triggerHaptic, speakSpanish } from '../utils/audio';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ios'>(isIOS ? 'ios' : 'pwa');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [isPublicUrlDifferent, setIsPublicUrlDifferent] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawUrl = window.location.href;
      // Convert development URL (ais-dev-...) to public shared URL (ais-pre-...)
      // ais-dev- requires Google IAM authentication (DouglasVillalobos4@gmail.com),
      // while ais-pre- is 100% public and opens on ANY phone, tablet or browser without any Gmail account!
      let targetUrl = rawUrl;
      if (rawUrl.includes('ais-dev-')) {
        targetUrl = rawUrl.replace('ais-dev-', 'ais-pre-');
        setIsPublicUrlDifferent(true);
      }
      setPublicUrl(targetUrl);

      QRCode.toDataURL(targetUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#351000',
          light: '#ffffff',
        },
      })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      playSparkleChime();
      triggerHaptic(20);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    playPop(500);
    triggerHaptic(25);
    const text = encodeURIComponent(
      `¡Hola! Abre e instala Palabritas en tu teléfono (no pide correo ni cuenta Gmail): ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyCommands = () => {
    const commands = `npm run build\nnpx cap add android\nnpx cap open android`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(commands);
      setCopiedCommands(true);
      playSparkleChime();
      triggerHaptic(20);
      setTimeout(() => setCopiedCommands(false), 2500);
    }
  };

  const handleInstallClick = async () => {
    playPop(520);
    triggerHaptic(30);
    const success = await install();
    if (success) {
      speakSpanish('¡Instalando Palabritas en tu teléfono!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#fff8f6] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-3 border-[#ffd0bb] shadow-2xl p-5 sm:p-6 text-[#351000] relative animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => {
            playPop(400);
            onClose();
          }}
          type="button"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#ffe2d6] hover:bg-[#ffd0bb] flex items-center justify-center text-[#534434] transition-all cursor-pointer shadow-xs active:scale-95"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ff7e5f] to-[#fbc02d] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/icon.svg"
              alt="Palabritas Icon"
              className="w-full h-full rounded-[14px] object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#351000] tracking-tight">
                Probar en el Teléfono
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#6cf8bb] text-[#005230] px-2 py-0.5 rounded-full shadow-2xs">
                Móvil & APK
              </span>
            </div>
            <p className="text-xs font-semibold text-[#855300] mt-0.5">
              Ideal para que la niña dibuje con su dedito en la pantalla táctil
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-[#ffe2d6]/70 p-1 mb-5 gap-1 border border-[#ffd0bb]">
          <button
            type="button"
            onClick={() => {
              playPop(480);
              setActiveTab('pwa');
            }}
            className={`flex-1 py-2 px-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-white text-[#f59e0b] shadow-xs scale-[1.02]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span>WebAPK / Celular</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playPop(480);
              setActiveTab('apk');
            }}
            className={`flex-1 py-2 px-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white text-[#f59e0b] shadow-xs scale-[1.02]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">android</span>
            <span>Generar .APK</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playPop(480);
              setActiveTab('ios');
            }}
            className={`flex-1 py-2 px-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-white text-[#f59e0b] shadow-xs scale-[1.02]'
                : 'text-[#613b00] hover:text-[#351000]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">phone_iphone</span>
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* TAB 1: PWA / WebAPK (Fastest & Native on Android) */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Public Access Status Banner */}
            <div className="bg-[#ecfdf5] border-2 border-[#10b981] rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-[#10b981] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">public</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-[#065f46] uppercase tracking-wider">
                    Acceso Público Activado
                  </span>
                  <span className="text-[10px] font-bold bg-[#047857] text-white px-2 py-0.5 rounded-full">
                    Sin Cuenta Gmail
                  </span>
                </div>
                <p className="text-xs text-[#047857] mt-1 leading-snug font-medium">
                  Este enlace y código QR son <strong>100% públicos</strong>. Puedes abrirlos en cualquier teléfono o tableta ajena sin que pida tu correo electrónico ni contraseña de Google.
                </p>
              </div>
            </div>

            {/* Direct Install Button if supported on current browser */}
            {isInstallable && (
              <div className="bg-[#fff7ed] border-2 border-[#f59e0b] rounded-2xl p-4 text-center shadow-xs">
                <span className="text-xs font-black text-[#b45309] uppercase tracking-wide block mb-1">
                  ⭐ Instalación Directa Detectada
                </span>
                <p className="text-xs text-[#9a3412] font-semibold mb-3">
                  Tu navegador actual permite instalar Palabritas como app independiente en 1 clic:
                </p>
                <button
                  onClick={handleInstallClick}
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black text-sm shadow-[0_4px_0_0_#047857] hover:brightness-105 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span>Instalar Palabritas en este Dispositivo</span>
                </button>
              </div>
            )}

            {/* QR Code and Share Section */}
            <div className="bg-white rounded-2xl p-4 border-2 border-[#ffd0bb] flex flex-col sm:flex-row items-center gap-4 shadow-xs">
              {qrCodeUrl ? (
                <div className="bg-white p-2 rounded-xl border border-gray-200 shrink-0 shadow-2xs text-center">
                  <img
                    src={qrCodeUrl}
                    alt="Código QR Público"
                    className="w-36 h-36 object-contain mx-auto"
                  />
                  <span className="text-[10px] text-[#059669] font-bold block mt-1 flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">lock_open</span>
                    QR Público (Cualquier cel)
                  </span>
                </div>
              ) : (
                <div className="w-36 h-36 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
                  Cargando QR...
                </div>
              )}

              <div className="flex-1 text-center sm:text-left space-y-2.5 w-full min-w-0">
                <div>
                  <h3 className="text-sm font-bold text-[#351000] flex items-center justify-center sm:justify-start gap-1">
                    <span className="material-symbols-outlined text-[#f59e0b] text-[18px]">center_focus_weak</span>
                    Escanea con la cámara de cualquier celular
                  </h3>
                  <p className="text-xs text-[#613b00] leading-relaxed mt-0.5">
                    Abre la cámara en el otro teléfono y enfoca este código. Se abrirá de inmediato sin solicitar inicio de sesión.
                  </p>
                </div>

                {/* Public Link Box */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#855300] uppercase tracking-wider block">
                    Enlace WebAPK Público:
                  </label>
                  <div className="flex items-center gap-1.5 bg-[#fdf2ec] border border-[#ffd0bb] rounded-xl p-1.5">
                    <input
                      type="text"
                      readOnly
                      value={publicUrl}
                      className="bg-transparent text-[11px] font-mono text-[#534434] flex-1 outline-none px-1 select-all truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs"
                      title="Copiar enlace"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedLink ? 'done' : 'content_copy'}
                      </span>
                      <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Share Buttons */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    <span>Enviar por WhatsApp</span>
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ffe2d6] hover:bg-[#ffd0bb] text-[#613b00] text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                    <span>Abrir en nueva pestaña</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Android Chrome Instructions (WebAPK Official) */}
            <div className="bg-[#fff1eb] rounded-2xl p-4 border border-[#ffd0bb] space-y-2">
              <h4 className="text-xs font-black text-[#855300] uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">verified</span>
                Cómo convertir a App Nativa en Android (Chrome / Samsung)
              </h4>
              <ol className="text-xs text-[#534434] space-y-1.5 list-decimal list-inside font-semibold">
                <li>Abre el enlace en el navegador <strong>Google Chrome</strong> del teléfono.</li>
                <li>Toca el menú de <strong>tres puntos (⋮)</strong> en la esquina superior derecha.</li>
                <li>Presiona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
              </ol>
              <div className="mt-2 text-[11px] text-[#047857] bg-[#ecfdf5] p-2.5 rounded-xl border border-[#a7f3d0] font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0">check_circle</span>
                <span>
                  Android compilará automáticamente un <strong>WebAPK oficial</strong> con el icono de Palabritas, sin barras de navegación y con pantalla completa.
                </span>
              </div>
            </div>

            {/* Note about private vs public URL */}
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-[11px] text-[#855300] space-y-1">
              <div className="font-bold flex items-center gap-1 text-[#b45309]">
                <span className="material-symbols-outlined text-[15px]">help</span>
                ¿Por qué antes te pedía cuenta de Gmail?
              </div>
              <p className="leading-snug">
                El enlace de desarrollo con prefijo <code>ais-dev-</code> está protegido por Google Cloud y solo permite entrar a la cuenta creadora. Este enlace público con prefijo <code>ais-pre-</code> no tiene ninguna restricción y funciona en cualquier teléfono del mundo.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: Capacitor Native APK Instructions */}
        {activeTab === 'apk' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 border-2 border-[#ffd0bb] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#dcfce7] text-[#16a34a] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">build</span>
                </span>
                <h3 className="text-sm font-bold text-[#351000]">
                  Compilar archivo .APK físico con Capacitor
                </h3>
              </div>
              <p className="text-xs text-[#534434] leading-relaxed">
                Ya dejamos el proyecto 100% pre-configurado con <code>capacitor.config.json</code> (ID: <code>com.palabritas.app</code>) y las bibliotecas instaladas.
              </p>

              {/* Terminal Snippet */}
              <div className="bg-[#1e1e24] text-[#a7f3d0] p-3 rounded-xl font-mono text-xs relative group overflow-x-auto shadow-inner">
                <div className="text-gray-400 text-[10px] select-none mb-1">// Ejecuta en tu terminal:</div>
                <div>npm run build</div>
                <div>npx cap add android</div>
                <div>npx cap open android</div>
                <button
                  type="button"
                  onClick={handleCopyCommands}
                  className="absolute top-2 right-2 px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-[10px] font-sans font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    {copiedCommands ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedCommands ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Steps in Android Studio */}
              <div className="space-y-1.5 text-xs text-[#613b00]">
                <div className="font-bold text-[#351000]">Paso final en Android Studio:</div>
                <div className="bg-[#fff8f6] p-2.5 rounded-xl border border-[#ffd0bb] space-y-1 text-[11px]">
                  <div>1. Al abrirse Android Studio, espera a que sincronice Gradle.</div>
                  <div>2. En el menú superior ve a: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</div>
                  <div>3. ¡Listo! Obtendrás el archivo <code>app-debug.apk</code> que puedes pasar por WhatsApp, Telegram o USB a tu celular.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: iOS / Safari Guide */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 border-2 border-[#ffd0bb] shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">ios_share</span>
                </span>
                <h3 className="text-sm font-bold text-[#351000]">
                  Instalar en iPhone o iPad (Safari)
                </h3>
              </div>
              <p className="text-xs text-[#534434] leading-relaxed">
                En dispositivos Apple, la aplicación se instala a pantalla completa directamente desde Safari sin App Store:
              </p>

              <div className="space-y-2 text-xs font-semibold text-[#534434]">
                <div className="flex items-start gap-2.5 bg-[#f8fafc] p-2.5 rounded-xl border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Abre este enlace en el navegador <strong>Safari</strong> de tu iPhone/iPad.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-[#f8fafc] p-2.5 rounded-xl border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba <span className="text-[#3b82f6]">⎋</span>) en la barra inferior.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-[#f8fafc] p-2.5 rounded-xl border border-gray-200">
                  <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Desliza hacia abajo y presiona <strong>"Agregar al inicio" (Add to Home Screen)</strong>.</span>
                </div>
              </div>

              {/* Quick Actions in iOS */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copiedLink ? 'done' : 'content_copy'}
                  </span>
                  <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace Público'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25d366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-[15px]">send</span>
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Features Highlight */}
        <div className="mt-5 pt-3 border-t border-[#ffd0bb]/60 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#fff8f6] border border-[#ffd0bb]/60">
            <span className="material-symbols-outlined text-[#f59e0b] text-[20px] block mb-0.5">touch_app</span>
            <span className="text-[10px] font-black text-[#613b00] block">Trazo Táctil</span>
            <span className="text-[9px] text-gray-500">Con dedo o stylus</span>
          </div>
          <div className="p-2 rounded-xl bg-[#fff8f6] border border-[#ffd0bb]/60">
            <span className="material-symbols-outlined text-[#10b981] text-[20px] block mb-0.5">volume_up</span>
            <span className="text-[10px] font-black text-[#613b00] block">Voz Fonética</span>
            <span className="text-[9px] text-gray-500">Español nativo</span>
          </div>
          <div className="p-2 rounded-xl bg-[#fff8f6] border border-[#ffd0bb]/60">
            <span className="material-symbols-outlined text-[#3b82f6] text-[20px] block mb-0.5">fullscreen</span>
            <span className="text-[10px] font-black text-[#613b00] block">Sin Distracciones</span>
            <span className="text-[9px] text-gray-500">Pantalla completa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

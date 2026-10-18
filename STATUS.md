# 📋 Palabritas - Registro de Estado y Checkpoints (STATUS)

> **Documento Vivo de Estado, Arquitectura, Pruebas y Despliegues Continuos.**  
> **Última Actualización:** 18 de Octubre, 2026 (17:25 UTC-4)  
> **Repositorio Oficial:** [https://github.com/Doudoer/palabritas](https://github.com/Doudoer/palabritas)  
> **Servidor en Producción:** `http://167.235.21.59` (Nginx 1.27.5 en Docker)

---

## 📌 Checkpoint Actual: `v0.1.15 - Solución Robusta del Armario Mágico en APK Android (Portal Directo a Body, Altura Garantizada y Compilación APK)`
- **Hash de Commit:** Pendiente de commit y push a `origin/main` (auto-desplegado en VPS `167.235.21.59`)
- **Estado General:** ✅ 100% Funcional y Verificado en Simulación Móvil Android (462x1024).
  1. **Diagnóstico y Corrección del Armario como Línea Horizontal de 8px en APK (`AvatarRoomView.tsx`):**
     - **Causa raíz:** En el WebView de Android, un contenedor flex con `max-height` (sin `height` explícito ni `min-height`) que contenía un hijo `flex-1` (`flex: 1 1 0%`) con `overflow-y-auto` y `overflow-hidden` en el padre colapsaba su altura intrínseca a 0px. Como tenía `border-4 border-[#ffddb8]` (4px arriba + 4px abajo), se convertía en una línea horizontal exacta de 8px en el centro de la pantalla, recortando todo el contenido interno.
     - **Corrección:**
       - **Renderizado con `createPortal(..., document.body)`:** Monta el diálogo directamente sobre el `<body>`, aislándolo de cualquier contenedor padre con `overflow-x-hidden` o contextos de apilamiento restrictivos.
       - **Dimensiones Explícitas y Seguras:** `h-[86vh] sm:h-[84vh] min-h-[460px] max-h-[780px] w-full max-w-lg`.
       - **Aislamiento Flexbox:** Se añadieron `shrink-0` a la cabecera, pestañas principales, chips de categorías y pie, junto con `flex-1 min-h-0 overflow-y-auto` al área del catálogo.
       - **Posicionamiento amigable para pantallas pequeñas:** `overflow-y-auto` en el fondo y `my-auto` en la ventana modal.
  2. **Configuración de WebView Android y Desactivación de Caché Estancada (`MainActivity.kt`):**
     - Se añadió `settings.cacheMode = WebSettings.LOAD_NO_CACHE` y `clearCache(true)` para que la APK siempre consulte los assets más recientes desplegados en el servidor sin atrapar versiones previas.
  3. **Recompilación del Binario APK (`palabritas.apk`):**
     - Compilado exitosamente con Gradle 9.5.0 (`./gradlew assembleDebug`), generando el binario actualizado `palabritas.apk` en la raíz del proyecto.
  4. **Verificación Automatizada en Emulador Móvil Android:**
     - Simulación en Puppeteer móvil (`462x1024`, User Agent de Android 14) verificando que el modal mide exactamente `780px` de altura, mostrando cabecera, pestañas `Mi Niña` (34), `Mi Habitación` (41), filtros de categoría, catálogo completo y botón de cierre (`sim_local_armario_fixed.png`).

---

## 📌 Checkpoint Anterior: `v0.1.14 - Corrección Completa de Mi Habitación, Armario Mágico y Minijuegos en Móvil y APK`
- **Hash de Commit:** `bc925d9` (Sincronizado con GitHub `origin/main` y auto-desplegado en VPS `167.235.21.59`)
- **Estado General:** ✅ 100% Funcional y Verificado con Simulación Móvil en Google Chrome.
  1. **Solución del Avatar Cortado en Pantallas Móviles (`AvatarRoomView.tsx`):**
     - **Causa raíz:** El avatar y los muebles estaban anidados dentro del contenedor del suelo (`floorRef`) que tenía `h-[38%]` y `overflow-hidden`. En pantallas móviles (donde el stage medía ~290px), el suelo medía solo ~110px de alto, cortando los 60px superiores del avatar (ojos, frente, coletas y bocadillos).
     - **Corrección:** Se desacopló el suelo para que solo contenga su patrón de madera y la onda expansiva del tap, cerrando su div con `overflow-hidden` de forma aislada. La habitación ahora tiene altura mínima garantizada (`min-h-[460px] h-[460px] sm:h-[500px]`), y el avatar y muebles son hijos directos del stage con z-index escalonado (`z-15` a `z-30`). El avatar es 100% visible de pies a cabeza con amplio espacio para sus bocadillos de diálogo.
  2. **Solución de "Mi Armario" que no abría / se quedaba fuera de pantalla:**
     - **Causa raíz:** El modal del armario usaba `items-end` con animación `slide-in-from-bottom` de Tailwind (que no existía en el bundle de producción sin plugin) y `z-50`, provocando que en WebView móvil quedara empujado debajo del borde inferior de la pantalla o tapado por el dock de navegación.
     - **Corrección:** Se reestructuró como un modal centrado con `fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4`, animación CSS suave `modalPop`, botones táctiles de cierre destacados (`✕` en cabecera y `Cerrar` en pie), cierre al tocar el fondo, y pestañas predeterminadas a `👗 Mi Niña` al abrir el armario y `🏠 Mi Habitación` al tocar un slot de mueble.
  3. **Solución del Minijuego de Rasca y Gana en Dispositivos Táctiles (`PremiosScreen.tsx`):**
     - **Causa raíz:** En pantallas táctiles, el arrastre del dedo provocaba el scroll vertical de la página cancelando el rascado del canvas.
     - **Corrección:** Se añadió `if (e.cancelable) e.preventDefault();` en `onTouchStart` y `handleScratchMove`, junto con `touch-none` en el canvas.
  4. **Simulación y Pruebas Automatizadas:**
     - 531 pruebas lógicas y de ortografía pasando al 100% (`bun scripts/test-game-logic.ts`).
     - Script de simulación automatizada en Chrome móvil (`scripts/simulate-avatar-room.cjs`) ejecutando todo el flujo: caminar en el cuarto, celebrar, hablar, abrir armario, cambiar pestaña a habitación, equipar cama nube, cerrar armario y rascar lámina secreta con 5 capturas generadas.
     - `bun run build` y contenedor Docker `palabritas-app` actualizado y probado.
- **Hash de Commit:** `dc291cf` (Sincronizado con GitHub `origin/main` y auto-desplegado en VPS `167.235.21.59`)
- **Estado General:** ✅ Producción Lista. Integración de los requerimientos visuales e interactivos solicitados por el usuario:
  1. **Nuevo Logo 3D Oficial en Web, PWA y APK Android:**
     - Extracción sin distorsión del logo del libro 3D de *Palabritas* con portada brillante, destellos y burbujas.
     - Generación de todos los tamaños PWA y web: `pwa-512x512.png`, `pwa-maskable-512x512.png`, `pwa-192x192.png`, `apple-touch-icon.png`, `favicon.ico`, `favicon.png`, `icon.svg` y `logo-app.png`.
     - Integración del logo en la cabecera principal de la aplicación (`src/App.tsx` y `src/data/appData.ts`).
     - Actualización completa de todos los iconos de Android Studio y del paquete binario `palabritas.apk` (`res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}-v4/ic_launcher.webp` e `ic_launcher_round.webp`).
  2. **Avatar Niña Expresiva y Adorable ("Pequeña Campeona"):**
     - Configuración por defecto adaptada a niña con peinado de **coletas** con lazos rosados (`hairStyle: 'coletas'`), ojos dulces con pestañitas expresivas (`pestañitas`), mejillas sonrosadas con rubor (`blush`) y vestido infantil festivo (`outfit-vestido`).
     - Ampliación del catálogo con peinados (trencitas, moñitos, melena, rizado), trajes (vestidito con vuelos, jardinera con lazo, traje de hada con alitas, tutú de bailarina, pijama de conejito) y accesorios para el pelo (lazo gigante, flor primaveral).
  3. **Habitación Totalmente Interactiva con Muebles y Accesorios:**
     - **Caminar por la habitación:** Al tocar cualquier punto del suelo, la niña camina de forma fluida hacia la coordenada indicada, orientándose en la dirección correcta (`avatarFacing`), con animación de onda expansiva en el suelo (`floorTapRipple`).
     - **Cama interactiva (Dormir y Despertar):** Al tocar la cama, la niña se acuesta, se activa el estado `avatarAction = 'sleeping'`, aparecen burbujas animadas de sueño `Zzz 💤`, y se reproduce un arrullo con voz cariñosa. Al tocarla de nuevo o tocar el piso, se levanta contenta.
     - **Escritorio y Lámpara Mágica:** Al tocar la mesa, se enciende el halo de luz cálida de la lámpara (`isDeskLampOn`) y se abre un libro de cuentos con letras mágicas flotantes (`isMagicBookOpen`).
     - **Alfombra y Baile:** Al tocar la alfombra, la niña salta de alegría y baila (`avatarAction = 'dancing'`) con notas musicales de celebración.
     - **Mascota Afectuosa:** Al tocar la mascota en su cojín, salta dando una pirueta con corazones y la niña le hace mimos (`avatarAction = 'petting'`).
     - **Botón "Mi Armario":** Despliega el cajón del ropero para vestirse y personalizarse fácilmente.
     - **Radio Musical Infantil:** Permite encender música alegre con notas musicales flotantes al tocarla.
- **Pruebas Automatizadas:** 531 pruebas lógicas y de ortografía (0 fallos) + `tsc --noEmit` limpio + Vite build exitoso + Contenedor Docker `palabritas-app` activo y respondiendo HTTP 200 OK en `http://localhost:3000`.

---

## 📌 Checkpoint Anterior: `v0.1.12 - Sistema de Recompensas Avatar World (Habitación Interactiva Mágica, Avatar Animado y Recompensas por Misiones de Aprendizaje)`
- **Hash de Commit:** `821d67f` (Sincronizado con GitHub `origin/main` y desplegado en VPS `167.235.21.59`)
- **Estado General:** ✅ Producción Lista. Se transformó integralmente el sistema de recompensas en un espacio inmersivo tipo **Avatar World / Toca Life** especialmente adaptado a la pedagogía de *Palabritas* para niños de 5 a 7 años:
  1. **Habitación Inicial Vacía ("Mi Habitación Mágica"):**
     - El infante comienza con una habitación espaciosa y acogedora sin amueblar (paredes crema y suelo de parquet limpios, sin cama, sin escritorio, sin alfombra, sin cuadros y sin mascotas).
     - Cada rastro de mueble muestra un slot interactivo punteado (`🛏️ + Cama`, `🎨 + Mesa`, `✨ + Alfombra`, `🐾 + Mascota`, `🖼️ + Cuadro`). Al tocar un slot vacío, se despliega directamente el catálogo en esa categoría.
  2. **Avatar Animado Chibi Interactivo:**
     - Personaje en SVG detallado con micro-animaciones procedimentales: respiración natural continua (`anim-breathe`), parpadeo de ojos expresivo (`anim-blink`), y saltos de alegría festivos con confeti y corazones (`cheerJump`).
     - **Personalización Completa:** Tonos de piel infantiles, estilos de cabello (corto aventurero, coletas, rizado, flequillo, cresta, gorrito), colores de pelo (chocolate, dorado, azabache, fuego, rosa, galaxia), expresiones (feliz, guiño pícaro, sorpresa mágica, pequeño genio con gafas, corazoncito dulce), ropitas temáticas, accesorios para la cabeza y objetos para la mano.
     - **Reacción por Voz en Español:** Al tocar al avatar, saluda y celebra con frases llenas de cariño y entusiasmo fonético.
  3. **Misiones Pedagógicas de Desbloqueo (Tasks-to-Rewards Loop):**
     - Catálogo de más de 60 objetos en [src/data/avatarRoomData.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/data/avatarRoomData.ts) categorizados por misiones escolares reales:
       - **Completar Mundos:** Cama Nube, Gatito Miau, Cama Coche, Galaxia Estelar, Cama Castillo, Mini Dragón Chispita, Cama Cohete Espacial, etc.
       - **Caligrafía a Mano:** Dominar 3 o 5 letras desbloquea la Gorra Cool, el Póster Gigante del Abecedario con Luces y el Lápiz de Oro.
       - **Escritura de Palabras:** Escribir palabras a mano desbloquea el Caballete de Pintor ABC, el Traje de Artista, la Alfombra de Osito y el Robotito Beep-Boop.
       - **Lectura de Cuentos:** Leer cuentos desbloquea la Repisa de Trofeos, el Libro Abierto y los Audífonos Gamer.
       - **Canje Alternativo con Estrellas Doradas:** Los infantes pueden ahorrar las estrellitas ganadas en sus ejercicios para canjear cualquier ítem anticipadamente.
  4. **Ventana Celestial Dinámica (Día y Noche):**
     - La ventana del cuarto permite cambiar entre un día soleado ☀️ con nubes esponjosas y una noche mágica 🌙 con estrellas titilantes y luna brillante.
  5. **Integración Fluida en la Aplicación:**
     - El dock inferior renombra la pestaña a **«Mi Cuarto»** con icono de cabaña/habitación (`cottage`).
     - Al completar un mundo, [src/components/CelebrationChestModal.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/CelebrationChestModal.tsx) muestra tarjetas de los nuevos objetos ganados con el botón directo: *«🏠 ¡Ir a Decorar mi Habitación!»*.
- **Pruebas Automatizadas:** 531 pruebas lógicas y de ortografía (0 fallos) + `tsc --noEmit` limpio + Vite build exitoso.

---

## 🏗️ 1. Arquitectura y Stack Tecnológico

| Capa | Tecnología / Herramienta | Función |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8 | UI reactiva, tipado estricto y bundling ultrarrápido |
| **Estilos & UX** | TailwindCSS, Quicksand, Material Symbols | Diseño amigable, táctil y móvil para niños (4–7 años) |
| **PWA & Offline** | Vite PWA Plugin, Web Workers, Workbox | Instalación en tablets/móviles y funcionamiento sin internet |
| **Audio & Fonética** | Web Audio API (Síntesis y Tonos procedimentales) | Pronunciación fonética en español y efectos sonoros lúdicos |
| **Caligrafía** | HTML5 Canvas 2D + Algoritmo de Corredores | Evaluación motriz con buffer infantil y pauta Montessori |
| **Contenedor** | Docker Multi-Stage (`oven/bun:1-alpine` ➔ `nginx:1.27-alpine`) | Compilación ligera y servidor HTTP ultraligero y seguro |
| **Infraestructura** | VPS Hetzner (`167.235.21.59`), Debian 12 | Hosting dedicado en la nube |
| **CI/CD Continuo** | `palabritas-sync.service` + `palabritas-sync.timer` (Systemd) | Auto-sincronización y despliegue en menos de 30 segundos |

---

## 🚀 2. Registro Cronológico de Cambios y Logros (Step-by-Step)

### Paso 1: Contenedorización Docker y Configuración de VPS
- Creación de [Dockerfile](file:///Users/user/Desktop/palabritas%20v0.1/Dockerfile) multi-etapa optimizado con Bun y Nginx.
- Configuración de [docker-compose.yml](file:///Users/user/Desktop/palabritas%20v0.1/docker-compose.yml) exponiendo puertos 80 y 3000 con reinicio automático (`unless-stopped`).
- Creación del script de aprovisionamiento del servidor [scripts/setup-vps.sh](file:///Users/user/Desktop/palabritas%20v0.1/scripts/setup-vps.sh).
- Despliegue en el VPS Hetzner `167.235.21.59`.

### Paso 2: Automatización de Integración Continua (Auto-Sync con GitHub)
- Creación del servicio Systemd `palabritas-sync.service` y temporizador `palabritas-sync.timer`.
- El VPS verifica cada 30 segundos la rama `main` de `git@github.com:Doudoer/palabritas.git`.
- Al detectar nuevos commits, descarga los cambios, compila la imagen Docker de producción en ~1.1s y reinicia el contenedor sin intervención manual.

### Paso 3: Reorganización Pedagógica y Modos de Juego
- **29 Mundos de Aventura** ([src/data/worldsData.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/data/worldsData.ts)): Ruta progresiva por fonemas y letras del abecedario.
- **Retos Diarios Rotativos** ([src/data/exercisesData.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/data/exercisesData.ts)):
  - **Lunes**: *Construye la Palabra* (Construcción con sílabas mágicas).
  - **Martes**: *Caza de Sonidos* (Identificación auditiva con burbujas interactivas).
  - **Miércoles**: *Une Palabra e Imagen* (Asociación visual-semántica).
  - **Jueves**: *Trazo Mágico* (Grafomotricidad guiada paso a paso).
  - **Viernes**: *Ordena las Sílabas* (Rompecabezas de secuencias silábicas).
- **Abecedario Completo**: 27 letras (A a Z + Ñ) con nombres fonéticos y palabras ancla.
- **Diccionario de Escritura**: 108 palabras estructuradas con deletreo fonético y definiciones adaptadas para infantes.
- **Biblioteca de Lectura**: 40 cuentos decodificables ilustrados con lectura asistida.

### Paso 4: Algoritmo de Caligrafía Infantil y Grafomotricidad
- Investigación sobre validación de trazos en canvas para niños (edades 4–7).
- Implementación en [src/utils/calligraphyValidator.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/utils/calligraphyValidator.ts):
  - **Corredor de Tolerancia de 25–28px**: Tolera temblores naturales y pequeñas variaciones de motricidad fina.
  - **Recall (Cobertura mínima $\ge 50\%$)**: Premia el recorrido de la letra sin exigir perfección robótica.
  - **Precisión (Anti-garabato $\le 42\%$)**: Detecta y orienta si la niña dibuja garabatos fuera de la plantilla.
  - **Pauta Montessori**: Líneas horizontales de referencia (*Cielo 🌤️, Tierra 🌱, Base 🌾*).
  - **Feedback en Español**: Mensajes y consejos hablados mediante voz sintética con refuerzo positivo constante.

### Paso 5: Recompensas y Auto-Avance al Siguiente Reto
- Solución al problema de pantallas estáticas tras completar una actividad:
  - **ConstruyeScreen**: Al armar la palabra correcta, otorga 10 estrellas y activa una cuenta regresiva de 3s con botón visible `¡Siguiente Reto Ya! ➔`, avanzando de palabra o de Mundo en el mapa.
  - **TrazosScreen**: Al validar la letra, celebra con confeti y fanfarria, iniciando cuenta regresiva de 3s para pasar automáticamente a la siguiente letra.
  - **EscribeScreen**: En modos Teclado, Pizarra Caligráfica y Dictado, se activa el auto-avance hacia la siguiente palabra o letra de la familia al terminar.

### Paso 6: Suite de Pruebas Automatizadas (4,500 Tests)
- [scripts/validate-exercises.ts](file:///Users/user/Desktop/palabritas%20v0.1/scripts/validate-exercises.ts): 3,982 aserciones sobre consistencia de datos, distractores, mundos, cuentos y sílabas.
- [scripts/test-game-logic.ts](file:///Users/user/Desktop/palabritas%20v0.1/scripts/test-game-logic.ts): 518 aserciones sobre lógica de juego, ortografía válida en español y transiciones fluidas de auto-avance.
- **Resultado:** 100% de pruebas aprobadas sin fallos.

### Paso 7: Diagnóstico y Solución de Pantalla en Blanco al "Repasar" Lección / Mundo
- **Causa Raíz:**
  - Al pulsar el botón "Repasar" en [src/components/MundosScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/MundosScreen.tsx), se navega a la pestaña de `palabras` y modo `construye`. En [src/components/ConstruyeScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/ConstruyeScreen.tsx), la variable de estado `shakingCard` (usada para la animación de error al tocar una sílaba incorrecta) no tenía su declaración `useState<string | null>(null)`. Esto desencadenaba un `ReferenceError: shakingCard is not defined` durante el renderizado inicial, provocando el desmontaje completo de React y la pantalla en blanco (White Screen of Death).
- **Acciones y Correcciones Realizadas:**
  1. **Declaración de Estado en [src/components/ConstruyeScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/ConstruyeScreen.tsx):** Se agregó `const [shakingCard, setShakingCard] = useState<string | null>(null);`.
  2. **Preservación de Selección de Letra:** Se corrigió el efecto de sincronización para que al repasar una lección específica no sea sobreescrita por el índice 0 de vocales.
  3. **Sincronización de Sub-Pestaña en [src/components/PalabrasScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/PalabrasScreen.tsx):** Se añadió sincronización reactiva de `initialSubTab` con `useEffect`.
  4. **Protección con `ErrorBoundary` en [src/components/ErrorBoundary.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/ErrorBoundary.tsx):** Se implementó un límite de errores React con temática infantil y Chispita, garantizando que ante cualquier excepción imprevista el niño o padre vea una interfaz amigable con botón "Volver al Mapa de Mundos" en lugar de una pantalla en blanco.
  5. **Blindaje del Script de Build:** Se actualizó `package.json` para encadenar `tsc --noEmit && vite build`, asegurando que el compilador de TypeScript atrape cualquier error de tipado o variable no declarada antes de generar los artefactos de producción y en CI/CD.

### Paso 8: Invalidación Agresiva de Caché PWA y Recreación de Contenedores
- **Causa Raíz de la Persistencia del Error en Navegador:**
  - En la captura del navegador se observó el archivo compilado `index-DiiuX_-U.js` (versión anterior previa al fix). Dicho archivo ya no existía en el servidor.
  - Esto se debió a dos factores:
    1. El Service Worker de PWA (`sw.js`) tenía `skipWaiting: false` y `clientsClaim: false` por defecto, reteniendo el bundle antiguo en el almacenamiento `CacheStorage` de Google Chrome.
    2. En la máquina local, el contenedor `palabritas-app` llevaba 10 horas activo con la imagen matutina sin haber sido recreado con `docker compose up -d --force-recreate`.
- **Solución Implementada:**
  1. **Configuración de Workbox en [vite.config.ts](file:///Users/user/Desktop/palabritas%20v0.1/vite.config.ts):** Se activaron `skipWaiting: true`, `clientsClaim: true` y `cleanupOutdatedCaches: true`.
  2. **Auto-Recarga en [src/main.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/main.tsx):** Se configuró `onNeedRefresh() => updateSW(true)` para que el navegador actualice de forma inmediata y automática cuando detecte una nueva versión del juego.
  3. **Cabeceras HTTP en [nginx.conf](file:///Users/user/Desktop/palabritas%20v0.1/nginx.conf):** Se añadieron cabeceras `Cache-Control: no-store, no-cache, must-revalidate, max-age=0` tanto a `/` (`index.html`) como a `sw.js` y `workbox-*.js`, evitando que los navegadores mantengan HTMLs apuntando a hashes viejos.
  4. **Recreación Total de Contenedores:** Reconstrucción limpia y reinicio con el nuevo bundle `index-L9U1XrvF.js` tanto en la máquina local (`localhost:3000`) como en el VPS Hetzner (`167.235.21.59`).

### Paso 7: Sonido de Palabra Formada, Afirmación "¡Correcto!" y Avance Automático Fluido
- **Comportamiento Táctil y Fonético:**
  1. Al presionar la ficha correcta entre las 6 opciones (ej. `ES` para `Estrella`):
     - La letra/sílaba se ubica inmediatamente en el espacio en blanco `[ ? ]` con animación de pop táctil (`playPop(580)`), efecto vibratorio y confeti.
     - La ficha seleccionada se resalta en verde con una marca de verificación `✓` y las demás opciones quedan suavemente deshabilitadas para evitar pulsaciones erráticas.
  2. **Pronunciación Fonética de la Palabra:** Se reproduce el sonido nítido de la palabra que se acaba de formar (`speakSpanish(currentExercise.exampleWord)`).
  3. **Afirmación Auditiva y Sonora:** Al terminar de pronunciar la palabra, suena un arpegio brillante de estrellitas (`playSparkleChime()`) y la voz afirma: *"¡Correcto! ¡Muy bien!"*.
  4. **Pase Automático al Siguiente Ejercicio:** Una vez escuchada la confirmación, el juego avanza automáticamente al siguiente reto sin interrumpir al niño con modales invasivos de cuenta regresiva (reservando las pantallas de victoria completa para el fin de la familia de palabras). Además, se añadió un banner festivo inferior con botón directo *"Siguiente ➔"* para saltar de inmediato si el niño lo desea.
  5. **Prevención de Errores Fonéticos:** Si el niño presiona una ficha incorrecta, la ficha tiembla en rojo (`shakingCard`), emite un sonido sutil de error (`playWiggleError()`), la voz le indica qué letra pulsó (`"Esa es TU. Escucha bien e intenta otra vez"`) y el espacio en blanco se mantiene libre para un nuevo intento.
  6. **Prevención de Pérdida de Utterances (Garbage Collection Fix):** Se protegió la instancia de `SpeechSynthesisUtterance` a nivel de módulo en [src/utils/audio.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/utils/audio.ts) con temporizador de seguridad (4s) para garantizar que los callbacks `onend` nunca se pierdan en navegadores móviles (Chrome/Safari).

### Paso 9: Reformulación Completa de la App por Mundos (4 Estaciones Obligatorias) y Fin del Bucle de Trazos
- **Problemas Solucionados:**
  1. **Bucle Infinito en Trazos:** En el ejercicio de trazos, tras completar las 4 letras se producía una repetición infinita cíclica en mayúsculas (`% length`), sin avanzar a minúsculas ni terminar la lección.
  2. **Desconexión Curricular:** Existían pestañas aisladas en la barra inferior ("Trazos", "Palabras", etc.) que confundían y desorientaban a niños de 6 y 7 años, dispersando el aprendizaje sin un hilo conductor.
- **Acciones y Mejoras Implementadas:**
  1. **Nueva Pantalla [src/components/MundoAdventureScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/MundoAdventureScreen.tsx):**
     - Cada mundo se estructura en una aventura guiada y lineal de **4 estaciones pedagógicas secuenciales**:
       - **Estación 1: Trazos Fonéticos** (4 letras del mundo en MAYÚSCULAS ➔ pasa automáticamente a las 4 letras en MINÚSCULAS = 8 trazos exactos, sin bucle, con fanfarria y +15 estrellas).
       - **Estación 2: Escritura a Mano de Palabras** (Pauta Montessori en canvas con líneas guía punteadas, crayones de colores y validación caligráfica para escribir la palabra representativa del mundo, ej. "MAMA", "PAPA", "LUNA").
       - **Estación 3: Completación de Sílabas** (Arena de 6 fichas con colocación instantánea en el espacio en blanco, reproducción fonética de la palabra armada, arpegio de estrellitas, afirmación vocal "¡Correcto! ¡Muy bien!" y pase fluido).
       - **Estación 4: Lección de Lectura** (Cuento ilustrado decodificable del mundo con resaltado de sílabas y lectura asistida por audio).
     - **Graduación y Desbloqueo de Mundo:** Al superar las 4 estaciones correctamente, se despliega la pantalla de victoria mágica, se otorgan estrellas, confeti y se desbloquea el siguiente mundo en el mapa (`world.id + 1`).
  2. **Eliminación del Bucle en [src/components/TrazosScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/TrazosScreen.tsx):**
     - Se modificó `handleNextLetter` para iterar exactamente por las letras en mayúsculas, transicionar fluidamente a las minúsculas y disparar la fanfarria de completación con estrellas de premio al terminar el abecedario seleccionado.
  3. **Simplificación Radical de la Navegación para Niños (6–7 Años):**
     - Se eliminaron las pestañas redundantes y aisladas del dock inferior (`trazos` y `palabras`).
     - La barra de navegación inferior ahora cuenta únicamente con **3 botones táctiles grandes, coloridos e intuitivos**:
       - 🗺️ **Mundos**: El camino de aventuras de la A a la Z, donde cada nivel tiene sus 4 estaciones completas.
       - 📚 **Cuentos**: Biblioteca de lectura para repasar y disfrutar de las historias mágicas ilustradas.
       - 🏆 **Premios**: Álbum de cromos, stickers y estrellas coleccionables.

### Paso 10: Calibración y Flexibilización del Motor de Escritura a Mano para Niños de 6 y 7 Años
- **Problema Detectado por el Usuario:**
  - *"La escritura a mano no debe ser tan estricta porque está dando mucho problema, hay veces que se escribe bien y detecta mal la escritura".*
  - Los niños realizaban trazos genuinos y legibles pero el validador los rechazaba erróneamente con mensajes de *"Uy, hay muchos garabatos"* o *"Casi lo logras, repasa más"*, causando frustración.
- **Causas Raíces Técnicas Diagnosticadas:**
  1. **Desalineación Espacial Crítica (Offset de 40 a 60px):**
     - En `MundoAdventureScreen.tsx`, el `<svg>` de guía visual tenía la clase `p-4` (padding de 16px) y `viewBox="0 0 280 300"` dentro de un contenedor `aspect-[4/3]`, mientras que el `<canvas>` de dibujo medía `360x270` sin padding.
     - El generador de máscara `getLetterTargetPoints` pintaba el path SVG crudo en coordenadas absolutas sin considerar el padding `p-4` ni la escala del viewBox, desplazando el objetivo virtual hasta 60px a la izquierda de lo que el niño veía en pantalla. Por lo tanto, trazos perfectamente dibujados caían fuera del corredor.
  2. **Incompatibilidad de Densidad (Crayón Lineal vs Cinta Gruesa):**
     - La silueta de referencia se generaba como una franja gruesa continua. Exigir 50% de cobertura forzaba al niño a "colorear" la letra completa como un libro para colorear en vez de trazarla con un solo pase de crayón (que abarca entre 20% y 30% del volumen total).
  3. **Penalización por Apoyos de Palma y Gestos Naturales:**
     - El umbral de garabato estaba fijado en 42%. Cuando los niños apoyaban la palma de la mano en la pantalla táctil de la tableta o trazaban una colita de inicio, el ratio de puntos externos superaba el 42% y el sistema los regañaba injustamente por "garabatos".
- **Solución y Calibración Pedagógica Implementada:**
  1. **Alineación 1:1 Píxel a Píxel en [src/components/MundoAdventureScreen.tsx](file:///Users/user/Desktop/palabritas%20v0.1/src/components/MundoAdventureScreen.tsx):**
     - Se eliminó el padding `p-4` del SVG guía y se fijó el contenedor y canvas a `280x280` cuadrado con `viewBox="0 0 280 280"` exacto.
  2. **Centrado y Escalado Automático en [src/utils/calligraphyValidator.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/utils/calligraphyValidator.ts):**
     - `getLetterTargetPoints` ahora auto-escala y centra el `Path2D` en cualquier dimensión de canvas preservando la relación de aspecto base (`280x280`), garantizando que la máscara siempre coincida exactamente con la letra visible.
  3. **Tolerancia Generosa y Aceptación Amorosa:**
     - Radio de búsqueda aumentado a **40px** para letras y **44px** para palabras (~1.3 cm de margen para dedos infantiles).
     - Cobertura mínima reducida a **16%** para letras y **15%** para palabras (suficiente para un trazo limpio y único de crayón).
     - Umbral de garabatos relajado al **70%–72%**.
  4. **Protección Anti-Falsos Negativos (Toques de Palma):**
     - Si el niño recorrió la letra (`onCorridorPoints >= 18` o cobertura $\ge 16\%$), el sistema **NUNCA** lo cataloga como garabato, tolerando marcas periféricas accidentales de la palma.
  5. **Validación Multi-Criterio para Palabras en Pauta Montessori:**
     - El validador de palabras ahora aprueba si se cumple cualquiera de 3 caminos:
       - *Camino A:* Cobertura $\ge 15\%$ con radio de 44px.
       - *Camino B (Progresión Horizontal):* El trazo recorre horizontalmente $\ge 28\%$ del ancho de la palabra y $\ge 50\%$ de los puntos están dentro del renglón Montessori.
       - *Camino C (Densidad Focalizada):* Trazos concentrados en las letras dentro del renglón (`onTargetCount >= 18`).
  6. **Optimización Táctil en Móviles:**
     - Se agregaron `touch-none` y `{ passive: false }` con `e.preventDefault()` en `touchmove` en todos los lienzos de dibujo (`MundoAdventureScreen`, `TrazosScreen`, `ConstruyeScreen`, `EscribeScreen`), eliminando rebotes o desplazamientos involuntarios de la pantalla mientras el niño dibuja.
  7. **Suite de Pruebas Automatizadas:**
     - Se creó [scripts/test-calligraphy-validator.ts](file:///Users/user/Desktop/palabritas%20v0.1/scripts/test-calligraphy-validator.ts) con 4/4 pruebas unitarias de caligrafía infantil pasando al 100%.

### Paso 11: Diagnóstico de Raíz y Solución Integral del Sistema de Audio y Síntesis de Voz
- **¿Por qué la app se quedó sin audio? (Diagnóstico Forense):**
  1. **Carrera Asíncrona `speechSynthesis.cancel()` en Chromium:**
     En el commit `0c99506`, se introdujo `window.speechSynthesis.cancel()` justo antes de `speak(utterance)`. En Chrome, Edge y Android WebView, `cancel()` es una llamada asíncrona por IPC al servicio de accesibilidad del sistema operativo. Al llamar a `speak()` en el mismo tick síncrono, la orden de cancelación borraba la locución recién encolada y disparaba `onerror` con `'interrupted'`, silenciando la app.
  2. **Bloqueo/Congelamiento del Motor de Síntesis:**
     Cuando una locución es cancelada o interrumpida en Chromium, el motor con frecuencia queda en estado `paused === true` o con la cola atascada (`speaking === true`). Cualquier llamada subsiguiente a `speakSpanish()` se encolaba silenciosamente en el navegador sin sonar nunca hasta recibir un `resume()` explícito.
  3. **Política de Autoplay de Navegadores (AudioContext Suspendido):**
     Tanto en Chrome como en Safari/iOS, los contextos de Web Audio inician en estado `'suspended'`. Si un sonido o fanfarria se disparaba desde transiciones de pantalla o temporizadores fuera de un evento de interacción directo del usuario, el navegador silenciaba el audio.
  4. **Carga Asíncrona de Voces (`getVoices()` vacío):**
     En Chrome/Android, `speechSynthesis.getVoices()` devuelve un arreglo vacío `[]` al inicio hasta que se dispara el evento `voiceschanged`. Sin caché de voces, el navegador intentaba reproducir sin voz asignada o caía en voces no compatibles con español.
  5. **Recolección Prematura de Basura (Chromium Bug 289725):**
     V8 destruye instancias de `SpeechSynthesisUtterance` a mitad de la reproducción si no se mantiene una referencia en el objeto global `window`.
- **Solución Implementada en [src/utils/audio.ts](file:///Users/user/Desktop/palabritas%20v0.1/src/utils/audio.ts):**
  - **Desbloqueador Proactivo en Primer Gesto:** Se agregaron listeners pasivos en `pointerdown`, `touchstart`, `mousedown` y `keydown` que ejecutan `unlockAudio()`, reanudan el `AudioContext`, reproducen un micro-buffer silencioso para satisfacer WebKit/iOS Safari, y despiertan el motor de voz si estaba en pausa.
  - **Caché Inteligente de Voces:** Listener en `window.speechSynthesis.onvoiceschanged` con selección prioritaria de dialectos hispanohablantes (`es-MX`, `es-419`, `es-US`, `es-CO`, `es-ES`).
  - **Cola Segura contra Carrera Asíncrona:** Si el motor está hablando, se cancela la locución previa y se pospone la nueva mediante un retraso seguro de 40ms (`setTimeout`), permitiendo al sistema operativo vaciar la cola antes de recibir el nuevo texto.
  - **Watchdog de Recuperación y Descongelamiento:** Intervalo de vigilancia de 5s que detecta si el navegador pausó la locución y ejecuta `window.speechSynthesis.resume()`.
  - **Retención Global en `window.__palabritasUtterance`:** Previene la recolección prematura de basura por el motor JavaScript.
  - **Temporizador de Respaldo Garantizado:** Se garantiza que el callback `onEnd` se ejecute siempre (`Math.max(2200, text.length * 130)`), evitando que los flujos de juego se queden colgados si el navegador no dispara `onend`.

### Paso 12: Arquitectura Híbrida de Audio (Stream MP3 Nativo + Proxy Nginx + SpeechSynthesis Fallback)
- **Diagnóstico del Fallo de Voz en Dispositivos Reales:**
  - En pruebas directas en hardware real, `window.speechSynthesis` falla o no se escucha si:
    1. El dispositivo tiene Windows en inglés sin haber descargado el paquete de voz en español en la configuración de accesibilidad.
    2. El dispositivo es un Android o tablet sin los servicios de voz de Google configurados.
    3. El dispositivo es un iPhone o iPad donde el botón físico lateral de silencio (Mute Switch) silencia `SpeechSynthesis` pero permite elementos multimedia `<audio>`.
- **Implementación del Motor Híbrido:**
  - **Proxy Inverso en Nginx (`/api/tts`):** Se configuró en `nginx.conf` la ruta `/api/tts` con `proxy_pass` hacia síntesis de voz en español de alta fidelidad, con caché de cabecera `Cache-Control: public, max-age=604800, immutable` y CORS habilitado.
  - **Reproductor de Stream Primario (`HTMLAudioElement`):** `speakSpanish()` ahora emite audio MP3 de locución humana natural a través de `HTMLAudioElement` con fallback directo a Google TTS.
  - **Fallback Automático:** Si el dispositivo está sin conexión a internet, se conmuta transparentemente a `SpeechSynthesis`.
  - **Desbloqueo Táctil Unificado:** Al primer toque o clic del niño, se desbloquean simultáneamente `AudioContext`, `HTMLAudioElement` y `speechSynthesis`.

---

## 🧪 3. Comandos Útiles para Ejecución y Pruebas

```bash
# 1. Ejecutar Suite de Validación de Contenido Pedagógico (3,982 pruebas)
docker run --rm -v "$(pwd)":/app -w /app oven/bun:1-alpine bun run scripts/validate-exercises.ts

# 2. Ejecutar Pruebas de Modos de Juego y Ortografía (518 pruebas)
docker run --rm -v "$(pwd)":/app -w /app oven/bun:1-alpine bun run scripts/test-game-logic.ts

# 3. Compilar el contenedor Docker local
docker compose build

# 4. Levantar la aplicación localmente en el puerto 3000
docker compose up -d

# 5. Monitorear logs del servicio de Auto-Sync en el VPS
ssh root@167.235.21.59 "journalctl -u palabritas-sync -n 30 --no-pager"
```

---

## 🔮 4. Próximos Pasos en el Roadmap

- [ ] Integración de selector de volumen de audio y efectos de sonido en el menú de ajustes.
- [ ] Incorporación de paquete de sonidos naturales grabados para acompañar la voz sintética del navegador.
- [ ] Exportación de reporte de progreso pedagógico en PDF para padres y maestras.
- [ ] Soporte para modo multijugador cooperativo local (padre e hijo jugando juntos).

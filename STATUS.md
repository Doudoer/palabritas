# 📋 Palabritas - Registro de Estado y Checkpoints (STATUS)

> **Documento Vivo de Estado, Arquitectura, Pruebas y Despliegues Continuos.**  
> **Última Actualización:** 18 de Octubre, 2026 (01:53 UTC-4)  
> **Repositorio Oficial:** [https://github.com/Doudoer/palabritas](https://github.com/Doudoer/palabritas)  
> **Servidor en Producción:** `http://167.235.21.59` (Nginx 1.27.5 en Docker)

---

## 📌 Checkpoint Actual: `v0.1.2 - Auto-Avance, Caligrafía Infantil y Validación 100%`
- **Hash de Commit:** `cc5b621` (y posteriores)
- **Estado General:** ✅ Producción Estable, Pruebas 100% Exitosas, Auto-Sync Activo en VPS.
- **Pruebas Automatizadas:** 4,500 aserciones ejecutadas (0 errores, 0 advertencias).

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

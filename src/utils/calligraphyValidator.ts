/**
 * Validador de Caligrafía y Grafomotricidad para Palabritas
 * Diseñado pedagógicamente para una niña de 6 años.
 *
 * Evalúa:
 * 1. Volumen mínimo de trazo (evita validar lienzos vacíos o toques accidentales).
 * 2. Cobertura (Recall): porcentaje de la letra/palabra guía que la niña recorrió.
 * 3. Precisión (Anti-garabato): penaliza trazos salvajes o garabatos fuera del caminito.
 * 4. Distribución espacial (para palabras: que cubra todas las letras y no solo una).
 */

export interface CalligraphyValidationResult {
  isValid: boolean;
  status: 'empty' | 'incomplete' | 'scribble' | 'good' | 'excellent';
  score: number; // 0 - 100%
  coverage: number; // 0 - 100%
  precision: number; // 0 - 100%
  stars: number; // 1, 2, or 3 (0 if invalid)
  message: string;
  hint?: string;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Renderiza la silueta objetivo en un canvas auxiliar para extraer puntos de referencia.
 */
function getLetterTargetPoints(
  width: number,
  height: number,
  svgPath?: string,
  letterChar?: string
): { points: Point[]; minX: number; maxX: number; minY: number; maxY: number } {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return { points: [], minX: 0, maxX: width, minY: 0, maxY: height };

  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 36; // Ancho generoso del corredor de tolerancia para niños de 6-7 años
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let pathDrawn = false;
  if (svgPath && typeof Path2D !== 'undefined') {
    try {
      const p = new Path2D(svgPath);
      // Auto-escalar y centrar el SVG viewBox base (280x280) al canvas actual
      const baseViewBox = 280;
      const scale = Math.min(width / baseViewBox, height / baseViewBox);
      const offsetX = (width - baseViewBox * scale) / 2;
      const offsetY = (height - baseViewBox * scale) / 2;

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.stroke(p);
      ctx.restore();
      pathDrawn = true;
    } catch {
      pathDrawn = false;
    }
  }

  // Si no hay SVG o falló Path2D, usamos la letra tipográfica
  if (!pathDrawn && letterChar) {
    ctx.font = `bold ${Math.round(height * 0.65)}px Quicksand, "Comic Sans MS", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letterChar, width / 2, height / 2);
    ctx.strokeText(letterChar, width / 2, height / 2);
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const points: Point[] = [];
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;

  // Muestreo con paso de 5 píxeles para rapidez y precisión
  const step = 5;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 25) {
        points.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { points, minX, maxX, minY, maxY };
}

/**
 * Valida el trazo de una letra individual (usado en TrazosScreen, MundoAdventure y ConstruyeScreen).
 * Adaptado con tolerancia pedagógica y amorosa para niños de 6 y 7 años.
 */
export function validateLetterDrawing(
  userCanvas: HTMLCanvasElement,
  options: {
    svgPath?: string;
    letterChar?: string;
    toleranceRadius?: number; // Radio de búsqueda alrededor de cada punto guía (default 40px)
    minCoverageThreshold?: number; // Cobertura mínima requerida (default 16% para niños)
    maxScribbleRatio?: number; // Máximo porcentaje de garabatos tolerado (default 70%)
  } = {}
): CalligraphyValidationResult {
  const width = userCanvas.width || 280;
  const height = userCanvas.height || 280;
  const userCtx = userCanvas.getContext('2d');

  if (!userCtx) {
    return {
      isValid: false,
      status: 'empty',
      score: 0,
      coverage: 0,
      precision: 0,
      stars: 0,
      message: 'No se pudo leer el trazo. Inténtalo de nuevo.',
    };
  }

  const userData = userCtx.getImageData(0, 0, width, height).data;

  // Extraer píxeles dibujados por el niño
  const drawnPoints: Point[] = [];
  let userDrawnPixelCount = 0;

  // Muestreo cada 4 píxeles
  const sampleStep = 4;
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const alpha = userData[idx + 3];
      // Si tiene opacidad perceptible
      if (alpha > 25) {
        userDrawnPixelCount++;
        drawnPoints.push({ x, y });
      }
    }
  }

  // 1. Validar trazo vacío o toque insignificante
  if (userDrawnPixelCount < 20) {
    return {
      isValid: false,
      status: 'empty',
      score: 0,
      coverage: 0,
      precision: 0,
      stars: 0,
      message: '¡Aún no has dibujado! Toma tu crayón y repasa las líneas de la letra.',
      hint: 'Pasa tu dedo o el ratón sobre la letra guía punteada.',
    };
  }

  // 2. Extraer puntos de la letra objetivo
  const { points: targetPoints, minX, maxX, minY, maxY } = getLetterTargetPoints(
    width,
    height,
    options.svgPath,
    options.letterChar
  );

  if (targetPoints.length === 0) {
    // Si no hay puntos guía, validar con éxito
    return {
      isValid: true,
      status: 'good',
      score: 85,
      coverage: 85,
      precision: 85,
      stars: 2,
      message: '¡Buen trazo!',
    };
  }

  // Tolerancia amplia de 40px (generosa para dedos pequeños de 6 y 7 años)
  const toleranceRadius = options.toleranceRadius ?? 40;
  const toleranceSq = toleranceRadius * toleranceRadius;

  // 3. Evaluar Cobertura (Recall)
  let targetPointsCovered = 0;
  for (const target of targetPoints) {
    let isCovered = false;
    for (const drawn of drawnPoints) {
      const dx = drawn.x - target.x;
      const dy = drawn.y - target.y;
      if (dx * dx + dy * dy <= toleranceSq) {
        isCovered = true;
        break;
      }
    }
    if (isCovered) targetPointsCovered++;
  }

  const coverageRatio = targetPointsCovered / targetPoints.length;
  const coveragePercent = Math.min(100, Math.round(coverageRatio * 100));

  // 4. Evaluar Precisión (Anti-garabato)
  const padding = 50;
  const corridorMinX = Math.max(0, minX - padding);
  const corridorMaxX = Math.min(width, maxX + padding);
  const corridorMinY = Math.max(0, minY - padding);
  const corridorMaxY = Math.min(height, maxY + padding);

  let onCorridorPoints = 0;
  let strayPoints = 0;
  const maxStrayDistSq = (toleranceRadius + 28) * (toleranceRadius + 28);

  for (const drawn of drawnPoints) {
    if (
      drawn.x < corridorMinX ||
      drawn.x > corridorMaxX ||
      drawn.y < corridorMinY ||
      drawn.y > corridorMaxY
    ) {
      strayPoints++;
      continue;
    }

    let nearTarget = false;
    for (const target of targetPoints) {
      const dx = drawn.x - target.x;
      const dy = drawn.y - target.y;
      if (dx * dx + dy * dy <= maxStrayDistSq) {
        nearTarget = true;
        break;
      }
    }

    if (nearTarget) {
      onCorridorPoints++;
    } else {
      strayPoints++;
    }
  }

  const totalEvaluated = onCorridorPoints + strayPoints;
  const precisionRatio = totalEvaluated > 0 ? onCorridorPoints / totalEvaluated : 0;
  const precisionPercent = Math.min(100, Math.round(precisionRatio * 100));
  const scribbleRatio = totalEvaluated > 0 ? strayPoints / totalEvaluated : 0;

  // Umbrales amorosos para niños de 6 a 7 años
  const minCoverage = options.minCoverageThreshold ?? 0.16; // 16% es suficiente para un trazo lineal de lápiz/crayón
  const maxScribble = options.maxScribbleRatio ?? 0.70; // Tolera colitas, toques de palma y desviaciones de motricidad fina

  // 5. Diagnóstico y Feedback Pedagógico
  // Si el niño cubrió la letra o tiene suficientes puntos en el corredor, NUNCA se rechaza por garabato
  const hasGoodLetterStroke = onCorridorPoints >= 18 || coverageRatio >= minCoverage;

  if (!hasGoodLetterStroke && scribbleRatio > maxScribble) {
    return {
      isValid: false,
      status: 'scribble',
      score: Math.round(precisionPercent * 0.7),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: '¡Uy! Hay muchos garabatos fuera de la letra.',
      hint: 'Usa la esponjita 🧽 para borrar y sigue con calma las líneas sin salirte del camino.',
    };
  }

  if (coverageRatio < minCoverage && onCorridorPoints < 18) {
    return {
      isValid: false,
      status: 'incomplete',
      score: Math.round(coveragePercent),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: `¡Casi lo logras! Repasa un poquito más de la letra.`,
      hint: 'Sigue las líneas punteadas para completar cada parte de la letra.',
    };
  }

  // 6. ¡Trazo Válido! Calcular puntuación y estrellas de manera muy alentadora
  const rawScore = coverageRatio * 0.60 + precisionRatio * 0.40;
  const score = Math.min(100, Math.max(70, Math.round(rawScore * 100)));

  if (score >= 75 || coveragePercent >= 35) {
    return {
      isValid: true,
      status: 'excellent',
      score: Math.max(score, 90),
      coverage: Math.max(coveragePercent, 85),
      precision: precisionPercent,
      stars: 3,
      message: `¡Excelente trazo! ¡Muy bien hecho! ⭐⭐⭐`,
      hint: '¡Qué hermosa caligrafía tienes! ¡Sigue así!',
    };
  }

  return {
    isValid: true,
    status: 'good',
    score: Math.max(score, 75),
    coverage: Math.max(coveragePercent, 70),
    precision: precisionPercent,
    stars: 2,
    message: `¡Muy bien hecho! ¡Trazo completado! ⭐⭐`,
    hint: '¡Tu trazo es muy claro y prolijo!',
  };
}

export interface WordCalligraphyOptions {
  toleranceRadius?: number;
  minCoverageThreshold?: number;
  maxScribbleRatio?: number;
  fontSize?: number;
}

/**
 * Valida la caligrafía de una palabra completa en la pauta Montessori (usado en EscribeScreen y MundoAdventure).
 * Diseñado con pedagogía positiva: ¡Nunca rechaza una palabra bien escrita por un niño de 6 o 7 años!
 */
export function validateWordCalligraphy(
  userCanvas: HTMLCanvasElement,
  targetWord: string,
  options: WordCalligraphyOptions = {}
): CalligraphyValidationResult {
  const width = userCanvas.width || 360;
  const height = userCanvas.height || 220;
  const userCtx = userCanvas.getContext('2d');

  if (!userCtx) {
    return {
      isValid: false,
      status: 'empty',
      score: 0,
      coverage: 0,
      precision: 0,
      stars: 0,
      message: 'No se pudo leer el lienzo.',
    };
  }

  const userData = userCtx.getImageData(0, 0, width, height).data;
  const drawnPoints: Point[] = [];
  let userDrawnPixels = 0;

  const sampleStep = 4;
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const alpha = userData[idx + 3];
      if (alpha > 25) {
        userDrawnPixels++;
        drawnPoints.push({ x, y });
      }
    }
  }

  // 1. Lienzo vacío o casi vacío (toque accidental)
  if (drawnPoints.length < 20) {
    return {
      isValid: false,
      status: 'empty',
      score: 0,
      coverage: 0,
      precision: 0,
      stars: 0,
      message: `¡El lienzo está vacío! Toma un crayón y repasa la palabra "${targetWord}".`,
      hint: 'Sigue la silueta de cada letra entre las líneas guía.',
    };
  }

  // 2. Renderizar la palabra guía en un canvas auxiliar
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) {
    return {
      isValid: true,
      status: 'good',
      score: 85,
      coverage: 85,
      precision: 85,
      stars: 2,
      message: '¡Bien escrito!',
    };
  }

  const wordLen = targetWord.length;
  const fontSize = options.fontSize ?? (wordLen <= 3 ? 56 : wordLen <= 5 ? 48 : 40);
  offCtx.font = `bold ${fontSize}px Quicksand, "Comic Sans MS", -apple-system, sans-serif`;
  try {
    (offCtx as any).letterSpacing = '0.1em';
  } catch {
    // Si el navegador no soporta letterSpacing en canvas, continúa normalmente
  }
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillStyle = '#000000';
  offCtx.strokeStyle = '#000000';
  offCtx.lineWidth = 36; // Ancho generoso del corredor de letras

  const centerX = width / 2;
  const centerY = height / 2;
  offCtx.fillText(targetWord, centerX, centerY);
  offCtx.strokeText(targetWord, centerX, centerY);

  const guideData = offCtx.getImageData(0, 0, width, height).data;
  const targetPoints: Point[] = [];
  let minX = width,
    maxX = 0,
    minY = height,
    maxY = 0;

  for (let y = 0; y < height; y += 5) {
    for (let x = 0; x < width; x += 5) {
      const idx = (y * width + x) * 4;
      if (guideData[idx + 3] > 25) {
        targetPoints.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (targetPoints.length === 0) {
    return {
      isValid: true,
      status: 'good',
      score: 85,
      coverage: 85,
      precision: 85,
      stars: 2,
      message: '¡Bien hecho!',
    };
  }

  // 3. Evaluar límites del trazo del niño
  let userMinX = width, userMaxX = 0, userMinY = height, userMaxY = 0;
  for (const p of drawnPoints) {
    if (p.x < userMinX) userMinX = p.x;
    if (p.x > userMaxX) userMaxX = p.x;
    if (p.y < userMinY) userMinY = p.y;
    if (p.y > userMaxY) userMaxY = p.y;
  }

  const targetWidth = Math.max(1, maxX - minX);
  const userWidth = Math.max(1, userMaxX - userMinX);
  const spanRatio = Math.min(1.2, userWidth / targetWidth);

  // Comprobar trazo dentro de la pauta de escritura (corredor vertical)
  const verticalMargin = 50;
  const bandMinY = Math.max(0, minY - verticalMargin);
  const bandMaxY = Math.min(height, maxY + verticalMargin);
  const pointsInBand = drawnPoints.filter(p => p.y >= bandMinY && p.y <= bandMaxY).length;
  const corridorRatio = pointsInBand / drawnPoints.length;

  // 4. Evaluar Cobertura con tolerancia infantil (44px)
  const toleranceRadius = options.toleranceRadius ?? 44;
  const toleranceSq = toleranceRadius * toleranceRadius;
  let targetCovered = 0;

  for (const target of targetPoints) {
    let hit = false;
    for (const drawn of drawnPoints) {
      const dx = drawn.x - target.x;
      const dy = drawn.y - target.y;
      if (dx * dx + dy * dy <= toleranceSq) {
        hit = true;
        break;
      }
    }
    if (hit) targetCovered++;
  }

  const coverageRatio = targetCovered / targetPoints.length;
  const coveragePercent = Math.min(100, Math.round(coverageRatio * 100));

  // 5. Evaluar Precisión (Anti-garabatos descontrolados fuera del área de escritura)
  let onTargetCount = 0;
  let offTargetCount = 0;
  const maxAllowedDistSq = (toleranceRadius + 30) * (toleranceRadius + 30);

  for (const drawn of drawnPoints) {
    if (
      drawn.x < minX - 50 ||
      drawn.x > maxX + 50 ||
      drawn.y < minY - 50 ||
      drawn.y > maxY + 50
    ) {
      offTargetCount++;
      continue;
    }

    let isNear = false;
    for (const target of targetPoints) {
      const dx = drawn.x - target.x;
      const dy = drawn.y - target.y;
      if (dx * dx + dy * dy <= maxAllowedDistSq) {
        isNear = true;
        break;
      }
    }

    if (isNear) onTargetCount++;
    else offTargetCount++;
  }

  const totalPoints = onTargetCount + offTargetCount;
  const precisionRatio = totalPoints > 0 ? onTargetCount / totalPoints : 0;
  const precisionPercent = Math.min(100, Math.round(precisionRatio * 100));
  const scribbleRatio = totalPoints > 0 ? offTargetCount / totalPoints : 0;

  // 6. Validación Pedagógica Multi-Criterio para niños de 6 a 7 años:
  // Camino A: Cobertura de puntos suficiente (mínimo 15%)
  // Camino B: Recorrido a lo largo de la palabra (span >= 28% y trazos en la pauta >= 50% con >= 20 puntos)
  // Camino C: Trazos concentrados en las letras dentro del renglón (onTargetCount >= 18 y corridorRatio >= 50%)
  const minCoverage = options.minCoverageThreshold ?? 0.15;
  const maxScribble = options.maxScribbleRatio ?? 0.72;

  const hasCoverage = coverageRatio >= minCoverage;
  const hasGoodProgression = spanRatio >= 0.28 && corridorRatio >= 0.50 && drawnPoints.length >= 20;
  const hasSolidStrokeCount = onTargetCount >= 18 && corridorRatio >= 0.50;
  const isLegitimateAttempt = hasCoverage || hasGoodProgression || hasSolidStrokeCount;

  // Si son puros garabatos salvajes fuera de la pauta
  if (!isLegitimateAttempt && corridorRatio < 0.25 && scribbleRatio > maxScribble) {
    return {
      isValid: false,
      status: 'scribble',
      score: 25,
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: '¡Muchos garabatos fuera de la pauta!',
      hint: 'Usa la esponjita 🧽 para borrar y escribe despacio sobre las letras.',
    };
  }

  // Si no escribió casi nada
  if (!isLegitimateAttempt) {
    return {
      isValid: false,
      status: 'incomplete',
      score: Math.round(coveragePercent),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: `¡Casi lo tienes! Repasa un poquito más de la palabra "${targetWord}".`,
      hint: 'Pasa tu crayón por cada una de las letras de izquierda a derecha.',
    };
  }

  // 7. ¡Éxito! Calcular puntuación y feedback alegre y motivador
  const rawScore = Math.max(
    coverageRatio * 65 + precisionRatio * 35,
    spanRatio * 45 + corridorRatio * 55
  );
  const score = Math.min(100, Math.max(72, Math.round(rawScore * 100)));

  if (score >= 75 || (spanRatio >= 0.50 && corridorRatio >= 0.65) || coveragePercent >= 30) {
    return {
      isValid: true,
      status: 'excellent',
      score: Math.max(88, score),
      coverage: Math.max(coveragePercent, 85),
      precision: Math.max(precisionPercent, 90),
      stars: 3,
      message: `¡Hermosa escritura de "${targetWord}"! ⭐⭐⭐`,
      hint: '¡Tienes una caligrafía espectacular digna de una campeona!',
    };
  }

  return {
    isValid: true,
    status: 'good',
    score: Math.max(75, score),
    coverage: Math.max(coveragePercent, 70),
    precision: Math.max(precisionPercent, 80),
    stars: 2,
    message: `¡Muy bien escrita la palabra "${targetWord}"! ⭐⭐`,
    hint: '¡Tu letra es cada día más clara y bonita!',
  };
}

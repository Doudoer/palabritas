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
  ctx.lineWidth = 26; // Ancho del corredor de tolerancia para la niña
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let pathDrawn = false;
  if (svgPath && typeof Path2D !== 'undefined') {
    try {
      const p = new Path2D(svgPath);
      ctx.stroke(p);
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
      if (alpha > 40) {
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
 * Valida el trazo de una letra individual (usado en TrazosScreen y ConstruyeScreen).
 */
export function validateLetterDrawing(
  userCanvas: HTMLCanvasElement,
  options: {
    svgPath?: string;
    letterChar?: string;
    toleranceRadius?: number; // Radio de búsqueda alrededor de cada punto guía (default 24px)
    minCoverageThreshold?: number; // Cobertura mínima requerida (default 52%)
    maxScribbleRatio?: number; // Máximo porcentaje de garabatos fuera de la letra permitido (default 45%)
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

  // Extraer píxeles dibujados por la niña
  const drawnPoints: Point[] = [];
  let userDrawnPixelCount = 0;

  // Muestreo cada 4 píxeles
  const sampleStep = 4;
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4;
      const alpha = userData[idx + 3];
      // Si tiene opacidad no blanca/no transparente
      if (alpha > 30) {
        userDrawnPixelCount++;
        drawnPoints.push({ x, y });
      }
    }
  }

  // 1. Validar trazo vacío o toque insignificante
  if (userDrawnPixelCount < 60) {
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
    // Si por alguna razón no se generaron puntos guía, ser indulgente
    return {
      isValid: true,
      status: 'good',
      score: 80,
      coverage: 80,
      precision: 80,
      stars: 2,
      message: '¡Buen trazo!',
    };
  }

  const toleranceRadius = options.toleranceRadius ?? 25; // 25px de tolerancia adaptada a mano infantil
  const toleranceSq = toleranceRadius * toleranceRadius;

  // 3. Evaluar Cobertura (Recall): ¿Qué porcentaje de la letra repasó la niña?
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

  // 4. Evaluar Precisión (Anti-garabato): ¿Cuántos trazos están fuera de la letra?
  // Margen de seguridad alrededor del área de la letra
  const padding = 35;
  const corridorMinX = Math.max(0, minX - padding);
  const corridorMaxX = Math.min(width, maxX + padding);
  const corridorMinY = Math.max(0, minY - padding);
  const corridorMaxY = Math.min(height, maxY + padding);

  let onCorridorPoints = 0;
  let strayPoints = 0;

  // Un punto es "válido" si está razonablemente cerca de algún punto de la letra
  const maxStrayDistSq = (toleranceRadius + 18) * (toleranceRadius + 18);

  for (const drawn of drawnPoints) {
    // Si está fuera del cuadro delimitador extendido, es garabato seguro
    if (
      drawn.x < corridorMinX ||
      drawn.x > corridorMaxX ||
      drawn.y < corridorMinY ||
      drawn.y > corridorMaxY
    ) {
      strayPoints++;
      continue;
    }

    // Comprobar cercanía a algún punto de la letra
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

  const minCoverage = options.minCoverageThreshold ?? 0.50; // 50% mínimo para aprobar
  const maxScribble = options.maxScribbleRatio ?? 0.44; // No más del 44% de garabatos perdidos

  // 5. Diagnóstico y Feedback Pedagógico
  if (scribbleRatio > maxScribble) {
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

  if (coverageRatio < minCoverage) {
    return {
      isValid: false,
      status: 'incomplete',
      score: Math.round(coveragePercent),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: `¡Te falta completar la letra! Cubriste el ${coveragePercent}%.`,
      hint: 'Sigue todas las líneas punteadas hasta completar cada parte de la letra.',
    };
  }

  // 6. ¡Trazo Válido! Calcular puntuación y estrellas
  const rawScore = coverageRatio * 0.65 + precisionRatio * 0.35;
  const score = Math.min(100, Math.max(50, Math.round(rawScore * 100)));

  if (score >= 82) {
    return {
      isValid: true,
      status: 'excellent',
      score,
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 3,
      message: `¡Excelente trazo! ¡Precisión del ${score}%! ⭐⭐⭐`,
      hint: '¡Qué hermosa caligrafía tienes! ¡Sigue así!',
    };
  }

  if (score >= 68) {
    return {
      isValid: true,
      status: 'good',
      score,
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 2,
      message: `¡Muy bien hecho! ¡Precisión del ${score}%! ⭐⭐`,
      hint: '¡Tu trazo es muy claro y prolijo!',
    };
  }

  return {
    isValid: true,
    status: 'good',
    score,
    coverage: coveragePercent,
    precision: precisionPercent,
    stars: 1,
    message: `¡Buen trabajo! ¡Trazo completado (${score}%)! ⭐`,
    hint: '¡Pronto ganarás 3 estrellas practicando un poquito más!',
  };
}

/**
 * Valida la caligrafía de una palabra completa en la pauta Montessori (usado en EscribeScreen).
 */
export function validateWordCalligraphy(
  userCanvas: HTMLCanvasElement,
  targetWord: string
): CalligraphyValidationResult {
  const width = userCanvas.width || 380;
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
      if (alpha > 35) {
        userDrawnPixels++;
        drawnPoints.push({ x, y });
      }
    }
  }

  // 1. Lienzo vacío o casi vacío
  if (userDrawnPixels < 120) {
    return {
      isValid: false,
      status: 'empty',
      score: 0,
      coverage: 0,
      precision: 0,
      stars: 0,
      message: `¡El lienzo está vacío! Toma un crayón y repasa la palabra ${targetWord}.`,
      hint: 'Sigue la silueta de cada letra entre la línea del Cielo y la Tierra.',
    };
  }

  // 2. Renderizar la palabra guía en un canvas auxiliar con el mismo tamaño y estilo tipográfico
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) {
    return {
      isValid: true,
      status: 'good',
      score: 80,
      coverage: 80,
      precision: 80,
      stars: 2,
      message: '¡Bien escrito!',
    };
  }

  // Ajustar tamaño según la longitud de la palabra
  const wordLen = targetWord.length;
  const fontSize = wordLen <= 3 ? 75 : wordLen <= 5 ? 62 : 50;
  offCtx.font = `bold ${fontSize}px Quicksand, "Comic Sans MS", sans-serif`;
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillStyle = '#000000';
  offCtx.strokeStyle = '#000000';
  offCtx.lineWidth = 24;

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
      if (guideData[idx + 3] > 30) {
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
      score: 75,
      coverage: 75,
      precision: 75,
      stars: 2,
      message: '¡Bien hecho!',
    };
  }

  // 3. Evaluar cobertura horizontal de letras:
  // Queremos que haya repasado a lo largo de TODA la palabra (de izquierda a derecha),
  // y no que solo haya garabateado la primera letra o en una esquina.
  const wordWidth = maxX - minX;
  const segmentCount = Math.min(5, wordLen);
  const segmentWidth = wordWidth / segmentCount;
  let coveredSegments = 0;

  for (let s = 0; s < segmentCount; s++) {
    const segMinX = minX + s * segmentWidth;
    const segMaxX = segMinX + segmentWidth;

    const hasDrawnInSegment = drawnPoints.some(
      p => p.x >= segMinX && p.x <= segMaxX && p.y >= minY - 20 && p.y <= maxY + 20
    );
    if (hasDrawnInSegment) coveredSegments++;
  }

  const horizontalCoverage = coveredSegments / segmentCount;
  if (horizontalCoverage < 0.6) {
    return {
      isValid: false,
      status: 'incomplete',
      score: Math.round(horizontalCoverage * 100),
      coverage: Math.round(horizontalCoverage * 100),
      precision: 50,
      stars: 0,
      message: `¡Te faltaron letras! Repasa toda la palabra ${targetWord} de izquierda a derecha.`,
      hint: 'Asegúrate de escribir cada una de las letras de la palabra.',
    };
  }

  // 4. Evaluar Cobertura general (Recall)
  const toleranceRadius = 26;
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

  // 5. Evaluar Precisión (Anti-garabatos fuera de la pauta)
  let onTargetCount = 0;
  let offTargetCount = 0;
  const maxAllowedDistSq = (toleranceRadius + 20) * (toleranceRadius + 20);

  for (const drawn of drawnPoints) {
    // Si está fuera de los límites de la pauta con margen
    if (
      drawn.x < minX - 35 ||
      drawn.x > maxX + 35 ||
      drawn.y < minY - 35 ||
      drawn.y > maxY + 35
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

  // Si tiene demasiados garabatos
  if (scribbleRatio > 0.46) {
    return {
      isValid: false,
      status: 'scribble',
      score: Math.round(precisionPercent * 0.7),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: '¡Muchos garabatos fuera de las líneas!',
      hint: 'Usa la goma para borrar los garabatos y mantén el trazo sobre las letras.',
    };
  }

  // Si no cubrió suficiente de la palabra
  if (coverageRatio < 0.48) {
    return {
      isValid: false,
      status: 'incomplete',
      score: Math.round(coveragePercent),
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 0,
      message: `¡Te falta repasar partes de la palabra! (${coveragePercent}% completado)`,
      hint: 'Sigue todas las letras con tu crayón favorito.',
    };
  }

  // Válido
  const rawScore = coverageRatio * 0.65 + precisionRatio * 0.35;
  const score = Math.min(100, Math.max(55, Math.round(rawScore * 100)));

  if (score >= 82) {
    return {
      isValid: true,
      status: 'excellent',
      score,
      coverage: coveragePercent,
      precision: precisionPercent,
      stars: 3,
      message: `¡Hermoso trazo de "${targetWord}"! ¡Precisión del ${score}%! ⭐⭐⭐`,
      hint: '¡Tienes una caligrafía espectacular digna de una campeona!',
    };
  }

  return {
    isValid: true,
    status: 'good',
    score,
    coverage: coveragePercent,
    precision: precisionPercent,
    stars: 2,
    message: `¡Muy bien escrita la palabra "${targetWord}"! (${score}%) ⭐⭐`,
    hint: '¡Tu letra es cada día más clara y bonita!',
  };
}

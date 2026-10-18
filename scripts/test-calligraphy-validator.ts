/**
 * Unit tests for Handwriting / Calligraphy Validator for children 6-7 years old.
 */

import { validateLetterDrawing, validateWordCalligraphy } from '../src/utils/calligraphyValidator';

console.log('========================================================');
console.log('✍️  PROBANDO VALIDADOR DE ESCRITURA A MANO (CALIGRAFÍA)...');
console.log('========================================================\n');

let total = 0;
let passed = 0;

function it(desc: string, fn: () => void) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ ${desc}`);
  } catch (err: any) {
    console.error(`  ❌ ${desc}:`, err.message || err);
  }
}

function expect(val: any) {
  return {
    toBe(expected: any) {
      if (val !== expected) throw new Error(`Expected ${expected} but received ${val}`);
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (val < expected) throw new Error(`Expected ${val} >= ${expected}`);
    },
    toBeTruthy() {
      if (!val) throw new Error(`Expected truthy but received ${val}`);
    },
    toBeFalsy() {
      if (val) throw new Error(`Expected falsy but received ${val}`);
    }
  };
}

// Global document mock for offscreen canvas when running in node/bun without DOM
global.document = {
  createElement(tag: string) {
    if (tag === 'canvas') {
      return {
        width: 360,
        height: 280,
        getContext() {
          return {
            getImageData(x: number, y: number, w: number, h: number) {
              const data = new Uint8ClampedArray(w * h * 4);
              // Mock realistic guide points in the middle
              for (let cy = 90; cy <= 150; cy += 4) {
                for (let cx = 100; cx <= 260; cx += 4) {
                  const idx = (cy * w + cx) * 4;
                  data[idx + 3] = 255;
                }
              }
              return { data, width: w, height: h };
            },
            fillText() {},
            strokeText() {},
            beginPath() {},
            stroke() {},
            save() {},
            restore() {},
            translate() {},
            scale() {},
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            fillStyle: '',
            strokeStyle: '',
          };
        }
      };
    }
    return {};
  }
} as any;

// Helper to create mock child canvas with crayon thickness
function createMockCrayonCanvas(
  width: number,
  height: number,
  strokes: Array<{ startX: number; startY: number; endX: number; endY: number }>
) {
  const pixelMap = new Set<string>();

  // Draw strokes with radius 6 (crayon thickness)
  strokes.forEach(s => {
    const steps = Math.max(Math.abs(s.endX - s.startX), Math.abs(s.endY - s.startY), 1);
    for (let i = 0; i <= steps; i += 2) {
      const cx = Math.round(s.startX + (s.endX - s.startX) * (i / steps));
      const cy = Math.round(s.startY + (s.endY - s.startY) * (i / steps));
      for (let ox = -6; ox <= 6; ox += 2) {
        for (let oy = -6; oy <= 6; oy += 2) {
          if (ox * ox + oy * oy <= 36) {
            pixelMap.add(`${cx + ox},${cy + oy}`);
          }
        }
      }
    }
  });

  return {
    width,
    height,
    getContext() {
      return {
        getImageData(x: number, y: number, w: number, h: number) {
          const data = new Uint8ClampedArray(w * h * 4);
          for (let cy = 0; cy < h; cy++) {
            for (let cx = 0; cx < w; cx++) {
              if (pixelMap.has(`${cx},${cy}`)) {
                const idx = (cy * w + cx) * 4;
                data[idx + 3] = 255;
              }
            }
          }
          return { data, width: w, height: h };
        }
      };
    }
  } as unknown as HTMLCanvasElement;
}

// Tests
it('1. Rechaza lienzo vacío o casi vacío', () => {
  const emptyCanvas = createMockCrayonCanvas(280, 280, []);
  const res = validateLetterDrawing(emptyCanvas, { letterChar: 'A' });
  expect(res.isValid).toBeFalsy();
  expect(res.status).toBe('empty');
});

it('2. Acepta trazo infantil auténtico sobre la letra con tolerancia generosa (40px)', () => {
  // Simular trazo de la letra I por una niña de 6 años
  const canvas = createMockCrayonCanvas(280, 280, [
    { startX: 140, startY: 70, endX: 140, endY: 230 },
  ]);
  const res = validateLetterDrawing(canvas, {
    letterChar: 'I',
    toleranceRadius: 40,
    minCoverageThreshold: 0.16,
    maxScribbleRatio: 0.70,
  });
  expect(res.isValid).toBeTruthy();
  expect(res.stars).toBeGreaterThanOrEqual(2);
});

it('3. Valida caligrafía de palabra en pauta Montessori con progresión horizontal', () => {
  // Simular palabra "SOL" escrita a lo largo de la pauta de x=100 a x=250
  const canvas = createMockCrayonCanvas(360, 220, [
    { startX: 100, startY: 110, endX: 140, endY: 110 },
    { startX: 150, startY: 110, endX: 190, endY: 110 },
    { startX: 200, startY: 110, endX: 250, endY: 110 },
  ]);
  const res = validateWordCalligraphy(canvas, 'SOL', {
    toleranceRadius: 44,
    minCoverageThreshold: 0.15,
    maxScribbleRatio: 0.72,
  });
  expect(res.isValid).toBeTruthy();
  expect(res.stars).toBeGreaterThanOrEqual(2);
});

it('4. Tolera toques de palma sin marcar como garabato cuando la letra está trazada', () => {
  // Trazo de letra + toque de palma en la esquina inferior derecha
  const canvas = createMockCrayonCanvas(280, 280, [
    { startX: 140, startY: 80, endX: 140, endY: 220 }, // trazo
    { startX: 260, startY: 260, endX: 265, endY: 265 }, // palma en esquina
  ]);
  const res = validateLetterDrawing(canvas, {
    letterChar: 'I',
    toleranceRadius: 40,
    minCoverageThreshold: 0.16,
    maxScribbleRatio: 0.70,
  });
  expect(res.isValid).toBeTruthy();
  expect(res.status).toBe('excellent');
});

console.log('\n========================================================');
console.log(`📊 RESULTADO PRUEBAS DE CALIGRAFÍA: ${passed}/${total} PASADAS`);
console.log('========================================================');

if (passed < total) {
  process.exit(1);
}

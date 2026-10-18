/**
 * Comprehensive Validation Test Suite for Palabritas Educational Content
 * Tests all activities, worlds, exercises, syllables, and validation logic.
 */

import { ALPHABET_DATA } from '../src/data/alphabetData';
import { WORLDS_DATA } from '../src/data/worldsData';
import { TWENTY_WORLD_EXERCISES } from '../src/data/exercisesData';
import { WRITING_ALPHABET_DATA, ALPHABET_KEYS } from '../src/data/writingWordsData';
import { ALL_STORIES } from '../src/data/cuentosData';

let errorsCount = 0;
let warningsCount = 0;
let testsCount = 0;

function assert(condition: boolean, message: string) {
  testsCount++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    errorsCount++;
  }
}

console.log('====================================================');
console.log('🧪 VALIDANDO DATOS PEDAGÓGICOS DE PALABRITAS...');
console.log('====================================================\n');

// 1. Validar ALPHABET_DATA (Letras de la A a la Z + Ñ)
console.log('1️⃣ Validando ALPHABET_DATA (Abecedario y Ejercicios)...');
assert(ALPHABET_DATA.length >= 27, `Debe haber al menos 27 letras en ALPHABET_DATA (encontradas: ${ALPHABET_DATA.length})`);

ALPHABET_DATA.forEach((item, idx) => {
  assert(Boolean(item.letter && item.letter.length >= 1), `Letra en índice ${idx} debe tener letra válida`);
  assert(Boolean(item.name), `Letra ${item.letter} debe tener nombre fonético`);
  assert(Boolean(item.phoneme), `Letra ${item.letter} debe tener fonema`);
  assert(Boolean(item.exampleWord), `Letra ${item.letter} debe tener palabra ejemplo`);
  assert(Boolean(item.missingSyllable), `Letra ${item.letter} debe tener sílaba faltante`);
  assert(Boolean(item.givenSyllable), `Letra ${item.letter} debe tener sílaba dada`);
  assert(Array.isArray(item.distractors) && item.distractors.length >= 2, `Letra ${item.letter} debe tener distractores`);

  // Asegurar que los distractores no contengan la respuesta correcta
  const missingUpper = item.missingSyllable.toUpperCase().trim();
  const hasDuplicate = item.distractors.some(d => d.toUpperCase().trim() === missingUpper);
  assert(!hasDuplicate, `En letra ${item.letter}, distractores no deben incluir la respuesta correcta '${missingUpper}'`);
});
console.log(`✅ ${ALPHABET_DATA.length} letras de ALPHABET_DATA validadas exitosamente.\n`);

// 2. Validar WORLDS_DATA (Mundos de Aventura 1 a 28+)
console.log('2️⃣ Validando WORLDS_DATA (Ruta de Mundos)...');
assert(WORLDS_DATA.length >= 28, `Debe haber al menos 28 mundos (encontrados: ${WORLDS_DATA.length})`);

WORLDS_DATA.forEach((w, idx) => {
  const expectedId = idx + 1;
  assert(w.id === expectedId, `El mundo en índice ${idx} debe tener id=${expectedId} (tiene ${w.id})`);
  assert(Boolean(w.title), `Mundo ${w.id} debe tener título`);
  assert(Boolean(w.focusLetter), `Mundo ${w.id} debe tener focusLetter`);
  assert(Boolean(w.targetWord), `Mundo ${w.id} debe tener targetWord`);
  assert(Boolean(w.targetEmoji), `Mundo ${w.id} debe tener targetEmoji`);
  assert(w.maxStars === 3, `Mundo ${w.id} debe tener maxStars = 3`);
  assert(Array.isArray(w.letters) && w.letters.length > 0, `Mundo ${w.id} debe tener lista de letras`);
});
console.log(`✅ ${WORLDS_DATA.length} mundos de WORLDS_DATA validados exitosamente.\n`);

// 3. Validar TWENTY_WORLD_EXERCISES (Actividades diarias por mundo)
console.log('3️⃣ Validando TWENTY_WORLD_EXERCISES (Retos Diarios de Cada Mundo)...');
const worldKeys = Object.keys(TWENTY_WORLD_EXERCISES).map(Number);
assert(worldKeys.length >= 28, `Debe haber ejercicios para los mundos (encontrados: ${worldKeys.length})`);

worldKeys.forEach(id => {
  const ex = TWENTY_WORLD_EXERCISES[id];
  assert(Boolean(ex), `Mundo ${id} debe tener ejercicios definidos`);
  if (!ex) return;

  assert(ex.worldId === id, `worldId de ejercicio (${ex.worldId}) debe coincidir con ${id}`);
  assert(Boolean(ex.letter), `Mundo ${id} debe tener letter definida`);
  assert(Boolean(ex.targetWord), `Mundo ${id} debe tener targetWord`);
  assert(Boolean(ex.targetEmoji), `Mundo ${id} debe tener targetEmoji`);
  assert(Array.isArray(ex.syllables) && ex.syllables.length >= 2, `Mundo ${id} debe tener al menos 2 sílabas`);
  assert(Boolean(ex.missingSyllable), `Mundo ${id} debe tener missingSyllable`);
  assert(Boolean(ex.givenSyllable), `Mundo ${id} debe tener givenSyllable`);
  assert(Array.isArray(ex.distractors) && ex.distractors.length >= 3, `Mundo ${id} debe tener distractores`);

  // Modo Martes: Caza de Sonidos (Burbujas)
  assert(Boolean(ex.soundPrompt), `Mundo ${id} debe tener soundPrompt`);
  assert(Boolean(ex.soundTarget), `Mundo ${id} debe tener soundTarget`);
  assert(Array.isArray(ex.soundBubbles) && ex.soundBubbles.length >= 4, `Mundo ${id} debe tener soundBubbles`);
  const hasCorrectBubble = ex.soundBubbles.some(b => b.isCorrect);
  assert(hasCorrectBubble, `Mundo ${id} soundBubbles debe contener al menos una burbuja correcta`);

  // Modo Miércoles: Une Palabra e Imagen
  assert(Boolean(ex.wordMatchPrompt), `Mundo ${id} debe tener wordMatchPrompt`);
  assert(Array.isArray(ex.wordMatchOptions) && ex.wordMatchOptions.length >= 4, `Mundo ${id} debe tener wordMatchOptions`);
  const targetWordClean = ex.targetWord.toUpperCase().trim();
  const hasTargetInOptions = ex.wordMatchOptions.some(opt => opt.toUpperCase().trim() === targetWordClean);
  assert(hasTargetInOptions, `Mundo ${id} wordMatchOptions debe incluir la palabra correcta '${targetWordClean}'`);

  // Modo Jueves: Trazo Mágico
  assert(Boolean(ex.strokeGuidePrompt), `Mundo ${id} debe tener strokeGuidePrompt`);
  assert(Array.isArray(ex.strokeSteps) && ex.strokeSteps.length >= 2, `Mundo ${id} debe tener strokeSteps`);

  // Modo Viernes: Ordena Sílabas
  assert(Array.isArray(ex.shuffledPieces) && ex.shuffledPieces.length >= 2, `Mundo ${id} debe tener shuffledPieces`);
});
console.log(`✅ ${worldKeys.length} mundos de TWENTY_WORLD_EXERCISES validados exitosamente.\n`);

// 4. Validar WRITING_ALPHABET_DATA (Palabras para escribir A-Z)
console.log('4️⃣ Validando WRITING_ALPHABET_DATA (Diccionario de Escritura)...');
assert(ALPHABET_KEYS.length >= 26, `Debe haber al menos 26 letras en ALPHABET_KEYS (encontradas: ${ALPHABET_KEYS.length})`);

let totalWordsCount = 0;
ALPHABET_KEYS.forEach(key => {
  const data = WRITING_ALPHABET_DATA[key];
  assert(Boolean(data), `Letra ${key} debe existir en WRITING_ALPHABET_DATA`);
  if (!data) return;

  assert(Array.isArray(data.words) && data.words.length > 0, `Letra ${key} debe tener palabras asociadas`);
  data.words.forEach(w => {
    totalWordsCount++;
    assert(Boolean(w.id), `Palabra de letra ${key} debe tener id`);
    assert(Boolean(w.word), `Palabra ${w.id} debe tener 'word'`);
    assert(Boolean(w.displayWord), `Palabra ${w.id} debe tener 'displayWord'`);
    assert(Boolean(w.phoneticHint), `Palabra ${w.id} debe tener 'phoneticHint'`);
    assert(Array.isArray(w.syllables) && w.syllables.length > 0, `Palabra ${w.id} debe tener sílabas`);
  });
});
console.log(`✅ ${totalWordsCount} palabras de escritura validadas exitosamente.\n`);

// 5. Validar ALL_STORIES (Biblioteca de 40 Cuentos Decodificables)
console.log('5️⃣ Validando ALL_STORIES (Biblioteca de Cuentos)...');
assert(ALL_STORIES.length >= 40, `Debe haber 40 cuentos en ALL_STORIES (encontrados: ${ALL_STORIES.length})`);

ALL_STORIES.forEach((story, idx) => {
  const expectedId = idx + 1;
  assert(story.id === expectedId, `Cuento en índice ${idx} debe tener id=${expectedId}`);
  assert(Boolean(story.title), `Cuento ${story.id} debe tener título`);
  assert(Boolean(story.emoji), `Cuento ${story.id} debe tener emoji`);
  assert(Array.isArray(story.pages) && story.pages.length > 0, `Cuento ${story.id} debe tener al menos una página`);
  story.pages.forEach((page, pIdx) => {
    assert(Array.isArray(page.lines) && page.lines.length > 0, `Cuento ${story.id} pág ${pIdx + 1} debe tener líneas`);
    page.lines.forEach((line, lIdx) => {
      assert(Array.isArray(line.words) && line.words.length > 0, `Cuento ${story.id} pág ${pIdx + 1} línea ${lIdx + 1} debe tener palabras`);
      line.words.forEach(w => {
        assert(Boolean(w.display), `Palabra en cuento ${story.id} debe tener display`);
        assert(Boolean(w.clean), `Palabra en cuento ${story.id} debe tener clean`);
        assert(Boolean(w.syllables), `Palabra en cuento ${story.id} debe tener syllables`);
      });
    });
  });
});
console.log(`✅ ${ALL_STORIES.length} cuentos de ALL_STORIES validados exitosamente.\n`);

// Resumen Final
console.log('====================================================');
console.log(`📊 RESULTADO DE LA VALIDACIÓN PEDAGÓGICA:`);
console.log(`Total pruebas ejecutadas: ${testsCount}`);
console.log(`Errores encontrados: ${errorsCount}`);
console.log(`Advertencias: ${warningsCount}`);
console.log('====================================================');

if (errorsCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ¡TODAS LAS ACTIVIDADES Y EJERCICIOS PASARON AL 100%!');
  process.exit(0);
}

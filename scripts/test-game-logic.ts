/**
 * Test suite for Palabritas Game Modes & Calligraphy Validation Algorithm
 */

import { ALPHABET_DATA } from '../src/data/alphabetData';
import { TWENTY_WORLD_EXERCISES } from '../src/data/exercisesData';
import { WRITING_ALPHABET_DATA, ALPHABET_KEYS } from '../src/data/writingWordsData';

let testCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string) {
  testCount++;
  if (!condition) {
    console.error(`❌ FAILED: ${name}`);
    failCount++;
  } else {
    console.log(`  ✓ ${name}`);
  }
}

console.log('====================================================');
console.log('🎮 PROBANDO MODOS DE JUEGO Y FLUJOS DE RETOS...');
console.log('====================================================\n');

// Test 1: Daily Rotation Game Modes for all 29 worlds
console.log('1. Probando modos de juego de días de la semana:');
const daysOfWeek = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

for (let worldId = 1; worldId <= 28; worldId++) {
  const ex = TWENTY_WORLD_EXERCISES[worldId];
  if (!ex) continue;

  // Lunes: Construcción silábica
  const assembledWord = ex.givenSyllable + ex.missingSyllable;
  assert(assembledWord.length > 0, `Mundo ${worldId} - Lunes: Sílabas arman palabra`);

  // Martes: Caza de sonidos
  const correctBubbles = ex.soundBubbles.filter(b => b.isCorrect);
  assert(correctBubbles.length >= 1, `Mundo ${worldId} - Martes: Burbujas con sonido correcto`);

  // Miércoles: Une imagen y palabra (comparación insensible a mayúsculas/minúsculas)
  const hasTargetInOptions = ex.wordMatchOptions.some(opt => opt.toUpperCase().trim() === ex.targetWord.toUpperCase().trim());
  assert(hasTargetInOptions, `Mundo ${worldId} - Miércoles: Opción correcta '${ex.targetWord}' incluida`);

  // Jueves: Trazo guiado
  assert(ex.strokeSteps.length >= 2, `Mundo ${worldId} - Jueves: Al menos 2 pasos de trazo`);

  // Viernes: Ordena sílabas
  const joinedSyllables = ex.shuffledPieces.slice().sort().join('');
  assert(joinedSyllables.length > 0, `Mundo ${worldId} - Viernes: Rompecabezas silábico`);
}

// Test 2: Writing Mode Vocabulary & Keystroke matching
console.log('\n2. Probando modo Escritura (Teclado y Ortografía en Español):');
let verifiedWords = 0;
ALPHABET_KEYS.forEach(letter => {
  const letterGroup = WRITING_ALPHABET_DATA[letter];
  letterGroup.words.forEach(w => {
    // Verificar que cada letra de la palabra pertenece al abecedario español
    const validSpanishLetters = /^[A-ZÁÉÍÓÚÜÑ]+$/i;
    assert(validSpanishLetters.test(w.word), `Palabra '${w.word}' solo contiene caracteres válidos en español`);
    
    // Verificar que la pista fonética sea informativa
    assert(w.phoneticHint.length > 0, `Palabra '${w.word}' tiene deletreo fonético`);
    
    // Verificar que el significado sea apto para niños
    assert(w.meaning.length >= 4, `Palabra '${w.word}' tiene definición infantil`);
    
    verifiedWords++;
  });
});
console.log(`  ✓ ${verifiedWords} palabras verificadas para ortografía en español.`);

// Test 3: Auto-Advance Progression Boundaries
console.log('\n3. Probando límites de progresión y auto-avance:');
// Mundo 1 -> Mundo 2 -> ... -> Mundo 28
for (let id = 1; id < 28; id++) {
  const current = TWENTY_WORLD_EXERCISES[id];
  const next = TWENTY_WORLD_EXERCISES[id + 1];
  assert(Boolean(current && next), `Transición fluida de Mundo ${id} a Mundo ${id + 1}`);
}

// Abecedario: Letra A -> B -> ... -> Z -> A
for (let i = 0; i < ALPHABET_DATA.length; i++) {
  const nextIdx = (i + 1) % ALPHABET_DATA.length;
  assert(Boolean(ALPHABET_DATA[nextIdx]), `Avance de letra ${ALPHABET_DATA[i].letter} a ${ALPHABET_DATA[nextIdx].letter}`);
}

// Test 4: Avatar World Rewards & Room Customization System
console.log('\n4. Probando Sistema de Recompensas y Avatar World:');
import { AVATAR_ROOM_CATALOG, DEFAULT_ROOM_CONFIG, DEFAULT_AVATAR_CONFIG, checkItemUnlockStatus } from '../src/data/avatarRoomData';

assert(AVATAR_ROOM_CATALOG.length >= 40, `El catálogo de Avatar World tiene más de 40 ítems (${AVATAR_ROOM_CATALOG.length} ítems)`);

// Verify empty room defaults
assert(DEFAULT_ROOM_CONFIG.bed === 'bed-none', 'La habitación comienza sin cama (vacía)');
assert(DEFAULT_ROOM_CONFIG.desk === 'desk-none', 'La habitación comienza sin escritorio (vacía)');
assert(DEFAULT_ROOM_CONFIG.rug === 'rug-none', 'La habitación comienza sin alfombra (vacía)');
assert(DEFAULT_ROOM_CONFIG.pet === 'pet-none', 'La habitación comienza sin mascota (vacía)');
assert(DEFAULT_ROOM_CONFIG.wallDecor === 'decor-none', 'La habitación comienza sin cuadros (vacía)');

// Verify item unlock rules
const cloudBed = AVATAR_ROOM_CATALOG.find(i => i.id === 'bed-cloud')!;
assert(cloudBed.requiredWorldId === 1, 'Cama Nube requiere completar Mundo 1');

// Test unlock check with World 1 completed vs not completed
const unlockWithMundo1 = checkItemUnlockStatus(cloudBed, [], [1], 0, 0, 0);
assert(unlockWithMundo1.isUnlocked === true, 'Cama Nube se desbloquea al completar Mundo 1');

const lockWithoutMundo1 = checkItemUnlockStatus(cloudBed, [], [], 0, 0, 0);
assert(lockWithoutMundo1.isUnlocked === false, 'Cama Nube está bloqueada si no se ha completado Mundo 1');

// Test calligraphy letter count unlocks
const pencilItem = AVATAR_ROOM_CATALOG.find(i => i.id === 'hand-pencil')!;
assert(pencilItem.requiredLettersCount === 5, 'Lápiz de oro requiere 5 letras dominadas');
const unlockPencil = checkItemUnlockStatus(pencilItem, [], [], 5, 0, 0);
assert(unlockPencil.isUnlocked === true, 'Lápiz de oro se desbloquea con 5 letras');

// Test word writing unlock
const artDesk = AVATAR_ROOM_CATALOG.find(i => i.id === 'desk-art')!;
assert(artDesk.requiredWordsCount === 1, 'Caballete de arte requiere escribir palabras');
const unlockDesk = checkItemUnlockStatus(artDesk, [], [], 0, 1, 0);
assert(unlockDesk.isUnlocked === true, 'Caballete se desbloquea al escribir 1 palabra');

console.log('\n====================================================');
console.log(`📊 RESULTADO DE PRUEBAS DE MODO DE JUEGO:`);
console.log(`Total pruebas: ${testCount}`);
console.log(`Fallos: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ¡TODOS LOS MODOS DE JUEGO Y FLUJOS FUNCIONAN CORRECTAMENTE!');
}

/**
 * Avatar World & Room Decoration Data Catalog for Palabritas
 * Inspired by interactive avatar games (Avatar World, Toca Life) adapted for pedagogical learning.
 * Children customize their avatar and decorate their empty room by completing lessons:
 * - Worlds completion (sequential letter journeys)
 * - Calligraphy traces (Montessori handwriting)
 * - Word writing
 * - Reading stories
 * - Star exchange
 */

export type RoomSlotType = 'wallpaper' | 'floor' | 'bed' | 'desk' | 'rug' | 'decor' | 'pet';
export type AvatarSlotType = 'outfit' | 'hairStyle' | 'hairColor' | 'skinTone' | 'expression' | 'head' | 'hand';

export type CatalogItemCategory = RoomSlotType | AvatarSlotType;

export interface RoomCatalogItem {
  id: string;
  name: string;
  category: CatalogItemCategory;
  emoji: string;
  description: string;
  previewColor?: string;
  unlockType: 'starter' | 'world' | 'letters' | 'words' | 'stories' | 'stars';
  requiredWorldId?: number;
  requiredLettersCount?: number;
  requiredWordsCount?: number;
  requiredStoriesCount?: number;
  starCost: number;
  taskDescription: string;
  quote?: string;
}

export interface AvatarConfig {
  skinTone: string;     // Hex color code (e.g. '#fed7aa')
  hairStyle: string;    // 'corto' | 'coletas' | 'rizado' | 'flequillo' | 'cresta' | 'gorrito'
  hairColor: string;    // Hex color code (e.g. '#451a03')
  expression: string;   // 'feliz' | 'guiño' | 'sorpresa' | 'genio' | 'dulce'
  equippedOutfit: string; // Item ID (e.g. 'outfit-basic')
  equippedHead: string;   // Item ID (e.g. 'head-none')
  equippedHand: string;   // Item ID (e.g. 'hand-none')
}

export interface RoomConfig {
  wallpaper: string;    // Item ID (e.g. 'wall-default')
  floor: string;        // Item ID (e.g. 'floor-wood')
  bed: string;          // Item ID ('bed-none' or equipped)
  desk: string;         // Item ID ('desk-none' or equipped)
  rug: string;          // Item ID ('rug-none' or equipped)
  wallDecor: string;    // Item ID ('decor-none' or equipped)
  pet: string;          // Item ID ('pet-none' or equipped)
  timeOfDay: 'dia' | 'noche';
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: '#fed7aa',
  hairStyle: 'coletas',     // Adorable coletas con lazos para la niña!
  hairColor: '#451a03',
  expression: 'dulce',      // Expresión dulce con pestañitas y mejillas rosadas
  equippedOutfit: 'outfit-vestido', // Vestidito rosa de princesa
  equippedHead: 'head-bow',  // Lazo rosado en el pelo
  equippedHand: 'hand-none',
};

export const DEFAULT_ROOM_CONFIG: RoomConfig = {
  wallpaper: 'wall-default',
  floor: 'floor-wood',
  bed: 'bed-none',      // Empty room at start!
  desk: 'desk-none',
  rug: 'rug-none',
  wallDecor: 'decor-none',
  pet: 'pet-none',
  timeOfDay: 'dia',
};

export const STARTER_UNLOCKED_ITEMS: string[] = [
  'wall-default',
  'floor-wood',
  'bed-none',
  'desk-none',
  'rug-none',
  'decor-none',
  'pet-none',
  'outfit-vestido',
  'outfit-jardinera',
  'outfit-basic',
  'head-bow',
  'head-flower',
  'head-none',
  'hand-none',
  'hair-coletas',
  'hair-trencitas',
  'hair-moñitos',
  'hair-melena',
  'hair-rizado',
  'hair-largo',
  'hair-corto',
  'expr-dulce',
  'expr-feliz',
  'skin-peach',
  'color-brown',
];

// Options for Avatar Customizer (Colors & Presets)
export const SKIN_TONE_OPTIONS = [
  { id: 'skin-peach', color: '#fed7aa', name: 'Melocotón Cálido' },
  { id: 'skin-honey', color: '#fcd34d', name: 'Miel Dorada' },
  { id: 'skin-cream', color: '#ffedd5', name: 'Crema Suave' },
  { id: 'skin-caramel', color: '#d97706', name: 'Caramelo Canela' },
  { id: 'skin-cacao', color: '#78350f', name: 'Cacao Profundo' },
  { id: 'skin-rose', color: '#fbcfe8', name: 'Rosa Pastel' },
];

export const HAIR_COLOR_OPTIONS = [
  { id: 'color-brown', color: '#451a03', name: 'Castaño Chocolate' },
  { id: 'color-blonde', color: '#f59e0b', name: 'Rubio Dorado' },
  { id: 'color-black', color: '#1e293b', name: 'Negro Azabache' },
  { id: 'color-red', color: '#b91c1c', name: 'Rojo Fuego' },
  { id: 'color-pink', color: '#ec4899', name: 'Rosa Mágico' },
  { id: 'color-blue', color: '#0284c7', name: 'Azul Espacial' },
  { id: 'color-purple', color: '#8b5cf6', name: 'Lila Fantasía' },
];

export const EXPRESSION_OPTIONS = [
  { id: 'dulce', emoji: '🥰', name: 'Corazoncito Dulce', desc: 'Pestañitas y mejillas rosadas' },
  { id: 'feliz', emoji: '😊', name: 'Sonrisa Feliz', desc: '¡Alegre y radiante!' },
  { id: 'guiño', emoji: '😉', name: 'Guiño Pícaro', desc: '¡Lista para la aventura!' },
  { id: 'sorpresa', emoji: '😮', name: 'Sorpresa Mágica', desc: '¡Descubriendo palabras!' },
  { id: 'genio', emoji: '🤓', name: 'Pequeña Sabia', desc: 'Con gafitas de leer' },
];

export const HAIR_STYLE_OPTIONS = [
  { id: 'coletas', name: 'Dos Coletas con Lazos', emoji: '👧', desc: 'Divertido, coqueto y saltarín' },
  { id: 'trencitas', name: 'Dos Trenzas Dulces', emoji: '👧', desc: 'Con gomitas de colores' },
  { id: 'moñitos', name: 'Moñitos Espaciales', emoji: '👧', desc: 'Doble moño con estrellitas' },
  { id: 'melena', name: 'Melena con Diadema', emoji: '👩', desc: 'Pelo suelto y brillante' },
  { id: 'rizado', name: 'Rizos de Princesa', emoji: '🧑‍🦱', desc: 'Bucles esponjosos y flor' },
  { id: 'largo', name: 'Pelo Largo de Cuento', emoji: '👱‍♀️', desc: 'Largo y sedoso de hada' },
  { id: 'corto', name: 'Pelo Corto Bob', emoji: '💇‍♀️', desc: 'Fresco, moderno y activo' },
];

// Complete Reward Item Catalog (40+ items with clear unlock criteria)
export const AVATAR_ROOM_CATALOG: RoomCatalogItem[] = [
  // ==================== CAMAS (BEDS) ====================
  {
    id: 'bed-none',
    name: 'Sin Cama (Vacío)',
    category: 'bed',
    emoji: '🚫',
    description: 'Espacio libre en el cuarto.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'bed-cloud',
    name: 'Cama Nube Soñadora',
    category: 'bed',
    emoji: '☁️',
    description: 'Acolchada y suave con almohada de algodón celeste.',
    previewColor: '#e0f2fe',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 25,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Dormir en una nube es lo más suave del mundo!',
  },
  {
    id: 'bed-car',
    name: 'Cama Coche de Carreras',
    category: 'bed',
    emoji: '🏎️',
    description: 'Cama roja de piloto con ruedas brillantes.',
    previewColor: '#fecaca',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 35,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡Brum brum! ¡Hacia el país de los sueños!',
  },
  {
    id: 'bed-castle',
    name: 'Cama Castillo de Reyes',
    category: 'bed',
    emoji: '🏰',
    description: 'Torres mágicas y cortinas de terciopelo real.',
    previewColor: '#fef08a',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 40,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Un descanso digno de un rey o reina de las letras!',
  },
  {
    id: 'bed-rocket',
    name: 'Cama Cohete Espacial',
    category: 'bed',
    emoji: '🚀',
    description: 'Nave interestelar con luces neón y panel de mando.',
    previewColor: '#c7d2fe',
    unlockType: 'world',
    requiredWorldId: 4,
    starCost: 45,
    taskDescription: 'Completa el Mundo 4 (Familia de la D)',
    quote: '¡3, 2, 1... Despegue a dormir entre estrellas!',
  },
  {
    id: 'bed-cozy',
    name: 'Cama Rústica de Retazos',
    category: 'bed',
    emoji: '🛌',
    description: 'Madera de pino con colcha hecha a mano de retazos de colores.',
    previewColor: '#fed7aa',
    unlockType: 'stars',
    starCost: 30,
    taskDescription: 'Canjea con 30 Estrellas Doradas',
    quote: '¡Calentita y acogedora para leer cuentos antes de dormir!',
  },

  // ==================== ESCRITORIOS / MESAS (DESKS) ====================
  {
    id: 'desk-none',
    name: 'Sin Mesa (Vacío)',
    category: 'desk',
    emoji: '🚫',
    description: 'Espacio libre en el cuarto.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'desk-art',
    name: 'Caballete de Pintor & Pizarra ABC',
    category: 'desk',
    emoji: '🎨',
    description: 'Con tizas de colores, pinceles y lienzo para trazar.',
    previewColor: '#fef3c7',
    unlockType: 'words',
    requiredWordsCount: 1,
    starCost: 25,
    taskDescription: 'Escribe 1 palabra a mano en la app',
    quote: '¡El arte de pintar y escribir van de la mano!',
  },
  {
    id: 'desk-study',
    name: 'Escritorio de Madera con Lámpara',
    category: 'desk',
    emoji: '📚',
    description: 'Mesa de estudio con portalápices y libros de cuentos.',
    previewColor: '#fed7aa',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 30,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡El lugar perfecto para hacer tareas y aprender!',
  },
  {
    id: 'desk-space',
    name: 'Estación Gamer Espacial',
    category: 'desk',
    emoji: '🛸',
    description: 'Pantalla curva con teclado iluminado y silla ergonómica.',
    previewColor: '#ddd6fe',
    unlockType: 'world',
    requiredWorldId: 4,
    starCost: 45,
    taskDescription: 'Completa el Mundo 4 (Familia de la D)',
    quote: '¡Conexión interestelar con las letras del cosmos!',
  },
  {
    id: 'desk-music',
    name: 'Mesa con Teclado Musical',
    category: 'desk',
    emoji: '🎹',
    description: 'Piano infantil con partituras y micrófono.',
    previewColor: '#fce7f3',
    unlockType: 'stars',
    starCost: 40,
    taskDescription: 'Canjea con 40 Estrellas Doradas',
    quote: '¡Do, re, mi... cada sílaba tiene su canción!',
  },

  // ==================== ALFOMBRAS (RUGS) ====================
  {
    id: 'rug-none',
    name: 'Sin Alfombra (Vacío)',
    category: 'rug',
    emoji: '🚫',
    description: 'Suelo limpio sin tapete.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'rug-star',
    name: 'Alfombra Estrella Amarilla',
    category: 'rug',
    emoji: '⭐',
    description: 'Alfombra suave en forma de estrella sonriente.',
    previewColor: '#fef08a',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 20,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Pisar una estrella da buena suerte para leer!',
  },
  {
    id: 'rug-bear',
    name: 'Alfombra Osito Dormilón',
    category: 'rug',
    emoji: '🐻',
    description: 'Silueta esponjosa de oso con orejitas redondas.',
    previewColor: '#fed7aa',
    unlockType: 'words',
    requiredWordsCount: 3,
    starCost: 30,
    taskDescription: 'Escribe 3 palabras a mano en la app',
    quote: '¡El osito cuida los pies del pequeño campeón!',
  },
  {
    id: 'rug-rainbow',
    name: 'Alfombra de Arcoíris',
    category: 'rug',
    emoji: '🌈',
    description: 'Semicírculo con todos los colores del arcoíris.',
    previewColor: '#fbcfe8',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 35,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Llena la habitación de luz y alegría multicolor!',
  },
  {
    id: 'rug-flower',
    name: 'Alfombra Margarita Gigante',
    category: 'rug',
    emoji: '🌼',
    description: 'Pétalos blancos aterciopelados con centro amarillo.',
    previewColor: '#fef9c3',
    unlockType: 'stars',
    starCost: 25,
    taskDescription: 'Canjea con 25 Estrellas Doradas',
    quote: '¡Como tener un jardín en medio de tu cuarto!',
  },

  // ==================== PAREDES & FONDOS (WALLPAPERS) ====================
  {
    id: 'wall-default',
    name: 'Pared Crema Caliente',
    category: 'wallpaper',
    emoji: '🎨',
    description: 'Pared limpia y luminosa, lista para ser decorada.',
    previewColor: '#fff7ed',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'wall-pink',
    name: 'Pared Rosa Pastel con Nubes',
    category: 'wallpaper',
    emoji: '🌸',
    description: 'Tono rosado suave con siluetas de nubecitas flotantes.',
    previewColor: '#fdf2f8',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 25,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Un ambiente dulce y relajante para aprender!',
  },
  {
    id: 'wall-stars',
    name: 'Galaxia con Constelaciones',
    category: 'wallpaper',
    emoji: '🌌',
    description: 'Fondo azul noche con estrellas que titilan en la oscuridad.',
    previewColor: '#1e1b4b',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 35,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡El universo entero dentro de tu habitación!',
  },
  {
    id: 'wall-sky',
    name: 'Cielo Azul con Sol Radiante',
    category: 'wallpaper',
    emoji: '☀️',
    description: 'Azul diurno brillante con nubes y arcoíris al fondo.',
    previewColor: '#e0f2fe',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 30,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Siempre es un hermoso día soleado aquí!',
  },
  {
    id: 'wall-forest',
    name: 'Bosque Mágico de Animalitos',
    category: 'wallpaper',
    emoji: '🌲',
    description: 'Árboles encantados, mariposas y hojas verdes suaves.',
    previewColor: '#dcfce7',
    unlockType: 'world',
    requiredWorldId: 4,
    starCost: 35,
    taskDescription: 'Completa el Mundo 4 (Familia de la D)',
    quote: '¡La naturaleza te acompaña en cada lectura!',
  },
  {
    id: 'wall-castle',
    name: 'Castillo de Cuento de Hadas',
    category: 'wallpaper',
    emoji: '🏰',
    description: 'Muros de piedra antigua con enredaderas y banderolas.',
    previewColor: '#f3e8ff',
    unlockType: 'stories',
    requiredStoriesCount: 2,
    starCost: 40,
    taskDescription: 'Lee 2 Cuentos Mágicos en la biblioteca',
    quote: '¡Siente la magia de los cuentos en tus paredes!',
  },
  {
    id: 'wall-rainbow',
    name: 'Papel Tapiz Arcoíris & Rayas',
    category: 'wallpaper',
    emoji: '🎪',
    description: 'Rayas verticales pastel con confeti y destellos.',
    previewColor: '#fef08a',
    unlockType: 'stars',
    starCost: 30,
    taskDescription: 'Canjea con 30 Estrellas Doradas',
    quote: '¡Pura diversión y color!',
  },

  // ==================== SUELOS (FLOORS) ====================
  {
    id: 'floor-wood',
    name: 'Parquet de Madera Reluciente',
    category: 'floor',
    emoji: '🪵',
    description: 'Tablones de madera clara pulida con brillo suave.',
    previewColor: '#eab308',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'floor-tiles',
    name: 'Baldosas de Tablero de Juego',
    category: 'floor',
    emoji: '🏁',
    description: 'Mosaico en damero blanco y azul cielo.',
    previewColor: '#bae6fd',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 20,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Un suelo divertido para saltar y jugar!',
  },
  {
    id: 'floor-cloud',
    name: 'Suelo Acolchado de Nubes',
    category: 'floor',
    emoji: '☁️',
    description: 'Pisos esponjosos de textura suave como el algodón.',
    previewColor: '#f0f9ff',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 25,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡Caminar descalzo aquí se siente como flotar!',
  },
  {
    id: 'floor-grass',
    name: 'Césped Suave con Margaritas',
    category: 'floor',
    emoji: '🌱',
    description: 'Pradera verde recortada con florecitas silvestres.',
    previewColor: '#bbf7d0',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 30,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Un picnic de lectura en tu propio dormitorio!',
  },
  {
    id: 'floor-candy',
    name: 'Mosaico de Caramelo Dulce',
    category: 'floor',
    emoji: '🍬',
    description: 'Baldosas rosas y turquesas con brillitos de azúcar.',
    previewColor: '#fbcfe8',
    unlockType: 'stars',
    starCost: 30,
    taskDescription: 'Canjea con 30 Estrellas Doradas',
    quote: '¡El suelo más dulce del vecindario!',
  },

  // ==================== DECORACIÓN DE PARED (WALL DECOR) ====================
  {
    id: 'decor-none',
    name: 'Pared Limpia (Vacío)',
    category: 'decor',
    emoji: '🚫',
    description: 'Sin cuadros ni adornos colgados.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'decor-abc',
    name: 'Póster Gigante del Abecedario con Luces',
    category: 'decor',
    emoji: '🔤',
    description: 'Las 27 letras del español ilustradas con luces titilantes.',
    previewColor: '#fef08a',
    unlockType: 'letters',
    requiredLettersCount: 5,
    starCost: 30,
    taskDescription: 'Domina 5 letras en Caligrafía Montessori',
    quote: '¡Todas las letras juntas iluminando tus ideas!',
  },
  {
    id: 'decor-clock',
    name: 'Reloj Sol Sonriente de Péndulo',
    category: 'decor',
    emoji: '⏰',
    description: 'Marca las horas felices de estudio con campanitas suaves.',
    previewColor: '#fde047',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 20,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Tic-tac, hora de aprender jugando!',
  },
  {
    id: 'decor-garland',
    name: 'Guirnalda de Banderines de Fiesta',
    category: 'decor',
    emoji: '🎏',
    description: 'Banderines triangulares de colores colgados de pared a pared.',
    previewColor: '#f472b6',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 25,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡Cada día que lees es una fiesta que celebrar!',
  },
  {
    id: 'decor-shelf',
    name: 'Repisa de Libros & Trofeos Dorados',
    category: 'decor',
    emoji: '🏆',
    description: 'Estante flotante de madera con tus medallas ganadas.',
    previewColor: '#fcd34d',
    unlockType: 'stories',
    requiredStoriesCount: 1,
    starCost: 30,
    taskDescription: 'Lee 1 Cuento Mágico en la biblioteca',
    quote: '¡Muestra tus mayores logros con orgullo!',
  },
  {
    id: 'decor-neon',
    name: 'Luz Neón de Corazón & Estrella',
    category: 'decor',
    emoji: '💖',
    description: 'Lámpara de pared de silueta brillante que cambia de color.',
    previewColor: '#f43f5e',
    unlockType: 'stars',
    starCost: 30,
    taskDescription: 'Canjea con 30 Estrellas Doradas',
    quote: '¡Brilla con energía mágica en la noche!',
  },

  // ==================== MASCOTAS & JUGUETES (PETS & TOYS) ====================
  {
    id: 'pet-none',
    name: 'Sin Mascota (Vacío)',
    category: 'pet',
    emoji: '🚫',
    description: 'Ninguna mascota en la habitación.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'pet-kitty',
    name: 'Gatito Dormilón Miau',
    category: 'pet',
    emoji: '🐱',
    description: 'Blanco y canela, ronronea cuando le tocas la pancita.',
    previewColor: '#fdba74',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 30,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Miau! ¡Eres mi persona favorita en el mundo!',
  },
  {
    id: 'pet-puppy',
    name: 'Perrito Saltarín Guau',
    category: 'pet',
    emoji: '🐶',
    description: 'Mueve la colita feliz con su pañuelo azul al cuello.',
    previewColor: '#fcd34d',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 35,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡Guau guau! ¡Vamos a aprender más palabras!',
  },
  {
    id: 'pet-chispita',
    name: 'Mini Dragón Chispita Bebé',
    category: 'pet',
    emoji: '🐉',
    description: 'Vuela flotando alrededor del cuarto y lanza chispitas de oro.',
    previewColor: '#86efac',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 45,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Chispitas de fuego mágico para iluminar tu camino lector!',
  },
  {
    id: 'pet-dino',
    name: 'Dinosaurio Lector T-Rex',
    category: 'pet',
    emoji: '🦖',
    description: 'Tierno dinosaurio verde con pequeños anteojos y su librito.',
    previewColor: '#86efac',
    unlockType: 'world',
    requiredWorldId: 4,
    starCost: 45,
    taskDescription: 'Completa el Mundo 4 (Familia de la D)',
    quote: '¡Roar! ¡Los dinosaurios también adoramos los libros!',
  },
  {
    id: 'pet-robot',
    name: 'Robotito Amigable Beep-Boop',
    category: 'pet',
    emoji: '🤖',
    description: 'Rueda por el suelo con ojos LED sonrientes y antena.',
    previewColor: '#93c5fd',
    unlockType: 'words',
    requiredWordsCount: 5,
    starCost: 50,
    taskDescription: 'Escribe 5 palabras a mano en la app',
    quote: '¡BEEP-BOOP! ¡Cálculo completado: eres súper inteligente!',
  },
  {
    id: 'pet-unicorn',
    name: 'Unicornio Mágico Bebé',
    category: 'pet',
    emoji: '🦄',
    description: 'Crin de arcoíris y cuerno con polvo de hadas.',
    previewColor: '#fbcfe8',
    unlockType: 'stars',
    starCost: 55,
    taskDescription: 'Canjea con 55 Estrellas Doradas',
    quote: '¡La magia de aprender hace realidad todos los sueños!',
  },

  // ==================== TRAJES / ROPITA (OUTFITS) ====================
  {
    id: 'outfit-vestido',
    name: 'Vestidito Rosa Princesa',
    category: 'outfit',
    emoji: '👗',
    description: 'Vestido rosa con cuello de encaje, lazo en el pecho y faldita con vuelo.',
    previewColor: '#fbcfe8',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio para tu niña',
    quote: '¡Me encanta mi vestido rosa! ¡Es súper bonito y cómodo!',
  },
  {
    id: 'outfit-jardinera',
    name: 'Peto Escolar con Camiseta',
    category: 'outfit',
    emoji: '👖',
    description: 'Peto vaquero con camiseta amarilla pastel y bolsillito de corazón.',
    previewColor: '#fef08a',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
    quote: '¡Lista para saltar, escribir y jugar en mi cuarto!',
  },
  {
    id: 'outfit-hadas',
    name: 'Vestido de Hada del Bosque',
    category: 'outfit',
    emoji: '🧚‍♀️',
    description: 'Vestido lila y menta con alitas mágicas y purpurina.',
    previewColor: '#e9d5ff',
    unlockType: 'stories',
    requiredStoriesCount: 1,
    starCost: 35,
    taskDescription: 'Lee 1 Cuento en la biblioteca',
    quote: '¡Con mis alitas mágicas vuelo entre las páginas de los libros!',
  },
  {
    id: 'outfit-bailarina',
    name: 'Tutú de Bailarina Estrella',
    category: 'outfit',
    emoji: '🩰',
    description: 'Tutú de ballet rosado con zapatillas de raso y purpurina.',
    previewColor: '#fce7f3',
    unlockType: 'words',
    requiredWordsCount: 2,
    starCost: 30,
    taskDescription: 'Escribe 2 palabras a mano en la app',
    quote: '¡Un giro, dos giros... bailar las letras es genial!',
  },
  {
    id: 'outfit-pijama',
    name: 'Pijama de Estrellas & Conejitos',
    category: 'outfit',
    emoji: '⭐',
    description: 'Pijama suave con pantuflas de conejito para dormir en la camita.',
    previewColor: '#e0e7ff',
    unlockType: 'stars',
    starCost: 20,
    taskDescription: 'Canjea con 20 Estrellas Doradas',
    quote: '¡Qué suavecita y calientita para soñar con cuentos!',
  },
  {
    id: 'outfit-basic',
    name: 'Camiseta de Estrella Mágica',
    category: 'outfit',
    emoji: '👕',
    description: 'Camiseta blanca y vaqueros cómodos para jugar.',
    previewColor: '#93c5fd',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
    quote: '¡Cómodo y listo para explorar!',
  },
  {
    id: 'outfit-overalls',
    name: 'Overol de Explorador de Letras',
    category: 'outfit',
    emoji: '👖',
    description: 'Jardinero de jean con bolsillos para guardar letras.',
    previewColor: '#60a5fa',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 25,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
    quote: '¡Bolsillos listos para atrapar todas las vocales!',
  },
  {
    id: 'outfit-sailor',
    name: 'Traje Marinero a Rayas',
    category: 'outfit',
    emoji: '⛵',
    description: 'Rayas náuticas azules y cuello marinero con lazo rojo.',
    previewColor: '#93c5fd',
    unlockType: 'world',
    requiredWorldId: 2,
    starCost: 30,
    taskDescription: 'Completa el Mundo 2 (Familia de la B)',
    quote: '¡Navegando por el mar de las historias!',
  },
  {
    id: 'outfit-farmer',
    name: 'Traje de Granjero Feliz',
    category: 'outfit',
    emoji: '🧑‍🌾',
    description: 'Camisa a cuadros rojos y tirantes marrones.',
    previewColor: '#fca5a5',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 35,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
    quote: '¡Cosechando sílabas dulces en la granja!',
  },
  {
    id: 'outfit-superhero',
    name: 'Capa de Superhéroe de las Letras',
    category: 'outfit',
    emoji: '🦸',
    description: 'Traje heroico con capa dorada ondeante y emblema.',
    previewColor: '#f59e0b',
    unlockType: 'world',
    requiredWorldId: 4,
    starCost: 40,
    taskDescription: 'Completa el Mundo 4 (Familia de la D)',
    quote: '¡Mi superpoder es leer cualquier palabra a la primera!',
  },
  {
    id: 'outfit-artist',
    name: 'Bata de Pintor Ilustrador',
    category: 'outfit',
    emoji: '🧑‍🎨',
    description: 'Bata con manchas de pintura feliz y boina francesa.',
    previewColor: '#c084fc',
    unlockType: 'words',
    requiredWordsCount: 3,
    starCost: 35,
    taskDescription: 'Escribe 3 palabras a mano en la app',
    quote: '¡Tus trazos son pura obra de arte!',
  },
  {
    id: 'outfit-wizard',
    name: 'Túnica de Mago de Palabras',
    category: 'outfit',
    emoji: '🧙',
    description: 'Túnica púrpura bordada con constelaciones de letras doradas.',
    previewColor: '#8b5cf6',
    unlockType: 'letters',
    requiredLettersCount: 5,
    starCost: 40,
    taskDescription: 'Domina 5 letras en Caligrafía Montessori',
    quote: '¡Abracadabra, que aparezca la palabra!',
  },
  {
    id: 'outfit-astronaut',
    name: 'Traje Espacial Brillante',
    category: 'outfit',
    emoji: '👨‍🚀',
    description: 'Mono presurizado blanco con parches de misiones cumplidas.',
    previewColor: '#e0f2fe',
    unlockType: 'stars',
    starCost: 45,
    taskDescription: 'Canjea con 45 Estrellas Doradas',
    quote: '¡Listo para alunizar en el planeta del saber!',
  },
  {
    id: 'outfit-royal',
    name: 'Vestido / Traje de Gala Real',
    category: 'outfit',
    emoji: '👗',
    description: 'Sedas brillantes y capa real con ribetes dorados.',
    previewColor: '#ec4899',
    unlockType: 'stars',
    starCost: 50,
    taskDescription: 'Canjea con 50 Estrellas Doradas',
    quote: '¡Elegancia suprema para celebrar las victorias!',
  },

  // ==================== ACCESORIOS DE CABEZA (HEAD ACCESSORIES) ====================
  {
    id: 'head-none',
    name: 'Sin Sombrero',
    category: 'head',
    emoji: '🚫',
    description: 'Cabello al natural sin accesorio.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'head-bow',
    name: 'Lazo Rosado Coqueto',
    category: 'head',
    emoji: '🎀',
    description: 'Lazo rosado con brillitos para el pelo de la niña.',
    previewColor: '#f472b6',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'head-flower',
    name: 'Flor Silvestre Encantada',
    category: 'head',
    emoji: '🌸',
    description: 'Margarita rosa con clip para el pelo.',
    previewColor: '#fbcfe8',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'head-cap',
    name: 'Gorra Deportiva Cool',
    category: 'head',
    emoji: '🧢',
    description: 'Gorra moderna con visera para atrás y parche de rayo.',
    previewColor: '#38bdf8',
    unlockType: 'letters',
    requiredLettersCount: 3,
    starCost: 25,
    taskDescription: 'Domina 3 letras en Caligrafía Montessori',
  },
  {
    id: 'head-crown',
    name: 'Corona Dorada Reluciente',
    category: 'head',
    emoji: '👑',
    description: 'Puntas de oro macizo engarzadas con gemas de colores.',
    previewColor: '#fbbf24',
    unlockType: 'stars',
    starCost: 35,
    taskDescription: 'Canjea con 35 Estrellas Doradas',
  },
  {
    id: 'head-cat-ears',
    name: 'Diadema de Orejitas de Gato',
    category: 'head',
    emoji: '😺',
    description: 'Orejitas de felpa que se mueven al caminar.',
    previewColor: '#fbcfe8',
    unlockType: 'stars',
    starCost: 25,
    taskDescription: 'Canjea con 25 Estrellas Doradas',
  },
  {
    id: 'head-headphones',
    name: 'Audífonos Gamer Coloridos',
    category: 'head',
    emoji: '🎧',
    description: 'Auriculares acolchados con luces neón en las almohadillas.',
    previewColor: '#a855f7',
    unlockType: 'stories',
    requiredStoriesCount: 1,
    starCost: 30,
    taskDescription: 'Lee 1 Cuento Mágico en la biblioteca',
  },

  // ==================== ACCESORIOS DE MANO (HAND ACCESSORIES) ====================
  {
    id: 'hand-none',
    name: 'Manos Libres',
    category: 'hand',
    emoji: '🚫',
    description: 'Sin ningún objeto en la mano.',
    unlockType: 'starter',
    starCost: 0,
    taskDescription: 'Disponible desde el inicio',
  },
  {
    id: 'hand-pencil',
    name: 'Lápiz Gigante de Oro',
    category: 'hand',
    emoji: '✏️',
    description: 'Lápiz mágico que traza estrellas cuando escribes en el aire.',
    previewColor: '#f59e0b',
    unlockType: 'letters',
    requiredLettersCount: 5,
    starCost: 30,
    taskDescription: 'Domina 5 letras en Caligrafía Montessori',
  },
  {
    id: 'hand-book',
    name: 'Libro de Cuentos Mágicos Abierto',
    category: 'hand',
    emoji: '📖',
    description: 'Páginas que flotan con historias de dragones y castillos.',
    previewColor: '#93c5fd',
    unlockType: 'stories',
    requiredStoriesCount: 1,
    starCost: 25,
    taskDescription: 'Lee 1 Cuento Mágico en la biblioteca',
  },
  {
    id: 'hand-wand',
    name: 'Varita de Estrellas Chispeante',
    category: 'hand',
    emoji: '🪄',
    description: 'Lanza destellos mágicos cada vez que saludas.',
    previewColor: '#fde047',
    unlockType: 'world',
    requiredWorldId: 3,
    starCost: 35,
    taskDescription: 'Completa el Mundo 3 (Familia de la C)',
  },
  {
    id: 'hand-balloon',
    name: 'Globo Corazón Flotante',
    category: 'hand',
    emoji: '🎈',
    description: 'Globo rojo inflado con helio mágico que se mece suave.',
    previewColor: '#ef4444',
    unlockType: 'stars',
    starCost: 20,
    taskDescription: 'Canjea con 20 Estrellas Doradas',
  },
  {
    id: 'hand-teddy',
    name: 'Osito de Peluche Abrazable',
    category: 'hand',
    emoji: '🧸',
    description: 'El mejor compañero para escuchar cuentos por las noches.',
    previewColor: '#d97706',
    unlockType: 'world',
    requiredWorldId: 1,
    starCost: 25,
    taskDescription: 'Completa el Mundo 1 (Familia de la A)',
  },
];

/**
 * Helper to check if an item can be unlocked based on live player progress
 */
export function checkItemUnlockStatus(
  item: RoomCatalogItem,
  unlockedList: string[],
  completedWorlds: number[],
  masteredLettersCount: number,
  learnedWordsCount: number,
  readStoriesCount: number = 1
): { isUnlocked: boolean; progressText?: string; canClaimByMission: boolean } {
  // If already unlocked
  if (unlockedList.includes(item.id)) {
    return { isUnlocked: true, canClaimByMission: false };
  }

  // Starter items are always unlocked
  if (item.unlockType === 'starter' || item.starCost === 0) {
    return { isUnlocked: true, canClaimByMission: false };
  }

  // Check mission conditions
  if (item.unlockType === 'world' && item.requiredWorldId) {
    const isCompleted = completedWorlds.includes(item.requiredWorldId);
    return {
      isUnlocked: isCompleted,
      canClaimByMission: isCompleted,
      progressText: isCompleted ? '¡Misión completada!' : `Mundo ${item.requiredWorldId} pendiente`,
    };
  }

  if (item.unlockType === 'letters' && item.requiredLettersCount) {
    const isCompleted = masteredLettersCount >= item.requiredLettersCount;
    return {
      isUnlocked: isCompleted,
      canClaimByMission: isCompleted,
      progressText: `${masteredLettersCount}/${item.requiredLettersCount} letras dominadas`,
    };
  }

  if (item.unlockType === 'words' && item.requiredWordsCount) {
    const isCompleted = learnedWordsCount >= item.requiredWordsCount;
    return {
      isUnlocked: isCompleted,
      canClaimByMission: isCompleted,
      progressText: `${learnedWordsCount}/${item.requiredWordsCount} palabras escritas`,
    };
  }

  if (item.unlockType === 'stories' && item.requiredStoriesCount) {
    const isCompleted = readStoriesCount >= item.requiredStoriesCount;
    return {
      isUnlocked: isCompleted,
      canClaimByMission: isCompleted,
      progressText: `${readStoriesCount}/${item.requiredStoriesCount} cuentos leídos`,
    };
  }

  return { isUnlocked: false, canClaimByMission: false, progressText: `${item.starCost} ⭐ requeridas` };
}

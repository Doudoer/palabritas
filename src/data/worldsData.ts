/**
 * Mundos y Niveles de Aprendizaje para Palabritas
 * Incluye la "Familia de la [Letra]" para TODAS las letras del abecedario español (A - Z + Ñ),
 * además de la Familia de Dígrafos y el Gran Palacio de Graduación.
 */

export interface WorldSubNode {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  completed: boolean;
  active: boolean;
  stars: number;
}

export interface WorldLevel {
  id: number;
  numberLabel: string;
  title: string;
  subtitle: string;
  environmentName: string;
  letters: string[];
  focusLetter: string;
  targetWord: string;
  targetEmoji: string;
  letterIndex: number; // Index in ALPHABET_DATA
  categoryFilter: 'vocales' | 'primeras' | 'avanzadas' | 'todas';
  status: 'completed' | 'active' | 'available' | 'locked';
  stars: number;
  maxStars: number;
  badgeText: string;
  colorTheme: {
    cardBg: string;
    border: string;
    shadow: string;
    badgeBg: string;
    badgeText: string;
    accentColor: string;
    iconBg: string;
  };
  hasSubNodes?: boolean;
  subNodes?: WorldSubNode[];
  description: string;
}

export const WORLDS_DATA: WorldLevel[] = [
  // 1: A
  {
    id: 1,
    numberLabel: 'Mundo 1',
    title: 'Familia de la A',
    subtitle: 'Avión • Abeja • Árbol • Azul',
    environmentName: 'Cielo de las Aves y Aviones',
    letters: ['A'],
    focusLetter: 'A',
    targetWord: 'Avión',
    targetEmoji: '✈️',
    letterIndex: 0,
    categoryFilter: 'vocales',
    status: 'completed',
    stars: 3,
    maxStars: 3,
    badgeText: '¡Completado!',
    description: 'Abre la boca redondita y alegre para cantar el sonido puro de la primera reina: /aaa/.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#6cf8bb]',
      shadow: 'shadow-[0_6px_0_0_#4edea3]',
      badgeBg: 'bg-[#6cf8bb]',
      badgeText: 'text-[#00714d]',
      accentColor: '#00714d',
      iconBg: 'bg-[#ffeae1]',
    },
  },
  // 2: B
  {
    id: 2,
    numberLabel: 'Mundo 2',
    title: 'Familia de la B',
    subtitle: 'Barco • Bota • Ballena • Búho',
    environmentName: 'Bahía del Barco Pirata',
    letters: ['B'],
    focusLetter: 'B',
    targetWord: 'Barco',
    targetEmoji: '⛵',
    letterIndex: 1,
    categoryFilter: 'primeras',
    status: 'active',
    stars: 2,
    maxStars: 3,
    badgeText: '¡JUGANDO AHORA!',
    description: 'Junta los labios con fuerza y déjalos rebotar: ba, be, bi, bo, bu.',
    hasSubNodes: true,
    subNodes: [
      { id: 'node-ba', label: 'BA-BE-BI', sublabel: 'Sílabas simples', icon: 'volume_up', completed: true, active: false, stars: 3 },
      { id: 'node-barco', label: 'BARCO', sublabel: '¡Nivel en curso!', icon: 'play_arrow', completed: false, active: true, stars: 2 },
      { id: 'node-cofre', label: 'COFRE', sublabel: 'Recompensa especial', icon: 'lock', completed: false, active: false, stars: 0 },
    ],
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#42bbff]',
      shadow: 'shadow-[0_6px_0_0_#006591]',
      badgeBg: 'bg-[#c9e6ff]',
      badgeText: 'text-[#001e2f]',
      accentColor: '#006591',
      iconBg: 'bg-[#e0f2fe]',
    },
  },
  // 3: C
  {
    id: 3,
    numberLabel: 'Mundo 3',
    title: 'Familia de la C',
    subtitle: 'Casa • Cuna • Conejo • Copa',
    environmentName: 'Granja del Conejo Coco',
    letters: ['C'],
    focusLetter: 'C',
    targetWord: 'Casa',
    targetEmoji: '🏠',
    letterIndex: 2,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 1,
    maxStars: 3,
    badgeText: '¡Disponible!',
    description: 'Sonido crujiente en la garganta para formar: ca, co, cu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#fb923c]',
      shadow: 'shadow-[0_6px_0_0_#ea580c]',
      badgeBg: 'bg-[#ffedd5]',
      badgeText: 'text-[#9a3412]',
      accentColor: '#ea580c',
      iconBg: 'bg-[#fff7ed]',
    },
  },
  // 4: D
  {
    id: 4,
    numberLabel: 'Mundo 4',
    title: 'Familia de la D',
    subtitle: 'Dado • Dedo • Delfín • Dulce',
    environmentName: 'Arrecife del Delfín Dani',
    letters: ['D'],
    focusLetter: 'D',
    targetWord: 'Dado',
    targetEmoji: '🎲',
    letterIndex: 3,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Aventura!',
    description: 'La lengua roza suavemente los dientes de arriba: da, de, di, do, du.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#38bdf8]',
      shadow: 'shadow-[0_6px_0_0_#0284c7]',
      badgeBg: 'bg-[#e0f2fe]',
      badgeText: 'text-[#0369a1]',
      accentColor: '#0284c7',
      iconBg: 'bg-[#f0f9ff]',
    },
  },
  // 5: E
  {
    id: 5,
    numberLabel: 'Mundo 5',
    title: 'Familia de la E',
    subtitle: 'Estrella • Elefante • Erizo • Escalera',
    environmentName: 'Pradera del Elefante Curioso',
    letters: ['E'],
    focusLetter: 'E',
    targetWord: 'Estrella',
    targetEmoji: '⭐',
    letterIndex: 4,
    categoryFilter: 'vocales',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Estrellitas!',
    description: 'Sonríe con alegría y canta con entusiasmo la segunda vocal: /eee/.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#10b981]',
      shadow: 'shadow-[0_6px_0_0_#059669]',
      badgeBg: 'bg-[#d1fae5]',
      badgeText: 'text-[#065f46]',
      accentColor: '#059669',
      iconBg: 'bg-[#ecfdf5]',
    },
  },
  // 6: F
  {
    id: 6,
    numberLabel: 'Mundo 6',
    title: 'Familia de la F',
    subtitle: 'Foca • Flor • Fuego • Fresa',
    environmentName: 'Cueva del Faro Brillante',
    letters: ['F'],
    focusLetter: 'F',
    targetWord: 'Foca',
    targetEmoji: '🦭',
    letterIndex: 5,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Soplido Mágico!',
    description: 'Sopla como una suave brisa marina entre tus dientes y labios: fa, fe, fi, fo, fu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#ec4899]',
      shadow: 'shadow-[0_6px_0_0_#db2777]',
      badgeBg: 'bg-[#fce7f3]',
      badgeText: 'text-[#9d174d]',
      accentColor: '#db2777',
      iconBg: 'bg-[#fdf2f8]',
    },
  },
  // 7: G
  {
    id: 7,
    numberLabel: 'Mundo 7',
    title: 'Familia de la G',
    subtitle: 'Gato • Gota • Guante • Gusano',
    environmentName: 'Jardín del Gato Goloso',
    letters: ['G'],
    focusLetter: 'G',
    targetWord: 'Gato',
    targetEmoji: '🐱',
    letterIndex: 6,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Miau Goloso!',
    description: 'Sonido suave y ronroneante desde la garganta: ga, go, gu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#f59e0b]',
      shadow: 'shadow-[0_6px_0_0_#d97706]',
      badgeBg: 'bg-[#fef3c7]',
      badgeText: 'text-[#92400e]',
      accentColor: '#d97706',
      iconBg: 'bg-[#fffbeb]',
    },
  },
  // 8: H
  {
    id: 8,
    numberLabel: 'Mundo 8',
    title: 'Familia de la H',
    subtitle: 'Helado • Hada • Huevo • Hoja',
    environmentName: 'Bosque de las Hadas Dulces',
    letters: ['H'],
    focusLetter: 'H',
    targetWord: 'Helado',
    targetEmoji: '🍦',
    letterIndex: 7,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Mágica y Silenciosa!',
    description: 'La letrita silenciosa y elegante que acompaña a las vocales con dulzura.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#8b5cf6]',
      shadow: 'shadow-[0_6px_0_0_#7c3aed]',
      badgeBg: 'bg-[#ede9fe]',
      badgeText: 'text-[#6b21a8]',
      accentColor: '#7c3aed',
      iconBg: 'bg-[#f5f3ff]',
    },
  },
  // 9: I
  {
    id: 9,
    numberLabel: 'Mundo 9',
    title: 'Familia de la I',
    subtitle: 'Isla • Iguana • Iglú • Imán',
    environmentName: 'Isla de la Iguana Inés',
    letters: ['I'],
    focusLetter: 'I',
    targetWord: 'Isla',
    targetEmoji: '🏝️',
    letterIndex: 8,
    categoryFilter: 'vocales',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Campanita!',
    description: 'Sonido agudo y brillante como una campanita de cristal con su puntito arriba: /iii/.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#06b6d4]',
      shadow: 'shadow-[0_6px_0_0_#0891b2]',
      badgeBg: 'bg-[#cffafe]',
      badgeText: 'text-[#155e75]',
      accentColor: '#0891b2',
      iconBg: 'bg-[#ecfeff]',
    },
  },
  // 10: J
  {
    id: 10,
    numberLabel: 'Mundo 10',
    title: 'Familia de la J',
    subtitle: 'Jirafa • Jugo • Jaula • Joya',
    environmentName: 'Sabana de la Jirafa Julia',
    letters: ['J'],
    focusLetter: 'J',
    targetWord: 'Jirafa',
    targetEmoji: '🦒',
    letterIndex: 9,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Risa Alegre!',
    description: 'Risa traviesa desde el fondo de la garganta: ja, je, ji, jo, ju.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#eab308]',
      shadow: 'shadow-[0_6px_0_0_#ca8a04]',
      badgeBg: 'bg-[#fef9c3]',
      badgeText: 'text-[#854d0e]',
      accentColor: '#ca8a04',
      iconBg: 'bg-[#fefce8]',
    },
  },
  // 11: K
  {
    id: 11,
    numberLabel: 'Mundo 11',
    title: 'Familia de la K',
    subtitle: 'Koala • Kiwi • Karate • Kilo',
    environmentName: 'Refugio del Koala Kiko',
    letters: ['K'],
    focusLetter: 'K',
    targetWord: 'Koala',
    targetEmoji: '🐨',
    letterIndex: 10,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Koalas Tiernos!',
    description: 'Fuerte chasquido de ramas de eucalipto: ka, ke, ki, ko, ku.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#14b8a6]',
      shadow: 'shadow-[0_6px_0_0_#0d9488]',
      badgeBg: 'bg-[#ccfbf1]',
      badgeText: 'text-[#115e59]',
      accentColor: '#0d9488',
      iconBg: 'bg-[#f0fdfa]',
    },
  },
  // 12: L
  {
    id: 12,
    numberLabel: 'Mundo 12',
    title: 'Familia de la L',
    subtitle: 'Luna • León • Loro • Lana',
    environmentName: 'Bosque de la Luna Llena',
    letters: ['L'],
    focusLetter: 'L',
    targetWord: 'Luna',
    targetEmoji: '🌙',
    letterIndex: 11,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Canto Suave!',
    description: 'La punta de la lengua sube al paladar para cantar: la, le, li, lo, lu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#c084fc]',
      shadow: 'shadow-[0_6px_0_0_#9333ea]',
      badgeBg: 'bg-[#f3e8ff]',
      badgeText: 'text-[#581c87]',
      accentColor: '#9333ea',
      iconBg: 'bg-[#faf5ff]',
    },
  },
  // 13: M
  {
    id: 13,
    numberLabel: 'Mundo 13',
    title: 'Familia de la M',
    subtitle: 'Mamá • Mesa • Mano • Mono',
    environmentName: 'Playa de las Primeras Palabras',
    letters: ['M'],
    focusLetter: 'M',
    targetWord: 'Mamá',
    targetEmoji: '👩‍👧',
    letterIndex: 12,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡La Más Querida!',
    description: 'Labios cerrados como saboreando un postre delicioso: ma, me, mi, mo, mu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#ffb95f]',
      shadow: 'shadow-[0_8px_0_0_#f59e0b]',
      badgeBg: 'bg-[#f59e0b]',
      badgeText: 'text-[#613b00]',
      accentColor: '#f59e0b',
      iconBg: 'bg-[#ffddb8]',
    },
  },
  // 14: N
  {
    id: 14,
    numberLabel: 'Mundo 14',
    title: 'Familia de la N',
    subtitle: 'Nube • Nido • Naranja • Nieve',
    environmentName: 'Cielo de Nubes de Algodón',
    letters: ['N'],
    focusLetter: 'N',
    targetWord: 'Nube',
    targetEmoji: '☁️',
    letterIndex: 13,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Voz Nasal!',
    description: 'El aire sale por la naricita haciendo cosquillas: na, ne, ni, no, nu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#94a3b8]',
      shadow: 'shadow-[0_6px_0_0_#64748b]',
      badgeBg: 'bg-[#f1f5f9]',
      badgeText: 'text-[#334155]',
      accentColor: '#64748b',
      iconBg: 'bg-[#f8fafc]',
    },
  },
  // 15: Ñ
  {
    id: 15,
    numberLabel: 'Mundo 15',
    title: 'Familia de la Ñ',
    subtitle: 'Ñandú • Piña • Cabaña • Muñeca',
    environmentName: 'Selva del Ñandú Curioso',
    letters: ['Ñ'],
    focusLetter: 'Ñ',
    targetWord: 'Ñandú',
    targetEmoji: '🦤',
    letterIndex: 14,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Única en Español!',
    description: 'La N que lleva un sombrerito ondulado de princesa: ña, ñe, ñi, ño, ñu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#14b8a6]',
      shadow: 'shadow-[0_6px_0_0_#0f766e]',
      badgeBg: 'bg-[#ccfbf1]',
      badgeText: 'text-[#115e59]',
      accentColor: '#0f766e',
      iconBg: 'bg-[#f0fdfa]',
    },
  },
  // 16: O
  {
    id: 16,
    numberLabel: 'Mundo 16',
    title: 'Familia de la O',
    subtitle: 'Oso • Ojo • Olla • Oreja',
    environmentName: 'Cueva del Oso Amistoso',
    letters: ['O'],
    focusLetter: 'O',
    targetWord: 'Oso',
    targetEmoji: '🐻',
    letterIndex: 15,
    categoryFilter: 'vocales',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Boca Redonda!',
    description: 'Pon tu boquita bien redonda como un anillo dorado: /ooo/.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#fb923c]',
      shadow: 'shadow-[0_6px_0_0_#ea580c]',
      badgeBg: 'bg-[#ffedd5]',
      badgeText: 'text-[#9a3412]',
      accentColor: '#ea580c',
      iconBg: 'bg-[#fff7ed]',
    },
  },
  // 17: P
  {
    id: 17,
    numberLabel: 'Mundo 17',
    title: 'Familia de la P',
    subtitle: 'Papá • Pelota • Pato • Pipa',
    environmentName: 'Costa del Pingüino Pipo',
    letters: ['P'],
    focusLetter: 'P',
    targetWord: 'Pelota',
    targetEmoji: '⚽',
    letterIndex: 16,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Explosión!',
    description: 'Pequeño pop con los dos labios juntos: pa, pe, pi, po, pu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#38bdf8]',
      shadow: 'shadow-[0_6px_0_0_#0284c7]',
      badgeBg: 'bg-[#e0f2fe]',
      badgeText: 'text-[#0369a1]',
      accentColor: '#0284c7',
      iconBg: 'bg-[#f0f9ff]',
    },
  },
  // 18: Q
  {
    id: 18,
    numberLabel: 'Mundo 18',
    title: 'Familia de la Q',
    subtitle: 'Queso • Quetzal • Quince • Quijote',
    environmentName: 'Castillo del Queso Dorado',
    letters: ['Q'],
    focusLetter: 'Q',
    targetWord: 'Queso',
    targetEmoji: '🧀',
    letterIndex: 17,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Pareja Inseparable!',
    description: 'La Q siempre va de la manita con la U para decir: que, qui.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#f59e0b]',
      shadow: 'shadow-[0_6px_0_0_#b45309]',
      badgeBg: 'bg-[#fef3c7]',
      badgeText: 'text-[#78350f]',
      accentColor: '#b45309',
      iconBg: 'bg-[#fffbeb]',
    },
  },
  // 19: R
  {
    id: 19,
    numberLabel: 'Mundo 19',
    title: 'Familia de la R',
    subtitle: 'Rana • Rosa • Río • Rueda',
    environmentName: 'Laguna de la Rana Renata',
    letters: ['R'],
    focusLetter: 'R',
    targetWord: 'Rana',
    targetEmoji: '🐸',
    letterIndex: 18,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Motorcito!',
    description: 'La lengua vibra como un motorcito alegre: ra, re, ri, ro, ru.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#4ade80]',
      shadow: 'shadow-[0_6px_0_0_#16a34a]',
      badgeBg: 'bg-[#dcfce7]',
      badgeText: 'text-[#15803d]',
      accentColor: '#16a34a',
      iconBg: 'bg-[#f0fdf4]',
    },
  },
  // 20: S
  {
    id: 20,
    numberLabel: 'Mundo 20',
    title: 'Familia de la S',
    subtitle: 'Sol • Sopa • Sapo • Silla',
    environmentName: 'Dunas del Sol Radiante',
    letters: ['S'],
    focusLetter: 'S',
    targetWord: 'Sol',
    targetEmoji: '☀️',
    letterIndex: 19,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Silbido Suave!',
    description: 'Sonido suave de serpiente silbadora: sa, se, si, so, su.',
    colorTheme: {
      cardBg: 'bg-[#fffdfa]',
      border: 'border-[#f59e0b]',
      shadow: 'shadow-[0_6px_0_0_#d97706]',
      badgeBg: 'bg-[#fef3c7]',
      badgeText: 'text-[#855300]',
      accentColor: '#d97706',
      iconBg: 'bg-[#fef3c7]',
    },
  },
  // 21: T
  {
    id: 21,
    numberLabel: 'Mundo 21',
    title: 'Familia de la T',
    subtitle: 'Tomate • Tren • Tortuga • Taza',
    environmentName: 'Montaña del Tren Tito',
    letters: ['T'],
    focusLetter: 'T',
    targetWord: 'Tomate',
    targetEmoji: '🍅',
    letterIndex: 20,
    categoryFilter: 'primeras',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Golpecito Firme!',
    description: 'Toque firme de la lengua detrás de los dientes: ta, te, ti, to, tu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#f87171]',
      shadow: 'shadow-[0_6px_0_0_#dc2626]',
      badgeBg: 'bg-[#fee2e2]',
      badgeText: 'text-[#991b1b]',
      accentColor: '#dc2626',
      iconBg: 'bg-[#fff1f2]',
    },
  },
  // 22: U
  {
    id: 22,
    numberLabel: 'Mundo 22',
    title: 'Familia de la U',
    subtitle: 'Uva • Unicornio • Uno • Uña',
    environmentName: 'Valle de las Uvas Dulces',
    letters: ['U'],
    focusLetter: 'U',
    targetWord: 'Uva',
    targetEmoji: '🍇',
    letterIndex: 21,
    categoryFilter: 'vocales',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Quinta Vocal!',
    description: 'Pon trompita y canta como el búho sabio en la noche: /uuu/.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#8b5cf6]',
      shadow: 'shadow-[0_6px_0_0_#7c3aed]',
      badgeBg: 'bg-[#ede9fe]',
      badgeText: 'text-[#6d28d9]',
      accentColor: '#7c3aed',
      iconBg: 'bg-[#f5f3ff]',
    },
  },
  // 23: V
  {
    id: 23,
    numberLabel: 'Mundo 23',
    title: 'Familia de la V',
    subtitle: 'Vaca • Viento • Volcán • Vela',
    environmentName: 'Valle de la Vaca Valentina',
    letters: ['V'],
    focusLetter: 'V',
    targetWord: 'Vaca',
    targetEmoji: '🐮',
    letterIndex: 22,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Sonido Veloz!',
    description: 'Vibración suave entre dientes superiores y labio inferior: va, ve, vi, vo, vu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#10b981]',
      shadow: 'shadow-[0_6px_0_0_#059669]',
      badgeBg: 'bg-[#d1fae5]',
      badgeText: 'text-[#065f46]',
      accentColor: '#059669',
      iconBg: 'bg-[#ecfdf5]',
    },
  },
  // 24: W
  {
    id: 24,
    numberLabel: 'Mundo 24',
    title: 'Familia de la W',
    subtitle: 'Waffle • Wifi • Waterpolo • Web',
    environmentName: 'Parque Acuático de Waffle',
    letters: ['W'],
    focusLetter: 'W',
    targetWord: 'Waffle',
    targetEmoji: '🧇',
    letterIndex: 23,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Doble Ve Mágica!',
    description: 'Dos uves entrelazadas para palabras divertidas: wa, we, wi, wo.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#3b82f6]',
      shadow: 'shadow-[0_6px_0_0_#2563eb]',
      badgeBg: 'bg-[#dbeafe]',
      badgeText: 'text-[#1e40af]',
      accentColor: '#2563eb',
      iconBg: 'bg-[#eff6ff]',
    },
  },
  // 25: X
  {
    id: 25,
    numberLabel: 'Mundo 25',
    title: 'Familia de la X',
    subtitle: 'Xilófono • Taxi • Éxito • Boxeo',
    environmentName: 'Orquesta del Xilófono Mágico',
    letters: ['X'],
    focusLetter: 'X',
    targetWord: 'Xilófono',
    targetEmoji: '🎼',
    letterIndex: 24,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Música y Cruces!',
    description: 'Dos líneas que se cruzan con sonido brillante: xa, xe, xi, xo, xu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#14b8a6]',
      shadow: 'shadow-[0_6px_0_0_#0d9488]',
      badgeBg: 'bg-[#ccfbf1]',
      badgeText: 'text-[#115e59]',
      accentColor: '#0d9488',
      iconBg: 'bg-[#f0fdfa]',
    },
  },
  // 26: Y
  {
    id: 26,
    numberLabel: 'Mundo 26',
    title: 'Familia de la Y',
    subtitle: 'Yoyo • Yate • Yogur • Yema',
    environmentName: 'Muelle del Yate Amarillo',
    letters: ['Y'],
    focusLetter: 'Y',
    targetWord: 'Yoyo',
    targetEmoji: '🪀',
    letterIndex: 25,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Sube y Baja!',
    description: 'Suena dulce y cantarina como un yoyo juguetón: ya, ye, yi, yo, yu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#0284c7]',
      shadow: 'shadow-[0_6px_0_0_#0369a1]',
      badgeBg: 'bg-[#e0f2fe]',
      badgeText: 'text-[#075985]',
      accentColor: '#0284c7',
      iconBg: 'bg-[#e0f2fe]',
    },
  },
  // 27: Z
  {
    id: 27,
    numberLabel: 'Mundo 27',
    title: 'Familia de la Z',
    subtitle: 'Zorro • Zapato • Zanahoria • Zumo',
    environmentName: 'Madriguera del Zorro Zacarías',
    letters: ['Z'],
    focusLetter: 'Z',
    targetWord: 'Zorro',
    targetEmoji: '🦊',
    letterIndex: 26,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡La Última Reina!',
    description: 'El broche de oro del abecedario para decir: za, zo, zu.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#f97316]',
      shadow: 'shadow-[0_6px_0_0_#c2410c]',
      badgeBg: 'bg-[#ffedd5]',
      badgeText: 'text-[#9a3412]',
      accentColor: '#c2410c',
      iconBg: 'bg-[#fff7ed]',
    },
  },
  // 28: DÍGRAFOS (CH, LL, RR)
  {
    id: 28,
    numberLabel: 'Mundo 28',
    title: 'Familia de Dígrafos y Gemelos',
    subtitle: 'CH • LL • RR (Chocolate, Lluvia, Carro)',
    environmentName: 'Puente de los Sonidos Gemelos',
    letters: ['C', 'L', 'R'],
    focusLetter: 'C',
    targetWord: 'Chocolate',
    targetEmoji: '🍫',
    letterIndex: 2,
    categoryFilter: 'avanzadas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡Sonidos Gemelos!',
    description: 'Dos letras inseparables que cantan juntas formando un solo sonido mágico.',
    colorTheme: {
      cardBg: 'bg-white',
      border: 'border-[#8b5cf6]',
      shadow: 'shadow-[0_6px_0_0_#6d28d9]',
      badgeBg: 'bg-[#ede9fe]',
      badgeText: 'text-[#5b21b6]',
      accentColor: '#6d28d9',
      iconBg: 'bg-[#f5f3ff]',
    },
  },
  // 29: GRAN FINAL
  {
    id: 29,
    numberLabel: 'Mundo 29',
    title: 'El Gran Palacio del Lector Campeón',
    subtitle: 'Abecedario Completo (A - Z) y Todos los Libros',
    environmentName: 'Cúpula Dorada de Graduación',
    letters: ['A', 'M', 'P', 'S', 'Z'],
    focusLetter: 'A',
    targetWord: 'Campeón',
    targetEmoji: '🏆',
    letterIndex: 0,
    categoryFilter: 'todas',
    status: 'available',
    stars: 0,
    maxStars: 3,
    badgeText: '¡GRAN FINAL!',
    description: '¡Felicidades! Has dominado todas las familias de letras y puedes leer y escribir cualquier palabra del mundo.',
    colorTheme: {
      cardBg: 'bg-gradient-to-b from-amber-50 to-orange-100',
      border: 'border-[#f59e0b]',
      shadow: 'shadow-[0_8px_0_0_#b45309]',
      badgeBg: 'bg-[#f59e0b]',
      badgeText: 'text-[#613b00]',
      accentColor: '#b45309',
      iconBg: 'bg-[#fef3c7]',
    },
  },
];

/**
 * Retorna exactamente 4 letras representativas para la práctica de trazos
 * en mayúscula y minúscula de este mundo.
 */
export function getWorldTracingLetters(worldId: number): string[] {
  const world = WORLDS_DATA.find(w => w.id === worldId) || WORLDS_DATA[0];
  const focus = (world.focusLetter || 'A').toUpperCase();

  // Vocales
  if (['A', 'E', 'I', 'O', 'U'].includes(focus)) {
    if (focus === 'A') return ['A', 'E', 'I', 'O'];
    if (focus === 'E') return ['E', 'A', 'I', 'U'];
    if (focus === 'I') return ['I', 'O', 'U', 'A'];
    if (focus === 'O') return ['O', 'U', 'A', 'E'];
    return ['U', 'A', 'E', 'O'];
  }

  // Consonantes Iniciales (M, P, S, L)
  if (['M', 'P', 'S', 'L'].includes(focus)) {
    const group = ['M', 'P', 'S', 'L'];
    return [focus, ...group.filter(l => l !== focus)];
  }

  // Consonantes Dentales / Alveolares (T, D, N, R)
  if (['T', 'D', 'N', 'R'].includes(focus)) {
    const group = ['T', 'D', 'N', 'R'];
    return [focus, ...group.filter(l => l !== focus)];
  }

  // Velares / Guturales (C, Q, K, G)
  if (['C', 'Q', 'K', 'G'].includes(focus)) {
    const group = ['C', 'Q', 'G', 'K'];
    return [focus, ...group.filter(l => l !== focus)];
  }

  // Labiales y Fricativas (B, V, F, J)
  if (['B', 'V', 'F', 'J'].includes(focus)) {
    const group = ['B', 'V', 'F', 'J'];
    return [focus, ...group.filter(l => l !== focus)];
  }

  // Palatales / Sibilantes (Z, X, Y, H)
  if (['Z', 'X', 'Y', 'H'].includes(focus)) {
    const group = ['Z', 'X', 'Y', 'H'];
    return [focus, ...group.filter(l => l !== focus)];
  }

  // Dígrafos / Especiales
  if (worldId >= 28) {
    return ['C', 'L', 'R', 'G'];
  }

  // Fallback con el abecedario
  const lettersOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const idx = lettersOrder.indexOf(focus);
  if (idx !== -1) {
    const res = [focus];
    for (let i = 1; i < 4; i++) {
      res.push(lettersOrder[(idx + i) % lettersOrder.length]);
    }
    return res;
  }

  return ['M', 'P', 'S', 'L'];
}

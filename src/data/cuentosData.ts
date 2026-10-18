/**
 * 20 Cuentos Decodificables para Palabritas
 * Adaptados para niñas y niños de 6 años que aprenden a leer y escribir en español.
 * Cada cuento corresponde a uno de los 20 mundos fonéticos.
 */

export interface StoryWord {
  display: string;
  syllables: string;
  clean: string;
}

export interface StoryLine {
  words: StoryWord[];
}

export interface DecodableStory {
  id: number;
  worldId: number;
  worldName: string;
  title: string;
  emoji: string;
  coverColor: string;
  moral: string;
  pages: Array<{
    pageNumber: number;
    lines: StoryLine[];
    highlightSyllable: string;
    illustrationDescription: string;
  }>;
}

export const TWENTY_STORIES: DecodableStory[] = [
  {
    id: 1,
    worldId: 1,
    worldName: 'Mundo 1: Las Vocales',
    title: 'El avión de las vocales',
    emoji: '✈️',
    coverColor: '#fef3c7',
    moral: 'Las cinco vocales vuelan juntas para cantar palabras alegres.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'A - E - I - O - U',
        illustrationDescription: 'Un avión colorido vuela en el cielo entre nubes y estrellas.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'avión', syllables: 'a - vión', clean: 'avión' },
              { display: 'sube', syllables: 'su - be', clean: 'sube' },
              { display: 'alto.', syllables: 'al - to', clean: 'alto' },
            ],
          },
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'estrella', syllables: 'es - tre - lla', clean: 'estrella' },
              { display: 'mira', syllables: 'mi - ra', clean: 'mira' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'isla.', syllables: 'is - la', clean: 'isla' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'O - U',
        illustrationDescription: 'Un osito come uvas bajo el sol.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'oso', syllables: 'o - so', clean: 'oso' },
              { display: 'come', syllables: 'co - me', clean: 'come' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'uva.', syllables: 'u - va', clean: 'uva' },
            ],
          },
          {
            words: [
              { display: '¡A,', syllables: 'A', clean: 'A' },
              { display: 'E,', syllables: 'E', clean: 'E' },
              { display: 'I,', syllables: 'I', clean: 'I' },
              { display: 'O,', syllables: 'O', clean: 'O' },
              { display: 'U', syllables: 'U', clean: 'U' },
              { display: 'cantan!', syllables: 'can - tan', clean: 'cantan' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    worldId: 2,
    worldName: 'Mundo 2: Letra M',
    title: 'El oso y la masa en la mesa',
    emoji: '🪑',
    coverColor: '#ffedd5',
    moral: 'Con paciencia y amor, amasar juntos es divertido.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'MA - ME - MI - MO - MU',
        illustrationDescription: 'Un osito y su mamá amasan pan en una mesa de madera.',
        lines: [
          {
            words: [
              { display: 'Mi', syllables: 'Mi', clean: 'Mi' },
              { display: 'mamá', syllables: 'ma - má', clean: 'mamá' },
              { display: 'amasa', syllables: 'a - ma - sa', clean: 'amasa' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'masa.', syllables: 'ma - sa', clean: 'masa' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'osito', syllables: 'o - si - to', clean: 'osito' },
              { display: 'mira', syllables: 'mi - ra', clean: 'mira' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'mesa.', syllables: 'me - sa', clean: 'mesa' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'ME - SA',
        illustrationDescription: 'El pan listo sobre la mesa humeante y delicioso.',
        lines: [
          {
            words: [
              { display: 'Mamá', syllables: 'Ma - má', clean: 'Mamá' },
              { display: 'me', syllables: 'me', clean: 'me' },
              { display: 'mima', syllables: 'mi - ma', clean: 'mima' },
              { display: 'mucho.', syllables: 'mu - cho', clean: 'mucho' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'pan', syllables: 'pan', clean: 'pan' },
              { display: 'está', syllables: 'es - tá', clean: 'está' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'mesa.', syllables: 'me - sa', clean: 'mesa' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    worldId: 3,
    worldName: 'Mundo 3: Letra P',
    title: 'El pato Pepe y su pelota',
    emoji: '⚽',
    coverColor: '#e0f2fe',
    moral: 'Compartir la pelota con amigos siempre alegra el día.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'PA - PE - PI - PO - PU',
        illustrationDescription: 'El pato Pepe jugando fútbol en la orilla del lago.',
        lines: [
          {
            words: [
              { display: 'Pepe', syllables: 'Pe - pe', clean: 'Pepe' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'pato', syllables: 'pa - to', clean: 'pato' },
              { display: 'pasa', syllables: 'pa - sa', clean: 'pasa' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'pelota.', syllables: 'pe - lo - ta', clean: 'pelota' },
            ],
          },
          {
            words: [
              { display: 'Papá', syllables: 'Pa - pá', clean: 'Papá' },
              { display: 'aplaude', syllables: 'a - plau - de', clean: 'aplaude' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'pequeño.', syllables: 'pe - que - ño', clean: 'pequeño' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 4,
    worldId: 4,
    worldName: 'Mundo 4: Letra S',
    title: 'El sol dorado y la rica sopa',
    emoji: '🥣',
    coverColor: '#fef3c7',
    moral: 'Una rica sopa caliente reconforta el cuerpo y el corazón.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'SA - SE - SI - SO - SU',
        illustrationDescription: 'Un plato de sopa humeante iluminado por los rayos del sol.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'sol', syllables: 'sol', clean: 'sol' },
              { display: 'sale', syllables: 'sa - le', clean: 'sale' },
              { display: 'temprano.', syllables: 'tem - pra - no', clean: 'temprano' },
            ],
          },
          {
            words: [
              { display: 'Susi', syllables: 'Su - si', clean: 'Susi' },
              { display: 'toma', syllables: 'to - ma', clean: 'toma' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'sopa', syllables: 'so - pa', clean: 'sopa' },
              { display: 'sabrosa.', syllables: 'sa - bro - sa', clean: 'sabrosa' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 5,
    worldId: 5,
    worldName: 'Mundo 5: Letra L',
    title: 'La luna linda y el león',
    emoji: '🌙',
    coverColor: '#f3e8ff',
    moral: 'La luz de la luna cuida a todos los animalitos en la noche.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'LA - LE - LI - LO - LU',
        illustrationDescription: 'Un simpático león mira la luna brillante en el bosque.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'luna', syllables: 'lu - na', clean: 'luna' },
              { display: 'ilumina', syllables: 'i - lu - mi - na', clean: 'ilumina' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'bosque.', syllables: 'bos - que', clean: 'bosque' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'león', syllables: 'le - ón', clean: 'león' },
              { display: 'Lolo', syllables: 'Lo - lo', clean: 'Lolo' },
              { display: 'duerme', syllables: 'duer - me', clean: 'duerme' },
              { display: 'tranquilo.', syllables: 'tran - qui - lo', clean: 'tranquilo' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 6,
    worldId: 6,
    worldName: 'Mundo 6: Letra T',
    title: 'El tren Tito y los tomates',
    emoji: '🍅',
    coverColor: '#fee2e2',
    moral: 'Trabajar en equipo lleva las mejores cosechas a cada casa.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'TA - TE - TI - TO - TU',
        illustrationDescription: 'Un trencito rojo transporta canastos llenos de tomates rojos.',
        lines: [
          {
            words: [
              { display: 'Tito', syllables: 'Ti - to', clean: 'Tito' },
              { display: 'conduce', syllables: 'con - du - ce', clean: 'conduce' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'tren', syllables: 'tren', clean: 'tren' },
              { display: 'veloz.', syllables: 've - loz', clean: 'veloz' },
            ],
          },
          {
            words: [
              { display: 'Lleva', syllables: 'Lle - va', clean: 'Lleva' },
              { display: 'tomates', syllables: 'to - ma - tes', clean: 'tomates' },
              { display: 'rojos', syllables: 'ro - jos', clean: 'rojos' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'frescos.', syllables: 'fres - cos', clean: 'frescos' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 7,
    worldId: 7,
    worldName: 'Mundo 7: Letra D',
    title: 'El delfín Dani y el dado mágico',
    emoji: '🎲',
    coverColor: '#e0f2fe',
    moral: 'El mar está lleno de tesoros y juegos divertidos.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'DA - DE - DI - DO - DU',
        illustrationDescription: 'Un delfín salta en el agua con un dado brillante.',
        lines: [
          {
            words: [
              { display: 'Dani', syllables: 'Da - ni', clean: 'Dani' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'delfín', syllables: 'del - fín', clean: 'delfín' },
              { display: 'nada', syllables: 'na - da', clean: 'nada' },
              { display: 'rápido.', syllables: 'rá - pi - do', clean: 'rápido' },
            ],
          },
          {
            words: [
              { display: 'Encontró', syllables: 'En - con - tró', clean: 'Encontró' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'dado', syllables: 'da - do', clean: 'dado' },
              { display: 'azul', syllables: 'a - zul', clean: 'azul' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'arena.', syllables: 'a - re - na', clean: 'arena' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 8,
    worldId: 8,
    worldName: 'Mundo 8: Letra N',
    title: 'La nube blanca y el nido',
    emoji: '☁️',
    coverColor: '#f1f5f9',
    moral: 'La naturaleza nos regala hogares llenos de vida y cariño.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'NA - NE - NI - NO - NU',
        illustrationDescription: 'Una nube de algodón flota sobre un árbol con un nido de pajaritos.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'nube', syllables: 'nu - be', clean: 'nube' },
              { display: 'blanca', syllables: 'blan - ca', clean: 'blanca' },
              { display: 'tapa', syllables: 'ta - pa', clean: 'tapa' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'nido.', syllables: 'ni - do', clean: 'nido' },
            ],
          },
          {
            words: [
              { display: 'Los', syllables: 'Los', clean: 'Los' },
              { display: 'pajaritos', syllables: 'pa - ja - ri - tos', clean: 'pajaritos' },
              { display: 'duermen', syllables: 'duer - men', clean: 'duermen' },
              { display: 'abrigados.', syllables: 'a - bri - ga - dos', clean: 'abrigados' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 9,
    worldId: 9,
    worldName: 'Mundo 9: Letra R',
    title: 'La rana Renata salta en el río',
    emoji: '🐸',
    coverColor: '#dcfce7',
    moral: 'Saltar, reír y cantar llena de energía cada día.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'RA - RE - RI - RO - RU',
        illustrationDescription: 'Renata la rana verde brinca sobre una hoja flotante en el río.',
        lines: [
          {
            words: [
              { display: 'Renata', syllables: 'Re - na - ta', clean: 'Renata' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'rana', syllables: 'ra - na', clean: 'rana' },
              { display: 'salta', syllables: 'sal - ta', clean: 'salta' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'río.', syllables: 'rí - o', clean: 'río' },
            ],
          },
          {
            words: [
              { display: 'Lleva', syllables: 'Lle - va', clean: 'Lleva' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'rosa', syllables: 'ro - sa', clean: 'rosa' },
              { display: 'roja', syllables: 'ro - ja', clean: 'roja' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'mano.', syllables: 'ma - no', clean: 'mano' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 10,
    worldId: 10,
    worldName: 'Mundo 10: Letra C',
    title: 'El conejo Coco y su casita',
    emoji: '🏠',
    coverColor: '#ffedd5',
    moral: 'Cuidar la casa con alegría la convierte en un hogar feliz.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'CA - CO - CU',
        illustrationDescription: 'Un conejito blanco barre la entrada de su casita de madera.',
        lines: [
          {
            words: [
              { display: 'Coco', syllables: 'Co - co', clean: 'Coco' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'conejo', syllables: 'co - ne - jo', clean: 'conejo' },
              { display: 'come', syllables: 'co - me', clean: 'come' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'casa.', syllables: 'ca - sa', clean: 'casa' },
            ],
          },
          {
            words: [
              { display: 'Su', syllables: 'Su', clean: 'Su' },
              { display: 'cuna', syllables: 'cu - na', clean: 'cuna' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'cómoda', syllables: 'có - mo - da', clean: 'cómoda' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'caliente.', syllables: 'ca - lien - te', clean: 'caliente' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 11,
    worldId: 11,
    worldName: 'Mundo 11: Letra B',
    title: 'El barco azul de Beto',
    emoji: '⛵',
    coverColor: '#e0f2fe',
    moral: 'Navegar con ilusión nos lleva a descubrir nuevos horizontes.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'BA - BE - BI - BO - BU',
        illustrationDescription: 'Un barquito velero navega en el mar junto a una ballena.',
        lines: [
          {
            words: [
              { display: 'Beto', syllables: 'Be - to', clean: 'Beto' },
              { display: 'viaja', syllables: 'via - ja', clean: 'viaja' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'barco', syllables: 'bar - co', clean: 'barco' },
              { display: 'bonito.', syllables: 'bo - ni - to', clean: 'bonito' },
            ],
          },
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'ballena', syllables: 'ba - lle - na', clean: 'ballena' },
              { display: 'saluda', syllables: 'sa - lu - da', clean: 'saluda' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'alegría.', syllables: 'a - le - grí - a', clean: 'alegría' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 12,
    worldId: 12,
    worldName: 'Mundo 12: Letra V',
    title: 'La vaca Valentina en el valle',
    emoji: '🐮',
    coverColor: '#d1fae5',
    moral: 'El pasto verde y el aire puro hacen cantar a la naturaleza.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'VA - VE - VI - VO - VU',
        illustrationDescription: 'Una simpática vaca pasea por un valle con flores de colores.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'vaca', syllables: 'va - ca', clean: 'vaca' },
              { display: 'Valentina', syllables: 'Va - len - ti - na', clean: 'Valentina' },
              { display: 'vive', syllables: 'vi - ve', clean: 'vive' },
              { display: 'feliz.', syllables: 'fe - liz', clean: 'feliz' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'viento', syllables: 'vien - to', clean: 'viento' },
              { display: 'suave', syllables: 'sua - ve', clean: 'suave' },
              { display: 'acaricia', syllables: 'a - ca - ri - cia', clean: 'acaricia' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'valle.', syllables: 'va - lle', clean: 'valle' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 13,
    worldId: 13,
    worldName: 'Mundo 13: Letra G',
    title: 'El gato Goloso y la gota de agua',
    emoji: '🐱',
    coverColor: '#fef3c7',
    moral: 'La curiosidad nos enseña cosas nuevas cada día.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'GA - GO - GU',
        illustrationDescription: 'Un gatito atigrado juega con una gota de rocío en una hoja.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'gato', syllables: 'ga - to', clean: 'gato' },
              { display: 'Goloso', syllables: 'Go - lo - so', clean: 'Goloso' },
              { display: 'mira', syllables: 'mi - ra', clean: 'mira' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'gota.', syllables: 'go - ta', clean: 'gota' },
            ],
          },
          {
            words: [
              { display: 'Juega', syllables: 'Jue - ga', clean: 'Juega' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'patita', syllables: 'pa - ti - ta', clean: 'patita' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'jardín.', syllables: 'jar - dín', clean: 'jardín' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 14,
    worldId: 14,
    worldName: 'Mundo 14: Letra F',
    title: 'La foca feliz y la flor del faro',
    emoji: '🦭',
    coverColor: '#fce7f3',
    moral: 'Una sonrisa y un detalle iluminan como un faro.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'FA - FE - FI - FO - FU',
        illustrationDescription: 'Una foquita marina sostiene una flor cerca de un faro costero.',
        lines: [
          {
            words: [
              { display: 'Fina', syllables: 'Fi - na', clean: 'Fina' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'foca', syllables: 'fo - ca', clean: 'foca' },
              { display: 'aplaude', syllables: 'a - plau - de', clean: 'aplaude' },
              { display: 'feliz.', syllables: 'fe - liz', clean: 'feliz' },
            ],
          },
          {
            words: [
              { display: 'Lleva', syllables: 'Lle - va', clean: 'Lleva' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'flor', syllables: 'flor', clean: 'flor' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'pie', syllables: 'pie', clean: 'pie' },
              { display: 'del', syllables: 'del', clean: 'del' },
              { display: 'faro.', syllables: 'fa - ro', clean: 'faro' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 15,
    worldId: 15,
    worldName: 'Mundo 15: Letra J',
    title: 'La jirafa Julia y el jugo de naranja',
    emoji: '🦒',
    coverColor: '#fef9c3',
    moral: 'Alcanzar cosas altas es fácil cuando nos ayudamos unos a otros.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'JA - JE - JI - JO - JU',
        illustrationDescription: 'Una jirafa de cuello largo bebe un vaso de jugo con sorbete.',
        lines: [
          {
            words: [
              { display: 'Julia', syllables: 'Ju - lia', clean: 'Julia' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'jirafa', syllables: 'ji - ra - fa', clean: 'jirafa' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'muy', syllables: 'muy', clean: 'muy' },
              { display: 'alta.', syllables: 'al - ta', clean: 'alta' },
            ],
          },
          {
            words: [
              { display: 'Toma', syllables: 'To - ma', clean: 'Toma' },
              { display: 'jugo', syllables: 'ju - go', clean: 'jugo' },
              { display: 'dulce', syllables: 'dul - ce', clean: 'dulce' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'sus', syllables: 'sus', clean: 'sus' },
              { display: 'amigos.', syllables: 'a - mi - gos', clean: 'amigos' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 16,
    worldId: 16,
    worldName: 'Mundo 16: Letra Q',
    title: 'El queso rico de Quique',
    emoji: '🧀',
    coverColor: '#fef3c7',
    moral: 'Cocinar con cariño hace que todo sepa delicioso.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'QUE - QUI',
        illustrationDescription: 'Un ratoncito simpático cocina con queso en una mesita.',
        lines: [
          {
            words: [
              { display: 'Quique', syllables: 'Qui - que', clean: 'Quique' },
              { display: 'come', syllables: 'co - me', clean: 'come' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'rico', syllables: 'ri - co', clean: 'rico' },
              { display: 'queso.', syllables: 'que - so', clean: 'queso' },
            ],
          },
          {
            words: [
              { display: 'Comparte', syllables: 'Com - par - te', clean: 'Comparte' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'pedacito', syllables: 'pe - da - ci - to', clean: 'pedacito' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'hermano.', syllables: 'her - ma - no', clean: 'hermano' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 17,
    worldId: 17,
    worldName: 'Mundo 17: Letra Z',
    title: 'El zorro Zacarías y la zanahoria',
    emoji: '🥕',
    coverColor: '#ffedd5',
    moral: 'Cuidar el huerto nos da alimentos sanos y deliciosos.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'ZA - ZO - ZU',
        illustrationDescription: 'Un zorrito con botas recolecta zanahorias en el huerto.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'zorro', syllables: 'zo - rro', clean: 'zorro' },
              { display: 'Zacarías', syllables: 'Za - ca - rí - as', clean: 'Zacarías' },
              { display: 'cuida', syllables: 'cui - da', clean: 'cuida' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'huerto.', syllables: 'huer - to', clean: 'huerto' },
            ],
          },
          {
            words: [
              { display: 'Cosecha', syllables: 'Co - se - cha', clean: 'Cosecha' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'zanahoria', syllables: 'za - na - ho - ria', clean: 'zanahoria' },
              { display: 'anaranjada.', syllables: 'a - na - ran - ja - da', clean: 'anaranjada' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 18,
    worldId: 18,
    worldName: 'Mundo 18: Letra Ñ',
    title: 'El ñandú curioso en la cabaña',
    emoji: '🦤',
    coverColor: '#ccfbf1',
    moral: 'Nuestra letra Ñ es un tesoro único del idioma español.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'ÑA - ÑE - ÑI - ÑO - ÑU',
        illustrationDescription: 'Un ave ñandú mira por la ventana de una cabaña rústica.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'ñandú', syllables: 'ñan - dú', clean: 'ñandú' },
              { display: 'camina', syllables: 'ca - mi - na', clean: 'camina' },
              { display: 'hacia', syllables: 'ha - cia', clean: 'hacia' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'cabaña.', syllables: 'ca - ba - ña', clean: 'cabaña' },
            ],
          },
          {
            words: [
              { display: 'Encuentra', syllables: 'En - cuen - tra', clean: 'Encuentra' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'muñeca', syllables: 'mu - ñe - ca', clean: 'muñeca' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'patio.', syllables: 'pa - tio', clean: 'patio' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 19,
    worldId: 19,
    worldName: 'Mundo 19: Dígrafos',
    title: 'El chocolate del perro Chicho',
    emoji: '🍫',
    coverColor: '#ede9fe',
    moral: 'Los sonidos dobles son como dos mejores amigos inseparables.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'CH - LL - RR',
        illustrationDescription: 'Un perrito blanco y marrón juega bajo la lluvia con una caja de chocolate.',
        lines: [
          {
            words: [
              { display: 'Chicho', syllables: 'Chi - cho', clean: 'Chicho' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'perro', syllables: 'pe - rro', clean: 'perro' },
              { display: 'mira', syllables: 'mi - ra', clean: 'mira' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'lluvia.', syllables: 'llu - via', clean: 'lluvia' },
            ],
          },
          {
            words: [
              { display: 'Huele', syllables: 'Hue - le', clean: 'Huele' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'rico', syllables: 'ri - co', clean: 'rico' },
              { display: 'chocolate', syllables: 'cho - co - la - te', clean: 'chocolate' },
              { display: 'caliente.', syllables: 'ca - lien - te', clean: 'caliente' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 20,
    worldId: 20,
    worldName: 'Mundo 20: Gran Final',
    title: 'El gran reino del lector campeón',
    emoji: '🏆',
    coverColor: '#fef3c7',
    moral: '¡Saber leer y escribir te da alas para volar por todo el universo!',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'A - Z (CAMPEÓN)',
        illustrationDescription: 'Chispita corona a la niña lectora con una tiara de estrellas y libros mágicos.',
        lines: [
          {
            words: [
              { display: '¡Hoy', syllables: 'Hoy', clean: 'Hoy' },
              { display: 'leemos', syllables: 'le - e - mos', clean: 'leemos' },
              { display: 'todas', syllables: 'to - das', clean: 'todas' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'letras', syllables: 'le - tras', clean: 'letras' },
              { display: 'mágicas!', syllables: 'má - gi - cas', clean: 'mágicas' },
            ],
          },
          {
            words: [
              { display: '¡Eres', syllables: 'E - res', clean: 'Eres' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'gran', syllables: 'gran', clean: 'gran' },
              { display: 'campeona', syllables: 'cam - pe - o - na', clean: 'campeona' },
              { display: 'de', syllables: 'de', clean: 'de' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'lectura!', syllables: 'lec - tu - ra', clean: 'lectura' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 21,
    worldId: 1,
    worldName: 'Cuento Mágico 21',
    title: 'El hada y la flor mágica',
    emoji: '🌸',
    coverColor: '#fce7f3',
    moral: 'Cuidar a las flores llena el bosque de alegría y perfume.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'FA - FL - MA',
        illustrationDescription: 'Una pequeña hada con alitas brillantes riega una flor rosa.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'hada', syllables: 'ha - da', clean: 'hada' },
              { display: 'Lili', syllables: 'Li - li', clean: 'Lili' },
              { display: 'vuela', syllables: 'vue - la', clean: 'vuela' },
              { display: 'feliz.', syllables: 'fe - liz', clean: 'feliz' },
            ],
          },
          {
            words: [
              { display: 'Riega', syllables: 'Rie - ga', clean: 'Riega' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'flor', syllables: 'flor', clean: 'flor' },
              { display: 'rosa', syllables: 'ro - sa', clean: 'rosa' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'linda.', syllables: 'lin - da', clean: 'linda' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'BRI - LLA',
        illustrationDescription: 'La flor mágica se abre y suelta chispas doradas.',
        lines: [
          {
            words: [
              { display: '¡La', syllables: 'La', clean: 'La' },
              { display: 'flor', syllables: 'flor', clean: 'flor' },
              { display: 'brilla', syllables: 'bri - lla', clean: 'brilla' },
              { display: 'como', syllables: 'co - mo', clean: 'como' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'sol!', syllables: 'sol', clean: 'sol' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'bosque', syllables: 'bos - que', clean: 'bosque' },
              { display: 'entero', syllables: 'en - te - ro', clean: 'entero' },
              { display: 'sonríe', syllables: 'son - rí - e', clean: 'sonríe' },
              { display: 'hoy.', syllables: 'hoy', clean: 'hoy' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 22,
    worldId: 2,
    worldName: 'Cuento Mágico 22',
    title: 'La gatita Mimi y el ovillo rosa',
    emoji: '🐱',
    coverColor: '#ffe4e6',
    moral: 'Jugar con amor hace que cada tarde sea especial y divertida.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'MI - TI - GA',
        illustrationDescription: 'Una gatita blanca juega con una bolita de lana suave.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'gatita', syllables: 'ga - ti - ta', clean: 'gatita' },
              { display: 'Mimi', syllables: 'Mi - mi', clean: 'Mimi' },
              { display: 'salta', syllables: 'sal - ta', clean: 'salta' },
              { display: 'alto.', syllables: 'al - to', clean: 'alto' },
            ],
          },
          {
            words: [
              { display: 'Empuja', syllables: 'Em - pu - ja', clean: 'Empuja' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'ovillo', syllables: 'o - vi - llo', clean: 'ovillo' },
              { display: 'por', syllables: 'por', clean: 'por' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'sala.', syllables: 'sa - la', clean: 'sala' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'RO - SA',
        illustrationDescription: 'Mimi se acurruca en su cestita y ronronea feliz.',
        lines: [
          {
            words: [
              { display: 'Mimi', syllables: 'Mi - mi', clean: 'Mimi' },
              { display: 'hace', syllables: 'ha - ce', clean: 'hace' },
              { display: 'miau', syllables: 'miau', clean: 'miau' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'dulzura.', syllables: 'dul - zu - ra', clean: 'dulzura' },
            ],
          },
          {
            words: [
              { display: 'Duerme', syllables: 'Duer - me', clean: 'Duerme' },
              { display: 'caliente', syllables: 'ca - lien - te', clean: 'caliente' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'cuna.', syllables: 'cu - na', clean: 'cuna' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 23,
    worldId: 3,
    worldName: 'Cuento Mágico 23',
    title: 'El picnic de Chispita en el bosque',
    emoji: '🧺',
    coverColor: '#dcfce7',
    moral: 'Compartir la comida con amigos hace la merienda más deliciosa.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'PI - NI - PA',
        illustrationDescription: 'Chispita la ardilla abre una canastita con nueces y manzanas.',
        lines: [
          {
            words: [
              { display: 'Chispita', syllables: 'Chis - pi - ta', clean: 'Chispita' },
              { display: 'lleva', syllables: 'lle - va', clean: 'lleva' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'cesta', syllables: 'ces - ta', clean: 'cesta' },
              { display: 'roja.', syllables: 'ro - ja', clean: 'roja' },
            ],
          },
          {
            words: [
              { display: 'Tiene', syllables: 'Tie - ne', clean: 'Tiene' },
              { display: 'pan,', syllables: 'pan', clean: 'pan' },
              { display: 'peras', syllables: 'pe - ras', clean: 'peras' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'miel', syllables: 'miel', clean: 'miel' },
              { display: 'dulce.', syllables: 'dul - ce', clean: 'dulce' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'A - MI - GO',
        illustrationDescription: 'Un pajarito y un conejito comen junto a Chispita sobre una manta a cuadros.',
        lines: [
          {
            words: [
              { display: 'Invita', syllables: 'In - vi - ta', clean: 'Invita' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'conejo', syllables: 'co - ne - jo', clean: 'conejo' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'pato.', syllables: 'pa - to', clean: 'pato' },
            ],
          },
          {
            words: [
              { display: '¡Todos', syllables: 'To - dos', clean: 'Todos' },
              { display: 'cantan', syllables: 'can - tan', clean: 'cantan' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'ríen', syllables: 'rí - en', clean: 'ríen' },
              { display: 'juntos!', syllables: 'jun - tos', clean: 'juntos' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 24,
    worldId: 4,
    worldName: 'Cuento Mágico 24',
    title: 'La mariposa de siete colores',
    emoji: '🦋',
    coverColor: '#e0e7ff',
    moral: 'Cada persona tiene colores hermosos y únicos en su corazón.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'MA - RI - PO - SA',
        illustrationDescription: 'Una mariposa con alas de arcoíris sobrevuela un campo de margaritas.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'mariposa', syllables: 'ma - ri - po - sa', clean: 'mariposa' },
              { display: 'abre', syllables: 'a - bre', clean: 'abre' },
              { display: 'sus', syllables: 'sus', clean: 'sus' },
              { display: 'alas.', syllables: 'a - las', clean: 'alas' },
            ],
          },
          {
            words: [
              { display: 'Tiene', syllables: 'Tie - ne', clean: 'Tiene' },
              { display: 'azul,', syllables: 'a - zul', clean: 'azul' },
              { display: 'amarillo', syllables: 'a - ma - ri - llo', clean: 'amarillo' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'verde.', syllables: 'ver - de', clean: 'verde' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'CO - LO - RES',
        illustrationDescription: 'La mariposa deja un rastro brillante sobre las flores.',
        lines: [
          {
            words: [
              { display: 'Baila', syllables: 'Bai - la', clean: 'Baila' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'aire', syllables: 'ai - re', clean: 'aire' },
              { display: 'tibio.', syllables: 'ti - bio', clean: 'tibio' },
            ],
          },
          {
            words: [
              { display: '¡Qué', syllables: 'Qué', clean: 'Qué' },
              { display: 'hermosa', syllables: 'her - mo - sa', clean: 'hermosa' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'luz!', syllables: 'luz', clean: 'luz' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 25,
    worldId: 5,
    worldName: 'Cuento Mágico 25',
    title: 'El dragón que quería cantar',
    emoji: '🐲',
    coverColor: '#fef08a',
    moral: 'Cuando intentas cosas nuevas con cariño, descubres tus talentos.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'DRA - GON - CAN - TA',
        illustrationDescription: 'Un dragón verde amigable con notas musicales saliendo de su pico.',
        lines: [
          {
            words: [
              { display: 'Dino', syllables: 'Di - no', clean: 'Dino' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'dragón', syllables: 'dra - gón', clean: 'dragón' },
              { display: 'no', syllables: 'no', clean: 'no' },
              { display: 'echa', syllables: 'e - cha', clean: 'echa' },
              { display: 'fuego.', syllables: 'fue - go', clean: 'fuego' },
            ],
          },
          {
            words: [
              { display: 'Dino', syllables: 'Di - no', clean: 'Dino' },
              { display: 'quiere', syllables: 'quie - re', clean: 'quiere' },
              { display: 'cantar', syllables: 'can - tar', clean: 'cantar' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'coro.', syllables: 'co - ro', clean: 'coro' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'VOZ - LIN - DA',
        illustrationDescription: 'Los animales del bosque aplauden la dulce melodía del dragón.',
        lines: [
          {
            words: [
              { display: 'Su', syllables: 'Su', clean: 'Su' },
              { display: 'voz', syllables: 'voz', clean: 'voz' },
              { display: 'suena', syllables: 'sue - na', clean: 'suena' },
              { display: 'suave', syllables: 'sua - ve', clean: 'suave' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'clara.', syllables: 'cla - ra', clean: 'clara' },
            ],
          },
          {
            words: [
              { display: '¡Bravo', syllables: 'Bra - vo', clean: 'Bravo' },
              { display: 'Dino,', syllables: 'Di - no', clean: 'Dino' },
              { display: 'cantas', syllables: 'can - tas', clean: 'cantas' },
              { display: 'genial!', syllables: 'ge - nial', clean: 'genial' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 26,
    worldId: 6,
    worldName: 'Cuento Mágico 26',
    title: 'La princesa Sofía y su poni',
    emoji: '👑',
    coverColor: '#fed7aa',
    moral: 'La verdadera nobleza está en ser amable con todos los animales.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'PO - NI - SO - FIA',
        illustrationDescription: 'Una pequeña princesa con corona de flores acaricia un poni blanco con crin dorada.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'princesa', syllables: 'prin - ce - sa', clean: 'princesa' },
              { display: 'Sofía', syllables: 'So - fí - a', clean: 'Sofía' },
              { display: 'peina', syllables: 'pei - na', clean: 'peina' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'poni.', syllables: 'po - ni', clean: 'poni' },
            ],
          },
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'poni', syllables: 'po - ni', clean: 'poni' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'llama', syllables: 'lla - ma', clean: 'llama' },
              { display: 'Saltarín.', syllables: 'Sal - ta - rín', clean: 'Saltarín' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'CO - RRE - CAM - PO',
        illustrationDescription: 'Sofía y el poni trotan por una pradera verde llena de tulipanes.',
        lines: [
          {
            words: [
              { display: 'Juntos', syllables: 'Jun - tos', clean: 'Juntos' },
              { display: 'corren', syllables: 'co - rren', clean: 'corren' },
              { display: 'por', syllables: 'por', clean: 'por' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'hierba.', syllables: 'hier - ba', clean: 'hierba' },
            ],
          },
          {
            words: [
              { display: '¡Son', syllables: 'Son', clean: 'Son' },
              { display: 'los', syllables: 'los', clean: 'los' },
              { display: 'mejores', syllables: 'me - jo - res', clean: 'mejores' },
              { display: 'amigos', syllables: 'a - mi - gos', clean: 'amigos' },
              { display: 'del', syllables: 'del', clean: 'del' },
              { display: 'reino!', syllables: 'rei - no', clean: 'reino' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 27,
    worldId: 7,
    worldName: 'Cuento Mágico 27',
    title: 'El viaje en el cohete de estrellas',
    emoji: '🚀',
    coverColor: '#c7d2fe',
    moral: 'La curiosidad y la lectura nos llevan hasta las galaxias más lejanas.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'CO - HE - TE - VIA - JE',
        illustrationDescription: 'Un cohete plateado con ventanillas redondas despega hacia el cielo estrellado.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'cohete', syllables: 'co - he - te', clean: 'cohete' },
              { display: 'sube', syllables: 'su - be', clean: 'sube' },
              { display: 'hasta', syllables: 'has - ta', clean: 'hasta' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'estrellas.', syllables: 'es - tre - llas', clean: 'estrellas' },
            ],
          },
          {
            words: [
              { display: 'Lleva', syllables: 'Lle - va', clean: 'Lleva' },
              { display: 'libros', syllables: 'li - bros', clean: 'libros' },
              { display: 'para', syllables: 'pa - ra', clean: 'para' },
              { display: 'leer', syllables: 'le - er', clean: 'leer' },
              { display: 'arriba.', syllables: 'a - rri - ba', clean: 'arriba' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'LU - NA - BRI - LLO',
        illustrationDescription: 'La luna sonríe al cohete mientras pasan asteroides de colores.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'luna', syllables: 'lu - na', clean: 'luna' },
              { display: 'saluda', syllables: 'sa - lu - da', clean: 'saluda' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'luz.', syllables: 'luz', clean: 'luz' },
            ],
          },
          {
            words: [
              { display: '¡Qué', syllables: 'Qué', clean: 'Qué' },
              { display: 'lindo', syllables: 'lin - do', clean: 'lindo' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'viajar', syllables: 'via - jar', clean: 'viajar' },
              { display: 'por', syllables: 'por', clean: 'por' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'espacio!', syllables: 'es - pa - cio', clean: 'espacio' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 28,
    worldId: 8,
    worldName: 'Cuento Mágico 28',
    title: 'El pastel de fresas y miel',
    emoji: '🎂',
    coverColor: '#fecdd3',
    moral: 'Cocinar en familia con amor es la receta más rica del mundo.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'PAS - TEL - FRE - SA',
        illustrationDescription: 'Un pastel esponjoso cubierto de crema blanca y fresas jugosas.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'abuela', syllables: 'a - bue - la', clean: 'abuela' },
              { display: 'hornea', syllables: 'hor - ne - a', clean: 'hornea' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'pastel.', syllables: 'pas - tel', clean: 'pastel' },
            ],
          },
          {
            words: [
              { display: 'Le', syllables: 'Le', clean: 'Le' },
              { display: 'pone', syllables: 'po - ne', clean: 'pone' },
              { display: 'fresas', syllables: 'fre - sas', clean: 'fresas' },
              { display: 'rojas', syllables: 'ro - jas', clean: 'rojas' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'miel.', syllables: 'miel', clean: 'miel' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'DU - LCE - SA - BOR',
        illustrationDescription: 'Toda la familia disfruta de una porción con una velita encendida.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'pastel', syllables: 'pas - tel', clean: 'pastel' },
              { display: 'huele', syllables: 'hue - le', clean: 'huele' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'vainilla.', syllables: 'vai - ni - lla', clean: 'vainilla' },
            ],
          },
          {
            words: [
              { display: '¡Todos', syllables: 'To - dos', clean: 'Todos' },
              { display: 'comen', syllables: 'co - men', clean: 'comen' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'rico', syllables: 'ri - co', clean: 'rico' },
              { display: 'trozo!', syllables: 'tro - zo', clean: 'trozo' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 29,
    worldId: 9,
    worldName: 'Cuento Mágico 29',
    title: 'El baile alegre de los delfines',
    emoji: '🐬',
    coverColor: '#bae6fd',
    moral: 'El mar y la naturaleza son tesoros que debemos amar y cuidar.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'DEL - FIN - O - LA',
        illustrationDescription: 'Dos delfines saltan sonrientes sobre las olas azules del mar.',
        lines: [
          {
            words: [
              { display: 'Dos', syllables: 'Dos', clean: 'Dos' },
              { display: 'delfines', syllables: 'del - fi - nes', clean: 'delfines' },
              { display: 'nadan', syllables: 'na - dan', clean: 'nadan' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'mar.', syllables: 'mar', clean: 'mar' },
            ],
          },
          {
            words: [
              { display: 'Saltan', syllables: 'Sal - tan', clean: 'Saltan' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'olas', syllables: 'o - las', clean: 'olas' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'alegría.', syllables: 'a - le - grí - a', clean: 'alegría' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'A - ZUL - A - GUA',
        illustrationDescription: 'El agua salpica gotitas brillantes como perlas.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'agua', syllables: 'a - gua', clean: 'agua' },
              { display: 'azul', syllables: 'a - zul', clean: 'azul' },
              { display: 'está', syllables: 'es - tá', clean: 'está' },
              { display: 'limpia.', syllables: 'lim - pia', clean: 'limpia' },
            ],
          },
          {
            words: [
              { display: '¡Los', syllables: 'Los', clean: 'Los' },
              { display: 'peces', syllables: 'pe - ces', clean: 'peces' },
              { display: 'bailan', syllables: 'bai - lan', clean: 'bailan' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'ellos!', syllables: 'e - llos', clean: 'ellos' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 30,
    worldId: 10,
    worldName: 'Cuento Mágico 30',
    title: 'La tortuga veloz y el río',
    emoji: '🐢',
    coverColor: '#ccfbf1',
    moral: 'Paso a pasito, con paciencia y constancia, se llega a cualquier meta.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'TOR - TU - GA - PA - SO',
        illustrationDescription: 'Una tortuguita con caparazón verde y flores nada en un río transparente.',
        lines: [
          {
            words: [
              { display: 'Tita', syllables: 'Ti - ta', clean: 'Tita' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'tortuga', syllables: 'tor - tu - ga', clean: 'tortuga' },
              { display: 'camina', syllables: 'ca - mi - na', clean: 'camina' },
              { display: 'despacio.', syllables: 'des - pa - cio', clean: 'despacio' },
            ],
          },
          {
            words: [
              { display: 'Pero', syllables: 'Pe - ro', clean: 'Pero' },
              { display: 'nunca', syllables: 'nun - ca', clean: 'nunca' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'detiene', syllables: 'de - tie - ne', clean: 'detiene' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'camino.', syllables: 'ca - mi - no', clean: 'camino' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'LLE - GA - ME - TA',
        illustrationDescription: 'Tita llega al gran lago y celebra con sus amigos los patitos.',
        lines: [
          {
            words: [
              { display: 'Tita', syllables: 'Ti - ta', clean: 'Tita' },
              { display: 'llega', syllables: 'lle - ga', clean: 'llega' },
              { display: 'primera', syllables: 'pri - me - ra', clean: 'primera' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'lago.', syllables: 'la - go', clean: 'lago' },
            ],
          },
          {
            words: [
              { display: '¡Con', syllables: 'Con', clean: 'Con' },
              { display: 'paciencia', syllables: 'pa - cien - cia', clean: 'paciencia' },
              { display: 'todo', syllables: 'to - do', clean: 'todo' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'logra!', syllables: 'lo - gra', clean: 'logra' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 31,
    worldId: 11,
    worldName: 'Cuento Mágico 31',
    title: 'La sirenita que coleccionaba letras',
    emoji: '🧜‍♀️',
    coverColor: '#e0f2fe',
    moral: 'Las letras son conchitas de oro que forman palabras mágicas.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'SI - RE - NA - MAR',
        illustrationDescription: 'Una sirenita de pelo morado recoge letras luminosas en el fondo del mar.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'sirena', syllables: 'si - re - na', clean: 'sirena' },
              { display: 'Coral', syllables: 'Co - ral', clean: 'Coral' },
              { display: 'busca', syllables: 'bus - ca', clean: 'busca' },
              { display: 'letras.', syllables: 'le - tras', clean: 'letras' },
            ],
          },
          {
            words: [
              { display: 'Encontró', syllables: 'En - con - tró', clean: 'Encontró' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'A,', syllables: 'A', clean: 'A' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'M', syllables: 'M', clean: 'M' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'O.', syllables: 'O', clean: 'O' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'A - MOR - CAN - TA',
        illustrationDescription: 'Coral escribe la palabra AMOR en la arena suave del fondo marino.',
        lines: [
          {
            words: [
              { display: 'Juntó', syllables: 'Jun - tó', clean: 'Juntó' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'letras', syllables: 'le - tras', clean: 'letras' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'leyó:', syllables: 'le - yó', clean: 'leyó' },
              { display: 'AMOR.', syllables: 'A - MOR', clean: 'AMOR' },
            ],
          },
          {
            words: [
              { display: '¡El', syllables: 'El', clean: 'El' },
              { display: 'mar', syllables: 'mar', clean: 'mar' },
              { display: 'entero', syllables: 'en - te - ro', clean: 'entero' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'iluminó!', syllables: 'i - lu - mi - nó', clean: 'iluminó' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 32,
    worldId: 12,
    worldName: 'Cuento Mágico 32',
    title: 'El castillo de nubes de algodón',
    emoji: '🏰',
    coverColor: '#ede9fe',
    moral: 'Los sueños grandes se construyen leyendo todos los días.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'CAS - TI - LLO - NU - BE',
        illustrationDescription: 'Un castillo blanco y rosa sobre nubes esponjosas en lo alto del cielo.',
        lines: [
          {
            words: [
              { display: 'En', syllables: 'En', clean: 'En' },
              { display: 'lo', syllables: 'lo', clean: 'lo' },
              { display: 'alto', syllables: 'al - to', clean: 'alto' },
              { display: 'hay', syllables: 'hay', clean: 'hay' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'castillo', syllables: 'cas - ti - llo', clean: 'castillo' },
              { display: 'suave.', syllables: 'sua - ve', clean: 'suave' },
            ],
          },
          {
            words: [
              { display: 'Las', syllables: 'Las', clean: 'Las' },
              { display: 'torres', syllables: 'tor - res', clean: 'torres' },
              { display: 'son', syllables: 'son', clean: 'son' },
              { display: 'de', syllables: 'de', clean: 'de' },
              { display: 'nubes', syllables: 'nu - bes', clean: 'nubes' },
              { display: 'blancas.', syllables: 'blan - cas', clean: 'blancas' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'PUER - TA - LI - BRO',
        illustrationDescription: 'La puerta del castillo tiene la forma de un libro dorado abierto.',
        lines: [
          {
            words: [
              { display: 'Para', syllables: 'Pa - ra', clean: 'Para' },
              { display: 'entrar', syllables: 'en - trar', clean: 'entrar' },
              { display: 'debes', syllables: 'de - bes', clean: 'debes' },
              { display: 'leer', syllables: 'le - er', clean: 'leer' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'verso.', syllables: 'ver - so', clean: 'verso' },
            ],
          },
          {
            words: [
              { display: '¡La', syllables: 'La', clean: 'La' },
              { display: 'puerta', syllables: 'puer - ta', clean: 'puerta' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'abre', syllables: 'a - bre', clean: 'abre' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'saber', syllables: 'sa - ber', clean: 'saber' },
              { display: 'leer!', syllables: 'le - er', clean: 'leer' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 33,
    worldId: 13,
    worldName: 'Cuento Mágico 33',
    title: 'El perrito Lucas busca su huesito',
    emoji: '🐶',
    coverColor: '#fef3c7',
    moral: 'Los amigos siempre se ayudan cuando alguien pierde algo querido.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'PE - RRO - HUE - SO',
        illustrationDescription: 'Un perrito con manchita marrón mueve la colita en el jardín.',
        lines: [
          {
            words: [
              { display: 'Lucas', syllables: 'Lu - cas', clean: 'Lucas' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'perrito', syllables: 'pe - rri - to', clean: 'perrito' },
              { display: 'bueno.', syllables: 'bue - no', clean: 'bueno' },
            ],
          },
          {
            words: [
              { display: 'Mueve', syllables: 'Mue - ve', clean: 'Mueve' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'cola', syllables: 'co - la', clean: 'cola' },
              { display: 'bajo', syllables: 'ba - jo', clean: 'bajo' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'árbol.', syllables: 'ár - bol', clean: 'árbol' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'BUS - CA - EN - CUEN - TRA',
        illustrationDescription: 'Lucas encuentra su juguete favorito junto a una flor amarilla.',
        lines: [
          {
            words: [
              { display: 'Buscó', syllables: 'Bus - có', clean: 'Buscó' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'hueso', syllables: 'hue - so', clean: 'hueso' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'lo', syllables: 'lo', clean: 'lo' },
              { display: 'encontró.', syllables: 'en - con - tró', clean: 'encontró' },
            ],
          },
          {
            words: [
              { display: '¡Ladra', syllables: 'La - dra', clean: 'Ladra' },
              { display: 'feliz:', syllables: 'fe - liz', clean: 'feliz' },
              { display: '¡Guau,', syllables: 'Guau', clean: 'Guau' },
              { display: 'guau,', syllables: 'guau', clean: 'guau' },
              { display: 'guau!', syllables: 'guau', clean: 'guau' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 34,
    worldId: 14,
    worldName: 'Cuento Mágico 34',
    title: 'El jardín de los girasoles dorados',
    emoji: '🌻',
    coverColor: '#fef9c3',
    moral: 'Seguir la luz y la bondad hace florecer lo mejor de nosotros.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'GI - RA - SOL - LUZ',
        illustrationDescription: 'Girasoles gigantes que miran hacia un sol sonriente.',
        lines: [
          {
            words: [
              { display: 'Los', syllables: 'Los', clean: 'Los' },
              { display: 'girasoles', syllables: 'gi - ra - so - les', clean: 'girasoles' },
              { display: 'siguen', syllables: 'si - guen', clean: 'siguen' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'sol.', syllables: 'sol', clean: 'sol' },
            ],
          },
          {
            words: [
              { display: 'Son', syllables: 'Son', clean: 'Son' },
              { display: 'altos,', syllables: 'al - tos', clean: 'altos' },
              { display: 'fuertes', syllables: 'fuer - tes', clean: 'fuertes' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'amarillos.', syllables: 'a - ma - ri - llos', clean: 'amarillos' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'BE - LLE - ZA',
        illustrationDescription: 'Abejitas felices zumban recolectando polen dorado.',
        lines: [
          {
            words: [
              { display: 'Las', syllables: 'Las', clean: 'Las' },
              { display: 'abejas', syllables: 'a - be - jas', clean: 'abejas' },
              { display: 'bailan', syllables: 'bai - lan', clean: 'bailan' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'flores.', syllables: 'flo - res', clean: 'flores' },
            ],
          },
          {
            words: [
              { display: '¡La', syllables: 'La', clean: 'La' },
              { display: 'tierra', syllables: 'tier - ra', clean: 'tierra' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'llena', syllables: 'lle - na', clean: 'llena' },
              { display: 'de', syllables: 'de', clean: 'de' },
              { display: 'dulzura!', syllables: 'dul - zu - ra', clean: 'dulzura' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 35,
    worldId: 15,
    worldName: 'Cuento Mágico 35',
    title: 'El arcoíris de caramelo y frutas',
    emoji: '🌈',
    coverColor: '#fee2e2',
    moral: 'Después de la lluvia siempre sale un sol brillante y lleno de color.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'AR - CO - I - RIS',
        illustrationDescription: 'Un arcoíris cruza el cielo tras una suave llovizna veraniega.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'lluvia', syllables: 'llu - via', clean: 'lluvia' },
              { display: 'paró', syllables: 'pa - ró', clean: 'paró' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'valle.', syllables: 'va - lle', clean: 'valle' },
            ],
          },
          {
            words: [
              { display: 'Un', syllables: 'Un', clean: 'Un' },
              { display: 'arcoíris', syllables: 'ar - co - í - ris', clean: 'arcoíris' },
              { display: 'cruzó', syllables: 'cru - zó', clean: 'cruzó' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'cielo.', syllables: 'cie - lo', clean: 'cielo' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'PA - Z - CO - LOR',
        illustrationDescription: 'Niños y pajaritos admiran los colores del arcoíris.',
        lines: [
          {
            words: [
              { display: 'Rojo,', syllables: 'Ro - jo', clean: 'Rojo' },
              { display: 'naranja,', syllables: 'na - ran - ja', clean: 'naranja' },
              { display: 'verde', syllables: 'ver - de', clean: 'verde' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'morado.', syllables: 'mo - ra - do', clean: 'morado' },
            ],
          },
          {
            words: [
              { display: '¡Pintan', syllables: 'Pin - tan', clean: 'Pintan' },
              { display: 'sonrisas', syllables: 'son - ri - sas', clean: 'sonrisas' },
              { display: 'en', syllables: 'en', clean: 'en' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'tarde!', syllables: 'tar - de', clean: 'tarde' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 36,
    worldId: 16,
    worldName: 'Cuento Mágico 36',
    title: 'La lechuza sabia que lee de noche',
    emoji: '🦉',
    coverColor: '#e2e8f0',
    moral: 'Leer antes de dormir abre la puerta a los sueños más bonitos.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'LE - CHU - ZA - NO - CHE',
        illustrationDescription: 'Una lechuza con anteojitos redondos lee un librito bajo la luz de la luna.',
        lines: [
          {
            words: [
              { display: 'La', syllables: 'La', clean: 'La' },
              { display: 'lechuza', syllables: 'le - chu - za', clean: 'lechuza' },
              { display: 'Lola', syllables: 'Lo - la', clean: 'Lola' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 'pone', syllables: 'po - ne', clean: 'pone' },
              { display: 'lentes.', syllables: 'len - tes', clean: 'lentes' },
            ],
          },
          {
            words: [
              { display: 'Lee', syllables: 'Le - e', clean: 'Lee' },
              { display: 'cuentos', syllables: 'cuen - tos', clean: 'cuentos' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'los', syllables: 'los', clean: 'los' },
              { display: 'animales.', syllables: 'a - ni - ma - les', clean: 'animales' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'SUE - ÑO - DUL - CE',
        illustrationDescription: 'Los conejitos y cervatillos se duermen arropados por su voz.',
        lines: [
          {
            words: [
              { display: 'Su', syllables: 'Su', clean: 'Su' },
              { display: 'voz', syllables: 'voz', clean: 'voz' },
              { display: 'calma', syllables: 'cal - ma', clean: 'calma' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'los', syllables: 'los', clean: 'los' },
              { display: 'bebés.', syllables: 'be - bés', clean: 'bebés' },
            ],
          },
          {
            words: [
              { display: '¡Buenas', syllables: 'Bue - nas', clean: 'Buenas' },
              { display: 'noches', syllables: 'no - ches', clean: 'noches' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'todo', syllables: 'to - do', clean: 'todo' },
              { display: 'el', syllables: 'el', clean: 'el' },
              { display: 'bosque!', syllables: 'bos - que', clean: 'bosque' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 37,
    worldId: 17,
    worldName: 'Cuento Mágico 37',
    title: 'La fiesta sorpresa de las jirafas',
    emoji: '🦒',
    coverColor: '#fef08a',
    moral: 'Celebrar los logros de los demás con una fiesta alegra el corazón.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'JI - RA - FA - CUE - LLO',
        illustrationDescription: 'Jirafas con gorritos de fiesta colgando guirnaldas en las ramas altas.',
        lines: [
          {
            words: [
              { display: 'Las', syllables: 'Las', clean: 'Las' },
              { display: 'jirafas', syllables: 'ji - ra - fas', clean: 'jirafas' },
              { display: 'decoran', syllables: 'de - co - ran', clean: 'decoran' },
              { display: 'los', syllables: 'los', clean: 'los' },
              { display: 'árboles.', syllables: 'ár - bo - les', clean: 'árboles' },
            ],
          },
          {
            words: [
              { display: 'Tienen', syllables: 'Tie - nen', clean: 'Tienen' },
              { display: 'globos', syllables: 'glo - bos', clean: 'globos' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'música', syllables: 'mú - si - ca', clean: 'música' },
              { display: 'suave.', syllables: 'sua - ve', clean: 'suave' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'BAI - LE - FI - ES - TA',
        illustrationDescription: 'Todos los animales bailan en ronda bajo las linternas de papel.',
        lines: [
          {
            words: [
              { display: '¡Sorpresa,', syllables: 'Sor - pre - sa', clean: 'Sorpresa' },
              { display: 'gritan', syllables: 'gri - tan', clean: 'gritan' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'emoción!', syllables: 'e - mo - ción', clean: 'emoción' },
            ],
          },
          {
            words: [
              { display: '¡Hoy', syllables: 'Hoy', clean: 'Hoy' },
              { display: 'celebramos', syllables: 'ce - le - bra - mos', clean: 'celebramos' },
              { display: 'aprender', syllables: 'a - pren - der', clean: 'aprender' },
              { display: 'a', syllables: 'a', clean: 'a' },
              { display: 'leer!', syllables: 'le - er', clean: 'leer' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 38,
    worldId: 18,
    worldName: 'Cuento Mágico 38',
    title: 'El osito que cosió su botón azul',
    emoji: '🧸',
    coverColor: '#fed7aa',
    moral: 'Con paciencia y cuidado podemos arreglar lo que se ha roto.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'O - SO - BO - TON',
        illustrationDescription: 'Un osito de peluche con una aguja mágica y un hilo dorado.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'osito', syllables: 'o - si - to', clean: 'osito' },
              { display: 'Pompón', syllables: 'Pom - pón', clean: 'Pompón' },
              { display: 'perdió', syllables: 'per - dió', clean: 'perdió' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'botón.', syllables: 'bo - tón', clean: 'botón' },
            ],
          },
          {
            words: [
              { display: 'Buscó', syllables: 'Bus - có', clean: 'Buscó' },
              { display: 'un', syllables: 'un', clean: 'un' },
              { display: 'hilo', syllables: 'hi - lo', clean: 'hilo' },
              { display: 'azul', syllables: 'a - zul', clean: 'azul' },
              { display: 'brillante.', syllables: 'bri - llan - te', clean: 'brillante' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'CO - SE - FE - LIZ',
        illustrationDescription: 'Pompón sonríe luciendo su botón nuevecito en su peto.',
        lines: [
          {
            words: [
              { display: 'Cose', syllables: 'Co - se', clean: 'Cose' },
              { display: 'despacio', syllables: 'des - pa - cio', clean: 'despacio' },
              { display: 'con', syllables: 'con', clean: 'con' },
              { display: 'gran', syllables: 'gran', clean: 'gran' },
              { display: 'cuidado.', syllables: 'cui - da - do', clean: 'cuidado' },
            ],
          },
          {
            words: [
              { display: '¡Su', syllables: 'Su', clean: 'Su' },
              { display: 'botón', syllables: 'bo - tón', clean: 'botón' },
              { display: 'azul', syllables: 'a - zul', clean: 'azul' },
              { display: 'quedó', syllables: 'que - dó', clean: 'quedó' },
              { display: 'perfecto!', syllables: 'per - fec - to', clean: 'perfecto' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 39,
    worldId: 19,
    worldName: 'Cuento Mágico 39',
    title: 'El globo mágico que sube a la luna',
    emoji: '🎈',
    coverColor: '#fee2e2',
    moral: 'La imaginación te permite flotar tan alto como quieras.',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'GLO - BO - RO - JO',
        illustrationDescription: 'Un globo rojo y dorado que se eleva sobre las copas de los árboles.',
        lines: [
          {
            words: [
              { display: 'El', syllables: 'El', clean: 'El' },
              { display: 'globo', syllables: 'glo - bo', clean: 'globo' },
              { display: 'rojo', syllables: 'ro - jo', clean: 'rojo' },
              { display: 'vuela', syllables: 'vue - la', clean: 'vuela' },
              { display: 'al', syllables: 'al', clean: 'al' },
              { display: 'viento.', syllables: 'vien - to', clean: 'viento' },
            ],
          },
          {
            words: [
              { display: 'Pasa', syllables: 'Pa - sa', clean: 'Pasa' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'nubes', syllables: 'nu - bes', clean: 'nubes' },
              { display: 'y', syllables: 'y', clean: 'y' },
              { display: 'los', syllables: 'los', clean: 'los' },
              { display: 'aviones.', syllables: 'a - vio - nes', clean: 'aviones' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'LU - NA - BRI - LLA',
        illustrationDescription: 'El globo le da un besito a la luna en el cielo despejado.',
        lines: [
          {
            words: [
              { display: 'Llega', syllables: 'Lle - ga', clean: 'Llega' },
              { display: 'hasta', syllables: 'has - ta', clean: 'hasta' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'luna', syllables: 'lu - na', clean: 'luna' },
              { display: 'blanca.', syllables: 'blan - ca', clean: 'blanca' },
            ],
          },
          {
            words: [
              { display: '¡Todo', syllables: 'To - do', clean: 'Todo' },
              { display: 'se', syllables: 'se', clean: 'se' },
              { display: 've', syllables: 've', clean: 've' },
              { display: 'mágico', syllables: 'má - gi - co', clean: 'mágico' },
              { display: 'desde', syllables: 'des - de', clean: 'desde' },
              { display: 'arriba!', syllables: 'a - rri - ba', clean: 'arriba' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 40,
    worldId: 20,
    worldName: 'Cuento Mágico 40',
    title: 'La reina de las palabras de oro',
    emoji: '👸',
    coverColor: '#fef3c7',
    moral: '¡Cada niña que aprende a leer es la reina de su propio futuro brillante!',
    pages: [
      {
        pageNumber: 1,
        highlightSyllable: 'REI - NA - LI - BRO',
        illustrationDescription: 'Una niña lectora con corona de diamantes leyendo un libro brillante que desprende estrellitas.',
        lines: [
          {
            words: [
              { display: 'Había', syllables: 'Ha - bí - a', clean: 'Había' },
              { display: 'una', syllables: 'u - na', clean: 'una' },
              { display: 'niña', syllables: 'ni - ña', clean: 'niña' },
              { display: 'que', syllables: 'que', clean: 'que' },
              { display: 'amaba', syllables: 'a - ma - ba', clean: 'amaba' },
              { display: 'leer.', syllables: 'le - er', clean: 'leer' },
            ],
          },
          {
            words: [
              { display: 'Con', syllables: 'Con', clean: 'Con' },
              { display: 'cada', syllables: 'ca - da', clean: 'cada' },
              { display: 'palabra,', syllables: 'pa - la - bra', clean: 'palabra' },
              { display: 'su', syllables: 'su', clean: 'su' },
              { display: 'mundo', syllables: 'mun - do', clean: 'mundo' },
              { display: 'crecía.', syllables: 'cre - cí - a', clean: 'crecía' },
            ],
          },
        ],
      },
      {
        pageNumber: 2,
        highlightSyllable: 'CAM - PEO - NA - FIN',
        illustrationDescription: 'Chispita y todos los personajes de los 20 mundos aplauden con alegría.',
        lines: [
          {
            words: [
              { display: '¡Hoy', syllables: 'Hoy', clean: 'Hoy' },
              { display: 'ella', syllables: 'e - lla', clean: 'ella' },
              { display: 'es', syllables: 'es', clean: 'es' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'reina', syllables: 'rei - na', clean: 'reina' },
              { display: 'de', syllables: 'de', clean: 'de' },
              { display: 'las', syllables: 'las', clean: 'las' },
              { display: 'letras!', syllables: 'le - tras', clean: 'letras' },
            ],
          },
          {
            words: [
              { display: '¡Felicidades,', syllables: 'Fe - li - ci - da - des', clean: 'Felicidades' },
              { display: 'campeona', syllables: 'cam - pe - o - na', clean: 'campeona' },
              { display: 'de', syllables: 'de', clean: 'de' },
              { display: 'la', syllables: 'la', clean: 'la' },
              { display: 'lectura!', syllables: 'lec - tu - ra', clean: 'lectura' },
            ],
          },
        ],
      },
    ],
  },
];

export const ALL_STORIES = TWENTY_STORIES;


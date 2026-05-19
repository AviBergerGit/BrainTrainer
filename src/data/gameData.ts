export const ROUNDS = 10;


export const MODULE_META = [
  { id: 'memory',   name: t('mod_memory'),   icon: '🃏', color: '#4CAF7D', bg: '#E8F5EE', skill: t('skill_memory'),   category: 'memory' },
  { id: 'math',     name: t('mod_math'),     icon: '🔢', color: '#4A90D9', bg: '#EBF4FF', skill: t('skill_math'),     category: 'math' },
  { id: 'word',     name: t('mod_word'),     icon: '🔍', color: '#E87B5A', bg: '#FDEEE9', skill: t('skill_word'),     category: 'attention' },
  { id: 'sequence', name: t('mod_sequence'), icon: '🔮', color: '#9B72CF', bg: '#F2ECFA', skill: t('skill_sequence'), category: 'math' },
  { id: 'trivia',   name: t('mod_trivia'),   icon: '🖼️', color: '#F5C842', bg: '#FFFAE8', skill: t('skill_trivia'),   category: 'memory' },
  { id: 'color',    name: t('mod_color'),    icon: '🎨', color: '#26B5B5', bg: '#E8FAFA', skill: t('skill_color'),    category: 'attention' },
  { id: 'speed',    name: t('mod_speed'),    icon: '⚡',  color: '#FF6B9D', bg: '#FFF0F6', skill: t('skill_speed'),    category: 'speed' },
  { id: 'vanish',   name: t('mod_vanish'),   icon: '🔍', color: '#7B5EA7', bg: '#F5F0FF', skill: t('skill_vanish'),   category: 'memory' },
  { id: 'halfimg',  name: t('mod_halfimg'),  icon: '🧩', color: '#E07B39', bg: '#FFF4EE', skill: t('skill_halfimg'),  category: 'attention' },
  { id: 'listen',   name: t('mod_listen'),   icon: '🇮🇱', color: '#0A7B6C', bg: '#E8FAF7', skill: t('skill_listen'),   category: 'language' },
  { id: 'listenen', name: t('mod_listenen'), icon: '🇬🇧', color: '#1565C0', bg: '#E8F0FE', skill: t('skill_listenen'), category: 'language' },
  { id: 'puzzle',   name: t('mod_puzzle'),   icon: '🧩', color: '#9B72CF', bg: '#F5F0FF', skill: t('skill_puzzle'),   category: 'attention' },
  { id: 'bubble',   name: t('mod_bubble'),   icon: '🫧', color: '#FF6B9D', bg: '#FFF0F6', skill: t('skill_bubble'),   category: 'speed' },
  { id: 'spatial',   name: t('mod_spatial'),  icon: '🌀', color: '#4CAF7D', bg: '#E8F5EE', skill: t('skill_spatial'),  category: 'attention' },
  { id: 'bigger',   name: t('mod_bigger'),   icon: '⚖️', color: '#F9A825', bg: '#FFF9C4', skill: t('skill_bigger'),   category: 'math' },

];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function wrongNum(ans: number, mn: number, mx: number): number {
  let v: number;
  do { v = ans + (Math.random() < 0.5 ? 1 : -1) * rand(mn, mx); } while (v === ans || v < 0);
  return v;
}

export const memoryEmojis = ['🍎','🐶','🌸','⭐','🎵','🌈','🦋','🏡','🐱','🍕'];

export const oddOneOutData = [
  { items: ['🍎','🍊','🍋','🚗'],  odd: '🚗',  hint: 'פירות' },
  { items: ['🐶','🐱','🐟','🐘'],  odd: '🐟',  hint: 'בעלי חיים יבשתיים' },
  { items: ['🚗','🚌','✈️','🚲'],  odd: '✈️',  hint: 'כלי רכב יבשתיים' },
  { items: ['🌹','🌷','🌻','🍄'],  odd: '🍄',  hint: 'פרחים' },
  { items: ['⚽','🏀','🎾','🎸'],  odd: '🎸',  hint: 'כדורים' },
  { items: ['🍕','🍔','🍣','🍎'],  odd: '🍎',  hint: 'אוכל מבושל' },
  { items: ['🔴','🟡','🟢','🔔'],  odd: '🔔',  hint: 'צורות עגולות' },
  { items: ['👒','🧢','👑','👟'],  odd: '👟',  hint: 'כיסויי ראש' },
  { items: ['🌙','⭐','☀️','🌊'],  odd: '🌊',  hint: 'גרמי שמים' },
  { items: ['🎹','🎺','🎻','📺'],  odd: '📺',  hint: 'כלי נגינה' },
  { items: ['🐄','🐔','🐷','🦁'],  odd: '🦁',  hint: 'בעלי חיים חווה' },
  { items: ['🍦','🎂','🍩','🧅'],  odd: '🧅',  hint: 'קינוחים' },
  { items: ['🍇','🍓','🍑','🧅'],  odd: '🧅',  hint: 'פירות' },
  { items: ['🏊','🚴','🤸','📚'],  odd: '📚',  hint: 'ספורט' },
  { items: ['✏️','📏','📐','🍌'],  odd: '🍌',  hint: 'ציוד לימוד' },
  { items: ['🌧️','⛈️','🌨️','☀️'], odd: '☀️',  hint: 'מזג אוויר גשום' },
  { items: ['🐬','🦈','🐙','🦅'],  odd: '🦅',  hint: 'יצורי ים' },
  { items: ['🍞','🥐','🧀','🚌'],  odd: '🚌',  hint: 'מזון' },
];

export const seqSets = [
  { seq: [2,4,6,8],     answer: 10, opts: [10,9,12,11]  },
  { seq: [5,10,15,20],  answer: 25, opts: [25,22,30,28] },
  { seq: [1,3,6,10],    answer: 15, opts: [15,14,13,16] },
  { seq: [3,5,7,9],     answer: 11, opts: [11,10,12,13] },
  { seq: [1,2,4,8],     answer: 16, opts: [16,14,18,12] },
  { seq: [1,4,9,16],    answer: 25, opts: [25,23,26,20] },
  { seq: [2,3,5,8],     answer: 13, opts: [13,12,14,11] },
  { seq: [30,25,20,15], answer: 10, opts: [10,12,8,5]   },
  { seq: [1,3,5,7],     answer: 9,  opts: [9,8,11,10]   },
  { seq: [2,5,8,11],    answer: 14, opts: [14,13,15,12] },
  { seq: [10,9,8,7],    answer: 6,  opts: [6,5,7,4]     },
  { seq: [3,6,9,12],    answer: 15, opts: [15,14,16,18] },
  { seq: [1,2,3,4],     answer: 5,  opts: [5,6,4,7]     },
  { seq: [20,18,16,14], answer: 12, opts: [12,13,11,10] },
  { seq: [4,8,12,16],   answer: 20, opts: [20,18,22,24] },
];

export const triviaData = [
  { q: '🗼', opts: ['🇫🇷','🇮🇹','🇬🇧','🇩🇪'], a: '🇫🇷' },
  { q: '🍯', opts: ['🐝','🦋','🐛','🐞'],       a: '🐝'  },
  { q: '🌊', opts: ['🐳','🐘','🦁','🦅'],       a: '🐳'  },
  { q: '🌻', opts: ['🌧️','☀️','❄️','🌬️'],      a: '☀️'  },
  { q: '🍎', opts: ['🌳','🌵','🌴','🎋'],       a: '🌳'  },
  { q: '🥕', opts: ['🌱','🌊','🔥','💨'],       a: '🌱'  },
  { q: '🐟', opts: ['🏔️','🏜️','🌊','🌳'],      a: '🌊'  },
  { q: '🐣', opts: ['🐔','🐄','🐖','🐑'],       a: '🐔'  },
  { q: '🍇', opts: ['🍷','🧃','🍵','🥛'],       a: '🍷'  },
  { q: '🚀', opts: ['🌍','🌙','⭐','☀️'],       a: '🌙'  },
  { q: '🕎', opts: ['🕯️','🎄','🌙','⭐'],       a: '🕯️'  },
  { q: '🌹', opts: ['💐','🌻','🌷','🌹'],       a: '🌹'  },
  { q: '🐝', opts: ['🍯','🌸','🥛','🍋'],       a: '🍯'  },
  { q: '🐧', opts: ['🧊','🌴','🏜️','🌳'],      a: '🧊'  },
  { q: '🦁', opts: ['🌿','🏙️','🏔️','🌊'],      a: '🌿'  },
];

export const colorWords = [
  { word: 'אדום', color: '#E74C3C' },
  { word: 'כחול', color: '#3498DB' },
  { word: 'ירוק', color: '#27AE60' },
  { word: 'צהוב', color: '#D4AC0D' },
  { word: 'כתום', color: '#E67E22' },
  { word: 'סגול', color: '#9B59B6' },
];

export const puzzleSets = [
  // Each set: 8 emojis that form a themed "puzzle picture"
  // Theme: Farm
  ['🌾','🐄','🐓','🌽','🚜','🐖','🥕','🌻'],
  // Theme: Ocean
  ['🐬','🦈','🐚','🌊','🦞','🐡','🪸','⚓'],
  // Theme: Space
  ['🚀','🌙','⭐','🪐','☄️','👨‍🚀','🌍','🔭'],
  // Theme: Kitchen
  ['🍳','🥄','🔪','🫕','🧂','🥘','⏲️','🧆'],
  // Theme: Forest
  ['🦊','🌲','🍄','🦔','🐿️','🌿','🦌','🍁'],
  // Theme: City
  ['🏙️','🚕','🏪','🚦','👮','🚇','🏗️','🗽'],
  // Theme: Sports
  ['⚽','🏀','🎾','🏊','🚴','🥊','🏆','⛷️'],
  // Theme: Music
  ['🎸','🥁','🎹','🎺','🎻','🎤','🎵','🎼'],
  // Theme: Garden
  ['🌹','🦋','🐝','💧','🌱','🌷','🪴','🌸'],
  // Theme: Jungle
  ['🦁','🐘','🦒','🐍','🦜','🍌','🌴','🦏'],
  // Theme: Sweets
  ['🍰','🍩','🍫','🍭','🧁','🍬','🍦','🍮'],
  // Theme: Sea port
  ['⛵','🐟','🦀','🌅','⚓','🪝','🐠','🏖️'],
  // Theme: Winter
  ['⛄','❄️','🎿','🧣','🦌','🏔️','🧤','🌨️'],
  // Theme: Circus
  ['🎪','🤡','🎠','🎭','🦁','🎩','🎡','🎢'],
  // Theme: Space 2
  ['🛸','🌠','🌑','🪨','🔬','📡','🌌','🛰️'],
];

export const vanishSets = [
  ['🍎','🍊','🍋','🍇','🍓','🍑'], ['🐶','🐱','🐰','🐸','🦊','🐻'],
  ['⭐','🌙','☀️','🌈','⛅','❄️'], ['🌹','🌻','🌷','🌸','🌺','🍀'],
  ['🚗','🚌','✈️','🚢','🚲','🚂'], ['🎵','🎸','🎹','🎺','🎻','🥁'],
  ['🍕','🍔','🍣','🍦','🎂','🍩'], ['👒','👜','👟','🧣','💍','👓'],
  ['🏠','🏥','🏫','🕍','🏖️','🏔️'], ['🦁','🐘','🦒','🦓','🦏','🐆'],
  ['🍞','🧀','🥚','🥛','🧈','🍯'], ['🌍','🌏','🌎','🗺️','🧭','🏔️'],
  ['🎨','✏️','📏','📐','🖌️','📌'], ['🐬','🦈','🐙','🦞','🐡','🦑'],
  ['🌴','🌵','🎋','🌿','🍂','🌾'],
];

import { t, LANG } from '../i18n';

const listenItems = [
  { he: 'לחצי על התפוח',         en: 'Tap the apple',        answer: '🍎', opts: ['🍎','🍊','🍇','🍋'] },
  { he: 'לחצי על הכלב',          en: 'Tap the dog',          answer: '🐶', opts: ['🐶','🐱','🐰','🐸'] },
  { he: 'לחצי על השמש',          en: 'Tap the sun',          answer: '☀️', opts: ['☀️','🌙','⭐','🌈'] },
  { he: 'לחצי על הפרח',          en: 'Tap the flower',       answer: '🌸', opts: ['🌸','🌻','🌹','🌷'] },
  { he: 'לחצי על הדגל של ישראל', en: 'Tap the flag of Israel', answer: '🇮🇱', opts: ['🇮🇱','🇺🇸','🇫🇷','🇬🇧'] },
  { he: 'לחצי על הלב האדום',     en: 'Tap the red heart',    answer: '❤️', opts: ['❤️','💛','💚','💜'] },
  { he: 'לחצי על הגיטרה',        en: 'Tap the guitar',       answer: '🎸', opts: ['🎸','🎹','🎺','🥁'] },
  { he: 'לחצי על הפיל',          en: 'Tap the elephant',     answer: '🐘', opts: ['🐘','🦁','🦒','🦓'] },
  { he: 'לחצי על המטריה',        en: 'Tap the umbrella',     answer: '☂️', opts: ['☂️','🧢','👒','🧣'] },
  { he: 'לחצי על הספר',          en: 'Tap the book',         answer: '📚', opts: ['📚','✏️','📱','📌'] },
  { he: 'לחצי על הירח',          en: 'Tap the moon',         answer: '🌙', opts: ['🌙','☀️','⭐','🌈'] },
  { he: 'לחצי על הדג',           en: 'Tap the fish',         answer: '🐟', opts: ['🐟','🐬','🦈','🐙'] },
  { he: 'לחצי על הגזר',          en: 'Tap the carrot',       answer: '🥕', opts: ['🥕','🍅','🌽','🥦'] },
  { he: 'לחצי על הפיצה',         en: 'Tap the pizza',        answer: '🍕', opts: ['🍕','🍔','🍣','🍩'] },
  { he: 'לחצי על הרכבת',         en: 'Tap the train',        answer: '🚂', opts: ['🚂','🚗','✈️','🚲'] },
  { he: 'לחצי על הכינור',        en: 'Tap the violin',       answer: '🎻', opts: ['🎻','🎸','🎹','🎺'] },
  { he: 'לחצי על הטלפון',        en: 'Tap the phone',        answer: '📱', opts: ['📱','💻','📺','📻'] },
  { he: 'לחצי על הארנב',         en: 'Tap the rabbit',       answer: '🐰', opts: ['🐰','🐸','🐱','🐶'] },
  { he: 'לחצי על העוגה',         en: 'Tap the cake',         answer: '🎂', opts: ['🎂','🍦','🍕','🍩'] },
  { he: 'לחצי על הכוכב',         en: 'Tap the star',         answer: '⭐', opts: ['⭐','🌙','☀️','🌈'] },
];
export const listenData = listenItems.map(item => ({
  say: LANG === 'he' ? item.he : item.en,
  answer: item.answer,
  opts: item.opts,
}));

export const listenEnData = [
  { say: 'Tap the apple',     answer: '🍎', opts: ['🍎','🍊','🍇','🍋'] },
  { say: 'Tap the dog',       answer: '🐶', opts: ['🐶','🐱','🐰','🐸'] },
  { say: 'Tap the sun',       answer: '☀️', opts: ['☀️','🌙','⭐','🌈'] },
  { say: 'Tap the flower',    answer: '🌸', opts: ['🌸','🌻','🌹','🌷'] },
  { say: 'Tap the red heart', answer: '❤️', opts: ['❤️','💛','💚','💜'] },
  { say: 'Tap the guitar',    answer: '🎸', opts: ['🎸','🎹','🎺','🥁'] },
  { say: 'Tap the elephant',  answer: '🐘', opts: ['🐘','🦁','🦒','🦓'] },
  { say: 'Tap the umbrella',  answer: '☂️', opts: ['☂️','🧢','👒','🧣'] },
  { say: 'Tap the book',      answer: '📚', opts: ['📚','✏️','📱','📌'] },
  { say: 'Tap the moon',      answer: '🌙', opts: ['🌙','☀️','⭐','🌈'] },
  { say: 'Tap the fish',      answer: '🐟', opts: ['🐟','🐬','🦈','🐙'] },
  { say: 'Tap the carrot',    answer: '🥕', opts: ['🥕','🍅','🌽','🥦'] },
  { say: 'Tap the pizza',     answer: '🍕', opts: ['🍕','🍔','🍣','🍩'] },
  { say: 'Tap the train',     answer: '🚂', opts: ['🚂','🚗','✈️','🚲'] },
  { say: 'Tap the violin',    answer: '🎻', opts: ['🎻','🎸','🎹','🎺'] },
  { say: 'Tap the phone',     answer: '📱', opts: ['📱','💻','📺','📻'] },
  { say: 'Tap the rabbit',    answer: '🐰', opts: ['🐰','🐸','🐱','🐶'] },
  { say: 'Tap the cake',      answer: '🎂', opts: ['🎂','🍦','🍕','🍩'] },
  { say: 'Tap the star',      answer: '⭐', opts: ['⭐','🌙','☀️','🌈'] },
  { say: 'Tap the butterfly', answer: '🦋', opts: ['🦋','🐝','🐛','🐞'] },
];

export const halfImgEmojis = [
  '🪑','🛋️','🛏️','🚪','🪞','🧴','🪥','🧹','🧺','🧻',
  '☕','🍵','🥄','🍴','🔪','🫖','🥢','🍶','🧊','🫙',
  '📱','💻','📺','📻','🖨️','⌨️','🖱️','📷','📸','🔦',
  '🔑','🪝','🧲','🔧','🔨','🪛','🔩','🧰','⚙️','🪤',
  '👜','👛','🎒','🧳','☂️','🧤','🧣','🧢','👒','🥿',
  '📚','✏️','📏','📐','🖊️','📌','📎','🗂️','📋','🗒️',
];

export const speedEmojis = ['🍎','🐶','🌸','⭐','🎵','🌈','🦋','🏡','🐱','🍕','🎈','🌻','🐸','🍓','🚀','🦁','🍦','🎸','🌊','🦄'];

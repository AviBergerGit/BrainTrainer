import { NativeModules, Platform } from 'react-native';

// ─── Detect device language (no external dependency) ─────
function getDeviceLang(): 'he' | 'en' {
  try {
    // React Native built-in locale detection
    let locale = 'en';
    if (Platform.OS === 'ios') {
      // Use AppleLocale first — it reflects the actual display language chosen in Settings
      // AppleLanguages is a list and may contain Hebrew even if UI is English
      const appleLocale = NativeModules.SettingsManager?.settings?.AppleLocale || '';
      const appleLanguages: string[] = NativeModules.SettingsManager?.settings?.AppleLanguages || [];
      // AppleLocale format: 'en_US', 'he_IL' — take language part before underscore
      const localeFromLocale = appleLocale.split('_')[0].split('-')[0].toLowerCase();
      // AppleLanguages[0] format: 'en-US', 'he-IL'
      const localeFromLang = (appleLanguages[0] || '').split('-')[0].split('_')[0].toLowerCase();
      // Prefer AppleLocale (active display language), fall back to AppleLanguages
      locale = localeFromLocale || localeFromLang || 'en';
    } else {
      locale = (
        NativeModules.I18nManager?.localeIdentifier ||
        'en'
      ).toLowerCase();
    }
    return locale.startsWith('he') ? 'he' : 'en';
  } catch {
    return 'en';
  }
}

export const LANG = getDeviceLang();
export const isHebrew = LANG === 'he';
export const isRTL    = LANG === 'he';

// ─── All UI strings ───────────────────────────────────────
const strings = {

  // ── Home screen ──
  appTagline:       { he: 'אימון מוחי יומי',             en: 'Daily Brain Training' },
  chooseGame:       { he: 'בחרי תרגיל 👇',               en: 'Choose a game 👇' },
  statsBtn:         { he: '📊 סטטיסטיקות',             en: '📊 Statistics' },

  // ── Categories ──
  mod_puzzle:       { he: 'מצאי את החלק',            en: 'Find the Piece' },
  skill_puzzle:     { he: 'קשב • זיכרון חזותי',       en: 'Attention • Visual memory' },
  rememberPuzzle:   { he: 'זכרי את הפאזל',             en: 'Remember the puzzle' },
  findThePiece:     { he: 'מה חסר בפאזל?',              en: 'Which piece is missing?' },
  puzzleInstr:      { he: 'מה החלק החסר בפאזל?',   en: 'What piece is missing from the puzzle?' },
  puzzlePick:       { he: 'בחרי את החלק החסר:',    en: 'Pick the missing piece:' },
  mod_bubble:       { he: 'פוצצי בועות',          en: 'Bubble Pop' },
  skill_bubble:     { he: 'מהירות • קשב',          en: 'Speed • Attention' },
  bubbleTarget:     { he: 'פוצצי את הצבע:',         en: 'Pop this color:' },
  cat_all:          { he: 'הכל',        en: 'All' },
  cat_speed:        { he: 'מהירות',     en: 'Speed' },
  cat_memory:       { he: 'זיכרון',     en: 'Memory' },
  cat_math:         { he: 'חשבון',      en: 'Math' },
  cat_language:     { he: 'שפה',        en: 'Language' },
  cat_attention:    { he: 'קשב',        en: 'Attention' },
  mod_spatial:      { he: 'סיבוב מרחבי',      en: 'Spatial Rotation' },
  spatialInstr:      { he: 'מצאי את התמונה שהיא אותו דבר, רק מסובבת!', en: 'Find the image that is the same, just rotated!' },
  streakDays:       { he: (n: number) => `🔥 ${n} ימים ברצף`,  en: (n: number) => `🔥 ${n} day streak` },

  // ── Game header ──
  roundOf:          { he: (r: number, t: number) => `סיבוב ${r} מתוך ${t}`,  en: (r: number, t: number) => `Round ${r} of ${t}` },
  score:            { he: (s: number) => `⭐ ${s}`,        en: (s: number) => `⭐ ${s}` },

  // ── Navigation / alerts ──
  exitGame:         { he: 'יציאה מהמשחק',               en: 'Exit Game' },
  exitConfirm:      { he: 'האם לצאת?',                   en: 'Are you sure?' },
  keepPlaying:      { he: 'המשך לשחק',                   en: 'Keep Playing' },
  exit:             { he: 'צא',                           en: 'Exit' },

  // ── Feedback messages ──
  correct1:         { he: 'כל הכבוד! 🎉',                en: 'Well done! 🎉' },
  correct2:         { he: 'עשית זאת! ⭐',                 en: 'You got it! ⭐' },
  correct3:         { he: 'מצוין! 🌟',                    en: 'Excellent! 🌟' },
  correct4:         { he: 'נכון! 👏',                     en: 'Correct! 👏' },
  correct5:         { he: 'מושלם! 💐',                    en: 'Perfect! 💐' },
  wrong1:           { he: 'לא בדיוק 💙',                  en: 'Not quite 💙' },
  wrong2:           { he: 'בפעם הבאה! 💙',               en: 'Next time! 💙' },
  wrong3:           { he: 'כמעט! 💙',                     en: 'Almost! 💙' },
  wrong4:           { he: 'המשיכי כך! 💪',               en: 'Keep going! 💪' },
  wrong5:           { he: 'את מצליחה! 💪',               en: "You've got this! 💪" },
  nextRound:        { he: 'הסיבוב הבא ←',               en: 'Next round →' },
  toResults:        { he: '🏆 לתוצאות',                  en: '🏆 Results' },

  // ── Complete screen ──
  amazing:          { he: '🏆 מדהים! את גאונה!',         en: '🏆 Amazing! You\'re a genius!' },
  greatJob:         { he: '🌟 כל הכבוד!',                en: '🌟 Great job!' },
  niceWork:         { he: '👏 יפה מאוד!',                en: '👏 Nice work!' },
  nextTime:         { he: '💙 בפעם הבאה!',               en: '💙 Better luck next time!' },
  dontGiveUp:       { he: '💪 לא מוותרים!',              en: '💪 Don\'t give up!' },
  bigWin:           { he: 'ניצחת בגדול!',                en: 'You crushed it!' },
  excellentScore:   { he: 'תוצאה מצוינת!',               en: 'Excellent score!' },
  wentWell:         { he: 'הלכת ממש טוב!',               en: 'That went really well!' },
  keepPracticing:   { he: 'תמשיכי לתרגל!',              en: 'Keep practicing!' },
  practiceIsKey:    { he: 'ניסיון הוא המפתח!',           en: 'Practice makes perfect!' },
  backHome:         { he: '🏠 חזרה לבית',               en: '🏠 Back Home' },

  // ── Speed game ──
  tapThis:          { he: 'לחצי על זה! 👇',              en: 'Tap this! 👇' },
  tapOnly:          { he: (e: string) => `לחצי רק על ${e}`, en: (e: string) => `Tap only ${e}` },
  correctTaps:      { he: 'לחיצות נכונות',               en: 'Correct taps' },
  errors:           { he: 'שגיאות',                       en: 'Errors' },
  time:             { he: 'זמן',                           en: 'Time' },
  speedAmazing:     { he: 'מדהים! מהירות כמו ברק! ⚡',   en: 'Amazing speed! Fast as lightning! ⚡' },
  speedGood:        { he: 'כל הכבוד! זמן תגובה מצוין! 👏', en: 'Great job! Excellent reaction time! 👏' },
  speedKeepGoing:   { he: 'יפה מאוד! תמשיכי להתאמן! 💪', en: 'Well done! Keep practicing! 💪' },

  // ── Vanish game ──
  rememberAll:      { he: 'זכרי את כל התמונות!',         en: 'Remember all the pictures!' },
  oneWillVanish:    { he: 'אחד מהם יעלם...',             en: 'One will disappear...' },
  whatsMissing:     { he: 'מה נעלם מהרשימה?',            en: 'What\'s missing from the list?' },
  remembering:      { he: 'זוכרת? ⏳',                   en: 'Memorizing... ⏳' },

  // ── Word game ──
  whichIsDifferent: { he: 'איזה אחד שונה?',              en: 'Which one is different?' },
  doesntBelong:     { he: 'מה לא שייך לקבוצה?',          en: 'What doesn\'t belong?' },
  theGroup:         { he: (h: string) => `💡 הקבוצה: ${h}`, en: (h: string) => `💡 Group: ${h}` },

  // ── Sequence game ──
  whatsNext:        { he: 'מה הולך אחרי?',               en: 'What comes next?' },

  // ── Color game ──
  whatColorIsWord:  { he: 'באיזה צבע כתובה המילה?',      en: 'What color is the word written in?' },

  // ── Half image game ──
  whichHalf:        { he: 'איזה חצי משלים את התמונה? 👇', en: 'Which half completes the picture? 👇' },

  // ── Listen game ──
  listenAndChoose:  { he: 'האזיני לשמע ובחרי',           en: 'Listen and choose' },
  playAgainHe:      { he: 'נגני שוב',                    en: 'Play again' },
  tapAgainHe:       { he: '👆 הקישי לשמוע שוב',         en: '👆 Tap to hear again' },
  listenEn:         { he: 'האזיני לאנגלית! 🇬🇧',        en: 'Listen and tap! 🇬🇧' },
  tapAgainEn:       { he: 'Tap to hear again 👆',        en: 'Tap to hear again 👆' },

  // ── Memory game ──
  findThePairs:     { he: 'מצאי את הזוגות המתאימים!',    en: 'Find the matching pairs!' },

  // ── Stats screen ──
  myStats:          { he: '📊 הסטטיסטיקות שלי',          en: '📊 My Statistics' },
  myBrainJourney:   { he: 'המסע המוחי שלך',              en: 'Your brain journey' },
  daysStreak:       { he: 'ימים ברצף',                   en: 'Day streak' },
  games:            { he: 'משחקים',                       en: 'Games' },
  accuracy:         { he: 'דיוק כללי',                   en: 'Accuracy' },
  performByGame:    { he: '🎮 ביצועים לפי משחק',         en: '🎮 Performance by game' },
  gamesPlayed:      { he: (n: number) => `${n} משחקים`,  en: (n: number) => `${n} games` },
  recentHistory:    { he: '📅 היסטוריה אחרונה',          en: '📅 Recent history' },
  resetStats:       { he: '🗑️ אפס סטטיסטיקות',          en: '🗑️ Reset statistics' },
  resetConfirm:     { he: 'האם למחוק את כל הסטטיסטיקות?', en: 'Delete all statistics?' },
  resetYes:         { he: 'אפס',                          en: 'Reset' },
  resetNo:          { he: 'ביטול',                        en: 'Cancel' },
  correctAnswers:   { he: 'תשובות נכונות',               en: 'Correct answers' },

  // ── Voice warning ──
  voiceMissingBoth: { he: 'קול עברית ואנגלית לא מותקנים',  en: 'Hebrew & English voices not installed' },
  voiceMissingHe:   { he: 'קול עברית לא מותקן במכשיר',     en: 'Hebrew voice not installed on device' },
  voiceMissingEn:   { he: 'English voice not installed',    en: 'English voice not installed' },
  voiceHint:        { he: 'הגדרות ← נגישות ← תוכן מדובר ← קולות', en: 'Settings → Accessibility → Spoken Content → Voices' },

  // ── Module names & skills ──
  mod_memory:       { he: 'זיכרון זוגות',    en: 'Memory Match' },
  mod_math:         { he: 'חשבון מהיר',      en: 'Quick Math' },
  mod_bigger:       { he: 'איזה צד גדול?',    en: 'Which Side is Bigger?' },
  skill_bigger:     { he: 'חישוב • השוואה',    en: 'Math • Comparison' },
  biggerLeft:       { he: 'שמאל גדול יותר',    en: 'Left is bigger' },
  biggerRight:      { he: 'ימין גדול יותר',    en: 'Right is bigger' },
  biggerEqual:      { he: 'שווה!',             en: 'Equal!' },
  biggerInstr:      { he: 'איזה צד גדול יותר?', en: 'Which side is bigger?' },
  mod_word:         { he: 'מה שונה?',        en: 'Odd One Out' },
  mod_sequence:     { he: 'מה הבא?',         en: 'What\'s Next?' },
  mod_trivia:       { he: 'טריוויה בתמונות', en: 'Emoji Trivia' },
  mod_color:        { he: 'מוח צבעוני',      en: 'Color Brain' },
  mod_speed:        { he: 'מהירות תגובה',    en: 'Speed Reaction' },
  mod_vanish:       { he: 'מה נעלם?',        en: 'What Vanished?' },
  mod_halfimg:      { he: 'השלימי את התמונה', en: 'Complete the Picture' },
  mod_listen:       { he: 'Listen & Pick',    en: 'Listen & Pick' },
  mod_listenen:     { he: 'Listen & Pick',    en: 'Listen & Pick' },

  skill_memory:     { he: 'זיכרון',          en: 'Memory' },
  skill_math:       { he: 'חישוב',           en: 'Calculation' },
  skill_word:       { he: 'קשב חזותי',       en: 'Visual attention' },
  skill_sequence:   { he: 'הגיון',           en: 'Logic' },
  skill_trivia:     { he: 'ידע כללי',        en: 'General knowledge' },
  skill_color:      { he: 'קשב וריכוז',      en: 'Attention & focus' },
  skill_speed:      { he: 'מהירות • ריכוז',  en: 'Speed • Focus' },
  skill_vanish:     { he: 'זיכרון תמונות',   en: 'Visual memory' },
  skill_halfimg:    { he: 'זיהוי חזותי',     en: 'Visual recognition' },
  skill_listen:     { he: 'הבנת הנשמע',      en: 'Listening comprehension' },
  skill_listenen:   { he: 'English • הבנת שפה', en: 'English • Language' },
  skill_spatial:    { he: 'תפיסה חזותית • חשיבה מרחבית', en: 'Visual perception • Spatial thinking' },
  
  // ── Trivia game ──
  whatConnection:   { he: "מה הקשר?",                    en: "What's the connection?" },
  theGroupIs:       { he: (h: string) => `💡 הקבוצה: ${h}`, en: (h: string) => `💡 Group: ${h}` },

  // ── Listen game data ──
  tapThe:           { he: 'לחצי על ה',       en: 'Tap the' },
  apple:            { he: 'תפוח',            en: 'apple' },
  dog:              { he: 'כלב',             en: 'dog' },
  sun:              { he: 'שמש',             en: 'sun' },
  flower:           { he: 'פרח',             en: 'flower' },
  israelFlag:       { he: 'דגל של ישראל',    en: 'flag of Israel' },
  redHeart:         { he: 'לב האדום',        en: 'red heart' },
  guitar:           { he: 'גיטרה',           en: 'guitar' },
  elephant:         { he: 'פיל',             en: 'elephant' },
  umbrella:         { he: 'מטריה',           en: 'umbrella' },
  book:             { he: 'ספר',             en: 'book' },
  moon:             { he: 'ירח',             en: 'moon' },
  fish:             { he: 'דג',              en: 'fish' },
  carrot:           { he: 'גזר',             en: 'carrot' },
  pizza:            { he: 'פיצה',            en: 'pizza' },
  train:            { he: 'רכבת',            en: 'train' },
  violin:           { he: 'כינור',           en: 'violin' },
  phone:            { he: 'טלפון',           en: 'phone' },
  rabbit:           { he: 'ארנב',            en: 'rabbit' },
  cake:             { he: 'עוגה',            en: 'cake' },
  star:             { he: 'כוכב',            en: 'star' },
};

// ─── t() — translate a string key ────────────────────────
type StringKey = keyof typeof strings;

export function t(key: StringKey): string {
  const entry = strings[key];
  if (!entry) return key;
  return (entry as any)[LANG] ?? (entry as any)['en'] ?? key;
}

// For function strings (with arguments)
export function tf(key: StringKey, ...args: any[]): string {
  const entry = strings[key];
  if (!entry) return key;
  const fn = (entry as any)[LANG] ?? (entry as any)['en'];
  if (typeof fn === 'function') return fn(...args);
  return fn ?? key;
}

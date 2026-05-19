import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { checkVoiceAvailability } from './useVoiceCheck';
import { LANG } from '../i18n';

export const INSTRUCTIONS: Record<string, { he: string; en: string }> = {
  memory:   { he: 'מצאי את כל זוגות הקלפים המתאימים!',                              en: 'Find all the matching pairs of cards!' },
  math:     { he: 'פתרי את תרגיל החשבון ובחרי את התשובה הנכונה.',                   en: 'Solve the math problem and pick the correct answer.' },
  word:     { he: 'מצאי את הציור שלא שייך לקבוצה.',                                  en: 'Find the picture that does not belong to the group.' },
  sequence: { he: 'מצאי את המספר הבא בסדרה.',                                        en: 'Find the next number in the sequence.' },
  trivia:   { he: 'מצאי את הציור הקשור לתמונה הגדולה.',                              en: 'Find the picture connected to the big image.' },
  color:    { he: 'בחרי את הצבע שבו כתובה המילה, לא את משמעות המילה!',              en: 'Choose the color the word is written in, not its meaning!' },
  speed:    { he: 'לחצי על האיבר שמופיע בתיבה העליונה, בכל פעם שהוא מופיע ברשת!',  en: 'Tap the emoji shown in the box every time it appears in the grid!' },
  puzzle:   { he: 'מצאי את החלק החסר מהפאזל!',                              en: 'Find the missing piece from the puzzle!' },
  bubble:   { he: 'פוצצי את הבועות בצבע הנכון!',                              en: 'Pop all the bubbles with the correct color!' },
  bigger:   { he: 'איזה צד גדול יותר? שמאל, ימין, או שווה?',                  en: 'Which side is bigger? Left, right, or equal?' },
  vanish:   { he: 'זכרי את כל התמונות, ואז מצאי מה נעלם!',                           en: 'Remember all the pictures, then find what disappeared!' },
  halfimg:  { he: 'ראי את חצי התמונה ובחרי איזה חצי משלים אותה.',                   en: 'See half the picture and choose which half completes it.' },
  spatial:   { he: 'מצאי את התמונה שהיא אותו דבר, רק מסובבת!',                           en: 'Find the image that is the same, just rotated!' },
  listen:   { he: 'הקשיבי למילה ובחרי את הציור המתאים.',                              en: 'Listen to the word and tap the matching picture.' },
  listenen: { he: 'הקשיבי למילה באנגלית ובחרי את הציור המתאים.',                     en: 'Listen to the English word and tap the matching picture.' },
};

export function useVoiceInstruction(gameId: string, round: number) {
  const spokenRef = useRef(false);

  useEffect(() => {
    if (round !== 1 || spokenRef.current) return;
    spokenRef.current = true;

    const instr = INSTRUCTIONS[gameId];
    if (!instr) return;

    const timer = setTimeout(async () => {
      try {
        const { hebrewAvailable, englishAvailable } = await checkVoiceAvailability();

        // Use same LANG as UI text — guaranteed consistent
        let text: string | null = null;
        let lang: string | null = null;

        if (LANG === 'he' && hebrewAvailable) {
          text = instr.he; lang = 'he-IL';        // UI=Hebrew, voice=Hebrew ✅
        } else if (LANG === 'he' && !hebrewAvailable) {
          text = instr.en; lang = 'en-US';        // UI=Hebrew but no Hebrew voice
        } else if (englishAvailable) {
          text = instr.en; lang = 'en-US';        // UI=English, voice=English ✅
        } else if (hebrewAvailable) {
          text = instr.he; lang = 'he-IL';        // fallback
        }

        if (text && lang) {
          Speech.stop();
          Speech.speak(text, { language: lang, rate: 0.78, pitch: 1.0 });
        }
      } catch (e) {}
    }, 600);

    return () => {
      clearTimeout(timer);
      Speech.stop();
    };
  }, []);
}

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { memoryEmojis, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

const COLS = 4;
const CARD_BACK = '❓';

export default function MemoryGame({ round, totalRounds, onAnswer, SFX }: Props) {
  const { width } = useWindowDimensions();
  useVoiceInstruction('memory', round);
  const isTablet = width >= 768;
  // On tablet use 6 columns with max card size, on phone use 4 columns
  const COLS_USED = isTablet ? 6 : COLS;
  const maxWidth = isTablet ? Math.min(width, 600) : width;
  const cardSize = Math.floor((maxWidth - 24 - (COLS_USED - 1) * 10) / COLS_USED);

  // Always keep latest onAnswer in a ref so FeedbackOverlay never calls a stale version
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  const [deck, setDeck] = useState(() => shuffle([...memoryEmojis, ...memoryEmojis]));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [done, setDone] = useState(false);

  // Reset deck when round changes
  useEffect(() => {
    setDeck(shuffle([...memoryEmojis, ...memoryEmojis]));
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setDone(false);
  }, [round]);

  const handleFlip = (idx: number) => {
    if (lock || flipped.includes(idx) || matched.includes(idx) || done) return;
    SFX?.flip();
    const nf = [...flipped, idx];
    setFlipped(nf);
    if (nf.length === 2) {
      setLock(true);
      if (deck[nf[0]] === deck[nf[1]]) {
        SFX?.match();
        const nm = [...matched, ...nf];
        setMatched(nm); setFlipped([]); setLock(false);
        if (nm.length === deck.length) setDone(true);
      } else {
        setTimeout(() => { setFlipped([]); setLock(false); }, 900);
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={done}
    >
      <Text style={styles.instr}>{t("findThePairs")}</Text>
      <View style={styles.grid}>
        {deck.map((emoji, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          const isMatched = matched.includes(i);
          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleFlip(i)}
              style={[
                styles.card,
                { width: cardSize, height: cardSize, borderRadius: isTablet ? 18 : 14 },
                isMatched ? styles.cardMatched : isFlipped ? styles.cardFlipped : styles.cardHidden,
              ]}
            >
              <Text style={{ fontSize: cardSize * 0.48 }}>
                {isFlipped ? emoji : CARD_BACK}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {done && (
        <View style={styles.feedbackWrapper}>
          <FeedbackOverlay
            correct={true}
            round={round}
            totalRounds={totalRounds}
            onNext={() => onAnswerRef.current(true)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { alignItems: 'center', width: '100%', paddingBottom: 16 },
  instr: { fontSize: 16, fontWeight: '700', color: Colors.textSoft, marginBottom: 12, textAlign: 'center' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, justifyContent: 'center', width: '100%',
  },
  card: { alignItems: 'center', justifyContent: 'center', ...Shadow },
  cardHidden:  { backgroundColor: Colors.green },
  cardFlipped: { backgroundColor: Colors.white, borderWidth: 3, borderColor: Colors.green },
  cardMatched: { backgroundColor: Colors.greenLight, borderWidth: 3, borderColor: Colors.green, opacity: 0.7 },
  feedbackWrapper: { width: '100%', marginTop: 16 },
});

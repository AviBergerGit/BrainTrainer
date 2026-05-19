import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t, tf } from '../i18n';
import { oddOneOutData, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function WordGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const poolRef = useRef<typeof oddOneOutData>([]);
  useVoiceInstruction('word', round);
  const [item, setItem] = useState<typeof oddOneOutData[0] | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (!poolRef.current.length) poolRef.current = shuffle([...oddOneOutData]);
    const next = poolRef.current.pop()!;
    setItem(next); setItems(shuffle([...next.items])); setChosen(null);
    SFX?.questionPop();
  }, [round]);

  if (!item) return null;
  const answered = chosen !== null;

  // Allocate height budget
  // qBox: ~80, hint+feedback: ~110 when answered, grid: remainder
  const feedbackHeight = answered ? 110 : 0;
  const qBoxHeight = Math.min(80, availableHeight * 0.14);
  const hintHeight = answered ? 28 : 0;
  const gridHeight = availableHeight - qBoxHeight - hintHeight - feedbackHeight - 16 - 8;
  // 4 buttons in 2x2 grid with gap 10 → button height = (gridHeight - 10) / 2
  const btnH = Math.floor((gridHeight - 10) / 2);
  const emojiSize = Math.floor(btnH * 0.52);

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxHeight, marginBottom: 10 }]}>
        <Text style={styles.qLabel}>{t("whichIsDifferent")}</Text>
        <Text style={styles.qText} numberOfLines={1}>{t("doesntBelong")}</Text>
      </View>
      <View style={[styles.grid, { height: gridHeight }]}>
        {items.map(emoji => {
          const isOdd = emoji === item.odd, isSel = emoji === chosen;
          return (
            <TouchableOpacity key={emoji} onPress={() => { if (!answered) { SFX?.tap(); setChosen(emoji); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isOdd ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={{ fontSize: Math.max(20, Math.min(emojiSize, 56)) }}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <Text style={[styles.hint, { height: hintHeight }]}>{tf('theGroupIs', item.hint)}</Text>}
      {answered && <FeedbackOverlay correct={chosen === item.odd} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === item.odd); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  qBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 10, alignItems: 'center', justifyContent: 'center' },
  qLabel: { fontSize: 12, color: Colors.textSoft, fontWeight: '600' },
  qText: { fontSize: 18, fontWeight: '800', color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 3, borderColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center' },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
  hint: { fontSize: 13, fontWeight: '700', color: Colors.textSoft, textAlign: 'center', marginTop: 4 },
});

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { seqSets, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function SequenceGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const poolRef = useRef<typeof seqSets>([]);
  useVoiceInstruction('sequence', round);
  const [item, setItem] = useState<typeof seqSets[0] | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    if (!poolRef.current.length) poolRef.current = shuffle([...seqSets]);
    setItem(poolRef.current.pop()!); setChosen(null); SFX?.questionPop();
  }, [round]);

  if (!item) return null;
  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const qBoxH = Math.min(110, availableHeight * 0.2);
  const gridH = availableHeight - qBoxH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const numFontSize = Math.max(16, Math.min(24, qBoxH * 0.22));
  const btnFontSize = Math.max(18, Math.min(28, btnH * 0.38));

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxH, marginBottom: 12 }]}>
        <Text style={styles.label}>{t("whatsNext")}</Text>
        <View style={styles.seqRow}>
          {item.seq.map((n, i) => (
            <View key={i} style={[styles.numBox, { paddingVertical: Math.max(6, qBoxH * 0.07) }]}>
              <Text style={[styles.numText, { fontSize: numFontSize }]}>{n}</Text>
            </View>
          ))}
          <View style={[styles.numBox, styles.qMark, { paddingVertical: Math.max(6, qBoxH * 0.07) }]}>
            <Text style={[styles.numText, { fontSize: numFontSize }]}>?</Text>
          </View>
        </View>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {item.opts.map((opt, i) => {
          const isCorrect = opt === item.answer, isSel = opt === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(opt); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={[styles.btnText, { fontSize: btnFontSize }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <FeedbackOverlay correct={chosen === item.answer} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === item.answer); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  qBox: { backgroundColor: Colors.white, borderRadius: 20, padding: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSoft, marginBottom: 8 },
  seqRow: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  numBox: { backgroundColor: Colors.purpleLight, borderRadius: 10, paddingHorizontal: 10, minWidth: 38, alignItems: 'center' },
  qMark: { backgroundColor: Colors.purple + '22', borderWidth: 2, borderColor: Colors.purple, borderStyle: 'dashed' },
  numText: { fontWeight: '900', color: Colors.purple },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 3, borderColor: Colors.purpleLight, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '900', color: Colors.purple },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

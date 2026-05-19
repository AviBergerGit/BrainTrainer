import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { triviaData, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function TriviaGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const poolRef = useRef<typeof triviaData>([]);
  useVoiceInstruction('trivia', round);
  const [item, setItem] = useState<typeof triviaData[0] | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (!poolRef.current.length) poolRef.current = shuffle([...triviaData]);
    const next = poolRef.current.pop()!;
    setItem(next); setOpts(shuffle([...next.opts])); setChosen(null);
    SFX?.questionPop();
  }, [round]);

  if (!item) return null;
  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const qBoxH = Math.min(130, availableHeight * 0.24);
  const gridH = availableHeight - qBoxH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const emojiFontSize = Math.max(40, Math.min(70, qBoxH * 0.55));
  const btnEmojiFontSize = Math.max(24, Math.min(44, btnH * 0.5));

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxH, marginBottom: 12 }]}>
        <Text style={styles.label}>{t('whatConnection')}</Text>
        <Text style={{ fontSize: emojiFontSize }}>{item.q}</Text>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {opts.map((opt, i) => {
          const isCorrect = opt === item.a, isSel = opt === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(opt); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={{ fontSize: btnEmojiFontSize }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <FeedbackOverlay correct={chosen === item.a} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === item.a); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  qBox: { backgroundColor: Colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSoft, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 3, borderColor: Colors.yellowLight, alignItems: 'center', justifyContent: 'center' },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

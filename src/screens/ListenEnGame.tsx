import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { listenEnData, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function ListenEnGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const poolRef = useRef<typeof listenEnData>([]);
  useVoiceInstruction('listenen', round);
  const [item, setItem] = useState<typeof listenEnData[0] | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  const speak = (text: string) => { Speech.stop(); Speech.speak(text, { language: 'en-US', rate: 0.85 }); };

  useEffect(() => {
    if (!poolRef.current.length) poolRef.current = shuffle([...listenEnData]);
    const next = poolRef.current.pop()!;
    setItem(next); setOpts(shuffle([...next.opts])); setChosen(null);
    setTimeout(() => speak(next.say), 400);
    return () => { Speech.stop(); };
  }, [round]);

  if (!item) return null;
  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const qBoxH = Math.min(130, availableHeight * 0.24);
  const gridH = availableHeight - qBoxH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const btnEmojiSize = Math.max(22, Math.min(42, btnH * 0.5));
  const speakBtnPad = Math.max(8, Math.min(14, qBoxH * 0.1));

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxH, marginBottom: 12 }]}>
        <Text style={styles.instr}>{t("listenEn")}</Text>
        <TouchableOpacity style={[styles.speakBtn, { paddingVertical: speakBtnPad }]}
          onPress={() => { SFX?.tap(); speak(item.say); }}>
          <Text style={styles.speakIcon}>🔊</Text>
          <Text style={styles.speakText}>{t("playAgainHe")}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {opts.map((opt, i) => {
          const isCorrect = opt === item.answer, isSel = opt === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(opt); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={{ fontSize: btnEmojiSize }}>{opt}</Text>
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
  qBox: { backgroundColor: Colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  instr: { fontSize: 15, fontWeight: '800', color: Colors.navy, marginBottom: 10 },
  speakBtn: { backgroundColor: Colors.navyLight, borderRadius: 16, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  speakIcon: { fontSize: 26 },
  speakText: { fontSize: 16, fontWeight: '700', color: Colors.navy },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 18, borderWidth: 3, borderColor: Colors.navyLight, alignItems: 'center', justifyContent: 'center' },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

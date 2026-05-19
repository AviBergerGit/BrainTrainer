import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { colorWords, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function ColorGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const [state, setState] = useState<{ word: string; inkColor: string; answer: string; opts: string[] } | null>(null);
  useVoiceInstruction('color', round);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    const w = colorWords[Math.floor(Math.random() * colorWords.length)];
    let ink = colorWords[Math.floor(Math.random() * colorWords.length)];
    while (ink.color === w.color) ink = colorWords[Math.floor(Math.random() * colorWords.length)];
    const wrongs = shuffle(colorWords.filter(c => c.color !== ink.color)).slice(0, 3).map(c => c.word);
    setState({ word: w.word, inkColor: ink.color, answer: ink.word, opts: shuffle([ink.word, ...wrongs]) });
    setChosen(null); SFX?.questionPop();
  }, [round]);

  if (!state) return null;
  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const qBoxH = Math.min(130, availableHeight * 0.24);
  const gridH = availableHeight - qBoxH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const wordFontSize = Math.max(28, Math.min(56, qBoxH * 0.48));
  const btnFontSize = Math.max(14, Math.min(20, btnH * 0.28));

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxH, marginBottom: 12 }]}>
        <Text style={styles.instr}>{t('whatColorIsWord')}</Text>
        <Text style={[styles.word, { fontSize: wordFontSize, color: state.inkColor }]}>{state.word}</Text>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {state.opts.map((opt, i) => {
          const cw = colorWords.find(c => c.word === opt)!;
          const isCorrect = opt === state.answer, isSel = opt === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(opt); } }}
              style={[styles.btn, Shadow, { height: btnH, borderColor: cw?.color || '#ccc' },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={[styles.btnText, { fontSize: btnFontSize, color: cw?.color || Colors.text }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <FeedbackOverlay correct={chosen === state.answer} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === state.answer); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  qBox: { backgroundColor: Colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  instr: { fontSize: 14, fontWeight: '600', color: Colors.textSoft, marginBottom: 6 },
  bold: { fontWeight: '900', color: Colors.text },
  word: { fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '900' },
  correct: { backgroundColor: Colors.greenLight },
  wrong:   { backgroundColor: Colors.coralLight },
});

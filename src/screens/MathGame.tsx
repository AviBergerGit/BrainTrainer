import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { rand, wrongNum, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function MathGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const [q, setQ] = useState<{ display: string; answer: number; choices: number[] } | null>(null);
  useVoiceInstruction('math', round);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    const ops = ['+', '−', '×'];
    const op = ops[Math.floor(Math.random() * 3)];
    let a: number, b: number, answer: number;
    if (op === '+')      { a = rand(1,15); b = rand(1,30-a); answer = a+b; }
    else if (op === '−') { a = rand(5,30); b = rand(1,a);    answer = a-b; }
    else                 { a = rand(2,5);  b = rand(2,Math.min(6,Math.floor(30/a))); answer = a*b; }
    const choices = shuffle([answer, wrongNum(answer,1,10), wrongNum(answer,5,15), wrongNum(answer,2,20)]);
    setQ({ display: `${a} ${op} ${b} = ?`, answer, choices });
    setChosen(null);
    SFX?.questionPop();
  }, [round]);

  if (!q) return null;
  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const problemH = Math.min(120, availableHeight * 0.22);
  const gridH = availableHeight - problemH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const problemFontSize = Math.max(28, Math.min(44, problemH * 0.42));
  const btnFontSize = Math.max(20, Math.min(30, btnH * 0.38));

  return (
    <View style={styles.container}>
      <View style={[styles.problem, Shadow, { height: problemH, marginBottom: 12 }]}>
        <Text style={[styles.problemText, { fontSize: problemFontSize }]}>{q.display}</Text>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {q.choices.map((c, i) => {
          const isCorrect = c === q.answer, isSel = c === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(c); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={[styles.btnText, { fontSize: btnFontSize }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <FeedbackOverlay correct={chosen === q.answer} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === q.answer); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  problem: { backgroundColor: Colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  problemText: { fontWeight: '900', color: Colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 3, borderColor: Colors.blueLight, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontWeight: '900', color: Colors.blue },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

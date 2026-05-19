import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { rand, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';
import { t } from '../i18n';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; match:()=>void; questionPop:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

type Side = 'left' | 'right' | 'equal';

interface Expr { str: string; val: number; }

function makeExpr(): Expr {
  const ops = ['+', '−', '×'];
  const op = ops[Math.floor(Math.random() * 3)];
  let a: number, b: number, val: number;
  if (op === '+')      { a = rand(1,14); b = rand(1, Math.min(14, 29-a)); val = a+b; }
  else if (op === '−') { a = rand(2,20); b = rand(1, a-1);                 val = a-b; }
  else                 { a = rand(2,5);  b = rand(2, Math.min(6, Math.floor(30/a))); val = a*b; }
  return { str: `${a} ${op} ${b}`, val };
}

function generateQuestion(): { left: Expr; right: Expr; answer: Side } {
  const mode = Math.floor(Math.random() * 3); // 0=left bigger, 1=right bigger, 2=equal

  if (mode === 2) {
    // Equal: try to find two different expressions with the same result
    const left = makeExpr();
    let right = makeExpr();
    let tries = 0;
    while (right.val !== left.val && tries < 60) { right = makeExpr(); tries++; }
    if (right.val !== left.val) right = { str: left.str, val: left.val };
    return { left, right, answer: 'equal' };
  }

  // Different values
  let left = makeExpr(), right = makeExpr();
  let tries = 0;
  while (left.val === right.val && tries < 60) { right = makeExpr(); tries++; }
  if (left.val === right.val) right = { str: right.str, val: right.val + 1 };

  // Enforce mode
  if (mode === 0 && left.val < right.val) { const tmp = left; left = right; right = tmp; }
  if (mode === 1 && right.val < left.val) { const tmp = left; left = right; right = tmp; }

  const answer: Side = left.val > right.val ? 'left' : 'right';
  return { left, right, answer };
}

export default function BiggerGame({ round, totalRounds, onAnswer, SFX }: Props) {
  useVoiceInstruction('bigger', round);
  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  const [q, setQ] = useState<{ left: Expr; right: Expr; answer: Side } | null>(null);
  const [chosen, setChosen] = useState<Side | null>(null);
  const [showVals, setShowVals] = useState(false);

  useEffect(() => {
    setQ(generateQuestion());
    setChosen(null);
    setShowVals(false);
    SFX?.questionPop();
  }, [round]);

  if (!q) return null;

  const answered = chosen !== null;
  const correct  = chosen === q.answer;

  const handlePick = (side: Side) => {
    if (answered) return;
    SFX?.tap();
    setChosen(side);
    setShowVals(true);
    if (side === q.answer) SFX?.match();
    else SFX?.['wrong']?.();
  };

  const leftHighlight  = answered && (q.answer === 'left'  || q.answer === 'equal');
  const rightHighlight = answered && (q.answer === 'right' || q.answer === 'equal');

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <View style={styles.instrBox}>
        <Text style={styles.instrText}>⚖️ {t('biggerInstr')}</Text>
      </View>

      {/* Comparison */}
      <View style={styles.compareRow}>
        <View style={[styles.exprBox, Shadow, leftHighlight && styles.exprCorrect]}>
          <Text style={styles.exprText}>{q.left.str}</Text>
          {showVals && <Text style={styles.valText}>= {q.left.val}</Text>}
        </View>

        <View style={styles.vsBox}>
          <Text style={styles.vsText}>{showVals ? (q.left.val === q.right.val ? '=' : q.left.val > q.right.val ? '>' : '<') : '?'}</Text>
        </View>

        <View style={[styles.exprBox, Shadow, rightHighlight && styles.exprCorrect]}>
          <Text style={styles.exprText}>{q.right.str}</Text>
          {showVals && <Text style={styles.valText}>= {q.right.val}</Text>}
        </View>
      </View>

      {/* Answer buttons */}
      <View style={styles.btnRow}>
        {([
          { key: 'left'  as Side, label: `◀ ${t('biggerLeft')}`,  bg: Colors.blueLight,   border: Colors.blue   },
          { key: 'equal' as Side, label: `= ${t('biggerEqual')}`,  bg: '#FFF9C4',           border: '#F9A825'     },
          { key: 'right' as Side, label: `${t('biggerRight')} ▶`, bg: Colors.coralLight,  border: Colors.coral  },
        ] as const).map(b => {
          const isSel     = chosen === b.key;
          const isCorrect = b.key === q.answer;
          const bgColor = answered
            ? isCorrect ? Colors.green : isSel ? Colors.coral : b.bg
            : b.bg;
          const txtColor = answered && (isCorrect || isSel) ? 'white' : Colors.text;
          return (
            <TouchableOpacity
              key={b.key}
              onPress={() => handlePick(b.key)}
              disabled={answered}
              activeOpacity={0.8}
              style={[styles.answerBtn, Shadow, { backgroundColor: bgColor, borderColor: answered && isCorrect ? Colors.green : b.border }]}
            >
              <Text style={[styles.answerBtnText, { color: txtColor }]}>{b.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {answered && (
        <FeedbackOverlay
          correct={correct} round={round} totalRounds={totalRounds}
          onNext={() => onAnswerRef.current(correct)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { width: '100%', alignItems: 'center', gap: 16 },
  instrBox:     { backgroundColor: '#FFF9C4', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 2, borderColor: '#F9A825', alignSelf: 'stretch', alignItems: 'center' },
  instrText:    { fontSize: 16, fontWeight: '900', color: '#7B5EA7' },
  compareRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  exprBox:      { flex: 1, backgroundColor: 'white', borderRadius: 18, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 100, borderWidth: 3, borderColor: 'transparent' },
  exprCorrect:  { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  exprText:     { fontSize: 28, fontWeight: '900', color: Colors.text },
  valText:      { fontSize: 16, fontWeight: '700', color: Colors.green, marginTop: 6 },
  vsBox:        { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F0F0', borderRadius: 24 },
  vsText:       { fontSize: 24, fontWeight: '900', color: Colors.textSoft },
  btnRow:       { flexDirection: 'row', gap: 8, width: '100%' },
  answerBtn:    { flex: 1, borderRadius: 14, borderWidth: 3, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  answerBtnText:{ fontSize: 13, fontWeight: '900', textAlign: 'center' },
});

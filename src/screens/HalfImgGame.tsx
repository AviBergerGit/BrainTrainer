import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { halfImgEmojis, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; availableHeight?: number; }

export default function HalfImgGame({ round, totalRounds, onAnswer, SFX, availableHeight = 560 }: Props) {
  const usedRef = useRef<Set<string>>(new Set());
  useVoiceInstruction('halfimg', round);
  const [answer, setAnswer] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    if (usedRef.current.size >= halfImgEmojis.length - 3) usedRef.current.clear();
    const pool = halfImgEmojis.filter(e => !usedRef.current.has(e));
    const ans = pool[Math.floor(Math.random() * pool.length)];
    usedRef.current.add(ans);
    const wrongs = shuffle(halfImgEmojis.filter(e => e !== ans)).slice(0, 3);
    setAnswer(ans); setChoices(shuffle([ans, ...wrongs])); setChosen(null);
    SFX?.questionPop();
  }, [round]);

  const answered = chosen !== null;

  const feedbackH = answered ? 110 : 0;
  const qBoxH = Math.min(160, availableHeight * 0.30);
  const gridH = availableHeight - qBoxH - feedbackH - 12 - 10;
  const btnH = Math.floor((gridH - 10) / 2);
  const boxSize = Math.min(100, qBoxH * 0.65);
  const emojiSize = Math.floor(boxSize * 0.7);
  const btnEmojiSize = Math.max(22, Math.min(40, btnH * 0.5));

  return (
    <View style={styles.container}>
      <View style={[styles.qBox, Shadow, { height: qBoxH, marginBottom: 12 }]}>
        <Text style={styles.instr}>{t("whichHalf")}</Text>
        <View style={[styles.halfBox, { width: boxSize, height: boxSize }]}>
          <View style={[styles.reveal, { width: boxSize, height: boxSize, marginLeft: -(boxSize * 0.4) }]}>
            <Text style={{ fontSize: emojiSize, marginLeft: boxSize * 0.4 }}>{answer}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.grid, { height: gridH }]}>
        {choices.map((c, i) => {
          const isCorrect = c === answer, isSel = c === chosen;
          return (
            <TouchableOpacity key={i} onPress={() => { if (!answered) { SFX?.tap(); setChosen(c); } }}
              style={[styles.btn, Shadow, { height: btnH },
                answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {})]}>
              <Text style={{ fontSize: btnEmojiSize }}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {answered && <FeedbackOverlay correct={chosen === answer} round={round} totalRounds={totalRounds}
        onNext={() => { SFX?.tick(); onAnswer(chosen === answer); }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  qBox: { backgroundColor: Colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  instr: { fontSize: 14, fontWeight: '700', color: Colors.textSoft, marginBottom: 8 },
  halfBox: { overflow: 'hidden', borderRadius: 12, backgroundColor: Colors.orangeLight },
  reveal: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 18, borderWidth: 3, borderColor: Colors.orangeLight, alignItems: 'center', justifyContent: 'center' },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

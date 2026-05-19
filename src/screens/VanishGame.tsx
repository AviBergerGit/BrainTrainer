import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { vanishSets, shuffle } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

export default function VanishGame({ round, totalRounds, onAnswer, SFX }: Props) {
  const { height } = useWindowDimensions();
  const compact = height < 700;
  useVoiceInstruction('vanish', round);
  const poolRef = useRef<string[][]>([]);

  // Full set of 6 emojis (shown in grid at all times)
  const [fullSet, setFullSet] = useState<string[]>([]);
  const [missingIdx, setMissingIdx] = useState(0);
  const [missing, setMissing] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [phase, setPhase] = useState<'show' | 'pick'>('show');
  const [chosen, setChosen] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const choicesOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!poolRef.current.length) poolRef.current = shuffle([...vanishSets]);
    const set = [...poolRef.current.pop()!];
    const idx = Math.floor(Math.random() * set.length);
    const gone = set[idx];
    const allOthers = vanishSets.flat().filter(e => !set.includes(e));
    const wrongs = shuffle(allOthers).slice(0, 3);
    setFullSet(set);
    setMissingIdx(idx);
    setMissing(gone);
    setChoices(shuffle([gone, ...wrongs]));
    setPhase('show');
    setChosen(null);
    setCountdown(3);
    choicesOpacity.setValue(0);
    SFX?.questionPop();
  }, [round]);

  // Countdown then switch to pick phase
  useEffect(() => {
    if (phase !== 'show') return;
    if (countdown <= 0) {
      setPhase('pick');
      SFX?.flip();
      Animated.timing(choicesOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const answered = chosen !== null;

  return (
    <View style={styles.container}>
      {/* Instruction */}
      <View style={[styles.instrBox, compact && styles.instrBoxCompact]}>
        {phase === 'show'
          ? <Text style={styles.instrText}>{`👀 ${t('rememberAll')} (${countdown})`}</Text>
          : <Text style={styles.instrText}>{`🔍 ${t('whatsMissing')}`}</Text>
        }
      </View>

      {/* Single grid — emojis stay, only missing slot swaps to ? */}
      <View style={[styles.emojiGrid, Shadow]}>
        {fullSet.map((emoji, i) => {
          const isMissing = i === missingIdx && phase === 'pick';
          const isReveal = answered && i === missingIdx;
          return (
            <View key={i} style={[
              styles.cell,
              compact && styles.cellCompact,
              isMissing && !answered && styles.cellMissing,
              isReveal && (chosen === missing ? styles.cellCorrect : styles.cellWrong),
            ]}>
              <Text style={[styles.cellText, compact && styles.cellTextCompact]}>
                {isMissing && !answered ? '❓' : emoji}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Progress bar */}
      {phase === 'show' && (
        <View style={styles.barBg}>
          <View style={[styles.barFg, { width: `${(countdown / 3) * 100}%` }]} />
        </View>
      )}

      {/* Answer choices — fade in after countdown */}
      <Animated.View style={[styles.choicesWrap, { opacity: choicesOpacity }]}>
        <View style={styles.choicesGrid}>
          {choices.map((c, i) => {
            const isCorrect = c === missing, isSel = c === chosen;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => { if (!answered && phase === 'pick') { SFX?.tap(); setChosen(c); } }}
                style={[
                  styles.btn, Shadow,
                  compact && styles.btnCompact,
                  answered && (isCorrect ? styles.correct : isSel ? styles.wrong : {}),
                ]}
              >
                <Text style={[styles.btnText, compact && styles.btnTextCompact]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {answered && (
        <FeedbackOverlay
          correct={chosen === missing}
          round={round}
          totalRounds={totalRounds}
          onNext={() => { SFX?.tick(); onAnswer(chosen === missing); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  instrBox: { backgroundColor: Colors.purpleLight, borderRadius: 16, padding: 12, marginBottom: 12, alignItems: 'center', borderWidth: 2, borderColor: '#C8B4F0' },
  instrBoxCompact: { padding: 8, marginBottom: 8 },
  instrText: { fontSize: 17, fontWeight: '900', color: Colors.purple },

  emojiGrid: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 14,
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', marginBottom: 10,
  },
  cell: {
    width: '28%', aspectRatio: 1, borderRadius: 14,
    backgroundColor: '#F5F0FF', borderWidth: 2, borderColor: '#E8E0F8',
    alignItems: 'center', justifyContent: 'center',
  },
  cellCompact: { width: '27%' },
  cellMissing: { backgroundColor: '#E8E0F8', borderWidth: 2, borderColor: Colors.purple, borderStyle: 'dashed' },
  cellCorrect: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  cellWrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
  cellText: { fontSize: 36 },
  cellTextCompact: { fontSize: 28 },

  barBg: { width: '100%', height: 8, backgroundColor: '#E8E0F8', borderRadius: 50, marginBottom: 10, overflow: 'hidden' },
  barFg: { height: 8, backgroundColor: Colors.purple, borderRadius: 50 },

  choicesWrap: { width: '100%' },
  choicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  btn: { width: '47%', backgroundColor: Colors.white, borderRadius: 16, borderWidth: 2, borderColor: '#E8E0F8', padding: 14, alignItems: 'center' },
  btnCompact: { padding: 10 },
  btnText: { fontSize: 40 },
  btnTextCompact: { fontSize: 32 },
  correct: { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  wrong:   { backgroundColor: Colors.coralLight, borderColor: Colors.coral },
});

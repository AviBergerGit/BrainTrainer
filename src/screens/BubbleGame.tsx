import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

const COLORS = [
  { key: 'red',    hex: '#FF4B4B' },
  { key: 'blue',   hex: '#4A90D9' },
  { key: 'green',  hex: '#4CAF7D' },
  { key: 'yellow', hex: '#F5C842' },
  { key: 'purple', hex: '#9B72CF' },
];

interface Bubble {
  id: number;
  color: typeof COLORS[0];
  x: number;
  size: number;
  topAnim: Animated.Value; // animates 'top' from fieldH+size to -size*2
  tapped: boolean;
}

function getDifficulty(round: number) {
  const r = round - 1;
  return {
    totalBubbles:  Math.min(11, 8 + Math.floor(r / 3)),
    targetCount:   Math.min(5,  3 + Math.floor(r / 3)),
    spawnInterval: Math.max(700, 1200 - r * 60),
    riseDuration:  Math.max(9000, 14000 - r * 500),
    bubbleSize:    Math.max(56, 76 - r * 2),
    difficulty:    r < 3 ? '⭐' : r < 6 ? '⭐⭐' : '⭐⭐⭐',
  };
}

export default function BubbleGame({ round, totalRounds, onAnswer, SFX }: Props) {
  const { width } = useWindowDimensions();
  const [fieldHeight, setFieldHeight] = React.useState(380);
  useVoiceInstruction('bubble', round);

  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  const diff = getDifficulty(round);
  const [target, setTarget] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const hitsRef = useRef(0);
  const answeredRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const targetRef = useRef(target);

  useEffect(() => {
    if (fieldHeight === 0) return; // wait for layout
    hitsRef.current = 0;
    answeredRef.current = false;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Pick a new random target color each round
    const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTarget(newTarget);
    targetRef.current = newTarget;

    const otherColors = COLORS.filter(c => c.key !== newTarget.key);
    const colorList: typeof COLORS = [];
    for (let i = 0; i < diff.targetCount; i++) colorList.push(newTarget);
    while (colorList.length < diff.totalBubbles)
      colorList.push(otherColors[Math.floor(Math.random() * otherColors.length)]);
    for (let i = colorList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [colorList[i], colorList[j]] = [colorList[j], colorList[i]];
    }

    const newBubbles: Bubble[] = colorList.map((color, i) => {
      const size = (diff.bubbleSize - 6) + Math.random() * 12;
      const x = (size / 2) + Math.random() * Math.max(0, width - size - 32);
      // Start BELOW the field
      const topAnim = new Animated.Value(fieldHeight + size + 20);
      return { id: i, color, x, size, topAnim, tapped: false };
    });
    setBubbles(newBubbles);

    // Staggered spawn — animate top from bottom to above field
    newBubbles.forEach((b, i) => {
      const t0 = setTimeout(() => {
        if (answeredRef.current) return;
        Animated.timing(b.topAnim, {
          toValue: -(b.size + 20),  // exit above the field
          duration: diff.riseDuration * (0.85 + Math.random() * 0.3),
          useNativeDriver: false,   // must be false for 'top' layout prop
        }).start();
      }, i * diff.spawnInterval);
      timersRef.current.push(t0);
    });

    // Auto-end
    const autoEnd = setTimeout(() => {
      if (!answeredRef.current) endRound(hitsRef.current >= diff.targetCount);
    }, diff.totalBubbles * diff.spawnInterval + diff.riseDuration + 1000);
    timersRef.current.push(autoEnd);

    return () => { timersRef.current.forEach(clearTimeout); };
  }, [round, fieldHeight]);

  const endRound = (isCorrect: boolean) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    timersRef.current.forEach(clearTimeout);
    setCorrect(isCorrect);
    setAnswered(true);
  };

  const handleTap = (bubble: Bubble) => {
    if (answeredRef.current || bubble.tapped) return;
    SFX?.tap();
    bubble.tapped = true;
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, tapped: true } : b));
    if (bubble.color.key === targetRef.current.key) {
      SFX?.match();
      hitsRef.current += 1;
      if (hitsRef.current >= diff.targetCount) endRound(true);
    } else {
      SFX?.wrong();
      endRound(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Target instruction */}
      <View style={[styles.targetBox, { borderColor: target.hex }]}>
        <Text style={styles.diffText}>{diff.difficulty}</Text>
        <View style={[styles.targetSwatch, { backgroundColor: target.hex }]} />
        <Text style={styles.targetLabel}>{t('bubbleTarget')}</Text>
      </View>

      {/* Bubble field — flex:1 fills remaining space */}
      <View
        style={styles.field}
        onLayout={e => setFieldHeight(e.nativeEvent.layout.height)}
      >
        {bubbles.map(bubble => !bubble.tapped && (
          <Animated.View
            key={bubble.id}
            style={[
              styles.bubbleWrap,
              {
                left: bubble.x,
                width: bubble.size,
                height: bubble.size,
                top: bubble.topAnim,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleTap(bubble)}
              style={[
                styles.bubble,
                {
                  backgroundColor: bubble.color.hex,
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                },
              ]}
              activeOpacity={0.7}
            />
          </Animated.View>
        ))}
      </View>

      {answered && (
        <View style={styles.feedbackWrapper}>
          <FeedbackOverlay
            correct={correct}
            round={round}
            totalRounds={totalRounds}
            onNext={() => onAnswerRef.current(correct)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  targetBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 3, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    marginBottom: 10, backgroundColor: 'white', ...Shadow,
  },
  targetLabel: { fontSize: 15, fontWeight: '800', color: Colors.text },
  targetSwatch: { width: 34, height: 34, borderRadius: 17 },
  diffText: { fontSize: 13, color: Colors.textSoft },
  field: {
    width: '100%',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  bubbleWrap: { position: 'absolute' },
  bubble: { ...Shadow },
  feedbackWrapper: { width: '100%', paddingHorizontal: 4 },
});

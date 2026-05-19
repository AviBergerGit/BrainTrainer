import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';
import { shuffle, rand } from '../data/gameData';
import FeedbackOverlay from '../components/FeedbackOverlay';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { round: number; totalRounds: number; score: number; onAnswer: (correct: boolean) => void; SFX?: SFXObj; }

export default function SpatialGame({ round, totalRounds, onAnswer, SFX }: Props) {
  const { width } = useWindowDimensions();
  useVoiceInstruction('spatial', round);

  const onAnswerRef = useRef(onAnswer);
  useEffect(() => { onAnswerRef.current = onAnswer; }, [onAnswer]);

  const [gameState, setGameState] = useState<{
    target: boolean[];
    correct: boolean[];
    options: boolean[][];
    answered: boolean | null;
    correctIdx: number;
  } | null>(null);

  useEffect(() => {
    setupRound();
  }, [round]);

  function createRandomShape() {
    const shape = new Array(9).fill(false);
    const count = rand(3, 5);
    let filled = 0;
    while (filled < count) {
      const idx = Math.floor(Math.random() * 9);
      if (!shape[idx]) {
        shape[idx] = true;
        filled++;
      }
    }
    return shape;
  }

  function rotate90(shape: boolean[]) {
    const next = new Array(9).fill(false);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (shape[r * 3 + c]) next[c * 3 + (2 - r)] = true;
      }
    }
    return next;
  }

  function shapesEqual(s1: boolean[], s2: boolean[]) {
    return s1.every((val, i) => val === s2[i]);
  }

  function setupRound() {
    const target = createRandomShape();
    const rotationCount = Math.floor(Math.random() * 4);
    let correctShape = target;
    for (let i = 0; i < rotationCount; i++) correctShape = rotate90(correctShape);

    const options: boolean[][] = [correctShape];
    while (options.length < 4) {
      const distractor = createRandomShape();
      let isRotation = false;
      let curr = target;
      for (let i = 0; i < 4; i++) {
        if (shapesEqual(curr, distractor)) { isRotation = true; break; }
        curr = rotate90(curr);
      }
      if (!isRotation) options.push(distractor);
    }

    const shuffledOptions = shuffle(options);
    const correctIdx = shuffledOptions.indexOf(correctShape);

    setGameState({
      target,
      correct: correctShape,
      options: shuffledOptions,
      answered: null,
      correctIdx,
    });
  }

  const handleAnswer = (idx: number) => {
    if (gameState?.answered !== null) return;
    SFX?.tap();
    const isCorrect = idx === gameState!.correctIdx;
    setGameState(prev => prev ? { ...prev, answered: isCorrect } : null);
  };

  if (!gameState) return null;

  const cellSize = 30;
  const gridGap = 4;
  const gridWidth = cellSize * 3 + gridGap * 2;

  const renderGrid = (shape: boolean[], activeColor: string, inactiveColor: string) => (
    <View style={[styles.grid, { width: gridWidth }]}>
      {shape.map((cell, i) => (
        <View
          key={i}
          style={[
            styles.cell,
            { width: cellSize, height: cellSize, backgroundColor: cell ? activeColor : inactiveColor }
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.instr}>{t('spatialInstr')}</Text>

      <View style={styles.targetWrapper}>
        {renderGrid(gameState.target, Colors.purple, '#eee')}
      </View>

      <View style={styles.optionsGrid}>
        {gameState.options.map((opt, i) => {
          let cardStyle = styles.optionCard;
          if (gameState.answered !== null) {
            if (i === gameState.correctIdx) {
              cardStyle = styles.correctOption;
            } else if (gameState.answered === false) {
              cardStyle = styles.wrongOption;
            }
          }

          return (
            <TouchableOpacity
              key={i}
              onPress={() => handleAnswer(i)}
              style={cardStyle}
            >
              {renderGrid(opt, gameState.answered !== null && i === gameState.correctIdx ? Colors.green : Colors.purple, '#eee')}
            </TouchableOpacity>
          );
        })}
      </View>

      {gameState.answered !== null && (
        <View style={styles.feedbackWrapper}>
          <FeedbackOverlay
            correct={gameState.answered}
            round={round}
            totalRounds={totalRounds}
            onNext={() => onAnswerRef.current(gameState.answered!)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingBottom: 16 },
  instr: { fontSize: 16, fontWeight: '700', color: Colors.textSoft, marginBottom: 20, textAlign: 'center' },
  targetWrapper: { marginBottom: 30, padding: 8, backgroundColor: 'white', borderRadius: 12, ...Shadow },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: { borderRadius: 4 },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  optionCard: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    ...Shadow
  },
  correctOption: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.green,
    ...Shadow
  },
  wrongOption: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.coral,
    ...Shadow
  },
  feedbackWrapper: { width: '100%', marginTop: 16 },
});

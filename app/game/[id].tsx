import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../src/theme';
import { MODULE_META } from '../../src/data/gameData';
import { recordGameResult } from '../../src/hooks/useStats';
import { useSFXContext } from '../../src/contexts/SFXContext';
import { t } from '../../src/i18n';
import GameHeader from '../../src/components/GameHeader';

import MemoryGame    from '../../src/screens/MemoryGame';
import MathGame      from '../../src/screens/MathGame';
import WordGame      from '../../src/screens/WordGame';
import SequenceGame  from '../../src/screens/SequenceGame';
import TriviaGame    from '../../src/screens/TriviaGame';
import ColorGame     from '../../src/screens/ColorGame';
import SpeedGame     from '../../src/screens/SpeedGame';
import VanishGame    from '../../src/screens/VanishGame';
import HalfImgGame   from '../../src/screens/HalfImgGame';
import ListenGame    from '../../src/screens/ListenGame';
import ListenEnGame  from '../../src/screens/ListenEnGame';
import BubbleGame    from '../../src/screens/BubbleGame';
import PuzzleGame    from '../../src/screens/PuzzleGame';
import SpatialGame    from '../../src/screens/SpatialGame';
import BiggerGame    from '../../src/screens/BiggerGame';
import ErrorBoundary from '../../src/components/ErrorBoundary';
import CompleteScreen from '../../src/screens/CompleteScreen';

const ROUNDS_COUNT = 10;
const BODY_PADDING = 12;

export default function GameRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { SFX } = useSFXContext();

  const mod = MODULE_META.find(m => m.id === id);
  const isSpeed = id === 'speed';

  const handleAnswer = useCallback(async (correct: boolean) => {
    if (correct) SFX.correct(); else SFX.wrong();
    const newScore = correct ? score + 1 : score;
    if (round >= ROUNDS_COUNT) {
      setScore(newScore);
      await recordGameResult(id!, newScore, ROUNDS_COUNT);
      setDone(true);
      SFX.fanfare();
    } else {
      setScore(newScore);
      setRound(r => r + 1);
    }
  }, [round, score, id, SFX]);

  const handleBack = () => {
    SFX.tap();
    Alert.alert(t('exitGame'), t('exitConfirm'), [
      { text: t('keepPlaying'), style: 'cancel' },
      { text: t('exit'), onPress: () => router.back() },
    ]);
  };

  if (!mod) return null;

  if (done) {
    return <CompleteScreen score={score} total={ROUNDS_COUNT} modName={mod.name} color={mod.color}
      onHome={() => { SFX.tap(); router.replace('/'); }} />;
  }

  const gameProps = { round, totalRounds: ROUNDS_COUNT, score, onAnswer: handleAnswer, SFX };

  const renderGame = () => {
    switch (id) {
      case 'memory':   return <MemoryGame   {...gameProps} />;
      case 'math':     return <MathGame     {...gameProps} />;
      case 'word':     return <WordGame     {...gameProps} />;
      case 'sequence': return <SequenceGame {...gameProps} />;
      case 'trivia':   return <TriviaGame   {...gameProps} />;
      case 'color':    return <ColorGame    {...gameProps} />;
      case 'speed':    return <SpeedGame SFX={SFX} onComplete={async (hits) => {
        await recordGameResult('speed', Math.min(hits, ROUNDS_COUNT), ROUNDS_COUNT);
        router.replace('/');
      }} />;
      case 'vanish':   return <VanishGame   {...gameProps} />;
      case 'halfimg':  return <HalfImgGame  {...gameProps} />;
      case 'listen':   return <ListenGame   {...gameProps} />;
      case 'listenen': return <ListenEnGame {...gameProps} />;
      case 'bubble':   return <BubbleGame   {...gameProps} />;
      case 'puzzle':   return <ErrorBoundary><PuzzleGame {...gameProps} /></ErrorBoundary>;
      case 'spatial':    return <SpatialGame   {...gameProps} />;
      case 'bigger':   return <BiggerGame   {...gameProps} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: Colors.cream }]}>
      {!isSpeed && (
        <GameHeader title={mod.name} round={round} totalRounds={ROUNDS_COUNT} score={score} onBack={handleBack} />
      )}
      <View style={[styles.body, isSpeed && styles.bodySpeed, isTablet && { paddingHorizontal: 48 }]}>
        {renderGame()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: BODY_PADDING },
  bodySpeed: { padding: 12 },
});

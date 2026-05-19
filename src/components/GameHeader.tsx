import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { tf } from '../i18n';

interface Props {
  title: string;
  round: number;
  totalRounds: number;
  score: number;
  onBack: () => void;
}

export default function GameHeader({ title, round, totalRounds, score, onBack }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>→</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{tf('roundOf', round, totalRounds)}</Text>
      </View>
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreText}>⭐ {score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: Colors.white, ...Shadow,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.warm,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 20, fontWeight: '900', color: Colors.text },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: Colors.text },
  sub: { fontSize: 12, color: Colors.textSoft, marginTop: 1, fontWeight: '600' },
  scoreBadge: {
    backgroundColor: Colors.yellowLight, borderRadius: 50,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  scoreText: { fontSize: 14, fontWeight: '900', color: Colors.brown },
});

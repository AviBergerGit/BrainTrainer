import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Shadow } from '../theme';
import { t } from '../i18n';

interface Props { score: number; total: number; modName: string; color: string; onHome: () => void; }

const messages = [
  { min: 9,  msg: () => t('amazing'),      sub: () => t('bigWin') },
  { min: 7,  msg: () => t('greatJob'),     sub: () => t('excellentScore') },
  { min: 5,  msg: () => t('niceWork'),     sub: () => t('wentWell') },
  { min: 3,  msg: () => t('nextTime'),     sub: () => t('keepPracticing') },
  { min: 0,  msg: () => t('dontGiveUp'),   sub: () => t('practiceIsKey') },
];

export default function CompleteScreen({ score, total, modName, color, onHome }: Props) {
  const pct = Math.round((score / total) * 100);
  const entry = messages.find(m => score >= m.min)!;
  const msg = entry.msg();
  const sub = entry.sub();

  return (
    <View style={styles.container}>
      <View style={[styles.card, Shadow, { borderColor: color }]}>
        <Text style={styles.brain}>🧠</Text>
        <Text style={styles.msg}>{msg}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <View style={[styles.scoreBubble, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={[styles.scoreNum, { color }]}>{score}/{total}</Text>
          <Text style={[styles.scorePct, { color }]}>{pct}%</Text>
        </View>
        <Text style={styles.modName}>{modName}</Text>
        <Text style={styles.correctAnswers}>{t('correctAnswers')}</Text>
      </View>
      <TouchableOpacity style={[styles.homeBtn, { backgroundColor: color }]} onPress={onHome}>
        <Text style={styles.homeBtnText}>{t('backHome')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: Colors.white, borderRadius: 28, borderWidth: 3, padding: 20, alignItems: 'center', width: '100%', marginBottom: 18 },
  brain: { fontSize: 50, marginBottom: 6 },
  msg: { fontSize: 20, fontWeight: '900', color: Colors.text, textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 16, color: Colors.textSoft, fontWeight: '600', marginBottom: 18 },
  scoreBubble: { borderRadius: 20, borderWidth: 3, paddingHorizontal: 30, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  scoreNum: { fontSize: 34, fontWeight: '900' },
  scorePct: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  modName: { fontSize: 14, color: Colors.textSoft, fontWeight: '600' },
  correctAnswers: { fontSize: 13, color: Colors.textSoft, fontWeight: '600', marginTop: 2 },
  homeBtn: { borderRadius: 20, paddingHorizontal: 44, paddingVertical: 16, ...Shadow },
  homeBtnText: { color: Colors.white, fontSize: 17, fontWeight: '900' },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import { t, tf, isRTL } from '../i18n';

const positives = () => [t('correct1'),t('correct2'),t('correct3'),t('correct4'),t('correct5')];
const negatives = () => [t('wrong1'),t('wrong2'),t('wrong3'),t('wrong4'),t('wrong5')];

interface Props { correct: boolean; round: number; totalRounds: number; onNext: () => void; }

export default function FeedbackOverlay({ correct, round, totalRounds, onNext }: Props) {
  const msg = correct
    ? positives()[Math.floor(Math.random() * 5)]
    : negatives()[Math.floor(Math.random() * 5)];
  const isLast = round >= totalRounds;
  const rtl = isRTL;

  return (
    // Fixed height = 110 (matches budget in game screens)
    <View style={styles.container}>
      <View style={[styles.msgBox, correct ? styles.good : styles.bad]}>
        <Text style={[styles.msgText, { color: correct ? Colors.greenDark : '#c0392b' }]}>{msg}</Text>
      </View>
      <TouchableOpacity style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.nextText}>{isLast ? t('toResults') : t('nextRound')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, width: '100%', height: 100 },
  msgBox: { borderRadius: 14, padding: 8, marginBottom: 8, alignItems: 'center', height: 42, justifyContent: 'center' },
  good: { backgroundColor: Colors.greenLight },
  bad:  { backgroundColor: Colors.coralLight },
  msgText: { fontSize: 17, fontWeight: '900', textAlign: 'center' },
  nextBtn: { backgroundColor: Colors.green, borderRadius: 14, height: 44, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  nextText: { color: Colors.white, fontSize: 16, fontWeight: '900' },
});

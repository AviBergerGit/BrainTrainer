import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, useWindowDimensions, ScrollView
} from 'react-native';
import { Colors, Shadow } from '../theme';
import { t, tf } from '../i18n';
import { speedEmojis } from '../data/gameData';
import { useVoiceInstruction } from '../hooks/useVoiceInstruction';

interface SFXObj { tap:()=>void; correct:()=>void; wrong:()=>void; flip:()=>void; match:()=>void; tick:()=>void; questionPop:()=>void; fanfare:()=>void; }
interface Props { onComplete: (hits: number) => void; SFX?: SFXObj; }

const DURATION = 30;
const GRID = 9;

export default function SpeedGame({ onComplete, SFX }: Props) {
  const { width, height } = useWindowDimensions();
  const compact = height < 700;
  const isTablet = width >= 768;
  useVoiceInstruction('speed', 1);

  // Cap grid width on tablet so cells don't get too large
  const gridWidth = isTablet ? Math.min(width * 0.6, 480) : width;
  const cellSize = Math.floor((gridWidth - 24 - 8 * 2) / 3);
  // Target box height: hint text + emoji
  const targetBoxHeight = compact ? 70 : 84;
  // Stats row height
  const statsRowHeight = compact ? 38 : 46;

  const [phase, setPhase] = useState<'play' | 'end'>('play');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targetEmoji, setTargetEmoji] = useState('');
  const [cells, setCells] = useState<string[]>([]);
  const [flashIdx, setFlashIdx] = useState<number | null>(null);
  const [flashCorrect, setFlashCorrect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(true);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const targetScale = useRef(new Animated.Value(1)).current;

  const buildGrid = (target: string) => {
    const slot = Math.floor(Math.random() * GRID);
    const pool = speedEmojis.filter(e => e !== target);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const newCells: string[] = [];
    let di = 0;
    for (let i = 0; i < GRID; i++) {
      newCells.push(i === slot ? target : shuffled[di++ % shuffled.length]);
    }
    setCells(newCells);
  };

  const pickNewTarget = () => {
    const t = speedEmojis[Math.floor(Math.random() * speedEmojis.length)];
    setTargetEmoji(t);
    buildGrid(t);
    Animated.sequence([
      Animated.timing(targetScale, { toValue: 1.25, duration: 100, useNativeDriver: true }),
      Animated.timing(targetScale, { toValue: 1,    duration: 100, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    pickNewTarget();
    SFX?.questionPop();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        const next = t - 1;
        if (next <= 5 && next > 0) SFX?.tick();
        if (next <= 0) {
          clearInterval(timerRef.current!);
          activeRef.current = false;
          setPhase('end');
          SFX?.fanfare();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { clearInterval(timerRef.current!); };
  }, []);

  const handleTap = (emoji: string, idx: number) => {
    if (!activeRef.current) return;
    if (emoji === targetEmoji) {
      hitsRef.current++;
      setHits(hitsRef.current);
      SFX?.match();
      setFlashIdx(idx); setFlashCorrect(true);
      setTimeout(() => { setFlashIdx(null); pickNewTarget(); }, 180);
    } else {
      missesRef.current++;
      setMisses(missesRef.current);
      SFX?.wrong();
      setFlashIdx(idx); setFlashCorrect(false);
      setTimeout(() => setFlashIdx(null), 300);
    }
  };

  const pct = timeLeft / DURATION;
  const barColor = pct > 0.5 ? Colors.green : pct > 0.25 ? '#f0b429' : Colors.coral;
  const timerUrgent = timeLeft <= 10;

  // ── End screen ──
  if (phase === 'end') {
    const h = hitsRef.current;
    const m = missesRef.current;
    const stars = h >= 15 ? '🌟🌟🌟' : h >= 8 ? '🌟🌟' : '🌟';
    const msg = h >= 15 ? t('speedAmazing')
              : h >= 8  ? t('speedGood')
              :            t('speedKeepGoing');
    return (
      <ScrollView contentContainerStyle={styles.endContainer}>
        <Text style={styles.endStars}>{stars}</Text>
        <Text style={styles.endMsg}>{msg}</Text>
        <View style={[styles.endCard, Shadow]}>
          <Text style={styles.endLabel}>{t("correctTaps")}</Text>
          <Text style={styles.endHits}>{h}</Text>
          <View style={styles.endRow}>
            <View style={styles.endStat}>
              <Text style={[styles.endStatNum, { color: Colors.coral }]}>{m}</Text>
              <Text style={styles.endStatLbl}>{t("errors")}</Text>
            </View>
            <View style={styles.endStat}>
              <Text style={[styles.endStatNum, { color: Colors.blue }]}>{DURATION}s</Text>
              <Text style={styles.endStatLbl}>{t("time")}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={[styles.homeBtn, Shadow]} onPress={() => { SFX?.tap(); onComplete(h); }}>
          <Text style={styles.homeBtnText}>{t("backHome")}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Game screen ──
  const emojiSize = compact ? Math.min(cellSize * 0.45, 28) : Math.min(cellSize * 0.5, 34);

  return (
    <View style={styles.container}>
      {/* Stats row: hits | timer | misses */}
      <View style={[styles.statsRow, { height: statsRowHeight }]}>
        <View style={[styles.badge, styles.hitsBadge, compact && styles.badgeCompact]}>
          <Text style={[styles.hitsText, compact && styles.textCompact]}>✅ {hits}</Text>
        </View>
        <View style={[styles.timerBadge, Shadow, timerUrgent && styles.timerUrgent, compact && styles.badgeCompact]}>
          <Text style={[styles.timerText, timerUrgent && styles.timerTextUrgent, compact && styles.timerTextCompact]}>⏱ {timeLeft}</Text>
        </View>
        <View style={[styles.badge, styles.missesBadge, compact && styles.badgeCompact]}>
          <Text style={[styles.missesText, compact && styles.textCompact]}>❌ {misses}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.barBg}>
        <View style={[styles.barFg, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>

      {/* Target box */}
      <View style={[styles.targetBox, Shadow, { height: targetBoxHeight }]}>
        <Text style={[styles.targetHint, compact && styles.targetHintCompact]}>{t("tapThis")}</Text>
        <Animated.Text style={[styles.targetEmoji, compact && styles.targetEmojiCompact, { transform: [{ scale: targetScale }] }]}>
          {targetEmoji}
        </Animated.Text>
      </View>

      {/* 3×3 grid — fixed cell sizes */}
      <View style={styles.grid}>
        {cells.map((emoji, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.cell,
              { width: cellSize, height: cellSize },
              Shadow,
              flashIdx === i && (flashCorrect ? styles.cellHit : styles.cellMiss),
            ]}
            onPress={() => handleTap(emoji, i)}
            activeOpacity={0.75}
          >
            <Text style={{ fontSize: emojiSize, lineHeight: emojiSize * 1.2 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', width: '100%', gap: 8, alignSelf: 'center' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  badge: { borderRadius: 50, paddingHorizontal: 14, paddingVertical: 8 },
  badgeCompact: { paddingHorizontal: 10, paddingVertical: 6 },
  hitsBadge: { backgroundColor: Colors.greenLight, borderWidth: 2, borderColor: Colors.green },
  missesBadge: { backgroundColor: Colors.coralLight, borderWidth: 2, borderColor: Colors.coral },
  hitsText: { fontSize: 17, fontWeight: '900', color: Colors.greenDark },
  missesText: { fontSize: 17, fontWeight: '900', color: '#c0392b' },
  textCompact: { fontSize: 14 },
  timerBadge: { backgroundColor: Colors.white, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 8 },
  timerUrgent: { backgroundColor: Colors.coralLight },
  timerText: { fontSize: 22, fontWeight: '900', color: Colors.text },
  timerTextCompact: { fontSize: 18 },
  timerTextUrgent: { color: '#c0392b' },

  barBg: { width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  barFg: { height: 8, borderRadius: 4 },

  targetBox: { backgroundColor: Colors.white, borderRadius: 18, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 2 },
  targetHint: { fontSize: 13, fontWeight: '700', color: Colors.textSoft },
  targetHintCompact: { fontSize: 11 },
  targetEmoji: { fontSize: 44, lineHeight: 50 },
  targetEmojiCompact: { fontSize: 34, lineHeight: 40 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: { backgroundColor: Colors.white, borderRadius: 14, borderWidth: 2, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  cellHit:  { backgroundColor: Colors.greenLight, borderColor: Colors.green },
  cellMiss: { backgroundColor: Colors.coralLight, borderColor: Colors.coral },

  // End screen
  endContainer: { alignItems: 'center', padding: 20, gap: 16 },
  endStars: { fontSize: 60 },
  endMsg: { fontSize: 19, fontWeight: '800', textAlign: 'center', color: Colors.text, lineHeight: 26 },
  endCard: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', gap: 8 },
  endLabel: { fontSize: 15, fontWeight: '700', color: Colors.textSoft },
  endHits: { fontSize: 76, fontWeight: '900', color: Colors.green, lineHeight: 84 },
  endRow: { flexDirection: 'row', gap: 32, marginTop: 8 },
  endStat: { alignItems: 'center', gap: 4 },
  endStatNum: { fontSize: 28, fontWeight: '900' },
  endStatLbl: { fontSize: 13, color: Colors.textSoft, fontWeight: '700' },
  homeBtn: { backgroundColor: Colors.green, borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  homeBtnText: { color: Colors.white, fontSize: 17, fontWeight: '900' },
});

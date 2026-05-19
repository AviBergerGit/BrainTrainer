import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadow } from '../src/theme';
import { MODULE_META } from '../src/data/gameData';
import { loadStats, clearStats, GameStats } from '../src/hooks/useStats';
import { t, tf, isRTL, LANG } from '../src/i18n';

const CATEGORY_ORDER = ['speed', 'memory', 'math', 'language', 'attention'] as const;
const CATEGORY_COLORS: Record<string, string> = {
  speed:     '#FF6B9D',
  memory:    '#4CAF7D',
  math:      '#4A90D9',
  language:  '#0A7B6C',
  attention: '#26B5B5',
};
const CATEGORY_ICONS: Record<string, string> = {
  speed:     '⚡',
  memory:    '🃏',
  math:      '🔢',
  language:  '👂',
  attention: '🎨',
};

export default function StatsScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const router = useRouter();
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => { loadStats().then(setStats); }, []);
  if (!stats) return null;

  const accuracy = stats.totalGames > 0
    ? Math.round((stats.totalCorrect / (stats.totalGames * 10)) * 100) : 0;

  const handleReset = () => {
    Alert.alert(t('resetStats'), t('resetConfirm'), [
      { text: t('resetNo'), style: 'cancel' },
      { text: t('resetYes'), style: 'destructive', onPress: async () => { await clearStats(); loadStats().then(setStats); } },
    ]);
  };

  // Group modules by category and compute category score
  const grouped = CATEGORY_ORDER.map(cat => {
    const mods = MODULE_META.filter(m => m.category === cat);
    const totalCorrect = mods.reduce((sum, m) => {
      const s = stats.modules[m.id];
      return sum + (s ? s.correct : 0);
    }, 0);
    const totalPossible = mods.reduce((sum, m) => {
      const s = stats.modules[m.id];
      return sum + (s ? s.games * 10 : 0);
    }, 0);
    const catPct = totalPossible > 0 ? Math.round((totalCorrect / totalPossible) * 100) : null;
    return { cat, mods, catPct };
  });

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>{isRTL ? '←' : '→'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("myStats")}</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, isTablet && { paddingHorizontal: 48 }]}>

        {/* Top bubbles */}
        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.bubbleNum}>🔥 {stats.streak}</Text>
            <Text style={styles.bubbleLbl}>{t("daysStreak")}</Text>
          </View>
          <View style={[styles.bubble, { backgroundColor: Colors.blueLight }]}>
            <Text style={styles.bubbleNum}>{stats.totalGames}</Text>
            <Text style={styles.bubbleLbl}>{t("games")}</Text>
          </View>
          <View style={[styles.bubble, { backgroundColor: Colors.greenLight }]}>
            <Text style={styles.bubbleNum}>{accuracy}%</Text>
            <Text style={styles.bubbleLbl}>{t("accuracy")}</Text>
          </View>
        </View>

        {/* Performance by category */}
        <Text style={styles.sectionTitle}>{t("performByGame")}</Text>
        {grouped.map(({ cat, mods, catPct }) => {
          const color = CATEGORY_COLORS[cat];
          const icon = CATEGORY_ICONS[cat];
          return (
            <View key={cat} style={styles.catBlock}>
              {/* Category header */}
              <View style={[styles.catHeader, { borderLeftColor: color }]}>
                <Text style={styles.catIcon}>{icon}</Text>
                <Text style={[styles.catName, { color }]}>{t(('cat_' + cat) as any)}</Text>
                <View style={styles.catScoreBox}>
                  {catPct !== null ? (
                    <>
                      <View style={styles.catBarBg}>
                        <View style={[styles.catBarFg, { width: `${catPct}%` as any, backgroundColor: color }]} />
                      </View>
                      <Text style={[styles.catPct, { color }]}>{catPct}%</Text>
                    </>
                  ) : (
                    <Text style={styles.catPctNone}>—</Text>
                  )}
                </View>
              </View>

              {/* Games in this category */}
              {mods.map(mod => {
                const m = stats.modules[mod.id];
                const pct = m ? Math.round((m.correct / (m.games * 10)) * 100) : 0;
                return (
                  <View key={mod.id} style={[styles.modRow, Shadow]}>
                    <Text style={styles.modIcon}>{mod.icon}</Text>
                    <View style={styles.modInfo}>
                      <Text style={styles.modName}>{mod.name}</Text>
                      <View style={styles.barBg}>
                        <View style={[styles.barFg, { width: `${pct}%` as any, backgroundColor: mod.color }]} />
                      </View>
                    </View>
                    <Text style={[styles.modPct, { color: mod.color }]}>{m ? `${pct}%` : '—'}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Recent history */}
        {stats.history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t("recentHistory")}</Text>
            {stats.history.slice(0, 10).map((h, i) => {
              const mod = MODULE_META.find(m => m.id === h.game);
              const pct = Math.round((h.correct / h.total) * 100);
              const badgeColor = pct >= 80 ? Colors.green : pct >= 50 ? Colors.yellow : Colors.coral;
              return (
                <View key={i} style={[styles.histRow, Shadow]}>
                  <Text style={styles.histIcon}>{mod?.icon || '🎮'}</Text>
                  <Text style={styles.histName}>{mod?.name || h.game}</Text>
                  <Text style={styles.histDate}>{h.date}</Text>
                  <View style={[styles.histBadge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.histBadgeText}>{h.correct}/{h.total}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>{t('resetStats')}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.green, paddingTop: 56, paddingBottom: 18, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, fontWeight: '900', color: Colors.white },
  title: { fontSize: 20, fontWeight: '900', color: Colors.white },
  scroll: { padding: 16 },
  bubbleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  bubble: { flex: 1, borderRadius: 20, padding: 14, alignItems: 'center', ...Shadow },
  bubbleNum: { fontSize: 22, fontWeight: '900', color: Colors.text },
  bubbleLbl: { fontSize: 12, color: Colors.textSoft, marginTop: 4, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 12, marginTop: 8 },

  // Category block
  catBlock: { marginBottom: 16 },
  catHeader: {
    flexDirection: 'row', alignItems: 'center',
    borderLeftWidth: 4, paddingLeft: 10,
    marginBottom: 8,
  },
  catIcon: { fontSize: 20, marginRight: 8 },
  catName: { fontSize: 16, fontWeight: '900', flex: 1 },
  catScoreBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBarBg: { width: 80, height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  catBarFg: { height: 8, borderRadius: 4 },
  catPct: { fontSize: 14, fontWeight: '800', minWidth: 36, textAlign: 'right' },
  catPctNone: { fontSize: 14, color: Colors.textSoft, minWidth: 36, textAlign: 'right' },

  // Game row
  modRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 12, marginBottom: 6, marginLeft: 14 },
  modIcon: { fontSize: 24, marginRight: 10 },
  modInfo: { flex: 1 },
  modName: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  barBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  barFg: { height: 8, borderRadius: 4 },
  modPct: { fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // History
  histRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 14, padding: 12, marginBottom: 6 },
  histIcon: { fontSize: 20, marginRight: 8 },
  histName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.text },
  histDate: { fontSize: 11, color: Colors.textSoft, marginRight: 8 },
  histBadge: { borderRadius: 50, paddingHorizontal: 10, paddingVertical: 4 },
  histBadgeText: { color: Colors.white, fontSize: 12, fontWeight: '800' },

  resetBtn: { marginTop: 20, alignSelf: 'center', backgroundColor: Colors.coralLight, borderRadius: 50, paddingHorizontal: 32, paddingVertical: 14 },
  resetText: { color: Colors.coral, fontWeight: '800', fontSize: 16 },
});

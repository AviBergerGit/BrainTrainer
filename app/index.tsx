import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, I18nManager, Linking, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadow } from '../src/theme';
import { MODULE_META } from '../src/data/gameData';
import { loadStats } from '../src/hooks/useStats';
import { useSFXContext } from '../src/contexts/SFXContext';
import { useVoiceCheck } from '../src/hooks/useVoiceCheck';
import { t, tf, isRTL, LANG } from '../src/i18n';

I18nManager.allowRTL(LANG === 'he');
I18nManager.forceRTL(LANG === 'he');

export default function HomeScreen() {
  const router = useRouter();
  const [streak, setStreak] = useState(0);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const { SFX, muted, toggleMute } = useSFXContext();
  const voiceStatus = useVoiceCheck();
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;

  const CATEGORIES = ['all', 'speed', 'memory', 'math', 'language', 'attention'] as const;
  const filteredModules = selectedCat === 'all'
    ? MODULE_META
    : MODULE_META.filter(m => m.category === selectedCat);

  useEffect(() => {
    loadStats().then(st => setStreak(st.streak || 0));
  }, []);

  // Show warning only for the language the UI is actually using
  const missingHebrew  = voiceStatus.checked && !voiceStatus.hebrewAvailable;
  const missingEnglish = voiceStatus.checked && !voiceStatus.englishAvailable;
  const showWarning = LANG === 'he' ? missingHebrew : missingEnglish;

  const openVoiceSettings = () => {
    // Deep-link to iOS Settings > Accessibility > Spoken Content
    Linking.openURL('App-Prefs:ACCESSIBILITY&path=SPEECH').catch(() =>
      Linking.openURL('app-settings:')
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.green} />
      <View style={[styles.header, isTablet && { paddingTop: 72, paddingBottom: 32, paddingHorizontal: 36 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.logo, isTablet && { fontSize: 38 }]}>🧠 BrainTrainer</Text>
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={toggleMute} style={styles.muteBtn}>
              <Text style={styles.muteBtnText}>{muted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sub}>{t('appTagline')}</Text>
        <View style={styles.streakRow}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{tf('streakDays', streak)}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => { SFX.tap(); router.push('/stats'); }} style={styles.statsPill}>
            <Text style={styles.statsPillText}>{t('statsBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Voice language warning banner */}
      {showWarning && (
        <TouchableOpacity style={styles.voiceWarning} onPress={openVoiceSettings} activeOpacity={0.8}>
          <Text style={styles.voiceWarningIcon}>🔈</Text>
          <View style={styles.voiceWarningText}>
            <Text style={styles.voiceWarningTitle}>
              {missingHebrew && missingEnglish
                ? t('voiceMissingBoth')
                : missingHebrew
                ? t('voiceMissingHe')
                : t('voiceMissingEn')}
            </Text>
            <Text style={styles.voiceWarningHint}>
              {t('voiceHint')}
            </Text>
          </View>
          <Text style={styles.voiceWarningArrow}>›</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={[styles.scroll, isTablet && { padding: 24 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, isTablet && { fontSize: 28 }]}>{t('chooseGame')}</Text>

        {/* Category filter bar */}
        <View style={[styles.filterBar, { justifyContent: LANG === 'he' ? 'flex-end' : 'flex-start' }]}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCat(cat)}
              style={[styles.filterChip, selectedCat === cat && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, selectedCat === cat && styles.filterChipTextActive]}>
                {t(('cat_' + cat) as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.grid}>
          {filteredModules.map((mod, idx) => {
            return (
              <TouchableOpacity
                key={mod.id}
                style={[styles.card, { borderColor: mod.color, backgroundColor: mod.bg, width: isTablet ? '31%' : '47%' }]}
                onPress={() => { SFX.tap(); router.push(`/game/${mod.id}`); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardIcon, isTablet && { fontSize: 48 }]}>{mod.icon}</Text>
                <Text style={[styles.cardName, isTablet && { fontSize: 18 }]}>{mod.name}</Text>
                <Text style={[styles.cardSkill, isTablet && { fontSize: 14 }]}>{mod.skill}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>BrainTrainer v2.0.0</Text>
          <Text style={styles.footerDot}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:photodialmail@gmail.com')}>
            <Text style={styles.footerEmail} numberOfLines={1} adjustsFontSizeToFit={true}>photodialmail@gmail.com</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.cream },
  header: {
    backgroundColor: Colors.green, paddingTop: 56, paddingBottom: 22, paddingHorizontal: 20,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 26, fontWeight: '900', color: Colors.white },
  headerBtns: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  muteBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 50,
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
  },
  muteBtnText: { fontSize: 22 },
  statsPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexShrink: 0,
  },
  statsPillText: { fontSize: 14, fontWeight: '800', color: 'white' },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600', marginTop: 4 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  streakBadge: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  streakText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  // Voice warning banner
  voiceWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF8E1', borderBottomWidth: 1, borderBottomColor: '#FFE082',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  voiceWarningIcon: { fontSize: 24 },
  voiceWarningText: { flex: 1 },
  voiceWarningTitle: { fontSize: 14, fontWeight: '800', color: '#5D4037' },
  voiceWarningHint: { fontSize: 11, color: '#8D6E63', marginTop: 2, fontWeight: '600' },
  voiceWarningArrow: { fontSize: 22, color: '#8D6E63', fontWeight: '700' },

  scroll: { padding: 16 },  // padding overridden per render on tablet

  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'right', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 22, borderWidth: 2.5, padding: 14, alignItems: 'center', ...Shadow },
  cardWide: { width: '100%' },
  cardIcon: { fontSize: 34, marginBottom: 6 },  // size overridden per card on tablet
  cardName: { fontSize: 14, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  cardSkill: { fontSize: 11, color: Colors.textSoft, marginTop: 3, fontWeight: '600' },
  filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'flex-start' },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 50, borderWidth: 2,
    borderColor: '#e0e0e0', backgroundColor: 'white',
  },
  filterChipActive: {
    backgroundColor: Colors.green, borderColor: Colors.green,
  },
  filterChipText: { fontSize: 13, fontWeight: '700', color: Colors.textSoft },
  filterChipTextActive: { color: 'white' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 6, flexWrap: 'wrap', paddingHorizontal: 8 },
  footerText: { fontSize: 11, color: Colors.textSoft, fontWeight: '600' },
  footerDot: { fontSize: 11, color: Colors.textSoft, opacity: 0.4 },
  footerEmail: { fontSize: 11, color: Colors.green, fontWeight: '700' },
});

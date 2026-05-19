/**
 * useSFX — Sound effects + mute control for BrainTrainer (iOS native)
 *
 * Uses expo-av to play short synthesized WAV tones (base64 embedded).
 * Mute state is persisted in AsyncStorage so it survives restarts.
 *
 * Sounds:
 *   SFX.tap()         — soft tap when pressing module cards / buttons
 *   SFX.correct()     — happy C-E-G chime for correct answers
 *   SFX.wrong()       — low descending boop for wrong answers
 *   SFX.flip()        — quick high blip for card flip (memory game)
 *   SFX.match()       — bright ascending chime for memory pair match
 *   SFX.tick()        — neutral tick for "next" button
 *   SFX.questionPop() — gentle pop when new question appears
 *   SFX.fanfare()     — ascending melody for game complete
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';

const MUTE_KEY = 'braintrainer_muted';

// ── Tiny WAV generator (pure sine wave, mono, 44100Hz) ──────────────────────
function generateWav(
  freqs: { freq: number; start: number; dur: number; gain: number }[],
  totalDuration: number
): string {
  const sampleRate = 22050;
  const numSamples = Math.ceil(sampleRate * totalDuration);
  const buffer = new Float32Array(numSamples);

  for (const { freq, start, dur, gain } of freqs) {
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.min(numSamples, startSample + Math.ceil(dur * sampleRate));
    const fadeLen = Math.ceil(0.015 * sampleRate);
    for (let i = startSample; i < endSample; i++) {
      const t = (i - startSample) / sampleRate;
      const phase = 2 * Math.PI * freq * t;
      let env = 1.0;
      const remaining = endSample - i;
      if (i - startSample < fadeLen) env = (i - startSample) / fadeLen;
      else if (remaining < fadeLen) env = remaining / fadeLen;
      // exponential decay
      const decay = Math.exp(-3 * t / dur);
      buffer[i] += Math.sin(phase) * gain * env * decay;
    }
  }

  // Normalize
  let peak = 0;
  for (let i = 0; i < numSamples; i++) if (Math.abs(buffer[i]) > peak) peak = Math.abs(buffer[i]);
  if (peak > 0.9) for (let i = 0; i < numSamples; i++) buffer[i] = buffer[i] / peak * 0.9;

  // Build WAV bytes
  const dataBytes = numSamples * 2; // 16-bit
  const bytes = new Uint8Array(44 + dataBytes);
  const view = new DataView(bytes.buffer);

  const write = (offset: number, val: number, size: number) => {
    for (let i = 0; i < size; i++) view.setUint8(offset + i, (val >> (8 * i)) & 0xff);
  };
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  write(4, 36 + dataBytes, 4);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  write(16, 16, 4);        // chunk size
  write(20, 1, 2);         // PCM
  write(22, 1, 2);         // mono
  write(24, sampleRate, 4);
  write(28, sampleRate * 2, 4); // byte rate
  write(32, 2, 2);         // block align
  write(34, 16, 2);        // bits per sample
  writeStr(36, 'data');
  write(40, dataBytes, 4);

  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(44 + i * 2, val, true);
  }

  // Base64 encode
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return 'data:audio/wav;base64,' + btoa(binary);
}

// ── Sound definitions ────────────────────────────────────────────────────────
type SoundDef = { freqs: { freq: number; start: number; dur: number; gain: number }[]; total: number };

const SOUNDS: Record<string, SoundDef> = {
  tap: {
    total: 0.15,
    freqs: [{ freq: 440, start: 0, dur: 0.12, gain: 0.25 }],
  },
  correct: {
    total: 0.55,
    freqs: [
      { freq: 523.25, start: 0,    dur: 0.18, gain: 0.35 },
      { freq: 659.25, start: 0.13, dur: 0.18, gain: 0.35 },
      { freq: 783.99, start: 0.26, dur: 0.28, gain: 0.35 },
    ],
  },
  wrong: {
    total: 0.38,
    freqs: [
      { freq: 220, start: 0,    dur: 0.15, gain: 0.3 },
      { freq: 196, start: 0.15, dur: 0.20, gain: 0.3 },
    ],
  },
  flip: {
    total: 0.12,
    freqs: [
      { freq: 900, start: 0,    dur: 0.05, gain: 0.18 },
      { freq: 700, start: 0.05, dur: 0.07, gain: 0.15 },
    ],
  },
  match: {
    total: 0.48,
    freqs: [
      { freq: 659,  start: 0,    dur: 0.15, gain: 0.32 },
      { freq: 880,  start: 0.15, dur: 0.15, gain: 0.32 },
      { freq: 1046, start: 0.30, dur: 0.18, gain: 0.32 },
    ],
  },
  tick: {
    total: 0.12,
    freqs: [{ freq: 600, start: 0, dur: 0.10, gain: 0.20 }],
  },
  questionPop: {
    total: 0.18,
    freqs: [
      { freq: 520, start: 0,    dur: 0.08, gain: 0.20 },
      { freq: 640, start: 0.08, dur: 0.10, gain: 0.20 },
    ],
  },
  fanfare: {
    total: 0.95,
    freqs: [
      { freq: 523,  start: 0,    dur: 0.20, gain: 0.38 },
      { freq: 659,  start: 0.16, dur: 0.20, gain: 0.38 },
      { freq: 784,  start: 0.32, dur: 0.20, gain: 0.38 },
      { freq: 1047, start: 0.48, dur: 0.45, gain: 0.38 },
      { freq: 659,  start: 0.50, dur: 0.40, gain: 0.28 },
      { freq: 784,  start: 0.50, dur: 0.40, gain: 0.24 },
    ],
  },
};

// ── Main hook ────────────────────────────────────────────────────────────────
export function useSFX() {
  const [muted, setMuted] = useState(false);
  const soundCache = useRef<Record<string, string>>({});

  useEffect(() => {
    AsyncStorage.getItem(MUTE_KEY).then(v => { if (v === 'true') setMuted(true); });
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    }).catch(() => {});
  }, []);

  const getDataUri = useCallback((name: string): string => {
    if (!soundCache.current[name]) {
      const def = SOUNDS[name];
      if (!def) return '';
      soundCache.current[name] = generateWav(def.freqs, def.total);
    }
    return soundCache.current[name];
  }, []);

  const play = useCallback(async (name: string, haptic?: 'light' | 'medium' | 'success' | 'error') => {
    if (haptic) {
      try {
        if (haptic === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (haptic === 'error') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else if (haptic === 'medium') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    if (muted) return;
    try {
      const uri = getDataUri(name);
      if (!uri) return;
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) sound.unloadAsync().catch(() => {});
      });
    } catch {}
  }, [muted, getDataUri]);

  const toggleMute = useCallback(async () => {
    const next = !muted;
    setMuted(next);
    await AsyncStorage.setItem(MUTE_KEY, next ? 'true' : 'false');
    if (!next) play('tap', 'light');
  }, [muted, play]);

  const SFX = {
    tap:         () => play('tap', 'light'),
    correct:     () => play('correct', 'success'),
    wrong:       () => play('wrong', 'error'),
    flip:        () => play('flip', 'light'),
    match:       () => play('match', 'medium'),
    tick:        () => play('tick', 'light'),
    questionPop: () => play('questionPop', 'light'),
    fanfare:     () => play('fanfare', 'success'),
  };

  return { SFX, muted, toggleMute };
}

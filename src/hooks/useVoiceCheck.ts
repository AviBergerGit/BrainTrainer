import { useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

export interface VoiceStatus {
  hebrewAvailable: boolean;
  englishAvailable: boolean;
  availableLanguages: string[];
  checked: boolean;
}

export async function checkVoiceAvailability(): Promise<VoiceStatus> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const langs = voices.map(v => v.language.toLowerCase());
    const hebrewAvailable = langs.some(l => l.startsWith('he'));
    const englishAvailable = langs.some(l => l.startsWith('en'));
    return {
      hebrewAvailable,
      englishAvailable,
      availableLanguages: [...new Set(langs)].sort(),
      checked: true,
    };
  } catch (e) {
    // If we can't check, assume available (fail silently)
    return { hebrewAvailable: true, englishAvailable: true, availableLanguages: [], checked: true };
  }
}

export function useVoiceCheck(): VoiceStatus {
  const [status, setStatus] = useState<VoiceStatus>({
    hebrewAvailable: false,
    englishAvailable: false,
    availableLanguages: [],
    checked: false,
  });

  useEffect(() => {
    checkVoiceAvailability().then(setStatus);
  }, []);

  return status;
}

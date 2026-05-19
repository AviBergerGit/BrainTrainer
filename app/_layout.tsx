import { Stack } from 'expo-router';
import { I18nManager, View } from 'react-native';
import { LANG } from '../src/i18n';
import { SFXProvider } from '../src/contexts/SFXContext';
import DebugPanel from '../src/components/DebugPanel';

const shouldBeRTL = LANG === 'he';
I18nManager.allowRTL(shouldBeRTL);
I18nManager.forceRTL(shouldBeRTL);

export default function RootLayout() {
  return (
    <SFXProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <DebugPanel />
      </View>
    </SFXProvider>
  );
}

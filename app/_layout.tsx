import { useMemo, useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
} from '@expo-google-fonts/noto-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/features/auth';
import { queryClient } from '@/shared/api';
import { ComposeProviders, i18n } from '@/shared/lib';
import { ErrorBoundary } from '@/shared/ui';

SplashScreen.preventAutoHideAsync();

const AppStack = () => {
  const { authState } = useAuth();
  const [fontsLoaded] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
  });

  const isReady = fontsLoaded && authState.status !== 'loading';

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  const providers = useMemo(
    () => [
      { provider: I18nextProvider, props: { i18n } },
      { provider: QueryClientProvider, props: { client: queryClient } },
      { provider: AuthProvider },
    ],
    [],
  );

  return (
    <ErrorBoundary>
      <ComposeProviders providers={providers}>
        <AppStack />
      </ComposeProviders>
    </ErrorBoundary>
  );
}

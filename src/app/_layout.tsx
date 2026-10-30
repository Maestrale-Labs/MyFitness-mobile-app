import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { Colors, type ColorScheme } from '@/constants/theme';
import { useSettingsHydrated } from '@/features/settings/store';
import { useApplyColorSchemePreference, useColorScheme } from '@/hooks/use-color-scheme';
import { useSyncLanguagePreference } from '@/i18n';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function navigationTheme(scheme: ColorScheme): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const colors = Colors[scheme];
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.tint,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.separator,
      notification: colors.brand,
    },
  };
}

export default function RootLayout() {
  const hydrated = useSettingsHydrated();
  const scheme = useColorScheme();

  useApplyColorSchemePreference();
  useSyncLanguagePreference();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  // Keep the splash screen up until saved theme and language are known, to avoid a flash.
  if (!hydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme(scheme)}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <AppTabs />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

import type { NativeStackNavigationOptions } from 'expo-router';

import type { ThemeColors } from '@/constants/theme';

/** Shared header look for every tab's stack: large titles on iOS, flat headers elsewhere. */
export function stackScreenOptions(theme: ThemeColors): NativeStackNavigationOptions {
  return {
    headerLargeTitleEnabled: true,
    headerLargeTitleShadowVisible: false,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.background },
    headerTintColor: theme.tint,
    headerTitleStyle: { color: theme.text },
    headerLargeTitleStyle: { color: theme.text },
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: theme.background },
  };
}

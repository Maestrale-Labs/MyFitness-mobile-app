import { useEffect } from 'react';
import { Appearance, useColorScheme as useSystemColorScheme } from 'react-native';

import type { ColorScheme } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';

/** The color scheme the app should render with: the user's choice, or the system's. */
export function useColorScheme(): ColorScheme {
  const preference = useSettings((state) => state.theme);
  const system = useSystemColorScheme();

  if (preference !== 'system') {
    return preference;
  }
  return system === 'dark' ? 'dark' : 'light';
}

/**
 * Applies the theme preference to native UI (tab bar, alerts, keyboards) so it matches
 * the screens. Mount once, at the root.
 */
export function useApplyColorSchemePreference() {
  const preference = useSettings((state) => state.theme);

  useEffect(() => {
    if (process.env.EXPO_OS === 'web') {
      return;
    }
    Appearance.setColorScheme(preference === 'system' ? 'auto' : preference);
  }, [preference]);
}

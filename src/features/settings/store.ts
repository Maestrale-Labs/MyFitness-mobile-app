import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'it' | 'en';

type SettingsState = {
  name: string;
  theme: ThemePreference;
  language: LanguagePreference;
  /** Anonymous usage statistics (src/features/analytics). On unless turned off. */
  analyticsEnabled: boolean;
  setName: (name: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setLanguage: (language: LanguagePreference) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
};

/**
 * Local, device-only preferences. When accounts arrive (Supabase), `name` moves to the
 * user's profile row; theme and language stay on the device.
 */
export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      name: '',
      theme: 'system',
      language: 'system',
      analyticsEnabled: true,
      setName: (name) => set({ name }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
    }),
    {
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ name, theme, language, analyticsEnabled }) => ({
        name,
        theme,
        language,
        analyticsEnabled,
      }),
    },
  ),
);

/** False until the saved preferences have been read from storage. */
export function useSettingsHydrated() {
  return useSyncExternalStore(
    (onChange) => useSettings.persist.onFinishHydration(onChange),
    () => useSettings.persist.hasHydrated(),
  );
}

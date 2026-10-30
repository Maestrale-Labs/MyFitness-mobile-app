import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useSettings, useSettingsHydrated } from '@/features/settings/store';

import { clearQueue, flush, track } from './client';

/**
 * Records an `app_open` at launch and each time the app comes back to the foreground,
 * and sends what's queued. Mount once. Waits for the saved settings, which may turn it off.
 */
export function useAnalyticsLifecycle() {
  const hydrated = useSettingsHydrated();
  const enabled = useSettings((state) => state.analyticsEnabled);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!enabled) {
      void clearQueue();
      return;
    }
    track('app_open');
    void flush();

    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active' && previous !== 'active') {
        track('app_open');
      }
      previous = next;
    });
    return () => subscription.remove();
  }, [hydrated, enabled]);
}

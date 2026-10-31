import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current date, refreshed when the app comes back to the foreground, so screens kept
 * open overnight show the new day.
 */
export function useToday() {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setToday(new Date());
      }
    });
    return () => subscription.remove();
  }, []);

  return today;
}

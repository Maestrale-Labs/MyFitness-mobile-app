import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NamedStyles = Parameters<typeof StyleSheet.create>[0];

/**
 * Theme-dependent styles, recomputed only when the color scheme changes:
 *
 *   const useStyles = makeStyles((theme) => ({ box: { backgroundColor: theme.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends NamedStyles>(factory: (theme: ThemeColors) => T) {
  return function useStyles(): Readonly<T> {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

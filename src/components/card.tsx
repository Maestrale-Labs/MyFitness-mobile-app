import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Shadows } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Borderless card with a soft shadow. The inner view clips, so pressed rows stay inside
 * the rounded corners without cutting off the shadow.
 */
export function Card({ children, style }: CardProps) {
  const styles = useStyles();

  return (
    <View style={[styles.outer, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  outer: {
    backgroundColor: theme.surface,
    borderRadius: Radius.large,
    ...Shadows.card,
  },
  inner: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
}));

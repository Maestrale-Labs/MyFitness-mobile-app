import { Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';

/** Small uppercase grey label above a card. */
export function SectionLabel({ children }: { children: string }) {
  const styles = useStyles();

  return (
    <Text accessibilityRole="header" style={styles.label}>
      {children}
    </Text>
  );
}

const useStyles = makeStyles((theme) => ({
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.one,
    marginTop: Spacing.two,
    marginBottom: -Spacing.two,
  },
}));

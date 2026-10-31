import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Countdown shown after a set is ticked. Disappears at zero or when skipped. */
export function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [until] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const left = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (left === 0) {
      onDone();
    }
  }, [left, onDone]);

  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <Icon icon={icons.rest} size={22} color={theme.onTint} />
      <Text style={styles.label}>{t('session.rest')}</Text>
      <Text style={styles.clock}>{formatClock(left)}</Text>
      <Pressable accessibilityRole="button" onPress={onDone} hitSlop={8} style={styles.skip}>
        <Text style={styles.skipText}>{t('session.skipRest')}</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.two,
    height: 52,
    borderRadius: Radius.pill,
    backgroundColor: theme.tint,
    ...Shadows.floating,
  },
  label: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.onTint,
  },
  clock: {
    flex: 1,
    fontSize: 20,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
    color: theme.onTint,
  },
  skip: {
    paddingHorizontal: Spacing.three,
    height: 36,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: theme.onTint,
  },
  skipText: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.onTint,
  },
}));

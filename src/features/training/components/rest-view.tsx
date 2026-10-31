import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';

const RING = 240;

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

type RestViewProps = {
  seconds: number;
  /** What comes after the rest, e.g. "Next: set 2 of 3". */
  next: string;
  onContinue: () => void;
};

/**
 * The rest between sets. Counts down, then keeps counting up ("+0:12") until the user
 * continues: resting longer is allowed, the timer just shows by how much.
 */
export function RestView({ seconds, next, onContinue }: RestViewProps) {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();
  const [until, setUntil] = useState(() => Date.now() + seconds * 1000);
  const [now, setNow] = useState(() => Date.now());
  const left = Math.ceil((until - now) / 1000);
  const over = left <= 0;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.ring, over && styles.ringOver]} accessibilityLiveRegion="polite">
        <Icon icon={icons.rest} size={28} color={over ? theme.tint : theme.textSecondary} />
        <Text style={[styles.clock, over && styles.clockOver]}>
          {over ? `+${formatClock(-left)}` : formatClock(left)}
        </Text>
        <Text style={[styles.label, over && styles.labelOver]}>
          {over ? t('session.restOver') : t('session.rest')}
        </Text>
      </View>
      <Text style={styles.next}>{next}</Text>
      <View style={styles.actions}>
        <View style={styles.more}>
          <Button
            variant="secondary"
            label={t('session.restMore')}
            onPress={() => setUntil((value) => Math.max(value, Date.now()) + 30_000)}
          />
        </View>
        <View style={styles.flex}>
          <Button label={t('session.continue')} icon={icons.chevronRight} onPress={onContinue} />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 8,
    borderColor: theme.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  ringOver: {
    borderColor: theme.tint,
  },
  clock: {
    fontSize: 56,
    fontWeight: 700,
    fontVariant: ['tabular-nums'],
    color: theme.text,
  },
  clockOver: {
    color: theme.tint,
  },
  label: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.textSecondary,
  },
  labelOver: {
    color: theme.tint,
  },
  next: {
    fontSize: 17,
    fontWeight: 500,
    textAlign: 'center',
    color: theme.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignSelf: 'stretch',
  },
  more: {
    width: 110,
  },
  flex: {
    flex: 1,
  },
}));

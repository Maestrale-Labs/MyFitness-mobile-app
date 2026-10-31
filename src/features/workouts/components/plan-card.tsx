import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { WorkoutPlan } from '../types';

const BADGE_SIZE = 56;

/** A plan in the list, shown as a step of the path: level number, name, days and weeks. */
export function PlanCard({ plan, active }: { plan: WorkoutPlan; active: boolean }) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  return (
    <Card>
      <Link href={{ pathname: '/workouts/[id]', params: { id: plan.id } }} asChild>
        <Pressable accessibilityRole="link">
          {({ pressed }) => (
            // Styles go on an inner view: `Link asChild` doesn't forward a style function on web.
            <View style={[styles.container, pressed && styles.pressed]}>
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeLabel, active && styles.badgeTextActive]}>
                  {t('plan.levelLabel')}
                </Text>
                <Text style={[styles.badgeNumber, active && styles.badgeTextActive]}>
                  {plan.level}
                </Text>
              </View>
              <View style={styles.text}>
                <Text numberOfLines={1} style={styles.name}>
                  {plan.name[locale]}
                </Text>
                <Text style={styles.meta}>
                  {t('plan.daysPerWeek', { count: plan.daysPerWeek })} ·{' '}
                  {t('plan.weeks', { count: plan.durationWeeks })}
                </Text>
                {active ? (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>{t('plan.current')}</Text>
                  </View>
                ) : null}
              </View>
              <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
            </View>
          )}
        </Pressable>
      </Link>
    </Card>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  badgeActive: {
    backgroundColor: theme.tint,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: theme.tint,
  },
  badgeNumber: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 28,
    color: theme.tint,
  },
  badgeTextActive: {
    color: theme.onTint,
  },
  text: {
    flex: 1,
    gap: 2,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  meta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  activeTag: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.pill,
    backgroundColor: theme.brandSoft,
  },
  activeTagText: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.tint,
  },
}));

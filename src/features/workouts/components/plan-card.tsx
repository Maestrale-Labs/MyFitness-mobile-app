import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/card';
import { Icon, type IconData } from '@/components/icon';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';

import type { WorkoutPlan } from '../types';
import { PlanTags } from './plan-tags';

const ICON_SIZE = 48;

export function PlanCard({ plan }: { plan: WorkoutPlan }) {
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
              <View style={styles.header}>
                <View style={styles.icon}>
                  <Icon icon={icons.plan} size={24} color={theme.tint} />
                </View>
                <View style={styles.headerText}>
                  <Text numberOfLines={2} style={styles.name}>
                    {plan.name[locale]}
                  </Text>
                  <PlanTags plan={plan} />
                </View>
                <Icon icon={icons.chevronRight} size={18} color={theme.textSecondary} />
              </View>
              <Text style={styles.summary}>{plan.summary[locale]}</Text>
              <View style={styles.facts}>
                <Fact
                  icon={icons.daysPerWeek}
                  label={t('plan.daysPerWeek', { count: plan.daysPerWeek })}
                />
                <Fact
                  icon={icons.duration}
                  label={t('plan.weeks', { count: plan.durationWeeks })}
                />
              </View>
            </View>
          )}
        </Pressable>
      </Link>
    </Card>
  );
}

function Fact({ icon, label }: { icon: IconData; label: string }) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <View style={styles.fact}>
      <Icon icon={icon} size={16} color={theme.textSecondary} />
      <Text style={styles.factText}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.four,
    rowGap: Spacing.one,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  factText: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.textSecondary,
  },
}));

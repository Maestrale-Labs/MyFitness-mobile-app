import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Card } from '@/components/card';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTraining } from '@/features/training/store';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

import { useWorkoutPlans } from '../queries';
import { PlanCard } from './plan-card';

/** The plans, in level order, under a header that scrolls with them. */
export function PlanList({ header }: { header: ReactNode }) {
  const styles = useStyles();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const { data: plans = [], isPending, isError, refetch } = useWorkoutPlans();
  const activePlanId = useTraining((state) => state.activePlan?.planId);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
      {header}
      <ThemedText themeColor="textSecondary" style={styles.intro}>
        {t('workouts.intro')}
      </ThemedText>

      {isPending ? (
        <ActivityIndicator color={theme.tint} style={styles.loader} />
      ) : isError ? (
        <View style={styles.message}>
          <ThemedText type="headline">{t('workouts.errorTitle')}</ThemedText>
          <Pressable onPress={() => refetch()} accessibilityRole="button" hitSlop={8}>
            <ThemedText type="headline" themeColor="tint">
              {t('exercises.retry')}
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} active={plan.id === activePlanId} />
        ))
      )}

      <SectionLabel>{t('workouts.sectionMine')}</SectionLabel>
      <Card>
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          {t('workouts.mineEmpty')}
        </ThemedText>
      </Card>
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  content: {
    gap: Spacing.three,
  },
  intro: {
    paddingHorizontal: Spacing.one,
    fontSize: 15,
    lineHeight: 21,
  },
  empty: {
    padding: Spacing.four,
    fontSize: 15,
    lineHeight: 21,
  },
  loader: {
    marginTop: Spacing.four,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
}));

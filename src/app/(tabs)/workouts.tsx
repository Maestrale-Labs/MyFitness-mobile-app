import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { PlanCard } from '@/features/workouts/components/plan-card';
import { useWorkoutPlans } from '@/features/workouts/queries';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

export default function WorkoutsScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const { data: plans = [], isPending, isError, refetch } = useWorkoutPlans();

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
        <ThemedText type="title" accessibilityRole="header" style={styles.title}>
          {t('workouts.title')}
        </ThemedText>

        <SectionLabel>{t('workouts.sectionSuggested')}</SectionLabel>
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
          plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
        )}

        <SectionLabel>{t('workouts.sectionMine')}</SectionLabel>
        <Card>
          <ThemedText themeColor="textSecondary" style={styles.empty}>
            {t('workouts.mineEmpty')}
          </ThemedText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  content: {
    gap: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
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

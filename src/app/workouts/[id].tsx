import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import { track } from '@/features/analytics/client';
import { useExercises } from '@/features/exercises/queries';
import { useTraining } from '@/features/training/store';
import { PlanExerciseRow } from '@/features/workouts/components/plan-exercise-row';
import { PlanTags } from '@/features/workouts/components/plan-tags';
import { useWorkoutPlan, useWorkoutPlans } from '@/features/workouts/queries';
import type { WorkoutPlan } from '@/features/workouts/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function WorkoutPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: plan, isPending } = useWorkoutPlan(id);
  const { data: exercises = [] } = useExercises();
  const [dayIndex, setDayIndex] = useState(0);
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  useEffect(() => {
    track('plan_viewed', { planId: id });
  }, [id]);

  if (isPending || !plan) {
    return (
      <Screen withBottomInset>
        <SubScreenHeader />
        {isPending ? (
          <ActivityIndicator color={theme.tint} style={styles.loader} />
        ) : (
          <ThemedText type="headline" style={styles.notFound}>
            {t('workouts.notFound')}
          </ThemedText>
        )}
      </Screen>
    );
  }

  const facts = [
    { icon: icons.daysPerWeek, label: t('plan.daysPerWeek', { count: plan.daysPerWeek }) },
    { icon: icons.duration, label: t('plan.weeks', { count: plan.durationWeeks }) },
  ];
  const day = plan.days[dayIndex] ?? plan.days[0];
  // Skip entries whose exercise isn't in the catalog (yet), rather than showing blanks.
  const rows = day.exercises.flatMap((item) => {
    const exercise = exercisesById.get(item.exerciseId);
    return exercise ? [{ item, exercise }] : [];
  });
  const tips = plan.tips[locale];

  return (
    <Screen withBottomInset>
      <SubScreenHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <ThemedText type="title" accessibilityRole="header">
            {plan.name[locale]}
          </ThemedText>
          <PlanTags plan={plan} />
          <ThemedText themeColor="textSecondary" style={styles.summary}>
            {plan.summary[locale]}
          </ThemedText>
        </View>

        <Card>
          <View style={styles.facts}>
            {facts.map((fact) => (
              <View key={fact.label} style={styles.fact}>
                <Icon icon={fact.icon} size={22} color={theme.tint} />
                <Text style={styles.factText}>{fact.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        <PlanAction plan={plan} />

        <SectionLabel>{t('plan.schedule')}</SectionLabel>
        <Card>
          <Text style={styles.paragraph}>{plan.schedule[locale]}</Text>
        </Card>

        <SectionLabel>{t('plan.exercises')}</SectionLabel>
        {plan.days.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chips}>
            {plan.days.map((_, index) => (
              <Chip
                key={index}
                label={t('plan.day', { number: index + 1 })}
                selected={index === dayIndex}
                onPress={() => setDayIndex(index)}
              />
            ))}
          </ScrollView>
        ) : null}
        <ThemedText type="footnote" themeColor="textSecondary" style={styles.focus}>
          {day.focus[locale]}
        </ThemedText>
        <Card>
          {rows.map(({ item, exercise }, index) => (
            <PlanExerciseRow
              key={`${dayIndex}-${item.exerciseId}`}
              index={index}
              item={item}
              exercise={exercise}
              last={index === rows.length - 1}
            />
          ))}
        </Card>

        <SectionLabel>{t('plan.tips')}</SectionLabel>
        <Card>
          {tips.map((tip, index) => (
            <View key={index} style={[styles.tip, index < tips.length - 1 && styles.divider]}>
              <Icon icon={icons.tips} size={20} color={theme.tint} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

/** Start following the plan, or stop if it's the one being followed. */
function PlanAction({ plan }: { plan: WorkoutPlan }) {
  const styles = useStyles();
  const locale = useLocale();
  const { t } = useTranslation();
  const activePlanId = useTraining((state) => state.activePlan?.planId);
  const assignPlan = useTraining((state) => state.assignPlan);
  const leavePlan = useTraining((state) => state.leavePlan);
  const { data: plans = [] } = useWorkoutPlans();

  async function start() {
    const currentPlan = plans.find((item) => item.id === activePlanId);
    if (
      currentPlan &&
      !(await confirm({
        title: t('plan.replaceTitle'),
        message: t('plan.replaceMessage', { name: currentPlan.name[locale] }),
        confirmLabel: t('plan.replaceConfirm'),
        cancelLabel: t('common.cancel'),
      }))
    ) {
      return;
    }
    assignPlan(plan);
    router.navigate('/');
  }

  async function leave() {
    const confirmed = await confirm({
      title: t('plan.leaveTitle'),
      message: t('plan.leaveMessage'),
      confirmLabel: t('plan.leaveConfirm'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      leavePlan();
    }
  }

  if (activePlanId === plan.id) {
    return (
      <View style={styles.action}>
        <ThemedText type="subhead" themeColor="tint" style={styles.following}>
          {t('plan.following')}
        </ThemedText>
        <Button variant="plain" label={t('plan.leave')} onPress={leave} />
      </View>
    );
  }
  return <Button icon={icons.start} label={t('plan.start')} onPress={start} />;
}

const useStyles = makeStyles((theme) => ({
  action: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  following: {
    fontWeight: 600,
  },
  loader: {
    marginTop: Spacing.six,
  },
  notFound: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  heading: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
    alignItems: 'flex-start',
  },
  summary: {
    fontSize: 15,
    lineHeight: 21,
  },
  facts: {
    flexDirection: 'row',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  factText: {
    fontSize: 13,
    fontWeight: 500,
    color: theme.text,
    textAlign: 'center',
  },
  paragraph: {
    padding: Spacing.four,
    fontSize: 15,
    lineHeight: 21,
    color: theme.text,
  },
  // Chips run to the screen edges while scrolling, and keep room for their shadows.
  chipsScroll: {
    marginHorizontal: -Spacing.four,
  },
  chips: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
  },
  focus: {
    paddingHorizontal: Spacing.one,
    marginTop: -Spacing.two,
  },
  tip: {
    flexDirection: 'row',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: theme.text,
  },
}));

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SectionLabel } from '@/components/section-label';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useSettings } from '@/features/settings/store';
import { dateKey, formatWeekMonths, planWeek, weekCalendar } from '@/features/training/calendar';
import { WeekCalendar } from '@/features/training/components/week-calendar';
import { completedWorkouts, useTraining } from '@/features/training/store';
import { useWorkoutPlans } from '@/features/workouts/queries';
import type { WorkoutPlan } from '@/features/workouts/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useToday } from '@/hooks/use-today';
import { useLocale } from '@/i18n';

export default function HomeScreen() {
  const styles = useStyles();
  const tabBarInset = useTabBarInset();
  const { t } = useTranslation();
  const name = useSettings((state) => state.name.trim());
  const { data: plans = [] } = useWorkoutPlans();
  const activePlan = useTraining((state) => state.activePlan);
  const plan = plans.find((item) => item.id === activePlan?.planId);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}>
        <ThemedText type="title" accessibilityRole="header" style={styles.title}>
          {name ? t('home.greeting', { name: name.split(/\s+/)[0] }) : t('home.greetingNoName')}
        </ThemedText>
        {plan ? (
          <ActivePlan plan={plan} plans={plans} />
        ) : (
          <>
            <NoPlan />
            {/* The workouts done stay visible without a plan: they're the training history. */}
            <ThisWeek plan={null} />
          </>
        )}
        <RecentWorkouts plans={plans} />
      </ScrollView>
    </Screen>
  );
}

function NoPlan() {
  const styles = useStyles();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <View style={styles.messageCard}>
        <View style={styles.bigIcon}>
          <Icon icon={icons.plan} size={30} color={theme.tint} />
        </View>
        <Text style={[styles.cardTitle, styles.centered]}>{t('home.emptyTitle')}</Text>
        <Text style={[styles.cardMessage, styles.centered]}>{t('home.emptyMessage')}</Text>
        <Button
          label={t('home.choosePlan')}
          onPress={() => router.navigate({ pathname: '/exercises', params: { view: 'plans' } })}
        />
      </View>
    </Card>
  );
}

function ActivePlan({ plan, plans }: { plan: WorkoutPlan; plans: WorkoutPlan[] }) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const activePlan = useTraining((state) => state.activePlan)!;
  const current = useTraining((state) => state.current);
  const done = useTraining(completedWorkouts);
  const startWorkout = useTraining((state) => state.startWorkout);
  const assignPlan = useTraining((state) => state.assignPlan);

  const total = plan.daysPerWeek * plan.durationWeeks;
  const finished = done >= total;
  const today = useToday();
  const week = planWeek(activePlan, plan, today);
  const dayIndex = current?.planId === plan.id ? current.dayIndex : activePlan.nextDayIndex;
  const day = plan.days[dayIndex] ?? plan.days[0];
  const nextLevel = plans.find((item) => item.level === plan.level + 1);

  function start() {
    startWorkout(plan);
    router.push('/workout');
  }

  return (
    <>
      <SectionLabel>{t('home.yourPlan')}</SectionLabel>
      <Card>
        <View style={styles.planCard}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.planLevel}>{t('plan.level', { number: plan.level })}</Text>
              <Text style={styles.cardTitle}>{plan.name[locale]}</Text>
            </View>
            <View>
              <Button
                variant="plain"
                label={t('home.viewPlan')}
                onPress={() => router.push({ pathname: '/workouts/[id]', params: { id: plan.id } })}
              />
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(Math.min(done, total) / total) * 100}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.meta}>
              {t('home.weekProgress', { week, weeks: plan.durationWeeks })}
            </Text>
            <Text style={styles.meta}>
              {t('home.workoutsDone', { done: Math.min(done, total), total })}
            </Text>
          </View>
        </View>
      </Card>

      <ThisWeek plan={plan} />

      {finished && !current ? (
        <Card>
          <View style={styles.messageCard}>
            <View style={styles.bigIcon}>
              <Icon icon={icons.completed} size={30} color={theme.tint} />
            </View>
            <Text style={[styles.cardTitle, styles.centered]}>{t('home.completedTitle')}</Text>
            <Text style={[styles.cardMessage, styles.centered]}>{t('home.completedMessage')}</Text>
            {nextLevel ? (
              <Button
                label={t('home.nextLevel', { number: nextLevel.level })}
                onPress={() =>
                  router.push({ pathname: '/workouts/[id]', params: { id: nextLevel.id } })
                }
              />
            ) : null}
            <Button
              variant={nextLevel ? 'secondary' : 'primary'}
              label={t('home.repeatPlan')}
              onPress={() => assignPlan(plan)}
            />
          </View>
        </Card>
      ) : (
        <>
          <SectionLabel>{current ? t('home.inProgress') : t('home.nextWorkout')}</SectionLabel>
          <Card>
            <View style={styles.planCard}>
              <View style={styles.row}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{dayIndex + 1}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>{t('plan.day', { number: dayIndex + 1 })}</Text>
                  <Text style={styles.meta}>
                    {day.focus[locale]} · {t('home.exerciseCount', { count: day.exercises.length })}
                  </Text>
                </View>
              </View>
              <Button
                icon={icons.start}
                label={current ? t('home.resumeWorkout') : t('home.startWorkout')}
                onPress={current ? () => router.push('/workout') : start}
              />
            </View>
          </Card>
        </>
      )}
    </>
  );
}

/**
 * Monday to Sunday with the workouts done and, with a plan, the training days ahead;
 * links to the full calendar.
 */
function ThisWeek({ plan }: { plan: WorkoutPlan | null }) {
  const styles = useStyles();
  const locale = useLocale();
  const { t } = useTranslation();
  const activePlan = useTraining((state) => state.activePlan);
  const history = useTraining((state) => state.history);
  const current = useTraining((state) => state.current);
  const today = useToday();
  const days = weekCalendar(
    plan && activePlan ? { plan, activePlan } : null,
    history,
    current,
    today,
  );
  const doneThisWeek = days.filter((item) => item.status === 'done').length;

  return (
    <>
      <SectionLabel>{t('home.thisWeek')}</SectionLabel>
      <Card>
        <View style={styles.weekCard}>
          <View style={styles.row}>
            <Text style={[styles.flex, styles.monthLabel]}>
              {formatWeekMonths(
                days.map((item) => item.date),
                locale,
              )}
            </Text>
            <ArrowLink label={t('home.openCalendar')} onPress={() => router.push('/calendar')} />
          </View>
          <WeekCalendar
            days={days}
            onSelect={(date) =>
              router.push({ pathname: '/calendar', params: { date: dateKey(date) } })
            }
          />
          <Text style={[styles.meta, styles.centered]}>
            {plan
              ? t('home.weekCount', { done: doneThisWeek, total: plan.daysPerWeek })
              : t('home.weekCountNoPlan', { count: doneThisWeek })}
          </Text>
        </View>
      </Card>
    </>
  );
}

function RecentWorkouts({ plans }: { plans: WorkoutPlan[] }) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const history = useTraining((state) => state.history);
  const recent = history.slice(-3).reverse();

  if (recent.length === 0) {
    return null;
  }

  return (
    <>
      <SectionLabel>{t('home.recent')}</SectionLabel>
      <Card>
        {recent.map((session, index) => {
          const plan = plans.find((item) => item.id === session.planId);
          const done = session.exercises.filter((exercise) => exercise.status === 'done').length;
          return (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/calendar',
                  params: { date: dateKey(new Date(session.finishedAt ?? session.startedAt)) },
                })
              }
              style={({ pressed }) => [
                styles.recentRow,
                styles.divider,
                pressed && styles.pressed,
              ]}>
              <View style={styles.flex}>
                <Text style={styles.recentTitle}>
                  {t('home.recentItem', {
                    day: t('plan.day', { number: session.dayIndex + 1 }),
                    count: done,
                  })}
                </Text>
                {plan ? <Text style={styles.meta}>{plan.name[locale]}</Text> : null}
              </View>
              <Text style={styles.meta}>
                {new Date(session.finishedAt ?? session.startedAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/history')}
          style={({ pressed }) => [styles.recentRow, pressed && styles.pressed]}>
          <Text style={[styles.flex, styles.seeAll]}>
            {t('home.allWorkouts', { count: history.length })}
          </Text>
          <Icon icon={icons.chevronRight} size={18} color={theme.tint} strokeWidth={2} />
        </Pressable>
      </Card>
    </>
  );
}

/** A round arrow that opens a related page, e.g. the full calendar. */
function ArrowLink({ label, onPress }: { label: string; onPress: () => void }) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, pressed && styles.arrowPressed]}>
      <Icon icon={icons.chevronRight} size={18} strokeWidth={2} />
    </Pressable>
  );
}

const useStyles = makeStyles((theme) => ({
  arrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  arrowPressed: {
    opacity: 0.7,
  },
  pressed: {
    backgroundColor: theme.background,
  },
  content: {
    gap: Spacing.four,
  },
  title: {
    marginTop: Spacing.four,
    marginBottom: Spacing.one,
  },
  messageCard: {
    alignItems: 'stretch',
    gap: Spacing.three,
    padding: Spacing.five,
  },
  bigIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  centered: {
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.text,
  },
  cardMessage: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.textSecondary,
  },
  weekCard: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  monthLabel: {
    paddingLeft: Spacing.one,
    fontSize: 16,
    fontWeight: 600,
    color: theme.text,
  },
  planCard: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  planLevel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: theme.tint,
  },
  progressTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: theme.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: theme.tint,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -Spacing.one,
  },
  meta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  dayBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  dayBadgeText: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.tint,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  seeAll: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.tint,
  },
  recentTitle: {
    fontSize: 16,
    color: theme.text,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
}));

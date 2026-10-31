import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { SubScreenHeader } from '@/components/sub-screen-header';
import { icons } from '@/constants/icons';
import { Spacing } from '@/constants/theme';
import {
  addDays,
  monthGrid,
  parseDateKey,
  sameDay,
  startOfDay,
  startOfWeek,
} from '@/features/training/calendar';
import { WorkoutDetails } from '@/features/training/components/workout-details';
import { useTraining } from '@/features/training/store';
import { useWorkoutPlans } from '@/features/workouts/queries';
import { makeStyles } from '@/hooks/use-styles';
import { useToday } from '@/hooks/use-today';
import { useLocale } from '@/i18n';

const CELL = 40;

/**
 * Every workout done, month by month. Tapping a day shows what was done; on a past day
 * with nothing, a forgotten workout can be logged with that date. Opens on `?date=` when
 * given (a day tapped in Home's week), otherwise on today.
 */
export default function CalendarScreen() {
  const styles = useStyles();
  const locale = useLocale();
  const { t } = useTranslation();
  const today = useToday();
  const history = useTraining((state) => state.history);
  const activePlan = useTraining((state) => state.activePlan);
  const current = useTraining((state) => state.current);
  const startWorkout = useTraining((state) => state.startWorkout);
  const { data: plans = [] } = useWorkoutPlans();
  const { date } = useLocalSearchParams<{ date?: string }>();

  const [selected, setSelected] = useState(() => parseDateKey(date) ?? startOfDay(today));
  const [month, setMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );
  // Which day of the plan a forgotten workout was: the one due next, unless changed.
  const [logDayIndex, setLogDayIndex] = useState(activePlan?.nextDayIndex ?? 0);

  const plan = plans.find((item) => item.id === activePlan?.planId);
  const planStart = activePlan ? startOfDay(new Date(activePlan.startedAt)) : null;
  const planEnd =
    planStart && plan ? addDays(startOfWeek(planStart), plan.durationWeeks * 7) : null;
  const todayStart = startOfDay(today);

  const sessionsOn = (date: Date) =>
    history.filter((session) => sameDay(new Date(session.finishedAt ?? ''), date));
  const isPlannedDay = (date: Date) =>
    plan !== undefined &&
    planStart !== null &&
    planEnd !== null &&
    date > todayStart &&
    date >= planStart &&
    date < planEnd &&
    plan.weekdays.includes(date.getDay() === 0 ? 7 : date.getDay());

  const weeks = useMemo(() => monthGrid(month), [month]);
  const monthCount = history.filter((session) => {
    const date = new Date(session.finishedAt ?? '');
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  }).length;
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(today), i).toLocaleDateString(locale, { weekday: 'narrow' }),
  );
  const monthLabel = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const selectedSessions = sessionsOn(selected);
  const canLog =
    plan !== undefined &&
    planStart !== null &&
    selectedSessions.length === 0 &&
    selected <= todayStart &&
    selected >= planStart;

  function logPast() {
    if (!plan) {
      return;
    }
    startWorkout(plan, selected, logDayIndex);
    router.push('/workout');
  }

  return (
    <Screen withBottomInset>
      <SubScreenHeader title={t('calendar.title')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.monthCard}>
            <View style={styles.monthHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('calendar.previousMonth')}
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                hitSlop={8}
                style={styles.arrow}>
                <Icon icon={icons.back} size={20} strokeWidth={2} />
              </Pressable>
              <View style={styles.flex}>
                <Text style={styles.monthLabel} accessibilityRole="header">
                  {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                </Text>
                <Text style={styles.monthCount}>
                  {t('calendar.monthCount', { count: monthCount })} ·{' '}
                  {t('calendar.total', { count: history.length })}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('calendar.nextMonth')}
                onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                hitSlop={8}
                style={styles.arrow}>
                <Icon icon={icons.chevronRight} size={20} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={styles.week}>
              {weekdayNames.map((name, i) => (
                <Text key={i} style={[styles.cell, styles.weekdayName]}>
                  {name}
                </Text>
              ))}
            </View>
            {weeks.map((week, w) => (
              <View key={w} style={styles.week}>
                {week.map((date, i) => {
                  if (!date) {
                    return <View key={i} style={styles.cell} />;
                  }
                  const done = sessionsOn(date).length > 0;
                  const isSelected = sameDay(date, selected);
                  const isToday = sameDay(date, todayStart);
                  return (
                    <Pressable
                      key={i}
                      accessibilityRole="button"
                      aria-selected={isSelected}
                      accessibilityLabel={date.toLocaleDateString(locale, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                      onPress={() => setSelected(date)}
                      style={styles.cell}>
                      <View
                        style={[
                          styles.dayCircle,
                          isToday && styles.today,
                          done && styles.done,
                          isSelected && styles.selected,
                        ]}>
                        <Text
                          style={[
                            styles.dayNumber,
                            isToday && styles.todayText,
                            done && styles.doneText,
                          ]}>
                          {date.getDate()}
                        </Text>
                      </View>
                      <View style={[styles.dot, isPlannedDay(date) && styles.dotPlanned]} />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View style={styles.dayCard}>
            <Text style={styles.dayTitle}>
              {selected.toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            {selectedSessions.length > 0 ? (
              selectedSessions.map((session) => (
                <WorkoutDetails key={session.id} session={session} />
              ))
            ) : selected > todayStart ? (
              <Text style={styles.message}>{t('calendar.future')}</Text>
            ) : canLog && current ? (
              <Text style={styles.message}>{t('calendar.currentOpen')}</Text>
            ) : canLog ? (
              <>
                <Text style={styles.message}>{t('calendar.logPastHint')}</Text>
                {plan && plan.days.length > 1 ? (
                  <>
                    <Text style={styles.whichDay}>{t('calendar.whichDay')}</Text>
                    <View style={styles.chips}>
                      {plan.days.map((_, index) => (
                        <Chip
                          key={index}
                          label={t('plan.day', { number: index + 1 })}
                          selected={index === logDayIndex}
                          onPress={() => setLogDayIndex(index)}
                        />
                      ))}
                    </View>
                  </>
                ) : null}
                <Button icon={icons.start} label={t('calendar.logPast')} onPress={logPast} />
              </>
            ) : planStart && selected < planStart ? (
              <Text style={styles.message}>{t('calendar.beforePlan')}</Text>
            ) : (
              <Text style={styles.message}>{t('calendar.noWorkout')}</Text>
            )}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  flex: {
    flex: 1,
  },
  monthCard: {
    gap: Spacing.one,
    padding: Spacing.three,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  monthLabel: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 600,
    color: theme.text,
  },
  monthCount: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.textSecondary,
  },
  week: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  weekdayName: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: theme.textSecondary,
  },
  dayCircle: {
    width: CELL,
    height: CELL,
    borderRadius: CELL / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 2,
    borderColor: theme.tint,
  },
  done: {
    backgroundColor: theme.tint,
  },
  selected: {
    borderWidth: 3,
    borderColor: theme.text,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: 500,
    color: theme.text,
  },
  todayText: {
    fontWeight: 700,
    color: theme.tint,
  },
  doneText: {
    fontWeight: 700,
    color: theme.onTint,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotPlanned: {
    backgroundColor: theme.tint,
  },
  dayCard: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.text,
  },
  whichDay: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.textSecondary,
  },
}));

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { icons } from '@/constants/icons';
import { Radius, Spacing } from '@/constants/theme';
import { useExercises } from '@/features/exercises/queries';
import type { Exercise } from '@/features/exercises/types';
import { RestTimer } from '@/features/training/components/rest-timer';
import { SetHeader, SetRow } from '@/features/training/components/set-row';
import { SwapSheet } from '@/features/training/components/swap-sheet';
import { formatSets, formatWeight, sessionTotals } from '@/features/training/format';
import { lastSetsFor, useTraining } from '@/features/training/store';
import type { WorkoutSession } from '@/features/training/types';
import { usePrescriptionLabel } from '@/features/workouts/format';
import { useWorkoutPlan } from '@/features/workouts/queries';
import type { WorkoutPlan } from '@/features/workouts/types';
import { makeStyles } from '@/hooks/use-styles';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n';
import { confirm } from '@/utils/confirm';

/** Back to where the workout was opened from: Home, or Home anyway after a reload. */
function leaveWorkout() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

/**
 * The workout being done: one exercise at a time, with its sets to fill in and tick.
 * Everything is saved as it's typed, so leaving and coming back resumes where it was.
 */
export default function WorkoutScreen() {
  const current = useTraining((state) => state.current);
  const [finished, setFinished] = useState<WorkoutSession | null>(null);
  const { data: plan } = useWorkoutPlan(current?.planId ?? finished?.planId ?? '');
  const { data: exercises = [] } = useExercises();

  // No workout (discarded, dropped empty, or a stale link): nothing to show here.
  useEffect(() => {
    if (!current && !finished) {
      leaveWorkout();
    }
  }, [current, finished]);

  if (finished) {
    return <WorkoutSummary session={finished} />;
  }
  if (!current || !plan || exercises.length === 0) {
    return <Screen withBottomInset>{null}</Screen>;
  }
  return (
    <ActiveWorkout session={current} plan={plan} exercises={exercises} onFinish={setFinished} />
  );
}

type ActiveWorkoutProps = {
  session: WorkoutSession;
  plan: WorkoutPlan;
  exercises: Exercise[];
  onFinish: (session: WorkoutSession) => void;
};

function ActiveWorkout({ session, plan, exercises, onFinish }: ActiveWorkoutProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const prescriptionLabel = usePrescriptionLabel();
  const history = useTraining((state) => state.history);
  const actions = useTraining.getState();

  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      session.exercises.findIndex((exercise) => exercise.status === 'pending'),
    ),
  );
  // Rest after a ticked set; `id` restarts the timer when another set is ticked.
  const [rest, setRest] = useState<{ seconds: number; id: number } | null>(null);
  const [swapping, setSwapping] = useState(false);
  const endRest = useCallback(() => setRest(null), []);

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const day = plan.days[session.dayIndex] ?? plan.days[0];
  const logged = session.exercises[index];
  const planned =
    day.exercises.find((item) => item.exerciseId === logged.plannedExerciseId) ??
    day.exercises[index];
  const exercise = exercisesById.get(logged.exerciseId);
  const last = lastSetsFor(history, logged.exerciseId);
  const hitAllReps =
    last !== null && last.length > 0 && last.every((set) => (set.reps ?? 0) >= planned.reps.max);
  const isLast = index === session.exercises.length - 1;
  const anyDone = logged.sets.some((set) => set.done);
  const swapOptions = exercise
    ? exercises.filter(
        (item) => item.muscleGroup === exercise.muscleGroup && item.id !== exercise.id,
      )
    : [];
  const repsPlaceholder =
    planned.reps.min === planned.reps.max
      ? String(planned.reps.min)
      : t('plan.repsRange', planned.reps);

  function toggleSet(setIndex: number) {
    const set = logged.sets[setIndex];
    if (set.done) {
      actions.updateSet(index, setIndex, { done: false });
      return;
    }
    // A set ticked without reps counts the low end of the target.
    actions.updateSet(index, setIndex, { done: true, reps: set.reps ?? planned.reps.min });
    // Its weight carries over to the next sets still empty, so it's typed once.
    logged.sets.forEach((item, i) => {
      if (i > setIndex && !item.done && item.weightKg === null && set.weightKg !== null) {
        actions.updateSet(index, i, { weightKg: set.weightKg });
      }
    });
    const remaining = logged.sets.filter((item, i) => i !== setIndex && !item.done).length;
    if (remaining > 0) {
      setRest((previous) => ({ seconds: planned.restSeconds, id: (previous?.id ?? 0) + 1 }));
    }
  }

  function goTo(nextIndex: number) {
    setRest(null);
    setIndex(nextIndex);
  }

  async function finish() {
    const pending = useTraining
      .getState()
      .current?.exercises.some(
        (item) => item.status !== 'skipped' && !item.sets.some((set) => set.done),
      );
    if (
      pending &&
      !(await confirm({
        title: t('session.finishTitle'),
        message: t('session.finishMessage'),
        confirmLabel: t('session.end'),
        cancelLabel: t('common.cancel'),
      }))
    ) {
      return;
    }
    // With nothing ticked the workout is dropped: no summary, and the screen closes itself.
    const saved = actions.finishWorkout(plan);
    if (saved) {
      onFinish(saved);
    }
  }

  function next() {
    if (anyDone) {
      actions.completeExercise(index);
    }
    if (isLast) {
      void finish();
    } else {
      goTo(index + 1);
    }
  }

  function skip() {
    actions.skipExercise(index);
    if (isLast) {
      void finish();
    } else {
      goTo(index + 1);
    }
  }

  async function close() {
    const leave = await confirm({
      title: t('session.exitTitle'),
      message: t('session.exitMessage'),
      confirmLabel: t('session.exitConfirm'),
      cancelLabel: t('common.cancel'),
    });
    if (leave) {
      leaveWorkout();
    }
  }

  async function discard() {
    const confirmed = await confirm({
      title: t('session.discardTitle'),
      message: t('session.discardMessage'),
      confirmLabel: t('session.discardConfirm'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      // The screen closes itself once the workout is gone.
      actions.discardWorkout();
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('session.close')}
          onPress={close}
          hitSlop={12}
          style={styles.roundButton}>
          <Icon icon={icons.close} size={20} strokeWidth={2} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          {t('session.progress', {
            day: t('plan.day', { number: session.dayIndex + 1 }),
            current: index + 1,
            total: session.exercises.length,
          })}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={finish}
          hitSlop={12}
          style={styles.endButton}>
          <Text style={styles.endText}>{t('session.end')}</Text>
        </Pressable>
      </View>

      <View style={styles.steps}>
        {session.exercises.map((item, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}`}
            aria-selected={i === index}
            onPress={() => goTo(i)}
            hitSlop={{ top: 10, bottom: 10 }}
            style={[
              styles.step,
              item.status === 'done' && styles.stepDone,
              item.status === 'skipped' && styles.stepSkipped,
              i === index && styles.stepCurrent,
            ]}
          />
        ))}
      </View>

      <ScrollView
        key={index}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {exercise ? (
          <>
            {/* The animation has a white background, so it sits on white in dark mode too. */}
            <Card style={styles.mediaCard}>
              <View style={styles.mediaFrame}>
                <Image
                  source={exercise.media.gif}
                  placeholder={exercise.media.thumbnail}
                  style={styles.media}
                  contentFit="contain"
                  autoplay
                  accessibilityLabel={exercise.name[locale]}
                  accessibilityIgnoresInvertColors
                />
              </View>
            </Card>
            <View style={styles.heading}>
              <ThemedText type="title" accessibilityRole="header">
                {exercise.name[locale]}
              </ThemedText>
              <Text style={styles.target}>
                {t('session.target', { prescription: prescriptionLabel(planned) })}
              </Text>
              {last && last.length > 0 ? (
                <Text style={styles.meta}>
                  {t('session.lastTime', { sets: formatSets(last, locale) })}
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {hitAllReps ? (
          <View style={styles.hint}>
            <Icon icon={icons.tips} size={20} color={theme.tint} />
            <Text style={styles.hintText}>{t('session.tryHeavier')}</Text>
          </View>
        ) : null}

        {logged.status === 'skipped' ? (
          <Text style={[styles.meta, styles.centered]}>{t('session.skipped')}</Text>
        ) : null}

        <Card>
          <SetHeader />
          {logged.sets.map((set, setIndex) => (
            <SetRow
              key={`${logged.exerciseId}-${setIndex}`}
              number={setIndex + 1}
              set={set}
              repsPlaceholder={repsPlaceholder}
              onChange={(patch) => actions.updateSet(index, setIndex, patch)}
              onToggleDone={() => toggleSet(setIndex)}
              last={setIndex === logged.sets.length - 1}
            />
          ))}
        </Card>
        <Button
          variant="plain"
          icon={icons.addSet}
          label={t('session.addSet')}
          onPress={() => actions.addSet(index)}
        />

        <View style={styles.secondaryActions}>
          <View style={styles.flex}>
            <Button
              variant="secondary"
              icon={icons.swap}
              label={t('session.swap')}
              onPress={() => setSwapping(true)}
              disabled={swapOptions.length === 0}
            />
          </View>
          <View style={styles.flex}>
            <Button
              variant="secondary"
              icon={icons.skip}
              label={t('session.skip')}
              onPress={skip}
            />
          </View>
        </View>
        <Button variant="plain" label={t('session.discard')} onPress={discard} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
        {rest ? <RestTimer key={rest.id} seconds={rest.seconds} onDone={endRest} /> : null}
        <Button
          label={isLast ? t('session.finish') : t('session.next')}
          icon={isLast ? icons.setDone : icons.chevronRight}
          onPress={next}
        />
      </View>

      <SwapSheet
        visible={swapping}
        options={swapOptions}
        onClose={() => setSwapping(false)}
        onSelect={(exerciseId) => {
          actions.swapExercise(index, exerciseId);
          setSwapping(false);
        }}
      />
    </View>
  );
}

function WorkoutSummary({ session }: { session: WorkoutSession }) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const { t } = useTranslation();
  const totals = sessionTotals(session);

  const stats = [
    t('session.summaryExercises', { count: totals.exercises }),
    t('session.summarySets', { count: totals.sets }),
    ...(totals.volumeKg > 0
      ? [t('session.summaryVolume', { kg: formatWeight(Math.round(totals.volumeKg), locale) })]
      : []),
  ];

  return (
    <Screen withBottomInset>
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Icon icon={icons.completed} size={40} color={theme.tint} />
        </View>
        <ThemedText type="title" style={styles.centered}>
          {t('session.summaryTitle')}
        </ThemedText>
        <Card>
          {stats.map((stat, i) => (
            <View key={stat} style={[styles.statRow, i < stats.length - 1 && styles.statDivider]}>
              <Text style={styles.statText}>{stat}</Text>
            </View>
          ))}
        </Card>
        <Button label={t('session.backHome')} onPress={leaveWorkout} />
      </View>
    </Screen>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 600,
    color: theme.text,
  },
  endButton: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.two,
  },
  endText: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.tint,
  },
  steps: {
    flexDirection: 'row',
    gap: Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  step: {
    flex: 1,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: theme.surfaceMuted,
  },
  stepDone: {
    backgroundColor: theme.tint,
  },
  stepSkipped: {
    backgroundColor: theme.separator,
  },
  stepCurrent: {
    height: 8,
    marginTop: -1,
    backgroundColor: theme.brand,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  mediaCard: {
    backgroundColor: '#FFFFFF',
  },
  mediaFrame: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.two,
  },
  media: {
    width: 180,
    height: 180,
  },
  heading: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  target: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.tint,
  },
  meta: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  centered: {
    textAlign: 'center',
  },
  hint: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: theme.brandSoft,
  },
  hintText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: theme.text,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  footer: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: theme.background,
  },
  summary: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  summaryIcon: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.brandSoft,
  },
  statRow: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  statDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  statText: {
    fontSize: 17,
    fontWeight: 500,
    color: theme.text,
    textAlign: 'center',
  },
}));

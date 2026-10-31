import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
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
import { RestView } from '@/features/training/components/rest-view';
import { SetList } from '@/features/training/components/set-list';
import { Stepper } from '@/features/training/components/stepper';
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

/** − and + on the weight: the smallest common plate pair. */
const WEIGHT_STEP_KG = 2.5;

/** Back to where the workout was opened from: Home, or Home anyway after a reload. */
function leaveWorkout() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

/**
 * The workout being done, one set at a time: adjust kg and reps, "Set done", rest, next
 * set; after the last set, the next exercise. Everything is saved as it changes, so
 * leaving and coming back resumes where it was.
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

/** A rest in progress; `nextExercise` is set when the rest leads to another exercise. */
type Rest = { id: number; seconds: number; next: string; nextExercise: number | null };

function ActiveWorkout({ session, plan, exercises, onFinish }: ActiveWorkoutProps) {
  const styles = useStyles();
  const theme = useTheme();
  const locale = useLocale();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const prescriptionLabel = usePrescriptionLabel();
  const history = useTraining((state) => state.history);
  const actions = useTraining.getState();

  const [index, setExerciseIndex] = useState(() =>
    Math.max(
      0,
      session.exercises.findIndex((exercise) => exercise.status === 'pending'),
    ),
  );
  const [rest, setRest] = useState<Rest | null>(null);
  const [swapping, setSwapping] = useState(false);

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
  const isLastExercise = index === session.exercises.length - 1;
  const setIndex = logged.sets.findIndex((set) => !set.done);
  const currentSet = setIndex === -1 ? null : logged.sets[setIndex];
  const canRemoveSet = logged.sets.length > 1 && logged.sets.some((set) => !set.done);
  const swapOptions = exercise
    ? exercises.filter(
        (item) => item.muscleGroup === exercise.muscleGroup && item.id !== exercise.id,
      )
    : [];

  function goTo(nextIndex: number) {
    setRest(null);
    setExerciseIndex(nextIndex);
  }

  function startRest(next: string, nextExercise: number | null) {
    setRest((previous) => ({
      id: (previous?.id ?? 0) + 1,
      seconds: planned.restSeconds,
      next,
      nextExercise,
    }));
  }

  function setDone() {
    if (!currentSet) {
      return;
    }
    Keyboard.dismiss();
    actions.updateSet(index, setIndex, {
      done: true,
      reps: currentSet.reps ?? planned.reps.min,
    });
    // The weight carries over to the next sets still empty, so it's set once.
    logged.sets.forEach((item, i) => {
      if (i > setIndex && !item.done && item.weightKg === null && currentSet.weightKg !== null) {
        actions.updateSet(index, i, { weightKg: currentSet.weightKg });
      }
    });

    const nextSet = logged.sets.findIndex((item, i) => i !== setIndex && !item.done);
    if (nextSet !== -1) {
      startRest(t('session.restNextSet', { number: nextSet + 1, total: logged.sets.length }), null);
      return;
    }
    actions.completeExercise(index);
    if (isLastExercise) {
      void finish();
      return;
    }
    const nextExercise = exercisesById.get(session.exercises[index + 1].exerciseId);
    startRest(t('session.restNextExercise', { name: nextExercise?.name[locale] ?? '' }), index + 1);
  }

  function endRest() {
    if (rest?.nextExercise != null) {
      goTo(rest.nextExercise);
    } else {
      setRest(null);
    }
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

  function nextExercise() {
    if (logged.sets.some((set) => set.done)) {
      actions.completeExercise(index);
    }
    if (isLastExercise) {
      void finish();
    } else {
      goTo(index + 1);
    }
  }

  function skip() {
    actions.skipExercise(index);
    if (isLastExercise) {
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

      {rest ? (
        <View style={[styles.flex, { paddingBottom: insets.bottom + Spacing.three }]}>
          <RestView key={rest.id} seconds={rest.seconds} next={rest.next} onContinue={endRest} />
        </View>
      ) : (
        <>
          <ScrollView
            key={index}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}>
            {exercise ? (
              <View style={styles.exerciseHeader}>
                {/* The animation has a white background, so it sits on white in dark mode too. */}
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
                <View style={styles.flex}>
                  <Text style={styles.exerciseName} accessibilityRole="header">
                    {exercise.name[locale]}
                  </Text>
                  <Text style={styles.target}>
                    {t('session.target', { prescription: prescriptionLabel(planned) })}
                  </Text>
                  {last && last.length > 0 ? (
                    <Text style={styles.meta}>
                      {t('session.lastTime', { sets: formatSets(last, locale) })}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {hitAllReps ? (
              <View style={styles.hint}>
                <Icon icon={icons.tips} size={20} color={theme.tint} />
                <Text style={styles.hintText}>{t('session.tryHeavier')}</Text>
              </View>
            ) : null}

            {currentSet ? (
              <Card>
                <View style={styles.setCard}>
                  <Text style={styles.setTitle}>
                    {t('session.setOf', { current: setIndex + 1, total: logged.sets.length })}
                  </Text>
                  <View style={styles.steppers}>
                    <Stepper
                      key={`weight-${logged.exerciseId}-${setIndex}`}
                      label={t('session.weight')}
                      value={currentSet.weightKg}
                      onChange={(weightKg) => actions.updateSet(index, setIndex, { weightKg })}
                      step={WEIGHT_STEP_KG}
                      format={(value) => formatWeight(value, locale)}
                    />
                    <Stepper
                      key={`reps-${logged.exerciseId}-${setIndex}`}
                      label={t('session.reps')}
                      value={currentSet.reps}
                      onChange={(reps) => actions.updateSet(index, setIndex, { reps })}
                      step={1}
                      format={String}
                      integer
                    />
                  </View>
                </View>
              </Card>
            ) : (
              <Text style={[styles.meta, styles.centered]}>{t('session.allSetsDone')}</Text>
            )}

            <Card>
              <SetList
                sets={logged.sets}
                currentIndex={currentSet ? setIndex : null}
                onEdit={(i) => actions.updateSet(index, i, { done: false })}
              />
            </Card>
            <View style={styles.setActions}>
              <View style={styles.flex}>
                <Button
                  variant="plain"
                  icon={icons.addSet}
                  label={t('session.addSet')}
                  onPress={() => actions.addSet(index)}
                />
              </View>
              <View style={styles.flex}>
                <Button
                  variant="plain"
                  icon={icons.removeSet}
                  label={t('session.removeSet')}
                  onPress={() => actions.removeSet(index)}
                  disabled={!canRemoveSet}
                />
              </View>
            </View>
            {logged.sets.some((set) => set.done) ? (
              <Text style={[styles.meta, styles.centered]}>{t('session.editHint')}</Text>
            ) : null}

            <View style={styles.setActions}>
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
            {currentSet ? (
              <Button icon={icons.setDone} label={t('session.setDone')} onPress={setDone} />
            ) : (
              <Button
                icon={isLastExercise ? icons.setDone : icons.chevronRight}
                label={isLastExercise ? t('session.finish') : t('session.next')}
                onPress={nextExercise}
              />
            )}
          </View>
        </>
      )}

      <SwapSheet
        visible={swapping}
        options={swapOptions}
        onClose={() => setSwapping(false)}
        onSelect={(exerciseId) => {
          actions.swapExercise(index, exerciseId, planned.reps.max);
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

const MEDIA_SIZE = 96;

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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  mediaFrame: {
    width: MEDIA_SIZE,
    height: MEDIA_SIZE,
    borderRadius: Radius.medium,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 600,
    color: theme.heading,
  },
  target: {
    marginTop: Spacing.one,
    fontSize: 14,
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
  setCard: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  setTitle: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: 'center',
    color: theme.text,
  },
  steppers: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  setActions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  footer: {
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

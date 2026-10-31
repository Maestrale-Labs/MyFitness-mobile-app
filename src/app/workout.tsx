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
import { ExerciseStrip } from '@/features/training/components/exercise-strip';
import { SetTable } from '@/features/training/components/set-table';
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

/** Pause after the last set of an exercise is ticked, so the tick is seen before moving on. */
const ADVANCE_DELAY_MS = 600;

/** Back to where the workout was opened from: Home, or Home anyway after a reload. */
function leaveWorkout() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

/**
 * The workout being done. The day's exercises are in a strip at the top; the selected
 * one shows its sets, to fill in and tick. Ticking the last set of an exercise moves to
 * the next one, and ticking the last set of the day ends the workout. Everything is
 * saved as it changes, so leaving and coming back resumes where it was.
 */
export default function WorkoutScreen() {
  const current = useTraining((state) => state.current);
  const [finished, setFinished] = useState<WorkoutSession | null>(null);
  const { data: plan } = useWorkoutPlan(current?.planId ?? finished?.planId ?? '');
  const { data: exercises = [] } = useExercises();

  // No workout (dropped empty, or a stale link): nothing to show here.
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

  const [selected, setSelected] = useState(() =>
    Math.max(
      0,
      session.exercises.findIndex((exercise) => exercise.status !== 'done'),
    ),
  );

  const exercisesById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const day = plan.days[session.dayIndex] ?? plan.days[0];
  const logged = session.exercises[selected];
  const planned =
    day.exercises.find((item) => item.exerciseId === logged.plannedExerciseId) ??
    day.exercises[selected];
  const exercise = exercisesById.get(logged.exerciseId);
  const last = lastSetsFor(history, logged.exerciseId);
  const hitAllReps =
    last !== null && last.length > 0 && last.every((set) => (set.reps ?? 0) >= planned.reps.max);
  const doneCount = session.exercises.filter((item) => item.status === 'done').length;

  function save(saved: WorkoutSession | null) {
    // With nothing ticked the workout is dropped: no summary, and the screen closes itself.
    if (saved) {
      onFinish(saved);
    }
  }

  function toggleSet(setIndex: number) {
    const exerciseIndex = selected;
    const set = logged.sets[setIndex];
    if (set.done) {
      actions.updateSet(exerciseIndex, setIndex, { done: false });
      if (logged.status === 'done') {
        actions.setExerciseStatus(exerciseIndex, 'pending');
      }
      return;
    }

    Keyboard.dismiss();
    // A set ticked without reps counts the low end of the target.
    actions.updateSet(exerciseIndex, setIndex, {
      done: true,
      reps: set.reps ?? planned.reps.min,
    });
    // Its weight carries over to the next sets still empty, so it's typed once.
    logged.sets.forEach((item, i) => {
      if (i > setIndex && !item.done && item.weightKg === null && set.weightKg !== null) {
        actions.updateSet(exerciseIndex, i, { weightKg: set.weightKg });
      }
    });

    if (!logged.sets.every((item, i) => i === setIndex || item.done)) {
      return;
    }
    actions.setExerciseStatus(exerciseIndex, 'done');
    // Next exercise not done yet, looking forward first, then back from the start.
    const count = session.exercises.length;
    const next = Array.from({ length: count - 1 }, (_, i) => (exerciseIndex + 1 + i) % count).find(
      (i) => session.exercises[i].status !== 'done',
    );
    setTimeout(() => {
      if (next === undefined) {
        save(actions.finishWorkout(plan));
      } else {
        setSelected(next);
      }
    }, ADVANCE_DELAY_MS);
  }

  async function finishEarly() {
    const confirmed = await confirm({
      title: t('session.finishTitle'),
      message: t('session.finishMessage'),
      confirmLabel: t('session.end'),
      cancelLabel: t('common.cancel'),
    });
    if (confirmed) {
      save(actions.finishWorkout(plan));
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
        <View style={styles.flex}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {t('plan.day', { number: session.dayIndex + 1 })}
          </Text>
          <Text style={styles.topSubtitle} numberOfLines={1}>
            {t('session.exercisesDone', { done: doneCount, total: session.exercises.length })}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={finishEarly}
          hitSlop={12}
          style={styles.endButton}>
          <Text style={styles.endText}>{t('session.end')}</Text>
        </Pressable>
      </View>

      <ExerciseStrip
        exercises={session.exercises}
        exercisesById={exercisesById}
        selected={selected}
        onSelect={setSelected}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}>
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

        <Card>
          <SetTable
            key={`${selected}-${logged.exerciseId}`}
            sets={logged.sets}
            onChange={(setIndex, patch) => actions.updateSet(selected, setIndex, patch)}
            onToggle={toggleSet}
          />
        </Card>
      </ScrollView>
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
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 600,
    color: theme.text,
  },
  topSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.textSecondary,
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
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
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

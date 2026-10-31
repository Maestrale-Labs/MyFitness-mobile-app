import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Spacing } from '@/constants/theme';
import { useExercises } from '@/features/exercises/queries';
import { useWorkoutPlans } from '@/features/workouts/queries';
import { makeStyles } from '@/hooks/use-styles';
import { useLocale } from '@/i18n';
import { confirm } from '@/utils/confirm';

import { formatSets } from '../format';
import { useTraining } from '../store';
import type { WorkoutSession } from '../types';

/** What was done in a finished workout, exercise by exercise, with a way to delete it. */
export function WorkoutDetails({ session }: { session: WorkoutSession }) {
  const styles = useStyles();
  const locale = useLocale();
  const { t } = useTranslation();
  const { data: plans = [] } = useWorkoutPlans();
  const { data: exercises = [] } = useExercises();
  const deleteWorkout = useTraining((state) => state.deleteWorkout);
  const done = session.exercises.filter((exercise) => exercise.status === 'done');
  const planName = plans.find((plan) => plan.id === session.planId)?.name[locale] ?? '';

  async function remove() {
    const confirmed = await confirm({
      title: t('history.deleteTitle'),
      message: t('history.deleteMessage'),
      confirmLabel: t('history.deleteConfirm'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (confirmed) {
      deleteWorkout(session.id);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('calendar.workoutTitle', {
          day: t('plan.day', { number: session.dayIndex + 1 }),
          plan: planName,
        })}
      </Text>
      {done.map((exercise, index) => (
        <View
          key={`${exercise.exerciseId}-${index}`}
          style={[styles.row, index < done.length - 1 && styles.divider]}>
          <Text style={styles.name}>
            {exercises.find((item) => item.id === exercise.exerciseId)?.name[locale] ??
              exercise.exerciseId}
          </Text>
          <Text style={styles.sets}>{formatSets(exercise.sets, locale)}</Text>
        </View>
      ))}
      <View style={styles.delete}>
        <Button variant="plain" label={t('history.delete')} onPress={remove} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((theme) => ({
  container: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.tint,
  },
  row: {
    gap: 2,
    paddingVertical: Spacing.two,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.separator,
  },
  name: {
    fontSize: 16,
    color: theme.text,
  },
  sets: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  delete: {
    alignSelf: 'flex-start',
  },
}));

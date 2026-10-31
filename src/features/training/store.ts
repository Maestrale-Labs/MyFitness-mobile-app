import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { track } from '@/features/analytics/client';
import type { WorkoutPlan } from '@/features/workouts/types';

import { countsForPlan } from './calendar';
import type { ActivePlan, LoggedExercise, LoggedSet, WorkoutSession } from './types';

type TrainingState = {
  activePlan: ActivePlan | null;
  /** The workout being done right now, kept across app restarts. */
  current: WorkoutSession | null;
  /** Finished workouts, oldest first (by the day they were done). */
  history: WorkoutSession[];
  assignPlan: (plan: WorkoutPlan) => void;
  leavePlan: () => void;
  /**
   * Opens the plan's next workout. With `loggedFor`, it's a workout done on that past day
   * and forgotten: it's saved with that date, and `dayIndex` says which day of the plan
   * it was (the next one by default).
   */
  startWorkout: (plan: WorkoutPlan, loggedFor?: Date, dayIndex?: number) => void;
  updateSet: (exerciseIndex: number, setIndex: number, patch: Partial<LoggedSet>) => void;
  setExerciseStatus: (exerciseIndex: number, status: LoggedExercise['status']) => void;
  /**
   * Saves the workout and moves on to the next day. Returns the saved workout, or null
   * when no set was ticked: an empty workout is dropped and doesn't count.
   */
  finishWorkout: (plan: WorkoutPlan) => WorkoutSession | null;
  discardWorkout: () => void;
  /** Removes a finished workout, e.g. one logged by mistake. */
  deleteWorkout: (id: string) => void;
};

/** The sets logged for an exercise in the most recent finished workout that had it. */
export function lastSetsFor(history: WorkoutSession[], exerciseId: string): LoggedSet[] | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i].exercises.find(
      (exercise) => exercise.exerciseId === exerciseId && exercise.status === 'done',
    );
    if (entry) {
      return entry.sets.filter((set) => set.done);
    }
  }
  return null;
}

/** Finished workouts of a plan since it was assigned: they measure progress through it. */
export function completedWorkouts(state: Pick<TrainingState, 'activePlan' | 'history'>) {
  const { activePlan, history } = state;
  if (!activePlan) {
    return 0;
  }
  return history.filter((session) => countsForPlan(session, activePlan)).length;
}

/**
 * Sets for a new workout, prefilled with what was done last time; the first time, reps
 * start from the top of the target and the weight is left for the user.
 */
function prefilledSets(
  history: WorkoutSession[],
  exerciseId: string,
  count: number,
  defaultReps: number,
) {
  const last = lastSetsFor(history, exerciseId);
  return Array.from({ length: count }, (_, index): LoggedSet => {
    const previous = last?.[Math.min(index, last.length - 1)];
    return {
      weightKg: previous?.weightKg ?? null,
      reps: previous?.reps ?? defaultReps,
      done: false,
    };
  });
}

function updateCurrent(
  state: TrainingState,
  exerciseIndex: number,
  change: (exercise: WorkoutSession['exercises'][number]) => WorkoutSession['exercises'][number],
): Partial<TrainingState> {
  if (!state.current) {
    return {};
  }
  return {
    current: {
      ...state.current,
      exercises: state.current.exercises.map((exercise, index) =>
        index === exerciseIndex ? change(exercise) : exercise,
      ),
    },
  };
}

/**
 * The user's training, stored on the device only (no account yet). When accounts arrive,
 * this moves to Supabase.
 */
export const useTraining = create<TrainingState>()(
  persist(
    (set, get) => ({
      activePlan: null,
      current: null,
      history: [],

      assignPlan: (plan) => {
        set({
          activePlan: { planId: plan.id, startedAt: new Date().toISOString(), nextDayIndex: 0 },
          current: null,
        });
        track('plan_added', { planId: plan.id, level: plan.level });
      },

      leavePlan: () => set({ activePlan: null, current: null }),

      startWorkout: (plan, loggedFor, chosenDayIndex) => {
        const { activePlan, history, current } = get();
        if (current) {
          return;
        }
        const dayIndex =
          chosenDayIndex ?? (activePlan?.planId === plan.id ? activePlan.nextDayIndex : 0);
        const day = plan.days[dayIndex] ?? plan.days[0];
        set({
          current: {
            id: randomUUID(),
            planId: plan.id,
            dayIndex,
            // A forgotten workout is dated midday of its day, clear of time-zone edges.
            startedAt: (loggedFor
              ? new Date(loggedFor.getFullYear(), loggedFor.getMonth(), loggedFor.getDate(), 12)
              : new Date()
            ).toISOString(),
            finishedAt: null,
            ...(loggedFor ? { loggedLater: true } : {}),
            exercises: day.exercises.map((item) => ({
              exerciseId: item.exerciseId,
              plannedExerciseId: item.exerciseId,
              status: 'pending',
              sets: prefilledSets(history, item.exerciseId, item.sets, item.reps.max),
            })),
          },
        });
        track('workout_started', { planId: plan.id, day: dayIndex + 1 });
      },

      updateSet: (exerciseIndex, setIndex, patch) =>
        set((state) =>
          updateCurrent(state, exerciseIndex, (exercise) => ({
            ...exercise,
            sets: exercise.sets.map((item, index) =>
              index === setIndex ? { ...item, ...patch } : item,
            ),
          })),
        ),

      setExerciseStatus: (exerciseIndex, status) =>
        set((state) =>
          updateCurrent(state, exerciseIndex, (exercise) => ({ ...exercise, status })),
        ),

      finishWorkout: (plan) => {
        const { current, activePlan, history } = get();
        if (!current) {
          return null;
        }
        if (!current.exercises.some((exercise) => exercise.sets.some((item) => item.done))) {
          set({ current: null });
          return null;
        }
        const finished: WorkoutSession = {
          ...current,
          finishedAt: current.loggedLater ? current.startedAt : new Date().toISOString(),
          // Exercises never opened count as skipped; sets not ticked are dropped.
          exercises: current.exercises.map((exercise) => {
            const sets = exercise.sets.filter((item) => item.done);
            const status = exercise.status === 'skipped' || sets.length === 0 ? 'skipped' : 'done';
            return { ...exercise, status, sets };
          }),
        };
        // The plan moves on when the workout due next is done; a forgotten one logged for
        // another day of the plan leaves it where it is.
        const nextActive =
          activePlan?.planId === plan.id && current.dayIndex === activePlan.nextDayIndex
            ? { ...activePlan, nextDayIndex: (current.dayIndex + 1) % plan.days.length }
            : activePlan;
        // Kept in day order, so a forgotten workout logged now sits where it belongs.
        const nextHistory = [...history, finished].sort((a, b) =>
          (a.finishedAt ?? '').localeCompare(b.finishedAt ?? ''),
        );
        set({ current: null, history: nextHistory, activePlan: nextActive });

        const done = completedWorkouts({ activePlan: nextActive, history: nextHistory });
        track('workout_completed', {
          planId: plan.id,
          day: current.dayIndex + 1,
          exercisesDone: finished.exercises.filter((exercise) => exercise.status === 'done').length,
          exercisesSkipped: finished.exercises.filter((exercise) => exercise.status === 'skipped')
            .length,
        });
        if (done === plan.daysPerWeek * plan.durationWeeks) {
          track('plan_completed', { planId: plan.id, level: plan.level });
        }
        return finished;
      },

      discardWorkout: () => set({ current: null }),

      deleteWorkout: (id) =>
        set((state) => ({ history: state.history.filter((session) => session.id !== id) })),
    }),
    {
      name: 'training',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ activePlan, current, history }) => ({ activePlan, current, history }),
    },
  ),
);

/** False until the saved training has been read from storage. */
export function useTrainingHydrated() {
  return useSyncExternalStore(
    (onChange) => useTraining.persist.onFinishHydration(onChange),
    () => useTraining.persist.hasHydrated(),
  );
}

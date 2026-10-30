import type { Localized } from '@/i18n';
import type { Translations } from '@/i18n/locales/it';

// The vocabularies are the translation keys, so adding a value without a label fails typecheck.
export type PlanGoal = keyof Translations['planGoal'];
export type PlanLevel = keyof Translations['planLevel'];

/** One exercise of a workout, with its prescription. */
export type PlanExercise = {
  /** An `Exercise.id` from the exercise catalog. */
  exerciseId: string;
  sets: number;
  reps: { min: number; max: number };
  /** Reps are counted for each leg or arm (lunges, one-arm rows). */
  perSide?: boolean;
  restSeconds: number;
};

/** One training day of a plan, such as "Workout A". */
export type Workout = {
  id: string;
  name: Localized;
  /** The muscles it works, in a few words. */
  focus: Localized;
  exercises: PlanExercise[];
};

export type WorkoutPlan = {
  /** Stable slug, used in URLs. */
  id: string;
  name: Localized;
  summary: Localized;
  goal: PlanGoal;
  level: PlanLevel;
  daysPerWeek: number;
  durationWeeks: number;
  /** How to spread the workouts over the week. */
  schedule: Localized;
  workouts: Workout[];
  tips: Localized<string[]>;
};

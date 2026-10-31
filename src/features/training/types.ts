/** The plan the user is following, chosen from the plans tab. */
export type ActivePlan = {
  planId: string;
  /** ISO date-time. */
  startedAt: string;
  /** Index in `plan.days` of the next workout: after day 3 comes day 1 again. */
  nextDayIndex: number;
};

export type LoggedSet = {
  /** Kilograms; null for body-weight exercises or when left empty. */
  weightKg: number | null;
  reps: number | null;
  done: boolean;
};

export type LoggedExercise = {
  /** The exercise actually done: it can differ from the plan's when swapped. */
  exerciseId: string;
  /** The plan's exercise this entry stands for, to keep prescriptions and history aligned. */
  plannedExerciseId: string;
  status: 'pending' | 'done' | 'skipped';
  sets: LoggedSet[];
};

/** One workout: in progress while `finishedAt` is null. */
export type WorkoutSession = {
  id: string;
  planId: string;
  dayIndex: number;
  startedAt: string;
  finishedAt: string | null;
  exercises: LoggedExercise[];
  /**
   * Logged afterwards for a past day the user forgot to record: its dates are that day,
   * not the moment it was typed in.
   */
  loggedLater?: boolean;
};

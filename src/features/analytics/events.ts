/**
 * Every event the app can send, with its properties. Names are snake_case, as stored in
 * `analytics.events` (supabase/migrations/…_create_analytics.sql). Never put personal
 * data here (names, free text): ids of our own content only.
 */
export type AnalyticsEvents = {
  /** The app was opened or brought back to the foreground. */
  app_open: Record<string, never>;
  plan_viewed: { planId: string };
  exercise_viewed: { exerciseId: string };
  /** The user chose a plan to follow. */
  plan_added: { planId: string; level: number };
  /** `day` is 1-based, as shown in the app. */
  workout_started: { planId: string; day: number };
  workout_completed: {
    planId: string;
    day: number;
    exercisesDone: number;
    exercisesSkipped: number;
  };
  /** All the plan's workouts are done (days per week × weeks). */
  plan_completed: { planId: string; level: number };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

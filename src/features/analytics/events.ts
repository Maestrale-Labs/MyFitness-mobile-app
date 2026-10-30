/**
 * Every event the app can send, with its properties. Names are snake_case, as stored in
 * `analytics.events` (supabase/migrations/…_create_analytics.sql). Never put personal
 * data here (names, free text): ids of our own content only.
 *
 * Planned with the user journey: plan_added, workout_completed, plan_completed.
 */
export type AnalyticsEvents = {
  /** The app was opened or brought back to the foreground. */
  app_open: Record<string, never>;
  plan_viewed: { planId: string };
  exercise_viewed: { exerciseId: string };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

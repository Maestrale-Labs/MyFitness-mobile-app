import type { WorkoutPlan } from '@/features/workouts/types';

import type { ActivePlan, WorkoutSession } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Local midnight of the given moment. */
export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** The Monday starting the week of `date`, at local midnight. */
export function startOfWeek(date: Date) {
  const day = startOfDay(date);
  const isoWeekday = day.getDay() === 0 ? 7 : day.getDay();
  return addDays(day, 1 - isoWeekday);
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** 1-based week of the plan for `today`, counted in calendar weeks from the start. */
export function planWeek(activePlan: ActivePlan, plan: WorkoutPlan, today: Date) {
  const start = startOfWeek(new Date(activePlan.startedAt));
  const weeks = Math.round((startOfWeek(today).getTime() - start.getTime()) / (7 * DAY_MS)) + 1;
  return Math.min(Math.max(weeks, 1), plan.durationWeeks);
}

export type CalendarDay = {
  date: Date;
  isToday: boolean;
  /**
   * done: a workout was finished that day. inProgress: today's workout is open.
   * planned: a training day still ahead. missed: a training day gone by without training.
   * rest: no training planned. beforeStart: before the plan was chosen.
   */
  status: 'done' | 'inProgress' | 'planned' | 'missed' | 'rest' | 'beforeStart';
  /** Index in `plan.days` of the workout done or planned that day. */
  dayIndex: number | null;
};

/**
 * The current week, Monday to Sunday. Workouts done show on the day they were done,
 * whatever the plan suggested; the plan's training weekdays still ahead get the next
 * workouts in order, starting from the one due next.
 */
export function weekCalendar(
  plan: WorkoutPlan,
  activePlan: ActivePlan,
  history: WorkoutSession[],
  current: WorkoutSession | null,
  today: Date,
): CalendarDay[] {
  const monday = startOfWeek(today);
  const todayStart = startOfDay(today);
  const planStart = startOfDay(new Date(activePlan.startedAt));
  const sessions = history.filter(
    (session) => session.planId === plan.id && session.startedAt >= activePlan.startedAt,
  );
  const inProgressToday = current?.planId === plan.id ? current : null;
  // Workouts still to place: the open one first (it's today's), then the next ones.
  let nextIndex = inProgressToday
    ? (inProgressToday.dayIndex + 1) % plan.days.length
    : activePlan.nextDayIndex;

  return Array.from({ length: 7 }, (_, i): CalendarDay => {
    const date = addDays(monday, i);
    const isToday = sameDay(date, todayStart);
    const done = sessions.find((session) => sameDay(new Date(session.finishedAt ?? ''), date));
    const isTrainingDay = plan.weekdays.includes(i + 1);

    if (done) {
      return { date, isToday, status: 'done', dayIndex: done.dayIndex };
    }
    if (isToday && inProgressToday) {
      return { date, isToday, status: 'inProgress', dayIndex: inProgressToday.dayIndex };
    }
    if (date < planStart) {
      return { date, isToday, status: 'beforeStart', dayIndex: null };
    }
    if (!isTrainingDay) {
      return { date, isToday, status: 'rest', dayIndex: null };
    }
    if (date < todayStart) {
      return { date, isToday, status: 'missed', dayIndex: null };
    }
    const dayIndex = nextIndex;
    nextIndex = (nextIndex + 1) % plan.days.length;
    return { date, isToday, status: 'planned', dayIndex };
  });
}

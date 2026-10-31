import type { Locale } from '@/i18n';

import type { LoggedSet, WorkoutSession } from './types';

/** "22,5" in Italian, "22.5" in English. */
export function formatWeight(kg: number, locale: Locale) {
  return kg.toLocaleString(locale, { maximumFractionDigits: 2 });
}

/** Parses what the user typed in a weight or reps field; comma or dot as decimal mark. */
export function parseNumber(text: string): number | null {
  const value = Number.parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

/** "20 kg × 12, 22,5 kg × 10": what was lifted, for the "last time" hint. */
export function formatSets(sets: LoggedSet[], locale: Locale) {
  return sets
    .map((set) => {
      const weight = set.weightKg !== null ? `${formatWeight(set.weightKg, locale)} kg` : null;
      const reps = set.reps !== null ? String(set.reps) : null;
      return [weight, reps].filter(Boolean).join(' × ');
    })
    .filter(Boolean)
    .join(', ');
}

/** Totals for the end-of-workout summary. Volume counts weight × reps of every done set. */
export function sessionTotals(session: WorkoutSession) {
  const done = session.exercises.filter((exercise) => exercise.status === 'done');
  const sets = done.flatMap((exercise) => exercise.sets.filter((set) => set.done));
  const volumeKg = sets.reduce((sum, set) => sum + (set.weightKg ?? 0) * (set.reps ?? 0), 0);
  return { exercises: done.length, sets: sets.length, volumeKg };
}

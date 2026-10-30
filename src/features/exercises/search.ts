import type { Exercise } from './types';

/** Lowercase and strip accents, so searches ignore both. */
export function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Matches the query against the exercise name in every language. */
export function matchesQuery(exercise: Exercise, query: string) {
  const needle = normalize(query);
  if (!needle) {
    return true;
  }
  return Object.values(exercise.name).some((name) => normalize(name).includes(needle));
}

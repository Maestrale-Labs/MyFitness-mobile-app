import { seedExercises } from './data/seed';
import type { Exercise } from './types';

/**
 * Where exercises come from. Screens only talk to this interface, so moving the catalog
 * to Supabase means adding a second implementation and swapping `exerciseRepository`.
 */
export type ExerciseRepository = {
  list(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
};

function createLocalExerciseRepository(exercises: Exercise[]): ExerciseRepository {
  return {
    async list() {
      return exercises;
    },
    async getById(id) {
      return exercises.find((exercise) => exercise.id === id) ?? null;
    },
  };
}

export const exerciseRepository: ExerciseRepository = createLocalExerciseRepository(seedExercises);

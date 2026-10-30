import { seedPlans } from './data/plans';
import type { WorkoutPlan } from './types';

/**
 * Where workout plans come from. Screens only talk to this interface, like
 * `ExerciseRepository`, so the plans can move to Supabase without touching them.
 */
export type WorkoutPlanRepository = {
  list(): Promise<WorkoutPlan[]>;
  getById(id: string): Promise<WorkoutPlan | null>;
};

function createLocalWorkoutPlanRepository(plans: WorkoutPlan[]): WorkoutPlanRepository {
  return {
    async list() {
      return plans;
    },
    async getById(id) {
      return plans.find((plan) => plan.id === id) ?? null;
    },
  };
}

export const workoutPlanRepository: WorkoutPlanRepository =
  createLocalWorkoutPlanRepository(seedPlans);

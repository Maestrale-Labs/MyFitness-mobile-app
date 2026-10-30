import { useQuery } from '@tanstack/react-query';

import { workoutPlanRepository } from './repository';

export function useWorkoutPlans() {
  return useQuery({
    queryKey: ['workoutPlans'],
    queryFn: () => workoutPlanRepository.list(),
  });
}

export function useWorkoutPlan(id: string) {
  return useQuery({
    queryKey: ['workoutPlans', id],
    queryFn: () => workoutPlanRepository.getById(id),
  });
}

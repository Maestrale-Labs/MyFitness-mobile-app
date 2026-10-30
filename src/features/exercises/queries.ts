import { useQuery } from '@tanstack/react-query';

import { exerciseRepository } from './repository';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => exerciseRepository.list(),
  });
}

export function useExercise(id: string) {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => exerciseRepository.getById(id),
  });
}

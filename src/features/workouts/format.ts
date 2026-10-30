import { useTranslation } from 'react-i18next';

import type { PlanExercise } from './types';

/** Formats a prescription as "3 × 10–12 · 90 s rest". */
export function usePrescriptionLabel() {
  const { t } = useTranslation();

  return function prescriptionLabel({ sets, reps, perSide, restSeconds }: PlanExercise) {
    const range = reps.min === reps.max ? String(reps.min) : t('plan.repsRange', reps);
    const repsLabel = perSide ? t('plan.perSide', { reps: range }) : range;
    const rest =
      restSeconds % 60 === 0
        ? t('plan.restMinutes', { count: restSeconds / 60 })
        : t('plan.restSeconds', { count: restSeconds });
    return `${t('plan.sets', { sets, reps: repsLabel })} · ${rest}`;
  };
}

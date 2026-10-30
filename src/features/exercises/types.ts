import type { Localized } from '@/i18n';
import type { Translations } from '@/i18n/locales/it';

// The vocabularies are the translation keys, so adding a value without a label fails typecheck.
export type BodyPart = keyof Translations['bodyPart'];
export type Equipment = keyof Translations['equipment'];
export type Muscle = keyof Translations['muscle'];
export type MuscleGroup = keyof Translations['muscleGroup'];

/** The muscle groups the exercise list is filtered by, in display order. */
export const muscleGroups: MuscleGroup[] = ['back', 'legs', 'glutes', 'biceps', 'chest'];

export type Exercise = {
  /** Stable slug, used in URLs. */
  id: string;
  name: Localized;
  /** Our grouping for browsing, chosen per exercise (the dataset's target can differ). */
  muscleGroup: MuscleGroup;
  bodyPart: BodyPart;
  equipment: Equipment;
  targetMuscle: Muscle;
  secondaryMuscles: Muscle[];
  steps: Localized<string[]>;
  media: {
    /** Animated demonstration. */
    gif: string;
    /** Static still for lists. */
    thumbnail: string;
    /** Copyright holder, shown next to the media. */
    credit: string;
  };
  /** Where the record was imported from, to re-sync it later. */
  source: {
    dataset: string;
    id: string;
  };
};

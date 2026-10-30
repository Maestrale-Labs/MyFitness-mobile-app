import type { Exercise } from '../types';

/**
 * Sample exercises from https://github.com/hasaneyldrm/exercises-dataset (data: MIT).
 * Italian steps are reviewed by hand; the dataset's machine translations need editing.
 *
 * The media is © Gym visual and is NOT covered by the MIT license: it is loaded from the
 * dataset repository (pinned to a commit) rather than copied here, and a license from
 * Gym visual is needed before release. See docs/exercise-data.md.
 */
const DATASET = 'hasaneyldrm/exercises-dataset';
const MEDIA_BASE_URL =
  'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/7455efae41b330c265e7cd4b78dfa848e7ce5ebd';
const MEDIA_CREDIT = 'Gym visual';

function media(file: string) {
  return {
    gif: `${MEDIA_BASE_URL}/videos/${file}.gif`,
    thumbnail: `${MEDIA_BASE_URL}/images/${file}.jpg`,
    credit: MEDIA_CREDIT,
  };
}

export const seedExercises: Exercise[] = [
  {
    id: 'lat-pulldown',
    name: { it: 'Lat machine', en: 'Lat pulldown' },
    bodyPart: 'back',
    equipment: 'cable',
    targetMuscle: 'lats',
    secondaryMuscles: ['biceps', 'rhomboids', 'rear_deltoids'],
    steps: {
      it: [
        'Regola la puleggia in posizione alta e aggancia una barra dritta.',
        'Siediti di fronte alla macchina con i piedi ben appoggiati a terra e le ginocchia leggermente piegate.',
        'Afferra la barra con presa prona, un po’ più larga delle spalle.',
        'Inclina leggermente il busto all’indietro, tieni il petto in fuori e mantieni la naturale curva lombare.',
        'Tira la barra verso il petto guidando il movimento con i gomiti e avvicinando le scapole.',
        'Fermati un istante in basso, poi riporta lentamente la barra alla posizione di partenza.',
        'Ripeti per il numero di ripetizioni previsto.',
      ],
      en: [
        'Adjust the cable pulley to a high position and attach a straight bar.',
        'Sit facing the cable machine with your feet flat on the ground and your knees slightly bent.',
        'Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.',
        'Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.',
        'Pull the bar down towards your chest, leading with your elbows and squeezing your shoulder blades together.',
        'Pause for a moment at the bottom of the movement, then slowly return the bar to the starting position.',
        'Repeat for the desired number of repetitions.',
      ],
    },
    media: media('0150-eYnzaCm'),
    source: { dataset: DATASET, id: '0150' },
  },
  {
    id: 'barbell-bench-press',
    name: { it: 'Panca piana con bilanciere', en: 'Barbell bench press' },
    bodyPart: 'chest',
    equipment: 'barbell',
    targetMuscle: 'pectorals',
    secondaryMuscles: ['triceps', 'shoulders'],
    steps: {
      it: [
        'Sdraiati sulla panca con i piedi ben appoggiati a terra e la schiena aderente alla panca.',
        'Afferra il bilanciere con presa prona, un po’ più larga delle spalle.',
        'Stacca il bilanciere dal rack e tienilo sopra il petto con le braccia distese.',
        'Abbassa lentamente il bilanciere verso il petto, tenendo i gomiti vicini al corpo.',
        'Fai una breve pausa quando il bilanciere sfiora il petto.',
        'Spingi il bilanciere verso l’alto fino a distendere di nuovo le braccia.',
        'Ripeti per il numero di ripetizioni previsto.',
      ],
      en: [
        'Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.',
        'Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.',
        'Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.',
        'Lower the barbell slowly towards your chest, keeping your elbows tucked in.',
        'Pause for a moment when the barbell touches your chest.',
        'Push the barbell back up to the starting position by extending your arms.',
        'Repeat for the desired number of repetitions.',
      ],
    },
    media: media('0025-EIeI8Vf'),
    source: { dataset: DATASET, id: '0025' },
  },
];

import type { Localized } from '@/i18n';

import type { PlanExercise, WorkoutDay, WorkoutPlan } from '../types';

/** Shorthand for a prescription: sets × min–max reps, rest in seconds. */
function ex(
  exerciseId: string,
  sets: number,
  [min, max]: [number, number],
  restSeconds: number,
  options: { perSide?: boolean } = {},
): PlanExercise {
  return { exerciseId, sets, reps: { min, max }, restSeconds, ...options };
}

const beginnerTips: Localized<string[]> = {
  it: [
    'Prima di iniziare scaldati per 5-10 minuti e fai una serie leggera del primo esercizio.',
    'Scegli un peso con cui finisci ogni serie avendo ancora 2-3 ripetizioni in riserva.',
    'Quando arrivi al massimo delle ripetizioni in tutte le serie, la volta dopo aumenta un po’ il peso.',
    'La tecnica viene prima del carico: se l’esecuzione peggiora, riduci il peso.',
    'Lascia almeno un giorno di riposo tra due allenamenti che lavorano gli stessi muscoli.',
  ],
  en: [
    'Warm up for 5-10 minutes before starting and do one light set of the first exercise.',
    'Pick a weight that lets you finish each set with 2-3 reps still in reserve.',
    'Once you hit the top of the rep range in every set, add a little weight next time.',
    'Form comes before load: if your technique slips, lower the weight.',
    'Leave at least one rest day between two workouts that train the same muscles.',
  ],
};

// The full body plan repeats its first day on day 3.
const fullBodyA: WorkoutDay = {
  focus: { it: 'Gambe, petto, schiena, spalle', en: 'Legs, chest, back, shoulders' },
  exercises: [
    ex('leg-press', 3, [10, 12], 120),
    ex('dumbbell-bench-press', 3, [8, 12], 90),
    ex('lat-pulldown', 3, [10, 12], 90),
    ex('dumbbell-shoulder-press', 3, [10, 12], 90),
    ex('seated-leg-curl', 3, [12, 15], 60),
    ex('crunch', 3, [12, 15], 60),
  ],
};

const fullBodyB: WorkoutDay = {
  focus: { it: 'Gambe, schiena, petto, braccia', en: 'Legs, back, chest, arms' },
  exercises: [
    ex('goblet-squat', 3, [10, 12], 90),
    ex('cable-seated-row', 3, [10, 12], 90),
    ex('machine-chest-press', 3, [10, 12], 90),
    ex('romanian-deadlift', 3, [10, 12], 120),
    ex('dumbbell-lateral-raise', 3, [12, 15], 60),
    ex('dumbbell-curl', 2, [10, 12], 60),
    ex('rope-triceps-pushdown', 2, [10, 12], 60),
  ],
};

/**
 * Plans we provide. Every `exerciseId` must exist in the exercise catalog: the plan
 * screens show an exercise only once the repository returns it.
 */
export const seedPlans: WorkoutPlan[] = [
  {
    id: 'full-body-beginner',
    name: { it: 'Full body', en: 'Full body' },
    summary: {
      it: 'Tre allenamenti a settimana per tutto il corpo. Pensata per chi inizia: pochi esercizi, soprattutto macchine e manubri.',
      en: 'Three full-body workouts a week. Built for beginners: few exercises, mostly machines and dumbbells.',
    },
    goal: 'muscleGain',
    level: 1,
    daysPerWeek: 3,
    durationWeeks: 8,
    schedule: {
      it: 'Tre giorni non consecutivi, per esempio lunedì (giorno 1), mercoledì (giorno 2) e venerdì (giorno 3). Il giorno 3 è uguale al giorno 1.',
      en: 'Three non-consecutive days, for example Monday (day 1), Wednesday (day 2) and Friday (day 3). Day 3 is the same as day 1.',
    },
    days: [fullBodyA, fullBodyB, fullBodyA],
    tips: beginnerTips,
  },
  {
    id: 'upper-lower-beginner',
    name: { it: 'Upper/Lower', en: 'Upper/Lower' },
    summary: {
      it: 'Quattro allenamenti a settimana: due per la parte alta del corpo e due per la parte bassa. Il passo successivo dopo qualche mese di full body.',
      en: 'Four workouts a week: two for the upper body and two for the lower body. The next step after a few months of full body.',
    },
    goal: 'muscleGain',
    level: 2,
    daysPerWeek: 4,
    durationWeeks: 8,
    schedule: {
      it: 'Per esempio lunedì (giorno 1), martedì (giorno 2), giovedì (giorno 3) e venerdì (giorno 4). Mercoledì e il fine settimana sono di riposo.',
      en: 'For example Monday (day 1), Tuesday (day 2), Thursday (day 3) and Friday (day 4). Wednesday and the weekend are rest days.',
    },
    days: [
      {
        focus: {
          it: 'Parte alta: petto, schiena, spalle, braccia',
          en: 'Upper body: chest, back, shoulders, arms',
        },
        exercises: [
          ex('barbell-bench-press', 3, [8, 10], 120),
          ex('lat-pulldown', 3, [10, 12], 90),
          ex('dumbbell-shoulder-press', 3, [10, 12], 90),
          ex('dumbbell-one-arm-row', 3, [10, 12], 90, { perSide: true }),
          ex('barbell-curl', 2, [10, 12], 60),
          ex('rope-triceps-pushdown', 2, [10, 12], 60),
        ],
      },
      {
        focus: {
          it: 'Parte bassa: quadricipiti, femorali, polpacci',
          en: 'Lower body: quads, hamstrings, calves',
        },
        exercises: [
          ex('barbell-squat', 3, [8, 10], 150),
          ex('romanian-deadlift', 3, [10, 12], 120),
          ex('leg-extension', 3, [12, 15], 60),
          ex('lying-leg-curl', 3, [12, 15], 60),
          ex('standing-calf-raise', 3, [12, 15], 60),
          ex('crunch', 3, [12, 15], 60),
        ],
      },
      {
        focus: {
          it: 'Parte alta: petto, schiena, spalle, braccia',
          en: 'Upper body: chest, back, shoulders, arms',
        },
        exercises: [
          ex('machine-chest-press', 3, [10, 12], 90),
          ex('cable-seated-row', 3, [10, 12], 90),
          ex('dumbbell-fly', 3, [12, 15], 60),
          ex('dumbbell-lateral-raise', 3, [12, 15], 60),
          ex('hammer-curl', 2, [10, 12], 60),
          ex('dumbbell-overhead-triceps-extension', 2, [10, 12], 60),
        ],
      },
      {
        focus: {
          it: 'Parte bassa: glutei, quadricipiti, polpacci',
          en: 'Lower body: glutes, quads, calves',
        },
        exercises: [
          ex('leg-press', 3, [10, 12], 120),
          ex('dumbbell-lunge', 3, [10, 12], 90, { perSide: true }),
          ex('barbell-glute-bridge', 3, [10, 12], 90),
          ex('seated-leg-curl', 3, [12, 15], 60),
          ex('standing-calf-raise', 3, [12, 15], 60),
        ],
      },
    ],
    tips: beginnerTips,
  },
];

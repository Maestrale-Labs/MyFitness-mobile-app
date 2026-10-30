-- The two sample exercises the app started with (lat pulldown, barbell bench press),
-- from hasaneyldrm/exercises-dataset. Kept in a migration, not in seed.sql, because the
-- catalog is reference data that must exist in production too.
-- Italian steps were reviewed by hand; the media URLs point to the dataset repository,
-- pinned to a commit, until the media license is sorted out (docs/exercise-data.md).

insert into public.exercises (
  id,
  name,
  body_part,
  equipment,
  target_muscle,
  secondary_muscles,
  steps,
  gif_url,
  thumbnail_url,
  media_credit,
  source_dataset,
  source_id
)
values
  (
    'lat-pulldown',
    jsonb_build_object(
      'it', 'Lat machine',
      'en', 'Lat pulldown'
    ),
    'back',
    'cable',
    'lats',
    array['biceps', 'rhomboids', 'rear_deltoids'],
    jsonb_build_object(
      'it', jsonb_build_array(
        'Regola la puleggia in posizione alta e aggancia una barra dritta.',
        'Siediti di fronte alla macchina con i piedi ben appoggiati a terra e le ginocchia leggermente piegate.',
        'Afferra la barra con presa prona, un po’ più larga delle spalle.',
        'Inclina leggermente il busto all’indietro, tieni il petto in fuori e mantieni la naturale curva lombare.',
        'Tira la barra verso il petto guidando il movimento con i gomiti e avvicinando le scapole.',
        'Fermati un istante in basso, poi riporta lentamente la barra alla posizione di partenza.',
        'Ripeti per il numero di ripetizioni previsto.'
      ),
      'en', jsonb_build_array(
        'Adjust the cable pulley to a high position and attach a straight bar.',
        'Sit facing the cable machine with your feet flat on the ground and your knees slightly bent.',
        'Grasp the bar with an overhand grip, slightly wider than shoulder-width apart.',
        'Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.',
        'Pull the bar down towards your chest, leading with your elbows and squeezing your shoulder blades together.',
        'Pause for a moment at the bottom of the movement, then slowly return the bar to the starting position.',
        'Repeat for the desired number of repetitions.'
      )
    ),
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/0150-eYnzaCm.gif',
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/0150-eYnzaCm.jpg',
    'Gym visual',
    'hasaneyldrm/exercises-dataset',
    '0150'
  ),
  (
    'barbell-bench-press',
    jsonb_build_object(
      'it', 'Panca piana con bilanciere',
      'en', 'Barbell bench press'
    ),
    'chest',
    'barbell',
    'pectorals',
    array['triceps', 'shoulders'],
    jsonb_build_object(
      'it', jsonb_build_array(
        'Sdraiati sulla panca con i piedi ben appoggiati a terra e la schiena aderente alla panca.',
        'Afferra il bilanciere con presa prona, un po’ più larga delle spalle.',
        'Stacca il bilanciere dal rack e tienilo sopra il petto con le braccia distese.',
        'Abbassa lentamente il bilanciere verso il petto, tenendo i gomiti vicini al corpo.',
        'Fai una breve pausa quando il bilanciere sfiora il petto.',
        'Spingi il bilanciere verso l’alto fino a distendere di nuovo le braccia.',
        'Ripeti per il numero di ripetizioni previsto.'
      ),
      'en', jsonb_build_array(
        'Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.',
        'Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.',
        'Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.',
        'Lower the barbell slowly towards your chest, keeping your elbows tucked in.',
        'Pause for a moment when the barbell touches your chest.',
        'Push the barbell back up to the starting position by extending your arms.',
        'Repeat for the desired number of repetitions.'
      )
    ),
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/videos/0025-EIeI8Vf.gif',
    'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/7455efae41b330c265e7cd4b78dfa848e7ce5ebd/images/0025-EIeI8Vf.jpg',
    'Gym visual',
    'hasaneyldrm/exercises-dataset',
    '0025'
  );

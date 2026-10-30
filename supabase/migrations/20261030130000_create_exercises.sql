-- Public exercise catalog. Exercises are the same for everyone: anyone can read them
-- (even without an account), and only migrations or import scripts write them.
-- Columns mirror the app's `Exercise` type (src/features/exercises/types.ts).

create table public.exercises (
  -- Stable slug, used in the app's URLs.
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Localized texts: {"it": ..., "en": ...}; steps holds an array per language.
  -- (coalesce: a missing key gives NULL, which a CHECK would otherwise let through.)
  name jsonb not null check (
    coalesce(jsonb_typeof(name -> 'it') = 'string' and jsonb_typeof(name -> 'en') = 'string', false)
  ),
  steps jsonb not null check (
    coalesce(jsonb_typeof(steps -> 'it') = 'array' and jsonb_typeof(steps -> 'en') = 'array', false)
  ),
  -- Vocabulary keys, translated in the app (bodyPart.*, equipment.*, muscle.* in src/i18n).
  body_part text not null check (body_part ~ '^[a-z_]+$'),
  equipment text not null check (equipment ~ '^[a-z_]+$'),
  target_muscle text not null check (target_muscle ~ '^[a-z_]+$'),
  secondary_muscles text[] not null default '{}',
  -- Media is © its rights holder (see docs/exercise-data.md), shown with `media_credit`.
  gif_url text not null,
  thumbnail_url text not null,
  media_credit text not null,
  -- Where the record was imported from, to re-sync it later.
  source_dataset text not null,
  source_id text not null,
  created_at timestamptz not null default now(),
  unique (source_dataset, source_id)
);

alter table public.exercises enable row level security;

create policy "Exercises are readable by everyone"
  on public.exercises
  for select
  to anon, authenticated
  using (true);

-- No write policies: with RLS on, the app's keys can only read.
grant select on public.exercises to anon, authenticated;
revoke insert, update, delete, truncate on public.exercises from anon, authenticated;

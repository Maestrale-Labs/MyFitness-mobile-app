-- Feedback sent from the app (Profile › Send feedback), with or without an account.
-- The app can only add rows; reading is done from the Supabase dashboard.
-- No rate limit for now (Valerio's choice): if spam shows up, `install_id` tells which
-- install it comes from.

create table public.feedbacks (
  id bigint generated always as identity primary key,
  category text not null check (category in ('bug', 'feature', 'idea', 'other')),
  -- At least 10 characters, not counting spaces around; the upper bound only guards the table.
  message text not null check (char_length(btrim(message)) between 10 and 5000),
  -- The anonymous install code of the usage statistics (docs/analytics.md); null when
  -- statistics are turned off.
  install_id uuid,
  platform text check (char_length(platform) <= 16),
  app_version text check (char_length(app_version) <= 32),
  locale text check (char_length(locale) <= 8),
  -- Sent from a development build (Expo Go, simulator).
  is_dev boolean not null default false,
  created_at timestamptz not null default now()
);

create index feedbacks_created_at_idx on public.feedbacks (created_at desc);

alter table public.feedbacks enable row level security;

create policy "Anyone can send feedback"
  on public.feedbacks
  for insert
  to anon, authenticated
  with check (true);

-- Insert only, and only the columns the app sends: no reading, no changing.
revoke all on public.feedbacks from anon, authenticated;
grant insert (category, message, install_id, platform, app_version, locale, is_dev)
  on public.feedbacks to anon, authenticated;

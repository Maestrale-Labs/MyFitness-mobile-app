-- Anonymous usage statistics: installs, daily/weekly/monthly active users, retention and
-- product events (plan viewed, plan added, workout completed…).
--
-- Each install of the app generates a random id on first launch and sends it with every
-- event. No account, name, email or device identifier is collected.
--
-- The data lives in the `analytics` schema, which is not exposed by the API: the app can
-- only add events through `public.track_events`, and nobody can read them with the app's
-- keys. Reading is done from the Supabase dashboard (SQL editor), see docs/analytics.md.

create schema analytics;

revoke all on schema analytics from public, anon, authenticated;

create table analytics.events (
  id bigint generated always as identity primary key,
  install_id uuid not null,
  -- snake_case event name, e.g. app_open, plan_viewed (list in src/features/analytics/events.ts).
  name text not null check (name ~ '^[a-z][a-z0-9_]{0,63}$'),
  properties jsonb not null default '{}' check (
    jsonb_typeof(properties) = 'object' and pg_column_size(properties) <= 2048
  ),
  -- When it happened on the phone (events are queued while offline), and when it arrived.
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  platform text check (char_length(platform) <= 16),
  app_version text check (char_length(app_version) <= 32),
  locale text check (char_length(locale) <= 8),
  -- Sent from a development build (Expo Go, simulator): excluded from the views.
  is_dev boolean not null default false
);

create index events_install_id_occurred_at_idx on analytics.events (install_id, occurred_at);
create index events_name_occurred_at_idx on analytics.events (name, occurred_at);

-- Not exposed by the API, but RLS on and no policies, so it stays closed if it ever is.
alter table analytics.events enable row level security;

-- The only way in for the app. Takes a batch of up to 50 events:
--   context: {"platform": "ios", "appVersion": "1.0.0", "locale": "it", "dev": false}
--   events:  [{"name": "app_open", "occurredAt": "2026-10-30T10:00:00Z", "properties": {}}]
-- Times from a wrong phone clock (more than 30 days back or 1 day ahead) become now().
create function public.track_events(install_id uuid, context jsonb, events jsonb)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into analytics.events (
    install_id, name, properties, occurred_at, platform, app_version, locale, is_dev
  )
  select
    track_events.install_id,
    event ->> 'name',
    coalesce(event -> 'properties', '{}'::jsonb),
    case
      when sent_at between now() - interval '30 days' and now() + interval '1 day' then sent_at
      else now()
    end,
    track_events.context ->> 'platform',
    track_events.context ->> 'appVersion',
    track_events.context ->> 'locale',
    coalesce((track_events.context ->> 'dev')::boolean, false)
  from jsonb_array_elements(
      case when jsonb_typeof(track_events.events) = 'array' then track_events.events else '[]' end
    ) with ordinality as batch (event, position)
  cross join lateral (select (event ->> 'occurredAt')::timestamptz as sent_at) as times
  where batch.position <= 50;
$$;

revoke execute on function public.track_events(uuid, jsonb, jsonb) from public;
grant execute on function public.track_events(uuid, jsonb, jsonb) to anon, authenticated;

-- Reports. Days are Italian calendar days; development events are left out.

create view analytics.real_events as
select *, (occurred_at at time zone 'Europe/Rome')::date as day
from analytics.events
where not is_dev;

-- One row per install: when it was first and last seen.
create view analytics.installs as
select
  install_id,
  min(day) as first_day,
  max(day) as last_day,
  (array_agg(platform order by occurred_at desc))[1] as platform,
  (array_agg(app_version order by occurred_at desc))[1] as app_version,
  count(distinct day) as active_days
from analytics.real_events
group by install_id;

-- Per day: new installs, and active users that day, over the last 7 and the last 30 days.
create view analytics.daily_stats as
with days as (
  select generate_series(
    (select min(day) from analytics.real_events),
    (now() at time zone 'Europe/Rome')::date,
    interval '1 day'
  )::date as day
)
select
  days.day,
  (select count(*) from analytics.installs i where i.first_day = days.day) as new_installs,
  (select count(*) from analytics.installs i where i.first_day <= days.day) as total_installs,
  (select count(distinct install_id) from analytics.real_events e where e.day = days.day)
    as daily_active,
  (
    select count(distinct install_id) from analytics.real_events e
    where e.day between days.day - 6 and days.day
  ) as weekly_active,
  (
    select count(distinct install_id) from analytics.real_events e
    where e.day between days.day - 29 and days.day
  ) as monthly_active
from days
order by days.day desc;

-- Retention by install day: how many came back 1, 7 and 30 days after installing.
-- A cohort too young to measure shows null.
create view analytics.retention as
select
  i.first_day as install_day,
  count(*) as installs,
  case when i.first_day + 1 <= (now() at time zone 'Europe/Rome')::date then
    count(*) filter (where exists (
      select 1 from analytics.real_events e
      where e.install_id = i.install_id and e.day = i.first_day + 1
    ))
  end as back_day_1,
  case when i.first_day + 7 <= (now() at time zone 'Europe/Rome')::date then
    count(*) filter (where exists (
      select 1 from analytics.real_events e
      where e.install_id = i.install_id and e.day between i.first_day + 7 and i.first_day + 13
    ))
  end as back_week_2,
  case when i.first_day + 30 <= (now() at time zone 'Europe/Rome')::date then
    count(*) filter (where exists (
      select 1 from analytics.real_events e
      where e.install_id = i.install_id and e.day between i.first_day + 30 and i.first_day + 59
    ))
  end as back_month_2
from analytics.installs i
group by i.first_day
order by i.first_day desc;

-- Product events per day: how many times, and by how many installs.
create view analytics.event_counts as
select day, name, count(*) as events, count(distinct install_id) as installs
from analytics.real_events
group by day, name
order by day desc, events desc;

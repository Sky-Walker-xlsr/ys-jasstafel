-- Heartbeat: switch from one row per run to one row per day (date as key).
-- The old rows have no value; recreate the table.
drop table if exists public.heartbeat;

create table public.heartbeat (
  day        date primary key,
  created_at timestamptz not null default now()
);

alter table public.heartbeat enable row level security; -- no policies: service role only

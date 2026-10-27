-- Jasstafel – complete Supabase setup (tables, triggers, RLS).
-- Run once in the Supabase SQL editor of a fresh project. Safe to re-run.

-- ── games ────────────────────────────────────────────────────────────────
create table if not exists public.games (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  team_a_name   text not null,
  team_b_name   text not null,
  target_points integer not null default 2500 check (target_points > 0),
  strokes_a     integer not null default 0,  -- legacy banked Striche ("Übertrag")
  strokes_b     integer not null default 0,
  stroke_log    jsonb not null default '[]'::jsonb, -- Striche entries: { id, side, kind, count, createdAt }
  stroke_skip   jsonb not null default '[]'::jsonb, -- deleted auto Striche of the running Partie
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists games_user_updated_idx on public.games (user_id, updated_at desc);

-- ── rounds ───────────────────────────────────────────────────────────────
create table if not exists public.rounds (
  id           uuid primary key default gen_random_uuid(),
  game_id      uuid not null references public.games(id) on delete cascade,
  round_no     integer not null,
  input_side   text not null check (input_side in ('a', 'b')),
  input_points integer not null check (input_points between 0 and 257), -- 257 = Match
  is_match     boolean not null default false,
  is_manual    boolean not null default false,             -- tapped on the Z (100/50/20)
  multiplier   integer not null check (multiplier >= 1),
  points_a     integer not null,
  points_b     integer not null,
  created_at   timestamptz not null default now()
);
create index if not exists rounds_game_idx on public.rounds (game_id, round_no);

-- ── heartbeat (written by the weekly Worker cron with the service role) ──
create table if not exists public.heartbeat (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);

-- ── updated_at maintenance ───────────────────────────────────────────────
create or replace function public.games_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists games_updated_at on public.games;
create trigger games_updated_at
  before update on public.games
  for each row execute function public.games_set_updated_at();

create or replace function public.rounds_touch_game()
returns trigger language plpgsql as $$
begin
  update public.games set updated_at = now()
   where id = coalesce(new.game_id, old.game_id);
  return null;
end $$;

drop trigger if exists rounds_touch_game on public.rounds;
create trigger rounds_touch_game
  after insert or update or delete on public.rounds
  for each row execute function public.rounds_touch_game();

-- ── account deletion (called by the signed-in user from /konto) ──────────
-- Deletes the caller's auth user; games and rounds go with it (on delete cascade).
create or replace function public.delete_my_account()
returns void language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.games     enable row level security;
alter table public.rounds    enable row level security;
alter table public.heartbeat enable row level security; -- no policies: service role only

drop policy if exists "games: own rows" on public.games;
create policy "games: own rows" on public.games
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "rounds: rows of own games" on public.rounds;
create policy "rounds: rows of own games" on public.rounds
  for all to authenticated
  using (exists (select 1 from public.games g where g.id = game_id and g.user_id = (select auth.uid())))
  with check (exists (select 1 from public.games g where g.id = game_id and g.user_id = (select auth.uid())));

-- Gamification and exercise tracking tables

-- User gamification profiles
create table if not exists public.user_gamification (
  user_id uuid primary key,
  xp_total int not null default 0,
  xp_today int not null default 0,
  daily_goal int not null default 30,
  level int not null default 1,
  streak_days int not null default 0,
  best_streak int not null default 0,
  last_active_date date null,
  updated_at timestamptz not null default now()
);

alter table public.user_gamification enable row level security;

drop policy if exists "gamification_select_own" on public.user_gamification;
create policy "gamification_select_own"
on public.user_gamification for select
using (user_id = auth.uid());

drop policy if exists "gamification_insert_own" on public.user_gamification;
create policy "gamification_insert_own"
on public.user_gamification for insert
with check (user_id = auth.uid());

drop policy if exists "gamification_update_own" on public.user_gamification;
create policy "gamification_update_own"
on public.user_gamification for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Exercise catalog
create table if not exists public.exercise_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  duration_minutes int not null,
  difficulty int not null default 1,
  xp_reward int not null default 10,
  is_active boolean not null default true
);

alter table public.exercise_catalog enable row level security;

drop policy if exists "exercise_catalog_select_auth" on public.exercise_catalog;
create policy "exercise_catalog_select_auth"
on public.exercise_catalog for select
to authenticated
using (true);

-- Exercise sessions
create table if not exists public.exercise_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null references public.exercise_catalog(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz null,
  status text not null default 'started',
  xp_earned int not null default 0
);

create index if not exists exercise_sessions_user_started_idx
  on public.exercise_sessions (user_id, started_at desc);

alter table public.exercise_sessions enable row level security;

drop policy if exists "exercise_sessions_select_own" on public.exercise_sessions;
create policy "exercise_sessions_select_own"
on public.exercise_sessions for select
using (user_id = auth.uid());

drop policy if exists "exercise_sessions_insert_own" on public.exercise_sessions;
create policy "exercise_sessions_insert_own"
on public.exercise_sessions for insert
with check (user_id = auth.uid());

drop policy if exists "exercise_sessions_update_own" on public.exercise_sessions;
create policy "exercise_sessions_update_own"
on public.exercise_sessions for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

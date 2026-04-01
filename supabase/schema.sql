create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text not null unique,
  display_name text not null,
  photo_url text,
  bio text not null default '',
  joined_date timestamptz not null default timezone('utc', now()),
  xp integer not null default 0,
  streak integer not null default 0,
  longest_streak integer not null default 0,
  total_prs integer not null default 0,
  rank text not null default 'Bronze',
  avatar_color text not null default '#d4ff36',
  avatar jsonb not null default '{}'::jsonb,
  currency integer not null default 0,
  total_workouts integer not null default 0,
  referral_code text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null,
  label text not null,
  tone text not null,
  primary key (user_id, badge_id)
);

create table if not exists public.routines (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null,
  accent text not null,
  exercise_ids text[] not null default '{}'
);

create table if not exists public.workouts (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes integer not null,
  total_sets integer not null,
  total_reps integer not null,
  total_volume integer not null,
  xp_awarded integer not null,
  pr_highlights text[] not null default '{}',
  template_id text
);

create table if not exists public.workout_exercises (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_id text not null references public.workouts (id) on delete cascade,
  exercise_id text not null,
  name text not null,
  notes text
);

create table if not exists public.workout_sets (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_exercise_id text not null references public.workout_exercises (id) on delete cascade,
  reps integer not null,
  weight numeric not null
);

create table if not exists public.progress_snapshots (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  date timestamptz not null,
  total_volume integer not null,
  workout_count integer not null,
  strength_score integer not null,
  bodyweight numeric,
  prs integer not null default 0
);

create table if not exists public.user_quests (
  id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  cadence text not null,
  goal_type text not null,
  target integer not null,
  progress integer not null default 0,
  xp_reward integer not null,
  currency_reward integer not null,
  icon_label text not null,
  completed boolean not null default false,
  audience text not null,
  primary key (user_id, id)
);

create table if not exists public.user_rewards (
  id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text not null,
  kind text not null,
  rarity text not null,
  cost integer not null,
  unlocked boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.user_cosmetics (
  id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  slot text not null,
  description text not null,
  tone text not null,
  accent_tone text,
  unlock_source text not null,
  pr_threshold integer,
  unlocked boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.friendships (
  id text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id text not null,
  status text not null
);

create table if not exists public.posts (
  id text primary key,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null,
  type text not null,
  title text not null,
  content text not null,
  chips text[] not null default '{}',
  like_user_ids text[] not null default '{}',
  comment_ids text[] not null default '{}'
);

create table if not exists public.post_comments (
  id text primary key,
  post_id text not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null,
  content text not null
);

alter table public.profiles enable row level security;
alter table public.user_badges enable row level security;
alter table public.routines enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_sets enable row level security;
alter table public.progress_snapshots enable row level security;
alter table public.user_quests enable row level security;
alter table public.user_rewards enable row level security;
alter table public.user_cosmetics enable row level security;
alter table public.friendships enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;

create policy "profiles own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "user_badges own rows" on public.user_badges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "routines own rows" on public.routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workouts own rows" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_exercises own rows" on public.workout_exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_sets own rows" on public.workout_sets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "progress own rows" on public.progress_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "quests own rows" on public.user_quests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "rewards own rows" on public.user_rewards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cosmetics own rows" on public.user_cosmetics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "friendships own rows" on public.friendships
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "posts own rows" on public.posts
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create policy "comments own rows" on public.post_comments
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

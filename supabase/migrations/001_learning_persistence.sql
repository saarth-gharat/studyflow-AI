-- Apply this migration manually in Supabase SQL Editor.
-- The repository has no configured migration runner.
-- This migration is intentionally re-runnable and does not delete data.

create table if not exists public.saved_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('video', 'note', 'learning_path', 'topic')),
  resource_id text not null,
  title text not null,
  description text,
  thumbnail_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, resource_type, resource_id)
);

create index if not exists saved_resources_user_created_idx
  on public.saved_resources (user_id, created_at desc);

create table if not exists public.activity_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('video_view', 'note_generated', 'quiz_started', 'quiz_completed', 'tutor_session', 'learning_path_generated', 'learning_path_topic_opened')),
  subject text not null,
  topic text,
  resource_id text,
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_history_user_created_idx
  on public.activity_history (user_id, created_at desc);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  title text not null,
  description text,
  source text not null default 'gemini' check (source in ('gemini', 'manual')),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_paths_user_updated_idx
  on public.learning_paths (user_id, updated_at desc);

create table if not exists public.learning_path_topics (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  order_index integer not null,
  stage text not null check (stage in ('beginner', 'intermediate', 'advanced')),
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (learning_path_id, order_index)
);

create index if not exists learning_path_topics_path_order_idx
  on public.learning_path_topics (learning_path_id, order_index);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  topic text,
  score integer not null,
  total_questions integer not null,
  percentage integer not null,
  answers jsonb not null default '{}'::jsonb,
  questions_snapshot jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_completed_idx
  on public.quiz_attempts (user_id, completed_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quiz_attempts'::regclass
      and conname = 'quiz_attempts_score_nonnegative'
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_score_nonnegative
      check (score >= 0) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quiz_attempts'::regclass
      and conname = 'quiz_attempts_total_questions_positive'
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_total_questions_positive
      check (total_questions > 0) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quiz_attempts'::regclass
      and conname = 'quiz_attempts_score_lte_total'
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_score_lte_total
      check (score <= total_questions) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.quiz_attempts'::regclass
      and conname = 'quiz_attempts_percentage_range'
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_percentage_range
      check (percentage between 0 and 100) not valid;
  end if;
end
$$;

create or replace function public.set_learning_paths_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_paths_set_updated_at on public.learning_paths;

create trigger learning_paths_set_updated_at
before update on public.learning_paths
for each row
execute function public.set_learning_paths_updated_at();

alter table public.saved_resources enable row level security;
alter table public.activity_history enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_topics enable row level security;
alter table public.quiz_attempts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_resources' and policyname = 'Users manage their saved resources') then
    execute 'create policy "Users manage their saved resources" on public.saved_resources for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'activity_history' and policyname = 'Users read their activity history') then
    execute 'create policy "Users read their activity history" on public.activity_history for select using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'activity_history' and policyname = 'Users create their activity history') then
    execute 'create policy "Users create their activity history" on public.activity_history for insert with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learning_paths' and policyname = 'Users manage their learning paths') then
    execute 'create policy "Users manage their learning paths" on public.learning_paths for all using (auth.uid() = user_id) with check (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'learning_path_topics' and policyname = 'Users access their learning path topics') then
    execute 'create policy "Users access their learning path topics" on public.learning_path_topics for all using (exists (select 1 from public.learning_paths p where p.id = learning_path_id and p.user_id = auth.uid())) with check (exists (select 1 from public.learning_paths p where p.id = learning_path_id and p.user_id = auth.uid()))';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users read their quiz attempts') then
    execute 'create policy "Users read their quiz attempts" on public.quiz_attempts for select using (auth.uid() = user_id)';
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'Users create their quiz attempts') then
    execute 'create policy "Users create their quiz attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id)';
  end if;
end
$$;

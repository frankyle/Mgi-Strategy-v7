-- ============================================================
-- Setup Match Grader — FULL consolidated schema
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run even if you already ran earlier versions of this
-- migration — every step checks before it acts, so nothing gets
-- duplicated or wiped.
-- ============================================================

-- 1. Base table (only created if it doesn't exist yet)
create table if not exists public.setup_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  htf_timeframe text not null,
  htf_level_type text not null,
  htf_level_status text not null,
  htf_reaction text not null,
  htf_direction text not null,
  ltf_structure_break boolean not null default false,
  ltf_direction text not null,
  grade text not null,
  created_at timestamptz not null default now()
);

-- 2. Bring an existing table up to the current column set
alter table public.setup_matches
  add column if not exists ltf_ema200_reclaim boolean not null default false;

alter table public.setup_matches
  add column if not exists ltf_fvg_tagged boolean not null default false;

alter table public.setup_matches
  add column if not exists htf_chart_url text;

alter table public.setup_matches
  add column if not exists ltf_chart_url text;

-- Phase 2 changed from "CHoCH + 200 EMA reclaim" to an ICT weekly-bias +
-- session-liquidity-grab model: which side of the weekly open you're
-- trading (blue/buy above it, red/sell below it), and whether a session
-- liquidity grab (Asian, New York, or both) lined up with that bias.
alter table public.setup_matches
  add column if not exists ltf_weekly_bias text;

alter table public.setup_matches
  add column if not exists ltf_session_grab text not null default 'none';

-- 3. Migrate off the old FVG-gates-the-grade column, if it's still there
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'setup_matches' and column_name = 'ltf_fvg_filled'
  ) then
    update public.setup_matches set ltf_fvg_tagged = ltf_fvg_filled;
    alter table public.setup_matches drop column ltf_fvg_filled;
  end if;
end $$;

-- 4. Row Level Security — each user only ever sees their own logged setups
alter table public.setup_matches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'setup_matches' and policyname = 'Users can view their own setup matches'
  ) then
    create policy "Users can view their own setup matches"
      on public.setup_matches for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'setup_matches' and policyname = 'Users can insert their own setup matches'
  ) then
    create policy "Users can insert their own setup matches"
      on public.setup_matches for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'setup_matches' and policyname = 'Users can delete their own setup matches'
  ) then
    create policy "Users can delete their own setup matches"
      on public.setup_matches for delete
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'setup_matches' and policyname = 'Users can update their own setup matches'
  ) then
    create policy "Users can update their own setup matches"
      on public.setup_matches for update
      using (auth.uid() = user_id);
  end if;
end $$;

-- 5. Index to speed up the ORDER BY created_at DESC in SetupMatchGraderService.jsx
create index if not exists setup_matches_user_created_idx
  on public.setup_matches (user_id, created_at desc);

-- 6. Chart screenshots use the existing "mgi-images" Storage bucket your MGI
--    Strategy journal already uploads to — no new bucket needed.

-- ============================================================
-- Weekly Report table — run once in Supabase: SQL Editor > New Query
-- Ideas "sent to report" are MOVED here and removed from trader_ideas.
-- Safe to run more than once.
-- ============================================================
create table if not exists public.trader_idea_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_id text,                       -- id the idea had in trader_ideas
  date date not null,                     -- the idea's trading date (drives the week)
  pair text not null,
  signal text,
  data jsonb not null default '{}'::jsonb, -- full copy of the idea (caption, journal, chart URLs…)
  reported_at timestamptz not null default now()
);

create index if not exists trader_idea_reports_user_date_idx
  on public.trader_idea_reports (user_id, date desc);

alter table public.trader_idea_reports enable row level security;

drop policy if exists "reports_select_own" on public.trader_idea_reports;
create policy "reports_select_own" on public.trader_idea_reports
  for select using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.trader_idea_reports;
create policy "reports_insert_own" on public.trader_idea_reports
  for insert with check (auth.uid() = user_id);

drop policy if exists "reports_delete_own" on public.trader_idea_reports;
create policy "reports_delete_own" on public.trader_idea_reports
  for delete using (auth.uid() = user_id);

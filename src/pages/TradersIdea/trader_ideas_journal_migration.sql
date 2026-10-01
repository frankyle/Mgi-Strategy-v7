-- ============================================================
-- Traders Idea journal — stores the journal block with each idea
-- Run in Supabase: Project > SQL Editor > New Query.
-- Safe to run more than once.
--
-- journal holds: entry_type (daily/weekly), fib (monthly/weekly/daily
-- swing high, low, level, aligned), A-setup checks, mood, followed_plan,
-- result_r and notes. Existing RLS policies on trader_ideas still apply.
-- ============================================================
alter table public.trader_ideas
  add column if not exists journal jsonb;

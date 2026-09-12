-- ============================================================
-- Trade Outcome — mid-week / end-of-week result for a logged setup
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run more than once.
--
-- Lets you go back to a setup you already graded and attach how the trade
-- actually played out (win/loss/breakeven), a result screenshot, and a
-- short note. Once a setup is published, this shows up on the public
-- Trade Blog too — so friends see the call AND the outcome.
-- ============================================================

alter table public.setup_matches
  add column if not exists outcome_status text
    check (outcome_status in ('pending', 'win', 'loss', 'breakeven'))
    not null default 'pending';

alter table public.setup_matches
  add column if not exists outcome_notes text;

alter table public.setup_matches
  add column if not exists outcome_image_url text;

alter table public.setup_matches
  add column if not exists outcome_updated_at timestamptz;

-- The existing "Anyone can view published setup matches" policy already
-- covers select * on published rows, so the new outcome_* columns are
-- automatically visible on the public blog too — nothing else to change.

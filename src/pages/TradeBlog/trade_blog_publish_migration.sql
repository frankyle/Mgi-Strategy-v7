-- ============================================================
-- Trade Blog — publish support for setup_matches
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run more than once — every step checks before it acts.
--
-- This lets you flip a logged Setup Match Grader entry to "published",
-- which makes it visible on your public share link at /blog/<your-user-id>
-- WITHOUT requiring the visitor to sign in. Everything else about
-- setup_matches (your own private view, insert, delete, update) is
-- untouched — this only adds one new, narrow public policy.
-- ============================================================

-- 1. Columns needed to publish a setup as a trade idea
alter table public.setup_matches
  add column if not exists is_published boolean not null default false;

alter table public.setup_matches
  add column if not exists published_at timestamptz;

alter table public.setup_matches
  add column if not exists caption text;

-- 2. Public read access — ONLY for rows the owner has explicitly published.
--    Anonymous/public visitors can never see unpublished setups, and can
--    never insert, update, or delete anything.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'setup_matches' and policyname = 'Anyone can view published setup matches'
  ) then
    create policy "Anyone can view published setup matches"
      on public.setup_matches for select
      to anon, authenticated
      using (is_published = true);
  end if;
end $$;

-- 3. Index to speed up the public blog query (by author, published only, newest first)
create index if not exists setup_matches_published_idx
  on public.setup_matches (user_id, is_published, published_at desc);

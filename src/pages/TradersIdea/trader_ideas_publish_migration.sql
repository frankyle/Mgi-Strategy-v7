-- ============================================================
-- Traders Idea Blog — publish support for trader_ideas
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run more than once — every step checks before it acts.
--
-- Mirrors trade_blog_publish_migration.sql (the Setup Match Grader ->
-- Trade Blog flow) but for the trader_ideas table. Lets you flip a
-- logged Traders Idea entry to "published", which makes it visible on
-- your public share link at /trader-blog/<your-user-id> WITHOUT
-- requiring the visitor to sign in. Everything else about trader_ideas
-- (your own private view, insert, delete, update) is untouched — this
-- only adds one new, narrow public policy.
-- ============================================================

-- 1. Columns needed to publish an idea to the Traders Blog
alter table public.trader_ideas
  add column if not exists is_published boolean not null default false;

alter table public.trader_ideas
  add column if not exists published_at timestamptz;

alter table public.trader_ideas
  add column if not exists caption text;

-- "package" is a display-only label (starter / pro / mentorship) shown
-- as a badge on the published card — it does NOT restrict who can view
-- the post. The public link stays open to anyone who has it, same as
-- the Trade Blog.
alter table public.trader_ideas
  add column if not exists package text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'trader_ideas_package_check'
  ) then
    alter table public.trader_ideas
      add constraint trader_ideas_package_check
      check (package is null or package in ('starter', 'pro', 'mentorship'));
  end if;
end $$;

-- 2. Public read access — ONLY for rows the owner has explicitly published.
--    Anonymous/public visitors can never see unpublished ideas, and can
--    never insert, update, or delete anything.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trader_ideas' and policyname = 'Anyone can view published trader ideas'
  ) then
    create policy "Anyone can view published trader ideas"
      on public.trader_ideas for select
      to anon, authenticated
      using (is_published = true);
  end if;
end $$;

-- 3. Index to speed up the public blog query (by author, published only, newest first)
create index if not exists trader_ideas_published_idx
  on public.trader_ideas (user_id, is_published, published_at desc);

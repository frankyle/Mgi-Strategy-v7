-- ============================================================
-- Roles — admin vs. regular member
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run more than once — every step checks before it acts.
--
-- This adds a public.profiles table (one row per signed-up user) with a
-- "role" column, defaulting every new signup to 'user'. It does NOT touch
-- setup_matches, personal/funded trades, or anything else you already
-- have — those keep working exactly as they do today.
-- ============================================================

-- 1. The table itself
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2. Everyone can read their own profile (needed so the app can check
--    "am I admin?" right after signing in). No one can read anyone
--    else's row, and no one can write role directly through the API —
--    only you, from the SQL editor, promote an account to admin (step 5).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles for select
      to authenticated
      using (auth.uid() = id);
  end if;
end $$;

-- 3. Auto-create a profile row the moment someone signs up, pulling
--    full_name/phone from the metadata SignUp.jsx already sends.
--    security definer is required so this trigger (running as the
--    Postgres owner) is allowed to insert into public.profiles even
--    though the person signing up has no rights on that table yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Backfill — creates a profile for any account that signed up BEFORE
--    this migration ran (e.g. your own existing account).
insert into public.profiles (id, full_name, phone)
select id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'phone'
from auth.users
where id not in (select id from public.profiles);

-- 5. Promote yourself to admin — run this ONE line by hand, once, with
--    your own user id. Find it in Supabase: Authentication > Users,
--    click your account, copy "User UID".
--
--    update public.profiles set role = 'admin' where id = 'paste-your-user-id-here';
--
--    Then put that same id in your .env as REACT_APP_ADMIN_USER_ID —
--    that's what the app uses to know whose published signals to show
--    everyone else.

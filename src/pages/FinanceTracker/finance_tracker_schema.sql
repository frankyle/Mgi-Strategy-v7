-- ============================================================
-- Finance Tracker — FULL consolidated schema
-- Run this in Supabase: Project > SQL Editor > New Query
-- Safe to run even if you already ran an earlier version of this
-- migration — every step checks before it acts, so nothing gets
-- duplicated or wiped.
--
-- Covers: day-to-day income & expenses (Personal vs Family usage,
-- with Planned / Half Paid / Paid status), loans you've borrowed
-- (from people, banks, or loan companies) with interest + payments,
-- and investments (e.g. dehydration machine, prop firm account)
-- with contributions over time.
-- ============================================================

-- ---------------------------------------------------------------
-- 1. Transactions (income & expenses)
-- ---------------------------------------------------------------
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('Income', 'Expense')),
  usage text check (usage in ('Personal', 'Family')),
  category text not null,
  amount numeric not null default 0,
  payment_method text,
  payment_status text not null default 'Paid' check (payment_status in ('Planned', 'Half Paid', 'Paid')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.finance_transactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_transactions' and policyname = 'Users can view their own transactions'
  ) then
    create policy "Users can view their own transactions"
      on public.finance_transactions for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_transactions' and policyname = 'Users can insert their own transactions'
  ) then
    create policy "Users can insert their own transactions"
      on public.finance_transactions for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_transactions' and policyname = 'Users can update their own transactions'
  ) then
    create policy "Users can update their own transactions"
      on public.finance_transactions for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_transactions' and policyname = 'Users can delete their own transactions'
  ) then
    create policy "Users can delete their own transactions"
      on public.finance_transactions for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_transactions_user_date_idx
  on public.finance_transactions (user_id, date desc);

-- ---------------------------------------------------------------
-- 2. Loans (money YOU borrow — from people, banks, or loan companies)
-- ---------------------------------------------------------------
create table if not exists public.finance_loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lender_name text not null,
  lender_type text not null default 'Individual' check (lender_type in ('Individual', 'Bank', 'Loan Company', 'Other')),
  principal numeric not null default 0,
  interest_rate numeric not null default 0,
  interest_type text not null default 'monthly' check (interest_type in ('flat', 'monthly', 'annual')),
  date_borrowed date not null,
  due_date date,
  status text not null default 'Active' check (status in ('Active', 'Overdue', 'Paid')),
  paid_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.finance_loans enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loans' and policyname = 'Users can view their own loans'
  ) then
    create policy "Users can view their own loans"
      on public.finance_loans for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loans' and policyname = 'Users can insert their own loans'
  ) then
    create policy "Users can insert their own loans"
      on public.finance_loans for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loans' and policyname = 'Users can update their own loans'
  ) then
    create policy "Users can update their own loans"
      on public.finance_loans for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loans' and policyname = 'Users can delete their own loans'
  ) then
    create policy "Users can delete their own loans"
      on public.finance_loans for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_loans_user_created_idx
  on public.finance_loans (user_id, created_at desc);

-- ---------------------------------------------------------------
-- 3. Loan repayments (payments YOU make toward a loan)
-- ---------------------------------------------------------------
create table if not exists public.finance_loan_repayments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.finance_loans(id) on delete cascade,
  date date not null,
  amount numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

alter table public.finance_loan_repayments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loan_repayments' and policyname = 'Users can view their own repayments'
  ) then
    create policy "Users can view their own repayments"
      on public.finance_loan_repayments for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loan_repayments' and policyname = 'Users can insert their own repayments'
  ) then
    create policy "Users can insert their own repayments"
      on public.finance_loan_repayments for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_loan_repayments' and policyname = 'Users can delete their own repayments'
  ) then
    create policy "Users can delete their own repayments"
      on public.finance_loan_repayments for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_loan_repayments_loan_idx
  on public.finance_loan_repayments (loan_id, date desc);

-- ---------------------------------------------------------------
-- 4. Investments (e.g. Dehydration Machine, Prop Firm Account)
-- ---------------------------------------------------------------
create table if not exists public.finance_investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  target_amount numeric not null default 0,
  status text not null default 'Planning' check (status in ('Planning', 'In Progress', 'Active', 'Completed')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.finance_investments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investments' and policyname = 'Users can view their own investments'
  ) then
    create policy "Users can view their own investments"
      on public.finance_investments for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investments' and policyname = 'Users can insert their own investments'
  ) then
    create policy "Users can insert their own investments"
      on public.finance_investments for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investments' and policyname = 'Users can update their own investments'
  ) then
    create policy "Users can update their own investments"
      on public.finance_investments for update
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investments' and policyname = 'Users can delete their own investments'
  ) then
    create policy "Users can delete their own investments"
      on public.finance_investments for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_investments_user_created_idx
  on public.finance_investments (user_id, created_at desc);

-- ---------------------------------------------------------------
-- 5. Investment contributions (money you put into an investment over time)
-- ---------------------------------------------------------------
create table if not exists public.finance_investment_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  investment_id uuid not null references public.finance_investments(id) on delete cascade,
  date date not null,
  amount numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

alter table public.finance_investment_contributions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investment_contributions' and policyname = 'Users can view their own contributions'
  ) then
    create policy "Users can view their own contributions"
      on public.finance_investment_contributions for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investment_contributions' and policyname = 'Users can insert their own contributions'
  ) then
    create policy "Users can insert their own contributions"
      on public.finance_investment_contributions for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'finance_investment_contributions' and policyname = 'Users can delete their own contributions'
  ) then
    create policy "Users can delete their own contributions"
      on public.finance_investment_contributions for delete
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists finance_investment_contributions_investment_idx
  on public.finance_investment_contributions (investment_id, date desc);

-- ---------------------------------------------------------------
-- 6. Seed the two investments you're currently tracking, one time only,
--    per user on their first visit — handled from the app instead of here,
--    since seeding needs a real auth.uid() to attach the rows to. No
--    action needed in this script for that.
-- ---------------------------------------------------------------

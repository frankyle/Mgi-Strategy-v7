# MGI Strategy — Trading Journal + Signals

A personal trading journal (setup grading, personal/funded account tracking,
finance tracker) with a members-facing **Signals** feed: the admin publishes
graded setups from the journal, and every other signed-up account sees only
those published signals — not the admin's private journal tools.

## Setup

```bash
npm install    # or yarn
cp .env.example .env
```

Fill in `.env`:
- `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` — from Supabase
  Project Settings > API.
- `REACT_APP_ADMIN_USER_ID` — see "Turning on roles" below.

```bash
npm start      # or yarn start
```

## Turning on roles (do this once)

1. In Supabase: **SQL Editor > New Query**, paste and run
   `src/components/authentication/profiles_role_migration.sql`.
   It's safe to re-run — every step checks before it acts.
2. Sign up (or use your existing account) through the app as normal.
3. In Supabase: **Authentication > Users**, click your account, copy the
   **User UID**.
4. Back in the SQL Editor, run:
   ```sql
   update public.profiles set role = 'admin' where id = 'paste-your-user-id-here';
   ```
   **This one line is what actually makes you admin.** Nothing in `.env`
   affects it — the app checks the `role` column on `profiles`, not any
   environment variable.
5. Separately, if you want your published Trade Blog setups to be the ones
   shown on the public `/dashboard/signals` feed, put the same UID in `.env`
   as `REACT_APP_ADMIN_USER_ID` (and in Vercel's Project Settings >
   Environment Variables if deployed there), then redeploy/restart. This
   step is about **which account's signals get shown**, not about who gets
   admin access — skip it and you're still admin from step 4.

From then on:
- **Your account** (the one you just promoted) sees the full app — Dashboard,
  Setup Match Grader, Trade Blog, Traders Ideas, Finance Tracker, Personal
  and Funded Accounts — at `/dashboard`.
- **Every other account** that signs up only ever sees **Signals** — the
  setups you've published from Trade Blog, restyled as a read-only feed.
  They're redirected there automatically even if they try an admin URL
  directly.

To promote a second admin later, run the same `update` line with their user
id — no code changes needed.

## About the committed `.env`

An earlier version of this repo had `.env` committed to git. It's now in
`.gitignore` so future commits won't include it, but **that key has already
been public** on GitHub. It's the Supabase **anon** key (not the secret
service-role key), which is meant to be used in client-side code — it's only
a real problem if your Supabase tables don't have Row Level Security (RLS)
turned on, since the anon key on its own can't bypass RLS. Worth doing
regardless:
- Supabase dashboard → **Authentication/Database → Policies** — confirm RLS
  is enabled on every table (the migration files in this repo already set
  policies on `setup_matches` and the new `profiles` table).
- If you ever find the **service_role** key (not this one) exposed anywhere,
  rotate it immediately in Supabase Project Settings > API — that key
  bypasses RLS entirely.

## What changed from the original journal app

- Added `profiles` table + `role` column (`src/components/authentication/profiles_role_migration.sql`).
- Added `src/hooks/useAuthProfile.js` — shared session+role hook used by
  `ProtectedRoute`, `AppSidebar`, and `DashboardLayout` (previously each
  had its own copy of the same Supabase auth wiring).
- `ProtectedRoute` now accepts an `adminOnly` prop; non-admins hitting an
  admin route are redirected to `/dashboard/signals`.
- New `/dashboard/signals` route and page (`src/pages/SignalsFeed`) — the
  redesigned, read-only feed regular members land on.
- `AppSidebar` menu items are now filtered by role — admin sees everything,
  everyone else sees only "Signals".
- Restyled `Dashboard.js` (and its subcomponents) and everything blog-related
  (`TradeIdeaCard`, `TradeBlog`, `PublicTradeBlog`, `SignalsFeed`) in a dark
  "trading terminal" look. Setup Match Grader, Finance Tracker, Personal/
  Funded Account pages are untouched — same as before.
- **The whole signed-in app moved from `/` to `/dashboard`.** `/` is now a
  public marketing homepage (`src/pages/Landing.jsx`, ported and rebranded
  from a separate TriCore Signals prototype) — visiting the site with no
  session shows that page instead of a login wall; visiting it *with* a
  session redirects straight to `/dashboard` (`src/pages/RootRoute.jsx`).
  `/pricing` is public too. Everything else under `/dashboard/*` still
  requires sign-in exactly as before.

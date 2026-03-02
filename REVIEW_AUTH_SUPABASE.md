**NITK Nexus — Authentication & Supabase Review (production readiness)**

Date: 2026-03-01

Overview
- I audited the app's auth & registration flows, OAuth handling, core Supabase hooks, and related UI wiring.
- I fixed several runtime/build errors and implemented a production-oriented auth flow: strict validation for email/password registration, a `/complete-profile` page for OAuth users, and stronger redirect/guard logic on `/dashboard`.

Summary of changes already applied (done by me)
- Fixed missing React imports causing runtime ReferenceError.
- Repaired malformed JSX in `wallet-tab.tsx` (extra closing tags). 
- Removed accidental static usage of undefined `studentProfile` in `overview-tab.tsx`.
- Wired CTA email input (landing) to `/get-started?email=` and prefilling logic.
- Implemented strong client-side validation on `/get-started` (email domain, password, required profile fields, min 3 interests).
- Added `complete-profile` page for OAuth users that pre-fills name/email and requires required profile data before writing to DB.
- Reworked `useCurrentStudent` to NOT auto-create profiles anymore (prevents loops) and to load profile safely.
- Added profile existence checks on sign-in and dashboard to route users to `/complete-profile` if needed.

Files touched/added
- Modified: `app/get-started/page.tsx`, `app/sign-in/page.tsx`, `app/dashboard/page.tsx`, `hooks/use-current-student.ts`, `components/cta-section.tsx`, `components/navbar.tsx`, `components/footer.tsx` and several dashboard components.
- Added: `app/complete-profile/page.tsx`, `AUTH_FLOW_PRODUCTION.md`, `REVIEW_AUTH_SUPABASE.md`

Immediate correctness checklist (what I verified)
- Signup flow (email/password): validation prevents weak/mismatched passwords, enforces college email domain.
- Signup final step inserts a complete `students` row (no `|| null` for required fields).
- Sign-in validates profile existence; if absent the user is prompted and routed appropriately.
- OAuth login flows trigger `/complete-profile` for missing profile rather than auto-creating and looping.
- Dashboard auth guard checks both session and profile existence.

Outstanding issues, risks, and recommendations (production)
1) Relying on `email` to map auth user → student row is fragile
   - Recommended: add `auth_id` (Supabase user id) field to `students` and populate it at profile creation / link stage. Use `auth_id` for joins and RLS policies instead of email.

2) Race conditions between `auth.signUp()` and profile insert
   - Currently code calls `supabase.auth.signUp()` (client) then inserts profile row in a later request. If email confirmation is required, the user may not be able to complete profile until confirmed. Consider using a server-side transactional RPC that creates both auth & profile (or completes profile after email confirmation) or explicitly handle the email-confirmation flow in UI.

3) Missing server-side validations
   - Client-side checks are necessary but not sufficient. Enforce constraints in Postgres schema and via RLS/Triggers: NOT NULL constraints, domain check for email, min-length checks, phone format via CHECK, interests array length >= 3 (or pre-validate on server).

4) RLS and least privilege
   - Add Row Level Security for `students` and other personal tables. Example policies:
     - `students`: allow SELECT/UPDATE for authenticated user where `auth.uid() = auth_id` (or email matches if using email, but prefer auth_id).
     - Allow INSERT only for authenticated users with `auth.uid() = new.auth_id` or via a server function.
   - Avoid exposing service_role operations to client.

5) OAuth mapping & idempotency
   - When an OAuth user returns, check by `auth_id` first. If `students` row exists with same email but different `auth_id`, require linking UI rather than auto-inserting a duplicate.

6) Email verification handling
   - Decide if you require confirmed emails for dashboard access. If yes, block profile creation or dashboard access until `user.confirmed_at` is set (check Supabase session metadata). If no, ensure you have fraud mitigation.

7) Use server-side functions for sensitive multi-step operations
   - Example: a single RPC to create profile + initial ledger rows or to link OAuth account to profile in one atomic operation.

8) Audit logging and monitoring
   - Create an audit table or use Supabase triggers to log profile creations, logins, and critical events.

9) Sanitization and validation of user data
   - Trim strings and limit lengths before DB insert; escape/stores user input safely (driver library does parameterized queries — good). Validate `interests` values against allowed set on server-side.

10) Session lifetime and refresh
   - Confirm Supabase session refresh behavior in your environment (Turbopack/SSR). Add UI to gracefully handle token expiry and re-login.

11) Client exposes anon key — plan for server-side admin tasks
   - Keep service_role secret only on server; for inserts/updates that must be enforced by server, use edge functions or server components.

12) Tests and e2e
   - Add automated E2E tests for: email registration (happy/failure), OAuth registration, complete-profile flow, sign-in edge cases, dashboard access.

Supabase / project configuration checklist I need from you (or you must verify in your Supabase project)
- OAuth provider setup: enable **Google** and **GitHub** providers and provide the authorized redirect URLs for both development and production (e.g. `http://localhost:3000`, `https://yourdomain.com`, and any `/api/auth/callback` URLs if used). I need to know the exact redirect URI(s) configured.
- Confirm whether you require **email verification** (email confirm) before granting dashboard access.
- Provide current `students` table DDL (SHOW create table or SQL DDL). I need to verify columns and types (particularly whether `auth_id` exists) and constraints.
- Provide any existing **RLS policies** for `students`, `registrations`, `points`, `certificates` tables.
- If you use server-side functions (RPCs) for profile creation or linking, share their names/definitions.

Concrete schema & policy suggestions (example)
- Add `auth_id text UNIQUE NOT NULL` to `students`.
- Make `email text UNIQUE NOT NULL`, `name text NOT NULL`, `branch text NOT NULL`, `year int NOT NULL`, `hostel text NOT NULL`, `phone text NOT NULL`, `interests text[] NOT NULL`.
- Example RLS for `students` (pseudo-SQL):
  - enable rls on students;
  - policy "select_own" for select using (auth.uid() = auth_id);
  - policy "insert_own" for insert with check (auth.uid() = new.auth_id);
  - policy "update_own" for update using (auth.uid() = auth_id);

Recommended production improvements (priority)
1. Add `auth_id` column and migrate existing rows (map by email). Update code to write `auth_id` at profile creation.
2. Add strict DB constraints and RLS policies.
3. Implement server-side RPC for account+profile creation or linking to avoid race conditions. Alternatively require email confirmation before final profile create.
4. Add logging & alerting for signups and profile creation failures.
5. Add e2e tests and CI hooks that run them on PRs.

Actionable next steps I can implement now (tell me which you want me to do next)
- A: Add `auth_id` to `students` schema migration SQL and update code to populate it at profile creation.
- B: Add example RLS policies SQL (you can copy them to Supabase SQL editor) and adjust client code to use `auth_id` mapping.
- C: Implement server-side RPC (Supabase function) to atomically create a student record and perform initial inserts.
- D: Add E2E test stubs using Playwright or Cypress for the main auth flows.
- E: Harden `useCurrentStudent` to prefer `auth_id` checks and cache gracefully.

What I need from you to proceed with any DB-level changes
- Permission to add migration SQL to your repo (I will write SQL only, not run anything in your Supabase project).
- Current `students` table DDL and any RLS policies (so I can craft migration and safe data-migration steps).
- The list of domains/redirect URIs you will use in production (so I can include them in OAuth checklist).

Testing checklist (I will run/prepare if you want):
- Sign-up (email) with correct domain → full profile → dashboard
- Sign-up (email) with wrong domain → error
- Password mismatch → show error
- OAuth (google) with new user → redirected to /complete-profile → complete profile → dashboard
- OAuth with existing linked profile → dashboard
- Sign-in with existing user → dashboard
- Attempt dashboard as unauthenticated → redirect to sign-in
- Attempt dashboard as authenticated but no profile → redirect to /complete-profile

Report file created and next-step suggestions above.

If you want, I can now:
- produce SQL migration to add `auth_id` and NOT NULL constraints + backfill script, or
- produce RLS policies + sample RPC for atomic create, or
- produce E2E test suite scaffolding.

Tell me which of the above you want me to implement next, or grant me the `students` table DDL and production domain list and I'll prepare migration + RLS SQL and a test plan.

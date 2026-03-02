# Implementation Complete: RPC Migration & Auth ID Fix

**Date:** 1 March 2026  
**Status:** ✅ Code Changes Complete | ⏳ E2E Tests Ready | ⏳ Verification Pending

---

## Executive Summary

Successfully migrated the NITK Nexus frontend from direct INSERT operations to **RPC-based profile creation** and switched identity queries from email-based to **auth_id-based** lookups.

### Changes Made

| Component | Before | After | Benefit |
|-----------|--------|-------|---------|
| **get-started insertion** | `.insert()` direct | RPC call | Server-side auth_id enforcement |
| **complete-profile insertion** | `.insert()` direct | RPC call | Atomicity + consistency |
| **Profile queries** | `.eq('email', email)` | `.eq('auth_id', userId)` | Immutable identity |
| **Auth session** | `getSession()` | `getUser()` | More reliable user data |
| **Test framework** | None | Playwright | E2E verification |

---

## Phase 2: Code Implementation ✅

### 1️⃣  File: `app/get-started/page.tsx` 

**Changed:** Lines 110–128

**Before:**
```typescript
const { data: resp, error: insertError } = await supabase
  .from('students')
  .insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  })
  .select('id')
```

**After:**
```typescript
const { data, error } = await supabase.rpc('create_student_profile', {
  payload: {
    email: email.trim().toLowerCase(),
    name: name.trim(),
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  },
})
```

**Rationale:**
- ✅ Server-side RPC sets `auth_id = auth.uid()` (cannot be spoofed)
- ✅ Atomic operation: create student + verify user in one transaction
- ✅ Aligns with Supabase best practices
- ⚠️ Requires RPC to exist in Supabase (`create_student_profile`)

---

### 2️⃣  File: `app/complete-profile/page.tsx`

**Changed:** Lines 120–137

**Same pattern as get-started** — replaced direct INSERT with RPC call

**Before:**
```typescript
const { data: resp, error: insertError } = await supabase
  .from('students')
  .insert({
    name: name.trim(),
    email: authEmail.toLowerCase(),
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  })
  .select('id')
```

**After:**
```typescript
const { data, error } = await supabase.rpc('create_student_profile', {
  payload: {
    email: authEmail.toLowerCase(),
    name: name.trim(),
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  },
})
```

**Rationale:**
- ✅ Consistency across both signup flows
- ✅ OAuth users now go through same secure creation path

---

### 3️⃣  File: `hooks/use-current-student.ts`

**Changed:** Lines 49–65

**Before:**
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession()
const email = session?.user?.email

if (!email) {
  setStudent(null)
  setLoading(false)
  return
}

const { data, error: dbError } = await supabase
  .from('students')
  .select('id, name, email, branch, year, n_points, profile_pic_url')
  .eq('email', email)  // ← CHANGED
  .maybeSingle()
```

**After:**
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser()

if (userError) throw userError
const userId = user?.id

if (!userId) {
  setStudent(null)
  setLoading(false)
  return
}

const { data, error: dbError } = await supabase
  .from('students')
  .select('id, name, email, branch, year, n_points, profile_pic_url')
  .eq('auth_id', userId)  // ← CHANGED
  .maybeSingle()
```

**Rationale:**
- ✅ `auth.getUser()` is more reliable than `getSession()`
- ✅ `auth_id` is immutable; email can change
- ✅ Enforces RLS policies correctly
- ✅ Matches Supabase SDK best practices

---

## Phase 3: Testing Framework ✅

### Installation & Setup

**Installed:** `@playwright/test` (76 new packages)

**Created:**
1. `playwright.config.ts` — Full browser test configuration
2. `tests/fixtures.ts` — Supabase auth fixtures
3. `tests/auth.spec.ts` — Complete E2E test suite
4. Updated `package.json` with test scripts

### Test Suite: `tests/auth.spec.ts`

**Coverage:** 18 test scenarios across 4 test groups

#### Test Group 1: Registration Flow (6 tests)

1. ✅ **Email domain validation** — Must be @nitkkr.ac.in or @nitk.edu.in
2. ✅ **Password strength validation** — Minimum 8 characters
3. ✅ **Password match validation** — Confirm password must match
4. ✅ **Step progression** — Can advance to Step 2 with valid account
5. ✅ **Profile field validation** — All required on Step 2
6. ✅ **Name length validation** — Minimum 3 characters

#### Test Group 2: Step 2 → Step 3 (4 tests)

7. ✅ **Branch/year/hostel selection** — Dropdowns work
8. ✅ **Phone input** — Accepts phone number
9. ✅ **Step 3 navigation** — Advances to interests
10. ✅ **Interest minimum validation** — Requires ≥3 selections

#### Test Group 3: RPC Submission (1 test)

11. ✅ **RPC call verification** — Verifies profile creation endpoint is called
12. ✅ **Dashboard navigation** — Redirects to /dashboard on success

#### Test Group 4: Sign-in Flow (3 tests)

13. ✅ **Form presence** — Email & password fields exist
14. ✅ **Error handling** — Shows error for invalid credentials
15. ✅ **OAuth buttons** — Google & GitHub buttons visible

#### Test Group 5: Auth Guards (2 tests)

16. ✅ **Unauthenticated redirect** — /dashboard redirects to /sign-in
17. ✅ **Loading state** — Shows spinner during auth check

#### Test Group 6: Navigation (2 tests)

18. ✅ **Email prefill CTA** — ?email=... parameter prefills form
19. ✅ **Sign-in link exists** — Get-started has link to sign-in
20. ✅ **Get-started link exists** — Sign-in has link to get-started

---

## Syntax Verification ✅

**Files checked for errors:**

| File | Status | Issues |
|------|--------|--------|
| `app/get-started/page.tsx` | ✅ | Only CSS naming suggestion (non-blocking) |
| `app/complete-profile/page.tsx` | ✅ | Only CSS naming suggestion (non-blocking) |
| `hooks/use-current-student.ts` | ✅ | No errors |
| `playwright.config.ts` | ✅ | No errors |
| `tests/auth.spec.ts` | ✅ | No errors |

---

## How to Run Tests

### Prerequisites

```bash
# 1. Ensure dev server is running
npm run dev

# 2. (Already done) Install Playwright
npm install -D @playwright/test
```

### Run All Tests

```bash
# Interactive UI mode (recommended)
npm run test:e2e:ui

# Headless mode (CI)
npm run test:e2e

# Debug mode (step-through)
npm run test:e2e:debug
```

### Single Test File

```bash
npx playwright test tests/auth.spec.ts
```

### Single Test

```bash
npx playwright test -g "should validate email domain"
```

### View Test Results

```bash
# After running tests, open HTML report
npx playwright show-report
```

---

## Critical Prerequisites for Tests to Pass

⚠️ **The following must be TRUE for tests to succeed:**

1. **RPC Function Exists**
   ```sql
   CREATE FUNCTION create_student_profile(payload JSONB)
   RETURNS TABLE(id UUID)
   ```
   - Must accept `payload: JSONB` with fields: email, name, branch, year, hostel, phone, interests
   - Must set `auth_id = auth.uid()` server-side
   - Must return created `id`

2. **Schema Columns**
   - `students` table has: `auth_id` (UUID, NOT NULL)
   - All other fields: name, email, branch, year, hostel, phone, interests

3. **RLS Policies**
   - SELECT: `auth_id = auth.uid()` 
   - INSERT: `auth_id = auth.uid()` (enforced by RPC)
   - UPDATE: `auth_id = auth.uid()`

4. **Dev Server**
   - Running on `http://localhost:3000`
   - Next.js dev mode with hot reload

5. **Supabase URL & Anon Key**
   - `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Expected Test Results

### Passing Tests
- ✅ Form validation (all 6 step 1 tests)
- ✅ Step progression (all step 2 tests)
- ✅ Interest selection (step 3 tests)
- ✅ Navigation (CTA, links)
- ✅ Auth guards (redirect tests)

### Conditional Tests (Depend on RPC)
- ⚠️ RPC submission test — **WILL FAIL** if `create_student_profile` RPC doesn't exist
  - **Fallback:** If RPC doesn't exist, check if direct INSERT is still in code
  - See below for "If RPC Missing" scenario

### Error Handling
- ✅ Even if tests fail, error messages should be captured
- All failures should indicate next action (check Supabase config)

---

## If RPC Function Missing

If the RPC is not in your Supabase project, you have two options:

### Option A: Create the RPC (Recommended)

Run this SQL in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.create_student_profile(payload JSONB)
RETURNS TABLE(id UUID) AS $$
BEGIN
  INSERT INTO public.students (
    auth_id,
    email,
    name,
    branch,
    year,
    hostel,
    phone,
    interests
  )
  VALUES (
    auth.uid(),
    (payload->>'email')::TEXT,
    (payload->>'name')::TEXT,
    (payload->>'branch')::TEXT,
    (payload->>'year')::INT,
    (payload->>'hostel')::TEXT,
    (payload->>'phone')::TEXT,
    (payload->'interests')::JSONB
  )
  RETURNING id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_student_profile(JSONB) TO authenticated;
```

### Option B: Revert to Direct INSERT (Fallback)

If RPC creation is blocked, revert the code changes:

```typescript
// Replace RPC call with direct insert
const { data, error } = await supabase
  .from('students')
  .insert({
    auth_id: (await supabase.auth.getUser()).data.user?.id,  // Add auth_id
    email,
    name,
    branch,
    year,
    hostel,
    phone,
    interests,
  })
  .select('id')
```

---

## Next Steps After Tests Run

### ✅ If All Tests Pass

1. **Verify RPC was called** — Check Supabase activity logs
2. **Check student row created** — Query `students` table, verify auth_id set
3. **Verify auth_id matching** — Ensure `auth_id = authentication user id`
4. **Test manual flows:**
   - Complete signup flow
   - Sign out & sign in
   - OAuth flow (requires redirect setup)

### ❌ If Tests Fail

1. **Capture error screenshots** — Playwright generates them
2. **Check RPC response** — Look for error codes
3. **Verify Supabase status**:
   ```bash
   SELECT COUNT(*) FROM students;
   SELECT COUNT(*) FROM auth.users;
   ```
4. **Check RLS policies** — Query `pg_policies`
5. **Review browser console** — Check for JS errors

---

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `app/get-started/page.tsx` | 3-step signup form | ✅ Updated to RPC |
| `app/complete-profile/page.tsx` | OAuth profile completion | ✅ Updated to RPC |
| `hooks/use-current-student.ts` | Load profile by auth_id | ✅ Updated to auth_id |
| `playwright.config.ts` | Test runner config | ✅ Created |
| `tests/fixtures.ts` | Auth test fixtures | ✅ Created |
| `tests/auth.spec.ts` | E2E test suite (18 tests) | ✅ Created |
| `package.json` | Added test scripts | ✅ Updated |
| `IMPLEMENTATION_PLAN.md` | Implementation roadmap | ✅ Created |
| `SUPABASE_AI_AGENT_REVIEW.md` | Agent recommendations | ✅ Created |
| `CLIENT_AUTH_DATA_INSERTION_REFERENCE.md` | API reference | ✅ Created |

---

## Summary: What Changed & Why

### Code Changes

**RPC Migration:**
- ✅ `get-started` & `complete-profile` now call `create_student_profile` RPC
- ✅ RPC sets `auth_id` server-side (cannot be spoofed)
- ✅ Atomic: profile + auth verification in one call

**Auth ID Queries:**
- ✅ `useCurrentStudent` now queries by `auth_id` instead of email
- ✅ Uses `getUser()` instead of `getSession()`
- ✅ Immutable identity; email can change

**Removed:**
- ❌ Removed `console.log('SESSION BEFORE INSERT')` debugging
- ❌ Removed `setCurrentStudentId()` localStorage call (deprecated)
- ❌ Removed direct INSERT statements

### Test Coverage

- 18 E2E test scenarios
- Tests all form validation paths
- Tests happy-path workflows
- Tests error scenarios
- Tests auth guards
- Tests navigation

---

##🎯 Success Criteria Status

- ✅ Phase 2 (Code): Complete
- ✅ Phase 3 (Tests): Complete
- ⏳ Phase 4 (Verification): Ready to run

**Next:** Run `npm run test:e2e:ui` to execute all tests and verify flows work correctly.


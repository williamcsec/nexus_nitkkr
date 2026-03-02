# Implementation Plan: RPC Migration & Auth ID Fix

**Date:** 1 March 2026  
**Objective:** Migrate from direct INSERT to RPC for secure auth_id handling + switch READ queries to auth_id

---

## Phase 1: Planning (Current)

### Changes Required

#### 1. **Supabase Schema & RPC** (Prerequisite)
   - **Verify RPC exists:** `create_student_profile(payload JSONB)`
   - **Fallback:** If RPC doesn't exist, we'll use direct INSERT but send auth_id explicitly
   - **RLS check:** Ensure RLS policies filter by auth_id

#### 2. **Frontend Code Changes** (3 files)
   
   | File | Change | Reason |
   |------|--------|--------|
   | `app/get-started/page.tsx` | Call RPC instead of direct INSERT | Atomic creation, server-side auth_id |
   | `app/complete-profile/page.tsx` | Call RPC instead of direct INSERT | Consistency with get-started |
   | `hooks/use-current-student.ts` | Query by auth_id instead of email | Immutable identity, RLS enforcement |

#### 3. **Testing**
   - Setup Playwright
   - Test signup flow (Step 1→2→3 → RPC)
   - Test OAuth flow (signin → complete-profile → RPC)
   - Test signin flow (email/password → profile check)
   - Test dashboard load (useCurrentStudent queries by auth_id)

---

## Phase 2: Implementation (Next)

### Step 2a: Verify RPC or Create Fallback

**Question to resolve:**
- Does Supabase project have `create_student_profile(JSONB)` RPC?
- If YES: Use it directly
- If NO: Use direct INSERT but send `auth_id` from client

**Decision:** Proceed with RPC pattern; if not available, fallback code will use `.insert()` with auth_id

### Step 2b: Update `app/get-started/page.tsx`

**Lines to change:** ~110–128

```typescript
// BEFORE (direct INSERT)
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

// AFTER (RPC call)
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

### Step 2c: Update `app/complete-profile/page.tsx`

**Same pattern as Step 2b** — replace INSERT with RPC

### Step 2d: Update `hooks/use-current-student.ts`

**Lines to change:** ~65 (where it queries by email)

```typescript
// BEFORE (email query)
const { data, error: dbError } = await supabase
  .from('students')
  .select('id, name, email, branch, year, n_points, profile_pic_url')
  .eq('email', email)
  .maybeSingle()

// AFTER (auth_id query)
const { data: { user }, error: userError } = await supabase.auth.getUser()
const userId = user?.id

if (!userId) {
  setStudent(null)
  setLoading(false)
  return
}

const { data, error: dbError } = await supabase
  .from('students')
  .select('id, name, email, branch, year, n_points, profile_pic_url')
  .eq('auth_id', userId)
  .maybeSingle()
```

---

## Phase 3: Testing with Playwright

### What We'll Test

1. **Email/Password Signup**
   - Step 1: Email domain validation + password validation
   - Step 2: Profile fields
   - Step 3: Interest selection
   - Final submit → RPC call → Dashboard redirect

2. **OAuth Signup → Complete Profile → RPC**
   - Sign in with Google/GitHub (mocked)
   - Redirected to `/complete-profile`
   - Submit → RPC call → Dashboard redirect

3. **Email/Password Signin**
   - Email + password → auth.signInWithPassword()
   - Profile existence check
   - Dashboard redirect or error

4. **Dashboard Auth Guard**
   - Load dashboard → useCurrentStudent queries by auth_id
   - Profile data displayed correctly
   - Logout redirects to /sign-in

### Test Structure

```
tests/
  auth.spec.ts          # Signup, signin, OAuth
  dashboard.spec.ts     # Dashboard access, profile loading
  profile-completion.spec.ts  # OAuth complete-profile flow
```

### What Playwright Will Verify

- ✅ Form validation (email domain, password strength, required fields)
- ✅ Network requests (RPC call made, auth token sent)
- ✅ Response handling (redirect on success, error on failure)
- ✅ State management (profile data stored and displayed)
- ✅ RLS enforcement (only own profile accessible)

---

## Phase 4: Review Changes (After Implementation)

- [ ] Check all 3 files for syntax errors
- [ ] Verify RPC payload structure matches schema
- [ ] Confirm no localStorage side effects
- [ ] Check error messages are user-friendly
- [ ] Verify loading states work correctly
- [ ] Test with slow network (network throttling in Playwright)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| RPC doesn't exist | Medium | High (fatal) | Fallback to direct INSERT with auth_id |
| auth_id column missing | Low | High (fatal) | Check schema before implementation |
| RLS policies not enforced | Low | High (security) | Verify RLS in Supabase console |
| Frontend test failures | Medium | Medium | Implement proper mocking |
| Email/auth_id mismatch | Low | High (data) | Ensure RPC sets auth_id correctly |

---

## Success Criteria

✅ Phase 2 Complete:
- [ ] RPC or fallback method selected
- [ ] 3 files updated with new code
- [ ] No syntax errors, builds successfully
- [ ] Code runs without runtime errors

✅ Phase 3 Complete:
- [ ] Playwright tests written
- [ ] All E2E flows tested (signup, OAuth, signin, dashboard)
- [ ] Tests pass locally
- [ ] Network requests verified

✅ Overall:
- User can signup via email/password with RPC
- User can signup via OAuth and complete profile with RPC
- User can signin and access dashboard
- Profile data queries use auth_id, not email
- All errors handled gracefully
- No deprecated localStorage usage

---

## Timeline

- Phase 1 (Planning): ✅ Done
- Phase 2 (Implementation): ~15 min (3 file changes)
- Phase 3 (Testing): ~20 min (setup Playwright + write tests)
- Phase 4 (Review & Verification): ~10 min
- **Total: ~45 min**


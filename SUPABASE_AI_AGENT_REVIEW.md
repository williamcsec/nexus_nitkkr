# Supabase AI Agent Recommendations — Review & Comparison

**Date:** 1 March 2026  
**Agent Source:** Supabase AI Agent  
**Purpose:** Compare current frontend auth/insertion code to recommended patterns from Supabase

---

## Executive Summary

The Supabase AI agent provided **production-grade patterns** for CREATE, READ, and UPDATE operations. Your current code is **partially aligned** but has **critical gaps**:

1. ❌ **Using direct INSERT instead of RPC** — missing server-side auth_id enforcement
2. ❌ **Not sending auth_id** — relies on RLS to enforce, but RPC is safer
3. ⚠️ **Missing optional fields** — roll_number, skills, URLs not in payload
4. ✅ **Error handling is good** — try/catch and validation correct
5. ✅ **Array handling** — interests array correctly sent
6. ✅ **Response handling** — `data?.[0]?.id` pattern correct

---

## 1. CREATE Operation — Direct INSERT vs RPC

### Current Implementation (❌ Not Recommended)

**File:** `app/get-started/page.tsx` lines 110–128

```typescript
// DIRECT INSERT TO STUDENTS TABLE
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

if (insertError) {
  throw insertError
}
if (resp && resp.length) {
  setCurrentStudentId(resp[0].id)  // deprecated localStorage
}
router.push('/dashboard')
```

**Issues:**
- ❌ Missing `auth_id` — client should NOT set it; server must enforce it
- ❌ Direct INSERT allows client to bypass RLS if schema allows NULL auth_id
- ❌ Not atomic — signup and insert are separate requests (race condition possible)
- ❌ setCurrentStudentId uses deprecated localStorage
- ⚠️ Missing schema validation on column constraints

### Recommended Implementation (✅ Supabase AI Agent)

```typescript
// CALL RPC — SERVER-SIDE SETS AUTH_ID
const profileObject = {
  email: email.trim().toLowerCase(),
  name: name.trim(),
  branch,
  year,
  hostel,
  phone: phone.trim(),
  interests: selectedInterests,
  // OPTIONAL: can add if available
  // roll_number: '21CS001',
  // skills: [],
  // profile_pic_url: null,
  // linkedin_url: '',
  // github_url: '',
};

const { data, error } = await supabase.rpc('create_student_profile', {
  payload: profileObject,
});

if (error) {
  console.error('Create profile error', error);
  throw error;
} else {
  const newId = data?.[0]?.id ?? null;
  if (newId) {
    console.log('Created student id:', newId);
    // Optional: store in client state if needed, but don't use localStorage
  }
  router.push('/dashboard');
}
```

**Benefits:**
- ✅ `auth_id` set by server-side RPC (secure, cannot be spoofed)
- ✅ Atomic operation — RPC ensures all-or-nothing creation
- ✅ No localStorage side effects
- ✅ RLS policies will strictly enforce ownership
- ✅ Follows Supabase production best practices

### Migration Required

**You must create the RPC function on Supabase:**

```sql
CREATE OR REPLACE FUNCTION create_student_profile(payload JSONB)
RETURNS TABLE(id UUID) AS $$
BEGIN
  INSERT INTO students (
    auth_id,
    email,
    name,
    branch,
    year,
    hostel,
    phone,
    interests
    -- Add other fields as needed: skills, profile_pic_url, etc.
  )
  VALUES (
    auth.uid(),  -- Server-side: set from JWT
    (payload->>'email')::TEXT,
    (payload->>'name')::TEXT,
    (payload->>'branch')::TEXT,
    (payload->>'year')::INT,
    (payload->>'hostel')::TEXT,
    (payload->>'phone')::TEXT,
    (payload->'interests')::JSONB
  )
  RETURNING students.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_student_profile(JSONB) TO authenticated;
```

---

## 2. READ Operation — Current User's Profile

### Current Implementation (✅ Works But Not Optimal)

**File:** `hooks/use-current-student.ts` lines 49–77

```typescript
// GET SESSION AND QUERY BY EMAIL
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
  .eq('email', email)  // QUERY BY EMAIL, not auth_id
  .maybeSingle()

if (dbError) throw dbError
// ... rest of logic
```

**Issues:**
- ⚠️ Queries by `email` instead of `auth_id` (email can change, but auth_id is immutable)
- ✅ `.maybeSingle()` correctly handles zero or one row
- ✅ Error handling is good

### Recommended Implementation (✅ Supabase AI Agent)

```typescript
// OPTION 1: RELY ON RLS (SAFEST)
const { data, error } = await supabase
  .from('students')
  .select('*')  // columns you need
  .single();  // expects exactly one row

if (error && error.code !== 'PGRST116') {
  // PGRST116 = "no rows returned"
  console.error('Read profile error', error);
} else {
  // data is a student object or null
  console.log('Student row:', data);
}

// OPTION 2: EXPLICITLY FILTER BY AUTH_ID (MORE DEFENSIVE)
const user = (await supabase.auth.getUser()).data.user;
const userId = user?.id ?? null;

if (!userId) {
  console.error('No authenticated user');
  return;
}

const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('auth_id', userId)
  .single();

if (error) {
  console.error('Read profile error', error);
} else {
  console.log('Student row:', data);
}
```

**Why Option 2 is better:**
- ✅ Explicit `auth_id` filtering is defensive programming
- ✅ Works even if RLS has a bug
- ✅ `auth_id` is immutable and never changes
- ✅ Email can be updated, so querying by email is fragile

### Change Needed

Replace `email` query with `auth_id` query in `hooks/use-current-student.ts`:

```typescript
// BEFORE:
const { data, error: dbError } = await supabase
  .from('students')
  .select('...')
  .eq('email', email)
  .maybeSingle()

// AFTER:
const { data: { user }, error: userError } = await supabase.auth.getUser()
const userId = user?.id

if (!userId) {
  setStudent(null)
  return
}

const { data, error: dbError } = await supabase
  .from('students')
  .select('...')
  .eq('auth_id', userId)  // Query by auth_id, not email
  .maybeSingle()
```

---

## 3. UPDATE Operation — Not Yet Implemented

### Current Status

No UPDATE functionality exists in the frontend yet. When users edit their profile, it will need to follow the Supabase pattern.

### Recommended Implementation (✅ Supabase AI Agent)

```typescript
async function updateProfile(updates: Partial<StudentProfile>) {
  const user = (await supabase.auth.getUser()).data.user;
  const userId = user?.id ?? null;

  if (!userId) {
    console.error('No authenticated user');
    return;
  }

  const { data, error } = await supabase
    .from('students')
    .update(updates)  // { name: '...', interests: [...], etc. }
    .eq('auth_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update error', error);
    throw error;
  } else {
    console.log('Updated student:', data);
    return data;
  }
}
```

---

## 4. Payload Structure Comparison

### Current Payload (get-started)

```typescript
{
  name: "Aarav Sharma",
  email: "aarav.21050234@nitkkr.ac.in",
  branch: "CSE",
  year: 2,
  hostel: "H2",
  phone: "+91 98765 43210",
  interests: ["Web Development", "Machine Learning"],
}
```

### Recommended Payload (Supabase AI Agent)

```typescript
{
  email: "user@example.com",
  name: "Jane Doe",
  roll_number: "21CS001",        // ← NEW: Student roll number
  branch: "CSE",
  year: 2024,                     // ← Can be year (int) or timestamp
  phone: "9999999999",
  hostel: "A-Block",
  interests: ["ai", "robotics"],  // ← Arrays allowed in JSON
  skills: ["javascript", "sql"],  // ← NEW: Technical skills
  profile_pic_url: "https://.../pic.jpg",  // ← NEW: Profile picture URL
  linkedin_url: "https://linkedin.com/in/janedoe",  // ← NEW
  github_url: "https://github.com/janedoe",  // ← NEW
}
```

### Mapping to Your Schema

**You need to clarify with Supabase:**
- Does `students` table have `roll_number`? (Not visible in current code)
- Does it have `skills`? (Not visible)
- Does it have `profile_pic_url`?
- Does it have `linkedin_url`, `github_url`?
- Do these accept NULL/empty on creation?

**Current code omits:**
- `roll_number` — if required, must add to form or auto-generate
- `skills` — if needed, add Step 3 field or skip
- `profile_pic_url` — can be NULL initially, user uploads later
- `linkedin_url`, `github_url` — can be optional fields, skip for MVP

---

## 5. Error Handling & Response Shapes

### Current Error Handling (✅ Good)

```typescript
try {
  const { data: resp, error: insertError } = await supabase.from('students').insert(...)
  if (insertError) {
    throw insertError
  }
  // success logic
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create profile')
} finally {
  setLoading(false)
}
```

**Strengths:**
- ✅ Wraps Supabase operations in try/catch
- ✅ Checks error object explicitly
- ✅ Throws to centralized error handler
- ✅ Sets loading state appropriately

### Recommended Error Handling (✅ Supabase AI Agent)

```typescript
const { data, error } = await supabase.rpc('create_student_profile', { payload: profileObject });

if (error) {
  console.error('Create profile error', error);
  // error.message will have details
  // error.code will have error code (e.g., PGRST116, POLICY_VIOLATION)
  setError(error.message);
} else {
  const newId = data?.[0]?.id ?? null;
  console.log('Created student id:', newId);
  router.push('/dashboard');
}
```

**Difference:**
- Supabase style: check `if (error)` inline, don't throw
- Your style: throw and catch
- **Both are valid**; consistency matters more

---

## 6. File-by-File Changes Required

### File 1: `app/get-started/page.tsx` (Critical Fix)

**Current line 110–128:**
```typescript
const { data: resp, error: insertError } = await supabase
  .from('students')
  .insert({...})
  .select('id')
```

**Change to:**
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
});
```

**And update response handling:**
```typescript
if (error) {
  setError(error.message || 'Failed to create profile')
  return
}

const newId = data?.[0]?.id ?? null
if (newId) {
  // don't use setCurrentStudentId (deprecated)
  // RLS will protect queries, no need to store locally
}
router.push('/dashboard')
```

### File 2: `app/complete-profile/page.tsx` (Critical Fix)

Same change as `get-started`. Replace direct INSERT with RPC call.

### File 3: `hooks/use-current-student.ts` (Important Fix)

**Current line 65:**
```typescript
.eq('email', email)
```

**Change to:**
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser()
const userId = user?.id

if (!userId) {
  setStudent(null)
  setLoading(false)
  return
}

// Then query by auth_id:
const { data, error: dbError } = await supabase
  .from('students')
  .select('...')
  .eq('auth_id', userId)
  .maybeSingle()
```

---

## 7. Blocking Items & Questions

Before implementing these changes, clarify with Supabase:

1. **Does the RPC `create_student_profile` exist?**
   - If not, you must create it (see SQL above)
   - What error code does it return on duplicate email?

2. **Schema: Does `students` table have?**
   - `auth_id` column (UUID, NOT NULL)?
   - `roll_number` (optional)?
   - `skills` (JSONB array, optional)?
   - `profile_pic_url`, `linkedin_url`, `github_url` (optional)?

3. **RLS Policy: Is it enforcing?**
   - `SELECT: auth_id = auth.uid()`?
   - `INSERT: auth_id = auth.uid()`?
   - `UPDATE: auth_id = auth.uid()`?

4. **Email field:**
   - Does it have a UNIQUE constraint?
   - Is it required or can it be NULL in the schema?
   - Can users change their email after signup?

5. **Interests field:**
   - Is it JSONB array or TEXT array?
   - Does it have a constraint on allowed values?

---

## 8. Summary Table

| Aspect | Current | Recommended | Status |
|--------|---------|-------------|--------|
| CREATE method | Direct INSERT | RPC call | ❌ Need fix |
| auth_id handling | Not sent | RPC sets server-side | ❌ Need fix |
| READ by | email | auth_id | ⚠️ Need fix |
| UPDATE by | N/A | auth_id | N/A (not yet needed) |
| Error handling | try/catch | inline check | ✅ Both valid |
| Arrays (interests) | Correct | Correct | ✅ OK |
| localStorage | Used (deprecated) | Not used | ⚠️ Optional cleanup |
| Response parsing | data?.[0]?.id | data?.[0]?.id | ✅ OK |

---

## 9. Next Steps

### Immediate (Blocking)

1. **Confirm RPC exists** or create it per SQL above
2. **List `students` table schema** to see what fields exist
3. **Implement RPC calls** in `get-started/page.tsx` and `complete-profile/page.tsx`
4. **Update READ** in `hooks/use-current-student.ts` to use auth_id

### Short-term (Next Session)

5. **Test end-to-end:** Signup → INSERT via RPC → Dashboard load → Query by auth_id
6. **Verify RLS policies:**  
   - SELECT should filter by auth_id
   - UPDATE/INSERT should enforce auth_id = auth.uid()
7. **Remove deprecated localStorage** from `setCurrentStudentId`
8. **Add optional fields** if schema supports them

### Long-term

9. **Implement UPDATE** for profile editing
10. **Add file upload** for `profile_pic_url`
11. **Add social links** input for `linkedin_url`, `github_url`

---

## Code Review Verdict

✅ **Error handling and validation:** Excellent  
✅ **UI/UX flow:** Excellent (3-step form is well-designed)  
⚠️ **Security (auth_id):** Needs fix  
⚠️ **Database patterns:** Using direct INSERT instead of RPC  
❌ **Alignment with Supabase best practices:** Partially misaligned  

**Risk Level:** Medium (works now, but not production-safe for auth_id enforcement)  
**Priority:** High (auth is critical)


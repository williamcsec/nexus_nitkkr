# Client-Side Authentication & Data Insertion — Code Reference

This document contains the exact code snippets showing how the NITK Nexus frontend performs session retrieval, authentication, and data insertion into Supabase.

---

## 1. Session/User/Token Retrieval

### Hook: `useCurrentStudent()` 
**File: `hooks/use-current-student.ts`**

How the app fetches the current logged-in user and their student profile:

```typescript
// Get Supabase session and query students table by email
export function useCurrentStudent(): UseCurrentStudentResult {
  const [student, setStudent] = useState<CurrentStudent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFromSession() {
      setLoading(true)
      setError(null)

      try {
        // 1. GET SESSION FROM SUPABASE AUTH
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        const email = session?.user?.email
        if (!email) {
          setStudent(null)
          setLoading(false)
          return
        }

        // 2. QUERY STUDENTS TABLE BY EMAIL
        const { data, error: dbError } = await supabase
          .from('students')
          .select('id, name, email, branch, year, n_points, profile_pic_url')
          .eq('email', email)
          .maybeSingle()

        if (dbError) throw dbError
        if (!data) {
          // No profile record yet
          if (!cancelled) {
            setStudent(null)
          }
          return
        }

        // 3. BUILD AVATAR AND SET STATE
        if (!cancelled) {
          const avatar =
            typeof data.name === 'string' && data.name.trim().length > 0
              ? data.name
                  .split(' ')
                  .map((part: string) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'ST'

          setStudent({
            id: data.id as string,
            name: data.name as string,
            email: data.email as string,
            branch: (data.branch as string | null) ?? null,
            year: (data.year as number | null) ?? null,
            avatar,
            nPoints: (data.n_points as number | null) ?? 0,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load student')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFromSession()

    // 4. LISTEN FOR AUTH STATE CHANGES
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.email) {
          void loadFromSession()
        } else {
          if (!cancelled) {
            setStudent(null)
            setLoading(false)
          }
        }
      },
    )

    return () => {
      cancelled = true
      authListener?.subscription.unsubscribe()
    }
  }, [])

  return { student, loading, error }
}
```

**Key points:**
- Calls `supabase.auth.getSession()` to get auth JWT and user email.
- Queries `students` table filtered by email.
- Listens for `onAuthStateChange` to auto-refresh if session changes.
- Returns `{ student, loading, error }` to components.

---

## 2. Sign-In with Email/Password

**File: `app/sign-in/page.tsx`**

How the app signs in an existing user:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    const trimmedEmail = email.trim().toLowerCase()

    // 1. AUTHENTICATE WITH EMAIL/PASSWORD
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (authError) {
      throw authError
    }

    // 2. CHECK IF PROFILE EXISTS
    const { data: profile, error: dbError } = await supabase
      .from('students')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle()

    if (dbError) {
      throw dbError
    }

    // 3. IF NO PROFILE, SHOW ERROR + REDIRECT TO SIGNUP
    if (!profile) {
      setError("Profile not found. Please complete your registration.")
      setLoading(false)
      return
    }

    // 4. REDIRECT TO DASHBOARD ON SUCCESS
    router.push('/dashboard')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

**Key points:**
- `supabase.auth.signInWithPassword()` returns JWT session.
- Verifies profile exists before allowing access.
- Routes unauthenticated/incomplete users to appropriate pages.

---

## 3. OAuth Sign-In (Google / GitHub)

**File: `app/sign-in/page.tsx`**

```typescript
async function handleOAuth(provider: 'google' | 'github') {
  setError(null)
  setLoading(true)
  const { error: oauthError } = await supabase.auth.signInWithOAuth({
    provider,
    options: { scopes: 'email' },
  })
  if (oauthError) {
    setError(oauthError.message)
    setLoading(false)
  }
}
```

**Flow:**
- User clicks Google/GitHub button → redirects to provider consent screen.
- Provider redirects back with JWT session.
- Dashboard/complete-profile page logic then checks if profile exists.

---

## 4. Registration — INSERT to `students` Table

### Email/Password Registration (Step 3)
**File: `app/get-started/page.tsx`**

After user completes all 3 steps (account, profile, interests):

```typescript
// VALIDATE INTERESTS MIN 3
if (selectedInterests.length < 3) {
  setError("Please select at least 3 interests")
  return
}

// FINAL SUBMIT - CREATE STUDENT PROFILE
setLoading(true)
try {
  // 1. CONSTRUCT PAYLOAD
  const payload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  }

  // 2. INSERT INTO STUDENTS TABLE
  const { data: resp, error: insertError } = await supabase
    .from('students')
    .insert(payload)
    .select('id')  // Return the newly created id

  if (insertError) {
    throw insertError
  }

  // 3. STORE STUDENT ID LOCALLY
  if (resp && resp.length) {
    setCurrentStudentId(resp[0].id)  // For backwards compatibility
  }

  // 4. REDIRECT TO DASHBOARD
  router.push('/dashboard')
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create profile')
} finally {
  setLoading(false)
}
```

**Payload sent:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.21050234@nitkkr.ac.in",
  "branch": "CSE",
  "year": 2,
  "hostel": "H2",
  "phone": "+91 98765 43210",
  "interests": ["Web Development", "Machine Learning", "Cloud Computing"]
}
```

---

### OAuth Registration — Complete Profile (Step 2)
**File: `app/complete-profile/page.tsx`**

For users signing in via Google/GitHub who have no profile yet:

```typescript
// SUBMIT PROFILE AFTER OAUTH
setLoading(true)
try {
  // 1. CONSTRUCT PAYLOAD (pre-filled name from OAuth)
  const payload = {
    name: name.trim(),
    email: authEmail.toLowerCase(),  // From OAuth user email
    branch,
    year,
    hostel,
    phone: phone.trim(),
    interests: selectedInterests,
  }

  // 2. INSERT INTO STUDENTS TABLE
  const { data: resp, error: insertError } = await supabase
    .from('students')
    .insert(payload)
    .select('id')

  if (insertError) {
    throw insertError
  }

  // 3. STORE STUDENT ID AND REDIRECT
  if (resp && resp.length) {
    setCurrentStudentId(resp[0].id)
  }
  router.push('/dashboard')
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to create profile')
  setLoading(false)
}
```

---

## 5. Data Payload & Field Mapping

**All student records inserted include:**

| Field | Type | Source | Encoding | Validation |
|-------|------|--------|----------|-----------|
| `name` | string | User input (Step 2) | UTF-8, trimmed | Min 3 chars, no special |
| `email` | string | Auth system | Lowercase, trimmed | @nitkkr.ac.in or @nitk.edu.in |
| `branch` | string | Dropdown (Step 2) | As-is from list | Non-null, from predefined set |
| `year` | integer | Dropdown (Step 2) | 1–4 | Non-null |
| `hostel` | string | Dropdown (Step 2) | As-is from list | Non-null, from predefined set |
| `phone` | string | User input (Step 2) | Trimmed | Non-null, Indian format expected |
| `interests` | text[] (array) | Multi-select (Step 3) | Array of strings | Min 3 selections, from allowed list |

---

## 6. Network Request Details

### Supabase Auth API Calls

**Sign-up (email/password)**
```
POST https://<your-project>.supabase.co/auth/v1/signup
Content-Type: application/json

{
  "email": "user@nitkkr.ac.in",
  "password": "SecurePass123!"
}

Response:
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "aud": "authenticated",
  "role": "authenticated",
  "email": "user@nitkkr.ac.in",
  "email_confirmed_at": null,
  "phone": "",
  "confirmed_at": null,
  "last_sign_in_at": null,
  "app_metadata": { "provider": "email", "providers": ["email"] },
  "user_metadata": {},
  "identities": null,
  "created_at": "2026-03-01T10:00:00Z",
  "updated_at": "2026-03-01T10:00:00Z"
}
```

**Sign-in (email/password)**
```
POST https://<your-project>.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@nitkkr.ac.in",
  "password": "SecurePass123!"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...xxxx",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "user": { ... }
}
```

**Sign-in with OAuth (Google)**
```
GET https://<your-project>.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/

(user redirected to Google consent screen, then back with session)
```

**Insert into `students` table**
```
POST https://<your-project>.supabase.co/rest/v1/students?select=id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...xxxx
Content-Type: application/json

{
  "name": "Aarav Sharma",
  "email": "aarav.21050234@nitkkr.ac.in",
  "branch": "CSE",
  "year": 2,
  "hostel": "H2",
  "phone": "+91 98765 43210",
  "interests": ["Web Development", "Machine Learning", "Cloud Computing"]
}

Response:
{
  "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "name": "Aarav Sharma",
  "email": "aarav.21050234@nitkkr.ac.in",
  "branch": "CSE",
  "year": 2,
  "hostel": "H2",
  "phone": "+91 98765 43210",
  "interests": ["Web Development", "Machine Learning", "Cloud Computing"],
  "created_at": "2026-03-01T10:05:00Z"
}
```

---

## 7. Dependencies & Versions

**From `package.json`:**

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "dependencies": {
    "@supabase/supabase-js": "^2.98.0",
    "next": "16.1.6",
    "react": "^18.2.0 (implicit from Next.js)"
  },
  "devDependencies": {
    "typescript": "^5.0.0 (typical for Next 16.x)"
  }
}
```

**Key versions:**
- **@supabase/supabase-js**: `^2.98.0` (client library)
- **next**: `16.1.6` (with Turbopack)
- **react**: `18.2.0+`

---

## 8. Authorization Header Format

**Bearer Token (JWT)**
```
Authorization: Bearer <access_token>
```

Example (masked):
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwic...4dXNlciJ9.AbCd1234****
```

**Headers on all REST calls:**
```
Content-Type: application/json
Authorization: Bearer <JWT from session>
Prefer: return=representation  (optional, for Supabase)
```

---

## Summary: Request/Response Flow

```
1. User Sign-Up
   Client: POST /auth/v1/signup → Supabase Auth
   Response: { id, email, access_token, ... }
   
2. User fills profile + interests
   Client: POST /rest/v1/students (with JWT) → Supabase
   Response: { id, name, email, branch, ... }
   
3. User Sign-In
   Client: POST /auth/v1/token → Supabase Auth  →  { access_token, ... }
   Client: GET /rest/v1/students (with JWT) → Supabase
   Response: { id, name, branch, ... } or 404
   
4. On dashboard load
   Client: GET /auth/v1/user (implicit in getSession) → Session validated
   useCurrentStudent hook: Fetch from /rest/v1/students (with JWT)
   Response: Profile data for display
```

---

## What to spot-check in Supabase

1. **RLS Policies**: Ensure `students` table has RLS enabled and policies restrict to owner.
2. **Columns**: Verify all fields exist in the table (name, email, branch, year, hostel, phone, interests).
3. **Constraints**: Check that email has UNIQUE and NOT NULL, and that `branch`, `year`, `hostel`, `phone` are NOT NULL.
4. **Tokens**: Verify the JWT token in Authorization header is valid and not expired.
5. **Logs**: Check Supabase Logs dashboard for auth and REST failures.

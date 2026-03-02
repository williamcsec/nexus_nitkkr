# Production Authentication Flow - NITK Nexus

## Flow Overview

```
User Landing Page
├── "Sign In" → /sign-in
├── "Get Started" (register) → /get-started
└── "Join Now" (CTA) → /get-started?email=xxx
```

---

## 1. EMAIL/PASSWORD REGISTRATION (/get-started)

### Step 1: Account Creation
- **Email**: Required, must be @nitkkr.ac.in
- **Password**: Min 8 chars, alphanumeric + special char
- **Confirm Password**: Must match exactly
- **Submit**: Creates Supabase Auth account (email_confirmed=false)
- **Error Handling**:
  - Invalid email format → Show error
  - Email already exists → Show error
  - Password mismatch → Show error
  - Password too weak → Show error
- **Success**: Load Step 2

### Step 2: Complete Profile (REQUIRED)
- **Full Name**: Required, min 3 chars
- **Branch**: Required (CSE, ECE, ME, CE, EE, etc.)
- **Year**: Required (1st, 2nd, 3rd, 4th)
- **Hostel**: Required (H1, H2, ... H16)
- **Phone**: Required, Indian format (+91 XXXXX XXXXX)
- **Validation**: All fields must be filled
- **Success**: Load Step 3

### Step 3: Set Interests (REQUIRED - min 3 selections)
- **Multi-select from predefined list**
- **Validation**: Must select at least 3 interests
- **Error**: "Please select at least 3 interests"
- **Success**: Proceed to submit

### Final Submit
```
Action:
1. Insert into 'students' table with ALL data (NO NULLs):
   - email (from auth)
   - name (step 2)
   - branch (step 2)
   - year (step 2)
   - hostel (step 2)
   - phone (step 2)
   - interests (step 3)
   
2. If insert successful:
   - Set student_id in hook
   - Redirect to /dashboard
   
3. If insert fails:
   - Show error: "Failed to create profile. Please try again."
   - Stay on form
```

---

## 2. GOOGLE OAUTH FLOW

### Step 1: Click Google Button
- Initiates Supabase OAuth flow
- Supabase redirects to Google consent screen
- User approves

### Step 2: OAuth Callback
Supabase redirects back to app with user data:
```
- user.id (auth_id)
- user.email 
- user.user_metadata.full_name
- user.user_metadata.avatar_url
```

### Step 3: Check Profile Existence
```
useCurrentStudent hook:
1. Get auth session
2. Query students table WHERE email = user.email
3. If found: Set student state → user can access dashboard
4. If NOT found: Set student = null → redirect to /complete-profile
```

### Step 4: Complete Profile (/complete-profile)
NEW PAGE - Same as get-started steps 2-3 but:
- **Pre-filled**: Name (from OAuth), Email (read-only)
- **Required**: Branch, Year, Hostel, Phone, Interests (3+ min)
- **Submit**: Creates student record with OAuth user data
- **Redirect**: /dashboard on success

---

## 3. EMAIL/PASSWORD SIGN-IN (/sign-in)

### Step 1: Email/Password Input
- **Email**: Required, valid format
- **Password**: Required, min 1 char
- **Validation**: 
  - Check auth credentials with Supabase
  - If auth fails → Show "Invalid email or password"
  
### Step 2: Profile Check
After successful auth:
```
1. Query students table WHERE email = user.email
2. If found (row exists):
   - Set student state
   - Redirect to /dashboard
3. If NOT found (no profile):
   - Show error: "Profile not found. Please complete registration."
   - Option: Link to /get-started
   - Logout user from auth
```

### Step 3: Social Login
- **Google Button**: Redirects to OAuth flow (see section 2)
- **GitHub Button**: Same OAuth flow pattern

---

## 4. DASHBOARD ACCESS (/dashboard)

### Entry Guard
```
useCurrentStudent hook must return:
{
  student: {
    id: string (NOT null)
    name: string (NOT null)
    email: string (NOT null)
    branch: string (NOT null)
    year: number (NOT null)
    ... all required fields populated
  },
  loading: boolean,
  error: string | null
}

If loading: Show loading screen
If error: Show error message
If student is null: Redirect to /sign-in
If student exists: Render dashboard
```

### Tab Components
Each tab receives student.id and queries live data:
- **Overview**: Events attended, upcoming, certificates, n-points
- **Discover**: All events, recommendations based on interests
- **Registrations**: User's registrations
- **Certificates**: User's certificates
- **Wallet**: N-Points balance, leaderboard

---

## 5. DATA VALIDATION RULES (REQUIRED)

### students Table - NO NULL VALUES
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  branch VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  hostel VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  interests TEXT[] NOT NULL DEFAULT '{}',
  n_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Insert Validation (Before DB)
```
- email: trim + lowercase, must be @nitkkr.ac.in
- name: minimum 3 chars, no special chars
- branch: must be from predefined list
- year: must be 1-4
- hostel: must be from predefined list
- phone: must match Indian format
- interests: array with 3+ items from list
```

---

## 6. ERROR HANDLING

### Auth Errors
- "Invalid email or password" → Sign-in failed
- "Email already registered" → Already has account
- "Password too weak" → Min 8 chars, mix of types
- "Passwords do not match" → Confirm password mismatch

### Profile Errors
- "Profile not found" → Authenticated but no student record
- "Failed to create profile" → DB insert failed
- "Please complete all required fields" → Missing data

### Session Errors
- "Session expired" → JWT invalid, redirect to /sign-in
- "Unauthorized access" → No session, redirect to /sign-in

---

## 7. REDIRECT LOGIC (FINAL)

```
Landing Page:
  ├─ Unauthenticated → Show landing
  └─ Authenticated + profile exists → Redirect to /dashboard
  
/sign-in:
  ├─ Unauthenticated → Show form
  ├─ Authenticated + profile exists → Redirect to /dashboard
  └─ Authenticated + NO profile → Redirect to /complete-profile
  
/get-started:
  ├─ Unauthenticated → Show form
  └─ Authenticated + profile exists → Redirect to /dashboard
  
/complete-profile:
  ├─ Unauthenticated → Redirect to /sign-in
  ├─ Authenticated + profile exists → Redirect to /dashboard
  └─ Authenticated + NO profile → Show form
  
/dashboard:
  ├─ Unauthenticated → Redirect to /sign-in
  ├─ Authenticated + NO profile → Redirect to /complete-profile
  └─ Authenticated + profile exists → Show dashboard
```

---

## 8. IMPLEMENTATION CHECKLIST

- [ ] Remove ALL `|| null` from registration form
- [ ] Make branch, year, hostel, phone REQUIRED in form validation
- [ ] Create /complete-profile page for OAuth users
- [ ] Update useCurrentStudent to handle profile-not-found
- [ ] Add profile existence check in sign-in
- [ ] Add profile existence check in OAuth callback
- [ ] Update dashboard redirect logic
- [ ] Add email domain validation (@nitkkr.ac.in only)
- [ ] Add interest count validation (min 3)
- [ ] Test all flows end-to-end

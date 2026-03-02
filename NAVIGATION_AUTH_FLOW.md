# Navigation & Authentication Flow - Complete Implementation Guide

**Document Created**: 1 March 2026  
**Status**: Implementation Complete  
**Purpose**: Detailed reference for all navigation and authentication flow changes

---

## 1. Navigation Architecture

### 1.1 Navbar Component (`components/navbar.tsx`)

**Current State**: 
- Navigation links (Features, Clubs, Events, About) use anchor scrolls (`#features`, `#for-clubs`, etc.)
- Sign In button: No href (missing)
- Get Started button: No href (missing)

**Changes Made**:
- ✅ Navigation links remain as scroll anchors (intended behavior)
- ✅ Sign In button (`href="/sign-in"`) → Routes to sign-in page
- ✅ Get Started button (`href="/get-started"`) → Routes to registration page
- ✅ Logo link (`href="/"`) → Routes to home page

**Rationale**: 
- Navbar provides quick access to authentication and home
- Navigation links allow users to explore sections without leaving home page
- Maintains UX consistency on landing page

---

### 1.2 Hero Component (`components/hero.tsx`)

**Current State**: 
- "Get Started" button: No href (missing)
- "Watch Demo" button: No href (skipped as per requirements)

**Changes Made**:
- ✅ "Get Started" button (`href="/get-started"`) → Routes to registration/onboarding
- ⏭️ "Watch Demo" button → Left as-is (no action needed)

**Button Placement**:
```
Hero Section (landing page)
├── "Get Started" → /get-started (registration flow)
└── "Watch Demo" → No action (skipped)
```

---

### 1.3 Upcoming Events Component (`components/upcoming-events.tsx`)

**Current State**: ✅ Already properly implemented
- "View All Events" button correctly links to `/events`

**No Changes Needed**

---

### 1.4 For Clubs Component (`components/for-clubs.tsx`)

**Current State**: 
- "Register Your Club" button: No href (missing)

**Changes Made**:
- ✅ "Register Your Club" button (`href="/get-started"`) → Routes to registration flow
  - Users must be authenticated to manage clubs
  - Directs to same registration endpoint as regular students
  - Club registration handled in get-started form logic

**Rationale**: 
- Club registration is part of onboarding flow
- All registration flows consolidated to single `/get-started` endpoint
- Ensures all users are authenticated before accessing club tools

---

### 1.5 Footer Component (`components/footer.tsx`)

**Current State**: 
- All footer links point to `#` (dead links)

**Changes Made**:
- ✅ Platform links:
  - "Features" → `#features` (scroll to features section)
  - "Events" → `/events` (navigate to events page)
  - "Clubs" → `/clubs` (navigate to clubs page)
  - "Certificates" → `/dashboard` (navigate to dashboard)
  - "N-Points" → `/dashboard` (navigate to dashboard)
- ✅ Resources links: 
  - All points to placeholder `#` (update later as pages created)
- ✅ Legal links:
  - All points to placeholder `#` (update later as pages created)
- ✅ Logo link: `href="/"` → Home page

**Rationale**: 
- Footer provides easy discovery of main features
- Scroll links keep users on home when browsing features
- Main page links route to corresponding pages

---

## 2. Authentication Flow

### 2.1 Sign-In Page (`app/sign-in/page.tsx`)

**Current Implementation**: ✅ Already implemented
- Uses Supabase `supabase.auth.signInWithPassword()`
- Creates database session

**Redirect Logic**:
```
Sign In Flow:
├── User visits /sign-in
│   └── If already authenticated → Redirect to /dashboard
│
├── User enters email + password
│   └── Success → Redirect to /dashboard
│       └── Store auth session in Supabase
│       └── User can access protected routes
│
└── User enters invalid credentials
    └── Show error message
        └── User remains on sign-in page
```

**Session Management**:
- Supabase auto-manages session in localStorage
- Session persists across page refreshes
- `useCurrentStudent()` hook reads from auth session

---

### 2.2 Get-Started Page (`app/get-started/page.tsx`)

**Current Implementation**: ✅ Already implemented
- Uses Supabase `supabase.auth.signUp()` for account creation
- Creates student profile in `students` table

**Redirect Logic**:
```
Registration Flow:
├── User visits /get-started
│   └── If already authenticated → Redirect to /dashboard
│
├── User enters account details (email, password)
│   └── Auth signup via Supabase
│       → Confirmation email sent (if enabled)
│
├── User enters profile details (name, branch, interests)
│   └── Create student record in database
│   └── Link student to auth user via email
│
└── Success → Redirect to /dashboard
    └── Auto-logged in as new user
    └── Can now access protected routes
```

**Form Steps**:
1. **Step 1**: Account Creation (email, password validation)
2. **Step 2**: Profile Info (name, branch, year, hostel, phone)
3. **Step 3**: Interests (select from predefined categories)
4. **Step 4**: Submit → Create profile → Redirect to dashboard

**Database Record**:
```
INSERT INTO students (
  name,
  email,
  branch,
  year,
  hostel,
  phone,
  interests,
  n_points (default 0),
  created_at (auto)
)
```

---

### 2.3 Dashboard Page (`app/dashboard/page.tsx`)

**Current Implementation**: ✅ Already implemented
- Uses `useCurrentStudent()` to check authentication
- Redirects to sign-in if not authenticated

**Redirect Logic**:
```
Dashboard Access:
├── User visits /dashboard
│   ├── If authenticated → Show dashboard
│   │   └── Fetch user data via hooks
│   │   └── Display overview, events, clubs, etc.
│   │
│   └── If NOT authenticated → Redirect to /sign-in
│       └── User must sign in first
│       └── After sign in, automatically goes to /dashboard
```

**Protected Route Pattern**:
```typescript
const { student, loading } = useCurrentStudent()
if (!student) return <Redirect to="/sign-in" />
```

---

### 2.4 Events Page (`app/events/page.tsx`)

**Current State**: Public access (no authentication required)
- Displays upcoming events to all users
- Can view details without signing in
- Sign up for event requires authentication (future feature)

---

### 2.5 Clubs Page (`app/clubs/page.tsx`)

**Current State**: Public access (no authentication required)
- Displays all clubs to all users
- Can view club details without signing in
- Join club requires authentication (future feature)

---

## 3. Complete User Journey Maps

### 3.1 New User Registration Journey

```
Landing Page (/)
    ↓
User clicks "Get Started" button (Hero or Navbar)
    ↓
/get-started page
    ├── Step 1: Create Account
    │   └── Email + Password validation
    ├── Step 2: Profile Information
    │   └── Name, Branch, Year, Hostel, Phone
    ├── Step 3: Select Interests
    │   └── Choose from available categories
    └── Step 4: Submit
        └── Supabase creates auth user
        └── Database creates student record
        └── Auto-login user
        ↓
    /dashboard
        └── Show welcome screen
        └── Display profile, points, events, clubs
        └── User can now access all features
```

**Success Conditions**:
- ✅ Email is unique
- ✅ Password meets requirements (8+ chars)
- ✅ All required fields filled
- ✅ Database record created successfully

**Error Handling**:
- ❌ Email already registered → Show error, suggest sign-in
- ❌ Password mismatch → Show password validation error
- ❌ Database error → Show generic error, suggest retry

---

### 3.2 Existing User Sign-In Journey

```
Landing Page (/)
    ↓
User clicks "Sign In" button (Navbar)
    ↓
/sign-in page
    ├── Enter email
    ├── Enter password
    └── Click "Sign In"
        └── Supabase authenticates
        ├── Success:
        │   └── Session created
        │   └── User redirected to /dashboard
        │
        └── Failure:
            └── Show error message
            └── User remains on sign-in page
            └── Suggest "Forgot Password?" (future feature)
```

---

### 3.3 User Exploring Public Pages

```
Landing Page (/)
    ↓
User can click:
├── "Features" → Scroll to features section
├── "Clubs" → Navigate to /clubs page
│   └── View all clubs
│   └── Browse by category
│   └── Click "Join" → Redirects to /sign-in (if not authenticated)
│
├── "Events" → Navigate to /events page
│   └── View upcoming events
│   └── Filter by type/club
│   └── Click "Register" → Redirects to /sign-in (if not authenticated)
│
├── "About" → Scroll to how-it-works section
│
└── Footer links → Navigate to corresponding pages
```

---

### 3.4 User Accessing Protected Features

```
Click "Register for Event" button
    ↓
Check: Is user authenticated?
    ├── Yes:
    │   └── Show registration modal/form
    │   └── Create registration record
    │   └── Show confirmation
    │
    └── No:
        └── Redirect to /sign-in
        └── Show message: "Sign in to register for events"
        └── After sign-in, can register for event
```

---

## 4. Route Structure Summary

### Public Routes (No Auth Required)
```
/                    → Landing page with all sections
/events             → Browse all events
/clubs              → Browse all clubs
/sign-in            → Sign-in form (for new sessions)
/get-started        → Registration form (for new users)
```

### Protected Routes (Auth Required)
```
/dashboard          → User dashboard (overview, wallet, registrations, etc.)
/dashboard/...      → All dashboard sub-routes
```

### Server-Side Redirects
```
Supabase Auth Session Management:
├── Session stored in localStorage
├── Checked on every page load via useCurrentStudent()
├── Persists across browser refresh
└── Cleared on sign-out/logout
```

---

## 5. Component Button Mapping

### 5.1 Navbar Buttons
| Button | Old Href | New Href | Action |
|--------|----------|----------|--------|
| Logo | (none) | `/` | Navigate to home |
| Sign In | (none) | `/sign-in` | Navigate to sign-in |
| Get Started | (none) | `/get-started` | Navigate to registration |

### 5.2 Navigation Links (unchanged)
| Link | Href | Action |
|------|------|--------|
| Features | `#features` | Scroll to features |
| Clubs | `#for-clubs` | Scroll to clubs |
| Events | `#events` | Scroll to events |
| About | `#how-it-works` | Scroll to about |

### 5.3 Hero Section Buttons
| Button | Old Href | New Href | Action |
|--------|----------|----------|--------|
| Get Started | (none) | `/get-started` | Navigate to registration |
| Watch Demo | (none) | (none) | No action (skipped) |

### 5.4 Upcoming Events Section
| Button | Href | Action |
|--------|------|--------|
| View All Events | `/events` | ✅ Already working |

### 5.5 For Clubs Section
| Button | Old Href | New Href | Action |
|--------|----------|----------|--------|
| Register Your Club | (none) | `/get-started` | Navigate to registration |

### 5.6 Footer Links
| Section | Old Links | New Links | Action |
|---------|-----------|-----------|--------|
| Platform | `#` | Events → `/events` | Navigate to pages |
| | | Clubs → `/clubs` | |
| | | Certificates → `/dashboard` | |
| | | N-Points → `/dashboard` | |
| Resources | `#` | `#` | TBD - create pages later |
| Legal | `#` | `#` | TBD - create pages later |

---

## 6. Database Integration Points

### 6.1 Sign-In Flow
```
POST /auth/v1/token (Supabase)
│
├── Validate email + password
├── Return JWT token
├── Store in localStorage
└── Frontend redirects to /dashboard
```

### 6.2 Registration Flow
```
1. POST /auth/v1/signup (Supabase)
   └── Create auth user
   └── Email + password stored
   └── Generate JWT token

2. INSERT INTO students (database)
   └── Create student record
   └── Link to auth user via email
   └── Set default points (0)
   └── Store preferences

3. Frontend redirects to /dashboard
   └── Load user profile
   └── Show onboarding complete
```

### 6.3 Dashboard Access
```
GET /dashboard
│
├── Check: sessionStorage has JWT?
├── Check: useAuth() hook validates
│
├── If valid:
│   └── Fetch student profile
│   └── Fetch user data (points, events, etc.)
│   └── Render dashboard
│
└── If invalid:
    └── Redirect to /sign-in
```

---

## 7. Error Handling & Edge Cases

### 7.1 Registration Errors
| Scenario | User Sees | Backend Action |
|----------|-----------|----------------|
| Email already exists | "This email is already registered. Sign in instead?" | Return 400 error |
| Password too short | "Password must be at least 8 characters" | Client-side validation |
| Passwords don't match | "Passwords do not match" | Client-side validation |
| DB insert fails | "Failed to create profile. Please try again." | Log error, suggest retry |

### 7.2 Sign-In Errors
| Scenario | User Sees | Backend Action |
|----------|-----------|----------------|
| Email not found | "Email not found. Please register first." | Return 400 error |
| Wrong password | "Invalid password. Please try again." | Return 400 error |
| Session error | "Session error. Please sign in again." | Clear localStorage, redirect |

### 7.3 Navigation Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| User clicks register, already signed in | Redirect to /dashboard (see welcome back) |
| User signs in, comes back to /get-started | Redirect to /dashboard |
| User signs out, visits /dashboard | Redirect to /sign-in |
| Session expires | Detect in useCurrentStudent(), redirect to /sign-in |

---

## 8. Session Management

### 8.1 Session Storage
```javascript
// Session stored in localStorage under key
localStorage.getItem('sb-khndrcgmunjgxlpdyxgz-auth-token')

// Structure:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "...",
  "expires_at": 1709336800,
  "user": {
    "id": "user-uuid",
    "email": "student@nitk.ac.in",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### 8.2 Session Validation
```typescript
// In useCurrentStudent() hook:
const session = await supabase.auth.getSession()
if (!session.data.session) {
  // Not authenticated
  return null
}
if (session.data.session.expires_at < Date.now()) {
  // Token expired
  return null
}
// Authenticated and valid
return session.data.session.user
```

### 8.3 Session Cleanup
```
Sign Out Flow:
├── Clear localStorage
├── Clear Supabase session
├── Redirect to /sign-in
└── All subsequent requests treated as unauthenticated
```

---

## 9. Implementation Checklist

- [x] Navbar: Add href to Sign In button → `/sign-in`
- [x] Navbar: Add href to Get Started button → `/get-started`
- [x] Hero: Add href to Get Started button → `/get-started`
- [x] For Clubs: Add href to Register Your Club → `/get-started`
- [x] Footer: Update Platform links to point to pages
- [x] Sign-in: Already has auth logic and redirect
- [x] Get-started: Already has auth logic and redirect
- [x] Dashboard: Already has auth guard and redirect
- [x] Events page: Public access confirmed
- [x] Clubs page: Public access confirmed
- [x] Create this documentation

---

## 10. Files Modified in This Session

### Component Files
1. **components/navbar.tsx**
   - Added `href="/sign-in"` to Sign In button
   - Added `href="/get-started"` to Get Started button
   - Added `href="/"` to Logo

2. **components/hero.tsx**
   - Added `href="/get-started"` to Get Started button
   - Watch Demo button intentionally left without action

3. **components/for-clubs.tsx**
   - Added `href="/get-started"` to Register Your Club button

4. **components/footer.tsx**
   - Updated Platform links with proper hrefs
   - Events → `/events`
   - Clubs → `/clubs`
   - Certificates → `/dashboard`
   - N-Points → `/dashboard`
   - Left Resources and Legal links as `#` (TBD)

### Page Files (Already Implemented)
1. **app/sign-in/page.tsx**
   - ✅ Auth flow logic implemented
   - ✅ Redirect to /dashboard on success
   - ✅ Redirect to /dashboard if already authenticated

2. **app/get-started/page.tsx**
   - ✅ Registration flow logic implemented
   - ✅ Redirect to /dashboard on success
   - ✅ Redirect to /dashboard if already authenticated

3. **app/dashboard/page.tsx**
   - ✅ Auth guard implemented
   - ✅ Redirect to /sign-in if not authenticated
   - ✅ Load user data from Supabase

---

## 11. Testing Checklist (For Next Developer)

- [ ] **Landing Page Navigation**
  - [ ] Click navbar "Sign In" → Goes to `/sign-in`
  - [ ] Click navbar "Get Started" → Goes to `/get-started`
  - [ ] Click navbar logo → Stays on home or goes to `/`
  - [ ] Click navbar feature links → Scrolls sections
  - [ ] Click hero "Get Started" → Goes to `/get-started`
  
- [ ] **Public Page Access**
  - [ ] `/events` loads without auth
  - [ ] `/clubs` loads without auth
  - [ ] Can view events and clubs while not signed in

- [ ] **Authentication Flow**
  - [ ] New user: Register via `/get-started` → Creates account → Redirects to `/dashboard`
  - [ ] Existing user: Sign in via `/sign-in` → Logs in → Redirects to `/dashboard`
  - [ ] Already signed in: Visit `/sign-in` → Redirects to `/dashboard`
  - [ ] Already signed in: Visit `/get-started` → Redirects to `/dashboard`
  
- [ ] **Protected Routes**
  - [ ] Not signed in: Visit `/dashboard` → Redirects to `/sign-in`
  - [ ] Signed in: Visit `/dashboard` → Loads dashboard

- [ ] **Footer Links**
  - [ ] Click "Events" → Goes to `/events`
  - [ ] Click "Clubs" → Goes to `/clubs`
  - [ ] Click "Certificates" → Goes to `/dashboard`
  - [ ] Click "N-Points" → Goes to `/dashboard`

---

## 12. Future Enhancements (Outside Current Scope)

- [ ] Watch Demo button → Link to video or live demo
- [ ] Forgot Password flow → Email verification
- [ ] Email verification on signup → Confirmation required before access
- [ ] Two-factor authentication → Optional security feature
- [ ] Social login (Google, GitHub) → Alternative auth methods
- [ ] Resources and Legal pages → Create actual pages for footer links
- [ ] User settings/profile edit → Allow profile updates post-registration
- [ ] Sign-out button → Add to dashboard/navbar

---

**Document Version**: 1.0  
**Last Updated**: 1 March 2026  
**Next Review**: After implementation and testing

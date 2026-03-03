# NITK Nexus - Complete Technical Blueprint

**Project Description:** A unified campus life application for NITK students and clubs. It handles student onboarding, AI-driven event discovery, registration management, ticketing/N-points, real-time notifications, and club administration (event creation, analytics, attendee scanning).

**Current Status:** Phase 2 (Core Portals & UI) Complete, Phase 3 (Integrity & Pipelines) In Progress.

---

## 1. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `shadcn/ui` components
- **Backend/Database:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Animations/3D:** Framer Motion, React Three Fiber, Drei, canvas-confetti
- **Icons:** Lucide React

---

## 2. Supabase Database Schema

The core PostgreSQL database consists of 14 strictly typed tables using Foreign Keys and ENUM constraints.

**Core Tables:**
1.  **`users/auth` (Supabase Auth)**: Managed by Supabase for Student Sign-up/Sign-in.
2.  **`students`**: User profiles.
    *   Columns: `id` (UUID), `auth_id` (UUID, references auth.users), `name`, `email`, `branch`, `year`, `hostel`, `phone`, `n_points` (INT, default 0), `interests` (JSONB array).
3.  **`club_credentials`**: Custom auth table for Club Admin login (Bypasses Supabase Auth).
    *   Columns: `id` (UUID), `club_id` (TEXT, unique), `password` (TEXT, **currently plain-text**), `club_name`.
4.  **`events`**: Created by clubs.
    *   Columns: `id` (UUID), `club_id` (TEXT, references club_credentials), `title`, `description`, `type` (ENUM: Workshop, Hackathon, etc.), `venue`, `start_time` (TIMESTAMPTZ), `max_participants` (INT), `current_registrations` (INT, default 0), `n_points` (INT), `is_paid` (BOOLEAN), `price` (INT).
5.  **`registrations`**: Junction table for student-event signups.
    *   Columns: `id`, `student_id` (references students), `event_id` (references events), `status` (ENUM: Pending, Confirmed, Attended, Cancelled), `created_at`.
6.  **`notifications`**: User inbox.
    *   Columns: `id`, `student_id` (references students), `title`, `message`, `type` (ENUM), `read` (BOOLEAN), `created_at`.
7.  **`certificates`**: Digital proof of attendance.

**PostgreSQL Automation (Triggers):**
The database handles heavy lifting natively:
-   **N-Points Trigger**: When `registrations.status` updates to 'Attended', the student's `n_points` are automatically incremented by the `events.n_points` value.
-   **Notification Triggers**: Automatically inserts rows into the `notifications` table on:
    -   Registration Confirmation.
    -   Certificate generation.
    -   FOMO Alerts (If `current_registrations` > 80% of `max_participants`, alerts all non-registered students with matching interests).

**Row Level Security (RLS):**
-   Active on most tables.
-   Students can only `SELECT/UPDATE` rows where `student_id = auth.uid()`.
-   `events` table has an explicit `INSERT` policy allowing anonymous keys if triggered via standard Supabase client (necessary for the custom Club Auth flow).

---

## 3. Current State: Production vs. Mocked

Exactly what is live and functioning, and what is returning fake data.

### 🟢 Production (Fully Functioning & Live in DB)
1.  **Student Authentication**: Supabase Auth (Sign-in, OTP, Session management) is 100% live.
2.  **Club Authentication**: Custom login flow against `club_credentials` table is fully functioning.
3.  **Student Onboarding**: The multi-step "Complete Profile" flow saves real data to the `students` table via an RPC function (`create_student_profile`) ensuring server-side `auth_id` enforcement.
4.  **Event Discovery (Student Dashboard)**: Pulls real events from the `events` table. Filters (Upcoming, Past, Type) execute real SQL queries.
5.  **Event Registration**: Clicking "Register" inserts a real row into the `registrations` table and updates `events.current_registrations`.
6.  **Real-time Notifications**: The bell icon uses Supabase Realtime subscriptions to update instantly when a DB Trigger fires.
7.  **Manage Events (Club Dashboard)**: Queries the DB for events owned by the specific `club_id`.
8.  **Multi-Step Event Creation Pipeline (Club Dashboard)**: Forms accept input, render a Live Preview `EventCard`, and execute a Server Action successfully inserting the row into the `events` table (with Confetti success animation).

### 🟡 Mocked / Placeholder (Needs Implementation)
1.  **AI Recommendations Engine ("For You" Tab)**:
    *   *Current State*: Uses a fast *Rule-Based Heuristic* algorithm in the frontend (matching student tags to event type/tags and boosting high N-Point events). It does *not* utilize an LLM (Groq/OpenAI) yet.
2.  **QR Code Attendance Scanner (Club Dashboard)**:
    *   *Current State*: The UI exists, but clicking "Scan" does not trigger device cameras or process real UUIDs. It needs `html5-qrcode` integrated to update `registrations.status` to 'Attended'.
3.  **Payment Gateway (Ticketing)**:
    *   *Current State*: Paid events simply mark registration status as "Pending". There is no Razorpay/Stripe checkout webhook integration.
4.  **AI Edge Functions (Waitlist/Reservations)**:
    *   *Current State*: Waitlist/atomic reservation logic exists in deployed Supabase Edge Functions (`purchase-handler`), but the frontend does not explicitly call them during standard registrations yet.

---

## 4. Areas of Doubt / In Review

Features that technically work, but may have edge cases or architectural flaws needing review:

1.  **The Club Authentication Bypass Flow**:
    *   *Doubt*: Clubs log in via `/club-login`, which checks the `club_credentials` table, sets a custom encrypted cookie (`club_session`), and uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` for database interactions (skipping Supabase Auth JWTs).
    *   *Review*: While this works, it means RLS policies for Club actions (like creating events) must explicitly allow anonymous inserts or use Service Role keys in Server Actions. I recently patched an RLS failure here, but this architecture is inherently fragile compared to standard Supabase Auth.
2.  **Event Registration Concurrency**:
    *   *Doubt*: When a student clicks Register, it currently executes a frontend `.insert()` into `registrations`.
    *   *Review*: If an event has 1 remaining capacity, and two students click Register at the exact same millisecond, both might succeed. We need database-level locking (Transactions) or to route all registrations through the `purchase-handler` Edge Function for atomic safety.

---

## 5. Security & Integrity Recommendations

If assigning this project to an AI for the next development sprints, prioritize the following:

### Priority 1: Hash Club Passwords (CRITICAL)
-   **Issue**: `club_credentials.password` stores passwords in raw plain-text.
-   **Solution**: Write a PostgreSQL migration using the `pgcrypto` extension to hash all existing passwords. Update `/club-login/actions.ts` to use `crypt(input_password, stored_hash)` during authentication.

### Priority 2: Atomic Transactions for Registrations
-   **Issue**: Race conditions on event max capacity.
-   **Solution**: Move the registration logic from the client-side `supabase.from('registrations').insert()` to a PostgreSQL RPC function: `register_for_event(student_id, event_id)`. The RPC should use `FOR UPDATE` row locking to ensure `current_registrations < max_participants` before inserting.

### Priority 3: Rate Limiting
-   **Issue**: Malicious users could spam the registration endpoint or the AI recommendation endpoint.
-   **Solution**: Implement Redis-based rate limiting (e.g., Upstash) in Next.js Middleware or within the specific Server Actions.

### Priority 4: Standardize Club Auth
-   **Suggestion**: Instead of a custom `club_credentials` table and custom JWT cookie generation, consider migrating Clubs to standard Supabase Auth users. Assign them a custom Postgres claim or a role (`user_role = 'club_admin'`) so RLS functions normally via `auth.uid()`.

---

## 6. Next Steps for AI Agent
When an AI agent takes over, it should execute the following sequence:

1.  **Implement `html5-qrcode`**: Make the Attendance Scanner physically work to test the N-Points database trigger.
2.  **Implement Club Password Hashing**: Secure the platform `club_credentials`.
3.  **Migrate Registration to RPC**: Fix the concurrency issue noted in Section 4 & 5.
4.  **Integrate Payment Gateway**: (Optional) Connect pending paid registrations to a Razorpay test environment.

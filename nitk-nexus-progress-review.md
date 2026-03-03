# NITK Nexus - Progress Review vs. AI Vision Blueprint

This document serves as a direct comparison between the original **v0.dev AI Prompts** (the idealized vision for NITK Nexus) and the **current real-world implementation** (what we have actually built). 

It highlights exactly what is functioning in production, what is mocked, and what massive feature sets are still entirely missing and need to be built in Future Development Phases.

---

## 1. Student Features: Discover Events

### The Vision (v0 Prompts)
*   **Filters**: Horizontal pills for "For You, Trending, This Week, Technical, Cultural, Free Entry".
*   **Card Types**: Specialized UI cards for "Perfect Match" (>85% relevance with glow effect), "Trending" (pulse animation), "Friend Activity" (avatars), and "Almost Full" (countdown timers).
*   **AI Insights Widget**: A sticky widget showing streak, most active day, favorite club, and suggestions to diversify.
*   **Real AI Engine**: Utilizing Groq/OpenAI to generate custom relevance scores out of 100%.

### Where We Are Now (Current Progress)
*   🟢 **Implemented**: A beautiful, infinite-scroll "Discover Events" feed (`/events`) that pulls real events from the database. 
*   🟢 **Implemented**: Basic filters (All, Upcoming, Past, Type dropdowns) that execute real Supabase queries.
*   🟡 **Mocked/Partial**: Our AI recommendations are currently a fast *Heuristic Algorithm*. It matches tags and boosts high N-Point events, but it does not use a real LLM or generate dynamic text like "Recommended because you attended 3 ML events before".
*   🔴 **Missing**: Specialized UI cards (no "Friend Activity" avatars, no "Trending" pulse badges). The sticky AI Insights Widget is completely missing.

---

## 2. Student Features: My Registrations

### The Vision (v0 Prompts)
*   **Tabs**: Upcoming, Past, Cancelled.
*   **QR Code Modal**: Clickable "Show QR Code" that generates a unique QR for physical event check-in, capable of being saved to Apple/Google Wallet.
*   **Team Section**: For team events, showing 4 teammate avatars with status.
*   **Attendance Live Tracking**: Changes to "Attended" or "Missed" with points earned after event completion.

### Where We Are Now (Current Progress)
*   🟢 **Implemented**: The "My Events" student dashboard tab heavily queries the `registrations` table joined with the `events` table. It correctly sorts events into Upcoming and Past based on the `start_time`.
*   🟢 **Implemented**: A basic QR code modal exists and renders a QR code based on the student's `auth_id`.
*   🔴 **Missing**: The 'Cancelled' tab does not exist. There is no logic for "Team Events" (everything is assumed to be an individual registration right now). There is no "Add to Apple Wallet" functionality.

---

## 3. Student Features: My Certificates & My Wallet

### The Vision (v0 Prompts)
*   **Certificates Showcase**: Visual grids of certificates with "Verified by SAC" badges.
*   **Certificate Modal**: Full A4 preview, zoom controls, and a direct "Share on LinkedIn" API integration with pre-filled text.
*   **Wallet / Rewards Store**: A store to spend N-points on "₹50 Canteen Vouchers" or "NITK T-Shirts".
*   **Leaderboard**: Global and branch-specific leaderboards ranking students by N-Points.

### Where We Are Now (Current Progress)
*   🟢 **Implemented**: The database schema supports `certificates` and `n_points`. The framework for earning points is rock solid (PostgreSQL triggers automatically award N-points upon attendance).
*   🟡 **Mocked/Partial**: The UI has tabs for "Certificates" and "Leaderboard", but they are currently returning static placeholder arrays.
*   🔴 **Missing**: There is absolutely no "Rewards Store" or "My Vouchers" UI built. Real PDF generation (`jsPDF`) for certificates is not implemented. LinkedIn API integration is not implemented.

---

## 4. Club Dashboard Features

### The Vision (v0 Prompts)
*   **Overview Stats**: Line graphs showing member engagement over time.
*   **Pending Tasks**: Actionable checklists to approve members or answer messages.
*   **Registration Management**: Bulk emailing students, exporting to CSV, generating name tags.
*   **QR Scanner**: WebRTC camera scanner to instantly mark students as 'Attended'.
*   **Analytics Tab**: Deep data visualization of growth rate, popularity metrics, and AI-generated insights ("Consider scheduling more events on Tuesdays").

### Where We Are Now (Current Progress)
*   🟢 **Implemented**: Clean Club Navigation layout. 
*   🟢 **Implemented**: Working "Manage Events" tab with real-time creation (Draft -> Preview -> Confirm).
*   🟡 **Mocked/Partial**: The "Analytics" tab has placeholder charts. The "Scanner" tab exists, but the "Scan" button just triggers a mock success toast; it does not turn on the camera via `html5-qrcode`.
*   🔴 **Missing**: Member Management (requests to join a club) is not built. Bulk emailing students is not built. CSV Exports are not built.

---

## 5. 3D Animations & Aesthetic Polish

### The Vision (v0 Prompts)
*   Floating geometric shapes in the background with mouse parallax.
*   Interconnected network nodes for the features section.
*   Event cards exploding with 3D particles on hover.

### Where We Are Now (Current Progress)
*   🟢 **Implemented**: We successfully integrated `react-three-fiber`! We built the floating geometric shapes background for the landing page with mouse parallax interactivity.
*   🟢 **Implemented**: We successfully integrated `canvas-confetti` upon successful event creation and successful profile completion.
*   🔴 **Missing**: Particle explosions on event card hovers were skipped for performance concerns. The interconnected network nodes were deemed overkill for the current sprint.

---

## Conclusion & Action Plan for Future AI Agents

NITK Nexus currently has a **rock-solid foundation** (Auth, Schema, Routing, Forms, DB Triggers) and highly polished **core workflows** (Event Creation & Discovery). The database handles integrity beautifully.

However, the "Gamification" and "Club Tooling" layers outlined in the v0.dev prompts are what remain to be built.

### Immediate Next Sprints (The "Missing" Features):

1.  **The Scanner Execution**: Implement `html5-qrcode` in the Club Dashboard. Have it read the student's QR, call a Supabase RPC to update the `registration` to 'Attended', which will fire our DB trigger and officially award the student N-Points in production.
2.  **The Leaderboard & Wallet**: Feed real `student.n_points` data into the Leaderboard tab. Build the Rewards Store UI so students can actually spend the points they are earning.
3.  **Certificate Generation**: Implement a library like `@react-pdf/renderer` or `jsPDF` to generate actual downloadable PDFs when a club clicks "Issue Certificates".
4.  **Security Sweep**: Hash the plain-text passwords in `club_credentials` using `pgcrypto`. Wrap the registration logic in an atomic SQL Transaction.

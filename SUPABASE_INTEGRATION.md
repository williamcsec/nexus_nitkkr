# Supabase Integration Log

This document tracks all changes made to connect the Next.js application to Supabase in a production-ready way. It will serve both as a checklist and as a debugging/history record.

## 2026-03-01 – Initial setup
- Created this file.
- Reviewed existing code: landing page, events, clubs, dashboard, sign-in/get-started.
- Noticed previous "quick MVP" login logic using manual student lookup; plan to replace with Supabase Auth.
- Supabase schema provided (CSV) shows complete domain model: students, events, clubs, registrations, certificates, vault etc.
- Decided to implement full Supabase Auth and drop all mock data. New hooks to fetch from backend will be added.

## Next actions (today)
- [ ] Implement Supabase Auth in sign-in & get-started flows.
- [ ] Update `use-current-student` to rely on auth session.
- [ ] Protect dashboard routes.
- [ ] Create new hooks where missing: clubs, student points, vouchers.
- [ ] Remove mock-data imports from pages and components after rewriting queries.
- [ ] Update registration/certificates hooks to join event/club names.
- [ ] Add dashboard overview logic fetching profile, points etc.
- [ ] Add production error/loading UI.
- [ ] Test end-to-end with real Supabase data.

Further sections will be added as tasks complete.
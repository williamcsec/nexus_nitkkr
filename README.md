# NITK Nexus - Project Overview & Developer Guide

Welcome to the **NITK Nexus** repository! This is the unified campus life platform for NIT Kurukshetra, blending clubs, events, certificates, and an N-Points reward system into a single cohesive interface.

This guide will help anyone cloning the repository to quickly set up their environment and provide crucial guidelines for contributing—especially to the frontend—**without breaking the existing backend and data structures**.

---

## 🚀 Quick Setup & Installation

We provide an automated setup script to ensure you get up and running seamlessly:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/nitk-nexus.git
   cd nitk-nexus
   ```

2. **Run the Automated Setup:**
   Make the script executable and run it:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   **What the script does:**
   - Checks for `Node.js` (v18+).
   - Installs `pnpm` globally if not found, as this project uses `pnpm`.
   - Runs `pnpm install` to download all project dependencies.
   - Bootstraps your `.env.local` configuration.

3. **Update `.env.local`:**
   After the script runs, open `.env.local` and add your **Supabase details**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Reach out to the project administrator for these keys if you don't have them).*

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

---

## 🏗️ Project Architecture

We are using a modern **Next.js 16 (App Router)** setup:
- **Framework:** Next.js + React 19
- **Database/Backend:** Supabase (Postgres, Auth, Edge Functions, RLS Policies)
- **Styling:** Tailwind CSS v4 + `tw-animate-css` + OKLCH color tokenization
- **UI Components:** Shadcn/ui pattern (Radix Primitives)
- **Data Hook Pattern:** Extrapolated into `hooks/` to decouple UI from DB logic.

---

## 🎨 Frontend & Animation Development Guidelines
### **CRITICAL: How to Avoid Breaking the Application**

As the project scales—and especially if you are working on frontend tweaks, new animations, or UI/UX improvements—you **must** follow these rules to ensure the underlying Supabase hooks, forms, and Row-Level Security (RLS) rules remain unaffected.

### 1. Do NOT Move or Mutate Data Fetching Logic (`hooks/`)
All backend interaction logic is safely abstracted away inside custom React hooks (e.g., `useCurrentStudent`, `useSupabaseEvents`, `useSupabaseRegistrations`). 
- **Rule:** When modifying a page's layout (e.g., `app/dashboard/page.tsx`), you may restyle the structural HTML, add Framer Motion or Tailwind animations, and restructure the `className` attributes. 
- **Don't:** Do not remove the hook initializations or alter the structure of the data objects returned.

### 2. Preserve Auth Protection Mechanisms
Authentication utilizes robust Supabase OAuth and Row-Level Security:
- Avoid deleting `useEffect` checks for user sessions (like `checkingAuth` state).
- The `useCurrentStudent()` hook manages the correlation between `supabase.auth` and the Postgres `students` table via `auth_id`. If you're building loading skeletons or transition animations, ensure you handle the `loading` state exported by this hook correctly, instead of bypassing it.

### 3. Maintain Shadcn UI "Primitives"
The project uses `components/ui/` for low-level Radical-based components (Buttons, Dialogs, Inputs).
- **Tweaking styles:** You can safely modify `globals.css` (OKLCH variables) or update the variants inside the `components/ui/*.tsx` files using `class-variance-authority` (CVA).
- **Adding Animations:** Add Tailwind animation classes (`animate-*`) or integrate framer-motion within the parent wrappers containing these primitives, rather than completely rewriting the primitives themselves.

### 4. Forms and Zod Schemas
If you are restyling the forms (e.g., the Get Started or Complete Profile wizards):
- The `react-hook-form` logic heavily relies on `zod` validation and `name` attributes matching database schemas.
- Restyle the form containers, layout grids, and buttons.
- Do not change the `name={...}` props passed into `<FormField>` or the `onServerAction`/`onSubmit` logic that posts to Supabase. This directly maps to RLS policies ensuring a student can only modify their own profile.

### 5. Using the Mock Data vs Live Data
When designing a new page or building out complex animations, you can temporarily rely on the components in `lib/mock-data.ts`.
- **How to test safely:** Pass mock arrays into your newly designed visual components to verify animations (e.g., a staggered grid layout for the `EventCard`). 
- **Once polished:** Swap the mock array for the response from the actual custom hook (e.g., `const { events } = useSupabaseEvents()`).

### 6. Tailwind v4 Details
This project utilizes the newest version of Tailwind CSS (v4) paired with `@tailwindcss/postcss`. 
- Please write standard utility classes. 
- Global theme variables are stored in `app/globals.css`. If you plan on adding brand colors or gradients for the new frontend tasks, declare them as OKLCH tokens in `:root` and `@theme inline` inside `globals.css` rather than hardcoding hex colors.

---

## 📂 Key Folders to Know

| Path | Purpose | Can I edit freely? |
|------|---------|---------------------|
| `app/` | Next.js Page routes | **Yes** (Layout/UI only, preserve logic) |
| `components/` | Modular UI pieces & Blocks | **Yes** (Restyling welcome) |
| `hooks/` | Supabase data fetching logic | **No** (Core logic resides here) |
| `lib/supabaseClient.ts` | The API integration gateway | **No** |
| `lib/types.ts` | Shared TypeScript entity models | **Yes** (Expand as needed) |

Happy coding, and let's make NITK Nexus incredible!
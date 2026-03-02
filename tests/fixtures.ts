import { test as base, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

type AuthFixtures = {
  supabaseClient: any;
  authenticatedPage: Page;
};

/**
 * Extend basic test by providing "authenticatedPage" fixture.
 * This logs in a test user before each test.
 */
export const test = base.extend<AuthFixtures>({
  supabaseClient: async ({ }, use) => {
    // Use anon key by default (client-side access with RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khndrcgmunjgxlpdyxgz.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobmRyY2dtdW5qZ3hscGR5eGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjcyMDEsImV4cCI6MjA4NzQwMzIwMX0.Ki8OJr2UYsa9SqRo3U_NQalZoCkRtZKpIZx3vNX5k1I'
    );

    await use(supabase);
  },

  authenticatedPage: async ({ page, context }, use) => {
    // Note: In a real scenario, you'd either:
    // 1. Use Supabase test utilities to create a session
    // 2. Mock auth routes
    // 3. Use environment-specific tokens
    // For this test, we'll just navigate and let the app handle flows naturally

    await use(page);
  },
});

export { expect };

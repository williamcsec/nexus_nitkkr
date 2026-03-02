"use client";

import { useState, useEffect } from "react";

/**
 * Hook to manage email entered in the landing page CTA section.
 * Stores the email in sessionStorage so it persists across navigation
 * and can be used to pre-fill the registration form.
 */
export function useLandingEmail(): [string, (email: string) => void] {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("landingEmail") || "";
    if (stored) {
      setEmail(stored);
    }
  }, []);

  const setAndStore = (e: string) => {
    setEmail(e);
    sessionStorage.setItem("landingEmail", e);
  };

  return [email, setAndStore];
}

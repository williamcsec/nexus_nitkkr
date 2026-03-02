"use client";

import Link from "next/link";
import { useLandingEmail } from "@/hooks/use-landing-email";

interface GetStartedLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

/**
 * Smart "Get Started" link that automatically includes the user's
 * email from the landing page CTA in the query string if available.
 */
export function GetStartedLink({
  children,
  className,
  ...props
}: GetStartedLinkProps) {
  const [email] = useLandingEmail();
  const href = email
    ? `/get-started?email=${encodeURIComponent(email)}`
    : "/get-started";

  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

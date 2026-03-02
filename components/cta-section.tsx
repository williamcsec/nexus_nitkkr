"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLandingEmail } from "@/hooks/use-landing-email"

export function CTASection() {
  const [email, setEmailLocal] = useState("")
  const [, setStoredEmail] = useLandingEmail()
  const router = useRouter()

  function handleJoin() {
    const trimmed = email.trim()
    if (trimmed) {
      setStoredEmail(trimmed)
      router.push(`/get-started?email=${encodeURIComponent(trimmed)}`)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setEmailLocal(val)
    setStoredEmail(val)
  }

  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-secondary/20 to-card p-10 text-center md:p-16">
          {/* Subtle background glow */}
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
              Ready to transform your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                campus experience?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
              Join thousands of NITK students already using Nexus. Sign up
              with your college email and get started in seconds.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="flex w-full max-w-sm overflow-hidden rounded-lg border border-border bg-background/50 backdrop-blur-sm sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="your.name@nitk.edu.in"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  aria-label="Email address"
                />
                <Button
                  onClick={handleJoin}
                  className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 gap-1 px-6"
                >
                  Join
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Free forever for NITK students. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

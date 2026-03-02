"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, BarChart3, Users, Bell, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Track event attendance, member engagement, and growth metrics at a glance.",
  },
  {
    icon: Users,
    title: "Member management",
    description: "Streamline onboarding, roles, and communication for your entire team.",
  },
  {
    icon: Bell,
    title: "Automated notifications",
    description: "Send event reminders, updates, and announcements effortlessly.",
  },
  {
    icon: Shield,
    title: "Verified club page",
    description: "Get an official presence on the platform that students trust.",
  },
]

export function ForClubs() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="for-clubs" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div
          ref={ref}
          className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 transition-all duration-700 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
          }`}
        >
          {/* Visual side */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto lg:mx-0 rounded-2xl border border-border bg-gradient-to-br from-card via-card/80 to-secondary/30 p-8 backdrop-blur-sm">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Club Dashboard Preview
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded-full bg-muted" />
                    <div className="h-3 w-1/2 rounded-full bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-mono text-2xl font-bold text-primary">128</p>
                    <p className="text-xs text-muted-foreground">Active members</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-mono text-2xl font-bold text-accent">94%</p>
                    <p className="text-xs text-muted-foreground">Attendance rate</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-mono text-2xl font-bold text-chart-4">12</p>
                    <p className="text-xs text-muted-foreground">Events this month</p>
                  </div>
                  <div className="rounded-lg border border-border bg-background/50 p-4">
                    <p className="font-mono text-2xl font-bold text-chart-3">4.8</p>
                    <p className="text-xs text-muted-foreground">Avg. rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              For Clubs
            </p>
            <h2 className="mb-6 font-mono text-3xl font-bold text-foreground md:text-4xl text-balance">
              Supercharge your club{"'"}s impact
            </h2>
            <p className="mb-8 text-muted-foreground leading-relaxed">
              Powerful tools designed for club coordinators to manage events,
              track engagement, and grow their community — all from one dashboard.
            </p>

            <div className="mb-8 space-y-5">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card/50">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              <a href="/get-started" className="flex items-center gap-2">
                Register Your Club
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

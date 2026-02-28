"use client"

import { useEffect, useRef, useState } from "react"
import { Mail, Compass, Medal } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "Sign up with college email",
    description:
      "Use your official NITK email to create an account. Instant verification, zero friction.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Discover events for you",
    description:
      "Our AI matches you with events based on your interests, schedule, and participation history.",
  },
  {
    number: "03",
    icon: Medal,
    title: "Participate, earn, grow",
    description:
      "Attend events, collect certificates, earn N-Points, and build your campus portfolio.",
  },
]

function Step({
  step,
  index,
}: {
  step: (typeof steps)[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const Icon = step.icon

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center text-center transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <span className="absolute -top-3 -right-3 font-mono text-sm font-bold text-primary">
          {step.number}
        </span>
      </div>
      <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
        {step.title}
      </h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {step.description}
      </p>
    </div>
  )
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            Get started in{" "}
            <span className="text-muted-foreground">3 simple steps</span>
          </h2>
        </div>

        <div className="relative grid gap-16 md:grid-cols-3 md:gap-8">
          {/* Connector line */}
          <div className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => (
            <Step key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

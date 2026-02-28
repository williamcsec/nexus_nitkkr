"use client"

import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  QrCode,
  Award,
  Trophy,
  BarChart3,
  Brain,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Smart Event Discovery",
    description:
      "AI-powered recommendations based on your interests, past attendance, and academic schedule.",
    color: "from-primary to-primary/60",
  },
  {
    icon: QrCode,
    title: "QR Attendance",
    description:
      "Scan once, mark attendance instantly. No more manual registers or lost records.",
    color: "from-chart-1 to-chart-1/60",
  },
  {
    icon: Award,
    title: "Digital Certificates",
    description:
      "Auto-generated, verifiable certificates for every event you participate in.",
    color: "from-chart-3 to-chart-3/60",
  },
  {
    icon: Trophy,
    title: "N-Points Rewards",
    description:
      "Earn points for participation, volunteering, and organizing. Redeem for campus perks.",
    color: "from-chart-4 to-chart-4/60",
  },
  {
    icon: BarChart3,
    title: "Club Analytics",
    description:
      "Real-time dashboards for club coordinators to track engagement and growth.",
    color: "from-chart-5 to-chart-5/60",
  },
  {
    icon: Brain,
    title: "AI Recommendations",
    description:
      "Get personalized event and club suggestions tailored to your profile and goals.",
    color: "from-accent to-accent/60",
  },
]

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0]
  index: number
}) {
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

  const Icon = feature.icon

  return (
    <div
      ref={ref}
      className={`group relative rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} opacity-80`}
      >
        <Icon className="h-6 w-6 text-foreground" />
      </div>
      <h3 className="mb-2 font-mono text-lg font-semibold text-foreground">
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
            Everything you need,{" "}
            <span className="text-muted-foreground">nothing you don{"'"}t</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

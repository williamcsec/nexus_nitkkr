"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Building2, CalendarDays, FileCheck } from "lucide-react"

import { useLandingStats } from "@/hooks/use-landing-stats"

const STAT_CONFIG = [
  { icon: Users, key: "students" as const, label: "Students" },
  { icon: Building2, key: "clubs" as const, label: "Clubs" },
  { icon: CalendarDays, key: "eventsMonthly" as const, label: "Events Monthly" },
  { icon: FileCheck, key: "certificates" as const, label: "Certificates Issued" },
]

function useCountUp(target: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    let startTime: number | null = null
    let rafId: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        rafId = requestAnimationFrame(animate)
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [target, isVisible, duration])

  return count
}

type StatConfig = (typeof STAT_CONFIG)[number]

function StatItem({
  stat,
  value,
}: {
  stat: StatConfig
  value: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const count = useCountUp(value, isVisible)
  const Icon = stat.icon

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 p-6">
      <Icon className="h-8 w-8 text-primary" />
      <div className="font-mono text-4xl font-bold text-foreground md:text-5xl">
        {count.toLocaleString()}
      </div>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  )
}

export function Stats() {
  const { stats, loading, error } = useLandingStats()

  const valuesByKey = {
    students: stats.students,
    clubs: stats.clubs,
    eventsMonthly: stats.eventsMonthly,
    certificates: stats.certificates,
  }

  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
          <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
            {STAT_CONFIG.map((stat) => (
              <StatItem
                key={stat.label}
                stat={stat}
                value={valuesByKey[stat.key]}
              />
            ))}
          </div>
        </div>
        {loading && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Loading stats from Supabase…
          </p>
        )}
        {error && !loading && (
          <p className="mt-3 text-center text-xs text-destructive">
            Failed to load live stats from Supabase. ({error})
          </p>
        )}
      </div>
    </section>
  )
}

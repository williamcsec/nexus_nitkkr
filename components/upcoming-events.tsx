"use client"

import { CalendarDays, Clock, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { useSupabaseEvents } from "@/hooks/use-supabase-events"

export function UpcomingEvents() {
  const { events, loading, error } = useSupabaseEvents()

  const now = new Date()
  const upcoming = events
    .filter((event) => {
      const date = new Date(event.date)
      return !Number.isNaN(date.getTime()) && date >= now
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  return (
    <section id="events" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              Upcoming Events
            </p>
            <h2 className="font-mono text-3xl font-bold text-foreground md:text-5xl text-balance">
              {"Don't"} miss out
            </h2>
          </div>
          <Button asChild variant="outline" className="gap-2 border-border text-foreground hover:bg-secondary">
            <Link href="/events">
              View All Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {upcoming.map((event) => (
            <div
              key={event.title}
              className="group rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium bg-primary/20 text-primary"
                >
                  {event.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {event.club}
                </span>
              </div>

              <h3 className="mb-4 font-mono text-lg font-semibold text-foreground">
                {event.title}
              </h3>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.venue}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                Register
              </Button>
            </div>
          ))}
          {!loading && !error && upcoming.length === 0 && (
            <p className="col-span-3 text-center text-sm text-muted-foreground">
              No upcoming events yet. Check back soon.
            </p>
          )}
          {error && (
            <p className="col-span-3 text-center text-sm text-destructive">
              Failed to load upcoming events from Supabase. ({error})
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

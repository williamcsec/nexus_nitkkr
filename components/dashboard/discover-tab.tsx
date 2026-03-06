"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/event-card"
import { cn } from "@/lib/utils"
import { useSupabaseEvents } from "@/hooks/use-supabase-events"

const filterChips = ["For You", "Trending", "This Week", "Free", "Hackathons", "Workshops", "Expired"]

export function DiscoverTab() {
  const { events: liveEvents, loading, error } = useSupabaseEvents()
  const [activeFilter, setActiveFilter] = useState("For You")

  const sortedEvents = [...liveEvents].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  let filtered = activeFilter === "Expired"
    ? sortedEvents.filter((e) => e.isExpired)
    : sortedEvents.filter((e) => !e.isExpired).filter((e) => {
      if (activeFilter === "For You") return true
      if (activeFilter === "Trending") return e.maxCapacity > 0 && e.registrations / e.maxCapacity > 0.7
      if (activeFilter === "This Week") {
        const d = new Date(e.date)
        const now = new Date()
        const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return d >= now && d <= weekEnd
      }
      if (activeFilter === "Free") return !e.isPaid
      if (activeFilter === "Hackathons") return e.type === "Hackathon"
      if (activeFilter === "Workshops") return e.type === "Workshop"
      return true
    })

  return (
    <div className="space-y-6">
      {/* AI Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Smart Recommendations</p>
          <p className="text-xs text-muted-foreground">
            Events are ranked by your interests, past attendance, and popularity among similar students.
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button
            key={chip}
            onClick={() => setActiveFilter(chip)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              activeFilter === chip
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {loading && (
        <p className="py-12 text-center text-muted-foreground">Loading events...</p>
      )}
      {error && (
        <p className="py-12 text-center text-destructive">Failed to load events: {error}</p>
      )}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} showMatch />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try a different filter</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

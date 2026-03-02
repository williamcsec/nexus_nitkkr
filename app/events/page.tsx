"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { EventCard } from "@/components/event-card"
import { cn } from "@/lib/utils"
import { useSupabaseEvents } from "@/hooks/use-supabase-events"

const quickFilters = ["All", "Today", "This Week", "Free", "Paid"]
const eventTypes = ["Workshop", "Hackathon", "Competition", "Seminar", "Cultural", "Sports", "Social"]

type ClubOption = {
  id: string
  name: string
}

function FilterSidebar({
  selectedTypes,
  toggleType,
  selectedClub,
  setSelectedClub,
  clubs,
}: {
  selectedTypes: string[]
  toggleType: (t: string) => void
  selectedClub: string
  setSelectedClub: (c: string) => void
  clubs: ClubOption[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Event Type</h4>
        <div className="space-y-2">
          {eventTypes.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Checkbox
                checked={selectedTypes.includes(type)}
                onCheckedChange={() => toggleType(type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Club</h4>
        <Select value={selectedClub} onValueChange={setSelectedClub}>
          <SelectTrigger className="h-9 border-border bg-secondary/50 text-foreground text-sm">
            <SelectValue placeholder="All clubs" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-foreground">
              All Clubs
            </SelectItem>
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id} className="text-foreground">
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-foreground">Registration</h4>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Checkbox />
            Spots Available
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Checkbox />
            Almost Full
          </label>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { events: liveEvents, clubs: liveClubs, loading, error } = useSupabaseEvents()
  const [search, setSearch] = useState("")
  const [quickFilter, setQuickFilter] = useState("All")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedClub, setSelectedClub] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [view, setView] = useState<"grid" | "list">("grid")

  const baseEvents = liveEvents // use whatever comes back (empty array possible)
  const clubOptions: ClubOption[] = liveClubs.map((c) => ({ id: c.id, name: c.name }))

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const filtered = useMemo(() => {
    let result = [...baseEvents]

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.clubName.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    // Quick filters
    if (quickFilter === "Free") result = result.filter((e) => !e.isPaid)
    if (quickFilter === "Paid") result = result.filter((e) => e.isPaid)

    // Type filter
    if (selectedTypes.length > 0) {
      result = result.filter((e) => selectedTypes.includes(e.type))
    }

    // Club filter
    if (selectedClub !== "all") {
      result = result.filter((e) => e.clubId === selectedClub)
    }

    // Sort
    if (sortBy === "date") result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    if (sortBy === "popular") result.sort((a, b) => b.registrations - a.registrations)
    if (sortBy === "points") result.sort((a, b) => b.nPoints - a.nPoints)

    return result
  }, [baseEvents, search, quickFilter, selectedTypes, selectedClub, sortBy])

  const activeFilterCount = selectedTypes.length + (selectedClub !== "all" ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="relative border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-60 w-60 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute -right-40 bottom-0 h-60 w-60 rounded-full bg-accent/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="mb-2 font-mono text-3xl font-bold text-foreground">Discover Events</h1>
          <p className="mb-6 text-muted-foreground">
            Find workshops, hackathons, competitions, and more happening at NITK
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events, clubs, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 border-border bg-card/80 pl-12 pr-4 text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:border-primary"
            />
          </div>

          {/* Quick filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setQuickFilter(filter)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  quickFilter === filter
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card/50 p-5">
              <h3 className="mb-4 font-semibold text-foreground">Filters</h3>
              <FilterSidebar
                selectedTypes={selectedTypes}
                toggleType={toggleType}
                selectedClub={selectedClub}
                setSelectedClub={setSelectedClub}
                clubs={clubOptions}
              />
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full text-destructive hover:text-destructive/80"
                  onClick={() => { setSelectedTypes([]); setSelectedClub("all") }}
                >
                  <X className="mr-1 h-3 w-3" /> Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Loading events from Supabase..."
                  : `${filtered.length} event${filtered.length !== 1 ? "s" : ""} found`}
              </p>
              <div className="flex items-center gap-3">
                {/* Mobile filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-border text-foreground lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5">{activeFilterCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 bg-card border-border">
                    <SheetHeader>
                      <SheetTitle className="text-foreground">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSidebar
                        selectedTypes={selectedTypes}
                        toggleType={toggleType}
                        selectedClub={selectedClub}
                        setSelectedClub={setSelectedClub}
                        clubs={clubOptions}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-36 border-border bg-secondary/50 text-foreground text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="date" className="text-foreground">Date (Soonest)</SelectItem>
                    <SelectItem value="popular" className="text-foreground">Most Popular</SelectItem>
                    <SelectItem value="points" className="text-foreground">Most N-Points</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden rounded-lg border border-border sm:flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-9 w-9 rounded-r-none", view === "grid" && "bg-primary/20 text-primary")}
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-9 w-9 rounded-l-none", view === "list" && "bg-primary/20 text-primary")}
                    onClick={() => setView("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-destructive">
                Failed to load events from Supabase. ({error})
              </p>
            )}

            {/* Events */}
            {view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} showMatch />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} variant="wide" showMatch />
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p className="text-lg font-medium">No events found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

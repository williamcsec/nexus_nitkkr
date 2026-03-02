"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search, ArrowLeft, Users, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ClubCard } from "@/components/club-card"
import { cn } from "@/lib/utils"
import { useSupabaseClubs } from "@/hooks/use-supabase-clubs"

const categories = ["All", "Technical", "Cultural", "Sports", "Social"]

export default function ClubsPage() {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const { clubs, loading, error } = useSupabaseClubs()

  // featured clubs - pick top 3 verified or by totalMembers
  const featured = clubs
    .sort((a, b) => b.totalMembers - a.totalMembers)
    .slice(0, 3)

  const filtered = useMemo(() => {
    let result = [...clubs]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
      )
    }

    if (activeCategory !== "All") {
      result = result.filter((c) => c.category === activeCategory)
    }

    return result
  }, [search, activeCategory, clubs])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-60 w-60 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute -right-40 bottom-0 h-60 w-60 rounded-full bg-accent/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <h1 className="mb-2 font-mono text-3xl font-bold text-foreground">
            Clubs & Societies
          </h1>
          <p className="mb-6 text-muted-foreground">
            Explore 20+ clubs across technical, cultural, sports, and social domains at NIT Kurukshetra
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 border-border bg-card/80 pl-12 text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:border-primary"
            />
          </div>

          {/* Category tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Featured clubs section */}
        {activeCategory === "All" && !search && (
          <div className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-mono text-lg font-semibold text-foreground">Featured Clubs</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          </div>
        )}

        {/* All clubs */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-lg font-semibold text-foreground">
              {activeCategory === "All" ? "All Clubs" : `${activeCategory} Clubs`}
            </h2>
            <p className="text-sm text-muted-foreground">
              <Users className="mr-1 inline h-4 w-4" />
              {filtered.length} club{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          {loading && (
            <p className="py-20 text-center text-muted-foreground">Loading clubs...</p>
          )}
          {error && (
            <p className="py-20 text-center text-destructive">Failed to load clubs: {error}</p>
          )}
          {!loading && !error && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((club) => (
                <ClubCard key={club.id} club={club} />
              ))}
            </div>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">No clubs found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        )}
      </div>
    </div>
  )
}

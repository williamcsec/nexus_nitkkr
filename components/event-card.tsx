"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, Zap, Clock, TrendingUp, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { EventItem } from "@/lib/types"
import { cn } from "@/lib/utils"

type EventCardProps = {
  event: EventItem
  variant?: "default" | "compact" | "wide"
  showMatch?: boolean
}

export function EventCard({ event, variant = "default", showMatch = false }: EventCardProps) {
  const fillPercent = Math.round((event.registrations / event.maxCapacity) * 100)

  const typeColorMap: Record<string, string> = {
    Workshop: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Hackathon: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Competition: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Seminar: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Cultural: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Sports: "bg-green-500/20 text-green-400 border-green-500/30",
    Social: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  }

  if (variant === "compact") {
    return (
      <div className={cn("group flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card", event.isExpired && "opacity-70 grayscale")}>
        <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="text-lg font-bold leading-none">{new Date(event.date).getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
          <p className="text-xs text-muted-foreground">{event.clubName}</p>
        </div>
        <Badge variant="outline" className={cn("text-xs", typeColorMap[event.type])}>
          {event.type}
        </Badge>
      </div>
    )
  }

  if (variant === "wide") {
    return (
      <div className={cn("group flex gap-4 rounded-xl border border-border bg-card/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card", event.isExpired && "opacity-70 grayscale")}>
        <div className="flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString("en-US", { month: "short" })}</span>
          <span className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">{event.title}</p>
            {showMatch && event.matchScore && event.matchScore >= 90 && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                {event.matchScore}% Match
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{event.clubName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.registrations}/{event.maxCapacity}</span>
            {event.nPoints > 0 && (
              <span className="flex items-center gap-1 text-primary"><Zap className="h-3 w-3" />{event.nPoints} pts</span>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-end justify-between">
          <Badge variant="outline" className={cn("text-xs", typeColorMap[event.type])}>
            {event.type}
          </Badge>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={event.isExpired}>
            {event.isExpired ? "Closed" : "Register"}
          </Button>
        </div>
      </div>
    )
  }

  const Wrapper = event.slug ? Link : 'div' as any
  const wrapperProps = event.slug ? { href: `/events/${event.slug}` } : {}

  return (
    <Wrapper {...wrapperProps} className={cn("group flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5", event.isExpired && "opacity-70 grayscale")}>
      <div className={cn("relative flex h-32 items-end bg-gradient-to-br p-4", getGradient(event.type))}>
        {/* Status Badges */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          {fillPercent === 100 && (
            <Badge className="bg-black/60 text-white border-white/10 backdrop-blur-md shadow-lg pointer-events-none">Sold Out</Badge>
          )}
          {fillPercent >= 85 && fillPercent < 100 && (
            <Badge className="bg-red-500/80 text-white border-red-500/20 backdrop-blur-md shadow-lg pointer-events-none animate-pulse">Almost Full</Badge>
          )}
          {fillPercent >= 50 && fillPercent < 85 && (
            <Badge className="bg-orange-500/80 text-white border-orange-500/20 backdrop-blur-md shadow-lg pointer-events-none flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Trending
            </Badge>
          )}
        </div>

        <div className="flex w-full items-end justify-between z-10">
          <Badge variant="outline" className="border-foreground/20 bg-background/20 text-foreground backdrop-blur-sm">
            {event.type}
          </Badge>
          {showMatch && event.matchScore && (
            <Badge className={cn(
              "text-xs backdrop-blur-sm",
              event.matchScore >= 90 ? "bg-emerald-500/80 text-foreground" :
                event.matchScore >= 80 ? "bg-blue-500/80 text-foreground" :
                  "bg-muted/80 text-foreground"
            )}>
              {event.matchScore}% Match
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-primary">{event.clubName}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-foreground">{event.title}</h3>

        {showMatch && event.matchReason && (
          <p className="mt-1.5 text-xs text-emerald-500 font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {event.matchReason}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at {event.time}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.venue}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <Users className="mr-1 inline h-3 w-3" />
              {event.registrations}/{event.maxCapacity}
            </span>
            {event.nPoints > 0 && (
              <span className="flex items-center gap-1 font-medium text-primary">
                <Zap className="h-3 w-3" />{event.nPoints} pts
              </span>
            )}
          </div>
          <Progress value={fillPercent} className="h-1.5" />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1">
            {event.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={event.isExpired}>
            {event.isExpired ? "Closed" : event.isPaid ? `Rs. ${event.price}` : "Free"}
          </Button>
        </div>
      </div>
    </Wrapper>
  )
}

function getGradient(type: string) {
  const map: Record<string, string> = {
    Workshop: "from-blue-600/80 to-cyan-600/80",
    Hackathon: "from-emerald-600/80 to-teal-600/80",
    Competition: "from-orange-600/80 to-amber-600/80",
    Seminar: "from-cyan-600/80 to-blue-600/80",
    Cultural: "from-pink-600/80 to-rose-600/80",
    Sports: "from-green-600/80 to-emerald-600/80",
    Social: "from-yellow-600/80 to-orange-600/80",
  }
  return map[type] || "from-primary/80 to-accent/80"
}

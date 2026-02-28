"use client"

import { Users, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Club } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type ClubCardProps = {
  club: Club
}

const categoryColors: Record<string, string> = {
  Technical: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Cultural: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Sports: "bg-green-500/20 text-green-400 border-green-500/30",
  Social: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
}

export function ClubCard({ club }: ClubCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/50 transition-all duration-300 hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5">
      <div className={cn("relative h-24 bg-gradient-to-br", club.coverGradient)}>
        <div className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-background bg-card font-mono text-xs font-bold text-foreground shadow-lg">
          {club.logo}
        </div>
        {club.featured && (
          <Badge className="absolute right-3 top-3 bg-primary/80 text-primary-foreground text-xs backdrop-blur-sm">
            Featured
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 pt-8">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="line-clamp-1 font-semibold text-foreground">{club.name}</h3>
        </div>
        <Badge variant="outline" className={cn("mb-2 w-fit text-xs", categoryColors[club.category])}>
          {club.category}
        </Badge>
        <p className="line-clamp-2 text-sm text-muted-foreground">{club.description}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />{club.members}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />{club.events} events
            </span>
          </div>
          <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
            Join
          </Button>
        </div>
      </div>
    </div>
  )
}

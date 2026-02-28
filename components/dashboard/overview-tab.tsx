"use client"

import { Calendar, Award, Zap, TrendingUp, QrCode, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EventCard } from "@/components/event-card"
import { studentProfile, events, registrations } from "@/lib/mock-data"

const statCards = [
  { label: "Events Attended", value: studentProfile.eventsAttended, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "Upcoming Events", value: studentProfile.upcomingEvents, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Certificates", value: studentProfile.certificatesCount, icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "N-Points", value: studentProfile.nPoints, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
]

const recentActivity = [
  { text: "Registered for HackNITK 2026", time: "2 hours ago", type: "registration" },
  { text: "Earned 30 N-Points from ML Workshop", time: "1 day ago", type: "points" },
  { text: "Certificate: Code Sprint 2nd Place", time: "3 days ago", type: "certificate" },
  { text: "Joined Google DSC NITK", time: "1 week ago", type: "club" },
  { text: "Redeemed Canteen Voucher", time: "2 weeks ago", type: "redeem" },
]

export function OverviewTab() {
  const upcomingRegs = registrations.filter((r) => r.status === "upcoming")
  const recommended = events.filter((e) => e.matchScore && e.matchScore >= 80).slice(0, 4)
  const now = new Date()
  const hours = now.getHours()
  const greeting = hours < 12 ? "Good morning" : hours < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <Card className="border-border bg-gradient-to-r from-primary/10 via-card to-accent/10">
        <CardContent className="flex flex-col gap-2 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-mono text-2xl font-bold text-foreground">
              {greeting}, {studentProfile.name.split(" ")[0]}!
            </h2>
            <p className="text-sm text-muted-foreground">
              You have {studentProfile.upcomingEvents} upcoming events this week. Keep up the great work!
            </p>
          </div>
          <Badge className="w-fit bg-primary/20 text-primary border-primary/30 gap-1 text-sm font-mono">
            <TrendingUp className="h-3.5 w-3.5" /> Rank #{studentProfile.rank}
          </Badge>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border bg-card/50 hover:bg-card transition-colors">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommended Events */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-mono text-lg font-semibold text-foreground">Recommended For You</h3>
          <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary/80">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {recommended.map((event) => (
              <div key={event.id} className="w-[300px] flex-shrink-0">
                <EventCard event={event} showMatch />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Timeline */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-base text-foreground">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingRegs.slice(0, 5).map((reg) => (
              <div
                key={reg.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3 transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[10px] font-bold leading-none">
                    {new Date(reg.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {new Date(reg.date).getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{reg.eventTitle}</p>
                  <p className="text-xs text-muted-foreground">{reg.venue}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0 text-primary hover:bg-primary/10" aria-label="Show QR code">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-base text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-2">
                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

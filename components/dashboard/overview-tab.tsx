"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, Award, Zap, TrendingUp, QrCode, Clock, ArrowRight, X, Copy, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { EventCard } from "@/components/event-card"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { useSupabasePoints } from "@/hooks/use-supabase-points"
import { useSupabaseRegistrations } from "@/hooks/use-supabase-registrations"
import { useSupabaseCertificates } from "@/hooks/use-supabase-certificates"
import { useSupabaseEvents } from "@/hooks/use-supabase-events"
import { useSupabaseLeaderboard } from "@/hooks/use-supabase-leaderboard"

const recentActivity = [
  { text: "Registered for HackNITK 2026", time: "2 hours ago", type: "registration" },
  { text: "Earned 30 N-Points from ML Workshop", time: "1 day ago", type: "points" },
  { text: "Certificate: Code Sprint 2nd Place", time: "3 days ago", type: "certificate" },
  { text: "Joined Google DSC NITK", time: "1 week ago", type: "club" },
  { text: "Redeemed Canteen Voucher", time: "2 weeks ago", type: "redeem" },
]

export function OverviewTab() {
  const { student, loading: studentLoading } = useCurrentStudent()
  const studentId = student?.id ?? null
  const [qrModal, setQrModal] = useState<{ code: string; title: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const { balance, transactions: pointsTransactions } = useSupabasePoints(studentId)
  const { registrations, loading: regsLoading, error: regsError } = useSupabaseRegistrations(studentId)
  const { certificates, loading: certsLoading } = useSupabaseCertificates(studentId)
  const { events, loading: eventsLoading } = useSupabaseEvents()
  const { entries: boardEntries } = useSupabaseLeaderboard(100)

  const rank = useMemo(() => {
    if (!studentId || boardEntries.length === 0) return undefined
    const idx = boardEntries.findIndex((e) => e.id === studentId)
    return idx >= 0 ? idx + 1 : undefined
  }, [boardEntries, studentId])

  const upcomingRegs = useMemo(() => {
    return registrations.filter((r) => r.status === "upcoming")
  }, [registrations])

  const recommended = useMemo(() => {
    return events.filter((e) => e.matchScore && e.matchScore >= 80).slice(0, 4)
  }, [events])

  const statCards = useMemo(() => [
    { label: "Events Attended", value: registrations.filter((r) => r.status === "attended").length, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Upcoming Events", value: upcomingRegs.length, icon: Clock, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Certificates", value: certificates.length, icon: Award, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "N-Points", value: balance, icon: Zap, color: "text-primary", bg: "bg-primary/10" },
  ], [registrations, upcomingRegs, certificates, balance])

  const recentActivity = useMemo(() => {
    const activities = []
    if (pointsTransactions.length > 0) {
      activities.push({
        text: `Earned ${Math.abs(pointsTransactions[0].points)} N-Points from ${pointsTransactions[0].description}`,
        time: new Date(pointsTransactions[0].createdAt).toLocaleDateString(),
        type: "points"
      })
    }
    if (certificates.length > 0) {
      activities.push({
        text: `Certificate: ${certificates[0].title}`,
        time: new Date(certificates[0].date).toLocaleDateString(),
        type: "certificate"
      })
    }
    if (upcomingRegs.length > 0) {
      activities.push({
        text: `Registered for ${upcomingRegs[0].eventTitle}`,
        time: "Recently",
        type: "registration"
      })
    }
    return activities
  }, [pointsTransactions, certificates, upcomingRegs])

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
              {greeting}, {student?.name?.split(" ")[0] || "User"}!
            </h2>
            <p className="text-sm text-muted-foreground">
              You have {upcomingRegs.length} upcoming events. Keep up the great work!
            </p>
          </div>
          {rank && (
            <Badge className="w-fit bg-primary/20 text-primary border-primary/30 gap-1 text-sm font-mono">
              <TrendingUp className="h-3.5 w-3.5" /> Rank #{rank}
            </Badge>
          )}
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
                <Link
                  href={reg.eventSlug ? `/events/${reg.eventSlug}` : '#'}
                  className="flex items-center gap-3 min-w-0 flex-1"
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
                    <p className="truncate text-sm font-medium text-foreground hover:text-primary transition-colors">{reg.eventTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {reg.eventTime && `${reg.eventTime} · `}{reg.venue}
                    </p>
                  </div>
                </Link>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0 text-primary hover:bg-primary/10"
                  aria-label="Show QR code"
                  onClick={() => reg.qrCode && setQrModal({ code: reg.qrCode, title: reg.eventTitle })}
                  disabled={!reg.qrCode}
                >
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
      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setQrModal(null)}>
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setQrModal(null)}>
              <X className="h-4 w-4" />
            </Button>
            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-foreground">Your Event QR Code</h3>
              <p className="text-sm text-muted-foreground">{qrModal.title}</p>
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-primary mb-2" />
                  <p className="text-xs font-mono text-primary break-all px-2">{qrModal.code}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Show this code at the event venue for check-in</p>
              <Button variant="outline" className="w-full gap-2" onClick={() => { navigator.clipboard.writeText(qrModal.code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                {copied ? <><CheckCircle className="h-4 w-4 text-emerald-400" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Code</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

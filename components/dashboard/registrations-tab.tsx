"use client"

import { useState } from "react"
import { Calendar, MapPin, QrCode, X, Download, Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "@/components/dashboard-nav"
import { registrations } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  attended: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  missed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
}

const statusIcons: Record<string, React.ReactNode> = {
  attended: <Check className="h-3 w-3" />,
  missed: <AlertCircle className="h-3 w-3" />,
  cancelled: <X className="h-3 w-3" />,
}

export function RegistrationsTab() {
  const upcoming = registrations.filter((r) => r.status === "upcoming")
  const past = registrations.filter((r) => r.status === "attended" || r.status === "missed")
  const cancelled = registrations.filter((r) => r.status === "cancelled")

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
    { id: "cancelled", label: "Cancelled", count: cancelled.length },
  ]

  const [activeTab, setActiveTab] = useState("upcoming")

  const displayed = activeTab === "upcoming" ? upcoming
    : activeTab === "past" ? past
    : cancelled

  return (
    <div className="space-y-6">
      <DashboardNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="space-y-3">
        {displayed.map((reg) => (
          <Card key={reg.id} className="border-border bg-card/50 hover:bg-card transition-colors">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className="text-xs font-bold leading-none">
                  {new Date(reg.date).toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-xl font-bold leading-none">
                  {new Date(reg.date).getDate()}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-semibold text-foreground">{reg.eventTitle}</h4>
                  <Badge variant="outline" className={cn("text-xs", statusColors[reg.status])}>
                    {statusIcons[reg.status]}
                    {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{reg.clubName}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(reg.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{reg.venue}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {reg.status === "upcoming" && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                      <QrCode className="h-3.5 w-3.5" /> QR Code
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                      Cancel
                    </Button>
                  </>
                )}
                {reg.status === "attended" && reg.hasCertificate && (
                  <Button size="sm" variant="outline" className="gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                    <Download className="h-3.5 w-3.5" /> Certificate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {displayed.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium">No registrations</p>
            <p className="text-sm">Events you register for will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, QrCode, X, Download, Check, AlertCircle, Copy, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardNav } from "@/components/dashboard-nav"
import { cn } from "@/lib/utils"
import { useCurrentStudent } from "@/hooks/use-current-student"
import { useSupabaseRegistrations } from "@/hooks/use-supabase-registrations"
import { supabase } from "@/lib/supabaseClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  const { student } = useCurrentStudent()
  const studentId = student?.id ?? null
  const {
    registrations,
    loading: regsLoading,
    error: regsError,
  } = useSupabaseRegistrations(studentId)

  const [activeTab, setActiveTab] = useState("upcoming")
  const [qrModal, setQrModal] = useState<{ code: string; title: string } | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [sortOrder, setSortOrder] = useState<string>("dateAsc")
  const [cancelModal, setCancelModal] = useState<{ id: string; eventId: string; title: string } | null>(null)
  const [cancelConfirmed, setCancelConfirmed] = useState(false)

  const upcoming = registrations.filter((r) => r.status === "upcoming")
  const past = registrations.filter((r) => r.status === "attended" || r.status === "missed")
  const cancelled = registrations.filter((r) => r.status === "cancelled")

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
    { id: "cancelled", label: "Cancelled", count: cancelled.length },
  ]

  let displayed = activeTab === "upcoming" ? upcoming
    : activeTab === "past" ? past
      : cancelled

  // Apply Sorting
  displayed = [...displayed].sort((a, b) => {
    if (sortOrder === "dateAsc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    } else if (sortOrder === "dateDesc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    } else if (sortOrder === "nameAsc") {
      return a.eventTitle.localeCompare(b.eventTitle)
    }
    return 0
  })

  // Helper for generating countdown text
  function getCountdownText(dateString: string) {
    const eventDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)
    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return { text: "Starts today!", color: "bg-red-500/10 text-red-500 border-red-500/20" }
    if (diffDays === 1) return { text: "Starts tomorrow", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" }
    if (diffDays > 1 && diffDays <= 7) return { text: `Starts in ${diffDays} days`, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
    return null
  }

  async function handleCancel(regId: string, eventId: string) {
    setCancellingId(regId)
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ registration_status: "Cancelled" })
      .eq("id", regId)

    if (updateError) {
      console.error("Cancel failed:", updateError)
      setCancellingId(null)
      return
    }

    // Decrement event count
    const { data: evt } = await supabase
      .from("events")
      .select("current_registrations")
      .eq("id", eventId)
      .maybeSingle()
    if (evt && (evt.current_registrations ?? 0) > 0) {
      await supabase
        .from("events")
        .update({ current_registrations: (evt.current_registrations ?? 1) - 1 })
        .eq("id", eventId)
    }
    setCancellingId(null)
    // Force reload to refresh data
    window.location.reload()
  }

  function handleCopyQR(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Sort Dropdown */}
        <div className="w-full sm:w-[180px]">
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full bg-secondary/30 border-border">
              <span className="text-muted-foreground mr-2">Sort:</span>
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAsc">Date (Earliest)</SelectItem>
              <SelectItem value="dateDesc">Date (Latest)</SelectItem>
              <SelectItem value="nameAsc">Event Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {regsLoading && <p className="py-12 text-center text-muted-foreground">Loading registrations...</p>}
        {regsError && <p className="py-12 text-center text-destructive">{regsError}</p>}
        {!regsLoading && !regsError && (
          <>
            {displayed.map((reg) => {
              const countdown = reg.status === "upcoming" ? getCountdownText(reg.date) : null

              return (
                <Card key={reg.id} className="relative overflow-hidden border-border bg-card/50 hover:bg-card transition-colors">
                  {countdown && (
                    <div className={cn("absolute top-0 left-0 w-full px-3 py-1 text-[10px] font-semibold text-center uppercase tracking-wider", countdown.color)}>
                      {countdown.text}
                    </div>
                  )}
                  <CardContent className={cn("flex flex-col gap-4 p-4 sm:flex-row sm:items-center", countdown && "pt-8")}>
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
                        {reg.eventSlug ? (
                          <Link href={`/events/${reg.eventSlug}`} className="truncate font-semibold text-foreground hover:text-primary transition-colors">
                            {reg.eventTitle}
                          </Link>
                        ) : (
                          <h4 className="truncate font-semibold text-foreground">{reg.eventTitle}</h4>
                        )}
                        <Badge variant="outline" className={cn("text-xs", statusColors[reg.status])}>
                          {statusIcons[reg.status]}
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{reg.clubName}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(reg.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                        {reg.eventTime && (
                          <span className="flex items-center gap-1">🕐 {reg.eventTime}</span>
                        )}
                        {reg.venue && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{reg.venue}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {reg.status === "upcoming" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                            onClick={() => reg.qrCode && setQrModal({ code: reg.qrCode, title: reg.eventTitle })}
                            disabled={!reg.qrCode}
                          >
                            <QrCode className="h-3.5 w-3.5" /> QR Code
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            disabled={cancellingId === reg.id}
                            onClick={() => setCancelModal({ id: reg.id, eventId: reg.eventId, title: reg.eventTitle })}
                          >
                            {cancellingId === reg.id ? "Cancelling..." : "Cancel"}
                          </Button>
                        </>
                      )}
                      {reg.status === "cancelled" && reg.eventSlug && (
                        <Link href={`/events/${reg.eventSlug}`}>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm group">
                            Register Again <CheckCircle className="ml-1.5 h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </Link>
                      )}
                      {reg.status === "attended" && reg.hasCertificate && (
                        <Button size="sm" variant="outline" className="gap-1 border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary">
                          <Download className="h-3.5 w-3.5" /> Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {displayed.length === 0 && (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-lg font-medium">No registrations</p>
                <p className="text-sm">Events you register for will appear here</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setQrModal(null)}>
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              onClick={() => setQrModal(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-foreground">Your Event QR Code</h3>
              <p className="text-sm text-muted-foreground">{qrModal.title}</p>

              {/* QR Code display (text-based since no QR library) */}
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5">
                <div className="text-center">
                  <QrCode className="mx-auto h-16 w-16 text-primary mb-2" />
                  <p className="text-xs font-mono text-primary break-all px-2">{qrModal.code}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Show this code at the event venue for check-in
              </p>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => handleCopyQR(qrModal.code)}
              >
                {copied ? (
                  <><CheckCircle className="h-4 w-4 text-emerald-400" /> Copied!</>
                ) : (
                  <><Copy className="h-4 w-4" /> Copy Code</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => { setCancelModal(null); setCancelConfirmed(false) }}>
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              onClick={() => { setCancelModal(null); setCancelConfirmed(false) }}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Cancel Registration?</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to cancel your registration for <strong className="text-foreground">{cancelModal.title}</strong>?
                This event is popular and seats may not be available if you change your mind later.
              </p>

              <div className="flex items-start space-x-2 pt-2 pb-4">
                <input
                  type="checkbox"
                  id="confirm-cancel"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                  checked={cancelConfirmed}
                  onChange={(e) => setCancelConfirmed(e.target.checked)}
                />
                <label
                  htmlFor="confirm-cancel"
                  className="text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I understand I'll lose my spot
                </label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setCancelModal(null); setCancelConfirmed(false) }}
                >
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!cancelConfirmed || cancellingId === cancelModal.id}
                  onClick={async () => {
                    await handleCancel(cancelModal.id, cancelModal.eventId)
                    setCancelModal(null)
                    setCancelConfirmed(false)
                  }}
                >
                  {cancellingId === cancelModal.id ? "Cancelling..." : "Yes, Cancel"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Calendar, Clock, MapPin, Users, Award, ArrowLeft, Zap, Share2,
    CheckCircle, AlertCircle, Loader2
} from "lucide-react"
import confetti from "canvas-confetti"
import { registerForEvent, cancelRegistration } from "@/app/actions/events"
import { getUserRole } from "@/app/actions/auth-role"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface EventDetail {
    id: string
    title: string
    slug: string
    description: string | null
    event_type: string | null
    start_time: string
    end_time: string | null
    venue: string | null
    venue_type: string | null
    mode: string | null
    max_participants: number | null
    current_registrations: number
    registration_deadline: string | null
    registration_fee: number | null
    n_points_reward: number
    tags: string[]
    prerequisites: string | null
    poster_url: string | null
    status: string | null
    is_featured: boolean
    club: { id: string; name: string; slug: string; logo_url: string | null; category: string | null } | null
}

export default function EventDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string

    const [event, setEvent] = useState<EventDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState(false)
    const [regStatus, setRegStatus] = useState<'none' | 'registered' | 'cancelled'>('none')
    const [studentId, setStudentId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [cancelling, setCancelling] = useState(false)
    const [userRole, setUserRole] = useState<{ role: 'student' | 'club' | 'admin' | 'none', id?: string }>({ role: 'none' })
    const [showRegistrations, setShowRegistrations] = useState(false)
    const [registrations, setRegistrations] = useState<any[]>([])
    const [loadingRegs, setLoadingRegs] = useState(false)

    useEffect(() => {
        async function fetchEvent() {
            // Fetch event with club info
            const { data, error } = await supabase
                .from("events")
                .select("*, club:clubs(id, name, slug, logo_url, category)")
                .eq("slug", slug)
                .maybeSingle()

            if (error || !data) {
                setLoading(false)
                return
            }

            setEvent({
                ...data,
                tags: Array.isArray(data.tags) ? data.tags : [],
                club: data.club ?? null,
            })

            // Check role
            const session = await getUserRole()
            setUserRole(session as any)

            if (session.role === 'student' && session.id) {
                setStudentId(session.id)
                const { data: reg } = await supabase
                    .from("registrations")
                    .select("id, registration_status")
                    .eq("event_id", data.id)
                    .eq("student_id", session.id)
                    .maybeSingle()
                if (reg) {
                    const status = (reg.registration_status as string || '').toLowerCase()
                    if (status === 'cancelled') {
                        setRegStatus('cancelled')
                    } else {
                        setRegStatus('registered')
                    }
                }
            }
            setLoading(false)
        }
        if (slug) fetchEvent()
    }, [slug])

    async function handleRegister() {
        if (userRole.role === 'club' || userRole.role === 'admin') {
            setError("Use a student account to register.")
            setSuccessMsg(null)
            return
        }
        if (userRole.role !== 'student' || !event) {
            router.push("/sign-in")
            return
        }
        setRegistering(true)
        setError(null)
        setSuccessMsg(null)

        // If previously cancelled, delete old row first
        if (regStatus === 'cancelled') {
            await supabase
                .from("registrations")
                .delete()
                .eq("event_id", event.id)
                .eq("student_id", studentId)
        }

        const result = await registerForEvent(event.id);

        if (result.error) {
            setError(result.error);
            setRegistering(false);
            return;
        }

        // Update registration count visually
        const newCount = (event.current_registrations || 0) + 1

        setRegStatus('registered')
        setSuccessMsg("🎉 Registered successfully! Check 'My Registrations' in your dashboard for your QR code.")
        setRegistering(false)
        setEvent({ ...event, current_registrations: newCount })

        // Trigger confetti celebration
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#0ea5e9', '#ec4899', '#8b5cf6']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#0ea5e9', '#ec4899', '#8b5cf6']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }

    async function handleCancelFromDetail() {
        if (!studentId || !event) return
        setCancelling(true)
        setError(null)
        setSuccessMsg(null)

        const result = await cancelRegistration(event.id);

        if (result.error) {
            setError("Failed to cancel: " + result.error)
            setCancelling(false)
            return
        }

        // Decrement count visually
        const newCount = Math.max(0, (event.current_registrations || 1) - 1)

        setRegStatus('cancelled')
        setCancelling(false)
        setEvent({ ...event, current_registrations: newCount })
        setSuccessMsg("Registration cancelled. You can register again if spots are available.")
    }

    async function handleViewRegistrations() {
        if (userRole.role === 'student') {
            setError("This feature is not available for students, but clubs and admins can access this.");
            setSuccessMsg(null);
            return;
        }
        if (userRole.role === 'none') {
            router.push("/sign-in");
            return;
        }
        if (userRole.role === 'club' && userRole.id !== event?.club?.id) {
            setError("You can only view registrations for events created by your club.");
            setSuccessMsg(null);
            return;
        }

        await loadRegistrations();
    }

    async function loadRegistrations() {
        if (!event) return
        setLoadingRegs(true)
        setShowRegistrations(true)

        const { data, error } = await supabase
            .from("registrations")
            .select("registered_at, student:students(name, email, roll_number)")
            .eq("event_id", event.id)
            .neq("registration_status", "cancelled")
            .order("registered_at", { ascending: false })

        if (!error && data) {
            setRegistrations(data)
        }
        setLoadingRegs(false)
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="mt-4 text-muted-foreground">Loading event...</p>
                </div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
                <AlertCircle className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
                <Button onClick={() => router.push("/events")} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Browse Events
                </Button>
            </div>
        )
    }

    const startDate = new Date(event.start_time)
    const endDate = event.end_time ? new Date(event.end_time) : null
    const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null
    const isDeadlinePassed = deadline && deadline < new Date()
    const isFull = event.max_participants ? event.current_registrations >= event.max_participants : false
    const fillPercentage = event.max_participants
        ? Math.min(100, (event.current_registrations / event.max_participants) * 100)
        : 0
    const canRegister = (regStatus === 'none' || regStatus === 'cancelled') && !isDeadlinePassed && !isFull && event.status === "Approved"

    return (
        <div className="min-h-screen bg-background">
            {/* Top bar */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-mono text-sm text-muted-foreground">Event Details</span>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left column - Event info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Event type & featured badges */}
                        <div className="flex flex-wrap gap-2">
                            {event.event_type && (
                                <Badge variant="secondary" className="font-mono text-xs">
                                    {event.event_type}
                                </Badge>
                            )}
                            {event.mode && (
                                <Badge variant="outline" className="font-mono text-xs">
                                    {event.mode}
                                </Badge>
                            )}
                            {event.is_featured && (
                                <Badge className="bg-primary/20 text-primary font-mono text-xs">
                                    ⭐ Featured
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{event.title}</h1>

                        {/* Club info */}
                        {event.club && (
                            <Link href={`/clubs/${event.club.slug}`} className="flex items-center gap-3 group">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-sm">
                                    {event.club.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                        {event.club.name}
                                    </p>
                                    {event.club.category && (
                                        <p className="text-xs text-muted-foreground">{event.club.category}</p>
                                    )}
                                </div>
                            </Link>
                        )}

                        {/* Description */}
                        {event.description && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">About this Event</h2>
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        )}

                        {/* Prerequisites */}
                        {event.prerequisites && (
                            <div>
                                <h2 className="text-lg font-semibold text-foreground mb-2">Prerequisites</h2>
                                <p className="text-muted-foreground">{event.prerequisites}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {event.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="font-mono text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column - Registration card */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-20 border-border bg-card">
                            <CardContent className="p-6 space-y-5">
                                {/* N-Points reward */}
                                {event.n_points_reward > 0 && (
                                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
                                        <Zap className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-semibold text-primary">
                                            +{event.n_points_reward} N-Points
                                        </span>
                                    </div>
                                )}

                                {/* Date & Time */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {startDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                                            </p>
                                            {endDate && startDate.toDateString() !== endDate.toDateString() && (
                                                <p className="text-xs text-muted-foreground">
                                                    to {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <p className="text-sm text-foreground">
                                            {startDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                            {endDate && ` – ${endDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
                                        </p>
                                    </div>
                                    {event.venue && (
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <p className="text-sm text-foreground">{event.venue}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Registration stats */}
                                {event.max_participants && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Users className="h-4 w-4" /> Registrations
                                            </span>
                                            <span className="font-mono font-medium text-foreground">
                                                {event.current_registrations}/{event.max_participants}
                                            </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-secondary">
                                            <div
                                                className={`h-2 rounded-full transition-all ${fillPercentage > 85 ? "bg-yellow-500" : "bg-primary"
                                                    }`}
                                                style={{ width: `${fillPercentage}%` }}
                                            />
                                        </div>
                                        {fillPercentage > 85 && !isFull && (
                                            <p className="text-xs font-medium text-yellow-500">
                                                🔥 Only {event.max_participants - event.current_registrations} seats left!
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Fee */}
                                {(event.registration_fee ?? 0) > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Registration Fee</span>
                                        <span className="font-semibold text-foreground">₹{event.registration_fee}</span>
                                    </div>
                                )}

                                {/* Deadline */}
                                {deadline && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Deadline</span>
                                        <span className={`font-medium ${isDeadlinePassed ? "text-destructive" : "text-foreground"}`}>
                                            {deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </span>
                                    </div>
                                )}

                                {/* Success / Error messages */}
                                {successMsg && (
                                    <div className="flex items-start gap-2 rounded-lg bg-green-500/10 p-3 text-green-500 text-sm">
                                        <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                        <span>{successMsg}</span>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
                                        <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Registrations Access (Clubs & Admins only) */}
                                <Button
                                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-3"
                                    onClick={handleViewRegistrations}
                                >
                                    <Users className="mr-2 h-4 w-4" /> View Registrations
                                </Button>

                                {/* Register / Cancel buttons */}
                                {regStatus === 'registered' ? (
                                    <div className="space-y-2">
                                        <Button className="w-full bg-secondary/50 text-foreground hover:bg-secondary/50 cursor-default" variant="secondary" disabled>
                                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Registered ✓
                                        </Button>
                                        <Button
                                            className="w-full text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10"
                                            variant="outline"
                                            onClick={handleCancelFromDetail}
                                            disabled={cancelling}
                                        >
                                            {cancelling ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</>
                                            ) : (
                                                "Cancel Registration"
                                            )}
                                        </Button>
                                    </div>
                                ) : canRegister ? (
                                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleRegister} disabled={registering}>
                                        {registering ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</>
                                        ) : regStatus === 'cancelled' ? (
                                            <>Register Again</>
                                        ) : (
                                            <>Register Now</>
                                        )}
                                    </Button>
                                ) : (
                                    <Button className="w-full" variant="secondary" disabled>
                                        {isFull ? "Event Full" : isDeadlinePassed ? "Registration Closed" : "Unavailable"}
                                    </Button>
                                )}

                                {/* Share */}
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        setSuccessMsg("Link copied to clipboard!")
                                        setTimeout(() => setSuccessMsg(null), 2000)
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4" /> Share Event
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* View Registrations Modal (Only for Event Organizing Club) */}
            <Dialog open={showRegistrations} onOpenChange={setShowRegistrations}>
                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Event Registrations ({registrations.length})</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto pr-4 mt-2">
                        {loadingRegs ? (
                            <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : registrations.length === 0 ? (
                            <p className="text-center py-12 text-muted-foreground">Nobody has registered yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {registrations.map((reg, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/20 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-foreground">{reg.student?.name}</p>
                                            <p className="text-xs text-muted-foreground">{reg.student?.email} {reg.student?.roll_number ? `• ${reg.student?.roll_number}` : ''}</p>
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right whitespace-nowrap">
                                            {new Date(reg.registered_at).toLocaleDateString()}<br />
                                            {new Date(reg.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

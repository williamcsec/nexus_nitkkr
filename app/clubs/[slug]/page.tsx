"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, Calendar, MapPin, ExternalLink, Mail } from "lucide-react"

interface ClubDetail {
    id: string
    name: string
    slug: string
    category: string | null
    description: string | null
    logo_url: string | null
    cover_image_url: string | null
    contact_email: string | null
    social_links: Record<string, string> | null
    total_members: number
    engagement_score: number
    is_verified: boolean
}

interface ClubEvent {
    id: string
    title: string
    slug: string
    event_type: string | null
    start_time: string
    venue: string | null
    n_points_reward: number
    current_registrations: number
    max_participants: number | null
    status: string | null
}

export default function ClubDetailPage() {
    const params = useParams()
    const router = useRouter()
    const slug = params?.slug as string

    const [club, setClub] = useState<ClubDetail | null>(null)
    const [events, setEvents] = useState<ClubEvent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchClub() {
            const { data: clubData } = await supabase
                .from("clubs")
                .select("*")
                .eq("slug", slug)
                .maybeSingle()

            if (!clubData) {
                setLoading(false)
                return
            }
            setClub(clubData)

            // Fetch club events
            const { data: eventsData } = await supabase
                .from("events")
                .select("id, title, slug, event_type, start_time, venue, n_points_reward, current_registrations, max_participants, status")
                .eq("club_id", clubData.id)
                .order("start_time", { ascending: true })
                .limit(20)

            setEvents(eventsData ?? [])
            setLoading(false)
        }
        if (slug) fetchClub()
    }, [slug])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    if (!club) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
                <h1 className="text-2xl font-bold text-foreground">Club not found</h1>
                <Button onClick={() => router.push("/clubs")} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Browse Clubs
                </Button>
            </div>
        )
    }

    const categoryColor: Record<string, string> = {
        Technical: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        Cultural: "text-pink-400 bg-pink-400/10 border-pink-400/20",
        Sports: "text-green-400 bg-green-400/10 border-green-400/20",
        Literary: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        Social: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    }

    const upcomingEvents = events.filter(e => new Date(e.start_time) >= new Date() && e.status === "Approved")
    const pastEvents = events.filter(e => new Date(e.start_time) < new Date() || e.status === "Completed")

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <span className="font-mono text-sm text-muted-foreground">Club Details</span>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8">
                {/* Club header */}
                <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary font-bold text-2xl">
                        {club.name.charAt(0)}
                    </div>
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold text-foreground">{club.name}</h1>
                            {club.is_verified && (
                                <Badge className="bg-primary/20 text-primary border-primary/20 text-xs">✓ Verified</Badge>
                            )}
                        </div>
                        {club.category && (
                            <Badge variant="outline" className={`font-mono text-xs ${categoryColor[club.category] ?? ""}`}>
                                {club.category}
                            </Badge>
                        )}
                        {club.description && (
                            <p className="text-muted-foreground leading-relaxed max-w-2xl">{club.description}</p>
                        )}
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 text-center">
                            <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{club.total_members}</p>
                            <p className="text-xs text-muted-foreground">Members</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 text-center">
                            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{events.length}</p>
                            <p className="text-xs text-muted-foreground">Total Events</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 text-center">
                            <Calendar className="h-5 w-5 text-green-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
                            <p className="text-xs text-muted-foreground">Upcoming</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 text-center">
                            <Mail className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-mono text-foreground truncate">
                                {club.contact_email ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">Contact</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming events */}
                {upcomingEvents.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Events</h2>
                        <div className="grid gap-3">
                            {upcomingEvents.map((evt) => {
                                const d = new Date(evt.start_time)
                                return (
                                    <Link key={evt.id} href={`/events/${evt.slug}`}>
                                        <Card className="border-border bg-card hover:bg-secondary/30 transition-colors cursor-pointer">
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center min-w-[48px]">
                                                        <p className="text-xs text-muted-foreground uppercase">
                                                            {d.toLocaleDateString("en-IN", { month: "short" })}
                                                        </p>
                                                        <p className="text-xl font-bold text-primary">{d.getDate()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{evt.title}</p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                            {evt.event_type && <span>{evt.event_type}</span>}
                                                            {evt.venue && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3" /> {evt.venue}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {evt.n_points_reward > 0 && (
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-1">
                                                            +{evt.n_points_reward} pts
                                                        </Badge>
                                                    )}
                                                    {evt.max_participants && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {evt.current_registrations}/{evt.max_participants}
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Past events */}
                {pastEvents.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-4">Past Events</h2>
                        <div className="grid gap-3">
                            {pastEvents.map((evt) => {
                                const d = new Date(evt.start_time)
                                return (
                                    <Link key={evt.id} href={`/events/${evt.slug}`}>
                                        <Card className="border-border bg-card/50 opacity-60 hover:opacity-80 transition-opacity cursor-pointer">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="text-center min-w-[48px]">
                                                    <p className="text-xs text-muted-foreground uppercase">
                                                        {d.toLocaleDateString("en-IN", { month: "short" })}
                                                    </p>
                                                    <p className="text-xl font-bold text-muted-foreground">{d.getDate()}</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{evt.title}</p>
                                                    <p className="text-xs text-muted-foreground">{evt.event_type} • {evt.venue}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}

                {events.length === 0 && (
                    <div className="text-center py-16">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg text-muted-foreground">No events yet from this club</p>
                    </div>
                )}
            </main>
        </div>
    )
}

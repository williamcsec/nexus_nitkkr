import Link from "next/link"
import { getClubSession } from "@/lib/club-session"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, Calendar, MapPin, Edit, Eye, MoreVertical } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClubEventsPage() {
    const club = await getClubSession()
    if (!club) return null

    // Fetch events
    const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("club_id", club.id)
        .order("start_time", { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Manage Events</h2>
                    <p className="text-muted-foreground">Create and manage your club's events</p>
                </div>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/club-dashboard/events/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Event
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {events?.map((event) => (
                    <Card key={event.id} className="bg-card/50 border-border hover:border-primary/30 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary text-foreground uppercase tracking-wider">
                                            {event.type}
                                        </span>
                                        {new Date(event.start_time) > new Date() ? (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-500/20 text-emerald-500">Upcoming</span>
                                        ) : (
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">Past</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-1">{event.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {event.venue}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                                    <div className="bg-secondary/30 rounded-lg p-3 w-full sm:w-32 text-center border border-border">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium uppercase tracking-wider">Regs</span>
                                        </div>
                                        <div className="text-2xl font-bold text-primary">
                                            {event.current_registrations}<span className="text-sm font-normal text-muted-foreground">/{event.max_participants}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none hover:text-primary">
                                            <Link href={`/events/${event.slug}`} target="_blank">
                                                <Eye className="h-4 w-4 mr-1.5" /> View
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                                            <Link href={`/club-dashboard/events/edit/${event.id}`}>
                                                <Edit className="h-4 w-4 mr-1.5" /> Edit
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {(!events || events.length === 0) && (
                    <div className="text-center py-20 border border-dashed border-border rounded-xl">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">No events found</h3>
                        <p className="text-muted-foreground text-sm mb-4">You haven't created any events yet.</p>
                        <Button asChild>
                            <Link href="/club-dashboard/events/create">Create your first event</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

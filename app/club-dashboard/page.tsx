import { getClubSession } from "@/lib/club-session"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Users, TrendingUp, IndianRupee, ScanLine, Award } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ClubDashboardPage() {
    const club = await getClubSession()

    if (!club) return null

    // Fetch events for this club using correct column names
    const { data: events } = await supabase
        .from("events")
        .select("id, title, current_registrations, max_participants, start_time, registration_fee")
        .eq("club_id", club.id)
        .order("start_time", { ascending: false })

    const totalEvents = events?.length || 0
    const totalRegistrations = events?.reduce((acc, evt) => acc + (evt.current_registrations || 0), 0) || 0
    const upcomingEvents = events?.filter(e => new Date(e.start_time) > new Date()).length || 0
    const revenue = events?.filter(e => (e.registration_fee || 0) > 0).reduce((acc, evt) => acc + ((evt.current_registrations || 0) * (evt.registration_fee || 0)), 0) || 0

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
                <p className="text-muted-foreground mt-2">Welcome back, <strong className="text-foreground">{club.name}</strong> team! Here's your club's performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRegistrations}</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Events Hosted</CardTitle>
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEvents}</div>
                        <p className="text-xs text-muted-foreground">{upcomingEvents} upcoming</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Attendance Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89%</div>
                        <p className="text-xs text-muted-foreground">Based on checked-in users</p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{revenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From {events?.filter(e => (e.registration_fee || 0) > 0).length || 0} paid events</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-card/50 border-border">
                    <CardHeader>
                        <CardTitle>Recent Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {events?.slice(0, 4).map((event) => (
                                <div key={event.id} className="flex items-center">
                                    <div className="space-y-1 bg-primary/10 rounded-md p-2 w-14 text-center mr-4">
                                        <p className="text-xs text-primary font-bold uppercase">{new Date(event.start_time).toLocaleDateString('en-US', { month: 'short' })}</p>
                                        <p className="text-sm text-primary font-bold">{new Date(event.start_time).getDate()}</p>
                                    </div>
                                    <div className="ml-2 space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{event.current_registrations} registered out of {event.max_participants}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-primary text-sm">
                                        {Math.round((event.current_registrations / (event.max_participants || 1)) * 100)}% Full
                                    </div>
                                </div>
                            ))}
                            {(!events || events.length === 0) && (
                                <p className="text-sm text-muted-foreground py-4">No events found. Start organizing!</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-card/50 border-border">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <a href="/club-dashboard/events" className="flex items-center p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-card transition-colors">
                            <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                <CalendarDays className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Create Event</p>
                                <p className="text-xs text-muted-foreground">Launch your next big thing</p>
                            </div>
                        </a>
                        <a href="/club-dashboard/scanner" className="flex items-center p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-card transition-colors">
                            <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                <ScanLine className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Scan QR Codes</p>
                                <p className="text-xs text-muted-foreground">Mark attendance securely</p>
                            </div>
                        </a>
                        <a href="/club-dashboard/certificates" className="flex items-center p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-card transition-colors">
                            <div className="bg-primary/10 p-2 rounded-lg mr-4">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">Issue Certificates</p>
                                <p className="text-xs text-muted-foreground">Reward your participants</p>
                            </div>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

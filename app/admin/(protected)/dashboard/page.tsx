import { getAdminSession } from '../../login/actions'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CalendarDays, Users, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    const [
        { count: clubCount },
        { count: eventCount },
        { count: studentCount },
        { count: regCount },
        { data: recentEvents },
        { count: pendingVenueCount },
    ] = await Promise.all([
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('registrations').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('title, status, start_time, club_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('venue_bookings').select('*', { count: 'exact', head: true }).eq('approval_status', 'Pending'),
    ])

    const stats = [
        { label: 'Total Clubs', value: clubCount ?? 0, icon: Building2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', href: '/admin/clubs' },
        { label: 'Total Events', value: eventCount ?? 0, icon: CalendarDays, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/events' },
        { label: 'Registered Students', value: studentCount ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/admin/students' },
        { label: 'Total Registrations', value: regCount ?? 0, icon: CheckCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/admin/events' },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Welcome back, {session.name}. Here's an overview of NITK Nexus.</p>
            </div>

            {/* Pending alerts */}
            {(pendingVenueCount ?? 0) > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-300">
                            {pendingVenueCount} pending venue booking{(pendingVenueCount ?? 0) > 1 ? 's' : ''} awaiting approval
                        </p>
                    </div>
                    <Link href="/admin/venues" className="text-xs text-amber-400 hover:underline font-medium">
                        Review →
                    </Link>
                </div>
            )}

            {/* Stats grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
                    <Link key={label} href={href}>
                        <Card className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors cursor-pointer">
                            <CardContent className="p-5">
                                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg} mb-3`}>
                                    <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
                                <p className="text-sm text-zinc-400">{label}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-5 md:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/admin/create-club" className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white">
                            <span>➕ Create New Club</span>
                            <span className="text-zinc-500">→</span>
                        </Link>
                        <Link href="/admin/clubs" className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white">
                            <span>🔑 View Club Credentials</span>
                            <span className="text-zinc-500">→</span>
                        </Link>
                        <Link href="/admin/venues" className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white">
                            <span>📋 Venue Booking Requests</span>
                            <span className="text-zinc-500">→</span>
                        </Link>
                        <Link href="/admin/audit" className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white">
                            <span>🛡️ View Audit Log</span>
                            <span className="text-zinc-500">→</span>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Recent Events</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {(recentEvents ?? []).map((ev: any) => (
                            <div key={ev.title} className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 text-sm">
                                <span className="text-zinc-300 truncate max-w-[200px]">{ev.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ev.status === 'Completed' ? 'bg-zinc-700 text-zinc-400' :
                                        ev.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                            ev.status === 'Live' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {ev.status}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

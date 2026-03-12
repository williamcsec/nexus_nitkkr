'use client'

import { useState, useTransition } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, Calendar, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approveVenueBooking, rejectVenueBooking } from '../actions'

type Booking = {
    id: string
    venue_name: string
    booking_date: string
    start_time: string
    end_time: string
    approval_status: 'Pending' | 'Approved' | 'Rejected'
    rejection_reason: string | null
    special_requirements: string | null
    created_at: string
    event_id: string | null
    event_title: string | null
    club_name: string | null
}

type ViewMode = 'list' | 'calendar'

const VENUES = ['Senate Hall', 'OAT', 'Seminar Room', 'Sports Complex', 'Lab', 'Other']

export function AdminVenuesClient({ bookings }: { bookings: Booking[] }) {
    const [view, setView] = useState<ViewMode>('list')
    const [filter, setFilter] = useState('All')
    const [rejectingId, setRejectingId] = useState<string | null>(null)
    const [rejectReason, setRejectReason] = useState('')
    const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
    const [isPending, startTransition] = useTransition()

    // Calendar state
    const [calYear, setCalYear] = useState(new Date().getFullYear())
    const [calMonth, setCalMonth] = useState(new Date().getMonth())

    function showFeedback(id: string, msg: string, ok: boolean) {
        setFeedback({ id, msg, ok })
        setTimeout(() => setFeedback(null), 4000)
    }

    function handleApprove(id: string) {
        startTransition(async () => {
            const result = await approveVenueBooking(id)
            showFeedback(id, result.success ? 'Booking approved!' : (result.error ?? 'Error'), !!result.success)
        })
    }

    function handleReject(id: string) {
        if (!rejectReason.trim()) return
        startTransition(async () => {
            const result = await rejectVenueBooking(id, rejectReason)
            showFeedback(id, result.success ? 'Booking rejected.' : (result.error ?? 'Error'), !!result.success)
            setRejectingId(null)
            setRejectReason('')
        })
    }

    const filtered = bookings.filter(b => {
        if (filter === 'All') return true
        if (filter === 'Pending' || filter === 'Approved' || filter === 'Rejected') return b.approval_status === filter
        return b.venue_name.includes(filter)
    })

    // Calendar helpers
    const monthBookings = bookings.filter(b => {
        const d = new Date(b.booking_date)
        return d.getFullYear() === calYear && d.getMonth() === calMonth
    })

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
    const firstDay = new Date(calYear, calMonth, 1).getDay()

    const bookingsByDay: Record<number, Booking[]> = {}
    monthBookings.forEach(b => {
        const day = new Date(b.booking_date).getDate()
        if (!bookingsByDay[day]) bookingsByDay[day] = []
        bookingsByDay[day].push(b)
    })

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-white">Venue Bookings</h1>
                    <p className="text-zinc-400 mt-1">
                        {bookings.filter(b => b.approval_status === 'Pending').length} pending ·
                        {bookings.filter(b => b.approval_status === 'Approved').length} approved ·
                        {bookings.filter(b => b.approval_status === 'Rejected').length} rejected
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {['All', 'Pending', 'Approved', 'Rejected', ...VENUES].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {view === 'calendar' ? (
                /* CALENDAR VIEW */
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) } else setCalMonth(m => m - 1) }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm">← Prev</button>
                        <h2 className="text-white font-semibold text-lg">{fullMonthNames[calMonth]} {calYear}</h2>
                        <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) } else setCalMonth(m => m + 1) }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-sm">Next →</button>
                    </div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-medium text-zinc-500 py-1">{d}</div>
                        ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dayBookings = bookingsByDay[day] ?? []
                            const isToday = new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear
                            return (
                                <div key={day} className={`min-h-[80px] rounded-lg p-1.5 border ${isToday ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900/30'}`}>
                                    <p className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-400' : 'text-zinc-400'}`}>{day}</p>
                                    {dayBookings.slice(0, 2).map((b, idx) => (
                                        <div key={b.id} className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate ${b.approval_status === 'Approved' ? 'bg-emerald-500/30 text-emerald-300' :
                                                b.approval_status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-amber-500/20 text-amber-300'
                                            }`}>
                                            {b.venue_name.split(' ')[0]}
                                        </div>
                                    ))}
                                    {dayBookings.length > 2 && <p className="text-xs text-zinc-500">+{dayBookings.length - 2} more</p>}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ) : (
                /* LIST VIEW */
                <div className="space-y-3">
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-zinc-500">No bookings match the current filter.</div>
                    )}
                    {filtered.map(booking => (
                        <div key={booking.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <MapPin className="h-4 w-4 text-zinc-400" />
                                        <span className="font-semibold text-white">{booking.venue_name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${booking.approval_status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                booking.approval_status === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                            }`}>{booking.approval_status}</span>
                                    </div>
                                    {booking.event_title && (
                                        <p className="text-sm text-zinc-400 mb-1">Event: <span className="text-zinc-300">{booking.event_title}</span> · {booking.club_name}</p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(booking.booking_date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.start_time} – {booking.end_time}</span>
                                    </div>
                                    {booking.special_requirements && (
                                        <p className="text-xs text-zinc-500 mt-1 italic">Requirements: {booking.special_requirements}</p>
                                    )}
                                    {booking.rejection_reason && (
                                        <p className="text-xs text-red-400 mt-1">Rejected: {booking.rejection_reason}</p>
                                    )}
                                </div>

                                {/* Action buttons */}
                                {booking.approval_status === 'Pending' && (
                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                        <Button
                                            size="sm"
                                            onClick={() => handleApprove(booking.id)}
                                            disabled={isPending}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" /> Approve
                                        </Button>
                                        {rejectingId === booking.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="Rejection reason..."
                                                    value={rejectReason}
                                                    onChange={e => setRejectReason(e.target.value)}
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                                />
                                                <div className="flex gap-1">
                                                    <Button size="sm" onClick={() => handleReject(booking.id)} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                                                        Confirm
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setRejectingId(null)} className="text-zinc-400 flex-1">
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setRejectingId(booking.id)}
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                            >
                                                <XCircle className="h-3 w-3 mr-1" /> Reject
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {feedback?.id === booking.id && (
                                <p className={`text-xs mt-2 ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

'use client'

import { useState, useTransition } from 'react'
import { CalendarDays, CheckCircle, XCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateEventStatus, deleteEvent } from '../actions'

type AdminEvent = {
    id: string
    title: string
    status: string
    event_type: string
    start_time: string
    current_registrations: number
    max_participants: number | null
    registration_fee: number
    club_id: string
    club_name: string
}

const STATUS_OPTIONS = ['Draft', 'Pending Approval', 'Approved', 'Live', 'Completed', 'Cancelled']

const statusColors: Record<string, string> = {
    'Draft': 'bg-zinc-700 text-zinc-400',
    'Pending Approval': 'bg-amber-500/20 text-amber-400',
    'Approved': 'bg-emerald-500/20 text-emerald-400',
    'Live': 'bg-blue-500/20 text-blue-400',
    'Completed': 'bg-zinc-700 text-zinc-500',
    'Cancelled': 'bg-red-500/20 text-red-400',
}

export function AdminEventsClient({ events }: { events: AdminEvent[] }) {
    const [filter, setFilter] = useState<string>('All')
    const [search, setSearch] = useState('')
    const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null)
    const [isPending, startTransition] = useTransition()

    const filtered = events.filter(e => {
        const matchesFilter = filter === 'All' || e.status === filter
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.club_name.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    function showFeedback(id: string, msg: string, ok: boolean) {
        setFeedback({ id, msg, ok })
        setTimeout(() => setFeedback(null), 3000)
    }

    function handleStatusChange(eventId: string, status: string) {
        startTransition(async () => {
            const result = await updateEventStatus(eventId, status)
            if (result.success) showFeedback(eventId, `Status updated to "${status}"`, true)
            else showFeedback(eventId, result.error ?? 'Error', false)
        })
    }

    function handleDelete(eventId: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
        startTransition(async () => {
            const result = await deleteEvent(eventId)
            if (result.success) showFeedback(eventId, 'Event deleted', true)
            else showFeedback(eventId, result.error ?? 'Error', false)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-white">Events</h1>
                    <p className="text-zinc-400 mt-1">{events.length} total events across all clubs</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {['All', ...STATUS_OPTIONS].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {s}
                    </button>
                ))}
                <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="ml-auto bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
            </div>

            {/* Events table */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/80">
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Event</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Club</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Date</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Regs</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
                            <th className="text-left px-4 py-3 text-zinc-400 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((event, i) => (
                            <tr key={event.id} className={`border-b border-zinc-800/50 ${i % 2 === 0 ? 'bg-zinc-900/30' : 'bg-zinc-900/10'} hover:bg-zinc-800/40 transition-colors`}>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-white truncate max-w-[220px]">{event.title}</p>
                                    <p className="text-xs text-zinc-500">{event.event_type}</p>
                                </td>
                                <td className="px-4 py-3 text-zinc-300 truncate max-w-[150px]">{event.club_name}</td>
                                <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                                    {new Date(event.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                                    {event.current_registrations}{event.max_participants ? `/${event.max_participants}` : ''}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[event.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                                        {event.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <select
                                            onChange={e => handleStatusChange(event.id, e.target.value)}
                                            value={event.status}
                                            disabled={isPending}
                                            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDelete(event.id, event.title)}
                                            disabled={isPending}
                                            className="text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {feedback?.id === event.id && (
                                        <p className={`text-xs mt-1 ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.msg}</p>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-12 text-zinc-500">No events match the current filter.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

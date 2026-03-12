import { redirect } from 'next/navigation'
import { getAdminSession } from '../../login/actions'
import { supabase } from '@/lib/supabaseClient'
import { AdminVenuesClient } from './venues-client'

export const dynamic = 'force-dynamic'

export default async function AdminVenuesPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    const { data: bookings } = await supabase
        .from('venue_bookings')
        .select('id, venue_name, booking_date, start_time, end_time, approval_status, rejection_reason, special_requirements, created_at, event_id')
        .order('booking_date', { ascending: true })

    const { data: events } = await supabase.from('events').select('id, title, club_id')
    const { data: clubs } = await supabase.from('clubs').select('id, name')

    const clubMap = new Map((clubs ?? []).map((c: any) => [c.id, c.name]))
    const eventMap = new Map((events ?? []).map((e: any) => [e.id, { title: e.title, clubName: clubMap.get(e.club_id) ?? 'Unknown' }]))

    const enriched = (bookings ?? []).map((b: any) => ({
        ...b,
        event_title: b.event_id ? (eventMap.get(b.event_id)?.title ?? 'Unknown Event') : null,
        club_name: b.event_id ? (eventMap.get(b.event_id)?.clubName ?? 'Unknown Club') : null,
    }))

    return <AdminVenuesClient bookings={enriched} />
}

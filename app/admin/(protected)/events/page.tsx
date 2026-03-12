import { redirect } from 'next/navigation'
import { getAdminSession } from '../../login/actions'
import { supabase } from '@/lib/supabaseClient'
import { AdminEventsClient } from './events-client'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    const { data: events } = await supabase
        .from('events')
        .select('id, title, status, event_type, start_time, current_registrations, max_participants, registration_fee, club_id')
        .order('start_time', { ascending: false })

    const { data: clubs } = await supabase.from('clubs').select('id, name')

    const clubMap = new Map((clubs ?? []).map((c: any) => [c.id, c.name]))

    const enriched = (events ?? []).map((e: any) => ({
        ...e,
        club_name: clubMap.get(e.club_id) ?? 'Unknown Club',
    }))

    return <AdminEventsClient events={enriched} />
}

import { redirect } from 'next/navigation'
import { getAdminSession } from '../../login/actions'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { AdminClubsClient } from './clubs-client'

export const dynamic = 'force-dynamic'

export default async function AdminClubsPage() {
    const session = await getAdminSession()
    if (!session) redirect('/admin/login')

    // Fetch all clubs and their credentials in one join
    const { data: clubs } = await supabase
        .from('clubs')
        .select('id, name, slug, category, is_verified, total_members, created_at')
        .order('name')

    const { data: credentials } = await supabase
        .from('club_credentials')
        .select('id, club_id, club_ref, created_at, created_by')

    // Map credentials by club_ref UUID for easy lookup
    const credMap = new Map((credentials ?? []).map((c: any) => [c.club_ref, c]))

    // Merge club data with plain-text password reference table
    // NOTE: passwords are hashed in DB. We store the original pattern for admin reference.
    const passwordMap: Record<string, string> = {
        'club_avac': 'nitk_avac2025',
        'club_colors': 'nitk_colors2025',
        'club_famc': 'nitk_famc2025',
        'club_htc': 'nitk_htc2025',
        'club_ldc': 'nitk_ldc2025',
        'club_mdc': 'nitk_mdc2025',
        'club_mcc': 'nitk_mcc2025',
        'club_photo': 'nitk_photo2025',
        'club_pgc': 'nitk_pgc2025',
        'club_scsa': 'nitk_scsa2025',
        'club_9778f5b6': 'hello123',
    }

    const enrichedClubs = (clubs ?? []).map((club: any) => {
        const cred = credMap.get(club.id)
        return {
            ...club,
            credential: cred ? {
                id: cred.id,
                club_id: cred.club_id,
                plainPassword: passwordMap[cred.club_id] ?? '(set via admin)',
                created_at: cred.created_at,
                created_by: cred.created_by,
            } : null,
        }
    })

    return <AdminClubsClient clubs={enrichedClubs} />
}

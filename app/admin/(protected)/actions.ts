'use server'

import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function getAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try {
        const data = JSON.parse(session.value)
        if (data.expires < Date.now()) return null
        return data
    } catch {
        return null
    }
}

export async function generateCredentials(clubRefUuid: string, clubName: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    // Generate a slug-based club_id
    const rawSlug = clubName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 12)
    const clubId = `club_${rawSlug}`
    const plainPassword = `nitk_${rawSlug}2025`
    const hashedPassword = bcrypt.hashSync(plainPassword, 10)

    const { error } = await supabase.from('club_credentials').insert({
        club_id: clubId,
        password: hashedPassword,
        club_ref: clubRefUuid,
        created_by: session.email,
    })

    if (error) return { error: error.message }

    await supabase.from('audit_log').insert({
        club_id: clubId,
        action: 'CREDENTIALS_GENERATED',
        details: { created_by: session.email, club_ref: clubRefUuid },
    })

    revalidatePath('/admin/clubs')
    return { success: true, clubId, plainPassword }
}

export async function resetClubPassword(credentialId: string, clubId: string, newPassword: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    const hashedPassword = bcrypt.hashSync(newPassword, 10)

    const { error } = await supabase
        .from('club_credentials')
        .update({ password: hashedPassword, updated_at: new Date().toISOString() })
        .eq('id', credentialId)

    if (error) return { error: error.message }

    await supabase.from('audit_log').insert({
        club_id: clubId,
        action: 'PASSWORD_RESET',
        details: { reset_by: session.email },
    })

    revalidatePath('/admin/clubs')
    return { success: true }
}

export async function updateEventStatus(eventId: string, status: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('events')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', eventId)

    if (error) return { error: error.message }

    revalidatePath('/admin/events')
    return { success: true }
}

export async function deleteEvent(eventId: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) return { error: error.message }

    revalidatePath('/admin/events')
    return { success: true }
}

export async function approveVenueBooking(bookingId: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('venue_bookings')
        .update({ approval_status: 'Approved', approved_at: new Date().toISOString() })
        .eq('id', bookingId)

    if (error) return { error: error.message }

    revalidatePath('/admin/venues')
    return { success: true }
}

export async function rejectVenueBooking(bookingId: string, reason: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('venue_bookings')
        .update({
            approval_status: 'Rejected',
            rejection_reason: reason,
        })
        .eq('id', bookingId)

    if (error) return { error: error.message }

    revalidatePath('/admin/venues')
    return { success: true }
}

export async function deleteStudent(studentId: string) {
    const session = await getAdminSession()
    if (!session) return { error: 'Unauthorized' }
    if (session.role !== 'super_admin') return { error: 'Requires super_admin role' }

    const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', studentId)

    if (error) return { error: error.message }

    revalidatePath('/admin/students')
    return { success: true }
}

'use server';

import { supabase } from '@/lib/supabaseClient';
import { getClubSession } from '@/lib/club-session';
import { generateCertificateUrl } from '@/lib/cloudinary/generate-certificate';
import { revalidatePath } from 'next/cache';

export async function issueCertificates(formData: FormData) {
    try {
        const club = await getClubSession();
        if (!club) return { error: 'Unauthorized. Please log in as a club.' };

        const eventId = formData.get('eventId') as string;
        const templateId = formData.get('templateId') as string || 'default_cert_template';

        if (!eventId) {
            return { error: 'Event ID is required' };
        }

        // Find all students who actually attended
        const { data: attendees, error } = await supabase
            .from('registrations')
            .select('student_id, students(full_name), events(title)')
            .eq('event_id', eventId)
            .eq('attendance_status', 'Present');

        if (error) {
            return { error: 'Database error: ' + error.message };
        }

        if (!attendees || attendees.length === 0) {
            return { error: 'No validated attendees found for this event. Have you scanned their QR codes?' };
        }

        const inserts = attendees.map(a => {
            const studentName = (a.students as any)?.full_name || 'Participant';
            const eventName = (a.events as any)?.title || 'Nexus Event';

            // Call Cloudinary SDK wrapper
            const pdfUrl = generateCertificateUrl(studentName, eventName, templateId);

            return {
                student_id: a.student_id,
                event_id: eventId,
                issued_by: club.id,
                certificate_type: 'Participation',
                pdf_url: pdfUrl,
                is_verified: true,
                verification_code: `CERT-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
            };
        });

        // Delete existing certificates for these students for this event to avoid duplicates
        await supabase.from('certificates').delete().eq('event_id', eventId);

        const { error: insertError } = await supabase.from('certificates').insert(inserts);

        if (insertError) {
            return { error: 'Failed to issue certificates: ' + insertError.message };
        }

        // Trigger notifications using raw SQL via RPC or just insert into notifications table
        const notifications = attendees.map(a => ({
            student_id: a.student_id,
            related_id: eventId,
            title: 'New Certificate Issued! 🎓',
            body: `Your certificate for ${(a.events as any)?.title} is ready to download!`,
            type: 'certificate',
            is_read: false
        }));
        await supabase.from('notifications').insert(notifications);

        revalidatePath('/club-dashboard/certificates');
        return { success: true, count: inserts.length };

    } catch (err: any) {
        console.error('Issue certs error:', err);
        return { error: 'Internal server error while issuing certificates.' };
    }
}

'use server';

import { supabase } from '@/lib/supabaseClient';
import { getAdminSession } from '../login/actions';
import bcrypt from 'bcryptjs';

export async function createClubAction(formData: FormData) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'super_admin') {
            return { error: 'Unauthorized: Only super admins can create clubs.' };
        }

        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const clubId = formData.get('clubId') as string;
        const password = formData.get('password') as string;
        const category = formData.get('category') as string;

        if (!name || !slug || !clubId || !password) {
            return { error: 'Missing required fields' };
        }

        // Insert into clubs public table
        const { data: club, error: clubError } = await supabase
            .from('clubs')
            .insert({
                name,
                slug,
                category,
                created_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (clubError || !club) {
            if (clubError?.message.includes('duplicate')) {
                return { error: 'A club with this slug or name already exists.' };
            }
            return { error: 'Failed to create club profile: ' + clubError?.message };
        }

        // Hash the password securely
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert credentials
        const { error: credError } = await supabase
            .from('club_credentials')
            .insert({
                club_id: clubId,
                password: hashedPassword,
                club_ref: club.id,
                club_name: name,
                created_by: session.email
            });

        if (credError) {
            console.error('Credential error:', credError);
            return { error: 'Club profile created, but failed to securely store credentials: ' + credError.message };
        }

        // Audit log
        await supabase.from('audit_log').insert({
            club_id: clubId,
            action: 'CLUB_CREATED',
            details: { created_by: session.email, club_ref: club.id }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Create club error:', error);
        return { error: 'An unexpected error occurred.' };
    }
}

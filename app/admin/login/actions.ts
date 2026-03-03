'use server';

import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function adminLogin(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const { data, error } = await supabase.rpc('verify_admin_password', {
        p_email: email,
        p_password: password
    });

    if (error || !data || data.length === 0) {
        return { error: 'Invalid credentials' };
    }

    const admin = data[0];

    if (!admin.is_valid) {
        return { error: 'Invalid credentials' };
    }

    // Create session cookie
    const sessionData = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };

    const cookieStore = await cookies();
    cookieStore.set('admin_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
    });

    redirect('/admin/dashboard');
}

export async function getAdminSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (!session) return null;

    try {
        const data = JSON.parse(session.value);
        if (data.expires < Date.now()) {
            cookieStore.delete('admin_session');
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

export async function adminLogout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}

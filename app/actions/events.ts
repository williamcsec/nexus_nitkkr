'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';

export async function registerForEvent(eventId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'You must be logged in to register' };
    }

    const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

    if (!student) {
        return { error: 'Student profile not found' };
    }

    // Call atomic RPC function
    const { data, error } = await supabase.rpc('register_for_event', {
        p_student_id: student.id,
        p_event_id: eventId
    });

    if (error) {
        console.error('Registration error:', error);
        return { error: 'Registration failed. Please try again.' };
    }

    if (data?.error) {
        return { error: data.error };
    }

    revalidatePath('/dashboard');
    revalidatePath('/events');
    revalidatePath(`/events`);

    return {
        success: true,
        message: data.message,
        n_points: data.n_points,
        seats_left: data.seats_left
    };
}

export async function cancelRegistration(eventId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

    if (!student) {
        return { error: 'Student profile not found' };
    }

    // Start transaction
    const { data, error } = await supabase.rpc('cancel_registration', {
        p_student_id: student.id,
        p_event_id: eventId
    });

    if (error) {
        console.error('Cancellation error:', error);
        return { error: 'Cancellation failed' };
    }

    if (data?.error) {
        return { error: data.error };
    }

    revalidatePath('/dashboard');
    revalidatePath('/events');
    revalidatePath(`/events`);

    return { success: true };
}

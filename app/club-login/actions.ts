"use server"

import { cookies } from "next/headers"
import { supabase } from "@/lib/supabaseClient"
import { redirect } from "next/navigation"

export async function loginClub(prevState: any, formData: FormData) {
    const clubId = formData.get("clubId") as string
    const password = formData.get("password") as string

    if (!clubId || !password) {
        return { error: "Club ID and Password are required" }
    }

    // Call the secure RPC function
    const { data, error } = await supabase.rpc('verify_club_password', {
        p_club_id: clubId,
        p_password: password
    });

    if (error || !data || data.length === 0) {
        // Log failed attempt
        await supabase.from('audit_log').insert({
            club_id: clubId,
            action: 'LOGIN_FAILED',
            details: { reason: 'Invalid credentials or error' }
        });
        return { error: "Invalid Club ID or Password" }
    }

    const clubData = data[0];

    if (!clubData.is_valid) {
        await supabase.from('audit_log').insert({
            club_id: clubId,
            action: 'LOGIN_FAILED',
            details: { reason: 'Invalid password' }
        });
        return { error: "Invalid Club ID or Password" }
    }

    // Log successful login
    await supabase.from('audit_log').insert({
        club_id: clubData.club_id,
        action: 'LOGIN_SUCCESS',
        details: { club_ref: clubData.club_ref }
    });

    // Set auth cookie for club session (keeping the original cookie name)
    const cookieStore = await cookies()
    cookieStore.set("nexus_club_session", clubData.club_ref, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    redirect("/club-dashboard")
}

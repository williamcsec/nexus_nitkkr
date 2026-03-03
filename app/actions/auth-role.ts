'use server';

import { cookies } from "next/headers";
import { supabase } from "@/lib/supabaseClient";

export async function getUserRole() {
    // 1. Check if Admin is logged in
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (adminSession) {
        try {
            const data = JSON.parse(adminSession);
            if (data && data.role === 'admin') {
                return { role: 'admin', id: data.id };
            }
        } catch (e) { }
    }

    // 2. Check if Club is logged in
    const clubRef = cookieStore.get("nexus_club_session")?.value;

    if (clubRef) {
        return { role: 'club', id: clubRef };
    }

    // 3. Check if Student is logged in via Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: student } = await supabase
            .from("students")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();

        if (student) {
            return { role: 'student', id: student.id };
        }
    }

    // 4. Fallback
    return { role: 'none' };
}

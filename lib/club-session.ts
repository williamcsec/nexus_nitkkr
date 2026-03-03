import { cookies } from "next/headers"
import { supabase } from "@/lib/supabaseClient"

export async function getClubSession() {
    const cookieStore = await cookies()
    const clubRef = cookieStore.get("nexus_club_session")?.value

    if (!clubRef) return null

    const { data: club, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubRef)
        .single()

    if (error || !club) return null

    return club
}

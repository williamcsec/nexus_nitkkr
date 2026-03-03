"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signOutClub() {
    const store = await cookies()
    store.delete("nexus_club_session")
    redirect("/club-login")
}

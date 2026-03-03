"use server"

import { revalidatePath } from "next/cache"
import { getClubSession } from "@/lib/club-session"
import { supabase } from "@/lib/supabaseClient"

export async function createEvent(prevState: any, formData: FormData) {
    const club = await getClubSession()

    if (!club) {
        return { error: "Authentication required" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string
    const date = formData.get("date") as string
    const time = formData.get("time") as string
    const venue = formData.get("venue") as string
    const maxCapacity = parseInt(formData.get("maxCapacity") as string, 10)
    const nPoints = parseInt(formData.get("nPoints") as string, 10) || 0
    const isPaid = formData.get("isPaid") === "on"
    const price = parseInt(formData.get("price") as string, 10) || 0

    if (!title || !description || !type || !date || !time || !venue || !maxCapacity) {
        return { error: "Please fill in all required fields" }
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")

    // Combine date and time to ISO string if needed, or pass date string and store time separately
    // The DB schema has 'start_time' which is ideally a timestamp or proper string
    let startTimeStr = `${date}T10:00:00Z`
    try {
        if (time) {
            // Rough parser for HH:MM AM/PM
            const timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)?/i)
            if (timeParts) {
                let [_, hoursStr, minsStr, ampm] = timeParts
                let hours = parseInt(hoursStr)
                if (ampm?.toUpperCase() === 'PM' && hours < 12) hours += 12
                if (ampm?.toUpperCase() === 'AM' && hours === 12) hours = 0
                startTimeStr = `${date}T${hours.toString().padStart(2, '0')}:${minsStr}:00+05:30`
            }
        }
    } catch (err) {
        // use default fallback
    }

    const { error } = await supabase
        .from("events")
        .insert({
            club_id: club.id,
            title,
            slug,
            description,
            event_type: type,
            start_time: startTimeStr,
            venue,
            max_participants: maxCapacity,
            current_registrations: 0,
            n_points_reward: nPoints,
            registration_fee: isPaid ? price : 0,
            tags: [],
            status: "Approved" // Let's set it as Approved by default so it shows up
        })

    if (error) {
        console.error("Create event error:", error)
        // Handle uniqueness constraint for slug if needed. For now simple error.
        return { error: error.message || "Failed to create event" }
    }

    revalidatePath("/club-dashboard/events")
    revalidatePath("/events")
    return { success: true }
}

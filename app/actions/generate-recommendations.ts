"use server"

import { createClient } from "@supabase/supabase-js"
import { generateGroqRecommendations } from "@/lib/groq/recommendations"

// Use service role for backend admin tasks like generating recommendations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // fallback for mock
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function generateRecommendations(userId: string) {
    if (!userId) return { success: false, error: "No user ID provided" }

    try {
        // 1. Check cache freshness (5 minutes)
        const { data: existingRecs } = await supabase
            .from("ai_recommendations")
            .select("created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)

        if (existingRecs && existingRecs.length > 0) {
            const lastUpdated = new Date(existingRecs[0].created_at).getTime()
            const fiveMinutes = 5 * 60 * 1000
            if (Date.now() - lastUpdated < fiveMinutes) {
                // Cache is still valid
                return { success: true, cached: true }
            }
        }

        // 2. Fetch student info
        const { data: student } = await supabase
            .from("students")
            .select("branch, interests")
            .eq("id", userId)
            .single()

        // 3. Fetch user's registered events to build history
        const { data: registrations } = await supabase
            .from("registrations")
            .select("event_id")
            .eq("student_id", userId)
            .in("registration_status", ["Registered", "Confirmed"])

        const registeredEventIds = registrations?.map((r) => r.event_id) || []

        // 4. Fetch all upcoming events the user HAS NOT registered for yet
        const { data: upcomingEvents } = await supabase
            .from("events")
            .select("id, title, description, event_type, tags, n_points_reward")
            .gt("start_time", new Date().toISOString())

        if (!upcomingEvents || upcomingEvents.length === 0) return { success: true, count: 0 }

        const availableEvents = upcomingEvents.filter(e => !registeredEventIds.includes(e.id))

        if (availableEvents.length === 0) return { success: true, count: 0 }

        // 5. Generate with Groq AI API
        const aiScores = await generateGroqRecommendations(
            { branch: student?.branch, interests: student?.interests },
            availableEvents
        )

        // 6. Cache into DB
        if (aiScores.length > 0) {
            // Delete old recommendations to refresh created_at correctly
            await supabase.from("ai_recommendations").delete().eq("user_id", userId)

            const inserts = aiScores.map(rec => ({
                user_id: userId,
                event_id: rec.eventId,
                score: rec.matchScore,
                reason: rec.reasoning,
                created_at: new Date().toISOString()
            }))

            const { error: insertError } = await supabase
                .from("ai_recommendations")
                .insert(inserts)

            if (insertError) {
                console.error("Failed to insert AI recommendations", insertError)
                return { success: false, error: insertError.message }
            }
        }

        return { success: true, count: aiScores.length }

    } catch (error: any) {
        console.error("Error generating recommendations:", error)
        return { success: false, error: error.message }
    }
}

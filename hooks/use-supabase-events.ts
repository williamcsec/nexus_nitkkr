'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import type { EventItem } from '@/lib/types'
import { generateRecommendations } from '@/app/actions/generate-recommendations'

type ClubOption = {
  id: string
  name: string
}

type UseSupabaseEventsResult = {
  events: EventItem[]
  clubs: ClubOption[]
  loading: boolean
  error: string | null
}

export function useSupabaseEvents(): UseSupabaseEventsResult {
  const [events, setEvents] = useState<EventItem[]>([])
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const [
          { data: eventsData, error: eventsError },
          { data: clubsData, error: clubsError },
        ] = await Promise.all([
          supabase
            .from('events')
            .select(
              [
                'id',
                'slug',
                'title',
                'club_id',
                'event_type',
                'start_time',
                'venue',
                'description',
                'current_registrations',
                'max_participants',
                'n_points_reward',
                'registration_fee',
                'registration_deadline',
                'end_time',
                'tags',
                'status',
              ].join(', '),
            ),
          supabase.from('clubs').select('id, name'),
        ])

        if (eventsError) throw eventsError
        if (clubsError) throw clubsError

        // Get the current user to fetch personalized AI recommendations
        const { data: { session } } = await supabase.auth.getSession()
        let personalizedScores = new Map<string, { score: number, reason: string }>()

        if (session?.user?.id) {
          // Trigger the recommendation engine (runs quickly in background/server)
          await generateRecommendations(session.user.id)

          // Fetch the calculated scores
          const { data: recs } = await supabase
            .from('ai_recommendations')
            .select('event_id, score, reason')
            .eq('user_id', session.user.id)

          if (recs && recs.length > 0) {
            recs.forEach(r => personalizedScores.set(r.event_id, { score: r.score, reason: r.reason }))
          }
        }

        const now = new Date()

        const clubLookup = new Map(
          (clubsData ?? []).map((c: any) => [c.id as string, c.name as string]),
        )

        const normalizedEvents: EventItem[] = (eventsData ?? []).map((e: any) => {
          const start = e.start_time ? new Date(e.start_time as string) : null

          const dateStr = start ? start.toISOString().slice(0, 10) : ''
          const timeStr = start
            ? start.toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })
            : ''

          let status: EventItem['status'] = 'upcoming'
          if (e.status === 'Completed' || (start && start < now)) {
            status = 'completed'
          }

          let isExpired = false
          if (e.registration_deadline && new Date(e.registration_deadline as string) < now) {
            isExpired = true
          } else if (e.end_time && new Date(e.end_time as string) < now) {
            isExpired = true
          } else if (start && start < now) {
            isExpired = true
          }
          if (status === 'completed' || e.status === 'Cancelled') {
            isExpired = true
          }

          const tagsArray: string[] = Array.isArray(e.tags) ? e.tags : []

          return {
            id: e.id as string,
            slug: (e.slug as string) ?? undefined,
            title: e.title as string,
            clubId: (e.club_id as string) ?? '',
            clubName: clubLookup.get(e.club_id as string) ?? 'Club',
            type: (e.event_type as string) ?? 'Workshop',
            date: dateStr,
            time: timeStr,
            venue: (e.venue as string) ?? '',
            description: (e.description as string) ?? '',
            registrations: (e.current_registrations as number) ?? 0,
            maxCapacity: (e.max_participants as number) ?? 0,
            nPoints: (e.n_points_reward as number) ?? 0,
            isPaid: ((e.registration_fee as number | null) ?? 0) > 0,
            price: (e.registration_fee as number | null) ?? undefined,
            tags: tagsArray,
            status,
            matchScore: personalizedScores.get(e.id as string)?.score || undefined,
            matchReason: personalizedScores.get(e.id as string)?.reason || undefined,
            isExpired,
          }
        })

        const clubOptions: ClubOption[] = (clubsData ?? []).map((c: any) => ({
          id: c.id as string,
          name: c.name as string,
        }))

        setEvents(normalizedEvents)
        setClubs(clubOptions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  return { events, clubs, loading, error }
}


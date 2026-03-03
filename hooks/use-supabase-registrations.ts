'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import type { Registration } from '@/lib/types'

type UseSupabaseRegistrationsResult = {
  registrations: Registration[]
  loading: boolean
  error: string | null
}

export function useSupabaseRegistrations(studentId: string | null): UseSupabaseRegistrationsResult {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setRegistrations([])
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const { data, error: dbError } = await supabase
          .from('registrations')
          .select('id, event_id, registration_status, attendance_status, registered_at, qr_code')
          .eq('student_id', studentId)

        if (dbError) {
          throw dbError
        }

        const rows = (data ?? []) as any[]
        const eventIds = rows.map((r) => r.event_id).filter(Boolean)

        // fetch event titles and club ids
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, slug, club_id, venue, start_time')
          .in('id', eventIds)

        const eventMap = new Map<string, { title: string; slug: string; club_id: string; venue: string; start_time: string | null }>()
          ; (eventsData ?? []).forEach((e: any) => {
            eventMap.set(e.id as string, { title: e.title as string, slug: (e.slug as string) ?? '', club_id: e.club_id as string, venue: (e.venue as string) ?? '', start_time: (e.start_time as string | null) ?? null })
          })

        // gather club ids
        const clubIds = Array.from(new Set((eventsData ?? []).map((e: any) => e.club_id).filter(Boolean)))
        const { data: clubsData } = await supabase
          .from('clubs')
          .select('id, name')
          .in('id', clubIds)

        const clubMap = new Map<string, string>()
          ; (clubsData ?? []).forEach((c: any) => {
            clubMap.set(c.id as string, c.name as string)
          })

        const normalized: Registration[] = rows.map((row) => {
          const ev = eventMap.get(row.event_id as string)
          const eventStartTime = ev?.start_time ? new Date(ev.start_time) : null
          const regDate = row.registered_at ? new Date(row.registered_at as string) : null

          let status: Registration['status'] = 'upcoming'
          const regStatus = (row.registration_status as string | null) ?? 'Registered'
          const attendance = (row.attendance_status as string | null) ?? 'Pending'

          if (regStatus.toLowerCase() === 'cancelled') {
            status = 'cancelled'
          } else if (attendance.toLowerCase() === 'attended') {
            status = 'attended'
          } else if (eventStartTime && eventStartTime < new Date()) {
            // Event has already started/passed but student didn't attend
            status = 'missed'
          }
          // Otherwise stays 'upcoming'

          const clubName = ev ? clubMap.get(ev.club_id) ?? '' : ''
          // Use event start time for display, fallback to registration date
          const displayDate = eventStartTime ?? regDate ?? new Date()

          const timeStr = eventStartTime
            ? eventStartTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
            : undefined

          return {
            id: row.id as string,
            eventId: row.event_id as string,
            eventTitle: ev ? ev.title : 'Event',
            eventSlug: ev ? ev.slug : undefined,
            clubName,
            date: displayDate.toISOString().slice(0, 10),
            eventTime: timeStr,
            venue: ev ? ev.venue : '',
            status,
            hasCertificate: false,
            qrCode: (row.qr_code as string | null) ?? undefined,
          }
        })

        if (!cancelled) {
          setRegistrations(normalized)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load registrations')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [studentId])

  return { registrations, loading, error }
}


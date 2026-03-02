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
          .select('id, event_id, registration_status, attendance_status, registered_at')
          .eq('student_id', studentId)

        if (dbError) {
          throw dbError
        }

        const rows = (data ?? []) as any[]
        const eventIds = rows.map((r) => r.event_id).filter(Boolean)

        // fetch event titles and club ids
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, club_id')
          .in('id', eventIds)

        const eventMap = new Map<string, { title: string; club_id: string }>()
        ;(eventsData ?? []).forEach((e: any) => {
          eventMap.set(e.id as string, { title: e.title as string, club_id: e.club_id as string })
        })

        // gather club ids
        const clubIds = Array.from(new Set((eventsData ?? []).map((e: any) => e.club_id).filter(Boolean)))
        const { data: clubsData } = await supabase
          .from('clubs')
          .select('id, name')
          .in('id', clubIds)

        const clubMap = new Map<string, string>()
        ;(clubsData ?? []).forEach((c: any) => {
          clubMap.set(c.id as string, c.name as string)
        })

        const normalized: Registration[] = rows.map((row) => {
          const regDate = row.registered_at ? new Date(row.registered_at as string) : null

          let status: Registration['status'] = 'upcoming'
          const regStatus = (row.registration_status as string | null) ?? 'Registered'
          const attendance = (row.attendance_status as string | null) ?? 'Pending'

          if (regStatus.toLowerCase() === 'cancelled') {
            status = 'cancelled'
          } else if (attendance.toLowerCase() === 'attended') {
            status = 'attended'
          } else if (regDate && regDate < new Date()) {
            status = 'missed'
          }

          const ev = eventMap.get(row.event_id as string)
          const clubName = ev ? clubMap.get(ev.club_id) ?? '' : ''

          return {
            id: row.id as string,
            eventId: row.event_id as string,
            eventTitle: ev ? ev.title : 'Event',
            clubName,
            date: regDate ? regDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            venue: '',
            status,
            hasCertificate: false,
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


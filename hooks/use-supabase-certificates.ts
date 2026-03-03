'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import type { Certificate } from '@/lib/types'

type UseSupabaseCertificatesResult = {
  certificates: Certificate[]
  loading: boolean
  error: string | null
}

export function useSupabaseCertificates(studentId: string | null): UseSupabaseCertificatesResult {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) {
      setCertificates([])
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
          .from('certificates')
          .select('id, certificate_type, issued_at, is_verified, event_id, verification_code, pdf_url')
          .eq('student_id', studentId)

        if (dbError) {
          throw dbError
        }

        const rows = (data ?? []) as any[]

        // gather event ids to fetch title/club
        const eventIds = rows.map((r) => r.event_id).filter(Boolean)
        let eventMap = new Map<string, { title: string; club_id: string }>()
        let clubMap = new Map<string, string>()
        if (eventIds.length > 0) {
          const { data: eventsData } = await supabase
            .from('events')
            .select('id, title, club_id')
            .in('id', eventIds)

            ; (eventsData ?? []).forEach((e: any) => {
              eventMap.set(e.id as string, { title: e.title as string, club_id: e.club_id as string })
            })

          const clubIds = Array.from(new Set((eventsData ?? []).map((e: any) => e.club_id).filter(Boolean)))
          if (clubIds.length > 0) {
            const { data: clubsData } = await supabase
              .from('clubs')
              .select('id, name')
              .in('id', clubIds)
              ; (clubsData ?? []).forEach((c: any) => {
                clubMap.set(c.id as string, c.name as string)
              })
          }
        }

        const normalized: Certificate[] = rows.map((row) => {
          const issued = row.issued_at ? new Date(row.issued_at as string) : new Date()
          const type = (row.certificate_type as string | null) ?? 'Participation'
          const ev = eventMap.get(row.event_id as string)
          const clubName = ev ? clubMap.get(ev.club_id) ?? '' : ''

          return {
            id: row.id as string,
            title: ev ? ev.title : `${type} Certificate`,
            event: ev ? ev.title : '',
            clubName,
            type,
            date: issued.toISOString().slice(0, 10),
            verified: Boolean(row.is_verified),
            hash: (row.verification_code as string) || 'PENDING',
            url: (row.pdf_url as string) || '#',
          }
        })

        if (!cancelled) {
          setCertificates(normalized)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load certificates')
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

  return { certificates, loading, error }
}

